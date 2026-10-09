const db = require("../config/db");

// Create Purchase
const createPurchase = async ({
  cname,
  idate,
  ino,
  cgst,
  sgst,
  igst,
  tamount,
  file,
  status = 1,
}) => {
  const [result] = await db.execute(
    `
      INSERT INTO purchase
      (
        cname,
        idate,
        ino,
        cgst,
        sgst,
        igst,
        tamount,
        file,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      String(cname || "").trim(),
      idate,
      String(ino || "").trim(),
      Number(cgst) || 0,
      Number(sgst) || 0,
      Number(igst) || 0,
      Number(tamount) || 0,
      file || null,
      status,
    ]
  );

  return result.insertId;
};

// Get All Purchases
const getAllPurchases = async () => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        cname,
        idate,
        ino,
        cgst,
        sgst,
        igst,
        tamount,
        file,
        status
      FROM purchase
      ORDER BY id DESC
    `
  );

  return rows;
};

// Get Purchase By ID
const getPurchaseById = async (id) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        cname,
        idate,
        ino,
        cgst,
        sgst,
        igst,
        tamount,
        file,
        status
      FROM purchase
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
};