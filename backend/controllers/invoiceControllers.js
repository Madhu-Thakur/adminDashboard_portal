 const {
  createInvoice,
  getAllInvoices,
  getInvoicesByCustomerId,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} = require("../models/invoiceModel");

const db = require("../config/db");

const calculateGSTFromGrandTotal = (grandTotal, gstApplicable, isSameState) => {
  const total = Number(grandTotal);

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("Grand total must be a valid positive amount");
  }

  // Outside India → GST not applicable
  if (!gstApplicable) {
    return {
      subtotal: Number(total.toFixed(2)),
      cgst: 0,
      sgst: 0,
      igst: 0,
      grand_total: Number(total.toFixed(2)),
    };
  }

  // Grand total includes 18% GST
  const taxableAmount = total / 1.18;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isSameState) {
    cgst = taxableAmount * 0.09;
    sgst = taxableAmount * 0.09;
  } else {
    igst = taxableAmount * 0.18;
  }

  return {
    subtotal: Number(taxableAmount.toFixed(2)),
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    grand_total: Number(total.toFixed(2)),
  };
};

const getGSTType = async (addressId) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        state,
        country
      FROM address_table
      WHERE id = ?
    `,
    [addressId],
  );

  if (rows.length === 0) {
    throw new Error("Selected billing address not found");
  }

  const address = rows[0];

  // Must be the same as frontend
  const DEEM_STATE = "Punjab";

  const customerCountry = String(address.country || "")
    .trim()
    .toLowerCase();

  const customerState = String(address.state || "")
    .trim()
    .toLowerCase();

  // Outside India
  if (customerCountry !== "india") {
    return {
      gstApplicable: false,
      isSameState: false,
    };
  }

  const isSameState = customerState === DEEM_STATE.toLowerCase();

  return {
    gstApplicable: true,
    isSameState,
  };
};

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one invoice item is required");
  }

  for (const item of items) {
    if (!item.item_name || !item.item_name.trim()) {
      throw new Error("Item name is required");
    }

    if (
      item.amount !== undefined &&
      item.amount !== null &&
      item.amount !== "" &&
      Number(item.amount) < 0
    ) {
      throw new Error("Item amount cannot be negative");
    }
  }
};

/*
 * Calculate invoice item amounts from taxable amount.
 *
 * Item 2 is optional.
 *
 * Example:
 * Grand Total = 23600
 * Taxable Amount = 20000
 * Item 2 = 7000
 *
 * Item 1 = 20000 - 7000 = 13000
 * Item 2 = 7000
 *
 * If Item 2 is blank:
 * Item 1 = full taxable amount
 * Item 2 = 0
 */
const calculateItemAmounts = (items, taxableAmount) => {
  const item2 = items[1];

  const item2Amount =
    item2 &&
    item2.amount !== undefined &&
    item2.amount !== null &&
    item2.amount !== ""
      ? Number(item2.amount)
      : 0;

  if (!Number.isFinite(item2Amount) || item2Amount < 0) {
    throw new Error("Item 2 amount must be a valid non-negative amount");
  }

  if (item2Amount > taxableAmount) {
    throw new Error(
      "Item 2 amount cannot be greater than taxable amount",
    );
  }

  const item1Amount = taxableAmount - item2Amount;

  const calculatedItems = [
    {
      item_name: items[0].item_name.trim(),
      hsn: items[0].hsn || null,
      amount: Number(item1Amount.toFixed(2)),
    },
  ];
 
  if (item2 && item2.item_name && item2.item_name.trim()) {
    calculatedItems.push({
      item_name: item2.item_name.trim(),
      hsn: item2.hsn || null,
      amount: Number(item2Amount.toFixed(2)),
    });
  }

  return calculatedItems;
};

const addInvoice = async (req, res) => {
  try {
    const {
      customer_id,
      address_id,
      invoice_date,
      payment_mode,
      payment_status,
      grand_total,
      note,
      items,
    } = req.body;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!address_id) {
      return res.status(400).json({
        success: false,
        message: "Billing address is required",
      });
    }

    if (!invoice_date) {
      return res.status(400).json({
        success: false,
        message: "Invoice date is required",
      });
    }

    if (!payment_mode) {
      return res.status(400).json({
        success: false,
        message: "Payment mode is required",
      });
    }

    if (
      grand_total === undefined ||
      grand_total === null ||
      grand_total === "" ||
      !Number.isFinite(Number(grand_total)) ||
      Number(grand_total) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Grand total must be greater than 0",
      });
    }

    try {
      validateItems(items);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const gstInfo = await getGSTType(address_id);

    const gst = calculateGSTFromGrandTotal(
      grand_total,
      gstInfo.gstApplicable,
      gstInfo.isSameState,
    );

    let calculatedItems;

    try {
      calculatedItems = calculateItemAmounts(items, gst.subtotal);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const result = await createInvoice(
      {
        customer_id,

        address_id,

        invoice_date,

        payment_mode,

        payment_status: payment_status || "Pending",

        subtotal: gst.subtotal,

        cgst: gst.cgst,

        sgst: gst.sgst,

        igst: gst.igst,

        grand_total: gst.grand_total,

        note: note || null,
      },

      calculatedItems,
    );

    return res.status(201).json({
      success: true,

      message: "Invoice created successfully",

      data: {
        id: result.id,

        invoice_number: result.invoice_number,

        subtotal: gst.subtotal,

        cgst: gst.cgst,

        sgst: gst.sgst,

        igst: gst.igst,

        grand_total: gst.grand_total,

        items: calculatedItems,
      },
    });
  } catch (error) {
    console.error("Create Invoice Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to create invoice",

      error: error.message,
    });
  }
};

const getInvoices = async (req, res) => {
  try {
    const invoices = await getAllInvoices();

    return res.status(200).json({
      success: true,

      message: "Invoices fetched successfully",

      data: invoices,
    });
  } catch (error) {
    console.error("Get Invoices Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch invoices",

      error: error.message,
    });
  }
};

const getCustomerInvoices = async (req, res) => {
  try {
    const { customerId } = req.params;

    const invoices = await getInvoicesByCustomerId(customerId);

    return res.status(200).json({
      success: true,
      message: "Customer invoices fetched successfully",
      data: invoices,
    });
  } catch (error) {
    console.error("Get Customer Invoices Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer invoices",
      error: error.message,
    });
  }
};

const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Invoice fetched successfully",

      data: invoice,
    });
  } catch (error) {
    console.error("Get Invoice Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch invoice",

      error: error.message,
    });
  }
};

const editInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      customer_id,
      address_id,
      invoice_date,
      payment_mode,
      payment_status,
      grand_total,
      note,
      items,
    } = req.body;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!address_id) {
      return res.status(400).json({
        success: false,
        message: "Billing address is required",
      });
    }

    if (!invoice_date) {
      return res.status(400).json({
        success: false,
        message: "Invoice date is required",
      });
    }

    if (!payment_mode) {
      return res.status(400).json({
        success: false,
        message: "Payment mode is required",
      });
    }

    if (
      grand_total === undefined ||
      grand_total === null ||
      grand_total === "" ||
      !Number.isFinite(Number(grand_total)) ||
      Number(grand_total) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Grand total must be greater than 0",
      });
    }

    try {
      validateItems(items);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const gstInfo = await getGSTType(address_id);

    const gst = calculateGSTFromGrandTotal(
      grand_total,
      gstInfo.gstApplicable,
      gstInfo.isSameState,
    );

    let calculatedItems;

    try {
      calculatedItems = calculateItemAmounts(items, gst.subtotal);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const updated = await updateInvoice(
      id,
      {
        customer_id,

        address_id,

        invoice_date,

        payment_mode,

        payment_status: payment_status || "Pending",

        subtotal: gst.subtotal,

        cgst: gst.cgst,

        sgst: gst.sgst,

        igst: gst.igst,

        grand_total: gst.grand_total,

        note: note || null,
      },

      calculatedItems,
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Invoice updated successfully",

      data: {
        id,

        subtotal: gst.subtotal,

        cgst: gst.cgst,

        sgst: gst.sgst,

        igst: gst.igst,

        grand_total: gst.grand_total,

        items: calculatedItems,
      },
    });
  } catch (error) {
    console.error("Update Invoice Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to update invoice",

      error: error.message,
    });
  }
};

const removeInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteInvoice(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Delete Invoice Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to delete invoice",

      error: error.message,
    });
  }
};

module.exports = {
  addInvoice,
  getInvoices,
  getCustomerInvoices,
  getInvoice,
  editInvoice,
  removeInvoice,
};