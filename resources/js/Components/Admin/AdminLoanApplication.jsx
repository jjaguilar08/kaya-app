import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { useTable } from "react-table";

export default function AdminLoanApplication() {
    const [loanApplications, setLoanApplications] = useState([]);

    useEffect(() => {
        const fetchLoanApplications = async () => {
            const response = await fetch("/api/loan-applications/manual");
            const data = await response.json();
            setLoanApplications(data.loan_applications);
        };

        fetchLoanApplications();
    }, []);

    const handleStatusChange = async (loan, newStatus) => {
        const result = await Swal.fire({
            title: "Confirm Status Change",
            text: `Are you sure you want to change the status to ${newStatus}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, change it!",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            const response = await fetch(
                `/api/loan-applications/${loan.transaction_id}/status`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setLoanApplications((prevLoans) =>
                    prevLoans.map((l) =>
                        l.transaction_id === loan.transaction_id
                            ? { ...l, status: newStatus }
                            : l
                    )
                );
                Swal.fire(
                    "Success",
                    "Loan status updated successfully",
                    "success"
                );
            } else {
                Swal.fire(
                    "Error",
                    data.message || "Failed to update loan status",
                    "error"
                );
            }
        }
    };

    const columns = useMemo(
        () => [
            { Header: "SL No.", accessor: (row, i) => i + 1 },
            { Header: "Employee Name", accessor: (row) => row.employee.name },
            { Header: "Employer Name", accessor: (row) => row.employer.name },
            {
                Header: "Loan Amount",
                accessor: "loan_amount",
                Cell: ({ value }) => `P ${parseFloat(value).toFixed(2)}`,
            },
            {
                Header: "Left to Repay",
                accessor: "left_to_repay",
                Cell: ({ value }) => `P ${parseFloat(value).toFixed(2)}`,
            },
            { Header: "Loan Purpose", accessor: "loan_purpose" },
            { Header: "Status", accessor: "status" },
            {
                Header: "Actions",
                accessor: "id",
                Cell: ({ row }) => (
                    <select
                        value={row.original.status}
                        onChange={(e) =>
                            handleStatusChange(row.original, e.target.value)
                        }
                        className="w-32 px-3 py-2 border rounded-lg bg-white shadow-sm"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Active">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Manual">Manual</option>
                    </select>
                ),
            },
        ],
        []
    );

    const data = useMemo(() => loanApplications, [loanApplications]);
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({ columns, data });

    return (
        <div className="flex justify-center items-center">
            <div className="w-full max-w-6xl p-4">
                <h1 className="text-2xl mb-4">Manual Loan Applications</h1>

                {loanApplications.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 text-lg">
                        No manual loan applications found.
                    </div>
                ) : (
                    <table
                        {...getTableProps()}
                        className="min-w-full border-collapse border"
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
                            {rows.map((row) => {
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
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
