 const {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
} = require("../models/purchaseModel");
const addPurchase = async (req, res) => {
  try {
    const {
      cname,
      idate,
      ino,
      gstType,
      gstAmount,
      tamount,
      status,
    } = req.body;

    if (!cname || !String(cname).trim()) {
      return res.status(400).json({
        success: false,
        message: "Company Name is required",
      });
    }

    if (!idate) {
      return res.status(400).json({
        success: false,
        message: "Invoice Date is required",
      });
    }

    if (!ino || !String(ino).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invoice Number is required",
      });
    }

    // Total Amount is still required
    if (
      tamount === undefined ||
      tamount === null ||
      tamount === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Total Amount is required",
      });
    }

    // Blank GST Amount defaults to zero
    const totalGst =
      gstAmount === undefined ||
      gstAmount === null ||
      String(gstAmount).trim() === ""
        ? 0
        : Number(gstAmount);

    const totalAmount = Number(tamount);

    if (!Number.isFinite(totalGst) || totalGst < 0) {
      return res.status(400).json({
        success: false,
        message: "GST Amount must be a valid non-negative number",
      });
    }

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Total Amount must be a valid non-negative number",
      });
    }

    // GST Type is required only when GST Amount is greater than zero
    if (totalGst > 0 && !["state", "other"].includes(gstType)) {
      return res.status(400).json({
        success: false,
        message: "GST Type must be either state or other when GST is entered",
      });
    }

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (totalGst > 0 && gstType === "state") {
      cgst = Number((totalGst / 2).toFixed(2));
      sgst = Number((totalGst - cgst).toFixed(2));
    }

    if (totalGst > 0 && gstType === "other") {
      igst = Number(totalGst.toFixed(2));
    }

    let fileUrl = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      fileUrl = result.secure_url;
    }

    const purchaseId = await createPurchase({
      cname: String(cname).trim(),
      idate,
      ino: String(ino).trim(),
      cgst,
      sgst,
      igst,
      tamount: totalAmount,
      file: fileUrl,
      status: status ?? 1,
    });

    return res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      purchaseId,
      file: fileUrl,
      gst: {
        type: totalGst > 0 ? gstType : null,
        cgst,
        sgst,
        igst,
      },
    });
  } catch (error) {
    console.error("Add Purchase Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create purchase",
      error: error.message,
    });
  }
};

 
const getPurchases = async (req, res) => {
  try {
    const purchases = await getAllPurchases();

    return res.status(200).json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    console.error("Get Purchases Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchases",
      error: error.message,
    });
  }
};

const getPurchase = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Purchase ID is required",
      });
    }

    const purchase = await getPurchaseById(id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error("Get Purchase Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase",
      error: error.message,
    });
  }
};


module.exports = {
  addPurchase,
  getPurchases,
  getPurchase,
};