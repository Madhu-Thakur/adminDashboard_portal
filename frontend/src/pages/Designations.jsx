import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DesignationTable from "../components/designations/DesignationTable";

const Designations = () => {
  const navigate = useNavigate();

  const handleAddDesignation = () => {
    navigate("/designations/add");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Designations
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage job designations
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleAddDesignation}
          className="
            flex
            h-11
            w-full
            cursor-pointer
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-deem-red
            px-5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-[#d94335]
            sm:w-auto
          "
        >
          <Plus size={18} />
          Add Designation
        </button>
      </div>

      <DesignationTable />
    </div>
  );
};

export default Designations;
