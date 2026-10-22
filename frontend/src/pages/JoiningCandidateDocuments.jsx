import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";

import { JOINING_CANDIDATE_API_URL, parseJson } from "../utils/api";

const documentFields = [
  { key: "photo", label: "Photo" },
  { key: "resume", label: "Resume" },
  { key: "degree", label: "Degree Certificate" },
  { key: "aadharc", label: "Aadhaar Card" },
  { key: "sslip", label: "Salary Slip" },
  { key: "passbook", label: "Bank Passbook" },
];

const JoiningCandidateDocuments = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${JOINING_CANDIDATE_API_URL}/${id}`);

        const result = await parseJson(response);

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Failed to fetch candidate documents.",
          );
        }

        const data = result.data ?? result.candidate ?? result;

        if (!data || data.id == null) {
          throw new Error("Candidate not found.");
        }

        setCandidate(data);
      } catch (err) {
        setError(err.message || "Unable to load candidate documents.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCandidate();
    } else {
      setError("Candidate ID is missing.");
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className="p-6 text-center">Loading documents...</div>;
  }

  if (error || !candidate) {
    return (
      <div className="p-6">
        <p className="mb-4 text-red-600">{error || "Candidate not found."}</p>
        <button
          type="button"
          onClick={() => navigate("/joining-candidates")}
          className="rounded-lg bg-deem-blue px-4 py-2 text-white"
        >
          Back to Joining Candidates
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <button
        type="button"
        onClick={() => navigate("/joining-candidates")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-deem-blue hover:underline"
      >
        <ArrowLeft size={18} />
        Back to Joining Candidates
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Candidate Documents
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {candidate.ename} · Candidate ID: {candidate.id}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documentFields.map(({ key, label }) => {
          const url = candidate[key];

          return (
            <div
              key={key}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-[#161b22]"
            >
              <div className="mb-3 flex items-center gap-3">
                <FileText className="text-deem-blue" size={22} />
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  {label}
                </h2>
              </div>

              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  View Document
                  <ExternalLink size={15} />
                </a>
              ) : (
                <p className="text-sm text-gray-500">Not uploaded</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JoiningCandidateDocuments;
