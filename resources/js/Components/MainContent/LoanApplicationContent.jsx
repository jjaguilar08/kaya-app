import { useState } from "react";
import Swal from "sweetalert2";

export default function LoanApplicationContent({ user, setActiveTab }) {
    const [loanAmount, setLoanAmount] = useState(3000);
    const [selectedPlan, setSelectedPlan] = useState(6);
    const [interestRate, setInterestRate] = useState(2.8);
    const [loanPurpose, setLoanPurpose] = useState("Medical Procedure");
    const [showConfirmation, setShowConfirmation] = useState(false); // State to show confirmation screen
    const [showSuccessPage, setShowSuccessPage] = useState(false);
    const [repaymentSchedule, setRepaymentSchedule] = useState([]); // To store repayment schedule details
    const [transactionId, setTransactionId] = useState("");

    const installmentPlans = [
        { months: 3, interestRate: 3.5 },
        { months: 6, interestRate: 2.8 },
        { months: 9, interestRate: 2.3 },
        { months: 12, interestRate: 1.9 },
    ].map((plan) => ({
        ...plan,
        monthlyPayment: calculateMonthlyPayment(
            loanAmount,
            plan.months,
            plan.interestRate
        ),
    }));

    const loanPurposes = [
        "Medical Procedure",
        "Home Renovation",
        "Education",
        "Business Expansion",
    ];

    function calculateMonthlyPayment(principal, months, interestRate) {
        const monthlyInterest = interestRate / 100;
        return (principal * monthlyInterest + principal / months).toFixed(2);
    }

    function handleLoanAmountChange(e) {
        let value = e.target.value.replace(/^0+/, "");
        setLoanAmount(Number(value));
    }

    function handleGetLoan() {
        // Calculate repayment schedule here
        const schedule = calculateRepaymentSchedule(
            loanAmount,
            selectedPlan,
            interestRate
        );
        setRepaymentSchedule(schedule);
        setShowConfirmation(true); // Show confirmation screen
    }

    function calculateRepaymentSchedule(principal, months, interestRate) {
        const monthlyPayment = calculateMonthlyPayment(
            principal,
            months,
            interestRate
        );
        const schedule = [];
        for (let i = 1; i <= months; i++) {
            schedule.push({
                month: i,
                amount: monthlyPayment,
            });
        }
        return schedule;
    }

    async function handleConfirmLoan() {
        let employee_id = user.id;
        const loanDetails = {
            employee_id,
            loanAmount,
            selectedPlan,
            interestRate,
            loanPurpose,
            processingFee: (loanAmount * 0.03).toFixed(2),
            totalAmountToReceive: (loanAmount * 0.97).toFixed(2),
        };
    
        try {
            const response = await fetch("/api/loan-application", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loanDetails),
            });
    
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to submit loan application.");
            }
    
            // Save the transaction_id to state
            setTransactionId(result.transaction_id);
    
            setShowSuccessPage(true);
            setShowConfirmation(false);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Submission Failed",
                text: error.message,
            });
        }
    }

    function handleSelectPlan(months, interestRate) {
        setSelectedPlan(months);
        setInterestRate(interestRate);
    }

    function handleCloseSuccessPage() {
        setShowSuccessPage(false);
        setActiveTab('My Loans');
    }

    return (
        <div className="flex justify-center items-center">
            {showSuccessPage ? (
                // Success Message Section
                <div className="w-full max-w-3xl p-6 space-y-6 text-center bg-white shadow-lg rounded-lg">
                    <div className="p-6 bg-blue-600 text-white rounded-lg">
                        <h1 className="text-3xl font-bold mb-4">
                            🎉 Loan Application Submitted!
                        </h1>
                        <p className="text-lg mb-4">
                            The below amount has been requested.
                        </p>
                        <h1 className="text-4xl font-bold mb-4">
                            {loanAmount} PHP
                        </h1>
                        <p className="text-sm">
                            Please wait for your employer's approval.
                        </p>
                    </div>

                    <h2 className="text-xl text-left font-bold">
                        Transaction Details
                    </h2>

                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Monthly Fee</span>
                        <span className="font-medium text-gray-600">
                            {calculateMonthlyPayment(
                                loanAmount,
                                selectedPlan,
                                interestRate
                            )}{" "}
                            PHP
                        </span>
                    </div>

                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Interest</span>
                        <span className="font-medium text-gray-600">
                            {interestRate} %
                        </span>
                    </div>

                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Installment Plan</span>
                        <span className="font-medium text-gray-600">
                            {selectedPlan} Months
                        </span>
                    </div>

                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Date & Time</span>
                        <span className="font-medium text-gray-600">
                            {new Date()
                                .toLocaleString("en-US", {
                                    month: "short",
                                    day: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })
                                .replace(",", "")}
                        </span>
                    </div>

                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Transaction ID </span>
                        <span className="font-medium text-gray-600">
                            {transactionId}
                        </span>
                    </div>

                    <button
                        className="mt-6 px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        onClick={() => handleCloseSuccessPage()}
                    >
                        Done
                    </button>
                </div>
            ) : (
                <>
                    {" "}
                    {user.user_type === "employee" && (
                        <div className="w-full max-w-3xl p-6 space-y-6 ml-10">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Please provide your details for your loan
                            </h1>
                            <p className="text-sm text-gray-600">
                                Please provide details for your loan
                            </p>

                            {/* Loan Amount */}
                            <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-md mt-6 inline-block">
                                Step 1
                            </span>
                            <p className="text-xl font-bold text-gray-900 mt-2">
                                Enter Loan Amount
                            </p>
                            <div className="flex justify-center items-center mt-2">
                                <span className="text-4xl font-bold text-gray-900 mr-2">
                                    ₱
                                </span>
                                <input
                                    type="number"
                                    value={loanAmount}
                                    onChange={handleLoanAmountChange}
                                    className="text-center text-4xl font-bold text-gray-900 w-64 border-none focus:outline-none"
                                />
                            </div>

                            {/* Installment Plan */}
                            <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-md mt-6 inline-block">
                                Step 2
                            </span>
                            <p className="text-xl font-bold text-gray-900 mt-2">
                                Select an Installment Plan
                            </p>
                            <div className="grid grid-cols-1 gap-4 mt-4">
                                {installmentPlans.map((plan) => (
                                    <div
                                        key={plan.months}
                                        className={`flex justify-between items-center border-2 rounded-lg p-4 cursor-pointer ${
                                            selectedPlan === plan.months
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-300"
                                        }`}
                                        onClick={() =>
                                            handleSelectPlan(
                                                plan.months,
                                                plan.interestRate
                                            )
                                        }
                                    >
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {plan.months} Months
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {plan.interestRate}% interest
                                                per month
                                            </p>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">
                                            ₱{plan.monthlyPayment} / mo.
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Loan Purpose */}
                            <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-md mt-6 inline-block">
                                Step 3
                            </span>
                            <p className="text-xl font-bold text-gray-900 mt-2">
                                Select your loan purpose
                            </p>
                            <select
                                value={loanPurpose}
                                onChange={(e) => setLoanPurpose(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                            >
                                {loanPurposes.map((purpose, index) => (
                                    <option key={index} value={purpose}>
                                        {purpose}
                                    </option>
                                ))}
                            </select>

                            <hr className="border-t-2 border-blue-500 mt-6" />

                            {/* Summary Section */}
                            <h1 className="text-2xl font-bold text-gray-900">
                                Summary
                            </h1>
                            <div className="flex justify-between text-lg font-semibold text-gray-900">
                                <span>Loan Amount</span>
                                <span>₱{loanAmount}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold text-gray-900">
                                <span>3% Processing Fee</span>
                                <span>₱{(loanAmount * 0.03).toFixed(2)}</span>
                            </div>
                            <hr className="border-t-2 border-gray-300 mt-4" />
                            <div className="flex justify-between text-lg font-bold text-gray-900 mt-2">
                                <span>Total Amount to Receive</span>
                                <span>₱{(loanAmount * 0.97).toFixed(2)}</span>
                            </div>

                            {/* Submit Button */}
                            <button
                                className="w-full mt-6 p-3 bg-blue-500 text-white text-lg font-semibold rounded-full hover:bg-blue-600"
                                onClick={handleGetLoan}
                            >
                                Review Your Loan
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Confirmation Screen */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 text-center">
                            Confirm Your Loan Application
                        </h2>
                        <p className="text-gray-700 text-center mt-2">
                            Please review your loan details carefully before
                            submitting. By proceeding, you agree to the
                            financial commitment outlined below.
                        </p>

                        <div className="mt-5 border-t border-gray-300 pt-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Repayment Schedule
                            </h3>
                            <ul className="space-y-2 mt-3">
                                {repaymentSchedule.map((payment, index) => {
                                    const dueDate = new Date();
                                    dueDate.setMonth(
                                        dueDate.getMonth() + index
                                    );
                                    const formattedMonth =
                                        dueDate.toLocaleDateString("en-US", {
                                            month: "long",
                                        });

                                    return (
                                        <li
                                            key={payment.month}
                                            className="flex justify-between text-gray-900 text-lg"
                                        >
                                            <span>{formattedMonth} 20th</span>
                                            <span>
                                                ₱
                                                {payment.amount.toLocaleString()}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="mt-5 p-3 bg-yellow-100 rounded-md text-sm text-yellow-800">
                            <p>
                                <strong>Important:</strong> These will be automatically deducted from your monthly salary. There is an option to pay for this in advanced.
                            </p>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button
                                className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                onClick={() => setShowConfirmation(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                onClick={handleConfirmLoan}
                            >
                                Confirm Loan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
