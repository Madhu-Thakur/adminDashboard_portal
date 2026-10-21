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
              THEN COALESCE(cgst, 0)
                 + COALESCE(sgst, 0)
                 + COALESCE(igst, 0)
              ELSE 0
            END
          ),
          0
        ) AS saleGST,

        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Sale'
              THEN COALESCE(cgst, 0)
              ELSE 0
            END
          ),
          0
        ) AS saleCGST,

        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Sale'
              THEN COALESCE(sgst, 0)
              ELSE 0
            END
          ),
          0
        ) AS saleSGST,

        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Sale'
              THEN COALESCE(igst, 0)
              ELSE 0
            END
          ),
          0
        ) AS saleIGST,

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
              THEN COALESCE(cgst, 0)
                 + COALESCE(sgst, 0)
                 + COALESCE(igst, 0)
              ELSE 0
            END
          ),
          0
        ) AS purchaseGST,

        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Purchase'
              THEN COALESCE(cgst, 0)
              ELSE 0
            END
          ),
          0
        ) AS purchaseCGST,

        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Purchase'
              THEN COALESCE(sgst, 0)
              ELSE 0
            END
          ),
          0
        ) AS purchaseSGST,

        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Purchase'
              THEN COALESCE(igst, 0)
              ELSE 0
            END
          ),
          0
        ) AS purchaseIGST,

        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Sale' THEN 1
              ELSE 0
            END
          ),
          0
        ) AS saleCount,

        COALESCE(
          SUM(
            CASE
              WHEN voucher_type = 'Purchase' THEN 1
              ELSE 0
            END
          ),
          0
        ) AS purchaseCount

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
    // Existing fields: preserve backward compatibility
    totalSale,
    saleGST,
    totalPurchase,
    purchaseGST,
    difference: totalSale - totalPurchase,
    gstDifference: saleGST - purchaseGST,

    // Detailed Sales GST
    saleCGST: Number(rows[0].saleCGST) || 0,
    saleSGST: Number(rows[0].saleSGST) || 0,
    saleIGST: Number(rows[0].saleIGST) || 0,

    // Detailed Purchase GST
    purchaseCGST: Number(rows[0].purchaseCGST) || 0,
    purchaseSGST: Number(rows[0].purchaseSGST) || 0,
    purchaseIGST: Number(rows[0].purchaseIGST) || 0,

    // Monthly voucher counts
    saleCount: Number(rows[0].saleCount) || 0,
    purchaseCount: Number(rows[0].purchaseCount) || 0,
  };
};

module.exports = {
  getSalePurchaseReport,
};
