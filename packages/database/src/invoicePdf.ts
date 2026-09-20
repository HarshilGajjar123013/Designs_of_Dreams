import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { prisma } from './client';
import { fallbackDb } from './fallbackDb';

// The Indian Rupee symbol: decimal 8377 (&#8377;)
export const RUPEE_SYMBOL = String.fromCharCode(8377);

/**
 * Extracts normalized phone number from order object
 */
export function extractCustomerPhone(order: any): string {
  if (!order) return '';
  if (order.customerPhone) return String(order.customerPhone);
  if (order.phone) return String(order.phone);
  if (order.shippingAddress) {
    if (typeof order.shippingAddress === 'object' && order.shippingAddress !== null) {
      return String(order.shippingAddress.phone || '');
    }
    if (typeof order.shippingAddress === 'string') {
      try {
        const parsed = JSON.parse(order.shippingAddress);
        return String(parsed.phone || '');
      } catch {
        return '';
      }
    }
  }
  return '';
}

/**
 * Generates the requested invoice PDF filename:
 * Starts with Customer Name, Phone No, Bill No, Designs of Dreams, and Thank you see you again.
 * Format: "CustomerName_Phone_INV-DOD-XXXXXX_Designs_of_Dreams_Thank_You_See_You_Again.pdf"
 */
export function generateInvoiceFileName(order: any): string {
  const rawName = (order.customerName || 'Customer').trim();
  const cleanName = rawName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'Customer';
  
  const rawPhone = extractCustomerPhone(order) || '9313507346';
  const cleanPhone = rawPhone.replace(/[^\d]/g, '') || 'Phone';
  
  const billNo = `INV-${order.id || 'DOD'}`;
  
  return `${cleanName}_${cleanPhone}_${billNo}_Designs_of_Dreams_Thank_You_See_You_Again.pdf`;
}

/**
 * Resolves bespoke customization specifications associated with an order
 */
export async function resolveOrderCustomizations(order: any): Promise<any[]> {
  const customs: any[] = [];

  // 1. Direct properties on order
  if (Array.isArray(order.customizationDetails)) {
    for (const c of order.customizationDetails) {
      customs.push(typeof c === 'string' ? { summaryLine: c } : c);
    }
  }
  if (order.customizationConfig) {
    customs.push(typeof order.customizationConfig === 'string' ? { summaryLine: order.customizationConfig } : order.customizationConfig);
  }

  // 2. Direct on order items
  if (Array.isArray(order.items)) {
    for (const it of order.items) {
      if (it.customization) {
        customs.push(typeof it.customization === 'string' ? { summaryLine: it.customization } : it.customization);
      }
    }
  }

  // 3. Query CustomizationRequest table/collection
  let allRequests: any[] = [];
  try {
    allRequests = await (prisma as any).customizationRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch {
    allRequests = fallbackDb.getCollection('customizationRequests');
  }

  // Ensure strict newest/latest order first
  allRequests.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const orderProductIds = new Set((order.items || []).map((it: any) => String(it.productId || it.id)));
  const phone = String(order.customerPhone || order.phone || (typeof order.shippingAddress === 'object' ? order.shippingAddress?.phone : '')).replace(/[^\d]/g, '');
  const email = (order.customerEmail || '').toLowerCase();
  const customerId = order.customerId;

  for (const req of allRequests) {
    const reqPhone = String(req.customerPhone || '').replace(/[^\d]/g, '');
    const reqEmail = String(req.customerEmail || '').toLowerCase();
    const matchesProduct = orderProductIds.has(String(req.productId));
    const matchesCustomer = (customerId && req.customerId === customerId) ||
                            (email && reqEmail === email) ||
                            (phone && (reqPhone.includes(phone) || phone.includes(reqPhone)));

    if (matchesProduct || matchesCustomer) {
      const summaryLine = [
        req.fabric ? `Fabric: ${req.fabric}` : '',
        req.color ? `Colour: ${req.color}` : '',
        req.aemroduriType ? `Embroidery: ${req.aemroduriType}` : '',
        req.tassels ? `Tassels: ${req.tassels}` : '',
      ].filter(Boolean).join(' · ');

      customs.push({
        ...req,
        summaryLine: summaryLine || `Custom Request (${req.id})`,
      });

      // The user wants strictly the latest one customization
      break;
    }
  }

  return customs.slice(0, 1);
}

/**
 * Helper to safely locate and read TrueType font bytes containing the &#8377; Rupee glyph
 */
function getFontBytes(isBold = false): Buffer | null {
  const filename = isBold ? 'SegoeUI-Bold.ttf' : 'SegoeUI.ttf';
  const windowsFallback = isBold ? 'C:/Windows/Fonts/segoeuib.ttf' : 'C:/Windows/Fonts/segoeui.ttf';
  const arialFallback = isBold ? 'C:/Windows/Fonts/arialbd.ttf' : 'C:/Windows/Fonts/arial.ttf';

  const paths = [
    path.join(__dirname, 'fonts', filename),
    path.join(__dirname, '..', 'src', 'fonts', filename),
    path.join(process.cwd(), 'packages', 'database', 'src', 'fonts', filename),
    path.join(process.cwd(), 'src', 'fonts', filename),
    'C:/Users/harsh/Desktop/DOD/packages/database/src/fonts/' + filename,
    windowsFallback,
    arialFallback,
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      try {
        return fs.readFileSync(p);
      } catch {}
    }
  }
  return null;
}

