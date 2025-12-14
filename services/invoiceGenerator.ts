import { jsPDF } from "jspdf";
import { QuoteFormData } from "../types";
import { COMPANY_INFO } from "../constants";

export const generateInvoice = (data: QuoteFormData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Corporate Colors
  const colors = {
    navy: [0, 40, 85],       // #002855 (Brand Dark)
    cyan: [0, 174, 239],     // #00AEEF (Brand Accent)
    darkGray: [55, 65, 81],  // #374151
    lightGray: [243, 244, 246], // #f3f4f6
    white: [255, 255, 255]
  };

  // --- HELPER: Draw Geometric Logo ---
  const drawLogoIcon = (x: number, y: number, size: number) => {
    doc.setFillColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
    doc.triangle(x, y + size, x + size/2, y, x + size, y + size, 'F');
    doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
    doc.triangle(x, y + size * 0.6, x + size/2, y + size * 1.6, x + size, y + size * 0.6, 'F');
  };

  // --- 1. WATERMARK (Centered Background) ---
  doc.setTextColor(200, 200, 200); 
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  doc.text("BUZZITECH", pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
  
  // --- 2. HEADER SECTION ---
  doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Attempt to load custom logo from settings
  let logoDrawn = false;
  try {
      const settings = localStorage.getItem('buzzitech_settings');
      if (settings) {
          const parsed = JSON.parse(settings);
          if (parsed.logoUrl && parsed.logoUrl.startsWith('data:image')) {
              // Add Custom Logo Image if it is a Data URI (Base64)
              // We assume standard aspect ratio, restrict height to ~15
              doc.addImage(parsed.logoUrl, 'PNG', margin, 15, 30, 15, undefined, 'FAST');
              logoDrawn = true;
          }
      }
  } catch (e) {
      console.warn("Could not load custom logo into PDF", e);
  }

  // Fallback to geometric if no image
  if (!logoDrawn) {
      drawLogoIcon(margin, 20, 12);
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  // Adjust X position based on logo type (Image vs Vector)
  const titleX = logoDrawn ? margin + 35 : margin + 18;
  doc.text("BUZZITECH", titleX, 30);
  
  doc.setFontSize(9);
  doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.setFont("helvetica", "bold");
  doc.setCharSpace(2);
  doc.text("IT SOLUTIONS & SERVICES", titleX, 35);
  doc.setCharSpace(0);

  const metaX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(220, 220, 220);
  doc.text("ESTIMATE", metaX, 32, { align: "right" });

  const invoiceNum = `EST-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString();
  const labelOffset = 40; 

  doc.setFontSize(10);
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.setFont("helvetica", "bold");
  doc.text(`Reference:`, metaX - labelOffset, 42, { align: "left" });
  doc.text(`Date:`, metaX - labelOffset, 48, { align: "left" });
  
  doc.setFont("helvetica", "normal");
  doc.text(`#${invoiceNum}`, metaX, 42, { align: "right" });
  doc.text(dateStr, metaX, 48, { align: "right" });

  // --- 3. ADDRESS & BILLING ---
  const billingY = 65;
  doc.setFontSize(8);
  doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.setFont("helvetica", "bold");
  doc.text("FROM:", margin, billingY);
  
  doc.setFontSize(10);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(COMPANY_INFO.name, margin, billingY + 6);
  
  doc.setFontSize(9);
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY_INFO.address, margin, billingY + 11);
  doc.text(COMPANY_INFO.email, margin, billingY + 16);
  doc.text(COMPANY_INFO.phone, margin, billingY + 21);

  const billToX = pageWidth / 2 + 20;
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.roundedRect(billToX - 5, billingY - 5, (pageWidth/2) - margin - 15, 35, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", billToX, billingY);

  doc.setFontSize(11);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text(data.name.toUpperCase(), billToX, billingY + 6);

  doc.setFontSize(9);
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.setFont("helvetica", "normal");
  doc.text(data.phone || "Phone not provided", billToX, billingY + 12);
  doc.text(data.email || "Email not provided", billToX, billingY + 17);
  
  // Show Selected Service Type
  if (data.serviceType) {
    doc.setFont("helvetica", "bold");
    doc.text("Project: " + data.serviceType, billToX, billingY + 23);
  }

  // --- 4. ITEMS TABLE ---
  const tableY = 110;
  
  // Header Bar
  doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.rect(margin, tableY, pageWidth - (margin * 2), 10, 'F');
  
  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ITEM / DESCRIPTION", margin + 5, tableY + 6);
  doc.text("QTY", pageWidth - margin - 50, tableY + 6);
  doc.text("UNIT", pageWidth - margin - 30, tableY + 6);
  doc.text("TOTAL (GHS)", pageWidth - margin - 5, tableY + 6, { align: "right" });

  // Rows Logic
  let currentY = tableY + 18;
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.setFontSize(10);

  // Loop through items
  data.items.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    
    // Check for page overflow
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20; // Reset Y
    }

    doc.setFont("helvetica", "bold");
    doc.text(item.name, margin + 5, currentY);

    // Light description (Category + Optional Item Description) below item name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    
    let subText = item.category;
    if (item.description) {
        subText += ` - ${item.description}`;
    }
    
    // Handle long text wrapping for subText if necessary, or just truncate for now
    doc.text(subText, margin + 5, currentY + 4);

    // Reset Font for values
    doc.setFontSize(10);
    doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
    
    // Qty
    doc.text(item.quantity.toString(), pageWidth - margin - 50, currentY);
    
    // Unit Price
    doc.text(item.price.toLocaleString(), pageWidth - margin - 30, currentY);
    
    // Total
    doc.setFont("helvetica", "bold");
    doc.text(lineTotal.toLocaleString(), pageWidth - margin - 5, currentY, { align: "right" });

    // Divider Line
    currentY += 12;
    doc.setDrawColor(240, 240, 240);
    doc.line(margin, currentY - 4, pageWidth - margin, currentY - 4);
  });

  // Additional Description / Notes
  if (data.description && data.description.trim() !== "") {
     currentY += 5;
     doc.setFontSize(9);
     doc.setFont("helvetica", "italic");
     doc.setTextColor(100, 100, 100);
     const splitNotes = doc.splitTextToSize("Notes: " + data.description, pageWidth - (margin * 2));
     doc.text(splitNotes, margin + 5, currentY);
     currentY += (splitNotes.length * 5) + 5;
  }

  // --- 5. TOTALS ---
  const totalY = currentY + 10;
  const totalLabelX = pageWidth - margin - 60;
  const totalValueX = pageWidth - margin - 5;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text("Total Estimate:", totalLabelX, totalY);
  
  // GHS Currency Highlight
  doc.setFontSize(14);
  doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.text(`GHS ${data.grandTotal.toLocaleString()}`, totalValueX, totalY, { align: "right" });

  // --- 6. FOOTER & TERMS ---
  const footerY = pageHeight - 35;
  
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(0, footerY - 5, pageWidth, 40, 'F');

  doc.setFontSize(8);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.setFont("helvetica", "bold");
  doc.text("TERMS & CONDITIONS", margin, footerY + 5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.text("1. This estimate is valid for 14 days from the date of issue.", margin, footerY + 10);
  doc.text("2. A 70% mobilization fee is required to commence work.", margin, footerY + 15);
  doc.text("3. Final pricing subject to site survey and hardware cost fluctuations.", margin, footerY + 20);

  // Bottom Branding Line
  doc.setFillColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
  doc.rect(0, pageHeight - 2, pageWidth, 2, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.text("Thank you for choosing Buzzitech!", pageWidth - margin, footerY + 25, { align: "right" });

  doc.save(`Buzzitech_Quote_${invoiceNum}.pdf`);
};