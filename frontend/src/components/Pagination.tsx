import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  label?: string;
}

function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    pages.push(pageNumber);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);
  return pages;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  isLoading = false,
  label = "results",
}) => {
  if (total === 0) {
    return null;
  }

  const safeTotalPages = Math.max(totalPages, 1);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const visiblePages = getVisiblePages(page, safeTotalPages);

  return (
    <div className="pagination">
      <span className="pagination-summary">
        Showing {start}-{end} of {total} {label}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-nav"
          onClick={() => onPageChange(page - 1)}
          disabled={isLoading || page <= 1}
        >
          Previous
        </button>

        {visiblePages.map((pageNumber, index) =>
          pageNumber === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={pageNumber}
              type="button"
              className={`pagination-page-button${
                pageNumber === page ? " active" : ""
              }`}
              onClick={() => onPageChange(pageNumber)}
              disabled={isLoading || pageNumber === page}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </button>
          )
        )}

        <button
          type="button"
          className="pagination-nav"
          onClick={() => onPageChange(page + 1)}
          disabled={isLoading || page >= safeTotalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
