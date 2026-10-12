import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import AddressSection from "../components/customers/AddressSection";
import ServiceDetails from "../components/customers/ServiceDetails";
import CollapsibleSection from "../components/customers/CollapsibleSection";
import CustomerInvoices from "../components/customers/CustomerInvoices";
import CustomerPaymentModal from "../components/customers/CustomerPaymentModal";

import { CUSTOMER_API_URL } from "../utils/api";

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: "",
    companyName: "",
    email: "",
    phone: "",
    status: "1",
  });

  const [customerData, setCustomerData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`${CUSTOMER_API_URL}/${id}`);

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch customer");
        }

        const customer = result.data;

        setCustomerData(customer);

        setFormData({
          customerName: customer.customer_name || "",
          companyName: customer.company_name || "",
          email: customer.email || "",
          phone: customer.phone || "",
          status: String(customer.status ?? 1),
        });
      } catch (error) {
        console.error("Error fetching customer:", error);
        alert("Failed to load customer.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const response = await fetch(`${CUSTOMER_API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: formData.customerName,
          company_name: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          status: Number(formData.status),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update customer");
      }

      alert("Customer updated successfully");

      navigate("/customers");
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handleClosePayment = () => {
    setIsPaymentModalOpen(false);
  };

  const handlePaymentSuccess = ({ payment, due_date }) => {
    setCustomerData((prev) => ({
      ...prev,
      balance: payment.toFixed(2),
      due_date,
    }));

    setIsPaymentModalOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500 dark:text-gray-400">
        Loading customer...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-3xl font-bold text-deem-blue dark:text-white">
            Edit Customer
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Customer ID: #{id}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="
            flex
            items-center
            gap-2
            px-5
            h-11
            border
            border-gray-200
            dark:border-gray-700
            rounded-xl
            text-gray-600
            dark:text-gray-300
            hover:bg-gray-50
            dark:hover:bg-gray-800
          "
        >
          <ArrowLeft size={17} />
          Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="
          rounded-2xl
          bg-white
          dark:bg-[#161b22]
          border
          border-gray-200
          dark:border-gray-700
          p-6
        "
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
          />

          <InputField
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <InputField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="
                w-full
                h-11
                px-4
                rounded-xl
                border
                border-gray-200
                dark:border-gray-700
                bg-white
                dark:bg-[#0b0f14]
                text-sm
                text-gray-700
                dark:text-gray-200
                outline-none
              "
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleOpenPayment}
            disabled={!customerData}
            className="
              px-6
              h-11
              border
              border-deem-blue
              text-deem-blue
              hover:bg-blue-50
              dark:hover:bg-blue-950/20
              disabled:opacity-50
              rounded-xl
              font-medium
            "
          >
            Payment
          </button>

          <button
            type="submit"
            disabled={saving}
            className="
              px-6
              h-11
              bg-deem-red
              hover:bg-[#d94335]
              disabled:opacity-50
              text-white
              rounded-xl
              font-medium
            "
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="
              px-6
              h-11
              border
              border-gray-200
              dark:border-gray-700
              rounded-xl
              text-gray-600
              dark:text-gray-300
            "
          >
            Cancel
          </button>
        </div>
      </form>

      <CustomerPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePayment}
        customer={customerData}
        onSuccess={handlePaymentSuccess}
      />

      <CollapsibleSection title="Address">
        <AddressSection customerId={id} />
      </CollapsibleSection>

      <CollapsibleSection title="Services">
        <ServiceDetails customerId={id} />
      </CollapsibleSection>

      <CustomerInvoices customerId={id} />
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text" }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full
          h-11
          px-4
          rounded-xl
          border
          border-gray-200
          dark:border-gray-700
          bg-white
          dark:bg-[#0b0f14]
          text-sm
          text-gray-700
          dark:text-gray-200
          outline-none
          focus:border-deem-red
        "
      />
    </div>
  );
};

export default EditCustomer;