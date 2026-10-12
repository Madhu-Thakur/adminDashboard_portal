import { useEffect, useState } from "react";
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Scale,
  RefreshCw,
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

const SalePurchaseReport = () => {
  const [month, setMonth] = useState(getCurrentMonth);
  const [year, setYear] = useState(getCurrentYear);

  const [report, setReport] = useState({
    totalSale: 0,
    totalPurchase: 0,
    difference: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        month,
        year,
      });

      const response = await fetch(
        `${SALE_PURCHASE_REPORT_API_URL}?${params}`,
      );

      const result = await parseJson(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch Sale & Purchase Report",
        );
      }

      setReport({
        totalSale: Number(result.data?.totalSale) || 0,
        totalPurchase: Number(result.data?.totalPurchase) || 0,
        difference: Number(result.data?.difference) || 0,
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
      icon: TrendingUp,
      iconStyle:
        "bg-blue-50 text-deem-blue dark:bg-blue-950/40 dark:text-blue-300",
    },
    {
      title: "Total Purchase",
      amount: report.totalPurchase,
      icon: TrendingDown,
      iconStyle:
        "bg-red-50 text-deem-red dark:bg-red-950/30 dark:text-red-300",
    },
    {
      title: "Sale - Purchase Difference",
      amount: report.difference,
      icon: Scale,
      iconStyle:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
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
            Monthly summary based on voucher transaction dates and amounts.
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

      {/* Error Message */}
      {error && (
        <div className="whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {loading ? (
        <div className="rounded-2xl border border-[#e6edf2] bg-white px-5 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-400">
          Loading report...
        </div>
      ) : !error ? (
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

                <p className="mt-5 break-words text-2xl font-bold text-gray-800 dark:text-white">
                  {formatCurrency(card.amount)}
                </p>

                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Selected month and year
                </p>
              </div>
            );
          })}
        </div>
      ) : null}
{/* 
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Note: Difference is Total Sale minus Total Purchase. It does not
        represent net profit because expenses are not included.
      </p> */}
    </div>
  );
};

export default SalePurchaseReport;