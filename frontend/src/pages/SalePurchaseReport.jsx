 import { useEffect, useState } from "react";
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Scale,
  RefreshCw,
  ReceiptText,
} from "lucide-react";

import {
  SALE_PURCHASE_REPORT_API_URL,
  parseJson,
} from "../utils/api";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getCurrentMonth = () => String(new Date().getMonth() + 1);
const getCurrentYear = () => String(new Date().getFullYear());

const initialReport = {
  totalSale: 0,
  saleGST: 0,
  totalPurchase: 0,
  purchaseGST: 0,
  difference: 0,
  gstDifference: 0,
  saleCGST: 0,
  saleSGST: 0,
  saleIGST: 0,
  purchaseCGST: 0,
  purchaseSGST: 0,
  purchaseIGST: 0,
  saleCount: 0,
  purchaseCount: 0,
};

const SalePurchaseReport = () => {
  const [month, setMonth] = useState(getCurrentMonth);
  const [year, setYear] = useState(getCurrentYear);
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({ month, year });

      const response = await fetch(
        `${SALE_PURCHASE_REPORT_API_URL}?${params}`,
      );

      const result = await parseJson(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch Sale & Purchase Report",
        );
      }

      const data = result.data || {};

      setReport({
        totalSale: Number(data.totalSale) || 0,
        saleGST: Number(data.saleGST) || 0,
        totalPurchase: Number(data.totalPurchase) || 0,
        purchaseGST: Number(data.purchaseGST) || 0,
        difference: Number(data.difference) || 0,
        gstDifference: Number(data.gstDifference) || 0,

        saleCGST: Number(data.saleCGST) || 0,
        saleSGST: Number(data.saleSGST) || 0,
        saleIGST: Number(data.saleIGST) || 0,

        purchaseCGST: Number(data.purchaseCGST) || 0,
        purchaseSGST: Number(data.purchaseSGST) || 0,
        purchaseIGST: Number(data.purchaseIGST) || 0,

        saleCount: Number(data.saleCount) || 0,
        purchaseCount: Number(data.purchaseCount) || 0,
      });
    } catch (err) {
      console.error("Sale & Purchase Report Error:", err);
      setError(err.message || "Failed to fetch report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const summaryCards = [
    {
      title: "Total Sale",
      amount: report.totalSale,
      gstLabel: "Sale GST",
      gstAmount: report.saleGST,
      icon: TrendingUp,
      iconStyle:
        "bg-blue-50 text-deem-blue dark:bg-blue-950/40 dark:text-blue-300",
    },
    {
      title: "Total Purchase",
      amount: report.totalPurchase,
      gstLabel: "Purchase GST",
      gstAmount: report.purchaseGST,
      icon: TrendingDown,
      iconStyle:
        "bg-red-50 text-deem-red dark:bg-red-950/30 dark:text-red-300",
    },
    {
      title: "Sale - Purchase Difference",
      amount: report.difference,
      gstLabel: "GST Difference",
      gstAmount: report.gstDifference,
      icon: Scale,
      iconStyle:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    },
  ];

  const gstRows = [
    {
      label: "Sales",
      cgst: report.saleCGST,
      sgst: report.saleSGST,
      igst: report.saleIGST,
      total: report.saleGST,
      count: report.saleCount,
      style: "text-deem-blue dark:text-blue-300",
    },
    {
      label: "Purchases",
      cgst: report.purchaseCGST,
      sgst: report.purchaseSGST,
      igst: report.purchaseIGST,
      total: report.purchaseGST,
      count: report.purchaseCount,
      style: "text-deem-red dark:text-red-300",
    },
    {
      label: "Difference",
      cgst: report.saleCGST - report.purchaseCGST,
      sgst: report.saleSGST - report.purchaseSGST,
      igst: report.saleIGST - report.purchaseIGST,
      total: report.gstDifference,
      count: null,
      style: "font-semibold text-gray-800 dark:text-white",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-deem-blue dark:text-white sm:text-3xl">
            Sale & Purchase Report
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monthly sales, purchases and GST summary based on voucher
            transaction dates.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReport}
          disabled={loading}
          className="flex h-10 items-center gap-2 rounded-xl bg-deem-blue px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Month and Year Filters */}
      <div className="rounded-2xl border border-[#e6edf2] bg-white p-5 dark:border-gray-700 dark:bg-[#161b22]">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays
            size={19}
            className="text-deem-blue dark:text-blue-300"
          />
          <h2 className="font-semibold text-gray-800 dark:text-white">
            Report Period
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="report-month"
              className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              Month
            </label>

            <select
              id="report-month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-deem-red dark:border-gray-700 dark:bg-[#0b0f14] dark:text-gray-200"
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((name, index) => (
                <option key={name} value={String(index + 1)}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="report-year"
              className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              Year
            </label>

            <select
              id="report-year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-deem-red dark:border-gray-700 dark:bg-[#0b0f14] dark:text-gray-200"
            >
              {Array.from(
                { length: 10 },
                (_, index) => new Date().getFullYear() - index,
              ).map((value) => (
                <option key={value} value={String(value)}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#e6edf2] bg-white px-5 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-400">
          Loading report...
        </div>
      ) : !error ? (
        <>
 
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-[#e6edf2] bg-white p-5 dark:border-gray-700 dark:bg-[#161b22]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {card.title}
                    </p>

                    <div className={`rounded-xl p-3 ${card.iconStyle}`}>
                      <Icon size={21} />
                    </div>
                  </div>

                  <p className="mt-5 wrap-break-word text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(card.amount)}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {card.gstLabel}
                    </span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {formatCurrency(card.gstAmount)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    Selected month and year
                  </p>
                </div>
              );
            })}
          </div>
 
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#e6edf2] bg-white p-5 dark:border-gray-700 dark:bg-[#161b22]">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-deem-blue dark:bg-blue-950/40 dark:text-blue-300">
                  <ReceiptText size={21} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sale Vouchers
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
                    {report.saleCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e6edf2] bg-white p-5 dark:border-gray-700 dark:bg-[#161b22]">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-50 p-3 text-deem-red dark:bg-red-950/30 dark:text-red-300">
                  <ReceiptText size={21} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Purchase Vouchers
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
                    {report.purchaseCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
 
          <div className="overflow-hidden rounded-2xl border border-[#e6edf2] bg-white dark:border-gray-700 dark:bg-[#161b22]">
            <div className="border-b border-gray-100 p-5 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                GST Summary
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Sales and purchases GST breakup for the selected period.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-180 w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-[#0b0f14] dark:text-gray-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Particulars
                    </th>
                    <th className="px-5 py-4 text-right font-semibold">
                      CGST
                    </th>
                    <th className="px-5 py-4 text-right font-semibold">
                      SGST
                    </th>
                    <th className="px-5 py-4 text-right font-semibold">
                      IGST
                    </th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Total GST
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {gstRows.map((row) => (
                    <tr
                      key={row.label}
                      className="transition hover:bg-gray-50/70 dark:hover:bg-white/2"
                    >
                       
                      <td
                        className={`whitespace-nowrap px-5 py-4 ${row.style}`}
                      >
                        {row.label}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-gray-700 dark:text-gray-200">
                        {formatCurrency(row.cgst)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-gray-700 dark:text-gray-200">
                        {formatCurrency(row.sgst)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-gray-700 dark:text-gray-200">
                        {formatCurrency(row.igst)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(row.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

    </div>
  );
};

export default SalePurchaseReport;
