"use client";

import React, { useRef } from "react";
import { Download } from "lucide-react";

export interface InvoiceItem {
  title: string;
  price: number;
  quantity: number;
  size: string;
  image?: string;
  sku?: string;
}

export interface InvoiceData {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  address: string;
  paymentMode: string;
  items: InvoiceItem[];
  subtotal: number;
  gst: number;
  shipping: number;
  grandTotal: number;
  customizationDetails?: string[];
}

interface InvoiceGeneratorProps {
  data: InvoiceData;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
  compact?: boolean;
}

function escapeHtml(str: any): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function InvoiceGenerator({ data, buttonClassName, buttonStyle, compact }: InvoiceGeneratorProps) {
  const handleDownload = () => {
    const invoiceDate = data.date || new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const itemsHTML = data.items.map((item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ece6;font-size:13px;color:#1a1a1a;font-weight:600;">
          ${escapeHtml(item.title)}
          <div style="font-size:11px;color:#888;font-weight:400;margin-top:2px;">
            Size: ${escapeHtml(item.size)} ${item.sku ? `| SKU: ${escapeHtml(item.sku)}` : ''}
          </div>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ece6;text-align:center;font-size:13px;color:#444;">${Number(item.quantity)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ece6;text-align:right;font-size:13px;color:#444;">₹${Number(item.price).toLocaleString("en-IN")}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ece6;text-align:right;font-size:13px;color:#1a1a1a;font-weight:700;">₹${(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    const customizationHTML = data.customizationDetails?.length ? `
      <div style="margin:0 40px 24px;padding:16px 20px;background:#fdf7ef;border:1px solid #f4d7b9;border-radius:12px;">
        <div style="font-size:10px;color:#b45309;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;margin-bottom:8px;">Bespoke customization details</div>
        ${data.customizationDetails.map((detail) => `<div style="font-size:12px;color:#5b4636;line-height:1.6;">${escapeHtml(detail)}</div>`).join('')}
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Invoice - ${escapeHtml(data.orderId)}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #ffffff;
            color: #1a1a1a;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            padding: 20px;
          }

          .invoice-page {
            max-width: 780px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            overflow: hidden;
          }

          @media print {
            body { padding: 0; }
            .invoice-page { border: none; border-radius: 0; max-width: 100%; }
          }

          @page {
            margin: 0.4in;
            size: A4;
          }
        </style>
      </head>
      <body>
        <div class="invoice-page">
          <!-- Header Band -->
          <div style="background:#ffffff;border-bottom:2px solid #FF6A00;padding:28px 40px;display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:14px;">
              <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/logo.png" alt="Designs of Dreams" style="height:44px;width:auto;object-fit:contain;" />
              <div>
                <h1 style="font-family:'Playfair Display',serif;font-size:24px;color:#FF6A00;font-weight:700;letter-spacing:0.02em;margin:0;">
                  DESIGNS OF DREAMS
                </h1>
                <p style="font-size:11px;color:#666666;margin-top:4px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">
                  Heritage Atelier — Handloom Masterpieces
                </p>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="
                display:inline-block;background:#FF6A00;
                color:#fff;padding:8px 20px;border-radius:50px;font-size:11px;
                font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
              ">TAX INVOICE</div>
            </div>
          </div>

          <!-- Invoice Meta Row -->
          <div style="display:flex;justify-content:space-between;padding:24px 40px;border-bottom:1px solid #f0ece6;background:#fdfcfa;">
            <div>
              <div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;margin-bottom:4px;">Invoice Number</div>
              <div style="font-size:16px;font-weight:700;color:#FF6A00;letter-spacing:0.02em;">INV-${escapeHtml(data.orderId)}</div>
            </div>
            <div>
              <div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;margin-bottom:4px;">Order ID</div>
              <div style="font-size:16px;font-weight:700;color:#1a1a1a;">${escapeHtml(data.orderId)}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;margin-bottom:4px;">Invoice Date</div>
              <div style="font-size:14px;font-weight:600;color:#1a1a1a;">${invoiceDate}</div>
            </div>
          </div>

          <!-- Billing Row -->
          <div style="display:flex;gap:40px;padding:24px 40px;border-bottom:1px solid #f0ece6;">
            <div style="flex:1;">
              <div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;margin-bottom:10px;">Billed To</div>
              <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">${escapeHtml(data.customerName || 'Valued Customer')}</div>
              ${data.customerEmail ? `<div style="font-size:12px;color:#666;margin-bottom:2px;">${escapeHtml(data.customerEmail)}</div>` : ''}
              ${data.customerPhone ? `<div style="font-size:12px;color:#666;margin-bottom:2px;">+91 ${escapeHtml(data.customerPhone)}</div>` : ''}
              <div style="font-size:12px;color:#666;line-height:1.5;margin-top:4px;max-width:280px;">${escapeHtml(data.address || 'N/A')}</div>
            </div>
            <div style="flex:1;">
              <div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;margin-bottom:10px;">Sold By</div>
              <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Designs Of Dreams Pvt. Ltd.</div>
              <div style="font-size:12px;color:#666;line-height:1.5;">
                Atelier Workshop, Heritage Weave District<br/>
                Varanasi, Uttar Pradesh 221001<br/>
                GSTIN: 09AABCD1234E1Z5
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div style="padding:24px 40px;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#faf8f4;">
                  <th style="padding:12px 16px;text-align:left;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;border-bottom:2px solid #f0ece6;">Item Description</th>
                  <th style="padding:12px 16px;text-align:center;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;border-bottom:2px solid #f0ece6;">Qty</th>
                  <th style="padding:12px 16px;text-align:right;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;border-bottom:2px solid #f0ece6;">Unit Price</th>
                  <th style="padding:12px 16px;text-align:right;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;border-bottom:2px solid #f0ece6;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          ${customizationHTML}

          <!-- Totals -->
          <div style="padding:0 40px 24px;display:flex;justify-content:flex-end;">
            <div style="width:300px;">
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#666;">
                <span>Subtotal</span>
                <span style="font-weight:600;color:#444;">₹${data.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#666;">
                <span>GST (5%)</span>
                <span style="font-weight:600;color:#444;">₹${data.gst.toLocaleString("en-IN")}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#666;">
                <span>Shipping</span>
                <span style="font-weight:600;color:#444;">${data.shipping === 0 ? 'FREE' : `₹${data.shipping.toLocaleString("en-IN")}`}</span>
              </div>
              <div style="height:1px;background:#eee;margin:6px 0;"></div>
              <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:18px;font-weight:700;color:#1a1a1a;">
                <span>Grand Total</span>
                <span style="color:#FF6A00;">₹${data.grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div style="margin:0 40px;padding:14px 20px;background:#faf8f4;border-radius:12px;display:flex;justify-content:space-between;align-items:center;border:1px solid #f0ece6;">
            <div>
              <span style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;">Payment Method</span>
              <div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-top:3px;">${escapeHtml(data.paymentMode || 'Cash On Delivery (COD)')}</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;">Payment Status</span>
              <div style="margin-top:3px;">
                <span style="display:inline-block;background:rgba(255,106,0,0.1);color:#FF6A00;padding:4px 12px;border-radius:50px;font-size:11px;font-weight:700;letter-spacing:0.05em;">
                  ${data.paymentMode?.includes('COD') ? 'COLLECT ON DELIVERY' : 'PAID'}
                </span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding:24px 40px;margin-top:20px;border-top:1px solid #f0ece6;text-align:center;">
            <p style="font-size:11px;color:#aaa;line-height:1.6;">
              This is a computer-generated invoice and does not require a physical signature.<br/>
              For queries contact us at <span style="color:#FF6A00;font-weight:600;">support@designsofdreams.in</span>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create invisible iframe to bypass popup blockers and trigger print/PDF immediately
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 3000);
      }, 500);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className={buttonClassName || ""}
      style={buttonStyle || {}}
      type="button"
    >
      <Download size={compact ? 14 : 16} />
      {compact ? "Invoice" : "Download Invoice"}
    </button>
  );
}
