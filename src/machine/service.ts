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
      | {
          type: "NEXT";
          kind?: "normal" | "confirm" | "pay" | "submit";
          formData?: {};
        }
      | { type: "PREVIOUS" }
      | { type: "PAYMENT_SUCCESS" }
      | { type: "PAYMENT_FAILED" }
      | { type: "REVIEW_STARTED" }
      | { type: "APPROVE" }
      | { type: "REJECT" }
      | { type: "READY_TO_SHIP" }
      | { type: "SUBMIT_SHIPPING"; formData?: any }
      | {
          type: "SUBMIT_PAYMENT_INFO";
          feeItems: Array<{ label: string; price: number }>;
        }
      | { type: "DELIVERY_CONFIRMED" },
  },

  guards: {
    isPaymentComplete: ({ context }) => context.paymentCompleted,
    isApproved: ({ context }) => context.reviewApproved,
    isDelivered: ({ context }) => context.deliveryConfirmed,
  },

  actions: {
    saveFormData: assign({
      formData: ({ event }) => (event.type === "NEXT" ? event.formData : {}),
    }),

    Progress_informationFilled: assign({
      InfoConfirmed: true,
      Progress: ({ context }) => {
        return updateProgress(context, "applying", {
          eventName: "تم إدخال المعلومات",
          extra: "",
        });
      },
    }),
    Progress_PaymentDone: assign({
      Progress: ({ context }) => {
        return updateProgress(context, "reviewing", {
          eventName: "تم الدفع",
          extra: "",
        });
      },
    }),
    Progress_underReview: assign({
      Progress: ({ context }) => {
        return updateProgress(context, "reviewing", {
          eventName: "قيد المراجعة",
          extra: "",
        });
      },
    }),

    Progress_reviewApproved: assign({
      Progress: ({ context }) => {
        return updateProgress(context, "reviewing", {
          eventName: "تمت الموافقة من قبل المراجع",
          extra: "",
        });
      },
    }),

    Progress_reviewRejected: assign({
      Progress: ({ context }) => {
        return updateProgress(context, "completion", {
          eventName: "تم رفضه من قبل المراجع تلقائياً",
          extra: "تم تجاوز موعد استحقاق الدفع",
        });
      },
    }),

    Progress_shippmentAddress: assign({
      Progress: ({ context, event }) => {
        return updateProgress(context, "shipping", {
          eventName: "تم تقديم عنوان الشحن",
          extra:
            event.type === "SUBMIT_SHIPPING" &&
            event.formData?.shipping?.address,
        });
      },
    }),

    Progress_shippmentDelivered: assign({
      Progress: ({ context }) => {
        return updateProgress(context, "shipping", {
          eventName: "تم تسليم الشحنة",
          extra: "عنوان الشحن، القاهرة، مصر، الطابق الثالث",
        });
      },
    }),

    rejectRequest: assign({
      requestRejected: () => true,
    }),

    markPaymentComplete: assign({
      paymentCompleted: () => true,
    }),

    markApproved: assign({
      reviewApproved: () => true,
    }),

    saveShippingInfo: assign({
      shippingInfo: ({ event }) =>
        event.type === "SUBMIT_SHIPPING" ? event.formData : {},
    }),

    savePaymentInfo: assign({
      paymentInfo: ({ event }) =>
        event.type === "SUBMIT_PAYMENT_INFO"
          ? { feeItems: event.feeItems }
          : {},
    }),

    markDelivered: assign({
      deliveryConfirmed: () => true,
      Progress: ({ context }) => {
        return updateProgress(context, "completion", {
          eventName: "تم تسليم الشحنة",
          extra: "عنوان الشحن، القاهرة، مصر، الطابق الثالث",
        });
      },
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
            NEXT: {
              target: "confirmInformation",
              actions: "saveFormData",
            },
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
            SUBMIT_PAYMENT_INFO: {
              actions: ["savePaymentInfo"],
            },
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
            target: "#governmentService.rejected",
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

    /* ===================================== */
    /* rejected */
    /* ===================================== */
    rejected: {
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
