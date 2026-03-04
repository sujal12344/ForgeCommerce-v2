"use client";
import ApiBlock from "@/components/ui/api-block";
import UseOrigin from "@/hooks/origin-client";
import { useParams } from "next/navigation";

type ApiListProps = {
  Entityname: string;
  EntityIdname: string;
};

const ApiList = ({ Entityname, EntityIdname }: ApiListProps) => {
  const params = useParams();
  const { storeId } = params;
  const origin = UseOrigin();

  if (!origin || !storeId) {
    return null;
  }

  const baseUrl = `${origin}/api/${storeId}`;
  return (
    <div className="space-y-2">
      <ApiBlock
        title="GET"
        variant="public"
        description={`${baseUrl}/${Entityname}`}
      />
      <ApiBlock
        title="GET"
        variant="public"
        description={`${baseUrl}/${Entityname}/{${EntityIdname}}`}
      />
      <ApiBlock
        title="POST"
        variant="admin"
        description={`${baseUrl}/${Entityname}`}
      />
      <ApiBlock
        title="PATCH"
        variant="admin"
        description={`${baseUrl}/${Entityname}/{${EntityIdname}}`}
      />
      <ApiBlock
        title="DELETE"
        variant="admin"
        description={`${baseUrl}/${Entityname}/{${EntityIdname}}`}
      />
    </div>
  );
};

export default ApiList;
