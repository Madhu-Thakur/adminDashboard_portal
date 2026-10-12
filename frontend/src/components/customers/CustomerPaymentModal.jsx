import { useEffect, useState } from "react";
import { X } from "lucide-react";

const CustomerPaymentModal = ({
  isOpen,
  onClose,
  customer,
  onSuccess,
}) => {
  const [payment, setPayment] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !customer) return;

    setPayment(customer.balance ?? "");
    setDueDate(
      customer.due_date
        ? String(customer.due_date).slice(0, 10)
        : "",
    );
    setError("");
  }, [isOpen, customer]);

  if (!isOpen || !customer) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (payment === "" || Number(payment) < 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/customers/${customer.id}/payment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment: Number(payment),
            dueDate: dueDate || null,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update payment.",
        );
      }

      onSuccess?.({
        payment: Number(payment),
        due_date: dueDate || null,
      });

      onClose();
    } catch (err) {
      console.error("Customer Payment Error:", err);
      setError(err.message || "Failed to update payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#161b22] shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-deem-blue dark:text-white">
              Payment
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {customer.customer_name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
 
        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-6 py-6"
        >
   
          <div>
            <label
              htmlFor="customer-payment"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Payment
            </label>

            <input
              id="customer-payment"
              type="number"
              min="0"
              step="0.01"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              placeholder="Enter payment amount"
              disabled={loading}
              className="
                w-full
                h-11
                px-4
                rounded-xl
                border
                border-gray-200
                dark:border-gray-700
                bg-white
                dark:bg-[#0b0f14]
                text-sm
                text-gray-700
                dark:text-gray-200
                outline-none
                focus:border-deem-red
              "
            />
          </div>

          <div>
            <label
              htmlFor="customer-due-date"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Due Date
            </label>

            <input
              id="customer-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={loading}
              className="
                w-full
                h-11
                px-4
                rounded-xl
                border
                border-gray-200
                dark:border-gray-700
                bg-white
                dark:bg-[#0b0f14]
                text-sm
                text-gray-700
                dark:text-gray-200
                outline-none
                focus:border-deem-red
              "
            />
          </div>

          {error && (
            <p className="text-sm text-deem-red">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                px-6
                h-11
                border
                border-gray-200
                dark:border-gray-700
                rounded-xl
                text-gray-600
                dark:text-gray-300
                hover:bg-gray-50
                dark:hover:bg-gray-800
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                px-6
                h-11
                bg-deem-red
                hover:bg-[#d94335]
                disabled:opacity-50
                text-white
                rounded-xl
                font-medium
              "
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerPaymentModal;