"use client";
import JsonEditorModal from "@/components/editors/JSON-editor";
import { defaultBills } from "@/utils/quick-data";
import axios from "axios";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

const SampleDataModalBill = () => {
  const param = useParams();
  const { storeId } = param;

  if (!storeId) {
    return null; // or show an error state
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!data.billboards) {
      toast.error("No billboards found. Please add billboard data.");
      return;
    }
    try {
      await axios.post(`/api/${storeId}/multipleBills`, {
        dataObj: data.billboards,
      });
      toast.success("Billboards added successfully!");
    } catch (error) {
      console.error("Failed to add billboards:", error);
      toast.error("Failed to add billboards. Please try again.");
      return;
    }
  };
  return (
    <JsonEditorModal
      title="Edit Store and Add Sample Data"
      description="Make changes to your profile and add sample data for billboards in JSON format."
      fields={[
        {
          name: "billboards",
          defaultValue: defaultBills,
          label: "Billboards {billboard text : billboard url}",
        },
      ]}
      onSubmit={onSubmit}
      triggerButtonText="Add Quick Data⚡"
    />
  );
};

export default SampleDataModalBill;
