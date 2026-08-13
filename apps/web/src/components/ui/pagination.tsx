"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize?: number;
}

const MAX_BUTTONS = 5;

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize = 10 }: PaginationProps) {
  if (totalPages <= 1 || totalItems === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  let start = Math.max(1, page - Math.floor(MAX_BUTTONS / 2));
  const end = Math.min(totalPages, start + MAX_BUTTONS - 1);
  start = Math.max(1, end - MAX_BUTTONS + 1);

  const pageNumbers: number[] = [];
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-medium text-gray-900">{from}</span>–<span className="font-medium text-gray-900">{to}</span>{" "}
        of <span className="font-medium text-gray-900">{totalItems}</span>
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        {start > 1 && <span className="px-1 text-sm text-gray-400" aria-hidden="true">…</span>}
        {pageNumbers.map((n) => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            aria-current={n === page ? "page" : undefined}
            aria-label={`Go to page ${n}`}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              n === page ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {n}
          </button>
        ))}
        {end < totalPages && <span className="px-1 text-sm text-gray-400" aria-hidden="true">…</span>}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}