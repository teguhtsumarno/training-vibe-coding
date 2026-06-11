interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-white/5">
      <div className="flex gap-3 items-start">
        <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-red-500 to-blue-500 mt-1 shrink-0" />
        <div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight text-white">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0 sm:self-center">{action}</div>}
    </div>
  );
}
