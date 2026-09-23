import React, { useEffect, useState } from "react";
import { EMPLOYEE_API_URL, parseJson } from "../../utils/api";
import {
  Pencil,
  ClipboardCheck,
  FileText,
  Phone,
  Mail,
  CalendarDays,
  UserRound,
} from "lucide-react";

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchEmployees = async () => {        
      try {
        const response = await fetch(EMPLOYEE_API_URL);
        const data = await parseJson(response);

        if (data.success) {
          setEmployees(data.employees);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* Photo */}
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Photo
              </th>

              {/* Employee ID */}
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Emp ID.
              </th>

              {/* Employee Name */}
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Employee Name
              </th>

              {/* Father Name */}
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Father Name
              </th>

              {/* Designation */}
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Designation
              </th>

              {/* Last Updated */}
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Last Updated
              </th>

              {/* Action */}
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading employees...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr
                  key={employee.eid}
                  className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  {/* Photo */}
                  <td className="px-4 py-4">
                    {employee.file ? (
                      <img
                        src={employee.file}
                        alt={employee.ename || "Employee"}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <UserRound size={18} strokeWidth={1.8} />
                      </div>
                    )}
                  </td>

                  {/* Employee ID */}
                  <td className="px-4 py-4 text-gray-700">
                    {employee.eid}
                  </td>

                  {/* Employee Name */}
                  <td className="px-4 py-4 text-gray-700">
                    {employee.ename || "-"}
                  </td>

                  {/* Father Name */}
                  <td className="px-4 py-4 text-gray-700">
                    {employee.fname || "-"}
                  </td>

                  {/* Designation */}
                  <td className="px-4 py-4 text-gray-700">
                    {employee.designation || "-"}
                  </td>

                  {/* Last Updated */}
                  <td className="px-4 py-4 text-gray-500">
                    {employee.last_update
                      ? new Date(employee.last_update).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">

                      {/* Edit */}
                      <button
                        type="button"
                        title="Edit"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-deem-blue hover:border-deem-blue hover:bg-gray-50 transition"
                      >
                        <Pencil size={17} strokeWidth={1.8} />
                      </button>

                      {/* Attendance */}
                      <button
                        type="button"
                        title="Attendance"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-deem-blue hover:border-deem-blue hover:bg-gray-50 transition"
                      >
                        <ClipboardCheck size={17} strokeWidth={1.8} />
                      </button>

                      {/* Documents */}
                      <button
                        type="button"
                        title="Documents"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-deem-blue hover:border-deem-blue hover:bg-gray-50 transition"
                      >
                        <FileText size={17} strokeWidth={1.8} />
                      </button>

                      {/* Phone */}
                      <button
                        type="button"
                        title="Phone"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-deem-blue hover:border-deem-blue hover:bg-gray-50 transition"
                      >
                        <Phone size={17} strokeWidth={1.8} />
                      </button>

                      {/* Email */}
                      <button
                        type="button"
                        title="Email"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-deem-blue hover:border-deem-blue hover:bg-gray-50 transition"
                      >
                        <Mail size={17} strokeWidth={1.8} />
                      </button>

                      {/* Leave */}
                      <button
                        type="button"
                        title="Leave"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-deem-blue hover:border-deem-blue hover:bg-gray-50 transition"
                      >
                        <CalendarDays size={17} strokeWidth={1.8} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;