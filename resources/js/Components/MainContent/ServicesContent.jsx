import { useState, useEffect, useMemo } from "react";
import { Clock, Construction } from "lucide-react";

export default function ServicesContent({ user }) {
    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="text-center max-w-2xl px-4">
                <div className="mb-8 flex justify-center">
                    <Construction className="w-24 h-24 text-blue-500 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold text-blue-900 mb-4">
                    Services Coming Soon
                </h1>
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <p className="text-blue-500 font-semibold">
                        Under Construction
                    </p>
                </div>
                <p className="text-gray-600 text-lg mb-8">
                    We're working hard to bring you exciting new services. Stay tuned for updates that will enhance your loan management experience.
                </p>
                <div className="p-6 bg-blue-50 rounded-lg shadow-sm border border-blue-100">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">
                        What to Expect
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="p-4 bg-white rounded-lg">
                            <h3 className="font-semibold text-blue-800">Enhanced Features</h3>
                            <p className="text-gray-600">New tools to manage your loans more effectively</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg">
                            <h3 className="font-semibold text-blue-800">Smart Analytics</h3>
                            <p className="text-gray-600">Detailed insights into your financial activities</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}