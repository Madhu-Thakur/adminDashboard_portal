import jsPDF from "jspdf";

import { INVOICE_API_URL } from "./api";
import { formatDate } from "./invoiceUtils";

const formatPdfAmount = (value) => {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
};

const numberToWords = (amount) => {
  const number = Math.round(Number(amount || 0));

  if (number === 0) {
    return "Zero";
  }

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];

  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convertBelowThousand = (num) => {
    let result = "";

    if (num >= 100) {
      result += `${ones[Math.floor(num / 100)]} Hundred `;
      num %= 100;
    }

    if (num >= 20) {
      result += `${tens[Math.floor(num / 10)]} `;
      num %= 10;
    }

    if (num >= 10) {
      result += `${teens[num - 10]} `;
      num = 0;
    }

    if (num > 0) {
      result += `${ones[num]} `;
    }

    return result.trim();
  };

  let result = "";

  if (number >= 10000000) {
    result += `${convertBelowThousand(Math.floor(number / 10000000))} Crore `;
  }

  let remainder = number % 10000000;

  if (remainder >= 100000) {
    result += `${convertBelowThousand(Math.floor(remainder / 100000))} Lakh `;
  }

  remainder %= 100000;

  if (remainder >= 1000) {
    result += `${convertBelowThousand(Math.floor(remainder / 1000))} Thousand `;
  }

  remainder %= 1000;

  if (remainder > 0) {
    result += convertBelowThousand(remainder);
  }

  return result.trim();
};

const amountInWords = (amount) => {
  const number = Number(amount || 0);

  const rupees = Math.floor(number);
  const paise = Math.round((number - rupees) * 100);

  let result = `${numberToWords(rupees)} Rupees`;

  if (paise > 0) {
    result += ` and ${numberToWords(paise)} Paise`;
  }

  return `${result} Only`;
};

