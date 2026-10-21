import { useState } from "react";
import {
  Calendar,
  IndianRupee,
  Paperclip,
  Save,
} from "lucide-react";

const PurchaseForm = ({
  onSubmit,
  onCancel,
  initialData = null,
  isViewMode = false,
}) => {
  const getInitialGstType = () => {
    if (initialData?.igst > 0) {
      return "other";
    }

    if (initialData?.cgst > 0 || initialData?.sgst > 0) {
      return "state";
    }

    return "";
  };

  const getInitialGstAmount = () => {
    if (initialData?.igst > 0) {
      return initialData.igst;
    }

    if (initialData?.cgst > 0 || initialData?.sgst > 0) {
      return Number(initialData.cgst || 0) + Number(initialData.sgst || 0);
    }

    return "";
  };

  const [formData, setFormData] = useState({
    cname: initialData?.cname || "",
    idate: initialData?.idate
      ? String(initialData.idate).slice(0, 10)
      : "",
    ino: initialData?.ino || "",
    gstType: getInitialGstType(),
    gstAmount: getInitialGstAmount(),
    tamount: initialData?.tamount ?? "",
    file: null,
  });

  const [errors, setErrors] = useState({});

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
        "dark:focus:ring-red-950/30"
      );
    } else {
      classes.push(
        "border-gray-200",
        "dark:border-gray-700",
        "focus:border-black",
        "focus:ring-2",
        "focus:ring-gray-200",
        "dark:focus:border-white",
        "dark:focus:ring-gray-700"
      );
    }

    return classes.join(" ");
  };

  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2";

  const errorClass = "mt-1 text-xs text-deem-red";

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    const nextValue =
      name === "file"
        ? files?.[0] || null
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleGstTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      gstType: type,
    }));

    if (errors.gstType) {
      setErrors((prev) => ({
        ...prev,
        gstType: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!formData.cname.trim()) {
      nextErrors.cname = "Company name is required";
    }

    if (!formData.idate) {
      nextErrors.idate = "Invoice date is required";
    }

    if (!formData.ino.trim()) {
      nextErrors.ino = "Invoice number is required";
    }

    const gstAmount =
      formData.gstAmount === "" ? 0 : Number(formData.gstAmount);

    if (
      !Number.isFinite(gstAmount) ||
      gstAmount < 0
    ) {
      nextErrors.gstAmount =
        "GST amount must be a valid non-negative number";
    } else if (gstAmount > 0 && !formData.gstType) {
      nextErrors.gstType = "Please select GST type when GST is added";
    }

    if (formData.tamount === "") {
      nextErrors.tamount = "Total amount is required";
    } else if (
      Number.isNaN(Number(formData.tamount)) ||
      Number(formData.tamount) < 0
    ) {
      nextErrors.tamount = "Enter a valid total amount";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length !== 0) {
      return;
    }

    onSubmit({
      ...formData,
      gstAmount: formData.gstAmount === "" ? 0 : Number(formData.gstAmount),
      tamount: Number(formData.tamount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <fieldset disabled={isViewMode} className="contents">
        <section>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Company Name */}
            <div>
              <label className={labelClass}>
                Company Name{" "}
                <span className="text-deem-red">*</span>
              </label>

              <input
                type="text"
                name="cname"
                value={formData.cname}
                onChange={handleChange}
                placeholder="Enter company name"
                className={inputClass(errors.cname)}
              />

              {errors.cname && (
                <p className={errorClass}>
                  {errors.cname}
                </p>
              )}
            </div>

            {/* Invoice Date */}
            <div>
              <label className={labelClass}>
                Invoice Date{" "}
                <span className="text-deem-red">*</span>
              </label>

              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="date"
                  name="idate"
                  value={formData.idate}
                  onChange={handleChange}
                  max={today}
                  className={`${inputClass(
                    errors.idate
                  )} pl-11`}
                />
              </div>

              {errors.idate && (
                <p className={errorClass}>
                  {errors.idate}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Invoice Number */}
            <div>
              <label className={labelClass}>
                Invoice Number{" "}
                <span className="text-deem-red">*</span>
              </label>

              <input
                type="text"
                name="ino"
                value={formData.ino}
                onChange={handleChange}
                placeholder="Enter invoice number"
                className={inputClass(errors.ino)}
              />

              {errors.ino && (
                <p className={errorClass}>
                  {errors.ino}
                </p>
              )}
            </div>

            {/* GST Type */}
            <div>
              <label className={labelClass}>
                GST Type <span className="text-gray-400">(Optional)</span>
              </label>

              <div
                className={`flex h-11 items-center gap-6 rounded-xl border bg-white px-4 dark:bg-[#0b0f14] ${
                  errors.gstType
                    ? "border-deem-red"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="radio"
                    name="gstType"
                    value="state"
                    checked={formData.gstType === "state"}
                    onChange={() =>
                      handleGstTypeChange("state")
                    }
                    className="h-4 w-4 accent-deem-blue"
                  />

                  <span>State</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="radio"
                    name="gstType"
                    value="other"
                    checked={formData.gstType === "other"}
                    onChange={() =>
                      handleGstTypeChange("other")
                    }
                    className="h-4 w-4 accent-deem-blue"
                  />

                  <span>Other State</span>
                </label>
              </div>

              {errors.gstType && (
                <p className={errorClass}>
                  {errors.gstType}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
      
            <div>
              <label className={labelClass}>
                GST Amount <span className="text-gray-400">(Optional)</span>
              </label>

              <div className="relative">
                <IndianRupee
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="number"
                  name="gstAmount"
                  value={formData.gstAmount}
                  onChange={handleChange}
                  placeholder="Enter GST amount"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className={`${inputClass(
                    errors.gstAmount
                  )} pl-11`}
                />
              </div>

              {errors.gstAmount && (
                <p className={errorClass}>
                  {errors.gstAmount}
                </p>
              )}
            </div>
 
            <div>
              <label className={labelClass}>
                Total Amount{" "}
                <span className="text-deem-red">*</span>
              </label>

              <div className="relative">
                <IndianRupee
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="number"
                  name="tamount"
                  value={formData.tamount}
                  onChange={handleChange}
                  placeholder="Enter total amount"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className={`${inputClass(
                    errors.tamount
                  )} pl-11 font-semibold`}
                />
              </div>

              {errors.tamount && (
                <p className={errorClass}>
                  {errors.tamount}
                </p>
              )}
            </div>
          </div>
        </section>
 
        <section>
          <label className={labelClass}>
            File Attachment
          </label>

          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/30">
            <div className="flex items-center gap-3">
              <Paperclip
                size={18}
                className="text-gray-400"
              />

              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="w-full cursor-pointer text-sm text-gray-600 dark:text-gray-300"
              />
            </div>

            {formData.file && (
              <p className="mt-2 text-xs text-gray-500">
                Selected: {formData.file.name}
              </p>
            )}

            {initialData?.file && !formData.file && (
              <a
                href={initialData.file}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs font-medium text-deem-blue hover:underline"
              >
                View existing attachment
              </a>
            )}
          </div>
        </section>
      </fieldset>
 
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {!isViewMode && (
          <button
            type="submit"
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-deem-red px-6 text-sm font-medium text-white transition hover:bg-[#d94335]"
          >
            <Save size={16} />
            Save Purchase
          </button>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="h-11 cursor-pointer rounded-xl border border-gray-200 px-6 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PurchaseForm;