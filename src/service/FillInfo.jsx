import { useForm } from "antd/es/form/Form";
import FormEntry from "./FormEntry";
import CTA from "./CTA";

export default function FillInfo({ sendEvent, request }) {
  const [form] = useForm();

  const handleSubmit = () => {
    form
      .validateFields()
      .then((v) => {
        sendEvent({
          type: "NEXT",
          formData: v,
        });
      })
      .catch((e) => {
        console.log("validation error", e);
      });
  };

  return (
    <>
      <FormEntry form={form} request={request} />
      <br />
      <div className="flex gap-3 justify-end px-3 w-full">
        <CTA handleSubmit={handleSubmit}>التالي</CTA>
      </div>
    </>
  );
}
