interface Log {
    eventName: string;
    extra: string;
    timestamp: number;
}
export declare function createCheckoutMachine(snapshot?: any): import("xstate").Actor<import("xstate").StateMachine<{
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
}, {
    type: "NEXT";
    kind?: "normal" | "confirm" | "pay" | "submit";
    formData?: {};
} | {
    type: "PREVIOUS";
} | {
    type: "PAYMENT_SUCCESS";
} | {
    type: "PAYMENT_FAILED";
} | {
    type: "REVIEW_STARTED";
} | {
    type: "APPROVE";
} | {
    type: "REJECT";
} | {
    type: "READY_TO_SHIP";
} | {
    type: "SUBMIT_SHIPPING";
    formData?: any;
} | {
    type: "SUBMIT_PAYMENT_INFO";
    feeItems: Array<{
        label: string;
        price: number;
    }>;
} | {
    type: "DELIVERY_CONFIRMED";
}, {}, never, {
    type: "saveFormData";
    params: {};
} | {
    type: "Progress_informationFilled";
    params: {};
} | {
    type: "Progress_PaymentDone";
    params: {};
} | {
    type: "Progress_underReview";
    params: {};
} | {
    type: "Progress_reviewApproved";
    params: {};
} | {
    type: "Progress_reviewRejected";
    params: {};
} | {
    type: "Progress_shippmentAddress";
    params: {};
} | {
    type: "markDelivered";
    params: {};
} | {
    type: "Progress_shippmentDelivered";
    params: {};
} | {
    type: "rejectRequest";
    params: {};
} | {
    type: "markPaymentComplete";
    params: {};
} | {
    type: "markApproved";
    params: {};
} | {
    type: "saveShippingInfo";
    params: {};
} | {
    type: "savePaymentInfo";
    params: {};
}, {
    type: "isPaymentComplete";
    params: unknown;
} | {
    type: "isApproved";
    params: unknown;
} | {
    type: "isDelivered";
    params: unknown;
}, never, "completed" | "rejected" | {
    shipping: "enterShippingInfo" | "inTransit" | "delivered";
} | {
    applying: "done" | "fillInformation" | "confirmInformation" | "payment";
} | {
    underReview: "rejected" | "waitingForReviewer" | "approved";
}, string, {}, {}, import("xstate").EventObject, import("xstate").MetaObject, {
    id: "governmentService";
    states: {
        readonly applying: {
            states: {
                readonly fillInformation: {};
                readonly confirmInformation: {};
                readonly payment: {};
                readonly done: {};
            };
        };
        readonly underReview: {
            states: {
                readonly waitingForReviewer: {};
                readonly rejected: {};
                readonly approved: {};
            };
        };
        readonly shipping: {
            states: {
                readonly enterShippingInfo: {};
                readonly inTransit: {};
                readonly delivered: {};
            };
        };
        readonly completed: {};
        readonly rejected: {};
    };
}>>;
export {};
