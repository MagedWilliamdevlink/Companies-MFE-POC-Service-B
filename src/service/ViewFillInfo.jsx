import { useForm } from "antd/es/form/Form";
import FormEntry from "./FormEntry";
import CTA from "./CTA";

export default function FillInfo({ sendEvent }) {
  const [form] = useForm();

  const handlePrev = () => {
    sendEvent("PREVIOUS");
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((v) => {
        sendEvent("NEXT");
      })
      .catch((e) => {
        console.log("validation error", e);
      });
  };

  return (
    <>
      <FormEntry form={form} isReadonly={true} />

      <div className="flex gap-3 justify-end px-3 w-full">
        <CTA handleSubmit={handlePrev} arrow={"right"} variant={"outline"}>
          سابق
        </CTA>
        <CTA handleSubmit={handleSubmit}>التالي</CTA>
      </div>
    </>
  );
}
