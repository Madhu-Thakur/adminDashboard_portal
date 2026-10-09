import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Save } from "lucide-react";

import {
  VOUCHER_API_URL,
  AVAILABLE_SALE_INVOICES_URL,
  parseJson,
} from "../utils/api";

import { validateVoucher } from "../validation/voucherValidation";

const VOUCHER_TYPES = ["Sale", "Purchase"];

const TRANSACTION_TYPES = [
  "UPI",
  "Bank Transfer",
  "Cash",
  "Cheque",
  "Card",
  "Other",
];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Voucher = () => {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [availableInvoices, setAvailableInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Purchase selection
  const [availablePurchases, setAvailablePurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  const [voucherType, setVoucherType] = useState("");

  const [invoiceId, setInvoiceId] = useState("");
  const [purchaseId, setPurchaseId] = useState("");

  const [transactionType, setTransactionType] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [narration, setNarration] = useState("");

  const [amount, setAmount] = useState("");
  const [cgst, setCgst] = useState("");
  const [sgst, setSgst] = useState("");
  const [igst, setIgst] = useState("");

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
 
  const fetchAvailableInvoices = async () => {
    try {
      setLoadingInvoices(true);
      setSubmitError("");

      const response = await fetch(AVAILABLE_SALE_INVOICES_URL);
      const result = await parseJson(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch available invoices"
        );
      }

      setAvailableInvoices(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (error) {
      console.error("Fetch Available Invoices Error:", error);

      setAvailableInvoices([]);
      setSubmitError(error.message);
    } finally {
      setLoadingInvoices(false);
    }
  };
 
  const fetchAvailablePurchases = async () => {
    try {
      setLoadingPurchases(true);
      setSubmitError("");

      const response = await fetch(
        `${VOUCHER_API_URL}/available-purchases`
      );

      const result = await parseJson(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch available purchases"
        );
      }

      setAvailablePurchases(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (error) {
      console.error("Fetch Available Purchases Error:", error);

      setAvailablePurchases([]);
      setSubmitError(error.message);
    } finally {
      setLoadingPurchases(false);
    }
  };

  useEffect(() => {
    fetchAvailableInvoices();
    fetchAvailablePurchases();
  }, []);

  const selectedInvoiceData = availableInvoices.find(
    (inv) => String(inv.id) === String(invoiceId)
  );

  const selectedPurchaseData = availablePurchases.find(
    (purchase) => String(purchase.id) === String(purchaseId)
  );

  const inputClass = `
    w-full h-11 px-4 rounded-xl border
    border-gray-200 dark:border-gray-700
    focus:border-deem-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/30
    bg-white dark:bg-[#0b0f14]
    text-sm text-gray-700 dark:text-gray-200
    outline-none transition
  `;

  const selectClass = `${inputClass} cursor-pointer`;

  const readOnlyClass = `
    w-full h-11 px-4 rounded-xl border
    border-gray-200 dark:border-gray-700
    bg-gray-50 dark:bg-gray-800/50
    text-sm text-gray-600 dark:text-gray-400
    outline-none
  `;

  const textareaClass = `
    w-full px-4 py-3 rounded-xl border
    border-gray-200 dark:border-gray-700
    focus:border-deem-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/30
    bg-white dark:bg-[#0b0f14]
    text-sm text-gray-700 dark:text-gray-200
    outline-none transition resize-y
  `;

  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2";

  const errorClass = "mt-1 text-xs text-deem-red";

  const requiredMark = <span className="text-deem-red">*</span>;
 
  const resetForm = () => {
    setVoucherType("");

    setInvoiceId("");
    setPurchaseId("");

    setTransactionType("");
    setTransactionDate("");
    setTransactionNumber("");
    setNarration("");

    setAmount("");
    setCgst("");
    setSgst("");
    setIgst("");

    setErrors({});
    setSubmitError("");
  };
 
  const renderTransactionFields = () => (
    <>
      <div>
        <label className={labelClass}>
          Transaction Type {requiredMark}
        </label>

        <select
          name="transactionType"
          value={transactionType}
          onChange={(e) => {
            const value = e.target.value;

            setTransactionType(value);

            if (value === "Cash") {
              setTransactionNumber("");

              setErrors((prev) => {
                if (!prev.transactionNumber) return prev;

                const {
                  transactionNumber: _ignored,
                  ...rest
                } = prev;

                return rest;
              });
            }
          }}
          className={selectClass}
        >
          <option value="">Select Transaction Type</option>

          {TRANSACTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {errors.transactionType && (
          <p className={errorClass}>{errors.transactionType}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>
          Transaction Date {requiredMark}
        </label>

        <input
          type="date"
          name="transactionDate"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          max={today}
          className={inputClass}
        />

        {errors.transactionDate && (
          <p className={errorClass}>{errors.transactionDate}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>
          Transaction Number{" "}
          {transactionType !== "Cash" && requiredMark}
        </label>

        <input
          type="text"
          name="transactionNumber"
          value={transactionNumber}
          onChange={(e) => setTransactionNumber(e.target.value)}
          placeholder="Enter transaction number"
          disabled={transactionType === "Cash"}
          className={`${inputClass} ${
            transactionType === "Cash"
              ? "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
              : ""
          }`}
        />

        {errors.transactionNumber && (
          <p className={errorClass}>{errors.transactionNumber}</p>
        )}
      </div>

      <div className="sm:col-span-1">
        <label className={labelClass}>
          Narration {requiredMark}
        </label>

        <textarea
          name="narration"
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          placeholder="Enter narration / note"
          rows={4}
          className={textareaClass}
        />

        {errors.narration && (
          <p className={errorClass}>{errors.narration}</p>
        )}
      </div>
    </>
  );
 
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateVoucher({
      voucherType,
      transactionDate,
      transactionType,
      transactionNumber,
      invoiceId,
      purchaseId,
      amount,
      cgst,
      sgst,
      igst,
      narration,
    });

    setErrors(validationErrors);
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setSaving(true);
 
      if (voucherType === "Sale") {
        const payload = {
          voucher_type: "Sale",
          transaction_number: transactionNumber.trim(),
          transaction_date: transactionDate,
          transaction_type: transactionType,
          invoice_id: Number(invoiceId),
          amount: Number(amount) || 0,
          narration: narration.trim() || undefined,
        };

        const response = await fetch(VOUCHER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await parseJson(response);

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to save voucher"
          );
        }
      }
  
      if (voucherType === "Purchase") {
        const payload = {
          voucher_type: "Purchase",
          transaction_number: transactionNumber.trim(),
          transaction_date: transactionDate,
          transaction_type: transactionType,
          purchase_id: Number(purchaseId),
          narration: narration.trim() || undefined,
        };

        const response = await fetch(VOUCHER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await parseJson(response);

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to save purchase voucher"
          );
        }
      }

      resetForm();
      navigate("/accounts/voucher");
    } catch (error) {
      console.error("Save Voucher Error:", error);

      setSubmitError(
        error.message || "Failed to save voucher."
      );
    } finally {
      setSaving(false);
    }
  };

  const showSaveForm =
    voucherType === "Sale"
      ? Boolean(selectedInvoiceData)
      : Boolean(selectedPurchaseData);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
        <button
          type="button"
          onClick={() => navigate("/accounts/voucher")}
          className="hover:text-deem-blue dark:hover:text-white transition cursor-pointer"
        >
          Vouchers
        </button>

        <ChevronRight size={14} />

        <span>Accounts</span>

        <ChevronRight size={14} />

        <span className="text-deem-blue dark:text-white font-medium">
          Voucher
        </span>
      </div>

      {submitError && (
        <div className="mb-6 rounded-xl border border-deem-red/20 bg-red-50 px-4 py-3 text-sm text-deem-red">
          {submitError}
        </div>
      )}

      {/* Voucher Information */}
      <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#e6edf2] dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-deem-blue dark:text-white mb-5">
          Voucher Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>
              Voucher Type {requiredMark}
            </label>

            <select
              name="voucherType"
              value={voucherType}
              onChange={(e) => {
                const value = e.target.value;

                setVoucherType(value);

                // Sale fields
                setInvoiceId("");

                // Purchase fields
                setPurchaseId("");

                setAmount("");
                setCgst("");
                setSgst("");
                setIgst("");

                setTransactionType("");
                setTransactionDate("");
                setTransactionNumber("");
                setNarration("");

                setErrors({});
                setSubmitError("");
              }}
              className={selectClass}
            >
              <option value="">Select Voucher Type</option>

              {VOUCHER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* SALE SELECTION */}
          {voucherType === "Sale" && (
            <div>
              <label className={labelClass}>
                Sale / Invoice {requiredMark}
              </label>

              <select
                name="invoiceId"
                value={invoiceId}
                onChange={(e) => {
                  const selectedId = e.target.value;

                  const invoice = availableInvoices.find(
                    (item) =>
                      String(item.id) === String(selectedId)
                  );

                  setInvoiceId(selectedId);

                  setAmount(
                    invoice
                      ? String(invoice.grand_total || 0)
                      : ""
                  );

                  setErrors((prev) => {
                    const next = { ...prev };

                    delete next.invoice;
                    delete next.amount;

                    return next;
                  });
                }}
                className={selectClass}
              >
                <option value="">
                  {loadingInvoices
                    ? "Loading invoices..."
                    : "Select Invoice"}
                </option>

                {availableInvoices.map((invoice) => (
                  <option
                    key={invoice.id}
                    value={invoice.id}
                  >
                    {`${invoice.invoice_number} | ${
                      invoice.customer_name
                    } | ${formatCurrency(
                      invoice.grand_total
                    )} | ${
                      invoice.payment_status || "Pending"
                    }`}
                  </option>
                ))}
              </select>

              {errors.invoice && (
                <p className={errorClass}>
                  {errors.invoice}
                </p>
              )}
            </div>
          )}

          {/* PURCHASE SELECTION */}
          {voucherType === "Purchase" && (
            <div>
              <label className={labelClass}>
                Purchase {requiredMark}
              </label>

              <select
                name="purchaseId"
                value={purchaseId}
                onChange={(e) => {
                  const selectedId = e.target.value;

                  setPurchaseId(selectedId);

                  setErrors((prev) => {
                    const next = { ...prev };

                    delete next.purchase;
                    delete next.purchaseId;

                    return next;
                  });
                }}
                className={selectClass}
              >
                <option value="">
                  {loadingPurchases
                    ? "Loading purchases..."
                    : "Select Purchase"}
                </option>

                {availablePurchases.map((purchase) => (
                  <option
                    key={purchase.id}
                    value={purchase.id}
                  >
                    {`${purchase.ino} | ${
                      purchase.cname
                    } | ${formatCurrency(
                      purchase.tamount
                    )}`}
                  </option>
                ))}
              </select>

              {errors.purchase && (
                <p className={errorClass}>
                  {errors.purchase}
                </p>
              )}

              {errors.purchaseId && (
                <p className={errorClass}>
                  {errors.purchaseId}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SALE DETAILS */}
      {voucherType === "Sale" && selectedInvoiceData && (
        <div className="mt-6 rounded-2xl bg-white dark:bg-[#161b22] border border-[#e6edf2] dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-deem-blue dark:text-white mb-5">
            Sale Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>CGST</label>

              <input
                type="text"
                readOnly
                value={formatCurrency(
                  selectedInvoiceData.cgst
                )}
                className={readOnlyClass}
              />
            </div>

            <div>
              <label className={labelClass}>SGST</label>

              <input
                type="text"
                readOnly
                value={formatCurrency(
                  selectedInvoiceData.sgst
                )}
                className={readOnlyClass}
              />
            </div>

            <div>
              <label className={labelClass}>IGST</label>

              <input
                type="text"
                readOnly
                value={formatCurrency(
                  selectedInvoiceData.igst
                )}
                className={readOnlyClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Grand Total
              </label>

              <input
                type="text"
                readOnly
                value={formatCurrency(
                  selectedInvoiceData.grand_total
                )}
                className={readOnlyClass}
              />
            </div>

            {renderTransactionFields()}
          </div>
        </div>
      )}

      {/* PURCHASE DETAILS */}
      {voucherType === "Purchase" && selectedPurchaseData && (
        <div className="mt-6 rounded-2xl bg-white dark:bg-[#161b22] border border-[#e6edf2] dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-deem-blue dark:text-white mb-5">
            Purchase Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                Company Name
              </label>

              <input
                type="text"
                readOnly
                value={selectedPurchaseData.cname || ""}
                className={readOnlyClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Invoice Date
              </label>

              <input
                type="text"
                readOnly
                value={
                  selectedPurchaseData.idate
                    ? String(
                        selectedPurchaseData.idate
                      ).slice(0, 10)
                    : ""
                }
                className={readOnlyClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Invoice Number
              </label>

              <input
                type="text"
                readOnly
                value={selectedPurchaseData.ino || ""}
                className={readOnlyClass}
              />
            </div>

            {/* CGST */}
            <div>
              <label className={labelClass}>
                CGST
              </label>

              <input
                type="text"
                readOnly
                value={formatCurrency(
                  selectedPurchaseData.cgst
                )}
                className={readOnlyClass}
              />
            </div>

            {/* SGST */}
            <div>
              <label className={labelClass}>
                SGST
              </label>

              <input
                type="text"
                readOnly
                value={formatCurrency(
                  selectedPurchaseData.sgst
                )}
                className={readOnlyClass}
              />
            </div>

            {/* IGST */}
            <div>
              <label className={labelClass}>
                IGST
              </label>

              <input
                type="text"
                readOnly
                value={formatCurrency(
                  selectedPurchaseData.igst
                )}
                className={readOnlyClass}
              />
            </div>

            {/* Total Amount */}
            <div>
              <label className={labelClass}>
                Total Amount
              </label>

              <input
                type="text"
                readOnly
                value={formatCurrency(
                  selectedPurchaseData.tamount
                )}
                className={readOnlyClass}
              />
            </div>

            {renderTransactionFields()}
          </div>
        </div>
      )}

      {/* SAVE / CANCEL */}
      {showSaveForm && (
        <form onSubmit={handleSubmit}>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="
                flex
                items-center
                justify-center
                gap-2
                px-6
                h-11
                bg-deem-red
                hover:bg-[#d94335]
                text-white
                rounded-xl
                font-medium
                text-sm
                transition
                cursor-pointer
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              <Save size={16} />

              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                navigate("/accounts/voucher");
              }}
              className="
                px-6
                h-11
                border
                border-gray-200
                dark:border-gray-700
                text-gray-600
                dark:text-gray-300
                rounded-xl
                font-medium
                text-sm
                hover:bg-gray-50
                dark:hover:bg-gray-800
                transition
                cursor-pointer
              "
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Voucher;