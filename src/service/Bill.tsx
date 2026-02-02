import Parcel from "single-spa-react/parcel";
import { mountRootParcel } from "single-spa";
import { FeeSummaryParcel } from "../common-components";
import CTA from "./CTA";

const feeItems = [
  { label: "قيمة رسم السجل التجاري", price: 200 },
  { label: "رسوم نقابة التجاريين", price: 200 },
  { label: "رسوم الهيئة العامة للاستثمار والأسواق الحرة", price: 300 },
  { label: "قيمة رسم الاتحاد العام للغرف", price: 250 },
  { label: "قيمة رسم التوثيق", price: 400 },
];

const handlePayment = (url) => {
  // alert("Payment successful!");
  window.open(url, "_blank");
};

export default function Bill({ sendEvent, state }) {
  return (
    <>
      <Parcel
        config={FeeSummaryParcel}
        mountParcel={mountRootParcel}
        items={feeItems}
        expiryDate="20/6/2025"
        paymentTime="19:55:00"
        onPayment={() => handlePayment("https://google.com")}
      />
      <br />
      <div className="flex gap-3 justify-end px-3 w-full">
        <CTA
          handleSubmit={() => {
            sendEvent({
              type: "SUBMIT_PAYMENT_INFO",
              feeItems: feeItems,
            });
            sendEvent("PAYMENT_SUCCESS");
          }}
        >
          Pay (success)
        </CTA>
      </div>
    </>
  );
}
