import { useSelector } from "@xstate/react";
import Parcel from "single-spa-react/parcel";
import { createCheckoutMachine } from "./machine/service";
import { mountRootParcel } from "single-spa";
import { useMemo, useRef } from "react";

import FillInfo from "./service/FillInfo";
import ViewFillInfo from "./service/ViewFillInfo";
import Bill from "./service/Bill";
import PendingReview from "./service/PendingReview";
import ShippingAddress from "./service/ShippingAddress";
import StatusCard from "./service/StatusCard";

import CTA from "./service/CTA";
import { NestedVerticalStepsParcel } from "./shared-ui";
import { styles } from "./styles";
import { getRequestID, getRequest, updateRequestStep } from "./requestStorage";

const steps = [
  {
    id: "basicInformationTask",
    markCompleteOnContext: "InfoConfirmed",
    title: "بيانات الجمعية",
    children: [
      {
        id: "fillInformation",
        activeWhileState: "applying.fillInformation",
        title: "المعلومات المطلوبة",
        header: "إدخال المعلومات الأساسية",
        description:
          "من فضلك قم بإدخال جميع البيانات المطلوبة بشكل صحيح لإتمام الطلب.",
      },
      {
        id: "confirmInformation",
        activeWhileState: "applying.confirmInformation",
        title: "تأكيد المعلومات",
        header: "تأكيد صحة المعلومات",
        description:
          "يرجى مراجعة البيانات المدخلة والتأكد من صحتها قبل المتابعة.",
      },
    ],
  },
  {
    id: "paymentTask",
    activeWhileState: "applying.payment",
    markCompleteOnContext: "paymentCompleted",
    title: "الدفع",
    header: "دفع رسوم الخدمة",
    description: "من فضلك قم بدفع الرسوم المطلوبة لإتمام عملية التقديم.",
  },
  {
    id: "reviewTask",
    markCompleteOnContext: "reviewApproved",
    markRejectedOnContext: "requestRejected",
    title: "المراجعة",
    children: [
      {
        id: "reviewTaskSummary",
        activeWhileState: "underReview.waitingForReviewer",
        title: "ملخص المراجعة",
        header: "الطلب قيد المراجعة",
        description:
          "طلبك الآن قيد المراجعة من قبل المختصين وسيتم إشعارك عند الانتهاء.",
      },
    ],
  },
  {
    id: "shippingTask",
    markCompleteOnContext: "deliveryConfirmed",
    title: "الشحن",
    children: [
      {
        id: "enterShippingInfo",
        activeWhileState: "shipping.enterShippingInfo",
        title: "معلومات الشحن",
        header: "إدخال معلومات الشحن",
        description: "من فضلك أدخل بيانات عنوان الشحن بدقة لضمان وصول الشحنة.",
      },
      {
        id: "shipmentStatus",
        activeWhileState: "shipping.inTransit",
        title: "حالة الشحنة",
      },
    ],
  },
];

function getStepState(steps, machine) {
  for (const step of steps) {
    // Check the step itself
    if (step.activeWhileState && machine.matches(step.activeWhileState)) {
      return step;
    }

    // Check children
    if (Array.isArray(step.children)) {
      for (const child of step.children) {
        if (child.activeWhileState && machine.matches(child.activeWhileState)) {
          return child;
        }
      }
    }
  }

  return null;
}

function flattenSteps(steps, result) {
  if (!Array.isArray(steps)) return result || [];

  result = result || [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    result.push(step);

    if (Array.isArray(step.children)) {
      flattenSteps(step.children, result);
    }
  }

  return result;
}

function getStepProgress(steps, machine) {
  if (!Array.isArray(steps)) {
    return { current: 0, total: 0 };
  }

  const allSteps = flattenSteps(steps);
  const activeSteps = allSteps.filter(function (step) {
    return step && step.activeWhileState;
  });

  let currentIndex = -1;

  for (let i = 0; i < activeSteps.length; i++) {
    if (machine.matches(activeSteps[i].activeWhileState)) {
      currentIndex = i;
      break;
    }
  }

  return {
    current: currentIndex >= 0 ? currentIndex + 1 : 0,
    total: activeSteps.length,
  };
}

