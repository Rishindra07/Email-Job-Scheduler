export const Table = ({ columns, data, emptyMessage = "No data available" }: any) => {
    if (!data || data.length === 0) {
        return (
            <div className="table-empty">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        {columns.map((col: any, idx: number) => (
                            <th key={idx}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row: any, rIdx: number) => (
                        <tr key={rIdx}>
                            {columns.map((col: any, cIdx: number) => (
                                <td key={cIdx}>
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
