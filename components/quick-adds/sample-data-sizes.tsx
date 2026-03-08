"use client";
import JsonEditorModal from "@/components/editors/JSON-editor";
import { defaultSizes } from "@/utils/quick-data";
import axios from "axios";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
type OnSubmitProps = {
  categories?: string[];
  colors?: Record<string, string>;
  sizes?: Record<string, string>;
  bills?: Record<string, string>;
};

const SampleDataModalSizes = () => {
  const params = useParams();
  const { storeId } = params;

  if (!storeId || Array.isArray(storeId)) {
    return null; // or appropriate fallback UI
  }

  const onSubmit = async (data: OnSubmitProps) => {
    if (!data.sizes) return;
    try {
      await axios.post(`/api/${storeId}/multipleSizes`, {
        dataObj: data.sizes,
      });
      toast.success("Sizes added successfully");
    } catch (error) {
      console.error("Failed to add sizes:", error);
      toast.error("Failed to add sizes");
    }
  };
  return (
    <JsonEditorModal
      title="Edit Store and Add Sample Data"
      description="Make changes to your profile and add sample data for sizes in JSON format."
      fields={[
        {
          name: "sizes",
          defaultValue: defaultSizes,
          label: "Sizes{sizename : size}",
        },
      ]}
      onSubmit={onSubmit}
      triggerButtonText="Add Quick Data⚡"
    />
  );
};

export default SampleDataModalSizes;