/**
 * Draws right-aligned price with authentic decimal 8377 (&#8377;) Indian Rupee symbol
 */
function drawPriceRightAligned(
  page: any,
  rightX: number,
  y: number,
  amount: number | string,
  fontSize: number,
  fontText: any,
  fontRupee: any,
  color = rgb(0.12, 0.12, 0.12)
) {
  const numStr = (Number(amount) || 0).toLocaleString('en-IN');
  const rupeeChar = String.fromCharCode(8377); // &#8377; (U+20B9)

  if (fontRupee) {
    const fullString = `${rupeeChar}${numStr}`;
    const textWidth = fontRupee.widthOfTextAtSize(fullString, fontSize);
    page.drawText(fullString, {
      x: rightX - textWidth,
      y,
      size: fontSize,
      font: fontRupee,
      color,
    });
  } else {
    // Fallback if font is unavailable
    const fullString = `Rs. ${numStr}`;
    const textWidth = fontText.widthOfTextAtSize(fullString, fontSize);
    page.drawText(fullString, {
      x: rightX - textWidth,
      y,
      size: fontSize,
      font: fontText,
      color,
    });
  }
}

/**
 * Generates an elegant, high-definition A4 Tax Invoice PDF matching the exact reference layout
 * including bespoke customization details.
 */
