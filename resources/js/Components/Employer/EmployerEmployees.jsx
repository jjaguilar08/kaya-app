import { useState, useEffect, useMemo } from "react";
import { useTable } from "react-table";
import { Users } from "lucide-react";

export default function EmployerEmployees({ user }) {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch(`/api/users/employer/${user.id}`);
                const data = await response.json();
                setEmployees(data.data);
            } catch (error) {
                console.error("Failed to fetch employees:", error);
            }
        };

        fetchEmployees();
    }, [user.id]);

    const columns = useMemo(
        () => [
            {
                Header: "ID",
                accessor: "id",
                Cell: ({ value }) => <span className="font-medium">#{value}</span>
            },
            {
                Header: "Name",
                accessor: "name",
                Cell: ({ value }) => (
                    <div className="font-medium text-gray-900">{value}</div>
                )
            },
            {
                Header: "Email",
                accessor: "email",
                Cell: ({ value }) => (
                    <div className="text-gray-600">{value}</div>
                )
            },
            {
                Header: "Mobile",
                accessor: "mobile",
                Cell: ({ value }) => (
                    <div className="font-mono text-gray-600">{value}</div>
                )
            },
            {
                Header: "Status",
                accessor: "email_verified_at",
                Cell: ({ value }) => (
                    <span
                        className={`px-2 py-1 rounded-full text-sm ${
                            value
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                        {value ? "Verified" : "Pending Verification"}
                    </span>
                )
            },
            {
                Header: "Joined Date",
                accessor: "created_at",
                Cell: ({ value }) => (
                    <div className="text-gray-600">
                        {new Date(value).toLocaleDateString()}
                    </div>
                )
            }
        ],
        []
    );

    const data = useMemo(() => employees, [employees]);
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({ columns, data });

    return (
        <div className="flex justify-center items-center">
            <div className="w-full max-w-6xl p-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
                        <p className="text-gray-600 mt-1">Manage your employees and their accounts</p>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Total: {employees.length}</span>
                    </div>
                </div>

                {employees.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 text-lg">
                        No employees found.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table
                            {...getTableProps()}
                            className="min-w-full border-collapse"
                        >
                            <thead className="bg-gray-50">
                                {headerGroups.map((headerGroup) => (
                                    <tr
                                        {...headerGroup.getHeaderGroupProps()}
                                        className="border-b border-gray-200"
                                    >
                                        {headerGroup.headers.map((column) => (
                                            <th
                                                {...column.getHeaderProps()}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {column.render("Header")}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody
                                {...getTableBodyProps()}
                                className="bg-white divide-y divide-gray-200"
                            >
                                {rows.map((row) => {
                                    prepareRow(row);
                                    return (
                                        <tr
                                            {...row.getRowProps()}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            {row.cells.map((cell) => (
                                                <td
                                                    {...cell.getCellProps()}
                                                    className="px-6 py-4 whitespace-nowrap"
                                                >
                                                    {cell.render("Cell")}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}