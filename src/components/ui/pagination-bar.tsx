import { ArrowLeft, ArrowRight } from "lucide-react";
import { memo } from "react";
import type { Pagination } from "@/lib/types";

/** Compact page list: first, last, and a window around the current page. */
function pageNumbers(current: number, total: number) {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((page, index) => (index > 0 && page - sorted[index - 1] > 1 ? ["gap", page] : [page])) as (number | "gap")[];
}

export const PaginationBar = memo(function PaginationBar({ pagination, onPage, label, fetching }: {
  pagination?: Pagination; onPage: (page: number) => void; label: string; fetching?: boolean;
}) {
  if (!pagination) return null;
  const { page, limit, total, pages } = pagination;
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <footer className="pagination-bar" aria-busy={fetching}>
      <span>Showing <strong>{first}–{last}</strong> of <strong>{total}</strong> {label}</span>
      <nav className="pagination-actions" aria-label={`${label} pages`}>
        <button className="icon-button page-arrow" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ArrowLeft size={15} /></button>
        {pageNumbers(page, Math.max(pages, 1)).map((item, index) => item === "gap"
          ? <span key={`gap-${index}`} className="page-gap">…</span>
          : <button key={item} className={`page-number${item === page ? " is-current" : ""}`} aria-current={item === page ? "page" : undefined} onClick={() => onPage(item)}>{item}</button>)}
        <button className="icon-button page-arrow" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ArrowRight size={15} /></button>
      </nav>
    </footer>
  );
});
