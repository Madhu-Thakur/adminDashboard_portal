import { Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DESIGNATION_API_URL, parseJson } from "../../utils/api";

const DesignationTable = () => {
  const navigate = useNavigate();

  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(DESIGNATION_API_URL);
      const result = await parseJson(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch designations");
      }

      setDesignations(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Fetch Designations Error:", err);
      setError(err.message || "Failed to fetch designations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleEdit = (id) => {
    navigate(`/designations/edit/${id}`);
  };

  const handleDelete = async (designation) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${designation.des}"?`);

    if (!confirmed) { return; }

    try {
      const response = await fetch(`${DESIGNATION_API_URL}/${designation.id}`, { method: "DELETE" });
      const result = await parseJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete designation");
      }

      setDesignations((prev) => prev.filter((d) => d.id !== designation.id));
    } catch (err) {
      console.error("Delete Designation Error:", err);
      setError(err.message || "Failed to delete designation.");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading designations...</p>
      </div>
    );
  }

  if (error && designations.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Designations</h2>
      </div>

      {designations.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No designations found.</p>
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Designation</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden md:table-cell">Last Updated</th>
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {designations.map((designation) => (
              <tr key={designation.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition dark:border-gray-800 dark:hover:bg-[#0b0f14]">
                <td className="px-5 py-4 text-center text-sm text-gray-600 dark:text-gray-300">{designation.id}</td>
                <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{designation.des || "-"}</td>
                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{designation.last_update ? new Date(designation.last_update).toLocaleString("en-IN") : "-"}</td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button type="button" onClick={() => handleEdit(designation.id)} title="Edit Designation" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-deem-red hover:text-deem-red dark:border-gray-700 dark:text-gray-400"><Edit size={16} /></button>
                    <button type="button" onClick={() => handleDelete(designation)} title="Delete Designation" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-deem-red hover:text-deem-red dark:border-gray-700 dark:text-gray-400"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};



export default DesignationTable;
