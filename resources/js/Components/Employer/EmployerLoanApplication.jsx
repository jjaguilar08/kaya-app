import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { useTable } from "react-table";

export default function EmployerLoanApplications({ user }) {
    const [loanApplications, setLoanApplications] = useState([]);
    const [activeStatus, setActiveStatus] = useState("Active"); // Default to Active loans

    useEffect(() => {
        const fetchLoanApplications = async () => {
            const response = await fetch(
                `/api/loan-application/employer/${user.id}`
            );
            const data = await response.json();
            setLoanApplications(data.loan_applications);
        };

        fetchLoanApplications();
    }, [user.id]);

    const handleStatusChange = async (loan, newStatus) => {
        // Show confirmation dialog
        const result = await Swal.fire({
            title: "Confirm Status Change",
            text: `Are you sure you want to change the status to ${newStatus}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, change it!",
            cancelButtonText: "Cancel",
        });

        // If user confirms, proceed with the status change
        if (result.isConfirmed) {
            const response = await fetch(
                `/api/loan-applications/${loan.transaction_id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
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

    const handleRepayment = async (loan) => {
        // Ask for repayment amount
        const { value: amount } = await Swal.fire({
            title: "Enter Repayment Amount",
            input: "number",
            inputLabel: `Loan Balance: P${loan.left_to_repay}`,
            inputPlaceholder: "Enter amount to repay",
            inputAttributes: { min: "1", step: "0.01" },
            showCancelButton: true,
            confirmButtonText: "Next",
            cancelButtonText: "Cancel",
            inputValidator: (value) => {
                if (!value || isNaN(value) || value <= 0) {
                    return "Please enter a valid repayment amount.";
                }
                if (parseFloat(value) > loan.left_to_repay) {
                    return "Repayment amount cannot exceed loan balance.";
                }
            },
        });

        if (!amount) return; // If user cancels, exit

        // Ask confirmation if the amount was deducted from payroll
        const confirmPayrollDeduction = await Swal.fire({
            title: "Confirm",
            text: `Make sure that the amount is already deducted to the employee's last payroll`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
        });

        if (!confirmPayrollDeduction.isConfirmed) return; // Exit if not confirmed

        // Proceed with the repayment API call
        const response = await fetch(
            `/api/loan-applications/${loan.transaction_id}/repay`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount: parseFloat(amount) }),
            }
        );

        const data = await response.json();

        if (response.ok) {
            // Update state with new loan balance
            setLoanApplications((prevLoans) =>
                prevLoans.map((l) =>
                    l.transaction_id === loan.transaction_id
                        ? {
                              ...l,
                              left_to_repay:
                                  data.loan_application.left_to_repay,
                              status: data.loan_application.status,
                          }
                        : l
                )
            );

            Swal.fire("Success", "Repayment recorded successfully!", "success");
        } else {
            Swal.fire(
                "Error",
                data.message || "Failed to process repayment.",
                "error"
            );
        }
    };

    // Rest of the component code remains the same...
    const filteredLoans = useMemo(() => {
        return loanApplications.filter((loan) =>
            activeStatus === "Active"
                ? loan.status === "Active"
                : loan.status !== "Active"
        );
    }, [loanApplications, activeStatus]);

    const columns = useMemo(
        () => [
            { Header: "SL No.", accessor: (row, i) => i + 1 },
            { Header: "Employee Name", accessor: (row) => row.employee.name },
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
                Cell: ({ row }) => {
                    if (row.original.status === "Active") {
                        return (
                            <button
                                className="border border-green-500 text-green-500 rounded-full px-3 py-1 bg-transparent hover:bg-green-500 hover:text-white transition"
                                onClick={() => handleRepayment(row.original)}
                            >
                                Repay
                            </button>
                        );
                    }

                    return (
                        <select
                            value={row.original.status}
                            onChange={(e) =>
                                handleStatusChange(row.original, e.target.value)
                            }
                            className="w-32 px-3 py-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="Pending" className="bg-gray-100">
                                Pending
                            </option>
                            <option value="Active" className="bg-green-100">
                                Approved
                            </option>
                            <option value="Rejected" className="bg-red-100">
                                Rejected
                            </option>
                            <option value="Manual" className="bg-yellow-100">
                                Manual
                            </option>
                        </select>
                    );
                },
            },
        ],
        [activeStatus]
    );

    const data = useMemo(() => filteredLoans, [filteredLoans]);
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({ columns, data });

    return (
        <div className="flex justify-center items-center">
            <div className="w-full max-w-6xl p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl">Loan Applications</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveStatus("Active")}
                            className={`px-4 py-2 rounded-lg ${
                                activeStatus === "Active"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-700"
                            }`}
                        >
                            Active Loans
                        </button>
                        <button
                            onClick={() => setActiveStatus("Pending")}
                            className={`px-4 py-2 rounded-lg ${
                                activeStatus === "Pending"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-700"
                            }`}
                        >
                            Pending Loans
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
                    <p className="font-semibold">Important:</p>
                    <p>
                        Please ensure that any repayments have been deducted
                        from the employee's payroll before proceeding. Once
                        recorded, repayments cannot be reversed.
                    </p>
                </div>

                {filteredLoans.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 text-lg">
                        {activeStatus === "Active"
                            ? "No active loans found."
                            : "No pending loan applications found."}
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
