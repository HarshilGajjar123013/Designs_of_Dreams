import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Colors
const primaryColor = rgb(0.10, 0.15, 0.28);    // Deep Navy Blue (#1A2747)
const accentColor = rgb(0.96, 0.35, 0.0);      // Atelier Orange / DOD Coral (#F55900)
const darkGray = rgb(0.18, 0.20, 0.24);       // Charcoal (#2E333D)
const mediumGray = rgb(0.42, 0.45, 0.50);     // Neutral Gray (#6B7380)
const lightGray = rgb(0.94, 0.95, 0.96);      // Light Table Row (#F0F2F5)
const borderGray = rgb(0.84, 0.86, 0.90);     // Border Gray (#D6DBE5)
const white = rgb(1, 1, 1);
const greenAccent = rgb(0.08, 0.58, 0.35);    // Success Green (#159459)
const warmBg = rgb(0.98, 0.97, 0.95);         // Off white background for card boxes

function getFontBytes(isBold = false): Buffer | null {
  const filename = isBold ? 'SegoeUI-Bold.ttf' : 'SegoeUI.ttf';
  const paths = [
    path.join(__dirname, 'fonts', filename),
    path.join(process.cwd(), 'packages', 'database', 'src', 'fonts', filename),
    isBold ? 'C:/Windows/Fonts/segoeuib.ttf' : 'C:/Windows/Fonts/segoeui.ttf',
    isBold ? 'C:/Windows/Fonts/arialbd.ttf' : 'C:/Windows/Fonts/arial.ttf',
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

export async function generateEcommerceCostQuotationPdf(): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Fonts
  let fontRupeeReg: any = null;
  let fontRupeeBold: any = null;
  const regBytes = getFontBytes(false);
  const boldBytes = getFontBytes(true);

  if (regBytes) {
    try { fontRupeeReg = await pdfDoc.embedFont(regBytes, { subset: true }); } catch {}
  }
  if (boldBytes) {
    try { fontRupeeBold = await pdfDoc.embedFont(boldBytes, { subset: true }); } catch {}
  }

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const fontRegular = fontRupeeReg || fontHelvetica;
  const fontBold = fontRupeeBold || fontHelveticaBold;

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN_LEFT = 40;
  const MARGIN_RIGHT = PAGE_WIDTH - 40;
  const CONTENT_WIDTH = MARGIN_RIGHT - MARGIN_LEFT;

  // Helper function to format rupee string
  const rupeeChar = fontRupeeReg ? String.fromCharCode(8377) : 'Rs. ';
  const fmtMoney = (val: number) => `${rupeeChar}${val.toLocaleString('en-IN')}`;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 1: COVER & ONE-TIME DEVELOPMENT BREAKDOWN
  // ══════════════════════════════════════════════════════════════════
  const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 40;

  // Header Banner Background
  page1.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 100,
    width: PAGE_WIDTH,
    height: 100,
    color: primaryColor,
  });

  // Top accent stripe
  page1.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 6,
    width: PAGE_WIDTH,
    height: 6,
    color: accentColor,
  });

  // Header Brand & Title
  page1.drawText('DESIGNS OF DREAMS', {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - 42,
    size: 18,
    font: fontTimesBold,
    color: white,
  });

  page1.drawText('ENGINEERING & DIGITAL SOLUTIONS • CLIENT PROPOSAL', {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - 56,
    size: 8,
    font: fontBold,
    color: accentColor,
  });

  page1.drawText('CLIENT QUOTATION', {
    x: MARGIN_RIGHT - 145,
    y: PAGE_HEIGHT - 42,
    size: 16,
    font: fontHelveticaBold,
    color: white,
  });

  page1.drawText('REF: QUO-2026-DOD-0108', {
    x: MARGIN_RIGHT - 145,
    y: PAGE_HEIGHT - 56,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.8, 0.85, 0.9),
  });

  page1.drawText(`DATE: 22 October 2026  |  VALIDITY: 30 Days`, {
    x: MARGIN_RIGHT - 195,
    y: PAGE_HEIGHT - 70,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.7, 0.75, 0.82),
  });

  y = PAGE_HEIGHT - 120;

  // Project Info Card
  page1.drawRectangle({
    x: MARGIN_LEFT,
    y: y - 56,
    width: CONTENT_WIDTH,
    height: 60,
    color: warmBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page1.drawText('PROJECT NAME:', { x: MARGIN_LEFT + 14, y: y - 18, size: 7.5, font: fontBold, color: mediumGray });
  page1.drawText('Modern Headless E-Commerce Platform & Admin Backoffice Suite', { x: MARGIN_LEFT + 14, y: y - 32, size: 10, font: fontBold, color: primaryColor });
  page1.drawText('SCOPE: Storefront (Next.js) + Operations Dashboard + WhatsApp Cloud API + Automated PDF Invoicing + Payments', { x: MARGIN_LEFT + 14, y: y - 46, size: 7.5, font: fontRegular, color: darkGray });

  page1.drawText('TARGET CLIENT:', { x: MARGIN_LEFT + 340, y: y - 18, size: 7.5, font: fontBold, color: mediumGray });
  page1.drawText('Bespoke E-Commerce Enterprise', { x: MARGIN_LEFT + 340, y: y - 32, size: 10, font: fontBold, color: darkGray });
  page1.drawText('ARCHITECTURE: Headless Next.js + PostgreSQL', { x: MARGIN_LEFT + 340, y: y - 46, size: 7.5, font: fontRegular, color: mediumGray });

  y -= 76;

  // Section 1 Heading: One-Time Development Cost Breakdown
  page1.drawRectangle({
    x: MARGIN_LEFT,
    y: y - 18,
    width: CONTENT_WIDTH,
    height: 22,
    color: rgb(0.92, 0.94, 0.98),
  });
  page1.drawText('1. ONE-TIME CHARGES: SCOPE & DEVELOPMENT BREAKDOWN', {
    x: MARGIN_LEFT + 8,
    y: y - 12,
    size: 9,
    font: fontBold,
    color: primaryColor,
  });

  y -= 26;

  // Table 1 Header
  page1.drawRectangle({
    x: MARGIN_LEFT,
    y: y - 18,
    width: CONTENT_WIDTH,
    height: 18,
    color: primaryColor,
  });

  page1.drawText('#', { x: MARGIN_LEFT + 6, y: y - 13, size: 8, font: fontBold, color: white });
  page1.drawText('MODULE / DELIVERABLE', { x: MARGIN_LEFT + 24, y: y - 13, size: 8, font: fontBold, color: white });
  page1.drawText('DETAILED TECHNICAL SPECIFICATION', { x: MARGIN_LEFT + 155, y: y - 13, size: 8, font: fontBold, color: white });
  page1.drawText('DURATION', { x: MARGIN_LEFT + 395, y: y - 13, size: 8, font: fontBold, color: white });
  page1.drawText('INVESTMENT', { x: MARGIN_RIGHT - 65, y: y - 13, size: 8, font: fontBold, color: white });

  y -= 18;

  const oneTimeModules = [
    {
      num: '01',
      title: 'UI/UX Design & Brand System',
      desc: 'Custom luxury responsive design in Figma, mobile-first design system, design tokens, micro-interactions, typography, and complete prototype approval.',
      duration: '10 Days',
      cost: 35000,
    },
    {
      num: '02',
      title: 'Customer Storefront (Next.js)',
      desc: 'Server-Side Rendered (SSR) storefront, dynamic product catalogue, multi-attribute filter system (size/color/price), bag & wishlist, and order lookup.',
      duration: '18 Days',
      cost: 75000,
    },
    {
      num: '03',
      title: 'Operations & Admin Backoffice',
      desc: 'Order lifecycle management, stock control, bulk product uploads, media gallery, customer CRM directory, cancellation & return approval workflows.',
      duration: '14 Days',
      cost: 50000,
    },
    {
      num: '04',
      title: 'WhatsApp Cloud API Automation',
      desc: 'Meta Business Cloud API integration for automated dual alerts (Order placed, Cancellation, Exchange request, Contact query) with manual retry action.',
      duration: '7 Days',
      cost: 30000,
    },
    {
      num: '05',
      title: 'Payment Gateway & Invoicing',
      desc: 'Razorpay / Stripe integration with webhooks, checksum validation, and automated high-res vector Tax Invoice PDF engine delivered via WhatsApp.',
      duration: '6 Days',
      cost: 25000,
    },
    {
      num: '06',
      title: 'Database & Security Architecture',
      desc: 'Prisma ORM schema design, PostgreSQL database setup, failover fallback engine, JWT role-based authentication, CSRF & SQL-injection protection.',
      duration: '5 Days',
      cost: 20000,
    },
    {
      num: '07',
      title: 'Quality Assurance & Cloud Launch',
      desc: 'Cross-browser & cross-device compatibility testing, load speed optimization (Lighthouse 90+ score), SSL certificate, DNS cutover, and production go-live.',
      duration: '5 Days',
      cost: 15000,
    },
  ];

  let oneTimeTotal = 0;

  oneTimeModules.forEach((mod, idx) => {
    oneTimeTotal += mod.cost;
    const rowH = 46;
    const isEven = idx % 2 === 0;

    page1.drawRectangle({
      x: MARGIN_LEFT,
      y: y - rowH,
      width: CONTENT_WIDTH,
      height: rowH,
      color: isEven ? white : lightGray,
      borderColor: borderGray,
      borderWidth: 0.5,
    });

    // Num
    page1.drawText(mod.num, { x: MARGIN_LEFT + 6, y: y - 18, size: 8, font: fontBold, color: accentColor });

    // Module Title
    page1.drawText(mod.title, { x: MARGIN_LEFT + 24, y: y - 16, size: 8.5, font: fontBold, color: primaryColor });

    // Description (Wrap into two lines if needed)
    const words = mod.desc.split(' ');
    let line1 = '';
    let line2 = '';
    for (const w of words) {
      if ((line1 + ' ' + w).length <= 58) {
        line1 += (line1 ? ' ' : '') + w;
      } else {
        line2 += (line2 ? ' ' : '') + w;
      }
    }

    page1.drawText(line1, { x: MARGIN_LEFT + 155, y: y - 16, size: 7, font: fontRegular, color: darkGray });
    if (line2) {
      page1.drawText(line2, { x: MARGIN_LEFT + 155, y: y - 28, size: 7, font: fontRegular, color: mediumGray });
    }

    // Duration
    page1.drawText(mod.duration, { x: MARGIN_LEFT + 395, y: y - 20, size: 7.5, font: fontRegular, color: darkGray });

    // Cost (Right aligned)
    const costStr = fmtMoney(mod.cost);
    const costW = fontBold.widthOfTextAtSize(costStr, 8.5);
    page1.drawText(costStr, { x: MARGIN_RIGHT - costW - 10, y: y - 20, size: 8.5, font: fontBold, color: darkGray });

    y -= rowH;
  });

  // Table 1 Total Row
  page1.drawRectangle({
    x: MARGIN_LEFT,
    y: y - 26,
    width: CONTENT_WIDTH,
    height: 26,
    color: rgb(0.92, 0.95, 1.0),
    borderColor: primaryColor,
    borderWidth: 1,
  });

  page1.drawText('TOTAL ONE-TIME DEVELOPMENT INVESTMENT:', {
    x: MARGIN_LEFT + 155,
    y: y - 17,
    size: 8.5,
    font: fontBold,
    color: primaryColor,
  });

  const totalCostStr = fmtMoney(oneTimeTotal);
  const totalCostW = fontBold.widthOfTextAtSize(totalCostStr, 11);
  page1.drawText(totalCostStr, {
    x: MARGIN_RIGHT - totalCostW - 10,
    y: y - 18,
    size: 11,
    font: fontBold,
    color: accentColor,
  });

  y -= 44;

  // Note Box at Bottom of Page 1
  page1.drawRectangle({
    x: MARGIN_LEFT,
    y: y - 38,
    width: CONTENT_WIDTH,
    height: 42,
    color: warmBg,
    borderColor: borderGray,
    borderWidth: 0.5,
  });

  page1.drawText('INCLUDED WARRANTIES & COMPLIMENTARY DELIVERABLES:', {
    x: MARGIN_LEFT + 10,
    y: y - 13,
    size: 7.5,
    font: fontBold,
    color: primaryColor,
  });
  page1.drawText('• 60-Day Complimentary Post-Launch Technical Support & Bug Fixing Warranty included.', {
    x: MARGIN_LEFT + 10,
    y: y - 24,
    size: 7,
    font: fontRegular,
    color: darkGray,
  });
  page1.drawText('• Complete Git Repository & 100% intellectual property source code transfer upon final project sign-off.', {
    x: MARGIN_LEFT + 10,
    y: y - 34,
    size: 7,
    font: fontRegular,
    color: darkGray,
  });

  // Page 1 Footer
  page1.drawText('Designs of Dreams Atelier • Confirmed Client Quotation • Page 1 of 2', {
    x: MARGIN_LEFT,
    y: 22,
    size: 7.5,
    font: fontRegular,
    color: mediumGray,
  });
  page1.drawText('www.designsofdreams.com', {
    x: MARGIN_RIGHT - 110,
    y: 22,
    size: 7.5,
    font: fontRegular,
    color: accentColor,
  });

  // ══════════════════════════════════════════════════════════════════
  // PAGE 2: RECURRING COSTS, SUMMARY & PAYMENT TERMS
  // ══════════════════════════════════════════════════════════════════
  const page2 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y2 = PAGE_HEIGHT - 40;

  // Header Banner Page 2
  page2.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 65,
    width: PAGE_WIDTH,
    height: 65,
    color: primaryColor,
  });
  page2.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 5,
    width: PAGE_WIDTH,
    height: 5,
    color: accentColor,
  });

  page2.drawText('DESIGNS OF DREAMS', {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - 34,
    size: 15,
    font: fontTimesBold,
    color: white,
  });
  page2.drawText('E-COMMERCE QUOTATION — RECURRING INFRASTRUCTURE & COMMERCIAL TERMS', {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - 48,
    size: 7.5,
    font: fontBold,
    color: accentColor,
  });
  page2.drawText('REF: QUO-2026-DOD-0108', {
    x: MARGIN_RIGHT - 120,
    y: PAGE_HEIGHT - 38,
    size: 8,
    font: fontRegular,
    color: white,
  });

  y2 = PAGE_HEIGHT - 85;

  // Section 2 Heading: Recurring Operational Infrastructure Charges
  page2.drawRectangle({
    x: MARGIN_LEFT,
    y: y2 - 18,
    width: CONTENT_WIDTH,
    height: 22,
    color: rgb(0.92, 0.94, 0.98),
  });
  page2.drawText('2. RECURRING OPERATIONAL CHARGES (INFRASTRUCTURE & THIRD-PARTY SERVICES)', {
    x: MARGIN_LEFT + 8,
    y: y2 - 12,
    size: 9,
    font: fontBold,
    color: primaryColor,
  });

  y2 -= 26;

  // Table 2 Header
  page2.drawRectangle({
    x: MARGIN_LEFT,
    y: y2 - 18,
    width: CONTENT_WIDTH,
    height: 18,
    color: primaryColor,
  });

  page2.drawText('SERVICE / INFRASTRUCTURE', { x: MARGIN_LEFT + 10, y: y2 - 13, size: 8, font: fontBold, color: white });
  page2.drawText('SERVICE LEVEL & SPECS', { x: MARGIN_LEFT + 175, y: y2 - 13, size: 8, font: fontBold, color: white });
  page2.drawText('BILLING', { x: MARGIN_LEFT + 360, y: y2 - 13, size: 8, font: fontBold, color: white });
  page2.drawText('MONTHLY (EST.)', { x: MARGIN_RIGHT - 130, y: y2 - 13, size: 8, font: fontBold, color: white });
  page2.drawText('ANNUAL (EST.)', { x: MARGIN_RIGHT - 65, y: y2 - 13, size: 8, font: fontBold, color: white });

  y2 -= 18;

  const recurringItems = [
    {
      name: 'High-Availability Cloud Hosting',
      specs: 'Vercel Pro / AWS Serverless Edge CDN, global caching, DDoS protection',
      billing: 'Monthly / Annually',
      monthly: 2500,
      annual: 30000,
    },
    {
      name: 'Managed PostgreSQL Database',
      specs: 'Automated daily backups, point-in-time recovery, high IOPS SSD storage',
      billing: 'Monthly / Annually',
      monthly: 1800,
      annual: 21600,
    },
    {
      name: 'Custom Domain & Wildcard SSL',
      specs: 'Premium .com / .in domain registration and automated 256-bit TLS/SSL',
      billing: 'Annually',
      monthly: 167,
      annual: 2000,
    },
    {
      name: 'Meta WhatsApp Cloud API',
      specs: 'Utility order alerts & updates (First 1,000 service conv./mo free from Meta)',
      billing: 'Usage-based',
      monthly: 1200,
      annual: 14400,
    },
    {
      name: 'Maintenance & Support AMC (Optional)',
      specs: 'Dedicated server monitoring, security patching, minor UI tweaks, 4hr SLA',
      billing: 'Monthly Retainer',
      monthly: 8000,
      annual: 96000,
    },
  ];

  let totalRecMonthly = 0;
  let totalRecAnnual = 0;

  recurringItems.forEach((item, idx) => {
    totalRecMonthly += item.monthly;
    totalRecAnnual += item.annual;

    const rowH = 34;
    const isEven = idx % 2 === 0;

    page2.drawRectangle({
      x: MARGIN_LEFT,
      y: y2 - rowH,
      width: CONTENT_WIDTH,
      height: rowH,
      color: isEven ? white : lightGray,
      borderColor: borderGray,
      borderWidth: 0.5,
    });

    page2.drawText(item.name, { x: MARGIN_LEFT + 10, y: y2 - 14, size: 8, font: fontBold, color: primaryColor });
    page2.drawText(item.specs, { x: MARGIN_LEFT + 175, y: y2 - 14, size: 7, font: fontRegular, color: darkGray });
    page2.drawText(item.billing, { x: MARGIN_LEFT + 360, y: y2 - 14, size: 7.5, font: fontRegular, color: mediumGray });

    // Monthly
    const mStr = fmtMoney(item.monthly);
    const mW = fontRegular.widthOfTextAtSize(mStr, 7.5);
    page2.drawText(mStr, { x: MARGIN_RIGHT - 75 - mW, y: y2 - 14, size: 7.5, font: fontRegular, color: darkGray });

    // Annual
    const aStr = fmtMoney(item.annual);
    const aW = fontBold.widthOfTextAtSize(aStr, 7.5);
    page2.drawText(aStr, { x: MARGIN_RIGHT - 10 - aW, y: y2 - 14, size: 7.5, font: fontBold, color: primaryColor });

    y2 -= rowH;
  });

  // Recurring Total Row
  page2.drawRectangle({
    x: MARGIN_LEFT,
    y: y2 - 24,
    width: CONTENT_WIDTH,
    height: 24,
    color: rgb(0.92, 0.95, 1.0),
    borderColor: primaryColor,
    borderWidth: 1,
  });

  page2.drawText('ESTIMATED RECURRING TOTAL (INC. OPTIONAL AMC):', {
    x: MARGIN_LEFT + 100,
    y: y2 - 16,
    size: 8,
    font: fontBold,
    color: primaryColor,
  });

  const recMStr = fmtMoney(totalRecMonthly) + '/mo';
  const recMW = fontBold.widthOfTextAtSize(recMStr, 8);
  page2.drawText(recMStr, { x: MARGIN_RIGHT - 75 - recMW, y: y2 - 16, size: 8, font: fontBold, color: darkGray });

  const recAStr = fmtMoney(totalRecAnnual) + '/yr';
  const recAW = fontBold.widthOfTextAtSize(recAStr, 8.5);
  page2.drawText(recAStr, { x: MARGIN_RIGHT - 10 - recAW, y: y2 - 16, size: 8.5, font: fontBold, color: accentColor });

  y2 -= 38;

  // ══════════════════════════════════════════════════════════════════
  // GRAND INVESTMENT SUMMARY BOX (3 COLUMNS)
  // ══════════════════════════════════════════════════════════════════
  page2.drawRectangle({
    x: MARGIN_LEFT,
    y: y2 - 68,
    width: CONTENT_WIDTH,
    height: 68,
    color: warmBg,
    borderColor: accentColor,
    borderWidth: 1.5,
  });

  // Box 1: One-Time Development
  page2.drawText('ONE-TIME DEVELOPMENT', { x: MARGIN_LEFT + 16, y: y2 - 18, size: 8, font: fontBold, color: mediumGray });
  page2.drawText(fmtMoney(oneTimeTotal), { x: MARGIN_LEFT + 16, y: y2 - 38, size: 14, font: fontBold, color: primaryColor });
  page2.drawText('Turnkey Custom Platform', { x: MARGIN_LEFT + 16, y: y2 - 54, size: 7, font: fontRegular, color: greenAccent });

  // Divider 1
  page2.drawLine({
    start: { x: MARGIN_LEFT + 165, y: y2 - 10 },
    end: { x: MARGIN_LEFT + 165, y: y2 - 58 },
    color: borderGray,
    thickness: 1,
  });

  // Box 2: Year 1 Infrastructure
  page2.drawText('YEAR 1 INFRASTRUCTURE', { x: MARGIN_LEFT + 180, y: y2 - 18, size: 8, font: fontBold, color: mediumGray });
  page2.drawText(fmtMoney(68000), { x: MARGIN_LEFT + 180, y: y2 - 38, size: 14, font: fontBold, color: primaryColor });
  page2.drawText('Hosting, DB, Domain & WhatsApp', { x: MARGIN_LEFT + 180, y: y2 - 54, size: 7, font: fontRegular, color: mediumGray });

  // Divider 2
  page2.drawLine({
    start: { x: MARGIN_LEFT + 340, y: y2 - 10 },
    end: { x: MARGIN_LEFT + 340, y: y2 - 58 },
    color: borderGray,
    thickness: 1,
  });

  // Box 3: Total 1st Year Turnkey Budget
  page2.drawText('TOTAL 1ST YEAR BUDGET (W/O AMC)', { x: MARGIN_LEFT + 355, y: y2 - 18, size: 8, font: fontBold, color: accentColor });
  page2.drawText(fmtMoney(oneTimeTotal + 68000), { x: MARGIN_LEFT + 355, y: y2 - 38, size: 14, font: fontBold, color: accentColor });
  page2.drawText('One-Time + Full 1st Year Cloud Stack', { x: MARGIN_LEFT + 355, y: y2 - 54, size: 7, font: fontBold, color: darkGray });

  y2 -= 82;

  // Section 3: Payment Milestones & Commercial Terms
  page2.drawRectangle({
    x: MARGIN_LEFT,
    y: y2 - 18,
    width: CONTENT_WIDTH,
    height: 22,
    color: rgb(0.92, 0.94, 0.98),
  });
  page2.drawText('3. PAYMENT MILESTONES & IMPLEMENTATION SCHEDULE', {
    x: MARGIN_LEFT + 8,
    y: y2 - 12,
    size: 9,
    font: fontBold,
    color: primaryColor,
  });

  y2 -= 24;

  const milestones = [
    { p: '30%', name: 'Project Kickoff & Agreement Signing', timing: 'Day 0', amt: fmtMoney(oneTimeTotal * 0.3) },
    { p: '30%', name: 'Figma UI/UX Sign-off & Storefront Frontend Alpha', timing: 'Day 20', amt: fmtMoney(oneTimeTotal * 0.3) },
    { p: '25%', name: 'Admin Dashboard, WhatsApp & Payment Integration', timing: 'Day 38', amt: fmtMoney(oneTimeTotal * 0.25) },
    { p: '15%', name: 'Final QA, User Acceptance Testing (UAT) & Production Launch', timing: 'Day 48', amt: fmtMoney(oneTimeTotal * 0.15) },
  ];

  milestones.forEach((m) => {
    page2.drawRectangle({
      x: MARGIN_LEFT,
      y: y2 - 18,
      width: CONTENT_WIDTH,
      height: 18,
      color: white,
      borderColor: borderGray,
      borderWidth: 0.5,
    });

    page2.drawText(m.p, { x: MARGIN_LEFT + 10, y: y2 - 13, size: 8, font: fontBold, color: accentColor });
    page2.drawText(m.name, { x: MARGIN_LEFT + 55, y: y2 - 13, size: 7.5, font: fontBold, color: darkGray });
    page2.drawText(`Timeline: ${m.timing}`, { x: MARGIN_LEFT + 360, y: y2 - 13, size: 7, font: fontRegular, color: mediumGray });
    
    const amtW = fontBold.widthOfTextAtSize(m.amt, 8);
    page2.drawText(m.amt, { x: MARGIN_RIGHT - amtW - 10, y: y2 - 13, size: 8, font: fontBold, color: primaryColor });

    y2 -= 20;
  });

  y2 -= 10;

  // Signatures & Acceptance Box
  page2.drawRectangle({
    x: MARGIN_LEFT,
    y: y2 - 65,
    width: CONTENT_WIDTH,
    height: 65,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Left: Authorized Solution Provider
  page2.drawText('PROPOSAL ISSUED BY:', { x: MARGIN_LEFT + 14, y: y2 - 16, size: 7, font: fontBold, color: mediumGray });
  page2.drawText('Designs of Dreams Atelier & Engineering', { x: MARGIN_LEFT + 14, y: y2 - 28, size: 8, font: fontBold, color: primaryColor });
  page2.drawText('Authorized Signature: _______________________', { x: MARGIN_LEFT + 14, y: y2 - 52, size: 7.5, font: fontRegular, color: darkGray });

  // Right: Client Acceptance
  page2.drawText('CLIENT ACCEPTANCE & SIGN-OFF:', { x: MARGIN_LEFT + 280, y: y2 - 16, size: 7, font: fontBold, color: mediumGray });
  page2.drawText('Accepted By: ________________________________', { x: MARGIN_LEFT + 280, y: y2 - 32, size: 7.5, font: fontRegular, color: darkGray });
  page2.drawText('Date & Seal: ________________________________', { x: MARGIN_LEFT + 280, y: y2 - 52, size: 7.5, font: fontRegular, color: darkGray });

  // Page 2 Footer
  page2.drawText('Designs of Dreams Atelier • Confirmed Client Quotation • Page 2 of 2', {
    x: MARGIN_LEFT,
    y: 22,
    size: 7.5,
    font: fontRegular,
    color: mediumGray,
  });
  page2.drawText('Official Confidential Quotation Document', {
    x: MARGIN_RIGHT - 160,
    y: 22,
    size: 7.5,
    font: fontRegular,
    color: mediumGray,
  });

  const pdfBytes = await pdfDoc.save();

  // Save to target PDF file on project root
  const outputPath = path.join(process.cwd(), 'Ecommerce_Website_Cost_Quotation.pdf');
  fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

  // Also save a copy directly to Desktop if possible
  const desktopPath = 'C:/Users/harsh/Desktop/Ecommerce_Website_Cost_Quotation.pdf';
  try {
    fs.writeFileSync(desktopPath, Buffer.from(pdfBytes));
  } catch {}

  console.log(`[PDF Generator] Successfully generated PDF at: ${outputPath}`);
  return outputPath;
}

// Execute directly if run as a script
if (require.main === module || process.argv[1]?.includes('generateQuotationPdf')) {
  generateEcommerceCostQuotationPdf()
    .then((filePath) => console.log('Quotation PDF generated:', filePath))
    .catch((err) => {
      console.error('Failed to generate quotation PDF:', err);
      process.exit(1);
    });
}
