import StatusCard from "./StatusCard";
import CTA from "./CTA";

export default function PendingReview({
  sendEvent,
  requestID,
  initialRequest,
}) {
  return (
    <>
      <div className="grid p-2 max-w-5xl place-self-center">
        <StatusCard
          title={"تم إتمام عملية الدفع"}
          items={[
            { label: "رقم الطلب", value: requestID },
            {
              label: "حالة الطلب",
              value: "قيد المراجعة",
              valueColor: "#54B5A6",
            },
            {
              label: "نوع الخدمة",
              value: initialRequest.serviceName,
            },
          ]}
        />
      </div>

      <div className="flex gap-3 justify-end px-3 w-full">
        <CTA
          handleSubmit={() => {
            sendEvent("REJECT");
          }}
          arrow={"right"}
          variant={"outline"}
        >
          رفض
        </CTA>
        <CTA
          handleSubmit={() => {
            sendEvent("APPROVE");
          }}
        >
          يعتمد
        </CTA>
      </div>
    </>
  );
}
