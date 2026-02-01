import { assign, createActor, setup, transition } from "xstate";

interface Log {
  eventName: string;
  extra: string;
  timestamp: number;
}

function updateProgress(context, domain, event) {
  return {
    ...context.Progress,
    lastUpdated: Date.now(),
    [domain]: [
      ...context.Progress[domain],
      {
        ...event,
        timestamp: Date.now(),
      },
    ],
  };
}

const stateMachine = setup({
  types: {
    context: {} as {
      formData: Record<string, any>;
      shippingInfo: Record<string, any>;
      paymentInfo: Record<string, any>;
      InfoConfirmed: boolean;
      paymentCompleted: boolean;
      reviewApproved: boolean;
      deliveryConfirmed: boolean;
      requestRejected: boolean;
      Progress: {
        lastUpdated: number;
        applying: Log[];
        reviewing: Log[];
        shipping: Log[];
        completion: Log[];
      };
    },
    events: {} as
      | { type: "NEXT"; kind?: "normal" | "confirm" | "pay" | "submit" }
      | { type: "PREVIOUS" }
      | { type: "PAYMENT_SUCCESS" }
      | { type: "PAYMENT_FAILED" }
      | { type: "REVIEW_STARTED" }
      | { type: "APPROVE" }
      | { type: "REJECT" }
      | { type: "READY_TO_SHIP" }
      | { type: "SUBMIT_SHIPPING"; shippingInfo: Record<string, any> }
      | { type: "DELIVERY_CONFIRMED" },
  },

  guards: {
    isPaymentComplete: ({ context }) => context.paymentCompleted,
    isApproved: ({ context }) => context.reviewApproved,
    isDelivered: ({ context }) => context.deliveryConfirmed,
  },

  actions: {
    Progress_informationFilled: assign({
      InfoConfirmed: true,
      Progress: ({ context }) => {
        return updateProgress(context, "applying", {
          eventName: "Information Filled",
          extra: "",
        });
      },
    }),
    Progress_PaymentDone: assign({
      Progress: ({ context }) => {
        return updateProgress(context, "reviewing", {
          eventName: "Payment Done",
          extra: "",
        });
      },
    }),
    Progress_underReview: assign({
      Progress: ({ context }) => {
        return updateProgress(context, "reviewing", {
          eventName: "Under Review",
          extra: "",
        });
      },
    }),

    Progress_reviewApproved: assign({
      Progress: ({ context }) => {
        return updateProgress(context, "reviewing", {
          eventName: "Approved by reviewer",
          extra: "",
        });
      },
    }),

    Progress_reviewRejected: assign({
      Progress: ({ context }) => {
        return updateProgress(context, "completion", {
          eventName: "Rejected by reviewer",
          extra: "Missing Payment due date",
        });
      },
    }),

    Progress_shippmentAddress: assign({
      Progress: ({ context }) => {
        return updateProgress(context, "shipping", {
          eventName: "Shipping address provided",
          extra: "shipping address, cairo, egypt",
        });
      },
    }),

    Progress_shippmentDelivered: assign({
      Progress: ({ context }) => {
        return updateProgress(context, "shipping", {
          eventName: "Shippment delivered",
          extra: "Delivered To: shipping address, cairo, egypt",
        });
      },
    }),

    rejectRequest: assign({
      requestRejected: () => true,
    }),

    markPaymentComplete: assign({
      paymentCompleted: () => true,
      paymentInfo: () => {},
    }),

    markApproved: assign({
      reviewApproved: () => true,
    }),

    saveShippingInfo: assign({
      shippingInfo: ({ event }) =>
        event.type === "SUBMIT_SHIPPING" ? event.shippingInfo : {},
    }),

    markDelivered: assign({
      deliveryConfirmed: () => true,
    }),
  },
}).createMachine({
  id: "governmentService",
  initial: "applying",

  context: {
    formData: {},
    paymentInfo: {},
    shippingInfo: {},
    Progress: {
      lastUpdated: Date.now(),
      completion: [],
      applying: [],
      reviewing: [],
      shipping: [],
    },
    InfoConfirmed: false,
    paymentCompleted: false,
    reviewApproved: false,
    deliveryConfirmed: false,
    requestRejected: false,
  },

  states: {
    /* ===================================== */
    /* APPLYING */
    /* ===================================== */
    applying: {
      initial: "fillInformation",

      states: {
        fillInformation: {
          on: {
            NEXT: "confirmInformation",
          },
        },

        confirmInformation: {
          on: {
            PREVIOUS: "fillInformation",
            NEXT: {
              target: "payment",
              actions: "Progress_informationFilled",
            },
          },
        },

        payment: {
          on: {
            PAYMENT_SUCCESS: {
              target: "done",
              actions: ["markPaymentComplete", "Progress_PaymentDone"],
            },
          },
        },

        done: {
          type: "final",
        },
      },

      onDone: {
        target: "#governmentService.underReview.waitingForReviewer",
        guard: "isPaymentComplete",
      },
    },

    /* ===================================== */
    /* UNDER REVIEW */
    /* ===================================== */
    underReview: {
      initial: "waitingForReviewer",

      states: {
        waitingForReviewer: {
          on: {
            APPROVE: {
              target: "approved",
              actions: [
                "markApproved",
                "Progress_underReview",
                "Progress_reviewApproved",
              ],
            },
            REJECT: "rejected",
          },
        },

        rejected: {
          always: {
            target: "#governmentService.completed",
            actions: [
              "rejectRequest",
              "Progress_underReview",
              "Progress_reviewRejected",
            ],
          },
        },

        approved: {
          type: "final",
        },
      },

      onDone: {
        target: "shipping",
        guard: "isApproved",
      },
    },

    /* ===================================== */
    /* SHIPPING */
    /* ===================================== */
    shipping: {
      initial: "enterShippingInfo",

      states: {
        enterShippingInfo: {
          on: {
            SUBMIT_SHIPPING: {
              target: "inTransit",
              actions: ["saveShippingInfo", "Progress_shippmentAddress"],
            },
          },
        },

        inTransit: {
          on: {
            DELIVERY_CONFIRMED: {
              target: "delivered",
              actions: ["markDelivered", "Progress_shippmentDelivered"],
            },
          },
        },

        delivered: {
          type: "final",
        },
      },

      onDone: {
        target: "completed",
        guard: "isDelivered",
      },
    },

    /* ===================================== */
    /* COMPLETED */
    /* ===================================== */
    completed: {
      type: "final",
    },
  },
});

// Function to create the checkout machine actor with optional snapshot restoration
export function createCheckoutMachine(snapshot?: any) {
  // console.log("snapshot", snapshot);
  if (snapshot) {
    return createActor(stateMachine, { snapshot }).start();
  }
  return createActor(stateMachine).start();
}