export default function ServiceComponent() {
  const requestID = getRequestID();
  const initialRequest = getRequest(requestID);
  const navigatingFromCompletedRef = useRef(false);
  const machineRef = useRef(null);

  // Create the machine actor with stored snapshot if available
  const checkoutMachine = useMemo(() => {
    // If we're navigating back from completed, keep the existing machine
    if (navigatingFromCompletedRef.current) {
      navigatingFromCompletedRef.current = false;
      return machineRef.current; // Return existing machine
    }
    const storedSnapshot = initialRequest?.machineSnapshot;
    // Only use snapshot if it exists and is not null
    const newMachine = createCheckoutMachine(storedSnapshot || undefined);
    machineRef.current = newMachine;
    return newMachine;
  }, [initialRequest?.machineSnapshot]);

  // Ensure we always have a machine instance
  if (!machineRef.current && checkoutMachine) {
    machineRef.current = checkoutMachine;
  }
  const stableMachine = checkoutMachine || machineRef.current;

  // useSelector tells React to re-render whenever the actor's state changes
  const state = useSelector(stableMachine, (snapshot) => snapshot);

  const sendEvent = (event) => {
    // If event is a string, wrap it in an object with type property
    // If event is already an object, use it directly
    const eventObject = typeof event === "string" ? { type: event } : event;

    stableMachine.send(eventObject);

    // Get the updated state after the event is processed
    const updatedState = stableMachine.getSnapshot();
    // Store the snapshot with updated context
    updateRequestStep(requestID, updatedState.value, {}, updatedState);
  };

  const activeStepData = getStepState(steps, state);
  const steper = getStepProgress(steps, state);
  return (
    <div style={styles.wrapper}>
      {/* ====== SIDEBAR with VerticalStepper ====== */}
      <aside style={styles.sidebar}>
        <Parcel
          config={NestedVerticalStepsParcel}
          mountParcel={mountRootParcel}
          steps={steps}
          state={state}
        />
      </aside>
      {/* ====== MAIN CONTENT AREA ====== */}
      <div style={styles.mainWrapper}>
        <main style={styles.mainContent}>
          {/* ------ Content Header ------ */}

          {/* ------ Content Body ------ */}
          <div style={styles.contentBody}>
            {!state.matches("completed") && (
              <div
                style={{
                  color: "#2A71F0",
                }}
              >
                الخطوة {steper.current}/{steper.total}
              </div>
            )}
            <h1 className="font-bold text-2xl">{activeStepData?.header}</h1>
            <p>{activeStepData?.description}</p>
            <br />
            <br />
            {state.matches("applying.fillInformation") && (
              <>
                <FillInfo sendEvent={sendEvent} request={initialRequest} />
              </>
            )}

            {state.matches("applying.confirmInformation") && (
              <>
                <ViewFillInfo sendEvent={sendEvent} request={initialRequest} />
              </>
            )}
            {state.matches("applying.payment") && (
              <>
                <Bill sendEvent={sendEvent} state={state} />
              </>
            )}
            {state.matches("underReview.waitingForReviewer") && (
              <>
                <PendingReview
                  sendEvent={sendEvent}
                  requestID={requestID}
                  initialRequest={initialRequest}
                />
              </>
            )}
            {state.matches("shipping.enterShippingInfo") && (
              <>
                <ShippingAddress sendEvent={sendEvent} />
              </>
            )}
            {state.matches("shipping.inTransit") && (
              <>
                <div className="flex justify-center">
                  <StatusCard
                    title={"الشحنة في الطريق"}
                    items={[
                      { label: "رقم الطلب", value: requestID },
                      {
                        label: "حالة الطلب",
                        value: "الشحنة في الطريق",
                        valueColor: "#FF730D",
                      },
                      {
                        label: "نوع الخدمة",
                        value: initialRequest.serviceName,
                      },
                    ]}
                  />
                </div>
                <br />
                <div className="flex gap-3 justify-end px-3 w-full">
                  <CTA handleSubmit={() => sendEvent("DELIVERY_CONFIRMED")}>
                    تم تأكيد التسليم
                  </CTA>
                </div>
              </>
            )}
            {state.matches("completed") && (
              <>
                {state.context.requestRejected ? (
                  <>
                    <div className="flex justify-center">
                      <StatusCard
                        title={"تم رفض الطلب"}
                        failedIcon={true}
                        items={[
                          { label: "رقم الطلب", value: requestID },
                          {
                            label: "حالة الطلب",
                            value: state.context.Progress.completion[0].extra,
                            valueColor: "#EB3E3E",
                          },
                          {
                            label: "نوع الخدمة",
                            value: initialRequest.serviceName,
                          },
                        ]}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center">
                    <StatusCard
                      title={"تم إتمام الطلب"}
                      items={[
                        { label: "رقم الطلب", value: requestID },
                        {
                          label: "حالة الطلب",
                          value: "تم إتمام الطلب",
                          valueColor: "#54B5A6",
                        },
                        {
                          label: "نوع الخدمة",
                          value: initialRequest.serviceName,
                        },
                      ]}
                    />
                  </div>
                )}
              </>
            )}

            {/* <details>
              <summary>Current Step: {JSON.stringify(state.value)}</summary>
              <pre>{JSON.stringify(state.context, null, 2)}</pre>
            </details>*/}
          </div>
        </main>
      </div>
    </div>
  );
}
