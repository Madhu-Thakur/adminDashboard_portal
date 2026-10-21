import { useEffect, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0b0f14] text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-deem-red";

const labelClass =
  "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200";

const initialFormData = {
  ename: "",
  fname: "",
  dob: "",
  gender: "",
  address: "",
  mobile: "",
  email: "",
  aadhar: "",
  mstatus: "",
  qual: "",
  hstudy: "",
  linkedin: "",
  pexp: "",
};

const fileFields = [
  { name: "photo", label: "Photo" },
  { name: "resume", label: "Resume" },
  { name: "degree", label: "Degree Certificate" },
  { name: "aadharc", label: "Aadhar Card Document" },
  { name: "sslip", label: "Salary Slip" },
  { name: "passbook", label: "Bank Passbook" },
];

const JoiningCandidateForm = ({
  initialData,
  onSubmit,
  onCancel,
  saving = false,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!initialData) return;

    setFormData({
      ename: initialData.ename || "",
      fname: initialData.fname || "",
      dob: initialData.dob
        ? (() => {
            const value = String(initialData.dob);

            if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
              return value.slice(0, 10);
            }

            const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

            return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
          })()
        : "",

      gender: initialData.gender || "",
      address: initialData.address || "",
      mobile: initialData.mobile || "",
      email: initialData.email || "",
      aadhar: initialData.aadhar || "",
      mstatus: initialData.mstatus || "",
      qual: initialData.qual || "",
      hstudy: initialData.hstudy || "",
      linkedin: initialData.linkedin || "",
      pexp: initialData.pexp || "",
    });

    setFiles({});
    setErrors({});
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleFileChange = (event) => {
    const { name, files: selectedFiles } = event.target;
    const file = selectedFiles?.[0];

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrors((previous) => ({
        ...previous,
        [name]: "File size must not exceed 5 MB.",
      }));
      event.target.value = "";
      return;
    }

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPdf && !isImage) {
      setErrors((previous) => ({
        ...previous,
        [name]: "Please select an image or PDF file.",
      }));
      event.target.value = "";
      return;
    }

    setFiles((previous) => ({
      ...previous,
      [name]: file,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.ename.trim()) {
      nextErrors.ename = "Employee name is required.";
    }

    if (!formData.fname.trim()) {
      nextErrors.fname = "Father's name is required.";
    }

    if (!/^[+\d][\d\s-]{7,14}$/.test(formData.mobile.trim())) {
      nextErrors.mobile = "Enter a valid mobile number.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim().toLowerCase())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (formData.aadhar.trim() && !/^\d{12}$/.test(formData.aadhar.trim())) {
      nextErrors.aadhar = "Aadhar must contain exactly 12 digits.";
    }

    if (!formData.gender) {
      nextErrors.gender = "Please select gender.";
    }

    if (!formData.mstatus) {
      nextErrors.mstatus = "Please select marital status.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      const cleanedValue = typeof value === "string" ? value.trim() : value;

      payload.append(
        key,
        key === "email" ? cleanedValue.toLowerCase() : cleanedValue,
      );
    });

    Object.entries(files).forEach(([key, file]) => {
      payload.append(key, file);
    });
    onSubmit(payload);
  };

  const renderInput = (label, name, options = {}) => (
    <div key={name}>
      <label htmlFor={name} className={labelClass}>
        {label}
        {options.required ? " *" : ""}
      </label>

      {options.type === "select" ? (
        <select
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required={options.required}
          className={inputClass}
        >
          <option value="">Select {label}</option>
          {options.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : options.type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          rows={3}
          className={`${inputClass} h-auto py-3`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={options.type || "text"}
          value={formData[name]}
          onChange={handleChange}
          required={options.required}
          className={inputClass}
        />
      )}

      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[#161b22]"
    >
      <h2 className="mb-5 text-lg font-semibold text-deem-blue dark:text-white">
        Candidate Details
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {renderInput("Employee Name", "ename", { required: true })}
        {renderInput("Father's Name", "fname", { required: true })}
        {renderInput("Date of Birth", "dob", { type: "date" })}

        {renderInput("Gender", "gender", {
          type: "select",
          required: true,
          options: [
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" },
          ],
        })}

        {renderInput("Mobile", "mobile", { required: true })}
        {renderInput("Email", "email", {
          type: "email",
          required: true,
        })}
        {renderInput("Aadhar Number", "aadhar")}
        {renderInput("Marital Status", "mstatus", {
          type: "select",
          required: true,
          options: [
            { value: "Single", label: "Single" },
            { value: "Married", label: "Married" },
          ],
        })}
        {renderInput("Qualification", "qual")}
        {renderInput("Higher Study", "hstudy")}
        {renderInput("LinkedIn URL", "linkedin")}
        {renderInput("Previous Experience", "pexp")}
        {renderInput("Address", "address", { type: "textarea" })}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-deem-blue dark:text-white">
          Candidate Documents
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {fileFields.map(({ name, label }) => {
            const existingUrl = initialData?.[name];

            return (
              <div key={name}>
                <label htmlFor={`file-${name}`} className={labelClass}>
                  {label}
                </label>

                {existingUrl && (
                  <p className="mb-2 text-sm">
                    <a
                      href={existingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View existing document
                    </a>
                  </p>
                )}

                <input
                  id={`file-${name}`}
                  name={name}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-600 dark:text-gray-300"
                />

                {files[name] && (
                  <p className="mt-1 text-sm text-gray-500">
                    Selected: {files[name].name}
                  </p>
                )}

                {errors[name] && (
                  <p className="mt-1 text-sm text-red-500">{errors[name]}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-xl bg-deem-red px-6 font-medium text-white hover:bg-[#d94335] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-11 rounded-xl border border-gray-200 px-6 font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default JoiningCandidateForm;
