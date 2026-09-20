// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WhatsApp Notification Service (Meta Cloud API / Multi-Provider)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fs from 'fs';
import path from 'path';
import { prisma } from './client';
import { fallbackDb } from './fallbackDb';
import { generateInvoicePdfBuffer, generateInvoiceFileName, resolveOrderCustomizations } from './invoicePdf';

function getEnvVar(key: string, defaultValue: string = ''): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const cwd = process.cwd();
    const envPaths = [
      path.join(cwd, '.env.local'),
      path.join(cwd, '.env'),
      path.join(cwd, '..', '.env.local'),
      path.join(cwd, '..', '.env'),
      path.join(cwd, 'dodshop', '.env.local'),
      path.join(cwd, 'Dashbord', '.env.local'),
    ];
    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        const match = content.match(new RegExp(`^${key}=["']?([^"'\r\n]+)["']?`, 'm'));
        if (match && match[1]) {
          process.env[key] = match[1];
          return match[1];
        }
      }
    }
  } catch {}
  return defaultValue;
}

export interface WhatsAppNotificationDetails {
  adminStatus: 'PENDING' | 'SENT' | 'FAILED';
  adminSentAt?: string;
  adminError?: string;
  adminInvoicePdfStatus?: 'SENT' | 'FAILED';
  customerStatus: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  customerSentAt?: string;
  customerError?: string;
  customerInvoicePdfStatus?: 'SENT' | 'FAILED';
}

/**
 * Normalizes an Indian/international phone number for WhatsApp API usage.
 * Input: "+91 98765-43210", "09876543210", "9876543210", "919876543210"
 * Output: "919876543210"
 */
export function normalizePhoneNumber(rawPhone: string | null | undefined): {
  isValid: boolean;
  normalized: string;
  formattedDisplay: string;
  error?: string;
} {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { isValid: false, normalized: '', formattedDisplay: '', error: 'Phone number is required' };
  }

  // Strip all non-numeric characters except leading '+'
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // If starts with '0' (trunk prefix e.g. 09876543210)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '91' + cleaned.substring(1);
  }

  // If 10 digits (standard Indian mobile format)
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    cleaned = '91' + cleaned;
  }

  // Standard Indian 12-digit format: 91XXXXXXXXXX
  if (cleaned.length === 12 && cleaned.startsWith('91') && /^91[6-9]\d{9}$/.test(cleaned)) {
    const nationalNumber = cleaned.substring(2);
    return {
      isValid: true,
      normalized: cleaned,
      formattedDisplay: `+91 ${nationalNumber.slice(0, 5)} ${nationalNumber.slice(5)}`,
    };
  }

  // International format check (min 10 digits, max 15 digits according to E.164)
  if (/^\d{10,15}$/.test(cleaned)) {
    return {
      isValid: true,
      normalized: cleaned,
      formattedDisplay: `+${cleaned}`,
    };
  }

  return {
    isValid: false,
    normalized: '',
    formattedDisplay: rawPhone,
    error: `Invalid phone number format: "${rawPhone}". Expected valid Indian mobile number.`,
  };
}

/**
 * Formats currency amount in Indian Rupee format (e.g., "5,099")
 */
function formatCurrency(amount: number | string | undefined): string {
  const num = Number(amount) || 0;
  return num.toLocaleString('en-IN');
}

/**
 * Capitalizes payment status (e.g., "PAID" -> "Paid", "UNPAID" -> "Pending")
 */
