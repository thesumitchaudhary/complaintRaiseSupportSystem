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
}) => {
  const hasRows = data.length > 0;

  return (
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
          data.map((row, index) => (
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
  );
};
