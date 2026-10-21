import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { JOINING_CANDIDATE_API_URL, parseJson } from "../utils/api";
import JoiningCandidateForm from "../components/joining/JoiningCandidateForm";

const EditJoiningCandidate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(
          `${JOINING_CANDIDATE_API_URL}/${id}`
        );

        const result = await parseJson(response);

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Failed to fetch candidate details."
          );
        }
 
        const candidateData = result.data ?? result.candidate ?? result;

        if (!candidateData || candidateData.id == null) {
          throw new Error("Candidate not found.");
        }

        setCandidate(candidateData);
      } catch (error) {
        setLoadError(error.message || "Unable to load candidate.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCandidate();
    } else {
      setLoadError("Candidate ID is missing.");
      setLoading(false);
    }
  }, [id]);

  const handleUpdate = async (formData) => {
    if (saving) return;

    try {
      setSaving(true);

      const response = await fetch(
        `${JOINING_CANDIDATE_API_URL}/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const result = await parseJson(response);

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Failed to update candidate."
        );
      }

      toast.success("Joining candidate updated successfully.");
      navigate("/joining-candidates");
    } catch (error) {
      toast.error(error.message || "Unable to update candidate.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading candidate details...
      </div>
    );
  }

  if (loadError || !candidate) {
    return (
      <div className="p-6">
        <p className="mb-4 text-red-600">
          {loadError || "Candidate not found."}
        </p>

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
        <h1 className="text-2xl font-bold text-gray-800">
          Edit Joining Candidate
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Candidate ID: {candidate.id}
        </p>
      </div>

      <JoiningCandidateForm
        initialData={candidate}
        onSubmit={handleUpdate}
        onCancel={() => navigate("/joining-candidates")}
        saving={saving}
      />
    </div>
  );
};

export default EditJoiningCandidate;
