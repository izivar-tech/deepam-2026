import Link from "next/link";
import { ArrowLeftIcon } from "@izivar/ux";

interface PageHeaderProps {
  title: string;
  backHref?: string;
}

export function PageHeader({ title, backHref = "/services" }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 bg-white border-b border-border px-4 py-3">
      <Link
        href={backHref}
        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors"
        aria-label="Go back"
      >
        <ArrowLeftIcon className="w-5 h-5 text-foreground" />
      </Link>
      <h1 className="title-medium font-semibold text-foreground">{title}</h1>
    </header>
  );
}
