import { createContext, useContext, useEffect, useState } from "react";
import { PURCHASE_API_URL, parseJson } from "../utils/api";

const PurchaseContext = createContext();

export const PurchaseProvider = ({ children }) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(PURCHASE_API_URL);
      const result = await parseJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch purchases");
      }

      setPurchases(result.data || []);
    } catch (error) {
      console.error("Fetch Purchases Error:", error);
      setError(error.message || "Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  const getPurchase = async (id) => {
    try {
      setError("");

      const response = await fetch(`${PURCHASE_API_URL}/${id}`);
      const result = await parseJson(response);

      if (!response.ok) {
        if (response.status === 404) return null;

        throw new Error(
          result.message || "Failed to fetch purchase"
        );
      }

      return result.data;
    } catch (error) {
      console.error("Get Purchase Error:", error);

      setError(
        error.message || "Failed to fetch purchase"
      );

      return null;
    }
  };

  const addPurchase = async (purchaseData) => {
    try {
      setError("");

      const formData = new FormData();

      formData.append(
        "cname",
        purchaseData.cname || ""
      );

      formData.append(
        "idate",
        purchaseData.idate || ""
      );

      formData.append(
        "ino",
        purchaseData.ino || ""
      );

      formData.append(
        "gstType",
        purchaseData.gstType || ""
      );

      formData.append(
        "gstAmount",
        purchaseData.gstAmount ?? ""
      );

      formData.append(
        "tamount",
        purchaseData.tamount ?? ""
      );

      if (purchaseData.file) {
        formData.append("file", purchaseData.file);
      }

      const response = await fetch(PURCHASE_API_URL, {
        method: "POST",
        body: formData,
      });

      const result = await parseJson(response);

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create purchase"
        );
      }

      await fetchPurchases();

      return result;
    } catch (error) {
      console.error("Create Purchase Error:", error);

      setError(
        error.message || "Failed to create purchase"
      );

      throw error;
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <PurchaseContext.Provider
      value={{
        purchases,
        loading,
        error,
        fetchPurchases,
        getPurchase,
        addPurchase,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => useContext(PurchaseContext);