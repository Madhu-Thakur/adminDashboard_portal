import { FileText, Paperclip } from "lucide-react";

const formatDate = (date) => {
  if (!date) return "-";

  const value = String(date).slice(0, 10);
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return "-";

  return `${day}/${month}/${year.slice(-2)}`;
};

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const PurchaseTable = ({ purchases = [] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1050px]">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Company Name
            </th>

            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Invoice Number
            </th>

            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Invoice Date
            </th>

            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              CGST
            </th>

            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              SGST
            </th>

            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              IGST
            </th>

            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Amount
            </th>

            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Attachment
            </th>
          </tr>
        </thead>

        <tbody>
          {purchases.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                <div className="flex flex-col items-center justify-center">
                  <FileText
                    size={36}
                    className="mb-3 text-gray-300 dark:text-gray-600"
                  />

                  <p className="font-medium">
                    No purchase entries found
                  </p>

                  <p className="mt-1 text-xs">
                    Click "Add Purchase" to create a purchase entry.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            purchases.map((purchase) => (
              <tr
                key={purchase.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-gray-800/30"
              >
                <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-gray-100">
                  {purchase.cname || "-"}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {purchase.ino || "-"}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(purchase.idate)}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {formatCurrency(purchase.cgst)}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {formatCurrency(purchase.sgst)}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {formatCurrency(purchase.igst)}
                </td>

                <td className="px-5 py-4 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {formatCurrency(purchase.tamount)}
                </td>

                <td className="px-5 py-4">
                  {purchase.file ? (
                    <a
                      href={purchase.file}
                      target="_blank"
                      rel="noreferrer"
                      title="View attachment"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-deem-red hover:text-deem-red dark:border-gray-700 dark:text-gray-300"
                    >
                      <Paperclip size={16} />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">
                      -
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseTable;