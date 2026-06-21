import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  variant?: "red" | "blue";
  className?: string;
}

export default function DashboardCard({
  title,
  value,
  description,
  icon,
  variant = "blue",
  className,
}: DashboardCardProps) {
  const isRed = variant === "red";

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-white border border-[#E1E6EC] rounded-[16px] shadow-none ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <CardTitle className="text-sm font-heading font-medium text-[#6A6A71]">{title}</CardTitle>
        <div 
          className={`p-2 rounded-xl transition-all duration-300 ${
            isRed 
              ? "bg-red-50 text-red-500 border border-red-200" 
              : "bg-blue-50 text-blue-500 border border-blue-200"
          }`}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="text-4xl font-heading font-medium text-[#121317] tracking-tight">
          {value}
        </div>
        <p className="text-xs text-[#6A6A71] mt-1.5 font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}
