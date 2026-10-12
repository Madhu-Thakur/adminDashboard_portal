import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { CUSTOMER_API_URL, parseJson } from "../utils/api";

const PAGE_SIZE = 8;

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Customers = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(CUSTOMER_API_URL);
      const result = await parseJson(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch customers");
      }

      setCustomers(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Fetch Customers Error:", err);
      setError(err.message || "Failed to fetch customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !searchText ||
        customer.customer_name?.toLowerCase().includes(searchText) ||
        customer.company_name?.toLowerCase().includes(searchText) ||
        customer.email?.toLowerCase().includes(searchText) ||
        customer.phone?.toLowerCase().includes(searchText) ||
        String(customer.id).includes(searchText);

      const matchesStatus =
        statusFilter === "all" || String(customer.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / PAGE_SIZE),
  );

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

 const handleToggleStatus = async (customer) => {
  const currentStatus = Number(customer.status) === 1 ? 1 : 0;
  const nextStatus = currentStatus === 1 ? 0 : 1;

  try {
    setError("");

    // Update UI immediately
    setCustomers((prev) =>
      prev.map((item) =>
        item.id === customer.id
          ? { ...item, status: nextStatus }
          : item,
      ),
    );

    const response = await fetch(`${CUSTOMER_API_URL}/${customer.id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: nextStatus,
      }),
    });

    const result = await parseJson(response);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to update customer status");
    }
  } catch (err) {
    console.error("Update Customer Status Error:", err);

    // Rollback UI if API fails
    setCustomers((prev) =>
      prev.map((item) =>
        item.id === customer.id
          ? { ...item, status: currentStatus }
          : item,
      ),
    );

    setError(err.message || "Failed to update customer status.");
  }
};
  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.customer_name}?`,
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${CUSTOMER_API_URL}/${customer.id}`, {
        method: "DELETE",
      });

      const result = await parseJson(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete customer");
      }

      setCustomers((prev) => prev.filter((item) => item.id !== customer.id));

      setCurrentPage((page) =>
        Math.min(
          page,
          Math.max(
            1,
            Math.ceil((filteredCustomers.length - 1) / PAGE_SIZE),
          ),
        ),
      );
    } catch (err) {
      console.error("Delete Customer Error:", err);
      setError(err.message || "Failed to delete customer.");
    }
  };

  const handleEdit = (customerId) => {
    navigate(`/customers/edit/${customerId}`);
  };

  const handleView = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-deem-blue dark:text-white">
            Customers
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate("/customers/add")}
          className="flex items-center gap-2 px-5 h-11 bg-deem-red hover:bg-[#d94335] text-white rounded-xl font-medium text-sm transition cursor-pointer"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-deem-red/20 bg-red-50 px-4 py-3 text-sm text-deem-red">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#e6edf2] dark:border-gray-700 overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-700">
          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search customers..."
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0b0f14] text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-deem-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/30 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0b0f14] text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-deem-red transition cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0b0f14] text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-5 py-3.5">Customer ID</th>
                <th className="px-5 py-3.5">Customer Name</th>
                <th className="px-5 py-3.5">Company Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5 text-right">Balance</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="w-[160px] px-5 py-3.5 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No customers found
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="px-5 py-4 font-medium text-deem-blue">
                      {customer.id}
                    </td>

                    <td className="px-5 py-4 text-gray-700 dark:text-gray-200">
                      {customer.customer_name}
                    </td>

                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {customer.company_name || "-"}
                    </td>

                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {customer.email}
                    </td>

                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {customer.phone}
                    </td>

                    <td
                      className={`px-5 py-4 text-right font-medium ${
                        Number(customer.balance || 0) > 0
                          ? "text-deem-red"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(customer.balance)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={Number(customer.status) === 1}
                          title={
                            Number(customer.status) === 1
                              ? "Active — click to set Inactive"
                              : "Inactive — click to set Active"
                          }
                          onClick={() => handleToggleStatus(customer)}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition cursor-pointer ${
                            Number(customer.status) === 1
                              ? "bg-emerald-500"
                              : "bg-gray-300 dark:bg-gray-700"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                              Number(customer.status) === 1
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>

                        <span
                          className={`text-xs font-medium ${
                            Number(customer.status) === 1
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {Number(customer.status) === 1
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </td>

                    <td className="w-40 px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          title="View"
                          onClick={() => handleView(customer.id)}
                          className="
                            flex
                            h-9
                            w-9
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-gray-200
                            text-gray-500
                            transition
                            hover:border-deem-blue
                            hover:text-deem-blue
                            dark:border-gray-700
                            dark:text-gray-400
                          "
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Edit"
                          onClick={() => handleEdit(customer.id)}
                          className="
                            flex
                            h-9
                            w-9
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-gray-200
                            text-gray-500
                            transition
                            hover:border-deem-red
                            hover:text-deem-red
                            dark:border-gray-700
                            dark:text-gray-400
                          "
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDelete(customer)}
                          className="
                            flex
                            h-9
                            w-9
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-gray-200
                            text-gray-500
                            transition
                            hover:border-deem-red
                            hover:text-deem-red
                            dark:border-gray-700
                            dark:text-gray-400
                          "
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            {filteredCustomers.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}{" "}
            - {Math.min(currentPage * PAGE_SIZE, filteredCustomers.length)} of{" "}
            {filteredCustomers.length} customers
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={17} />
            </button>

            {filteredCustomers.length > 0 &&
              Array.from(
                { length: totalPages },
                (_, index) => index + 1,
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer ${
                    currentPage === page
                      ? "bg-deem-blue text-white"
                      : "border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages),
                )
              }
              disabled={currentPage >= totalPages}
              className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;