 import React, { useEffect, useMemo, useState } from "react";
import { EMPLOYEE_API_URL, parseJson } from "../../utils/api";
import {
  Pencil,
  ClipboardCheck,
  FileText,
  Phone,
  Mail,
  UserRound,
  X,
} from "lucide-react";

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [contactModal, setContactModal] = useState({
    type: null,
    employee: null,
  });

  const [copyMessage, setCopyMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const designations = useMemo(
    () =>
      [...new Set(
        employees
          .map((employee) => employee.designation?.trim())
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b)),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch = [
        employee.eid,
        employee.ename,
        employee.fname,
        employee.designation,
      ].some((value) => String(value ?? "").toLowerCase().includes(query));

      const matchesDesignation =
        !selectedDesignation ||
        employee.designation?.trim() === selectedDesignation;

      return matchesSearch && matchesDesignation;
    });
  }, [employees, search, selectedDesignation]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCopyContact = async (value, label) => {
    if (!value) {
      setCopyMessage(`${label} not available.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(String(value));
      setCopyMessage(`${label} copied successfully!`);
    } catch {
      setCopyMessage("Unable to copy. Please copy it manually.");
    }
  };

  return (
    <>
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search employee ID, name, father name..."
          aria-label="Search employees"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-deeem-blue sm:flex-1"
        />

        <select
          value={selectedDesignation}
          onChange={(e) => {
            setSelectedDesignation(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by designation"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-deeem-blue sm:w-56"
        >
          <option value="">All Designations</option>
          {designations.map((designation) => (
            <option key={designation} value={designation}>
              {designation}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Photo
              </th>

              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Emp ID.
              </th>
 
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Employee Name
              </th>
 
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Father Name
              </th>
 
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Designation
              </th>
 
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Last Updated
              </th>
 
              <th className="px-4 py-4 text-left font-medium text-gray-700">
                Action
              </th>
            </tr>
          </thead>
 
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  Loading employees...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((employee) => (
                <tr
                  key={employee.eid}
                  className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
 
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
 
                  <td className="px-4 py-4 text-gray-700">{employee.eid}</td>
 
                  <td className="px-4 py-4 text-gray-700">
                    {employee.ename || "-"}
                  </td>
 
                  <td className="px-4 py-4 text-gray-700">
                    {employee.fname || "-"}
                  </td>
 
                  <td className="px-4 py-4 text-gray-700">
                    {employee.designation || "-"}
                  </td>
 
                  <td className="px-4 py-4 text-gray-500">
                    {employee.last_update
                      ? new Date(employee.last_update).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
 
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
 
                      <button
                        type="button"
                        title="Edit"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-deem-blue hover:border-deem-blue hover:bg-gray-50 transition"
                      >
                        <Pencil size={17} strokeWidth={1.8} />
                      </button>
 
                      <button
                        type="button"
                        title="Attendance"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-deem-blue hover:border-deem-blue hover:bg-gray-50 transition"
                      >
                        <ClipboardCheck size={17} strokeWidth={1.8} />
                      </button>
 
                      <button
                        type="button"
                        title="Documents"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-deem-blue hover:border-deem-blue hover:bg-gray-50 transition"
                      >
                        <FileText size={17} strokeWidth={1.8} />
                      </button>

                      <button
                        type="button"
                        title="Phone"
                        onClick={() => {
                          setCopyMessage("");
                          setContactModal({ type: "phone", employee });
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-deem-blue hover:border-deem-blue hover:bg-gray-50 transition"
                      >
                        <Phone size={17} strokeWidth={1.8} />
                      </button>

                      <button
                        type="button"
                        title="Email"
                        onClick={() => {
                          setCopyMessage("");
                          setContactModal({ type: "email", employee });
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-deem-blue hover:border-deem-blue hover:bg-gray-50 transition"
                      >
                        <Mail size={17} strokeWidth={1.8} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredEmployees.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                aria-current={currentPage === page ? "page" : undefined}
                onClick={() => setCurrentPage(page)}
                className={`min-w-9 rounded-lg border px-3 py-2 text-sm ${
                  currentPage === page
                    ? "border-deem-blue bg-deem-blue text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>

      {/* Employee Contact Modal */}
    {contactModal.type && contactModal.employee && (
      <div
        className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4"
        onClick={() => {
          setContactModal({ type: null, employee: null });
          setCopyMessage("");
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="employee-contact-modal-title"
          className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h3
                id="employee-contact-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {contactModal.type === "phone"
                  ? "Phone Number"
                  : "Email Employee"}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {contactModal.employee.ename || "Employee"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setContactModal({ type: null, employee: null });
                setCopyMessage("");
              }}
              aria-label="Close contact modal"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 p-6">
            <label className="block text-sm font-medium text-gray-700">
              {contactModal.type === "phone"
                ? "Mobile Number"
                : "Email Address"}
            </label>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="break-all text-sm font-medium text-gray-900">
                {contactModal.type === "phone"
                  ? contactModal.employee.mobile ||
                    "No phone number available"
                  : contactModal.employee.email ||
                    "No email address available"}
              </div>
            </div>

            {contactModal.type === "phone" ? (
              <button
                type="button"
                disabled={!contactModal.employee.mobile}
                onClick={() =>
                  handleCopyContact(
                    contactModal.employee.mobile,
                    "Phone number"
                  )
                }
                className="flex w-full items-center justify-center rounded-xl bg-deem-blue px-4 py-3 text-sm font-medium text-white transition hover:bg-deem-blue/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Copy Number
              </button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={!contactModal.employee.email}
                  onClick={() =>
                    handleCopyContact(
                      contactModal.employee.email,
                      "Email address"
                    )
                  }
                  className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Copy Email
                </button>

                <button
                  type="button"
                  disabled={!contactModal.employee.email}
                  onClick={() => {
                    window.location.href =
                      `mailto:${contactModal.employee.email}`;
                  }}
                  className="flex flex-1 items-center justify-center rounded-xl bg-deem-blue px-4 py-3 text-sm font-medium text-white transition hover:bg-deem-blue/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Open Email App
                </button>
              </div>
            )}

            {copyMessage && (
              <p role="status" className="text-sm text-gray-600">
                {copyMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    )}
</>
  );
};

export default EmployeeTable;
