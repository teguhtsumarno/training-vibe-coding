interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-[#E1E6EC]">
      <div>
        <h1 className="text-3xl font-heading font-medium tracking-tight text-[#000000]">{title}</h1>
        {description && (
          <p className="text-sm text-[#45474D] mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 sm:self-center">{action}</div>}
    </div>
  );
}
