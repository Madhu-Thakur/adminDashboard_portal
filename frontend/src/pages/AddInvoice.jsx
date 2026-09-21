import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import InvoiceForm from "../components/invoices/InvoiceForm";
import { useInvoice } from "../context/InvoiceContext";
import {ArrowLeft} from "lucide-react";

const AddInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    addInvoice,
    updateInvoice,
    getInvoice,
  } = useInvoice();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const params = new URLSearchParams(location.search);
  const editId = params.get("id");
  const isViewMode = params.get("view") === "true";

  // Load invoice for edit
  useEffect(() => {
    const loadInvoice = async () => {
      if (!editId) {
        setInitialData(null);
        return;
      }

      try {
        setLoading(true);
        setSubmitError("");

        const invoice = await getInvoice(editId);

        if (!invoice) {
          setSubmitError("Invoice not found.");
          return;
        }

        const items = invoice.items || [];

        setInitialData({
          id: invoice.id,

          customerId: invoice.customer_id,
          addressId: invoice.address_id,

          invoiceDate: invoice.invoice_date
            ? String(invoice.invoice_date).slice(0, 10)
            : "",

          paymentMode: invoice.payment_mode || "",
          paymentStatus: invoice.payment_status || "Pending",

          item1Name: items[0]?.item_name || "",
          item1Hsn: items[0]?.hsn || "",
          item1Amount: items[0]?.amount ?? "",

          item2Name: items[1]?.item_name || "",
          item2Hsn: items[1]?.hsn || "",
          item2Amount: items[1]?.amount ?? "",

          grandTotal: invoice.grand_total ?? "",

          note: invoice.note || "",
        });
      } catch (error) {
        console.error("Load Invoice Error:", error);

        setSubmitError(
          error.message || "Failed to load invoice.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [editId, getInvoice]);
 
  const handleSubmit = async (invoiceData) => {
    try {
      setSubmitError("");

      if (editId) {
        await updateInvoice(editId, invoiceData);
      } else {
        await addInvoice(invoiceData);
      }

      navigate("/invoices");
    } catch (error) {
      console.error("Save Invoice Error:", error);

      setSubmitError(
        error.message || "Failed to save invoice.",
      );
    }
  };

 
  const handleCancel = () => {
    navigate("/invoices");
  };

 
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Edit Invoice
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Loading invoice details...
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
<div>
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => navigate("/invoices")}
      title="Back to Invoices"
      aria-label="Back to Invoices"
      className="
        flex
        h-9
        w-9
        shrink-0
        cursor-pointer
        items-center
        justify-center
        rounded-lg
        border
        border-gray-200
        text-gray-600
        transition
        hover:bg-gray-50
        hover:text-deem-red
        dark:border-gray-700
        dark:text-gray-300
        dark:hover:bg-gray-800
        dark:hover:text-deem-red
      "
    >
      <ArrowLeft size={18} />
    </button>

    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
      {editId
        ? isViewMode
          ? "View Invoice"
          : "Edit Invoice"
        : "Add Invoice"}
    </h1>
  </div>

  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
    {editId
      ? isViewMode
        ? "Invoice details (view only)"
        : "Update invoice details"
      : "Create a new invoice"}
  </p>
</div>

      {submitError && (
        <div className="rounded-xl border border-deem-red/20 bg-red-50 px-4 py-3 text-sm text-deem-red">
          {submitError}
        </div>
      )}
 
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
        <InvoiceForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isViewMode={isViewMode}
        />
      </div>
    </div>
  );
};

export default AddInvoice;