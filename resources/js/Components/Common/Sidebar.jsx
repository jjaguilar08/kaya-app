import {
    Home,
    Hand,
    DollarSign,
    Wrench,
    Settings,
    Banknote,
    Users,
} from "lucide-react";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Sidebar({ activeTab, setActiveTab, user }) {
    // Define menu items based on user type
    const employeeMenu = [
        { name: "Dashboard", icon: <Home size={18} /> },
        { name: "Loan Application", icon: <Hand size={18} /> },
        { name: "My Loans", icon: <DollarSign size={18} /> },
        { name: "Repayments", icon: <Banknote size={18} /> },
        { name: "Services", icon: <Wrench size={18} /> },
    ];

    const employerMenu = [
        { name: "Dashboard", icon: <Home size={18} /> },
        { name: "Manage Employees", icon: <Users size={18} /> },
        { name: "Loans & Applications", icon: <Hand size={18} /> },
        { name: "Repayment Requests", icon: <Banknote size={18} /> },
    ];

    const adminMenu = [
        { name: "Dashboard", icon: <Home size={18} /> },
        { name: "Loans & Applications", icon: <Hand size={18} /> },
    ];

    const menuItems =
        user.user_type === "employer"
            ? employerMenu
            : user.user_type === "admin"
            ? adminMenu
            : employeeMenu;

    return (
        <aside className="w-64 bg-white shadow-md flex flex-col">
            {/* Logo */}
            <div className="p-4 text-center border-b">
                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <button
                                onClick={() => setActiveTab(item.name)}
                                className={`flex items-center space-x-3 px-4 py-2 rounded relative w-full text-left ${
                                    activeTab === item.name
                                        ? "text-blue-600 font-medium bg-blue-50 border-r-4 border-blue-600"
                                        : "text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