function formatPaymentStatus(status: string | undefined, method?: string): string {
  if (!status) return 'Pending';
  const upper = status.toUpperCase();
  if (upper === 'PAID') return 'Paid';
  if (upper === 'FAILED') return 'Failed';
  if (upper === 'UNPAID') {
    return method === 'COD' ? 'Pending (COD)' : 'Pending';
  }
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

/**
 * Formats delivery address for WhatsApp messages
 */
function formatDeliveryAddress(shippingAddress: any): string {
  if (!shippingAddress) return 'Address not provided';
  if (typeof shippingAddress === 'string') return shippingAddress;

  const parts: string[] = [];
  if (shippingAddress.line1) parts.push(shippingAddress.line1);
  if (shippingAddress.line2) parts.push(shippingAddress.line2);

  const cityState = [shippingAddress.city, shippingAddress.state].filter(Boolean).join(', ');
  if (cityState) parts.push(cityState);

  if (shippingAddress.postalCode) parts.push(shippingAddress.postalCode);

  return parts.length > 0 ? parts.join(',\n') : 'Address not provided';
}

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
 * Builds the Admin WhatsApp notification message according to the exact requested format.
 */
export function buildAdminWhatsAppMessage(order: any): string {
  const orderId = order.id || 'N/A';
  const customerName = order.customerName || 'Valued Customer';
  const rawPhone = extractCustomerPhone(order);
  const phoneRes = normalizePhoneNumber(rawPhone);
  const displayPhone = phoneRes.isValid ? phoneRes.formattedDisplay : (rawPhone || 'Not provided');
  const customerEmail = order.customerEmail || 'Not provided';

  // Items list: • Saree Collection × 1 — ₹2,499
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsList = items.length > 0
    ? items.map((it: any) => `• ${it.name || it.title || 'Heritage Piece'} × ${it.quantity || 1} — ₹${formatCurrency(it.price)}`).join('\n')
    : '• Heritage Collection Piece × 1';

  const subtotal = formatCurrency(order.totalAmount || order.subtotal || 0);
  const gst = formatCurrency(order.gstAmount || order.tax || Math.round((order.totalAmount || 0) * 0.05));
  const shipping = formatCurrency(order.shippingAmount || order.shipping || 0);
  const discount = formatCurrency(order.discountAmount || order.discount || 0);
  const total = formatCurrency(order.grandTotal || order.total || 0);
  const address = formatDeliveryAddress(order.shippingAddress);
  const customLines: string[] = [];
  if (Array.isArray(order.customizations) && order.customizations.length > 0) {
    customLines.push('', '👑 BESPOKE CUSTOMIZATION:');
    const latest = order.customizations[0];
    if (latest) {
      if (latest.summaryLine) customLines.push(`• ${latest.summaryLine}`);
      if (latest.notes) customLines.push(`• Note: "${latest.notes}"`);
      if (latest.timeEstimateMonths) customLines.push(`• Timeline: ${latest.timeEstimateMonths} Months`);
    }
  }

  return [
    '🛍️ NEW ORDER RECEIVED',
    '',
    `Order ID: #${orderId}`,
    '',
    'Customer:',
    customerName,
    '',
    'Phone:',
    displayPhone,
    '',
    'Email:',
    customerEmail,
    '',
    'Items:',
    itemsList,
    ...customLines,
    '',
    '🧾 BILL DETAILS:',
    `Subtotal: ₹${subtotal}`,
    `GST (5%): ₹${gst}`,
    `Shipping: ₹${shipping}`,
    `Discount: ₹${discount}`,
    `TOTAL BILL: ₹${total}`,
    '',
    'Delivery Address:',
    address,
    '',
    '📎 Tax Invoice PDF attached below.',
    '',
    'Please check the Admin Panel for complete order details.'
  ].join('\n');
}

/**
 * Builds the Customer WhatsApp confirmation message according to the exact requested format.
 */
export function buildCustomerWhatsAppMessage(order: any): string {
  const orderId = order.id || 'N/A';
  const fullName = order.customerName || 'Valued Customer';
  const firstName = fullName.split(' ')[0] || 'Patron';

  // Items list: • Saree Collection × 1
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsList = items.length > 0
    ? items.map((it: any) => `• ${it.name || it.title || 'Heritage Piece'} × ${it.quantity || 1}`).join('\n')
    : '• Heritage Collection Piece × 1';

  const subtotal = formatCurrency(order.totalAmount || order.subtotal || 0);
  const gst = formatCurrency(order.gstAmount || order.tax || Math.round((order.totalAmount || 0) * 0.05));
  const shipping = formatCurrency(order.shippingAmount || order.shipping || 0);
  const discount = formatCurrency(order.discountAmount || order.discount || 0);
  const total = formatCurrency(order.grandTotal || order.total || 0);
  const address = formatDeliveryAddress(order.shippingAddress);
  const websiteUrl = getEnvVar('NEXT_PUBLIC_WEBSITE_URL', 'http://localhost:3000');

  const customLines: string[] = [];
  if (Array.isArray(order.customizations) && order.customizations.length > 0) {
    customLines.push('', '👑 YOUR BESPOKE CUSTOMIZATION:');
    const latest = order.customizations[0];
    if (latest) {
      if (latest.summaryLine) customLines.push(`• ${latest.summaryLine}`);
      if (latest.notes) customLines.push(`• Note: "${latest.notes}"`);
    }
  }

  return [
    '🎉 ORDER CONFIRMED!',
    '',
    `Hello ${firstName},`,
    '',
    'Thank you for shopping with Designs of Dreams. ❤️',
    '',
    'Your order has been successfully placed.',
    '',
    'Order ID:',
    `#${orderId}`,
    '',
    'Items:',
    itemsList,
    ...customLines,
    '',
    '🧾 BILL SUMMARY:',
    `Subtotal: ₹${subtotal}`,
    `GST: ₹${gst}`,
    `Shipping: ₹${shipping}`,
    `Discount: ₹${discount}`,
    `Total Amount: ₹${total}`,
    '',
    'Delivery Address:',
    address,
    '',
    'Your order is now being processed.',
    '',
    '📄 TAX INVOICE:',
    '📎 Your official Tax Invoice PDF is attached below.',
    `Online Copy: ${websiteUrl}/order`,
    '',
    'Thank you for choosing Designs of Dreams! ❤️'
  ].join('\n');
}

/**
 * Sends a single WhatsApp text message via Meta WhatsApp Cloud API.
 * Gracefully falls back to simulated development mode when credentials are not configured.
 */
export async function sendWhatsAppMessage(
  recipientPhone: string,
  messageText: string
): Promise<{ success: boolean; messageId?: string; error?: string; isSimulated?: boolean }> {
  const token = getEnvVar('WHATSAPP_API_TOKEN');
  const phoneNumberId = getEnvVar('WHATSAPP_PHONE_NUMBER_ID');

  // Development/Mock Mode when credentials are not set in .env
  if (!token || !phoneNumberId) {
    console.log(`[WHATSAPP-DEV-LOG] 📱 Recipient: ${recipientPhone}`);
    console.log(`[WHATSAPP-DEV-LOG] 💬 Message:\n${messageText}`);
    console.log(`[WHATSAPP-DEV-LOG] ℹ️ (Simulated send successful. Set WHATSAPP_API_TOKEN & WHATSAPP_PHONE_NUMBER_ID in .env for production Meta Cloud API).`);
    return {
      success: true,
      messageId: `sim-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      isSimulated: true
    };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: messageText,
        },
      }),
    });

    console.log(`[WhatsApp Debug] HTTP Status: ${res.status}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      let errorMsg = data?.error?.message || `WhatsApp API error: ${res.statusText}`;
      if (data?.error?.code === 190) {
        errorMsg = `Meta Token Expired (code 190): ${data?.error?.message || 'Access token is invalid or expired. Generate a fresh or permanent token in Meta Developer Console.'}`;
      }
      console.error(`[WhatsApp Debug] Meta Error: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    const messageId = data?.messages?.[0]?.id || `wa-${Date.now()}`;
    console.log(`[WhatsApp Debug] Message ID: ${messageId}`);
    return { success: true, messageId };
  } catch (err: any) {
    const errorMsg = err?.message || 'Network exception while connecting to WhatsApp API';
    console.error(`[WhatsApp Debug] Meta Error: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Uploads a media file buffer (such as an Invoice PDF) to Meta WhatsApp Cloud API.
 * Returns the media ID required for document messaging.
 */
export async function uploadWhatsAppMedia(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string = 'application/pdf'
): Promise<{ success: boolean; mediaId?: string; error?: string; isSimulated?: boolean }> {
  const token = getEnvVar('WHATSAPP_API_TOKEN');
  const phoneNumberId = getEnvVar('WHATSAPP_PHONE_NUMBER_ID');

  if (!token || !phoneNumberId) {
    console.log(`[WHATSAPP-DEV-LOG] 📎 Media uploaded (Simulated): ${filename} (${fileBuffer.length} bytes)`);
    return {
      success: true,
      mediaId: `sim-media-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      isSimulated: true,
    };
  }

  try {
    const formData = new FormData();
    const blob = new Blob([fileBuffer as any], { type: mimeType });
    formData.append('file', blob, filename);
    formData.append('type', mimeType);
    formData.append('messaging_product', 'whatsapp');

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/media`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log(`[WhatsApp Debug] Media Upload HTTP Status: ${res.status}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.id) {
      const errorMsg = data?.error?.message || `WhatsApp Media API error: ${res.statusText}`;
      console.error(`[WhatsApp Debug] Media Upload Meta Error: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    console.log(`[WhatsApp Debug] Media ID obtained: ${data.id}`);
    return { success: true, mediaId: data.id };
  } catch (err: any) {
    const errorMsg = err?.message || 'Network exception while uploading media to WhatsApp API';
    console.error(`[WhatsApp Debug] Media Upload Exception: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Sends a WhatsApp document message (Tax Invoice PDF) with an optional caption.
 */
export async function sendWhatsAppDocument(
  recipientPhone: string,
  mediaId: string,
  filename: string,
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string; isSimulated?: boolean }> {
  const token = getEnvVar('WHATSAPP_API_TOKEN');
  const phoneNumberId = getEnvVar('WHATSAPP_PHONE_NUMBER_ID');

  if (!token || !phoneNumberId) {
    console.log(`[WHATSAPP-DEV-LOG] 📱 Document message sent to: ${recipientPhone}`);
    console.log(`[WHATSAPP-DEV-LOG] 📄 File: ${filename} | Caption: ${caption || 'N/A'}`);
    return {
      success: true,
      messageId: `sim-doc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      isSimulated: true,
    };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'document',
        document: {
          id: mediaId,
          filename: filename,
          caption: caption || '🧾 Tax Invoice | Designs of Dreams',
        },
      }),
    });

    console.log(`[WhatsApp Debug] Document Send HTTP Status: ${res.status}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.error?.message || `WhatsApp Document API error: ${res.statusText}`;
      console.error(`[WhatsApp Debug] Meta Document Error: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    const messageId = data?.messages?.[0]?.id || `wa-doc-${Date.now()}`;
    console.log(`[WhatsApp Debug] Document Message ID: ${messageId}`);
    return { success: true, messageId };
  } catch (err: any) {
    const errorMsg = err?.message || 'Network exception while sending document via WhatsApp API';
    console.error(`[WhatsApp Debug] Meta Document Error: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Triggers WhatsApp notifications for an order (Admin and/or Customer).
 * - Enforces idempotency: does not resend if already marked 'SENT' (unless force=true).
 * - Generates and sends official Tax Invoice PDF attachment to both Admin & Customer.
 * - Persists status directly on the order in PostgreSQL/MongoDB (Prisma) and fallbackDb.
 * - Async and safe: errors never bubble up to cancel or fail the order itself.
 */
export async function sendOrderWhatsAppNotifications(
  order: any,
  target: 'all' | 'admin' | 'customer' = 'all',
  options?: { force?: boolean }
): Promise<WhatsAppNotificationDetails> {
  if (!order || !order.id) {
    throw new Error('Order is required for WhatsApp notifications');
  }

  // Load existing whatsapp details
  const existingDetails: WhatsAppNotificationDetails = order.whatsappDetails || {
    adminStatus: 'PENDING',
    customerStatus: 'PENDING',
  };

  const updatedDetails: WhatsAppNotificationDetails = { ...existingDetails };

  console.log(`[WhatsApp Debug] Order completed: ${order.id}`);
  const hasToken = !!getEnvVar('WHATSAPP_API_TOKEN');
  const hasPhoneId = !!getEnvVar('WHATSAPP_PHONE_NUMBER_ID');
  const adminNum = getEnvVar('ADMIN_WHATSAPP_NUMBER', '919313507346');
  console.log(`[WhatsApp Debug] ADMIN_WHATSAPP_NUMBER: configured (${adminNum})`);
  console.log(`[WhatsApp Debug] WHATSAPP_API_TOKEN: ${hasToken ? 'configured' : 'missing'}`);
  console.log(`[WhatsApp Debug] WHATSAPP_PHONE_NUMBER_ID: ${hasPhoneId ? 'configured' : 'missing'}`);

  // Resolve bespoke customization details if not already attached
  if (!order.customizations) {
    try {
      order.customizations = await resolveOrderCustomizations(order);
      if (order.customizations.length > 0) {
        console.log(`[WhatsApp Debug] Resolved ${order.customizations.length} bespoke customization(s) for Order ${order.id}`);
      }
    } catch (cErr: any) {
      console.warn(`[WhatsApp Debug] Error resolving customizations:`, cErr?.message || cErr);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 0. GENERATE & UPLOAD TAX INVOICE PDF
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let invoiceMediaId: string | null = null;
  const invoiceFilename = generateInvoiceFileName(order);
  try {
    console.log(`[WhatsApp Debug] Generating Invoice PDF (${invoiceFilename}) for Order ${order.id}...`);
    const pdfBuffer = await generateInvoicePdfBuffer(order);
    console.log(`[WhatsApp Debug] Invoice PDF generated (${pdfBuffer.length} bytes), uploading to Meta...`);
    const uploadRes = await uploadWhatsAppMedia(pdfBuffer, invoiceFilename, 'application/pdf');
    if (uploadRes.success && uploadRes.mediaId) {
      invoiceMediaId = uploadRes.mediaId;
      console.log(`[WhatsApp Debug] Invoice PDF uploaded successfully: ${invoiceMediaId}`);
    } else {
      console.warn(`[WhatsApp Debug] Invoice PDF upload skipped or failed: ${uploadRes.error}`);
    }
  } catch (pdfErr: any) {
    console.warn(`[WhatsApp Debug] Could not generate/upload Invoice PDF for Order ${order.id}:`, pdfErr?.message || pdfErr);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. ADMIN NOTIFICATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const shouldProcessAdmin = target === 'all' || target === 'admin';
  const isAlreadyAdminSent = existingDetails.adminStatus === 'SENT' && !options?.force;

  if (shouldProcessAdmin && !isAlreadyAdminSent) {
    console.log(`[WhatsApp Debug] Admin notification triggered for Order: ${order.id}`);
    const rawAdminPhone = getEnvVar('ADMIN_WHATSAPP_NUMBER', '919313507346');
    const adminPhoneRes = normalizePhoneNumber(rawAdminPhone);

    if (!adminPhoneRes.isValid) {
      updatedDetails.adminStatus = 'FAILED';
      updatedDetails.adminError = `Invalid Admin phone configuration: ${rawAdminPhone}`;
      console.error(`[WHATSAPP-ADMIN] ${updatedDetails.adminError}`);
    } else {
      try {
        const adminMsg = buildAdminWhatsAppMessage(order);
        const result = await sendWhatsAppMessage(adminPhoneRes.normalized, adminMsg);

        if (result.success) {
          updatedDetails.adminStatus = 'SENT';
          updatedDetails.adminSentAt = new Date().toISOString();
          delete updatedDetails.adminError;
        } else {
          updatedDetails.adminStatus = 'FAILED';
          updatedDetails.adminError = result.error || 'WhatsApp API request failed';
        }

        // Send Invoice PDF document to Admin
        if (invoiceMediaId) {
          try {
            console.log(`[WhatsApp Debug] Sending Invoice PDF document to Admin (${adminPhoneRes.normalized})...`);
            const adminDocCaption = `🧾 Tax Invoice — ${order.customerName || 'Customer'} | INV-${order.id} | Designs of Dreams | Thank you, see you again! ❤️`;
            const docRes = await sendWhatsAppDocument(adminPhoneRes.normalized, invoiceMediaId, invoiceFilename, adminDocCaption);
            if (docRes.success) {
              updatedDetails.adminInvoicePdfStatus = 'SENT';
              console.log(`[WhatsApp Debug] Invoice PDF document sent to Admin`);
            } else {
              updatedDetails.adminInvoicePdfStatus = 'FAILED';
              console.warn(`[WhatsApp Debug] Failed to send Invoice PDF to Admin: ${docRes.error}`);
            }
          } catch (docErr: any) {
            updatedDetails.adminInvoicePdfStatus = 'FAILED';
            console.warn(`[WhatsApp Debug] Exception sending Invoice PDF to Admin:`, docErr?.message);
          }
        }
      } catch (err: any) {
        updatedDetails.adminStatus = 'FAILED';
        updatedDetails.adminError = err?.message || 'Unexpected error sending Admin WhatsApp';
      }
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. CUSTOMER NOTIFICATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const shouldProcessCustomer = target === 'all' || target === 'customer';
  const isAlreadyCustomerSent = existingDetails.customerStatus === 'SENT' && !options?.force;

  if (shouldProcessCustomer && !isAlreadyCustomerSent) {
    console.log(`[WhatsApp Debug] Customer notification triggered for Order: ${order.id}`);
    const rawCustomerPhone = extractCustomerPhone(order);
    const customerPhoneRes = normalizePhoneNumber(rawCustomerPhone);

    if (!customerPhoneRes.isValid) {
      updatedDetails.customerStatus = 'SKIPPED';
      updatedDetails.customerError = customerPhoneRes.error || 'Invalid or missing customer phone number';
      console.warn(`[WHATSAPP-CUSTOMER] Skipped for Order ${order.id}: ${updatedDetails.customerError}`);
    } else {
      try {
        const customerMsg = buildCustomerWhatsAppMessage(order);
        const result = await sendWhatsAppMessage(customerPhoneRes.normalized, customerMsg);

        if (result.success) {
          updatedDetails.customerStatus = 'SENT';
          updatedDetails.customerSentAt = new Date().toISOString();
          delete updatedDetails.customerError;
        } else {
          updatedDetails.customerStatus = 'FAILED';
          updatedDetails.customerError = result.error || 'WhatsApp API request failed';
        }

        // Send Invoice PDF document to Customer
        if (invoiceMediaId) {
          try {
            console.log(`[WhatsApp Debug] Sending Invoice PDF document to Customer (${customerPhoneRes.normalized})...`);
            const customerDocCaption = `🧾 Official Tax Invoice — ${order.customerName || 'Valued Customer'} | INV-${order.id} | Designs of Dreams\nThank you, see you again! ❤️`;
            const docRes = await sendWhatsAppDocument(customerPhoneRes.normalized, invoiceMediaId, invoiceFilename, customerDocCaption);
            if (docRes.success) {
              updatedDetails.customerInvoicePdfStatus = 'SENT';
              console.log(`[WhatsApp Debug] Invoice PDF document sent to Customer`);
            } else {
              updatedDetails.customerInvoicePdfStatus = 'FAILED';
              console.warn(`[WhatsApp Debug] Failed to send Invoice PDF to Customer: ${docRes.error}`);
            }
          } catch (docErr: any) {
            updatedDetails.customerInvoicePdfStatus = 'FAILED';
            console.warn(`[WhatsApp Debug] Exception sending Invoice PDF to Customer:`, docErr?.message);
          }
        }
      } catch (err: any) {
        updatedDetails.customerStatus = 'FAILED';
        updatedDetails.customerError = err?.message || 'Unexpected error sending Customer WhatsApp';
      }
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. PERSIST NOTIFICATION STATUS TO DATABASE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  try {
    // 3A. Update Prisma if database is connected and order exists
    try {
      const exists = await prisma.order.findUnique({
        where: { id: order.id },
        select: { id: true }
      });
      if (exists) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            whatsappDetails: updatedDetails as any,
          },
        });
      }
    } catch (dbErr) {
      // Prisma update may fail if fallback DB is in use
    }

    // 3B. Update fallback DB
    try {
      const orders = fallbackDb.getCollection('orders');
      const orderIdx = orders.findIndex((o: any) => o.id === order.id);
      if (orderIdx !== -1) {
        orders[orderIdx].whatsappDetails = updatedDetails;
        fallbackDb.saveCollection('orders', orders);
      }
    } catch (fallbackErr) {
      // Ignore fallback error
    }

    // Keep memory order object updated
    order.whatsappDetails = updatedDetails;
  } catch (persistErr) {
    console.error(`[WHATSAPP-STATUS] Failed to persist whatsappDetails for Order ${order.id}:`, persistErr);
  }

  return updatedDetails;
}
