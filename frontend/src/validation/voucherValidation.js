  export const validateVoucher = (data) => {
  const errors = {};

  if (!data.voucherType) {
    errors.voucherType = "Voucher type is required";
  }
 
  if (data.voucherType === "Sale") {
    if (!data.transactionDate) {
      errors.transactionDate = "Transaction date is required";
    }

    if (!data.transactionType) {
      errors.transactionType = "Transaction type is required";
    }

    if (
      !data.transactionNumber?.trim() &&
      data.transactionType !== "Cash"
    ) {
      errors.transactionNumber = "Transaction number is required";
    }

    if (!data.invoiceId) {
      errors.invoice = "Please select an invoice";
    }

    if (!data.narration?.trim()) {
      errors.narration = "Narration is required";
    }
  }
 
  if (data.voucherType === "Purchase") {
    if (!data.purchaseId) {
      errors.purchase = "Please select a purchase";
    }

    if (!data.transactionDate) {
      errors.transactionDate = "Transaction date is required";
    }

    if (!data.transactionType) {
      errors.transactionType = "Transaction type is required";
    }

    if (
      !data.transactionNumber?.trim() &&
      data.transactionType !== "Cash"
    ) {
      errors.transactionNumber = "Transaction number is required";
    }

    if (!data.narration?.trim()) {
      errors.narration = "Narration is required";
    }
  }

  return errors;
};