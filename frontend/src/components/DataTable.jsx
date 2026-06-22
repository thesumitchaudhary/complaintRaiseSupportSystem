export const DataTable = ({
  columns,
  data,
  tableClassName = "",
  headerClassName = "",
  rowClassName = "",
}) => {
  return (
    <table className={`w-full ${tableClassName}`}>
      <thead className={headerClassName}>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className={`p-4 text-left ${column.headerClassName || ""}`}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, index) => (
          <tr
            key={row.id || row._id || index}
            className={`border-t ${rowClassName}`}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                className={`p-4 ${column.cellClassName || ""}`}
              >
                {column.render ? column.render(row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
