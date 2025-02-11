import { Link } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { Bell, Settings, Search } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/Components/Common/Sidebar";
import MainContent from "@/Components/Common/MainContent";

export default function Dashboard({ user }) {
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    return (
        <>
            <Head title={"Dashboard"} />

            {/* Main Layout */}
            <div className="flex bg-gray-100 h-screen">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-full">
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
                            <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-gray-700"
                                        >
                                             <Settings className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800" />
                                        </Link>
                          
                            <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800" />

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    className="text-gray-700 font-semibold flex items-center space-x-2"
                                    onClick={() =>
                                        setIsDropdownOpen(!isDropdownOpen)
                                    }
                                >
                                    <svg
                                        className="-me-0.5 ms-2 h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div className="text-left">
                                        <span className="block">
                                            {user.name}
                                        </span>
                                        <span className="block text-sm text-gray-500">
                                            {user.user_type}
                                        </span>
                                    </div>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-10">
                                        {/* <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-200"
                                        >
                                            Profile
                                        </Link> */}
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-200"
                                        >
                                            Settings
                                        </Link>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-200 w-full text-left"
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Main Content (Uses the new MainContent component) */}
                    <div className="flex-1 overflow-y-auto">
                        <MainContent activeTab={activeTab} user={user} setActiveTab={setActiveTab} />
                    </div>
                </div>
            </div>
        </>
    );
}
