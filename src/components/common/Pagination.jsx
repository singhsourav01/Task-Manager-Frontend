export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1 mt-6 overflow-x-auto pb-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-2.5 sm:px-3 py-2 sm:py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-h-[40px]"
      >
        Previous
      </button>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {getPages().map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-1.5 sm:px-2 py-2 text-sm text-gray-400">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-2.5 sm:px-3 py-2 sm:py-1.5 text-sm rounded border whitespace-nowrap min-h-[40px] min-w-[40px] ${
                p === page
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-2.5 sm:px-3 py-2 sm:py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-h-[40px]"
      >
        Next
      </button>
    </nav>
  );
}
