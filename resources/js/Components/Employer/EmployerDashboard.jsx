import {
    Clock,
    Construction,
    BarChart3,
    Users,
    ShieldCheck,
    Banknote,
} from "lucide-react";

export default function EmployerDashboard({ user }) {
    return (
        <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 p-6">
            <div className="text-center max-w-3xl px-6 py-8 bg-white shadow-lg rounded-xl border border-gray-200">
                {/* Icon Animation */}
                <div className="mb-6 flex justify-center">
                    <Construction className="w-20 h-20 text-blue-500 animate-bounce" />
                </div>

                {/* Title and Subtitle */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Employer Dashboard Coming Soon
                </h1>
                <div className="flex items-center justify-center gap-2 mb-4 text-blue-600 font-medium">
                    <Clock className="w-5 h-5" />
                    <span>Under Development – Stay Tuned!</span>
                </div>
                <p className="text-gray-600 text-lg">
                    We're working on powerful new tools to make loan and
                    employee management effortless. Get ready for a streamlined,
                    data-driven experience designed for employers like you.
                </p>

                {/* Feature Highlights */}
                <div className="mt-8 p-6 bg-blue-50 rounded-lg shadow-sm border border-blue-200">
                    <h2 className="text-2xl font-semibold text-blue-900 mb-4">
                        What's Coming?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <FeatureCard
                            icon={<Users className="w-6 h-6 text-blue-600" />}
                            title="Employee Loan Management"
                            description="Easily track, approve, and manage employee loans in one place."
                        />
                        <FeatureCard
                            icon={
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                            }
                            title="Advanced Analytics"
                            description="Gain insights with smart financial analytics and reports."
                        />
                    </div>
                </div>

                {/* Closing Statement */}
                <p className="mt-8 text-gray-600 text-sm">
                    Thank you for your patience! We’re committed to delivering
                    the best experience for employers. Stay tuned for updates.
                </p>
            </div>
        </div>
    );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
    return (
        <div className="p-4 bg-white rounded-lg shadow-sm flex items-start space-x-3 border border-gray-200">
            <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>
            <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
            </div>
        </div>
    );
}
