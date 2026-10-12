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
              WHEN voucher_type = 'Purchase' THEN amount
              ELSE 0
            END
          ),
          0
        ) AS totalPurchase

      FROM vouchers
      WHERE transaction_date >= ?
        AND transaction_date < ?
    `,
    [startDate, endDate],
  );

  const totalSale = Number(rows[0].totalSale) || 0;
  const totalPurchase = Number(rows[0].totalPurchase) || 0;

  return {
    totalSale,
    totalPurchase,
    difference: totalSale - totalPurchase,
  };
};

module.exports = {
  getSalePurchaseReport,
};