import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { useTable } from "react-table";

export default function EmployerRepayments({ user }) {
    const [repayments, setRepayments] = useState([]);

    useEffect(() => {
        const fetchRepayments = async () => {
            const response = await fetch(`/api/repayments/employer/${user.id}`);
            const data = await response.json();
            setRepayments(data.repayments);
        };

        fetchRepayments();
    }, [user.id]);

    const handleApproval = async (repayment) => {
        const result = await Swal.fire({
            title: "Confirm Approval",
            text: "Make sure the amount is already settled before approving this repayment.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Approve",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            // Step 1: Call existing loan repayment API
            const loanResponse = await fetch(
                `/api/loan-applications/${repayment.transaction_id}/repay`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: parseFloat(repayment.amount),
                    }),
                }
            );

            const loanData = await loanResponse.json();
            if (!loanResponse.ok)
                throw new Error(
                    loanData.message || "Failed to process repayment"
                );

            // Step 2: Call the new API to update repayment status
            const statusResponse = await fetch(
                `/api/repayments/${repayment.id}/status`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "Approved" }),
                }
            );

            const statusData = await statusResponse.json();
            if (!statusResponse.ok)
                throw new Error(
                    statusData.message || "Failed to update repayment status"
                );

            // Step 3: Update UI
            setRepayments((prev) =>
                prev.map((r) =>
                    r.id === repayment.id ? { ...r, status: "Approved" } : r
                )
            );
            Swal.fire("Success", "Repayment approved successfully!", "success");
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const handleRejection = async (repayment) => {
        const result = await Swal.fire({
            title: "Confirm Rejection",
            text: "Are you sure you want to reject this repayment?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Reject",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            // Only update status to rejected
            const response = await fetch(
                `/api/repayments/${repayment.id}/status`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "Rejected" }),
                }
            );

            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || "Failed to reject repayment");

            // Update UI
            setRepayments((prev) =>
                prev.map((r) =>
                    r.id === repayment.id ? { ...r, status: "Rejected" } : r
                )
            );
            Swal.fire("Success", "Repayment rejected successfully!", "success");
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const columns = useMemo(
        () => [
            {
                Header: "Loan ID",
                accessor: "transaction_id",
            },
            { Header: "Employee Name", accessor: (row) => row.user.name },
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
                                : value === "Approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
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
            {
                Header: "Actions",
                accessor: "id",
                Cell: ({ row }) => (
                    <div className="flex space-x-2">
                        <button
                            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition disabled:opacity-50"
                            onClick={() => handleApproval(row.original)}
                            disabled={row.original.status !== "Pending"}
                        >
                            {row.original.status === "Approved"
                                ? "Approved"
                                : "Approve"}
                        </button>
                        <button
                            className="px-4 py-2 bg-white-500 text-white rounded-lg shadow-md hover:bg-red-600 transition disabled:opacity-50"
                            onClick={() => handleRejection(row.original)}
                            disabled={row.original.status !== "Pending"}
                        >
                            ❌
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    const data = useMemo(() => repayments, [repayments]);
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({ columns, data });

    return (
        <div className="flex justify-center items-center">
            <div className="w-full max-w-6xl p-4">
                <h1 className="text-2xl mb-4">Repayment Approvals</h1>
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
                    <p className="font-semibold">Important:</p>
                    <p>
                        Please ensure that any repayments have been settled
                        before approving. Once recorded, repayments cannot be
                        reversed.
                    </p>
                </div>
                {repayments.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 text-lg">
                        No repayment requests found.
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
