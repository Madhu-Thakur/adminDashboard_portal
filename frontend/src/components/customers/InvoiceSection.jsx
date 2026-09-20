import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { INVOICE_API_URL } from "../../utils/api";

const InvoiceSection = ({ customerId }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    if (!customerId) {
      setInvoices([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${INVOICE_API_URL}/customer/${customerId}`,
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch invoices",
        );
      }

      setInvoices(
        Array.isArray(result.data) ? result.data : [],
      );
    } catch (err) {
      console.error("Fetch Customer Invoices Error:", err);

      setInvoices([]);
      setError(
        err.message || "Failed to fetch customer invoices.",
      );
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const formatDate = (date) => {
    if (!date) return "-";

    const value = String(date).slice(0, 10);
    const parts = value.split("-");

    if (parts.length !== 3) return value;

    const [year, month, day] = parts;

    return `${day}/${month}/${year.slice(2)}`;
  };

  const formatAmount = (amount) => {
    const value = Number(amount);

    if (!Number.isFinite(value)) return "₹0.00";

    return `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";

      case "Partial":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";

      case "Pending":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400";

      case "Overdue":
        return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";

      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const hasInvoices = invoices.length > 0;

  return (
    <div>
    
      <button
        type="button"
        onClick={() => {
          if (hasInvoices) {
            setIsOpen((prev) => !prev);
          }
        }}
        disabled={!hasInvoices}
        className={`w-full flex items-center justify-between text-left ${
          hasInvoices
            ? "cursor-pointer"
            : "cursor-not-allowed"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              hasInvoices
                ? "bg-deem-blue/10 text-deem-blue dark:bg-deem-blue/20 dark:text-blue-300"
                : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
            }`}
          >
            <FileText size={18} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-lg font-semibold ${
                  hasInvoices
                    ? "text-deem-blue dark:text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                Invoices
              </h2>

              {hasInvoices && (
                <span className="rounded-full bg-deem-blue/10 px-2.5 py-1 text-xs font-medium text-deem-blue dark:bg-deem-blue/20 dark:text-blue-300">
                  {invoices.length}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {loading
                ? "Loading invoices..."
                : hasInvoices
                  ? "Invoices created for this customer"
                  : "No invoices available"}
            </p>
          </div>
        </div>

        {hasInvoices && (
          <div className="text-gray-400">
            {isOpen ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </div>
        )}
      </button>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-deem-red dark:border-red-900/40 dark:bg-red-950/20">
          {error}
        </div>
      )}

      {isOpen && hasInvoices && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#e6edf2] dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-[#0b0f14] dark:text-gray-400">
                  <th className="px-5 py-3.5">
                    Invoice No.
                  </th>

                  <th className="px-5 py-3.5">
                    Date
                  </th>

                  <th className="px-5 py-3.5">
                    Payment Mode
                  </th>

                  <th className="px-5 py-3.5">
                    Total
                  </th>

                  <th className="px-5 py-3.5">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-5 py-4 font-medium text-deem-blue dark:text-white">
                      {invoice.invoice_number || "-"}
                    </td>

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {formatDate(invoice.invoice_date)}
                    </td>

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {invoice.payment_mode || "-"}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-200">
                      {formatAmount(invoice.grand_total)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          invoice.payment_status,
                        )}`}
                      >
                        {invoice.payment_status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceSection;