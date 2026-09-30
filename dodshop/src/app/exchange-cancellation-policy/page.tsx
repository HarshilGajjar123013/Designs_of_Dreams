"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  FileText,
  ChevronRight,
  PackageCheck,
  Clock,
  Sparkles,
  Scissors,
  CheckCircle2,
  XCircle,
  Truck,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import "./ExchangeCancellationPolicy.scss";

const SECTIONS = [
  { id: "sec-1", title: "1. Introduction" },
  { id: "sec-2", title: "2. Order Cancellation" },
  { id: "sec-3", title: "3. Cancellation After Processing" },
  { id: "sec-4", title: "4. Refund for Cancelled Orders" },
  { id: "sec-5", title: "5. Exchange Policy & Eligibility" },
  { id: "sec-6", title: "6. Conditions for Exchange" },
  { id: "sec-7", title: "7. Handcrafted Variations" },
  { id: "sec-8", title: "8. Product Color Differences" },
  { id: "sec-9", title: "9. Damaged Products" },
  { id: "sec-10", title: "10. Wrong Product Received" },
  { id: "sec-11", title: "11. Size & Measurement Issues" },
  { id: "sec-12", title: "12. Customized & Made-to-Order" },
  { id: "sec-13", title: "13. Non-Exchangeable Products" },
  { id: "sec-14", title: "14. Sale & Discounted Products" },
  { id: "sec-15", title: "15. Step-by-Step Exchange Process" },
  { id: "sec-16", title: "16. Return Shipping Responsibility" },
  { id: "sec-17", title: "17. Failed or Refused Delivery" },
  { id: "sec-18", title: "18. Exchange Limit" },
  { id: "sec-19", title: "19. Exchange Resolution Type" },
  { id: "sec-20", title: "20. Order Modification" },
  { id: "sec-21", title: "21. Fraudulent or Abusive Requests" },
  { id: "sec-22", title: "22. Inspection & Approval" },
  { id: "sec-23", title: "23. Customer Responsibilities" },
  { id: "sec-24", title: "24. Contact Information" },
  { id: "sec-25", title: "25. Related Policies" },
];

