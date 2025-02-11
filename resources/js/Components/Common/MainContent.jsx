import LoanApplicationContent from "../MainContent/LoanApplicationContent";
import MyLoansContent from "../MainContent/MyLoansContent";
import DashboardContent from "../MainContent/DashboardContent";
import SettingsContent from "@/Pages/Profile/Edit";
import ServicesContent from "../MainContent/ServicesContent";
import RepaymentsContent from "../MainContent/RepaymentsContent";
import EmployerDashboard from "../Employer/EmployerDashboard";
import EmployerLoanApplications from "../Employer/EmployerLoanApplication";
import EmployerRepayments from "../Employer/EmployerRepayments";
import EmployerEmployees from "../Employer/EmployerEmployees";
import AdminDashboard from "../Admin/AdminDashboard";
import AdminLoanApplication from "../Admin/AdminLoanApplication";

export default function MainContent({ activeTab, user, setActiveTab }) {
    // Employee Content Map
    const employeeContentMap = {
        Dashboard: <DashboardContent user={user} setActiveTab={setActiveTab} />,
        "Loan Application": (
            <LoanApplicationContent user={user} setActiveTab={setActiveTab} />
        ),
        "My Loans": <MyLoansContent user={user} setActiveTab={setActiveTab} />,
        Repayments: <RepaymentsContent user={user} />,
        Services: <ServicesContent />,
        Settings: <SettingsContent />,
    };

    // Employer Content Map
    const employerContentMap = {
        Dashboard: <EmployerDashboard user={user} />,
        "Manage Employees": <EmployerEmployees user={user} />,
        "Loans & Applications": <EmployerLoanApplications user={user} />,
        "Repayment Requests": <EmployerRepayments user={user} />,
    };

    // Admin Content Map
    const adminContentMap = {
        Dashboard: <AdminDashboard user={user}/>,
        "Loans & Applications": <AdminLoanApplication user={user} />
    };

    // Select the appropriate content map
    const contentMap =
        user.user_type === "employer"
            ? employerContentMap
            : user.user_type === "admin"
            ? adminContentMap
            : employeeContentMap;

    return (
        <main className="flex-1 p-6">
            <div className="bg-white shadow-sm rounded-lg p-6 h-full">
                {contentMap[activeTab] || (
                    <h1 className="text-2xl">Not Found</h1>
                )}
            </div>
        </main>
    );
}
