const { getSalePurchaseReport } = require("../models/salePurchaseReportModel");

const fetchSalePurchaseReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validate required parameters
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    const selectedMonth = Number(month);
    const selectedYear = Number(year);

    // Validate month
    if (
      !Number.isInteger(selectedMonth) ||
      selectedMonth < 1 ||
      selectedMonth > 12
    ) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12",
      });
    }

    // Validate year
    if (
      !Number.isInteger(selectedYear) ||
      selectedYear < 1000 ||
      selectedYear > 9999
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid year",
      });
    }

    // Calculate selected month's date range
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;

    const nextMonthDate = new Date(Date.UTC(selectedYear, selectedMonth, 1));

    const endDate = [
      nextMonthDate.getUTCFullYear(),
      String(nextMonthDate.getUTCMonth() + 1).padStart(2, "0"),
      "01",
    ].join("-");

    // Fetch report data from model
    const report = await getSalePurchaseReport(startDate, endDate);

    return res.status(200).json({
      success: true,
      data: {
        month: selectedMonth,
        year: selectedYear,
        totalSale: report.totalSale,
        saleGST: report.saleGST,
        totalPurchase: report.totalPurchase,
        purchaseGST: report.purchaseGST,
        difference: report.difference,
        gstDifference: report.gstDifference,
        saleCGST: report.saleCGST,
        saleSGST: report.saleSGST,
        saleIGST: report.saleIGST,
        purchaseCGST: report.purchaseCGST,
        purchaseSGST: report.purchaseSGST,
        purchaseIGST: report.purchaseIGST,
        saleCount: report.saleCount,
        purchaseCount: report.purchaseCount,
      },
    });
  } catch (error) {
    console.error("Sale & Purchase Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Sale & Purchase Report",
    });
  }
};

module.exports = {
  fetchSalePurchaseReport,
};
