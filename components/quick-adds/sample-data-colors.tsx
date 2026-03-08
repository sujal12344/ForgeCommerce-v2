"use client";
import JsonEditorModal from "@/components/editors/JSON-editor";
import { defaultColors } from "@/utils/quick-data";
import axios from "axios";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
type OnSubmitProps = {
  categories?: string[];
  colors?: Record<string, string>;
  sizes?: Record<string, string>;
  bills?: Record<string, string>;
};

const SampleDataModalColors = () => {
  const params = useParams();
  const { storeId } = params;

  if (!storeId || Array.isArray(storeId)) {
    return null; // or appropriate fallback UI
  }

  const onSubmit = async (data: OnSubmitProps) => {
    if (!data.colors) return;
    try {
      await axios.post(`/api/${storeId}/multipleColors`, {
        dataObj: data.colors,
      });
      toast.success("Colors added successfully!");
    } catch (error) {
      console.error("Failed to add colors:", error);
      toast.error("Failed to add colors. Please try again.");
      return;
    }
  };
  return (
    <JsonEditorModal
      title="Edit Store and Add Sample Data"
      description="Make changes to your profile and add sample data for colors in JSON format."
      fields={[
        {
          name: "colors",
          defaultValue: defaultColors,
          label: "Colors{colorname : colorcode}",
        },
      ]}
      onSubmit={onSubmit}
      triggerButtonText="Add Quick Data⚡"
    />
  );
};

export default SampleDataModalColors;
