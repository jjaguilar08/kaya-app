import { useState, useEffect, useMemo } from "react";
import { useTable } from "react-table";
import { Info } from "lucide-react";

export default function RepaymentsContent({ user }) {
    const [repayments, setRepayments] = useState([]);

    useEffect(() => {
        const fetchRepayments = async () => {
            try {
                const response = await fetch(`/api/repayments/user/${user.id}`);
                const data = await response.json();
                setRepayments(data.repayments || []);
            } catch (error) {
                console.error("Error fetching repayments:", error);
            }
        };

        fetchRepayments();
    }, [user.id]);

    const columns = useMemo(
        () => [
            {
                Header: "Loan ID",
                accessor: "transaction_id",
            },
            {
                Header: "Loan Purpose",
                accessor: "loan_application.loan_purpose",
            },
            {
                Header: "Repayment Amount",
                accessor: "amount",
                Cell: ({ value }) => `P ${parseFloat(value).toFixed(2)}`,
            },
            {
                Header: "Status",
                accessor: "status",
                Cell: ({ value }) => (
                    <span
                        className={`px-2 py-1 rounded-full text-sm ${
                            value === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                        }`}
                    >
                        {value}
                    </span>
                ),
            },
            {
                Header: "Date Requested",
                accessor: "created_at",
                Cell: ({ value }) => new Date(value).toLocaleDateString(),
            },
        ],
        []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({ columns, data: repayments });

    return (
        <div className="flex justify-center items-center">
            <div className="w-full max-w-6xl p-4">
                <div className="flex items-center gap-2 p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                    <Info className="w-5 h-5" />
                    <p>
                        Your employer will contact you with instructions on how
                        to proceed with the payment. Once confirmed, the
                        requested amount will be deducted from your current
                        active loan.
                    </p>
                </div>

                <h1 className="text-2xl mb-4">Repayments</h1>

                <table
                    {...getTableProps()}
                    className="min-w-full table-auto border"
                >
                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr
                                {...headerGroup.getHeaderGroupProps()}
                                className="border-b"
                            >
                                {headerGroup.headers.map((column) => (
                                    <th
                                        {...column.getHeaderProps()}
                                        className="px-6 py-3 text-left"
                                    >
                                        {column.render("Header")}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.length > 0 ? (
                            rows.map((row) => {
                                prepareRow(row);
                                return (
                                    <tr
                                        {...row.getRowProps()}
                                        className="border-b"
                                    >
                                        {row.cells.map((cell) => (
                                            <td
                                                {...cell.getCellProps()}
                                                className="px-6 py-3"
                                            >
                                                {cell.render("Cell")}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-3 text-center text-gray-500"
                                >
                                    No repayment records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
