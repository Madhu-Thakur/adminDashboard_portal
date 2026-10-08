import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { ROLE_API_URL } from "../../utils/api";

const ANNOUNCEMENT_TYPES = ["Message", "Alert"];

const AnnouncementForm = ({
  onSubmit,
  onCancel,
  initialData,
  isViewMode = false,
}) => {
  const [roles, setRoles] = useState([]);

  const [formData, setFormData] = useState({
    announce: initialData?.announce || "",
    role: initialData?.role
      ? initialData.role.split(",").map((item) => item.trim())
      : [],
    type: initialData?.type
      ? initialData.type.charAt(0).toUpperCase() +
        initialData.type.slice(1).toLowerCase()
      : "Message",
    expiryDate: initialData?.expiry_date || "",
    expiryTime: initialData?.expiry_time || "",
    status:
      initialData?.status !== undefined ? String(initialData.status) : "1",
  });

  const [errors, setErrors] = useState({});
 
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(ROLE_API_URL);

        const result = await response.json();

        if (response.ok && result.success) {
          setRoles(result.data || []);
        } else {
          setErrors((prev) => ({
            ...prev,
            role: "Failed to load roles",
          }));
        }
      } catch (error) {
        console.error("Fetch Roles Error:", error);

        setErrors((prev) => ({
          ...prev,
          role: "Failed to load roles",
        }));
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    setFormData({
      announce: initialData?.announce || "",
      role: initialData?.role
        ? initialData.role.split(",").map((item) => item.trim())
        : [],
      type: initialData?.type
        ? initialData.type.charAt(0).toUpperCase() +
          initialData.type.slice(1).toLowerCase()
        : "Message",
      expiryDate: initialData?.expiry_date || "",
      expiryTime: initialData?.expiry_time || "",
      status:
        initialData?.status !== undefined ? String(initialData.status) : "1",
    });

    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRoleChange = (role) => {
    if (isViewMode) return;

    setFormData((prev) => ({
      ...prev,
      role: prev.role.includes(role)
        ? prev.role.filter((item) => item !== role)
        : [...prev.role, role],
    }));

    if (errors.role) {
      setErrors((prev) => ({
        ...prev,
        role: "",
      }));
    }
  };

  const validate = () => {
    const validationErrors = {};

    if (!formData.announce.trim()) {
      validationErrors.announce = "Announcement is required";
    }

    if (formData.role.length === 0) {
      validationErrors.role = "At least one role is required";
    }

    if (!formData.type) {
      validationErrors.type = "Type is required";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isViewMode) {
      return;
    }

    if (!validate()) {
      return;
    }

    onSubmit({
      announce: formData.announce.trim(),
      role: formData.role.join(","),
      type: formData.type.toLowerCase(),
      expiry_date: formData.expiryDate || null,
      expiry_time: formData.expiryTime || null,
      status: Number(formData.status),
    });
  };

  const inputClass = (hasError) => {
    const classes = [
      "w-full",
      "h-11",
      "px-4",
      "rounded-xl",
      "border",
      "bg-white",
      "dark:bg-[#0b0f14]",
      "text-sm",
      "text-gray-700",
      "dark:text-gray-200",
      "outline-none",
      "transition",
    ];

    if (hasError) {
      classes.push(
        "border-deem-red",
        "focus:border-deem-red",
        "focus:ring-2",
        "focus:ring-red-100",
        "dark:focus:ring-red-950/30",
      );
    } else {
      classes.push(
        "border-gray-200",
        "dark:border-gray-700",
        "focus:border-deem-red",
        "focus:ring-2",
        "focus:ring-red-100",
        "dark:focus:ring-red-950/30",
      );
    }

    return classes.join(" ");
  };

  const textareaClass = (hasError) => {
    const classes = [
      "w-full",
      "min-h-[100px]",
      "px-4",
      "py-3",
      "rounded-xl",
      "border",
      "bg-white",
      "dark:bg-[#0b0f14]",
      "text-sm",
      "text-gray-700",
      "dark:text-gray-200",
      "outline-none",
      "transition",
      "resize-y",
    ];

    if (hasError) {
      classes.push(
        "border-deem-red",
        "focus:border-deem-red",
        "focus:ring-2",
        "focus:ring-red-100",
        "dark:focus:ring-red-950/30",
      );
    } else {
      classes.push(
        "border-gray-200",
        "dark:border-gray-700",
        "focus:border-deem-red",
        "focus:ring-2",
        "focus:ring-red-100",
        "dark:focus:ring-red-950/30",
      );
    }

    return classes.join(" ");
  };

  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2";

  const errorClass = "mt-1 text-xs text-deem-red";

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <fieldset disabled={isViewMode} className="contents">
        {/* Role */}
        <section>
          <label className={labelClass}>
            Role <span className="text-deem-red">*</span>
          </label>

          <div className="mb-2 flex flex-wrap items-center gap-5">
            {roles.map((role) => (
              <label
                key={role.id}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={formData.role.includes(String(role.id))}
                  onChange={() => handleRoleChange(String(role.id))}
                  className="h-4 w-4 accent-deem-red cursor-pointer"
                />

                <span>{role.role}</span>
              </label>
            ))}
          </div>

          {errors.role && <p className={errorClass}>{errors.role}</p>}
        </section>
 
        <section>
          <label className={labelClass}>
            Announcement <span className="text-deem-red">*</span>
          </label>

          <textarea
            name="announce"
            value={formData.announce}
            onChange={handleChange}
            placeholder="Enter announcement"
            maxLength={500}
            className={textareaClass(errors.announce)}
          />

          <div className="mt-1 flex justify-between gap-3">
            {errors.announce ? (
              <p className={errorClass}>{errors.announce}</p>
            ) : (
              <span />
            )}

            <p className="text-xs text-gray-400">
              {formData.announce.length}/500
            </p>
          </div>
        </section>
 
        <section>
          <label className={labelClass}>
            Type <span className="text-deem-red">*</span>
          </label>

          <div className="flex flex-wrap items-center gap-5">
            {ANNOUNCEMENT_TYPES.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
              >
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={formData.type === type}
                  onChange={handleChange}
                  className="h-4 w-4"
                  style={{
                    accentColor: type === "Alert" ? "#eb5141" : "#16a34a",
                  }}
                />

                <span
                  className={
                    type === "Alert" ? "text-deem-red" : "text-green-600"
                  }
                >
                  {type}
                </span>
              </label>
            ))}
          </div>

          {errors.type && <p className={errorClass}>{errors.type}</p>}
        </section>
 
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <section>
            <label className={labelClass}>Expiry Date</label>

            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className={inputClass(false)}
            />
          </section>

          <section>
            <label className={labelClass}>Expiry Time</label>

            <input
              type="time"
              name="expiryTime"
              value={formData.expiryTime}
              onChange={handleChange}
              className={inputClass(false)}
            />
          </section>
        </div>
 
        <section>
          <label className={labelClass}>Status</label>

          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                status: prev.status === "1" ? "0" : "1",
              }))
            }
            className="flex cursor-pointer items-center gap-3"
          >
            <span
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                Number(formData.status) === 1
                  ? "bg-green-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  Number(formData.status) === 1
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </span>

            <span className="text-sm text-gray-700 dark:text-gray-200">
              {Number(formData.status) === 1 ? "Active" : "Inactive"}
            </span>
          </button>
        </section>
      </fieldset>
 
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {!isViewMode && (
          <button
            type="submit"
            className="
              flex
              h-11
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-deem-red
              px-6
              text-sm
              font-medium
              text-white
              transition
              hover:bg-[#d94335]
            "
          >
            <Save size={16} />
            Save Announcement
          </button>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="
            h-11
            cursor-pointer
            rounded-xl
            border
            border-gray-200
            px-6
            text-sm
            font-medium
            text-gray-600
            transition
            hover:bg-gray-50
            dark:border-gray-700
            dark:text-gray-300
            dark:hover:bg-gray-800
          "
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
