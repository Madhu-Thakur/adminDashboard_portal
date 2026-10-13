 const db = require("../config/db");

const getSalePurchaseReport = async (startDate, endDate) => {
  const [rows] = await db.execute(
    `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Sale' THEN amount
              ELSE 0
            END
          ),
          0
        ) AS totalSale,

        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Sale'
              THEN COALESCE(cgst, 0) + COALESCE(sgst, 0) + COALESCE(igst, 0)
              ELSE 0
            END
          ),
          0
        ) AS saleGST,

        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Purchase' THEN amount
              ELSE 0
            END
          ),
          0
        ) AS totalPurchase,

        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Purchase'
              THEN COALESCE(cgst, 0) + COALESCE(sgst, 0) + COALESCE(igst, 0)
              ELSE 0
            END
          ),
          0
        ) AS purchaseGST

      FROM vouchers
      WHERE transaction_date >= ?
        AND transaction_date < ?
    `,
    [startDate, endDate],
  );

  const totalSale = Number(rows[0].totalSale) || 0;
  const saleGST = Number(rows[0].saleGST) || 0;
  const totalPurchase = Number(rows[0].totalPurchase) || 0;
  const purchaseGST = Number(rows[0].purchaseGST) || 0;

  return {
    totalSale,
    saleGST,
    totalPurchase,
    purchaseGST,
    difference: totalSale - totalPurchase,
    gstDifference: saleGST - purchaseGST,
  };
};

module.exports = {
  getSalePurchaseReport,
};