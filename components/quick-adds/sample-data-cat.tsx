"use client";
import { defaultCategories } from "@/utils/quick-data";
import axios from "axios";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import JsonEditorModal from "../editors/JSON-editor";

type OnSubmitProps = {
  categories?: string[];
  colors?: Record<string, string>;
  sizes?: Record<string, string>;
  bills?: Record<string, string>;
};

const SampleDataModalCat = () => {
  const params = useParams();
  const { storeId } = params;

  if (!storeId || Array.isArray(storeId)) {
    return null; // or appropriate fallback UI
  }

  const onSubmit = async (data: OnSubmitProps) => {
    if (!data.categories) return;
    try {
      await axios.post(`/api/${storeId}/multipleCategories`, {
        nameArr: data.categories,
      });
      toast.success("Categories added successfully!");
    } catch (error) {
      console.error("Failed to add categories:", error);
      toast.error("Failed to add categories. Please try again.");
      return;
    }
  };
  return (
    <JsonEditorModal
      title="Edit Store and Add Sample Data"
      description="Make changes to your profile and add sample data for categories in JSON format."
      fields={[
        {
          name: "categories",
          defaultValue: defaultCategories,
          label: "Categories{category names}",
        },
      ]}
      onSubmit={onSubmit}
      triggerButtonText="Add Quick Data⚡"
    />
  );
};

export default SampleDataModalCat;
