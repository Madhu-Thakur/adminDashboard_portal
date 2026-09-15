const {
  createVoucher,
  getAllVouchers,
  getAvailableSaleInvoices,
} = require("../models/voucherModel");

const { getInvoiceById } = require("../models/invoiceModel");

const isNonNegativeNumber = (value) => {
  return (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    Number.isFinite(Number(value)) &&
    Number(value) >= 0
  );
};

// Create Voucher
const addVoucher = async (req, res) => {
  try {
    const {
      voucher_type,
      transaction_number,
      transaction_date,
      transaction_type,
      invoice_id,
      amount,
      cgst,
      sgst,
      igst,
      narration,
    } = req.body;

    if (!voucher_type || !["Sale", "Purchase"].includes(voucher_type)) {
      return res.status(400).json({
        success: false,
        message: "Voucher type is required and must be Sale or Purchase",
      });
    }

    if (
      transaction_type !== "Cash" &&
      (!transaction_number || !String(transaction_number).trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Transaction number is required",
      });
    }

    if (!transaction_date) {
      return res.status(400).json({
        success: false,
        message: "Transaction date is required",
      });
    }

    if (!transaction_type || !String(transaction_type).trim()) {
      return res.status(400).json({
        success: false,
        message: "Transaction type is required",
      });
    }

    let finalInvoiceId = null;
    let finalCustomerId = null;
    let finalAmount = 0;
    let finalCgst = 0;
    let finalSgst = 0;
    let finalIgst = 0;

    // Sale Voucher
    if (voucher_type === "Sale") {
      if (!invoice_id) {
        return res.status(400).json({
          success: false,
          message: "Invoice is required for Sale vouchers",
        });
      }

      const invoice = await getInvoiceById(invoice_id);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Selected invoice not found",
        });
      }
 
      finalInvoiceId = Number(invoice_id);
      finalCustomerId = invoice.customer_id;
      finalAmount = Number(invoice.grand_total) || 0;

      finalCgst = Number(invoice.cgst) || 0;
      finalSgst = Number(invoice.sgst) || 0;
      finalIgst = Number(invoice.igst) || 0;
    } else {
      // Purchase Voucher

      if (!isNonNegativeNumber(amount)) {
        return res.status(400).json({
          success: false,
          message:
            "Amount is required and must be a valid non-negative number",
        });
      }

      if (
        cgst !== undefined &&
        cgst !== null &&
        cgst !== "" &&
        Number(cgst) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "CGST cannot be negative",
        });
      }

      if (
        sgst !== undefined &&
        sgst !== null &&
        sgst !== "" &&
        Number(sgst) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "SGST cannot be negative",
        });
      }

      if (
        igst !== undefined &&
        igst !== null &&
        igst !== "" &&
        Number(igst) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "IGST cannot be negative",
        });
      }

      finalAmount = Number(amount) || 0;
      finalCgst = Number(cgst) || 0;
      finalSgst = Number(sgst) || 0;
      finalIgst = Number(igst) || 0;
    }

    const voucherId = await createVoucher({
      voucher_type,
      transaction_number: String(transaction_number || "").trim(),
      transaction_date,
      transaction_type: String(transaction_type).trim(),
      invoice_id: finalInvoiceId,
      customer_id: finalCustomerId,
      amount: finalAmount,
      cgst: finalCgst,
      sgst: finalSgst,
      igst: finalIgst,
      narration: narration || null,
    });

    return res.status(201).json({
      success: true,
      message: "Voucher created successfully",
      data: {
        id: voucherId,
      },
    });
  } catch (error) {
    console.error("Create Voucher Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create voucher",
      error: error.message,
    });
  }
};
 
const getVouchers = async (req, res) => {
  try {
    const { voucher_type, start_date, end_date } = req.query;

    const vouchers = await getAllVouchers({
      voucherType: voucher_type || "",
      startDate: start_date || "",
      endDate: end_date || "",
    });

    return res.status(200).json({
      success: true,
      message: "Vouchers fetched successfully",
      data: vouchers,
    });
  } catch (error) {
    console.error("Get Vouchers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vouchers",
      error: error.message,
    });
  }
};

// Get Available Sale Invoices
const getAvailableSaleInvoicesList = async (req, res) => {
  try {
    const invoices = await getAvailableSaleInvoices();

    return res.status(200).json({
      success: true,
      message: "Available sale invoices fetched successfully",
      data: invoices,
    });
  } catch (error) {
    console.error("Get Available Sale Invoices Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available sale invoices",
      error: error.message,
    });
  }
};

module.exports = {
  addVoucher,
  getVouchers,
  getAvailableSaleInvoicesList,
};