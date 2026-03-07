"use client";
import {
  defaultBills,
  defaultCategories,
  defaultColors,
  defaultSizes,
} from "@/utils/quick-data";
import axios from "axios";
import { useParams } from "next/navigation";
import JsonEditorModal from "../editors/JSON-editor";
type OnSubmitProps = {
  categories?: string[];
  colors?: Record<string, string>;
  sizes?: Record<string, string>;
  bills?: Record<string, string>;
};

const SampleDataModal = () => {
  const params = useParams();
  const { storeId } = params;

  const onSubmit = async (data: OnSubmitProps) => {
    if (!storeId) {
      console.error("Store ID is required");
      return;
    }
    try {
      await axios.post(`/api/${storeId}/multipleBills`, {
        dataObj: data.bills,
      });
      await axios.post(`/api/${storeId}/multipleCategories`, {
        nameArr: data.categories,
      });
      await axios.post(`/api/${storeId}/multipleColors`, {
        dataObj: data.colors,
      });
      await axios.post(`/api/${storeId}/multipleSizes`, {
        dataObj: data.sizes,
      });
    } catch (error) {
      console.error("Failed to add sample data:", error);
    }
  };
  return (
    <JsonEditorModal
      title="Edit Store and Add Sample Data"
      description="Make changes to your profile and add sample data for categories, colors, and sizes in JSON format."
      fields={[
        {
          name: "categories",
          defaultValue: defaultCategories,
          label: "Categories{category names}",
        },
        {
          name: "colors",
          defaultValue: defaultColors,
          label: "Colors{colorname : colorcode}",
        },
        {
          name: "sizes",
          defaultValue: defaultSizes,
          label: "Sizes{sizename : size}",
        },
        {
          name: "bills",
          defaultValue: defaultBills,
          label: "Bills{billboard text : billboard url}",
        },
      ]}
      onSubmit={onSubmit}
      triggerButtonText="Add Quick Data⚡"
    />
  );
};

export default SampleDataModal;