export async function generateInvoicePdfBuffer(order: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 (72 DPI)
  const { width, height } = page.getSize();

  // Load TrueType fonts supporting Unicode &#8377; (8377)
  let fontRupeeReg: any = null;
  let fontRupeeBold: any = null;

  const regFontBytes = getFontBytes(false);
  const boldFontBytes = getFontBytes(true);

  if (regFontBytes) {
    try {
      fontRupeeReg = await pdfDoc.embedFont(regFontBytes, { subset: true });
    } catch {}
  }
  if (boldFontBytes) {
    try {
      fontRupeeBold = await pdfDoc.embedFont(boldFontBytes, { subset: true });
    } catch {}
  }

  // Base Standard fonts
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontBold = fontRupeeBold || (await pdfDoc.embedFont(StandardFonts.HelveticaBold));
  const fontRegular = fontRupeeReg || (await pdfDoc.embedFont(StandardFonts.Helvetica));

  const orange = rgb(0.96, 0.35, 0.0); // Vibrant Atelier Orange (#FF5500 / #FF6A00)
  const darkGray = rgb(0.12, 0.12, 0.12);
  const mediumGray = rgb(0.45, 0.45, 0.45);
  const lightGray = rgb(0.55, 0.55, 0.55);
  const borderGray = rgb(0.90, 0.90, 0.90);
  const tableHeaderBg = rgb(0.97, 0.97, 0.97);

  const leftMargin = 45;
  const rightMargin = width - 45;
  const contentWidth = rightMargin - leftMargin;

  let y = height - 50;

  // 1. Header Row
  // Embed Logo Image if available
  const possibleLogoPaths = [
    path.join(process.cwd(), 'dodshop/public/logo.png'),
    path.join(process.cwd(), 'Dashbord/public/logo.png'),
    path.join(process.cwd(), 'public/logo.png'),
    'C:/Users/harsh/Desktop/DOD/dodshop/public/logo.png',
    'C:/Users/harsh/Desktop/DOD/Dashbord/public/logo.png',
  ];
  let logoEmbedded = false;
  for (const lp of possibleLogoPaths) {
    if (fs.existsSync(lp)) {
      try {
        const logoBytes = fs.readFileSync(lp);
        const logoImage = await pdfDoc.embedPng(logoBytes);
        page.drawImage(logoImage, {
          x: leftMargin,
          y: y - 38,
          width: 38,
          height: 38,
        });
        logoEmbedded = true;
        break;
      } catch {}
    }
  }

  // Brand Name & Subtitle
  const brandX = logoEmbedded ? leftMargin + 48 : leftMargin;
  page.drawText('DESIGNS OF DREAMS', {
    x: brandX,
    y: y - 16,
    size: 19,
    font: fontTimesBold,
    color: orange,
  });

  page.drawText('HERITAGE ATELIER — HANDLOOM MASTERPIECES', {
    x: brandX,
    y: y - 30,
    size: 7.5,
    font: fontBold,
    color: mediumGray,
  });

  // TAX INVOICE Pill (Top Right)
  const pillW = 100;
  const pillH = 26;
  const pillX = rightMargin - pillW;
  const pillY = y - 32;

  page.drawRectangle({
    x: pillX,
    y: pillY,
    width: pillW,
    height: pillH,
    color: orange,
    borderWidth: 0,
  });

  page.drawText('TAX INVOICE', {
    x: pillX + 16,
    y: pillY + 8,
    size: 9.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  y -= 48;

  // Solid Orange Divider Line below Header
  page.drawLine({
    start: { x: leftMargin, y },
    end: { x: rightMargin, y },
    thickness: 1.5,
    color: orange,
  });

  y -= 25;

  // 2. Invoice Meta Row (3 Columns)
  // Col 1: Invoice Number
  page.drawText('INVOICE NUMBER', { x: leftMargin, y, size: 7.5, font: fontBold, color: lightGray });
  page.drawText(`INV-${order.id}`, { x: leftMargin, y: y - 14, size: 12, font: fontBold, color: orange });

  // Col 2: Order ID
  const col2X = leftMargin + 190;
  page.drawText('ORDER ID', { x: col2X, y, size: 7.5, font: fontBold, color: lightGray });
  page.drawText(String(order.id), { x: col2X, y: y - 14, size: 11, font: fontBold, color: darkGray });

  // Col 3: Invoice Date (Right Aligned)
  const invoiceDateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const dateLabelW = fontBold.widthOfTextAtSize('INVOICE DATE', 7.5);
  const dateValW = fontBold.widthOfTextAtSize(invoiceDateStr, 10);
  const col3X = rightMargin - Math.max(dateLabelW, dateValW);

  page.drawText('INVOICE DATE', { x: col3X, y, size: 7.5, font: fontBold, color: lightGray });
  page.drawText(invoiceDateStr, { x: col3X, y: y - 14, size: 10, font: fontBold, color: darkGray });

  y -= 30;

  // Divider Line
  page.drawLine({ start: { x: leftMargin, y }, end: { x: rightMargin, y }, thickness: 0.8, color: borderGray });

  y -= 20;

  // 3. Billed To & Sold By Row
  const billedToY = y;

  // Left Column: Customer
  page.drawText('BILLED TO', { x: leftMargin, y: billedToY, size: 7.5, font: fontBold, color: lightGray });
  let custY = billedToY - 14;
  page.drawText(order.customerName || 'Valued Customer', { x: leftMargin, y: custY, size: 10, font: fontBold, color: darkGray });
  custY -= 12;

  if (order.customerEmail) {
    page.drawText(order.customerEmail, { x: leftMargin, y: custY, size: 8.5, font: fontRegular, color: mediumGray });
    custY -= 11;
  }

  const rawPhone = extractCustomerPhone(order);
  if (rawPhone) {
    const formattedPhone = rawPhone.startsWith('+') ? rawPhone : (rawPhone.length === 10 ? `+91 ${rawPhone}` : `+${rawPhone}`);
    page.drawText(formattedPhone, { x: leftMargin, y: custY, size: 8.5, font: fontRegular, color: mediumGray });
    custY -= 11;
  }

  // Address lines
  if (order.shippingAddress) {
    let addrObj: any = order.shippingAddress;
    if (typeof addrObj === 'string') {
      try { addrObj = JSON.parse(addrObj); } catch { addrObj = { line1: order.shippingAddress }; }
    }
    if (addrObj.line1) {
      page.drawText(String(addrObj.line1).slice(0, 48), { x: leftMargin, y: custY, size: 8.5, font: fontRegular, color: mediumGray });
      custY -= 11;
    }
    if (addrObj.line2) {
      page.drawText(String(addrObj.line2).slice(0, 48), { x: leftMargin, y: custY, size: 8.5, font: fontRegular, color: mediumGray });
      custY -= 11;
    }
    const cityStateZip = [addrObj.city, addrObj.state, addrObj.postalCode].filter(Boolean).join(', ');
    if (cityStateZip) {
      page.drawText(cityStateZip.slice(0, 48), { x: leftMargin, y: custY, size: 8.5, font: fontRegular, color: mediumGray });
      custY -= 11;
    }
  }

  // Right Column: Sold By
  const soldByX = leftMargin + 240;
  page.drawText('SOLD BY', { x: soldByX, y: billedToY, size: 7.5, font: fontBold, color: lightGray });
  let soldY = billedToY - 14;
  page.drawText('Designs Of Dreams Pvt. Ltd.', { x: soldByX, y: soldY, size: 10, font: fontBold, color: darkGray });
  soldY -= 12;
  page.drawText('Atelier Workshop, Heritage Weave District', { x: soldByX, y: soldY, size: 8.5, font: fontRegular, color: mediumGray });
  soldY -= 11;
  page.drawText('Varanasi, Uttar Pradesh 221001', { x: soldByX, y: soldY, size: 8.5, font: fontRegular, color: mediumGray });
  soldY -= 11;
  page.drawText('GSTIN: 09AABCD1234E1Z5', { x: soldByX, y: soldY, size: 8.5, font: fontRegular, color: mediumGray });

  y = Math.min(custY, soldY) - 15;

  // Divider Line
  page.drawLine({ start: { x: leftMargin, y }, end: { x: rightMargin, y }, thickness: 0.8, color: borderGray });

  y -= 20;

  // Resolve Customizations for this order
  const customizations = await resolveOrderCustomizations(order);

  // 4. Item Description Table
  page.drawRectangle({
    x: leftMargin,
    y: y - 16,
    width: contentWidth,
    height: 22,
    color: tableHeaderBg,
  });

  const colDescX = leftMargin + 10;
  const colQtyX = leftMargin + 295;
  const colPriceX = leftMargin + 365;
  const colTotalX = rightMargin - 10;

  page.drawText('ITEM DESCRIPTION', { x: colDescX, y: y - 10, size: 7.5, font: fontBold, color: lightGray });
  page.drawText('QTY', { x: colQtyX, y: y - 10, size: 7.5, font: fontBold, color: lightGray });
  page.drawText('UNIT PRICE', { x: colPriceX, y: y - 10, size: 7.5, font: fontBold, color: lightGray });
  
  const totalHeaderW = fontBold.widthOfTextAtSize('TOTAL', 7.5);
  page.drawText('TOTAL', { x: colTotalX - totalHeaderW, y: y - 10, size: 7.5, font: fontBold, color: lightGray });

  y -= 32;

  // Items List
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{ name: 'Heritage Collection Piece', quantity: 1, price: order.grandTotal || 0, size: 'Free Size', sku: `DOD-SKU-${order.id}` }];

  for (const it of items) {
    const itemName = String(it.name || it.title || 'Artisanal Piece');
    const itemQty = Number(it.quantity) || 1;
    const itemPrice = Number(it.price) || 0;
    const itemTotal = itemPrice * itemQty;
    const itemSize = it.size || 'Free Size';
    const itemSku = it.sku || it.productId || `DOD-SKU-${String(order.id).slice(0, 8)}`;

    // Check if this item has matched customization
    const matchedCustom = customizations.find((c: any) => String(c.productId) === String(it.productId || it.id));

    // Item Title
    page.drawText(itemName.slice(0, 42), {
      x: colDescX,
      y,
      size: 9.5,
      font: fontBold,
      color: darkGray,
    });

    // Item Subtitle (Size | SKU)
    page.drawText(`Size: ${itemSize} | SKU: ${itemSku}`.slice(0, 60), {
      x: colDescX,
      y: y - 11,
      size: 7.5,
      font: fontRegular,
      color: lightGray,
    });

    if (matchedCustom) {
      page.drawText(`✨ Bespoke Custom: ${matchedCustom.fabric || ''} | ${matchedCustom.color || ''}`.slice(0, 55), {
        x: colDescX,
        y: y - 20,
        size: 7,
        font: fontBold,
        color: orange,
      });
    }

    // QTY
    page.drawText(String(itemQty), {
      x: colQtyX + 5,
      y,
      size: 9.5,
      font: fontRegular,
      color: darkGray,
    });

    // Unit Price (&#8377;)
    drawPriceRightAligned(page, colPriceX + 45, y, itemPrice, 9.5, fontRegular, fontRupeeReg, darkGray);

    // Total (&#8377;) (Right Aligned)
    drawPriceRightAligned(page, colTotalX, y, itemTotal, 9.5, fontBold, fontRupeeBold, darkGray);

    y -= matchedCustom ? 32 : 28;
  }

  // Line below items
  page.drawLine({ start: { x: leftMargin, y: y + 8 }, end: { x: rightMargin, y: y + 8 }, thickness: 0.8, color: borderGray });

  y -= 4;

  // 4B. Bespoke Customization Section Box (if customizations exist)
  if (customizations.length > 0) {
    const cust = customizations[0];
    const custBoxW = contentWidth;
    const custBoxH = 54;
    const custBoxX = leftMargin;
    const custBoxY = y - custBoxH;

    // Soft warm ivory card with gold/amber border
    page.drawRectangle({
      x: custBoxX,
      y: custBoxY,
      width: custBoxW,
      height: custBoxH,
      color: rgb(0.99, 0.97, 0.94),
      borderColor: rgb(0.95, 0.82, 0.65),
      borderWidth: 1,
    });

    // Header badge inside box
    page.drawText('👑 BESPOKE CUSTOMIZATION DETAILS', {
      x: custBoxX + 12,
      y: custBoxY + custBoxH - 14,
      size: 8,
      font: fontBold,
      color: rgb(0.72, 0.33, 0.04), // Warm amber #b45309
    });

    // Detail Line 1: Fabric, Color, Embroidery, Tassels
    const specLine1 = [
      cust.fabric ? `Fabric: ${cust.fabric}` : '',
      cust.color ? `Colour: ${cust.color}` : '',
      cust.aemroduriType ? `Embroidery: ${cust.aemroduriType}` : '',
      cust.tassels ? `Tassels: ${cust.tassels}` : '',
    ].filter(Boolean).join('   |   ') || cust.summaryLine || 'Handcrafted bespoke weave specifications';

    page.drawText(specLine1.slice(0, 95), {
      x: custBoxX + 12,
      y: custBoxY + custBoxH - 28,
      size: 8.5,
      font: fontBold,
      color: darkGray,
    });

    // Detail Line 2: Client Request Notes / Timeline / Budget
    const extraParts: string[] = [];
    if (cust.notes) extraParts.push(`Client Note: "${cust.notes}"`);
    if (cust.timeEstimateMonths) extraParts.push(`Timeline: ${cust.timeEstimateMonths} Months`);
    if (cust.budget) extraParts.push(`Budget: ${cust.budget}`);
    const specLine2 = extraParts.join('   •   ') || 'Special bespoke customization crafted by master artisans.';

    page.drawText(specLine2.slice(0, 95), {
      x: custBoxX + 12,
      y: custBoxY + custBoxH - 42,
      size: 7.5,
      font: fontRegular,
      color: mediumGray,
    });

    y = custBoxY - 14;
  } else {
    y -= 10;
  }

  // 5. Bill Summary / Totals
  const totalsLabelX = leftMargin + 240;
  const totalsRightX = colTotalX;

  const subtotalVal = Number(order.totalAmount) || Number(order.subtotal) || Number(order.grandTotal) || 0;
  const gstVal = Number(order.gstAmount) || Number(order.tax) || Math.round(subtotalVal * 0.05);
  const shippingVal = Number(order.shippingAmount) || Number(order.shipping) || 0;
  const discountVal = Number(order.discountAmount) || Number(order.discount) || 0;
  const grandTotalVal = Number(order.grandTotal) || Number(order.total) || (subtotalVal + gstVal + shippingVal - discountVal);

  // Subtotal
  page.drawText('Subtotal', { x: totalsLabelX, y, size: 9.5, font: fontRegular, color: mediumGray });
  drawPriceRightAligned(page, totalsRightX, y, subtotalVal, 9.5, fontRegular, fontRupeeReg, darkGray);
  y -= 16;

  // GST (5%)
  page.drawText('GST (5%)', { x: totalsLabelX, y, size: 9.5, font: fontRegular, color: mediumGray });
  drawPriceRightAligned(page, totalsRightX, y, gstVal, 9.5, fontRegular, fontRupeeReg, darkGray);
  y -= 16;

  // Shipping
  page.drawText('Shipping', { x: totalsLabelX, y, size: 9.5, font: fontRegular, color: mediumGray });
  if (shippingVal === 0) {
    const freeW = fontBold.widthOfTextAtSize('FREE', 9.5);
    page.drawText('FREE', { x: totalsRightX - freeW, y, size: 9.5, font: fontBold, color: darkGray });
  } else {
    drawPriceRightAligned(page, totalsRightX, y, shippingVal, 9.5, fontRegular, fontRupeeReg, darkGray);
  }
  y -= 16;

  // Discount (if any)
  if (discountVal > 0) {
    page.drawText('Discount', { x: totalsLabelX, y, size: 9.5, font: fontRegular, color: mediumGray });
    drawPriceRightAligned(page, totalsRightX, y, discountVal, 9.5, fontBold, fontRupeeBold, orange);
    y -= 16;
  }

  y -= 10;

  // Grand Total
  page.drawText('Grand Total', { x: totalsLabelX, y, size: 12, font: fontBold, color: darkGray });
  drawPriceRightAligned(page, totalsRightX, y, grandTotalVal, 13.5, fontBold, fontRupeeBold, orange);

  // 6. Footer Divider & Text
  const footerDividerY = 95;
  page.drawLine({
    start: { x: leftMargin, y: footerDividerY },
    end: { x: rightMargin, y: footerDividerY },
    thickness: 0.8,
    color: borderGray,
  });

  // "Thank you, see you again!"
  const thankYouText = 'Thank you for shopping with Designs of Dreams! See you again.';
  const thankYouW = fontBold.widthOfTextAtSize(thankYouText, 8.5);
  page.drawText(thankYouText, {
    x: (width - thankYouW) / 2,
    y: footerDividerY - 18,
    size: 8.5,
    font: fontBold,
    color: darkGray,
  });

  const legalText = 'This is a computer-generated invoice and does not require a physical signature.';
  const legalW = fontRegular.widthOfTextAtSize(legalText, 7.5);
  page.drawText(legalText, {
    x: (width - legalW) / 2,
    y: footerDividerY - 32,
    size: 7.5,
    font: fontRegular,
    color: lightGray,
  });

  const queryPrefix = 'For queries contact us at ';
  const queryEmail = 'support@designsofdreams.in';
  const queryPrefW = fontRegular.widthOfTextAtSize(queryPrefix, 7.5);
  const queryEmailW = fontBold.widthOfTextAtSize(queryEmail, 7.5);
  const totalQueryW = queryPrefW + queryEmailW;
  const queryStartX = (width - totalQueryW) / 2;

  page.drawText(queryPrefix, {
    x: queryStartX,
    y: footerDividerY - 44,
    size: 7.5,
    font: fontRegular,
    color: lightGray,
  });
  page.drawText(queryEmail, {
    x: queryStartX + queryPrefW,
    y: footerDividerY - 44,
    size: 7.5,
    font: fontBold,
    color: orange,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