export const downloadInvoicePdf = async (invoiceId) => {
  try {
    const response = await fetch(`${INVOICE_API_URL}/${invoiceId}`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch invoice details");
    }

    const invoiceData = result.data;

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const outerMargin = 8;
    const contentPadding = 10;

    const left = outerMargin + contentPadding;
    const right = pageWidth - outerMargin - contentPadding;
    const contentWidth = right - left;

    let y = 18;
 
    doc.setLineWidth(0.5);

    doc.rect(
      outerMargin,
      outerMargin,
      pageWidth - outerMargin * 2,
      pageHeight - outerMargin * 2,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);

    doc.text("ASWEBWORKS LLP", pageWidth / 2, y, {
      align: "center",
    });

    y += 5;

    doc.setFontSize(8.5);

    doc.setFont("helvetica", "bold");
    doc.text("Registered Address:", 20, y);

    doc.setFont("helvetica", "normal");
    doc.text(
      "P. No. 9-B, St. No. 4/4, Basti Jodhewal, Bhagwan Nagar, Ludhiana, Punjab, 141007",
      54,
      y,
    );

    y += 4;

    doc.setFont("helvetica", "bold");
    doc.text("Corporate Address:", 20, y);

    doc.setFont("helvetica", "normal");
    doc.text(
      "2nd Floor, Pakhowal Rd, opp. Nehru Sidhant Kender, Ludhiana, Punjab 141001",
      54,
      y,
    );

    y += 4;

    doc.text("+91 78887 07384, info@aswebworks.com", pageWidth / 2, y, {
      align: "center",
    });

    y += 4;

    doc.setFont("helvetica", "bold");

    doc.text("GSTIN: 03ABZFA5484G1Z1", pageWidth / 2, y, {
      align: "center",
    });

    y += 7;

    doc.setFontSize(13);

    doc.text("TAX INVOICE", pageWidth / 2, y, {
      align: "center",
    });

    y += 7;
 
    const detailsTop = y;
    const detailsHeight = 31;
    const middleX = pageWidth / 2;

    doc.setLineWidth(0.4);

    doc.rect(left, detailsTop, contentWidth, detailsHeight);

    doc.line(middleX, detailsTop, middleX, detailsTop + detailsHeight);

    doc.setFontSize(9);

    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", left + 3, detailsTop + 6);

    doc.setFont("helvetica", "normal");

    const customerName = invoiceData.customer_name || "-";

    doc.text(customerName, left + 3, detailsTop + 11);

    const address = invoiceData.address || {};

    const billAddress = [
      address.address,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    const addressLines = doc.splitTextToSize(
      billAddress || "-",
      middleX - left - 8,
    );

    doc.text(addressLines, left + 3, detailsTop + 16);

    if (address.gst_number) {
      doc.setFont("helvetica", "bold");

      doc.text(`GSTIN: ${address.gst_number}`, left + 3, detailsTop + 26);
    }
 
    const detailX = middleX + 4;

    doc.setFont("helvetica", "bold");

    doc.text("Invoice No:", detailX, detailsTop + 7);

    doc.setFont("helvetica", "normal");

    doc.text(invoiceData.invoice_number || "-", detailX + 28, detailsTop + 7);

    doc.setFont("helvetica", "bold");

    doc.text("Date:", detailX, detailsTop + 14);

    doc.setFont("helvetica", "normal");

    doc.text(
      invoiceData.invoice_date
        ? formatDate(String(invoiceData.invoice_date).slice(0, 10))
        : "-",
      detailX + 28,
      detailsTop + 14,
    );

    doc.setFont("helvetica", "bold");

    doc.text("Place of Supply:", detailX, detailsTop + 21);

    doc.setFont("helvetica", "normal");

    doc.text(address.state || "-", detailX + 28, detailsTop + 21);

    y = detailsTop + detailsHeight;

    const tableTop = y;

    const descriptionWidth = 78;
    const hsnWidth = 27;
    const gstWidth = 25;
    const amountWidth = contentWidth - descriptionWidth - hsnWidth - gstWidth;

    const rowHeight = 8;

    const xDescription = left;
    const xHsn = xDescription + descriptionWidth;
    const xGst = xHsn + hsnWidth;
    const xAmount = xGst + gstWidth;

    const items = invoiceData.items || [];
 
    const tableHeight = 105;

    doc.rect(left, tableTop, contentWidth, tableHeight);

    doc.line(xHsn, tableTop, xHsn, tableTop + tableHeight);

    doc.line(xGst, tableTop, xGst, tableTop + tableHeight);

    doc.line(xAmount, tableTop, xAmount, tableTop + tableHeight);

    doc.line(left, tableTop + rowHeight, right, tableTop + rowHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);

    doc.text(
      "Description of Service",
      xDescription + descriptionWidth / 2,
      tableTop + 5,
      {
        align: "center",
      },
    );

    doc.text("HSN", xHsn + hsnWidth / 2, tableTop + 5, {
      align: "center",
    });

    doc.text("GST %", xGst + gstWidth / 2, tableTop + 5, {
      align: "center",
    });

    doc.text("Amount", xAmount + amountWidth / 2, tableTop + 5, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");

    let itemY = tableTop + rowHeight + 7;

    items.forEach((item) => {
      if (itemY > tableTop + tableHeight - 5) {
        return;
      }

      doc.text(
        String(item.item_name || "-"),
        xDescription + descriptionWidth / 2,
        itemY,
        {
          align: "center",
        },
      );

      doc.text(String(item.hsn || "-"), xHsn + hsnWidth / 2, itemY, {
        align: "center",
      });

      const gstRate =
        Number(invoiceData.igst || 0) > 0
          ? "18%"
          : Number(invoiceData.cgst || 0) > 0 ||
              Number(invoiceData.sgst || 0) > 0
            ? "18%"
            : "0%";

      doc.text(gstRate, xGst + gstWidth / 2, itemY, {
        align: "center",
      });

      doc.text(formatPdfAmount(item.amount), xAmount + amountWidth / 2, itemY, {
        align: "center",
      });

      itemY += 8;
    });
 
    const bottomTop = tableTop + tableHeight;

    const bottomLeftWidth = contentWidth * 0.62;

    const bottomLeftX = left;
    const bottomRightX = left + bottomLeftWidth;

    doc.line(bottomRightX, bottomTop, bottomRightX, pageHeight - 15);

    let leftY = bottomTop + 7;

    doc.setFontSize(8.5);

    doc.setFont("helvetica", "bold");

    doc.text("Amount in Words:", bottomLeftX + 3, leftY);

    leftY += 4;

    doc.setFont("helvetica", "normal");

    const totalWords = doc.splitTextToSize(
      amountInWords(invoiceData.grand_total),
      bottomLeftWidth - 8,
    );

    doc.text(totalWords, bottomLeftX + 3, leftY);

    leftY += totalWords.length * 4 + 5;

    doc.setFont("helvetica", "bold");

    doc.text("Tax Amount (in words):", bottomLeftX + 3, leftY);

    leftY += 4;

    doc.setFont("helvetica", "normal");

    const taxAmount =
      Number(invoiceData.cgst || 0) +
      Number(invoiceData.sgst || 0) +
      Number(invoiceData.igst || 0);

    const taxWords = doc.splitTextToSize(
      amountInWords(taxAmount),
      bottomLeftWidth - 8,
    );

    doc.text(taxWords, bottomLeftX + 3, leftY);

    leftY += taxWords.length * 4 + 5;

    doc.setFont("helvetica", "bold");

    doc.text("Declaration:", bottomLeftX + 3, leftY);

    leftY += 4;

    doc.setFont("helvetica", "normal");

    const declaration =
      "We declare that this invoice shows the actual price of the services described and that all particulars are true and correct.";

    const declarationLines = doc.splitTextToSize(
      declaration,
      bottomLeftWidth - 8,
    );

    doc.text(declarationLines, bottomLeftX + 3, leftY);

    leftY += declarationLines.length * 4 + 5;

    doc.setFont("helvetica", "bold");

    doc.text("Terms & Conditions:", bottomLeftX + 3, leftY);

    leftY += 4;

    doc.setFont("helvetica", "normal");

    doc.text("Payment due within agreed terms.", bottomLeftX + 3, leftY);

    leftY += 7;

    doc.setFont("helvetica", "bold");

    doc.text("Payment Mode:", bottomLeftX + 3, leftY);

    doc.setFont("helvetica", "normal");

    doc.text(
      `${invoiceData.payment_mode || "-"} (${invoiceData.payment_status || "-"})`,
      bottomLeftX + 30,
      leftY,
    );

    let rightY = bottomTop + 7;

    const totalX = bottomRightX + 4;
    const valueX = right - 4;

    const addSummaryRow = (label, value, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");

      doc.text(label, totalX, rightY);

      doc.text(formatPdfAmount(value), valueX, rightY, {
        align: "right",
      });

      rightY += 7;
    };

    addSummaryRow("Sub Total", invoiceData.subtotal);

    addSummaryRow("CGST (9%)", invoiceData.cgst);

    addSummaryRow("SGST (9%)", invoiceData.sgst);

    addSummaryRow("IGST (18%)", invoiceData.igst);

    rightY += 2;

    doc.setFont("helvetica", "bold");

    doc.text("Total Amount", totalX, rightY);

    doc.text(`₹ ${formatPdfAmount(invoiceData.grand_total)}`, valueX, rightY, {
      align: "right",
    });

    rightY += 9;
 
    const taxTableWidth = right - totalX;

    const taxColWidth = taxTableWidth / 5;

    const taxTableTop = rightY;

    const taxTableHeight = 15;

    doc.rect(totalX, taxTableTop, taxTableWidth, taxTableHeight);

    for (let i = 1; i < 5; i++) {
      doc.line(
        totalX + taxColWidth * i,
        taxTableTop,
        totalX + taxColWidth * i,
        taxTableTop + taxTableHeight,
      );
    }

    doc.line(totalX, taxTableTop + 7, right, taxTableTop + 7);

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");

    const taxHeaders = ["SAC", "Taxable", "CGST", "SGST", "Total Tax"];

    taxHeaders.forEach((header, index) => {
      doc.text(
        header,
        totalX + taxColWidth * index + taxColWidth / 2,
        taxTableTop + 5,
        {
          align: "center",
        },
      );
    });

    doc.setFont("helvetica", "normal");

    const firstItem = items[0] || {};

    const taxValues = [
      firstItem.hsn || "-",
      formatPdfAmount(invoiceData.subtotal),
      formatPdfAmount(invoiceData.cgst),
      formatPdfAmount(invoiceData.sgst),
      formatPdfAmount(taxAmount),
    ];

    taxValues.forEach((value, index) => {
      doc.text(
        String(value),
        totalX + taxColWidth * index + taxColWidth / 2,
        taxTableTop + 12,
        {
          align: "center",
        },
      );
    });
 
    const signatureY = pageHeight - 27;

    doc.setFontSize(8.5);

    doc.setFont("helvetica", "normal");

    doc.text("For ASWEBWORKS LLP", right - 5, signatureY - 12, {
      align: "right",
    });

    doc.line(right - 45, signatureY - 3, right - 5, signatureY - 3);

    doc.text("Authorised Signatory", right - 25, signatureY + 3, {
      align: "center",
    });
 
    const fileName = `${(invoiceData.invoice_number || "invoice").replace(
      /\//g,
      "_",
    )}.pdf`;

    doc.save(fileName);
  } catch (error) {
    console.error("Download Invoice Error:", error);

    window.alert(error.message || "Failed to download invoice.");
  }
};
