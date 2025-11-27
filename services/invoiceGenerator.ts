import { jsPDF } from "jspdf";
import { QuoteFormData } from "../types";
import { COMPANY_INFO } from "../constants";

export const generateInvoice = (data: QuoteFormData) => {
  const doc = new jsPDF();

  // Colors
  const primaryColor = "#002855"; // Navy
  const secondaryColor = "#3b82f6"; // Blue
  const grayColor = "#64748b";

  // --- Header ---
  doc.setFontSize(22);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("BUZZITECH IT SOLUTIONS", 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.setFont("helvetica", "normal");
  doc.text("Professional IT Services & Consultancy", 20, 26);
  doc.text(`Phone: ${COMPANY_INFO.phone}`, 20, 31);
  doc.text(`Email: ${COMPANY_INFO.email}`, 20, 36);
  doc.text(`Address: ${COMPANY_INFO.address}`, 20, 41);

  // --- Invoice Title & Date ---
  doc.setFontSize(16);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("ESTIMATE / PROFORMA INVOICE", 120, 20);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const date = new Date().toLocaleDateString();
  const invoiceNum = `EST-${Math.floor(Math.random() * 10000)}`;
  doc.text(`Date: ${date}`, 120, 30);
  doc.text(`Ref #: ${invoiceNum}`, 120, 35);

  // --- Client Details ---
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 50, 190, 50);

  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, 60);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(data.name, 20, 68);
  doc.text(data.email, 20, 74);
  doc.text(data.phone, 20, 80);

  // --- Service Details Table ---
  const startY = 95;
  
  // Table Header
  doc.setFillColor(primaryColor);
  doc.rect(20, startY, 170, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Service Description", 25, startY + 7);
  doc.text("Timeline", 130, startY + 7);
  doc.text("Est. Budget", 160, startY + 7);

  // Table Row
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  // Service Title
  doc.text(data.serviceType, 25, startY + 20);
  
  // Wrap Description
  const splitDescription = doc.splitTextToSize(data.description, 90);
  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.text(splitDescription, 25, startY + 26);
  
  // Timeline & Budget
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(data.timeline || "TBD", 130, startY + 20);
  doc.text(data.budget ? `GHS ${data.budget}` : "TBD", 160, startY + 20);

  // --- Footer / Disclaimer ---
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setDrawColor(secondaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 40, 190, pageHeight - 40);

  doc.setFontSize(9);
  doc.setTextColor(grayColor);
  doc.text("This is an electronically generated estimate based on your initial request.", 20, pageHeight - 30);
  doc.text("Final pricing is subject to technical assessment. Valid for 30 days.", 20, pageHeight - 25);
  
  doc.setFontSize(10);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Thank you for choosing Buzzitech!", 20, pageHeight - 15);

  // Save
  doc.save(`Buzzitech_Estimate_${data.name.replace(/\s+/g, '_')}.pdf`);
};