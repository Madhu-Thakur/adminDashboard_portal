import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import PurchaseTable from "../components/purchases/PurchaseTable";
import { usePurchase } from "../context/PurchaseContext";

const Purchases = () => {
  const navigate = useNavigate();

  const {
    purchases,
    loading,
    error,
  } = usePurchase();

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-deem-blue dark:text-white">
            Purchases
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage purchase entries
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/accounts/purchase/add")}
          className="
            flex
            h-11
            cursor-pointer
            items-center
            gap-2
            rounded-xl
            bg-deem-red
            px-5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-[#d94335]
          "
        >
          <Plus size={18} />
          Add Purchase
        </button>
      </div>
 
      {error && (
        <div className="mb-5 rounded-xl border border-deem-red/20 bg-red-50 px-4 py-3 text-sm text-deem-red">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#e6edf2] bg-white dark:border-gray-700 dark:bg-[#161b22]">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading purchases...
          </div>
        ) : (
          <PurchaseTable purchases={purchases} />
        )}
      </div>
    </div>
  );
};

export default Purchases;