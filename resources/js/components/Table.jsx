const Table = ({ columns, tableData, onPageChange, actions = null }) => {
    if (!tableData || !tableData.data) return <div>Loading...</div>;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= tableData.last_page) onPageChange(page);
    };

    const getNestedValue = (obj, field) =>
        field.split('.').reduce((acc, part) => (acc ? acc[part] : ''), obj);

    return (
        <div className="mt-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        {/* Header */}
                        <thead className="bg-white border-b border-gray-200">
                            <tr className="text-gray-700 text-sm">
                                <th className="px-4 py-3 text-left font-medium">#</th>
                                {columns.map((col, index) => (
                                    <th key={index} className="px-4 py-3 text-left font-medium">
                                        {col.header}
                                    </th>
                                ))}
                                {actions && (
                                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                                )}
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody>
                            {tableData.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length + (actions ? 2 : 1)}
                                        className="text-center py-4 text-gray-500"
                                    >
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                tableData.data.map((row, i) => (
                                    <tr
                                        key={i}
                                        className={`hover:bg-gray-50 transition ${
                                            i !== tableData.data.length - 1
                                                ? "border-b border-gray-100"
                                                : ""
                                        }`}
                                    >
                                        <td className="px-4 py-3 text-gray-700">
                                            {tableData.from + i}
                                        </td>

                                        {columns.map((col, j) => (
                                            <td key={j} className="px-4 py-3 text-gray-700">
                                                {col.render
                                                    ? col.render(row)
                                                    : getNestedValue(row, col.field) || ""}
                                            </td>
                                        ))}

                                        {actions && (
                                            <td className="px-4 py-3 text-gray-600">
                                                {actions(row)}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {tableData.last_page > 1 && (
                    <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-100">
                        <button
                            onClick={() => handlePageChange(tableData.current_page - 1)}
                            disabled={tableData.current_page === 1}
                            className="px-2 py-1 text-gray-500 disabled:text-gray-300 hover:text-black"
                        >
                            &lt;
                        </button>

                        {[...Array(tableData.last_page)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    tableData.current_page === i + 1
                                        ? "bg-gray-200 text-gray-900"
                                        : "text-gray-500 hover:bg-gray-100"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(tableData.current_page + 1)}
                            disabled={tableData.current_page === tableData.last_page}
                            className="px-2 py-1 text-gray-500 disabled:text-gray-300 hover:text-black"
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Table;
