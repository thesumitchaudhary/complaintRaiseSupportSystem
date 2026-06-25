import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const DataTable = ({
  columns,
  data,
  tableClassName = "",
  headerClassName = "",
  headerCellClassName = "",
  rowClassName = "",
  cellClassName = "",
  isLoading = false,
  loadingMessage = "Loading...",
  emptyMessage = "No data found.",
  emptyClassName = "",
  getRowKey,
  enablePagination = false,
  pageSize = 10,
  pageSizeLabel,
  paginationLabel = "Table pagination",
  paginationClassName = "",
  paginationButtonClassName = "",
  paginationTextClassName = "",
  paginationResetKey,
}) => {
  const rows = Array.isArray(data) ? data : [];
  const hasRows = rows.length > 0;
  const safePageSize = Math.max(Number(pageSize) || 10, 1);
  const resetKey = paginationResetKey ?? data;
  const [paginationState, setPaginationState] = useState({
    page: 1,
    resetKey,
  });
  const currentPage =
    paginationState.resetKey === resetKey ? paginationState.page : 1;
  const totalPages = Math.max(Math.ceil(rows.length / safePageSize), 1);
  const activePage = Math.min(currentPage, totalPages);
  const pageStart = (activePage - 1) * safePageSize;
  const visibleRows = enablePagination
    ? rows.slice(pageStart, pageStart + safePageSize)
    : rows;

  const firstVisibleRow = hasRows ? (activePage - 1) * safePageSize + 1 : 0;
  const lastVisibleRow = enablePagination
    ? Math.min(activePage * safePageSize, rows.length)
    : rows.length;
  const setPage = (getNextPage) => {
    setPaginationState((state) => {
      const basePage = state.resetKey === resetKey ? state.page : 1;
      const nextPage = getNextPage(basePage);

      return {
        page: Math.min(Math.max(nextPage, 1), totalPages),
        resetKey,
      };
    });
  };

  return (
    <>
      <table className={`w-full ${tableClassName}`}>
        <thead className={headerClassName}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`p-4 text-left ${headerCellClassName} ${
                  column.headerClassName || ""
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading || !hasRows ? (
            <tr>
              <td
                colSpan={columns.length}
                className={`p-4 text-center ${emptyClassName}`}
              >
                {isLoading ? loadingMessage : emptyMessage}
              </td>
            </tr>
          ) : (
            visibleRows.map((row, index) => (
              <tr
                key={getRowKey?.(row, index) || row.id || row._id || index}
                className={`border-t ${rowClassName}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`p-4 ${cellClassName} ${
                      column.cellClassName || ""
                    }`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {enablePagination && hasRows && !isLoading ? (
        <nav
          className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${paginationClassName}`}
          aria-label={paginationLabel}
        >
          <span className={`text-sm ${paginationTextClassName}`}>
            {pageSizeLabel || `${safePageSize} rows per page`}
          </span>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <span
              className={`text-sm ${paginationTextClassName}`}
              aria-live="polite"
            >
              {firstVisibleRow}-{lastVisibleRow} of {rows.length}
            </span>
            <span
              className={`text-sm ${paginationTextClassName}`}
              aria-live="polite"
            >
              Page {activePage} of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={activePage <= 1}
                onClick={() => setPage((page) => page - 1)}
                className={`inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${paginationButtonClassName}`}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                disabled={activePage >= totalPages}
                onClick={() => setPage((page) => page + 1)}
                className={`inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${paginationButtonClassName}`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </nav>
      ) : null}
    </>
  );
};