export default function ExchangeCancellationPolicyPage() {
  const [activeSection, setActiveSection] = useState("sec-1");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="legal-page-root">
      {/* ── Top Hero ── */}
      <div className="legal-hero">
        <div className="legal-container">
          <div className="legal-top-bar">
            <Link href="/" className="back-home-link">
              <ArrowLeft size={16} />
              <span>Back to Home Page</span>
            </Link>
          </div>

          <div className="legal-badge">
            <RotateCcw size={16} />
            <span>Patron Care &amp; Quality Promise</span>
          </div>

          <h1 className="legal-title">Exchange &amp; Cancellation Policy</h1>
          <p className="legal-subtitle">
            Your satisfaction matters to us. Please review our exchange and cancellation guidelines
            before placing an order.
          </p>

          <div className="legal-dates">
            <span><strong>Effective Date:</strong> <span className="placeholder-badge">[DATE]</span></span>
            <span>•</span>
            <span><strong>Last Updated:</strong> <span className="placeholder-badge">[DATE]</span></span>
          </div>

          <div className="legal-crest">❧ ❦ ☙</div>
        </div>
      </div>

      <div className="legal-container">
        {/* ── Legal Advisory Notice Banner ── */}
        <div className="legal-advisory-banner">
          <AlertTriangle size={22} className="banner-icon" />
          <div className="banner-text">
            <strong>Notice to Patrons:</strong> This Exchange &amp; Cancellation Policy is a business-policy draft.
            Placeholders marked with brackets such as <span className="placeholder-badge">[CANCELLATION WINDOW]</span>,{" "}
            <span className="placeholder-badge">[EXCHANGE WINDOW]</span>, and{" "}
            <span className="placeholder-badge">[SUPPORT EMAIL]</span> reflect operational parameters that must be
            finalized and reviewed based on the actual operations of Designs of Dreams and applicable Indian consumer
            and e-commerce requirements prior to publication.
          </div>
        </div>

        {/* ── Two-Column Main Layout ── */}
        <div className="legal-layout-wrapper">
          {/* ── Sticky Table of Contents (Desktop) ── */}
          <aside className="legal-sticky-sidebar">
            <div className="sidebar-header">
              <h3>Table of Contents</h3>
              <span className="toc-count">25 Sections</span>
            </div>

            <nav className="sidebar-nav-list" aria-label="Exchange Policy Sections">
              {SECTIONS.map((sec, idx) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className={`toc-link ${activeSection === sec.id ? "is-active" : ""}`}
                >
                  <span className="toc-index">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="toc-text">{sec.title.split(". ")[1]}</span>
                </a>
              ))}
            </nav>

            <div className="sidebar-footer">
              <a href="#sec-24" className="btn-quick-contact">
                <Mail size={14} />
                <span>Exchange Helpdesk</span>
              </a>
            </div>
          </aside>

          {/* ── Main Policy Content Column ── */}
          <div className="legal-content-main">
            {/* Intro Card */}
            <div className="legal-intro-card">
              <p>
                At <strong>Designs of Dreams</strong>, our mission is to deliver exceptional handcrafted luxury fashion,
                celebrating ancient Indian textile arts and master handloom weaving. We appreciate that choosing artisanal
                pieces is an intimate experience, and we have formulated this policy to ensure clarity, fairness,
                and peace of mind throughout your journey with our atelier.
              </p>
              <div className="brand-pills">
                <span className="pill">Pure Handloom Sarees</span>
                <span className="pill">Dress Materials</span>
                <span className="pill">Artisanal Dupattas</span>
                <span className="pill">Blouse Tassels</span>
                <span className="pill">Unstitched Blouses</span>
                <span className="pill">Bespoke Embroidery</span>
              </div>
            </div>

            {/* SECTION 1 */}
            <section id="sec-1" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">01</span>
                <h2 className="section-title">Introduction &amp; Scope</h2>
              </div>
              <p>
                Designs of Dreams aims to provide our patrons with highest quality handcrafted fashion and textile products.
                This Exchange &amp; Cancellation Policy governs your purchases on our website and clearly describes:
              </p>
              <ul className="legal-list">
                <li>Order cancellation procedures and eligibility parameters.</li>
                <li>Exchange eligibility, reporting windows, and return conditions.</li>
                <li>Protocols for damaged packages or mistakenly delivered items.</li>
                <li>Product-condition requirements necessary for exchange acceptance.</li>
                <li>Customized and made-to-order garment guidelines.</li>
                <li>Step-by-step exchange workflows, inspection, and final resolution.</li>
                <li>Non-exchangeable categories and shipping responsibilities.</li>
              </ul>
              <div className="policy-callout-box">
                <p>
                  <strong>Pre-Purchase Recommendation:</strong> Because our garments feature delicate weaves and bespoke
                  finishes, we encourage customers to carefully review product descriptions, dimension charts, fabric textures,
                  color specifications, and customization briefs before completing their orders.
                </p>
              </div>
            </section>

            {/* SECTION 2 */}
            <section id="sec-2" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">02</span>
                <h2 className="section-title">Order Cancellation</h2>
              </div>
              <p>
                We recognize that circumstances may change. Customers may request cancellation of their order within{" "}
                <span className="placeholder-badge">[CANCELLATION WINDOW]</span> of placing the order, provided that the order
                has not already entered processing, artisan customization, cutting, weaving, packing, or dispatch.
              </p>
              <div className="policy-cards-grid">
                <div className="card-item">
                  <h4>Eligible for Cancellation</h4>
                  <p>Orders that are pending confirmation and have not entered atelier tailoring or dispatch preparation.</p>
                </div>
                <div className="card-item">
                  <h4>Ineligible for Cancellation</h4>
                  <p>Orders where cutting, bespoke embroidery, custom stitching, packing, or courier pickup has commenced.</p>
                </div>
              </div>
              <p>To request a cancellation, customers must promptly contact our support desk via:</p>
              <ul className="legal-list">
                <li>Email: <span className="placeholder-badge">[SUPPORT EMAIL]</span> or <span className="placeholder-badge">[CONTACT METHOD]</span></li>
                <li>Required Information: Order Number, Customer Full Name, Registered Contact Number, and Reason for Cancellation.</li>
              </ul>
            </section>

            {/* SECTION 3 */}
            <section id="sec-3" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">03</span>
                <h2 className="section-title">Cancellation After Order Processing</h2>
              </div>
              <p>
                Once an order has entered active fulfillment or has been handed over to our courier logistics partners:
              </p>
              <ul className="legal-list">
                <li>Cancellation in transit is not technically or operationally possible.</li>
                <li>If the package is already dispatched, the customer must receive the shipment and proceed via the standard exchange process as outlined in this policy.</li>
                <li>Attempting to refuse delivery at the doorstep without prior authorization may incur return freight deductions.</li>
              </ul>
            </section>

            {/* SECTION 4 */}
            <section id="sec-4" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">04</span>
                <h2 className="section-title">Refund for Cancelled Orders</h2>
              </div>
              <p>
                If an order cancellation request is approved before processing/dispatch, and payment has already been captured:
              </p>
              <ul className="legal-list">
                <li>The refundable amount will be initiated to the original payment source within <span className="placeholder-badge">[REFUND PROCESSING TIME]</span>.</li>
                <li>The exact timing for the funds to reflect in your bank account, card statement, or UPI balance is subject to the clearing guidelines of the respective financial institution or payment gateway.</li>
              </ul>
            </section>

            {/* SECTION 5 */}
            <section id="sec-5" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">05</span>
                <h2 className="section-title">Exchange Policy &amp; Eligibility</h2>
              </div>
              <p>
                Customers may submit an exchange request within <span className="placeholder-badge">[EXCHANGE WINDOW]</span> (typically 7 calendar days of verified delivery).
                Circumstances eligible for exchange consideration include:
              </p>
              <ul className="legal-list">
                <li><strong>Wrong Item Received:</strong> A product delivered that differs in style, color, or design from your confirmed invoice.</li>
                <li><strong>Incorrect Size Received:</strong> Garment delivered with size labels different from the confirmed order.</li>
                <li><strong>Transit Damage:</strong> Parcel visibly damaged or torn during courier transit.</li>
                <li><strong>Verified Manufacturing Defect:</strong> Structural defect in fabric or stitching validated by our quality assurance team.</li>
                <li><strong>Material Discrepancy:</strong> Significant product issue not disclosed in the published product specifications.</li>
              </ul>
              <p><em>Note: Actual eligibility for replacement or exchange remains subject to final business policy review and physical inspection.</em></p>
            </section>

            {/* SECTION 6 */}
            <section id="sec-6" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">06</span>
                <h2 className="section-title">Conditions for Exchange</h2>
              </div>
              <p>To be accepted for exchange inspection and processing, returned items must strictly meet the following standards:</p>
              <div className="policy-cards-grid">
                <div className="card-item">
                  <h4>Pristine Condition</h4>
                  <p>Completely unused, unworn, unwashed, and unaltered by any external tailor.</p>
                </div>
                <div className="card-item">
                  <h4>Free of Blemishes</h4>
                  <p>Free from makeup marks, perfume or deodorant scents, soil, stains, or fabric creasing.</p>
                </div>
                <div className="card-item">
                  <h4>Original Packaging &amp; Tags</h4>
                  <p>All original atelier brand tags, motif security ribbons, and packaging intact.</p>
                </div>
              </div>
              <p>Products failing any of these inspection criteria may be rejected and sent back to the customer.</p>
            </section>

            {/* SECTION 7 */}
            <section id="sec-7" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">07</span>
                <h2 className="section-title">Handcrafted Product Variations (Artisan Nuances)</h2>
              </div>
              <p>
                Designs of Dreams garments are crafted by master weavers, hand-printers, and rural artisans using traditional slow techniques.
                Because of this genuine human involvement, subtle natural variations are an inherent part of each piece:
              </p>
              <div className="policy-callout-box">
                <p>
                  <strong>Hallmarks of Handloom Craft:</strong> Minor variations in yarn slubs, dye saturation, zari thread reflection,
                  hand-tied tassels, motif placement, and hand-embroidery tension are <strong>natural characteristics of authentic handcrafted textiles</strong>.
                  They do not constitute manufacturing defects or valid grounds for automated exchange.
                </p>
              </div>
              <p>
                However, if a garment possesses a genuine functional defect or fundamentally deviates from the promised craftsmanship,
                our quality team will review the claim in good faith.
              </p>
            </section>

            {/* SECTION 8 */}
            <section id="sec-8" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">08</span>
                <h2 className="section-title">Product Color Differences</h2>
              </div>
              <p>
                While we employ calibrated studio lighting and professional photography to depict textile hues with utmost fidelity,
                subtle color shifts may be observed:
              </p>
              <ul className="legal-list">
                <li>Variations between studio strobe lighting and natural ambient sunlight.</li>
                <li>Differences in mobile screen calibration, OLED/AMOLED brightness, and display color profiles.</li>
                <li>Natural batch-to-batch variations inherent in small-lot organic vegetable or azo-free dyeing.</li>
              </ul>
              <p>Minor tonal differences do not constitute defective merchandise; however, significant color discrepancies will be carefully reviewed by customer care.</p>
            </section>

            {/* SECTION 9 */}
            <section id="sec-9" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">09</span>
                <h2 className="section-title">Damaged Products (Transit Incident Protocol)</h2>
              </div>
              <p>In the rare event that your package or garment arrives in a visibly damaged condition:</p>
              <ul className="legal-list">
                <li><strong>Step 1 — Document:</strong> Take clear, well-lit photographs and an unboxing video showing the outer courier box, label, and the damaged item.</li>
                <li><strong>Step 2 — Preserve:</strong> Retain the original box, tamper-evident bag, and all enclosed tags.</li>
                <li><strong>Step 3 — Report Promptly:</strong> Notify Designs of Dreams within <span className="placeholder-badge">[DAMAGE REPORT WINDOW]</span> of delivery.</li>
                <li><strong>Step 4 — Submit Evidence:</strong> Send your order number, courier AWB, and photographic/video proof to our care desk.</li>
                <li><strong>Step 5 — Await Instructions:</strong> Please wait for our formal assessment before dispatching the item back to our atelier.</li>
              </ul>
              <p><em>Requests submitted without supporting unboxing media or outside the reporting window may not be approved.</em></p>
            </section>

            {/* SECTION 10 */}
            <section id="sec-10" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">10</span>
                <h2 className="section-title">Wrong Product Received</h2>
              </div>
              <p>
                If you have received an item that does not correspond to your confirmed order details:
              </p>
              <ul className="legal-list">
                <li>Contact our care desk at <span className="placeholder-badge">[SUPPORT EMAIL]</span> within <span className="placeholder-badge">[REPORTING WINDOW]</span> of package delivery.</li>
                <li>Provide your order number, clear photographs of the received product, and a picture of the invoice/courier shipping label.</li>
                <li>Upon validation, Designs of Dreams will arrange an expedited courier exchange, replacement dispatch, or appropriate store resolution at no additional cost to you.</li>
              </ul>
            </section>

            {/* SECTION 11 */}
            <section id="sec-11" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">11</span>
                <h2 className="section-title">Size &amp; Measurement Issues</h2>
              </div>
              <p>
                Customers are advised to consult our published sizing guidelines and product specifications prior to checkout:
              </p>
              <ul className="legal-list">
                <li><strong>Unstitched Fabrics &amp; Sarees:</strong> Standard lengths (e.g., 5.5m or 6.3m with blouse) and dupatta dimensions are pre-specified. Standard garment size exchanges do not apply to unstitched textiles.</li>
                <li><strong>Ready Garments:</strong> Where ready-to-wear kurtis or blouses are offered, size exchanges are subject to <span className="placeholder-badge">[SIZE EXCHANGE POLICY TO BE CONFIRMED]</span> and inventory availability.</li>
              </ul>
            </section>

            {/* SECTION 12 */}
            <section id="sec-12" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">12</span>
                <h2 className="section-title">Customized &amp; Made-to-Order Products</h2>
              </div>
              <p>
                Bespoke garments tailored to individual measurement profiles or customized with specific embroideries require special guidelines:
              </p>
              <ul className="legal-list">
                <li>Customers bear sole responsibility for verifying accuracy of submitted bust, waist, length, and styling measurements.</li>
                <li><strong>Cancellation Rule:</strong> Once custom fabric cutting, dyeing, or embroidery commences, cancellations are restricted as per <span className="placeholder-badge">[CUSTOMIZED PRODUCT CANCELLATION RULE]</span>.</li>
                <li><strong>Exchange Rule:</strong> Because custom-tailored creations cannot be re-inventoried, they are subject to <span className="placeholder-badge">[CUSTOMIZED PRODUCT EXCHANGE RULE]</span> and generally non-exchangeable unless a verified structural stitching flaw is confirmed.</li>
              </ul>
            </section>

            {/* SECTION 13 */}
            <section id="sec-13" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">13</span>
                <h2 className="section-title">Non-Exchangeable Products</h2>
              </div>
              <p>The following product categories may be excluded from standard exchange privileges:</p>
              <ul className="legal-list">
                <li>Customized, monogrammed, or made-to-measure tailored blouses.</li>
                <li>Products that have been worn, washed, perfume-scented, or modified by outside tailors.</li>
                <li>Items returned without original atelier tags, security seals, or packaging.</li>
                <li>Products damaged after delivery due to customer mishandling or improper laundering.</li>
                <li>Final-sale, archive sale, or festival clearance lots explicitly marked as non-exchangeable.</li>
                <li><em>Final list to be confirmed: <span className="placeholder-badge">[CONFIRM FINAL NON-EXCHANGEABLE PRODUCT LIST]</span>.</em></li>
              </ul>
            </section>

            {/* SECTION 14 */}
            <section id="sec-14" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">14</span>
                <h2 className="section-title">Sale &amp; Discounted Products</h2>
              </div>
              <p>
                Purchases made during special festive promotional periods, clearance events, or with heavy discount vouchers are governed by our{" "}
                <span className="placeholder-badge">[SALE PRODUCT EXCHANGE POLICY]</span>. Unless defective or wrongly delivered, promotional items may be limited to same-design size exchanges or final sale status.
              </p>
            </section>

            {/* SECTION 15 */}
            <section id="sec-15" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">15</span>
                <h2 className="section-title">Step-by-Step Exchange Process</h2>
              </div>
              <p>Our streamlined exchange workflow is designed to make exchanges clear and hassle-free:</p>

              <div className="exchange-timeline-grid">
                <div className="timeline-step-card">
                  <span className="step-number">Step 01</span>
                  <h4>Submit Request</h4>
                  <p>Reach out to customer care with your order number, product name, and reason for exchange.</p>
                </div>
                <div className="timeline-step-card">
                  <span className="step-number">Step 02</span>
                  <h4>Review &amp; Approval</h4>
                  <p>Our atelier team reviews photos/videos and issues verified return instructions.</p>
                </div>
                <div className="timeline-step-card">
                  <span className="step-number">Step 03</span>
                  <h4>Item Return</h4>
                  <p>Pack the item safely with all tags intact for courier pickup or scheduled return transit.</p>
                </div>
                <div className="timeline-step-card">
                  <span className="step-number">Step 04</span>
                  <h4>QC Inspection</h4>
                  <p>Our facility conducts a quality check within <span className="placeholder-badge">[EXCHANGE PROCESSING TIME]</span>.</p>
                </div>
                <div className="timeline-step-card">
                  <span className="step-number">Step 05</span>
                  <h4>Replacement Dispatched</h4>
                  <p>Replacement garment or resolution is dispatched within <span className="placeholder-badge">[REPLACEMENT DELIVERY TIME]</span>.</p>
                </div>
              </div>
            </section>

            {/* SECTION 16 */}
            <section id="sec-16" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">16</span>
                <h2 className="section-title">Return Shipping Responsibility</h2>
              </div>
              <p>Allocation of courier logistics costs for exchange transit is governed by the underlying reason:</p>
              <ul className="legal-list">
                <li><strong>Fulfilled by Company:</strong> If the exchange is due to a proven fulfillment error, incorrect delivery, or transit damage, Designs of Dreams covers reverse pickup and re-shipping costs.</li>
                <li><strong>Customer Preference:</strong> In cases of elective sizing or style preference exchanges, shipping responsibility shall be governed by <span className="placeholder-badge">[RETURN SHIPPING RESPONSIBILITY]</span>.</li>
              </ul>
            </section>

            {/* SECTION 17 */}
            <section id="sec-17" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">17</span>
                <h2 className="section-title">Failed or Refused Delivery</h2>
              </div>
              <p>
                If a delivery fails due to an incomplete/incorrect address, recipient unavailability over multiple attempts, or unjustified delivery refusal, the consignment will be handled as per our{" "}
                <span className="placeholder-badge">[FAILED DELIVERY POLICY]</span>. Re-dispatch courier fees may be billed prior to subsequent delivery attempts.
              </p>
            </section>

            {/* SECTION 18 */}
            <section id="sec-18" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">18</span>
                <h2 className="section-title">Exchange Limit</h2>
              </div>
              <p>
                To preserve artisanal inventory integrity, exchanges per order are restricted to <span className="placeholder-badge">[NUMBER OF EXCHANGES ALLOWED]</span> (typically one exchange per transaction), unless exceptional circumstances are confirmed by boutique management.
              </p>
            </section>

            {/* SECTION 19 */}
            <section id="sec-19" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">19</span>
                <h2 className="section-title">Exchange Resolution Type</h2>
              </div>
              <p>
                Upon successful quality approval of the returned piece, resolution will be provided as <span className="placeholder-badge">[EXCHANGE RESOLUTION TYPE]</span> (e.g., replacement piece in requested size, alternate piece of equal value, or atelier store credit).
              </p>
            </section>

            {/* SECTION 20 */}
            <section id="sec-20" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">20</span>
                <h2 className="section-title">Order Modification</h2>
              </div>
              <p>
                Modifications regarding size, color, delivery address, or customization details may be requested within{" "}
                <span className="placeholder-badge">[ORDER MODIFICATION WINDOW]</span> of order placement. Once packing, customization, or courier dispatch has commenced, modifications can no longer be processed.
              </p>
            </section>

            {/* SECTION 21 */}
            <section id="sec-21" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">21</span>
                <h2 className="section-title">Fraudulent or Abusive Requests</h2>
              </div>
              <p>
                Designs of Dreams actively safeguards its artisans and operations. We reserve the right to investigate and reject claims involving:
              </p>
              <ul className="legal-list">
                <li>Returning counterfeit or swapped merchandise.</li>
                <li>Returning garments noticeably used for events/photoshoots and re-packaged.</li>
                <li>Falsified claims of transit damage or intentional garment sabotage.</li>
                <li>Repeated abusive exchange histories violating fair usage principles.</li>
              </ul>
            </section>

            {/* SECTION 22 */}
            <section id="sec-22" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">22</span>
                <h2 className="section-title">Inspection &amp; Quality Approval</h2>
              </div>
              <p>
                All returned articles undergo meticulous physical assessment by our quality inspection team upon arrival at our facility.
                We evaluate fabric integrity, cleanliness, aroma, stitching, and tag authenticity before approving final exchange dispatch.
              </p>
            </section>

            {/* SECTION 23 */}
            <section id="sec-23" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">23</span>
                <h2 className="section-title">Customer Responsibilities</h2>
              </div>
              <p>To ensure a smooth exchange or cancellation experience, patrons are requested to:</p>
              <ul className="legal-list">
                <li>Provide accurate delivery address, PIN code, and active telephone contact information.</li>
                <li>Carefully inspect all items immediately upon delivery.</li>
                <li>Submit exchange or damage notices within the applicable designated timeframes.</li>
                <li>Package returned textiles securely to prevent damage in reverse courier transit.</li>
              </ul>
            </section>

            {/* SECTION 24 */}
            <section id="sec-24" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">24</span>
                <h2 className="section-title">Contact Information &amp; Helpdesk</h2>
              </div>
              <p>
                Our customer care team is available to assist with all exchange, sizing, and cancellation questions:
              </p>

              <div className="contact-highlight-card">
                <h3>Designs of Dreams</h3>
                <span className="role-tag">Exchange &amp; Cancellation Desk</span>
                <div className="info-rows">
                  <div className="info-row">
                    <FileText size={18} className="icon" />
                    <span><strong>Legal Entity:</strong> <span className="placeholder-badge">[LEGAL BUSINESS NAME]</span></span>
                  </div>
                  <div className="info-row">
                    <Globe size={18} className="icon" />
                    <span><strong>Registered Address:</strong> <span className="placeholder-badge">[BUSINESS ADDRESS]</span></span>
                  </div>
                  <div className="info-row">
                    <Mail size={18} className="icon" />
                    <span><strong>General Support Email:</strong> <span className="placeholder-badge">[SUPPORT EMAIL]</span></span>
                  </div>
                  <div className="info-row">
                    <RotateCcw size={18} className="icon" />
                    <span><strong>Exchange Inquiries:</strong> <span className="placeholder-badge">[EXCHANGE CONTACT]</span></span>
                  </div>
                  <div className="info-row">
                    <XCircle size={18} className="icon" />
                    <span><strong>Cancellation Inquiries:</strong> <span className="placeholder-badge">[CANCELLATION CONTACT]</span></span>
                  </div>
                  <div className="info-row">
                    <Phone size={18} className="icon" />
                    <span><strong>Phone / WhatsApp:</strong> <span className="placeholder-badge">[PHONE NUMBER]</span></span>
                  </div>
                  <div className="info-row">
                    <ExternalLink size={18} className="icon" />
                    <span><strong>Website:</strong> <span className="placeholder-badge">[WEBSITE URL]</span></span>
                  </div>
                </div>
                <p className="hours-note">
                  Atelier hours: Monday through Saturday, 10:00 AM – 7:00 PM IST.
                </p>
              </div>
            </section>

            {/* SECTION 25 */}
            <section id="sec-25" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">25</span>
                <h2 className="section-title">Related Policies</h2>
              </div>
              <p>
                We invite patrons to review our other platform terms and customer care guidelines:
              </p>

              <div className="related-links-grid" style={{ marginTop: "12px" }}>
                <Link href="/privacy-policy" className="related-btn">
                  <span>Privacy Policy</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/terms-of-service" className="related-btn">
                  <span>Terms &amp; Conditions</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/terms-of-service#term-10" className="related-btn">
                  <span>Shipping Policy</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/order#exchange" className="related-btn">
                  <span>Customer Orders &amp; Exchange Desk</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/settings#privacy" className="related-btn">
                  <span>Cookie Policy</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/contact" className="related-btn">
                  <span>Contact Atelier</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
