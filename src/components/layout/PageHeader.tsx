import React from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
};

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action && <div>{action}</div>}
      {children}
    </div>
  );
}
