import { useMemo, useState, useEffect } from "react";
import { useTable } from "react-table";
import { Heart, Home, Briefcase, Info } from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

export default function DashboardContent({ user, setActiveTab }) {
    const [loanApplications, setLoanApplications] = useState([]);

    // Filter the loans to show only active ones
    const activeLoans = useMemo(
        () => loanApplications.filter((loan) => loan.status === "Active"),
        [loanApplications]
    );

    const COLORS = [
        "rgba(255, 99, 132, 1)", // Red for Medical
        "rgba(54, 162, 235, 1)", // Blue for Home
        "rgba(255, 206, 86, 1)", // Yellow for Business
        "rgb(175, 190, 190)", // Green for Others
    ];

    // Categories for the general loan types
    const loanCategories = {
        "Medical Loans": ["Medical Procedure"],
        "Home Loans": ["Home Renovation"],
        "Business Loans": ["Business Expansion"],
        Others: ["Education"],
    };

    const [totalsByCategory, setTotalsByCategory] = useState({
        "Medical Loans": 0,
        "Home Loans": 0,
        "Business Loans": 0,
        Others: 0,
    });

    const pieChartData = Object.entries(totalsByCategory).map(
        ([name, value]) => ({
            name,
            value,
        })
    );

    useEffect(() => {
        const fetchLoanApplications = async () => {
            const response = await fetch(
                `/api/loan-application/employee/${user.id}`
            );
            const data = await response.json();
            setLoanApplications(data.loan_applications);

            const categoryTotals = Object.keys(loanCategories).reduce(
                (acc, category) => {
                    acc[category] = data.loan_applications
                        .filter(
                            (loan) =>
                                loanCategories[category].includes(
                                    loan.loan_purpose
                                ) ||
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

    const columns = useMemo(
        () => [
            {
                Header: "SL No.",
                accessor: (row, i) => i + 1,
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
                Cell: ({ value }) => `${value} Months`,
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
                            <button className="border border-blue-500 text-blue-500 rounded-full px-3 py-1 bg-transparent hover:bg-blue-500 hover:text-white transition">
                                Repay
                            </button>
                        )}
                    </>
                ),
            },
        ],
        []
    );

    const data = useMemo(() => activeLoans, [activeLoans]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({
            columns,
            data,
        });

    function calculateMonthlyPayment(principal, months, interestRate) {
        const monthlyInterest = interestRate / 100;
        return (principal * monthlyInterest + principal / months).toFixed(2);
    }

    return (
        <div className="flex justify-center items-center">
            <div className="w-full max-w-6xl p-4">
                <h1 className="text-2xl mb-4">My Active Loans</h1>
                <div className="text-right mt-4 mb-4 text-blue-500 cursor-pointer">
                    {activeLoans.length !== 0 && (
                        <span onClick={() => setActiveTab("My Loans")}>
                            See All
                        </span>
                    )}
                </div>

                {activeLoans.length === 0 ? (
                    <div className="bg-blue-50 rounded-lg p-8 text-center border border-blue-100">
                        <div className="flex justify-center mb-4">
                            <Info className="w-12 h-12 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-blue-900 mb-2">
                            No Active Loans
                        </h2>
                        <p className="text-blue-600 mb-6">
                            You currently don't have any active loans. Ready to
                            explore your loan options?
                        </p>
                        <button
                            onClick={() => setActiveTab("Loan Application")}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Apply for a Loan
                        </button>
                    </div>
                ) : (
                    <table
                        {...getTableProps()}
                        className="min-w-full table-auto border"
                    >
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

                <hr className="border-t-2 border-black-500 mt-6" />

                {/* Rest of the component remains the same */}
                <div className="grid grid-cols-2 gap-8 mt-8">
                    <div className="border border-gray-300 p-6 rounded-lg">
                        <img
                            src="/images/Info-container-prominent.png"
                            alt="Loan Information"
                            className="w-full mb-4"
                        />
                        <h3 className="text-sm text-blue-700 font-semibold mb-4">
                            You can borrow up to
                        </h3>
                        <h1 className="text-3xl text-blue-700 font-bold">
                            30,000 PHP
                        </h1>
                        <p className="text-sm mb-4 text-gray-500">
                            * Subject to employer's approval
                        </p>
                        <h4 className="text-lg font-semibold mb-2 text-blue-900">
                            Loan Details
                        </h4>
                        <hr className="border-t-2 mb-4" />
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <strong className="text-blue-900">
                                    Payable in
                                </strong>
                                <p className="text-2xl text-blue-700">6-12</p>
                                <p className="text-blue-900"> Months</p>
                            </div>
                            <div>
                                <strong className="text-blue-900">
                                    Interest Rate
                                </strong>
                                <p className="text-2xl text-blue-700">0.99%</p>
                                <p className="text-blue-900"> ave. per month</p>
                            </div>
                            <div>
                                <strong className="text-blue-900">
                                    Process Fee
                                </strong>
                                <p className="text-2xl text-blue-700">3%</p>
                                <p className="text-blue-900"> as low as</p>
                            </div>
                        </div>
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={() => setActiveTab("Loan Application")}
                                className="w-full max-w-md px-2 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800"
                            >
                                Apply For Loan
                            </button>
                        </div>
                    </div>

                    <div className="border border-gray-300 p-6 rounded-lg flex flex-col">
                        <h3 className="text-xl font-semibold mb-4 text-blue-900">
                            Loan Distribution by Category
                        </h3>
                        <div className="flex-1 flex items-center justify-center min-h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) =>
                                            `P ${value.toFixed(2)}`
                                        }
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        layout="horizontal"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <hr className="border-t-2 border-black-500 mt-6 mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {Object.keys(loanCategories).map((category) => (
                        <div
                            key={category}
                            className="bg-white p-4 rounded-lg border shadow-lg flex items-center justify-between"
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
                                <h2 className="text-gray-500 font-bold text-lg">
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
            </div>
        </div>
    );
}
