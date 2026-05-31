import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

interface SubNavItem {
  href: string;
  label: string;
}

interface SubNavProps {
  items: SubNavItem[];
  activeHref: string;
}

export function SubNav({ items, activeHref }: SubNavProps) {
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-800 pb-px">
      {items.map((item) => {
        const isActive =
          activeHref === item.href ||
          (item.href !== "" && activeHref.startsWith(item.href));

        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
              "border-b-2 -mb-px",
              isActive
                ? "border-pitch-500 text-pitch-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
            )}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
