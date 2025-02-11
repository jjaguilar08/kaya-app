import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { useTable } from "react-table";
import { Heart, Home, Briefcase, Info } from "lucide-react";

export default function MyLoansContent({ user, setActiveTab }) {
    const [loanApplications, setLoanApplications] = useState([]);
    const [activeStatus, setActiveStatus] = useState("Active"); // Default to Active loans

    // Categories for the general loan types
    const loanCategories = {
        "Medical Loans": ["Medical Procedure"],
        "Home Loans": ["Home Renovation"],
        "Business Loans": ["Business Expansion"],
        Others: ["Education"], // Education falls under "Others"
    };

    const [totalsByCategory, setTotalsByCategory] = useState({
        "Medical Loans": 0,
        "Home Loans": 0,
        "Business Loans": 0,
        Others: 0,
    });

    useEffect(() => {
        const fetchLoanApplications = async () => {
            const response = await fetch(
                `/api/loan-application/employee/${user.id}`
            );
            const data = await response.json();
            setLoanApplications(data.loan_applications);

            // Define loan categories
            const loanCategories = {
                "Medical Loans": ["Medical Procedure"],
                "Home Loans": ["Home Renovation"],
                "Business Loans": ["Business Expansion"],
                Others: ["Education"], // Education will be considered as "Others"
            };

            // Calculate total loan amounts for each loan category
            const categoryTotals = Object.keys(loanCategories).reduce(
                (acc, category) => {
                    acc[category] = data.loan_applications
                        .filter(
                            (loan) =>
                                loanCategories[category].includes(
                                    loan.loan_purpose
                                ) ||
                                // If loan purpose is not in known categories, categorize it under "Others"
                                (category === "Others" &&
                                    ![
                                        "Medical Procedure",
                                        "Home Renovation",
                                        "Business Expansion",
                                    ].includes(loan.loan_purpose))
                        )
                        .reduce(
                            (sum, loan) => sum + parseFloat(loan.loan_amount),
                            0
                        );
                    return acc;
                },
                {}
            );

            setTotalsByCategory(categoryTotals);
        };

        fetchLoanApplications();
    }, [user.id]);

    function calculateMonthlyPayment(principal, months, interestRate) {
        const monthlyInterest = interestRate / 100;
        return (principal * monthlyInterest + principal / months).toFixed(2);
    }

    // Filter loans based on status
    const filteredLoans = useMemo(() => {
        return loanApplications.filter((loan) =>
            activeStatus === "Active"
                ? loan.status === "Active"
                : loan.status !== "Active"
        );
    }, [loanApplications, activeStatus]);

    // Calculate totals based on filtered loans
    const totalLoanAmount = filteredLoans.reduce(
        (sum, loan) => sum + parseFloat(loan.loan_amount),
        0
    );
    const totalLeftToRepay = filteredLoans.reduce(
        (sum, loan) => sum + parseFloat(loan.left_to_repay),
        0
    );
    const totalInstallment = filteredLoans.reduce((sum, loan) => {
        const principal = parseFloat(loan.loan_amount);
        const months = parseInt(loan.selected_plan);
        const interestRate = parseFloat(loan.interest_rate);
        return (
            sum +
            parseFloat(calculateMonthlyPayment(principal, months, interestRate))
        );
    }, 0);

    const columns = useMemo(
        () => [
            {
                Header: "SL No.",
                accessor: (row, i) => i + 1,
            },
            {
                Header: "Status",
                accessor: "status",
                Cell: ({ value }) => (
                    <span
                        className={`px-2 py-1 rounded-full text-sm ${
                            value === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                        {value}
                    </span>
                ),
            },
            {
                Header: "Loan Money",
                accessor: "loan_amount",
                Cell: ({ value }) => `P ${parseFloat(value).toFixed(2)}`,
            },
            {
                Header: "Left to Repay",
                accessor: "left_to_repay",
                Cell: ({ value }) => `P ${parseFloat(value).toFixed(2)}`,
            },
            {
                Header: "Duration",
                accessor: "selected_plan",
            },
            {
                Header: "Interest Rate",
                accessor: "interest_rate",
                Cell: ({ value }) => `${value} %`,
            },
            {
                Header: "Installment",
                accessor: "total_amount_to_receive",
                Cell: ({ row }) => {
                    const principal = parseFloat(row.original.loan_amount);
                    const months = parseInt(row.original.selected_plan);
                    const interestRate = parseFloat(row.original.interest_rate);
                    const monthlyPayment = calculateMonthlyPayment(
                        principal,
                        months,
                        interestRate
                    );
                    return `P ${monthlyPayment} / month`;
                },
            },
            {
                Header: "Repay",
                accessor: "id",
                Cell: ({ row }) => (
                    <>
                        {row.original.status === "Active" && (
                            <button
                                onClick={() => handleRepay(row.original)}
                                className="border border-blue-500 text-blue-500 rounded-full px-3 py-1 bg-transparent hover:bg-blue-500 hover:text-white transition"
                            >
                                Repay
                            </button>
                        )}
                    </>
                ),
            },
        ],
        []
    );

    const data = useMemo(() => filteredLoans, [filteredLoans]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({
            columns,
            data,
        });

    const handleRepay = (loan) => {
        Swal.fire({
            title: "Enter Repayment Amount",
            input: "number",
            inputAttributes: {
                min: 1,
                max: loan.left_to_repay,
                step: 0.01,
            },
            showCancelButton: true,
            confirmButtonText: "Submit",
            preConfirm: (amount) => {
                if (!amount || amount <= 0 || amount > loan.left_to_repay) {
                    Swal.showValidationMessage("Invalid amount");
                }
                return amount;
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const repaymentRequest = {
                    loan_id: loan.id,
                    transaction_id: loan.transaction_id, // Assuming transaction_id is available in the loan object
                    amount: parseFloat(result.value),
                    user_id: user.id,
                    status: "Pending", // Status for employer approval
                };

                // Send the repayment request to the API
                fetch("/api/repayments", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(repaymentRequest),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.message) {
                            Swal.fire("Success", data.message, "success");
                            setActiveTab('Repayments');
                        } else {
                            Swal.fire("Error", "Something went wrong", "error");
                        }
                    })
                    .catch((error) => {
                        console.error(
                            "Error submitting repayment request:",
                            error
                        );
                        Swal.fire(
                            "Error",
                            "Failed to submit repayment",
                            "error"
                        );
                    });
            }
        });
    };

    return (
        <div className="flex justify-center items-center">
            <div className="w-full max-w-6xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {Object.keys(loanCategories).map((category) => (
                        <div
                            key={category}
                            className="bg-white p-4 rounded-lg shadow-lg flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                {category === "Medical Loans" && (
                                    <Heart className="w-8 h-8 text-red-500 mr-4" />
                                )}
                                {category === "Home Loans" && (
                                    <Home className="w-8 h-8 text-blue-500 mr-4" />
                                )}
                                {category === "Business Loans" && (
                                    <Briefcase className="w-8 h-8 text-yellow-500 mr-4" />
                                )}
                                {category === "Others" && (
                                    <Info className="w-8 h-8 text-gray-500 mr-4" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-gray-300 font-bold text-lg">
                                    {category}
                                </h2>
                                <p className="text-sm font-bold">
                                    Total Amount: P{" "}
                                    {totalsByCategory[category].toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl">My Loans</h1>
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

                {activeStatus === "Pending" && (
                    <div className="flex items-center gap-2 p-4 mb-4 bg-yellow-50 border border-orange-200 rounded-lg text-orange-700">
                        <Info className="w-5 h-5" />
                        <p>
                            These loan applications are currently under review
                            by your employer. You will be notified once they are
                            processed.
                        </p>
                    </div>
                )}
                {filteredLoans.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {activeStatus === "Active" ? (
                            <p>No active loans available.</p>
                        ) : (
                            <p>No pending loan applications.</p>
                        )}
                    </div>
                ) : (
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
                        <tfoot>
                            <tr className="text-red-500 font-bold bg-gray-100 border-t">
                                <td className="px-6 py-3">Total</td>
                                <td className="px-6 py-3"></td>
                                <td className="px-6 py-3">
                                    P {totalLoanAmount.toFixed(2)}
                                </td>
                                <td className="px-6 py-3">
                                    P {totalLeftToRepay.toFixed(2)}
                                </td>
                                <td className="px-6 py-3"></td>
                                <td className="px-6 py-3"></td>
                                <td className="px-6 py-3">
                                    P {totalInstallment.toFixed(2)} / month
                                </td>
                                <td className="px-6 py-3"></td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>
        </div>
    );
}
