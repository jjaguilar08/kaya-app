import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Bell, Settings, Search } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/Components/Common/Sidebar";

// Content Components
const DashboardContent = () => <h1 className="text-2xl">Dashboard</h1>;
const LoanApplicationContent = () => <h1 className="text-2xl">Loan Application</h1>;
const MyLoansContent = () => <h1 className="text-2xl">My Loans</h1>;
const ServicesContent = () => <h1 className="text-2xl">Services</h1>;
const SettingsContent = () => <h1 className="text-2xl">Settings</h1>;

export default function Dashboard({ user, employer }) {
    const [activeTab, setActiveTab] = useState("Dashboard");

    // Define content mapping
    const contentMap = {
        "Dashboard": <DashboardContent />,
        "Loan Application": <LoanApplicationContent />,
        "My Loans": <MyLoansContent />,
        "Services": <ServicesContent />,
        "Settings": <SettingsContent />,
    };

    return (
        <>
            <Head title="Dashboard" />

            {/* Main Layout */}
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar with Active State Control */}
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Top Navbar */}
                    <header className="bg-white shadow flex items-center justify-between px-6 py-4">
                        {/* Left: Dashboard Title */}
                        <h2 className="text-xl font-semibold text-gray-800">
                            {activeTab}
                        </h2>

                        {/* Right: Search, Settings, Notification, Profile */}
                        <div className="flex items-center space-x-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring"
                                />
                                <Search className="absolute right-2 top-2 h-4 w-4 text-gray-500" />
                            </div>

                            {/* Icons */}
                            <Settings className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800" />
                            <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800" />

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button className="text-gray-700 font-semibold flex items-center space-x-2">
                                    <span>{user.name}</span>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Main Content - Updates Dynamically */}
                    <main className="p-6">
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            {contentMap[activeTab]}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
