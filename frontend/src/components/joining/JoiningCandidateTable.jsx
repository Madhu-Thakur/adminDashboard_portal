 import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  UserRoundPlus,
  Pencil,
  FileText,
  ClipboardCheck,
  Phone,
  Mail,
  CalendarDays,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  JOINING_CANDIDATE_API_URL,
  DESIGNATION_API_URL,
  parseJson,
} from "../../utils/api";

const PAGE_SIZE = 8;

const JoiningCandidateTable = () => {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [designationLoading, setDesignationLoading] = useState(false);
  const [designationError, setDesignationError] = useState("");

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(JOINING_CANDIDATE_API_URL);
      const result = await parseJson(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch joining candidates",
        );
      }

      setCandidates(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Fetch Joining Candidates Error:", err);
      setError(err.message || "Failed to fetch joining candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !searchText ||
        candidate.ename?.toLowerCase().includes(searchText) ||
        candidate.fname?.toLowerCase().includes(searchText) ||
        candidate.mobile?.toLowerCase().includes(searchText) ||
        candidate.email?.toLowerCase().includes(searchText) ||
        candidate.qual?.toLowerCase().includes(searchText) ||
        String(candidate.id).includes(searchText);

      return matchesSearch;
    });
  }, [candidates, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / PAGE_SIZE),
  );

  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSaveAsEmployee = async (candidate) => {
    setSelectedCandidate(candidate);
    setSelectedDesignation("");
    setDesignationError("");
    setDesignationLoading(true);

    try {
      const response = await fetch(DESIGNATION_API_URL);
      const result = await parseJson(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch designations");
      }

      setDesignations(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Fetch Designations Error:", err);
      setDesignationError(err.message || "Failed to fetch designations.");
      setDesignations([]);
    } finally {
      setDesignationLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedCandidate(null);
    setSelectedDesignation("");
    setDesignationError("");
  };

  const handleSaveEmployee = () => {
    if (!selectedDesignation) {
      setDesignationError("Please select a designation.");
      return;
    }

    const selectedDesignationData = designations.find(
      (designation) =>
        String(designation.id) === String(selectedDesignation),
    );

    console.log("Save as Employee:", {
      candidate: selectedCandidate,
      designation: selectedDesignationData,
    });

    handleCloseModal();
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading joining candidates...
        </p>
      </div>
    );
  }

  if (error && candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            New Joining
          </h2>

          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={handleSearchChange}
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-deem-red focus:outline-none focus:ring-2 focus:ring-deem-red/20 dark:border-gray-700 dark:bg-[#0b0f14] dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No joining candidates found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Photo
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Candidate Name
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Father Name
                  </th>

                  <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:table-cell">
                    DOB
                  </th>

                  <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:table-cell">
                    Gender
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mobile
                  </th>

                  <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 md:table-cell">
                    Email
                  </th>

                  <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 md:table-cell">
                    Qualification
                  </th>

                  <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 lg:table-cell">
                    Higher Study
                  </th>

                  <th className="hidden px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:table-cell">
                    Marital Status
                  </th>

                  <th className="hidden px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 lg:table-cell">
                    Last Updated
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="border-b border-gray-100 last:border-0 transition hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-[#0b0f14]"
                  >
                    <td className="px-5 py-4">
                      {candidate.photo ? (
                        <img
                          src={candidate.photo}
                          alt={candidate.ename || "Candidate"}
                          className="h-10 w-10 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                          <UserRound size={18} />
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                      {candidate.id}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {candidate.ename || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {candidate.fname || "-"}
                    </td>

                    <td className="hidden px-5 py-4 text-sm text-gray-600 dark:text-gray-300 sm:table-cell">
                      {candidate.dob
                        ? new Date(candidate.dob).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td className="hidden px-5 py-4 text-sm text-gray-600 dark:text-gray-300 sm:table-cell">
                      {candidate.gender || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {candidate.mobile || "-"}
                    </td>

                    <td className="hidden px-5 py-4 text-sm text-gray-600 dark:text-gray-300 md:table-cell">
                      {candidate.email || "-"}
                    </td>

                    <td className="hidden px-5 py-4 text-sm text-gray-600 dark:text-gray-300 md:table-cell">
                      {candidate.qual || "-"}
                    </td>

                    <td className="hidden px-5 py-4 text-sm text-gray-600 dark:text-gray-300 lg:table-cell">
                      {candidate.hstudy || "-"}
                    </td>

                    <td className="hidden px-5 py-4 text-sm text-gray-600 dark:text-gray-300 sm:table-cell">
                      {candidate.mstatus || "-"}
                    </td>

                    <td className="hidden px-5 py-4 text-center text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
                      {candidate.last_update
                        ? new Date(candidate.last_update).toLocaleString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          title="Edit"
                          aria-label="Edit"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-deem-blue hover:text-deem-blue dark:border-gray-700 dark:bg-[#11161c]"
                        >
                          <Pencil size={16} strokeWidth={1.8} />
                        </button>

                        <button
                          type="button"
                          title="Documents"
                          aria-label="Documents"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-deem-blue hover:text-deem-blue dark:border-gray-700 dark:bg-[#11161c]"
                        >
                          <FileText size={16} strokeWidth={1.8} />
                        </button>

                        <button
                          type="button"
                          title="Attendance"
                          aria-label="Attendance"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-deem-blue hover:text-deem-blue dark:border-gray-700 dark:bg-[#11161c]"
                        >
                          <ClipboardCheck size={16} strokeWidth={1.8} />
                        </button>

                        <button
                          type="button"
                          title="Phone"
                          aria-label="Phone"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-deem-blue hover:text-deem-blue dark:border-gray-700 dark:bg-[#11161c]"
                        >
                          <Phone size={16} strokeWidth={1.8} />
                        </button>

                        <button
                          type="button"
                          title="Email"
                          aria-label="Email"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-deem-blue hover:text-deem-blue dark:border-gray-700 dark:bg-[#11161c]"
                        >
                          <Mail size={16} strokeWidth={1.8} />
                        </button>

                        <button
                          type="button"
                          title="Leave"
                          aria-label="Leave"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-deem-blue hover:text-deem-blue dark:border-gray-700 dark:bg-[#11161c]"
                        >
                          <CalendarDays size={16} strokeWidth={1.8} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveAsEmployee(candidate)}
                          title="Save as Employee"
                          aria-label="Save as Employee"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-deem-red text-white transition hover:bg-[#d94335]"
                        >
                          <UserRoundPlus size={17} strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 px-2 py-4 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
                disabled={currentPage === 1}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-deem-red hover:text-deem-red disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-400"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-deem-red hover:text-deem-red disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-400"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-[#11161c]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Save as Employee
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select designation for {selectedCandidate.ename}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="cursor-pointer rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Designation
              </label>

              {designationLoading ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-[#0b0f14] dark:text-gray-400">
                  Loading designations...
                </div>
              ) : (
                <select
                  value={selectedDesignation}
                  onChange={(e) => {
                    setSelectedDesignation(e.target.value);
                    setDesignationError("");
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-deem-red focus:ring-2 focus:ring-deem-red/20 dark:border-gray-700 dark:bg-[#0b0f14] dark:text-white"
                >
                  <option value="">Select designation</option>

                  {designations.map((designation) => (
                    <option key={designation.id} value={designation.id}>
                      {designation.des}
                    </option>
                  ))}
                </select>
              )}

              {designationError && (
                <p className="mt-2 text-sm text-red-500">
                  {designationError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseModal}
                className="cursor-pointer rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEmployee}
                disabled={designationLoading}
                className="cursor-pointer rounded-lg bg-deem-red px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JoiningCandidateTable;