import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Download } from "lucide-react";

import { JOINING_CANDIDATE_API_URL, parseJson } from "../utils/api";
import FilePreview from "../components/FilePreview.jsx";

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
  const [activeDocument, setActiveDocument] = useState("photo");

  const handleDownload = async () => {
    if (!selectedUrl) return;

    try {
      const response = await fetch(selectedUrl);

      if (!response.ok) {
        throw new Error("Unable to download document");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = selectedUrl.split("/").pop().split("?")[0];
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download nahi ho paya. Cloudinary CORS issue ho sakta hai.");
    }
  };

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

        // Initially select the first uploaded document.
        const firstUploadedDocument = documentFields.find(
          ({ key }) => data[key],
        );

        setActiveDocument(firstUploadedDocument?.key || documentFields[0].key);
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
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        Loading documents...
      </div>
    );
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

  const selectedDocument = documentFields.find(
    ({ key }) => key === activeDocument,
  );

  const selectedUrl = candidate[activeDocument];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/joining-candidates")}
          aria-label="Back to Joining Candidates"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Candidate Documents
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {candidate.ename} · Candidate ID: {candidate.id}
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {documentFields.map(({ key, label }) => {
          const isActive = activeDocument === key;
          const isUploaded = Boolean(candidate[key]);

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveDocument(key)}
              aria-pressed={isActive}
              title={label}
              className={`flex min-h-[76px] min-w-0 flex-col items-center justify-center gap-2 rounded-lg border px-2 py-3 text-center transition ${
                isActive
                  ? "border-deem-blue bg-blue-50 text-deem-blue dark:bg-blue-950/30"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-300"
              }`}
            >
              <div className="flex min-w-0 items-center justify-center gap-1.5">
                <FileText size={17} className="shrink-0" />
                <span className="text-xs font-semibold leading-tight">
                  {label}
                </span>
              </div>

              <span
                className={`inline-flex items-center gap-1 text-[10px] ${
                  isUploaded
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isUploaded ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                {isUploaded ? "Available" : "Missing"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Inline Document Preview */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#161b22]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="text-deem-blue" size={22} />

            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white">
                {selectedDocument?.label || "Document Preview"}
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {selectedUrl
                  ? "Previewing selected document"
                  : "No document uploaded"}
              </p>
            </div>
          </div>

          {selectedUrl && (
            <button
              type="button"
              onClick={handleDownload}
              title="Download document"
              aria-label="Download document"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2.5 text-deem-blue hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <Download size={18} />
            </button>
          )}
        </div>

        <div className="p-3 sm:p-5">
          {selectedUrl ? (
            <FilePreview key={activeDocument} fileUrl={selectedUrl} />
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 px-5 py-12 text-center dark:border-gray-700">
              <FileText
                size={42}
                className="mb-3 text-gray-300 dark:text-gray-600"
              />

              <h3 className="font-medium text-gray-700 dark:text-gray-200">
                {selectedDocument?.label} not uploaded
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                There is no document available to preview for this tab.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default JoiningCandidateDocuments;
