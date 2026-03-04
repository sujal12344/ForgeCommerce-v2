import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatter } from "@/lib/utils";
import Image from "next/image";

export type Data = {
  id: string;
  name: string;
  email: string;
  pricePaid: number;
};

type SalesProps = {
  data: Data[] | null;
};

const Sales = ({ data }: SalesProps) => {
  if (!data || data.length === 0) return null;
  return (
    <Card className="shadow-lg border border-border/50 bg-card/80 backdrop-blur-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold tracking-tight">
          Recent Sales
        </CardTitle>
        <CardDescription className="text-xs">
          {data.length} recent transaction{data.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map(user => (
            <div
              key={user.id}
              className="flex items-center gap-3 group rounded-lg p-2 -mx-2 hover:bg-muted/40 transition-colors duration-150"
            >
              <Image
                src={`https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(user.name)}&size=36`}
                alt={user.name}
                width={36}
                height={36}
                className="rounded-full shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {user.email}
                </p>
              </div>
              <div className="text-sm font-semibold text-emerald-500 shrink-0 tabular-nums">
                +{formatter.format(user.pricePaid)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Sales;
