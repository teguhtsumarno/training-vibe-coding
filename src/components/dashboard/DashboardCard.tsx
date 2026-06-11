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
      className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-[#09090b] border-white/5 ${
        isRed 
          ? "hover:border-red-500/30 hover:shadow-red-glow" 
          : "hover:border-blue-500/30 hover:shadow-blue-glow"
      } ${className}`}
    >
      {/* Sleek top indicator gradient */}
      <div 
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${
          isRed ? "from-red-500 to-purple-600" : "from-blue-500 to-purple-600"
        }`} 
      />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <CardTitle className="text-sm font-heading font-medium text-muted-foreground">{title}</CardTitle>
        <div 
          className={`p-2 rounded-xl transition-all duration-300 ${
            isRed 
              ? "bg-red-500/10 text-red-400 border border-red-500/20" 
              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
          }`}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="text-4xl font-heading font-extrabold text-white tracking-tight">
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}
