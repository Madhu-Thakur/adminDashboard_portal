import { Edit, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { downloadInvoicePdf } from "../../utils/downloadInvoicePdf";

import { useInvoice } from "../../context/InvoiceContext";
import { formatCurrency, formatDate } from "../../utils/invoiceUtils";

const InvoiceTable = () => {
  const navigate = useNavigate();

  const { invoices, loading, error } = useInvoice();

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalPages = Math.ceil(invoices.length / recordsPerPage);

  const startIndex = (currentPage - 1) * recordsPerPage;

  const currentInvoices = invoices.slice(
    startIndex,
    startIndex + recordsPerPage,
  );

  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

  const handleEdit = (id) => {
    navigate(`/invoices/add?id=${id}`);
  };

  const handleDownload = (invoice) => {
    downloadInvoicePdf(invoice.id);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-[#11161c]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading invoices...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-deem-red/20 bg-red-50 p-5 text-sm text-deem-red">
        {error}
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-[#11161c]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No invoices found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-200">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Customer
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Invoice Number
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Invoice Date
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                IGST
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Grand Total
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {currentInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/30"
              >
                <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                  {invoice.customer_name || "-"}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {invoice.invoice_number || "-"}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(
                    invoice.invoice_date
                      ? String(invoice.invoice_date).slice(0, 10)
                      : "",
                  )}
                </td>

                <td className="px-5 py-4 text-right text-sm text-gray-600 dark:text-gray-300">
                  {formatCurrency(invoice.igst)}
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {formatCurrency(invoice.grand_total)}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleEdit(invoice.id)}
                      title="Edit Invoice"
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
                      <Edit size={16} />
                    </button>

                    {/* Download */}
                    <button
                      type="button"
                      onClick={() => handleDownload(invoice)}
                      title="Download Invoice"
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
                      <Download size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 px-4 py-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + recordsPerPage, invoices.length)} of{" "}
              {invoices.length} invoices
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      currentPage === page
                        ? "border-deem-blue bg-deem-blue text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
                disabled={currentPage >= totalPages}
                className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceTable;
