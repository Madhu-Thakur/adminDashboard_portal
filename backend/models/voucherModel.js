const db = require("../config/db");

const createVoucher = async (voucherData) => {
  const {
    voucher_type,
    transaction_number,
    transaction_date,
    transaction_type,
    invoice_id,
    purchase_id,
    customer_id,
    amount,
    cgst,
    sgst,
    igst,
    narration,
  } = voucherData;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let finalAmount = Number(amount) || 0;
    let finalCustomerId = customer_id || null;
    let finalCgst = Number(cgst) || 0;
    let finalSgst = Number(sgst) || 0;
    let finalIgst = Number(igst) || 0;
    let finalInvoiceId = invoice_id || null;
    let finalPurchaseId = purchase_id || null;

    // =========================
    // SALE VOUCHER
    // =========================
    if (voucher_type === "Sale") {
      if (!invoice_id) {
        throw new Error("Invoice is required for Sale Voucher");
      }

      // Get invoice details
      const [invoiceRows] = await connection.execute(
        `
          SELECT
            id,
            customer_id,
            grand_total,
            payment_status,
            cgst,
            sgst,
            igst
          FROM invoices
          WHERE id = ?
          LIMIT 1
        `,
        [invoice_id],
      );

      if (invoiceRows.length === 0) {
        throw new Error("Invoice not found");
      }

      const invoice = invoiceRows[0];

      const [existingVoucherRows] = await connection.execute(
        `
          SELECT id
          FROM vouchers
          WHERE invoice_id = ?
            AND voucher_type = 'Sale'
          LIMIT 1
        `,
        [invoice_id],
      );

      if (existingVoucherRows.length > 0) {
        throw new Error(
          "Sale Voucher already exists for this invoice",
        );
      }

      finalAmount = Number(invoice.grand_total) || 0;

      finalCustomerId = invoice.customer_id;

      finalCgst = Number(invoice.cgst) || 0;
      finalSgst = Number(invoice.sgst) || 0;
      finalIgst = Number(invoice.igst) || 0;

      finalInvoiceId = invoice.id;
      finalPurchaseId = null;

      const [customerRows] = await connection.execute(
        `
          SELECT
            id,
            balance
          FROM customers
          WHERE id = ?
          LIMIT 1
        `,
        [finalCustomerId],
      );

      if (customerRows.length === 0) {
        throw new Error("Customer not found");
      }

      const currentBalance =
        Number(customerRows[0].balance) || 0;

      if (finalAmount > currentBalance) {
        throw new Error(
          `Invoice amount (${finalAmount}) cannot be greater than customer balance (${currentBalance})`,
        );
      }

      // Insert Sale Voucher
      const [result] = await connection.execute(
        `
          INSERT INTO vouchers
          (
            voucher_type,
            transaction_number,
            transaction_date,
            transaction_type,
            invoice_id,
            purchase_id,
            customer_id,
            amount,
            cgst,
            sgst,
            igst,
            narration
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          voucher_type,
          transaction_number || "",
          transaction_date,
          transaction_type,
          finalInvoiceId,
          finalPurchaseId,
          finalCustomerId,
          finalAmount,
          finalCgst,
          finalSgst,
          finalIgst,
          narration || null,
        ],
      );

      const newBalance = currentBalance - finalAmount;

      await connection.execute(
        `
          UPDATE customers
          SET balance = ?
          WHERE id = ?
        `,
        [newBalance, finalCustomerId],
      );

      await connection.commit();

      return result.insertId;
    }

    // =========================
    // PURCHASE VOUCHER
    // =========================
    if (voucher_type === "Purchase") {
      if (!purchase_id) {
        throw new Error("Purchase is required for Purchase Voucher");
      }

      // Get selected purchase details
      const [purchaseRows] = await connection.execute(
        `
          SELECT
            id,
            cname,
            idate,
            ino,
            cgst,
            sgst,
            igst,
            tamount
          FROM purchase
          WHERE id = ?
          LIMIT 1
        `,
        [purchase_id],
      );

      if (purchaseRows.length === 0) {
        throw new Error("Purchase not found");
      }

      const purchase = purchaseRows[0];

      // Check whether a voucher already exists for this purchase
      const [existingVoucherRows] = await connection.execute(
        `
          SELECT id
          FROM vouchers
          WHERE purchase_id = ?
            AND voucher_type = 'Purchase'
          LIMIT 1
        `,
        [purchase_id],
      );

      if (existingVoucherRows.length > 0) {
        throw new Error(
          "Purchase Voucher already exists for this purchase",
        );
      }

      finalPurchaseId = purchase.id;
      finalInvoiceId = null;

      // Purchase table is the source of purchase amount and GST
      finalAmount = Number(purchase.tamount) || 0;

      finalCgst = Number(purchase.cgst) || 0;
      finalSgst = Number(purchase.sgst) || 0;
      finalIgst = Number(purchase.igst) || 0;

      // Insert Purchase Voucher
      const [result] = await connection.execute(
        `
          INSERT INTO vouchers
          (
            voucher_type,
            transaction_number,
            transaction_date,
            transaction_type,
            invoice_id,
            purchase_id,
            customer_id,
            amount,
            cgst,
            sgst,
            igst,
            narration
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          voucher_type,
          transaction_number || "",
          transaction_date,
          transaction_type,
          finalInvoiceId,
          finalPurchaseId,
          finalCustomerId,
          finalAmount,
          finalCgst,
          finalSgst,
          finalIgst,
          narration || null,
        ],
      );

      await connection.commit();

      return result.insertId;
    }

    throw new Error("Invalid voucher type");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
 
const getAllVouchers = async ({
  voucherType = "",
  startDate = "",
  endDate = "",
} = {}) => {
  let query = `
    SELECT
      v.id,
      v.voucher_type,
      v.serial_number,
      v.transaction_number,
      v.transaction_date,
      v.transaction_type,
      v.invoice_id,
      v.purchase_id,
      v.customer_id,
      v.amount,
      v.cgst,
      v.sgst,
      v.igst,
      v.narration,
      v.created_at,
      v.updated_at,

      c.customer_name,

      i.invoice_number,
      i.invoice_date,

      p.cname AS purchase_company_name,
      p.ino AS purchase_invoice_number,
      p.idate AS purchase_invoice_date

    FROM vouchers v

    LEFT JOIN customers c
      ON c.id = v.customer_id

    LEFT JOIN invoices i
      ON i.id = v.invoice_id

    LEFT JOIN purchase p
      ON p.id = v.purchase_id

    WHERE 1 = 1
  `;

  const params = [];

  // Voucher Type filter
  if (voucherType) {
    query += ` AND v.voucher_type = ?`;
    params.push(voucherType);
  }

  // Start Date filter
  if (startDate) {
    query += ` AND DATE(v.transaction_date) >= ?`;
    params.push(startDate);
  }

  // End Date filter
  if (endDate) {
    query += ` AND DATE(v.transaction_date) <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY v.id DESC`;

  const [rows] = await db.execute(query, params);

  return rows;
};
 
const getAvailableSaleInvoices = async () => {
  const [rows] = await db.execute(
    `
      SELECT
        i.id,
        i.invoice_number,
        i.customer_id,
        c.customer_name,
        i.invoice_date,
        i.payment_status,
        i.grand_total,
        i.cgst,
        i.sgst,
        i.igst
      FROM invoices i
      JOIN customers c
        ON c.id = i.customer_id
      LEFT JOIN vouchers v
        ON v.invoice_id = i.id
        AND v.voucher_type = 'Sale'
      WHERE v.id IS NULL
      ORDER BY i.invoice_date DESC, i.id DESC
    `,
  );

  return rows;
};
 
const getAvailablePurchases = async () => {
  const [rows] = await db.execute(
    `
      SELECT
        p.id,
        p.cname,
        p.idate,
        p.ino,
        p.cgst,
        p.sgst,
        p.igst,
        p.tamount,
        p.file,
        p.status
      FROM purchase p
      LEFT JOIN vouchers v
        ON v.purchase_id = p.id
        AND v.voucher_type = 'Purchase'
      WHERE v.id IS NULL
        AND p.status = 1
      ORDER BY p.idate DESC, p.id DESC
    `,
  );

  return rows;
};

module.exports = {
  createVoucher,
  getAllVouchers,
  getAvailableSaleInvoices,
  getAvailablePurchases,
};