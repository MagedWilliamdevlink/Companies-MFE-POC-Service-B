import { useForm } from "antd/es/form/Form";
import FormEntry from "./FormEntry";
import CTA from "./CTA";

export default function FillInfo({ sendEvent }) {
  const [form] = useForm();

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
      <FormEntry form={form} />

      <div className="flex gap-3 justify-end px-3 w-full">
        <CTA handleSubmit={handleSubmit}>التالي</CTA>
      </div>
    </>
  );
}
