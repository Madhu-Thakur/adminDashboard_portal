import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import PurchaseForm from "../components/purchases/PurchaseForm";
import { usePurchase } from "../context/PurchaseContext";

const AddPurchase = () => {
  const navigate = useNavigate();

  const { addPurchase } = usePurchase();

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (purchaseData) => {
    try {
      setLoading(true);
      setSubmitError("");

      await addPurchase(purchaseData);

      navigate("/accounts/purchase");
    } catch (error) {
      console.error("Save Purchase Error:", error);

      setSubmitError(
        error.message || "Failed to save purchase."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/accounts/purchase");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            title="Back to Purchases"
            aria-label="Back to Purchases"
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
            Add Purchase
          </h1>
        </div>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a new purchase entry
        </p>
      </div>

      {/* Error */}
      {submitError && (
        <div className="rounded-xl border border-deem-red/20 bg-red-50 px-4 py-3 text-sm text-deem-red">
          {submitError}
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
        {loading ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Saving purchase...
            </p>
          </div>
        ) : (
          <PurchaseForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default AddPurchase;