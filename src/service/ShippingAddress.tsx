import { Form } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useForm } from "antd/es/form/Form";
import CTA from "./CTA";

export default function ShippingAddress({ sendEvent }) {
  const [form] = useForm();

  const handleSubmit = () => {
    form
      .validateFields()
      .then((v) => {
        sendEvent("SUBMIT_SHIPPING");
      })
      .catch((e) => {
        console.log("validation error", e);
      });
  };

  return (
    <>
      أدخل عنوانك لشحن الخدمة
      <Form form={form} layout="vertical">
        <Form.Item
          name={["shipping", "address"]}
          label={"shipping Address"}
          rules={[
            {
              required: true,
            },
            {
              min: 10,
            },
          ]}
        >
          <TextArea></TextArea>
        </Form.Item>
      </Form>
      <br />
      <div className="flex gap-3 justify-end px-3 w-full">
        <CTA handleSubmit={handleSubmit}>إرسال الشحن</CTA>
      </div>
    </>
  );
}
