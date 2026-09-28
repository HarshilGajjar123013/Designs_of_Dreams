"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  Sparkles,
  FileText,
  Truck,
  CreditCard,
  AlertTriangle,
  Mail,
  Phone,
  Globe,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import "./TermsOfService.scss";

const SECTIONS = [
  { id: "term-1", title: "1. Introduction" },
  { id: "term-2", title: "2. Definitions" },
  { id: "term-3", title: "3. Eligibility to Use" },
  { id: "term-4", title: "4. Account Registration" },
  { id: "term-5", title: "5. Products & Handcrafted Nature" },
  { id: "term-6", title: "6. Product Availability" },
  { id: "term-7", title: "7. Pricing & Taxes" },
  { id: "term-8", title: "8. Orders & Order Acceptance" },
  { id: "term-9", title: "9. Payment Terms" },
  { id: "term-10", title: "10. Shipping & Delivery" },
  { id: "term-11", title: "11. International Shipping" },
  { id: "term-12", title: "12. Returns, Exchanges & Refunds" },
  { id: "term-13", title: "13. Customized Products" },
  { id: "term-14", title: "14. User Responsibilities" },
  { id: "term-15", title: "15. Prohibited Activities" },
  { id: "term-16", title: "16. Intellectual Property" },
  { id: "term-17", title: "17. User-Generated Content" },
  { id: "term-18", title: "18. Promotions & Coupons" },
  { id: "term-19", title: "19. Third-Party Services" },
  { id: "term-20", title: "20. Links to External Sites" },
  { id: "term-21", title: "21. Website Availability" },
  { id: "term-22", title: "22. Accuracy of Information" },
  { id: "term-23", title: "23. Disclaimer of Warranties" },
  { id: "term-24", title: "24. Limitation of Liability" },
  { id: "term-25", title: "25. Indemnification" },
  { id: "term-26", title: "26. Force Majeure" },
  { id: "term-27", title: "27. Suspension & Termination" },
  { id: "term-28", title: "28. Governing Law" },
  { id: "term-29", title: "29. Dispute Resolution" },
  { id: "term-30", title: "30. Changes to Terms" },
  { id: "term-31", title: "31. Severability" },
  { id: "term-32", title: "32. Waiver" },
  { id: "term-33", title: "33. Entire Agreement" },
  { id: "term-34", title: "34. Contact Information" },
  { id: "term-35", title: "35. Important Policy Links" },
];

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState("term-1");

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
            <Scale size={16} />
            <span>Ethical Standards &amp; Terms of Trade</span>
          </div>

          <h1 className="legal-title">Terms &amp; Conditions</h1>
          <p className="legal-subtitle">
            Governing your access to Designs of Dreams, artisanal couture commissions,
            and the purchase of handcrafted Indian textile creations.
          </p>

          <div className="legal-dates">
            <span><strong>Effective Date:</strong> <span className="placeholder-badge">[TO BE CONFIRMED]</span></span>
            <span>•</span>
            <span><strong>Last Updated:</strong> September 2026</span>
          </div>

          <div className="legal-crest">❧ ❦ ☙</div>
        </div>
      </div>

      <div className="legal-container">
        {/* ── Legal Review Notice Banner ── */}
        <div className="legal-advisory-banner">
          <AlertTriangle size={22} className="banner-icon" />
          <div className="banner-text">
            <strong>Important Legal Notice:</strong> These Terms &amp; Conditions represent a tailored commercial 
            draft for Designs of Dreams. All placeholders marked with brackets such as{" "}
            <span className="placeholder-badge">[LEGAL BUSINESS NAME]</span>,{" "}
            <span className="placeholder-badge">[PAYMENT PROVIDER]</span>, and{" "}
            <span className="placeholder-badge">[STATE]</span> must be reviewed, confirmed, and approved by a 
            qualified legal professional in India before live commercial deployment.
          </div>
        </div>

        {/* ── Two-Column Main Layout ── */}
        <div className="legal-layout-wrapper">
          {/* ── Sticky Table of Contents (Desktop) ── */}
          <aside className="legal-sticky-sidebar">
            <div className="sidebar-header">
              <h3>Table of Contents</h3>
              <span className="toc-count">35 Sections</span>
            </div>

            <nav className="sidebar-nav-list" aria-label="Terms of Service Sections">
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
              <a href="#term-34" className="btn-quick-contact">
                <Mail size={14} />
                <span>Contact Legal Desk</span>
              </a>
            </div>
          </aside>

          {/* ── Main Policy Content Column ── */}
          <div className="legal-content-main">
            {/* Intro Card */}
            <div className="legal-intro-card">
              <p>
                Welcome to <strong>Designs of Dreams</strong>. These Terms &amp; Conditions (&ldquo;Terms&rdquo;) 
                constitute a legally binding agreement between you (&ldquo;User,&rdquo; &ldquo;Customer,&rdquo; or &ldquo;Patron&rdquo;) 
                and Designs of Dreams governing your access to our website, purchase of artisanal garments, and use 
                of our digital atelier services.
              </p>
              <div className="brand-pills">
                <span className="pill">Pure Handloom Sarees</span>
                <span className="pill">Dress Materials</span>
                <span className="pill">Artisanal Dupattas</span>
                <span className="pill">Blouse Tassels</span>
                <span className="pill">Unstitched Blouses</span>
                <span className="pill">Heritage Embroidery</span>
              </div>
            </div>

            {/* SECTION 1 */}
            <section id="term-1" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">01</span>
                <h2 className="section-title">Introduction &amp; Acceptance of Terms</h2>
              </div>
              <p>
                These Terms &amp; Conditions govern your access to and use of the website located at{" "}
                <span className="placeholder-badge">[WEBSITE URL]</span> (the &ldquo;Website&rdquo;), including all content, 
                catalog services, and order fulfillment provided by Designs of Dreams.
              </p>
              <p>
                By browsing the Website, registering a patron account, commissioning bespoke embroidery, or placing an order 
                for products, you explicitly agree to be bound by these Terms, our Privacy Policy, and any additional guidelines 
                incorporated by reference. <strong>If you do not agree to these Terms, you must immediately cease accessing the Website and refrain from placing orders.</strong>
              </p>
            </section>

            {/* SECTION 2 */}
            <section id="term-2" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">02</span>
                <h2 className="section-title">Definitions</h2>
              </div>
              <p>In these Terms, unless the context otherwise requires, the following terms have the meanings specified below:</p>
              <ul className="legal-list">
                <li><strong>&ldquo;Company,&rdquo; &ldquo;Designs of Dreams,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;:</strong> Refers to the commercial entity operating under the brand name Designs of Dreams, legally registered as <span className="placeholder-badge">[LEGAL BUSINESS NAME]</span>.</li>
                <li><strong>&ldquo;Website&rdquo;:</strong> The e-commerce portal, mobile web application, and associated digital services operating at <span className="placeholder-badge">[WEBSITE URL]</span>.</li>
                <li><strong>&ldquo;User&rdquo; or &ldquo;Patron&rdquo;:</strong> Any individual or legal entity browsing, visiting, or accessing the Website.</li>
                <li><strong>&ldquo;Customer&rdquo;:</strong> A User who places an Order or purchases Products through the Website.</li>
                <li><strong>&ldquo;Account&rdquo;:</strong> The personal digital profile created by a User to manage orders, addresses, and atelier preferences.</li>
                <li><strong>&ldquo;Product&rdquo; or &ldquo;Products&rdquo;:</strong> The fashion garments, sarees, unstitched dress materials, dupattas, blouse pieces, handcrafted tassels, and textile items offered for sale on the Website.</li>
                <li><strong>&ldquo;Order&rdquo;:</strong> A customer&apos;s request to purchase one or more Products via the Website.</li>
                <li><strong>&ldquo;Content&rdquo;:</strong> All text, lookbook photographs, graphics, videos, designs, pattern layouts, and code on the Website.</li>
                <li><strong>&ldquo;Services&rdquo;:</strong> The e-commerce, custom sizing consultation, and delivery services provided by Designs of Dreams.</li>
                <li><strong>&ldquo;Terms&rdquo;:</strong> These Terms &amp; Conditions in their entirety, as updated from time to time.</li>
              </ul>
            </section>

            {/* SECTION 3 */}
            <section id="term-3" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">03</span>
                <h2 className="section-title">Eligibility to Use the Website</h2>
              </div>
              <p>
                To access this Website and purchase Products, you must have the legal capacity to enter into a binding 
                contract under the <strong>Indian Contract Act, 1872</strong> (or the relevant statutory laws of your jurisdiction).
              </p>
              <ul className="legal-list">
                <li>You affirm that you are at least 18 years of age, or possess legal parental/guardian consent if accessing the platform under applicable law.</li>
                <li>You agree to provide true, accurate, current, and complete information during checkout and account creation.</li>
                <li>Designs of Dreams reserves the right to refuse service, terminate accounts, or cancel orders if inaccurate or fraudulent details are submitted.</li>
              </ul>
            </section>

            {/* SECTION 4 */}
            <section id="term-4" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">04</span>
                <h2 className="section-title">Account Registration <span className="placeholder-badge">[IF ACCOUNT REGISTRATION IS ENABLED]</span></h2>
              </div>
              <p>While guest checkout may be permitted, creating an atelier account offers access to order tracking and saved preferences:</p>
              <ul className="legal-list">
                <li>You are solely responsible for maintaining the confidentiality of your login credentials and password.</li>
                <li>You agree not to share your account credentials with unauthorized third parties.</li>
                <li>You accept full responsibility for all activities, orders, and communications occurring under your account.</li>
                <li>You must notify us immediately at <span className="placeholder-badge">[SUPPORT EMAIL]</span> upon suspecting any unauthorized access.</li>
                <li>Designs of Dreams reserves the right to suspend or terminate accounts that exhibit suspicious, fraudulent, or abusive activity.</li>
              </ul>
            </section>

            {/* SECTION 5 */}
            <section id="term-5" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">05</span>
                <h2 className="section-title">Products &amp; Handcrafted Artisanal Nature</h2>
              </div>
              <p>
                Designs of Dreams is an artisanal couture house dedicated to preserving authentic Indian handloom, 
                hand-block printing, and hand-embroidery techniques. Our creations are crafted by human hands, not mass-produced in automated factories:
              </p>
              <div className="policy-callout-box">
                <p>
                  <strong>Natural Handcrafted Variations Are Not Defects:</strong> Minor irregularities in yarn thickness, weaving slubs, 
                  motif alignment, dye absorption, zari variations, hand-tassel stitching, or block print placements are 
                  inherent, authentic characteristics of handmade textiles. They reflect genuine artisan workmanship and shall not be classified as defects.
                </p>
              </div>
              <ul className="legal-list">
                <li><strong>Photography &amp; Lighting:</strong> We make rigorous photographic efforts to capture authentic textile colors. However, variations may occur due to studio lighting, screen calibration, and mobile display hardware.</li>
                <li><strong>Measurements &amp; Sizing:</strong> Stated dimensions (e.g., saree lengths including blouse pieces, dupatta widths, unstitched fabric meterage) are approximate and may have slight handcrafted tolerances (+/- 2-3%).</li>
                <li><strong>Care Instructions:</strong> We strictly recommend professional dry cleaning for all pure silk, zari, and embroidered garments. We are not liable for damage resulting from improper home washing.</li>
              </ul>
            </section>

            {/* SECTION 6 */}
            <section id="term-6" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">06</span>
                <h2 className="section-title">Product Availability</h2>
              </div>
              <p>
                Because many of our handloom sarees and artisanal dupattas are woven in exclusive, limited lots:
              </p>
              <ul className="legal-list">
                <li>All Products displayed on the Website are subject to real-time inventory availability.</li>
                <li>Display of an item does not guarantee ongoing availability; items in high demand may sell out before cart completion.</li>
                <li>We reserve the right to limit the order quantity of any item per patron or household to prevent unauthorized commercial hoarding.</li>
                <li>If an ordered Product becomes unavailable due to inventory depletion or weaving delays, we will notify you promptly and provide a replacement, store credit, or full refund according to our Return &amp; Refund Policy.</li>
              </ul>
            </section>

            {/* SECTION 7 */}
            <section id="term-7" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">07</span>
                <h2 className="section-title">Pricing &amp; Taxes</h2>
              </div>
              <p>
                All prices listed on the Website are in Indian Rupees (INR) unless a multi-currency switcher is explicitly enabled:
              </p>
              <ul className="legal-list">
                <li>Prices are inclusive of applicable Indian Goods and Services Tax (GST) unless indicated otherwise at checkout.</li>
                <li>Delivery charges, customization fees, and expedited shipping fees are calculated and transparently displayed prior to final order confirmation.</li>
                <li>Prices may be updated periodically without prior notice; however, completed orders will always be honored at the price confirmed at checkout.</li>
                <li><strong>Obvious Pricing Errors:</strong> In the rare event of a genuine typographical or technical system error resulting in an obviously incorrect price, we reserve the right to contact the customer to cancel the order or offer the item at the corrected price in accordance with applicable consumer protection laws.</li>
              </ul>
            </section>

            {/* SECTION 8 */}
            <section id="term-8" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">08</span>
                <h2 className="section-title">Orders &amp; Order Acceptance</h2>
              </div>
              <p>The ordering procedure across our digital boutique follows these structured steps:</p>
              <div className="policy-cards-grid">
                <div className="card-item">
                  <h4>1. Selection &amp; Cart</h4>
                  <p>Patron selects desired handloom items, adds bespoke customizations if desired, and adds them to bag.</p>
                </div>
                <div className="card-item">
                  <h4>2. Address &amp; Review</h4>
                  <p>Patron inputs verified shipping and contact details, and reviews order breakdown.</p>
                </div>
                <div className="card-item">
                  <h4>3. Payment &amp; Confirmation</h4>
                  <p>Payment is completed via authorized gateway; automated order confirmation is generated.</p>
                </div>
              </div>
              <div className="policy-callout-box">
                <p>
                  <strong>Acceptance of Order:</strong> Submission of an order and receipt of an automated payment receipt does not constitute 
                  final binding acceptance by Designs of Dreams. Acceptance occurs when your consignment is dispatched and an Airway Bill (AWB) 
                  tracking notification is issued.
                </p>
              </div>
              <p>We reserve the right to decline or cancel an order prior to dispatch under legitimate circumstances, including:</p>
              <ul className="legal-list">
                <li>Unavailability of raw artisanal silk or unexpected weaving defects identified during final quality inspection.</li>
                <li>Incomplete, unverifiable, or fraudulent delivery address details.</li>
                <li>Payment gateway failure, chargeback alerts, or suspected fraudulent activity.</li>
                <li>Logistics carrier delivery embargoes to specific geographical PIN codes.</li>
              </ul>
            </section>

            {/* SECTION 9 */}
            <section id="term-9" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">09</span>
                <h2 className="section-title">Payment Terms</h2>
              </div>
              <p>
                All digital transactions are processed through authorized, RBI-compliant payment aggregator partners:
              </p>
              <div className="policy-callout-box">
                <p>Authorized Payment Partner: <span className="placeholder-badge">[PAYMENT PROVIDER]</span></p>
              </div>
              <ul className="legal-list">
                <li>Customers must provide valid, authorized payment instruments (Credit Card, Debit Card, Net Banking, or UPI).</li>
                <li>Designs of Dreams does not store sensitive card data or UPI PINs; all payments are governed by the payment provider&apos;s independent security terms and PCI-DSS Level 1 infrastructure.</li>
                <li>If a payment is flagged or declined by the issuing bank, the order will not be processed until full payment is verified.</li>
              </ul>
            </section>

            {/* SECTION 10 */}
            <section id="term-10" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">10</span>
                <h2 className="section-title">Shipping &amp; Delivery</h2>
              </div>
              <p>
                We coordinate with verified express logistics providers <span className="placeholder-badge">[SHIPPING PROVIDER]</span> to deliver our parcels safely across India:
              </p>
              <ul className="legal-list">
                <li><strong>Order Processing Time:</strong> In-stock standard garments are processed and inspected within <span className="placeholder-badge">[ORDER PROCESSING TIME]</span> (typically 24 to 48 business hours).</li>
                <li><strong>Estimated Delivery Time:</strong> Domestic consignments generally arrive within <span className="placeholder-badge">[ESTIMATED DELIVERY TIME]</span> (typically 3 to 7 business days depending on destination PIN code).</li>
                <li><strong>Shipping Charge Policy:</strong> Express delivery rates are calculated at checkout as per our <span className="placeholder-badge">[SHIPPING CHARGE POLICY]</span>.</li>
                <li><strong>Transit Delays:</strong> Delivery estimates are indicative. We are not liable for transit delays caused by extreme weather, courier logistics disruptions, or local festival restrictions beyond our control.</li>
                <li><strong>Failed Delivery Attempts:</strong> Couriers make up to 2-3 delivery attempts. If an incorrect address is provided or delivery is repeatedly rejected, return shipping costs may be deducted.</li>
              </ul>
            </section>

            {/* SECTION 11 */}
            <section id="term-11" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">11</span>
                <h2 className="section-title">International Shipping <span className="placeholder-badge">[INTERNATIONAL SHIPPING: TO BE CONFIRMED]</span></h2>
              </div>
              <p>
                If international shipping is enabled on the Website:
              </p>
              <ul className="legal-list">
                <li>International orders are dispatched via global couriers (DHL/FedEx) under destination-specific timelines.</li>
                <li><strong>Customs, Tariffs &amp; Import Duties:</strong> All import duties, VAT, customs clearance fees, and local entry taxes levied by the destination country are the sole legal responsibility of the recipient. Designs of Dreams has no control over statutory foreign customs assessments.</li>
              </ul>
            </section>

            {/* SECTION 12 */}
            <section id="term-12" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">12</span>
                <h2 className="section-title">Returns, Exchanges &amp; Refunds</h2>
              </div>
              <p>
                All return, exchange, cancellation, and refund requests are governed by our detailed{" "}
                <Link href="/order#exchange" className="underline font-semibold text-[#b8391d]">
                  Exchange &amp; Return Policy <span className="placeholder-badge">[RETURN &amp; REFUND POLICY LINK]</span>
                </Link>:
              </p>
              <ul className="legal-list">
                <li><strong>Return / Exchange Window:</strong> Standard unworn garments may be submitted for exchange within <span className="placeholder-badge">[RETURN WINDOW]</span> (typically 7 calendar days of verified delivery).</li>
                <li><strong>Condition Requirements:</strong> Items must be returned in pristine, unworn condition with original atelier motif tags, fabric seals, and heirloom packaging intact.</li>
                <li><strong>Refund Processing Time:</strong> Once returned items pass quality inspection at our facility, refunds or store credits are processed within <span className="placeholder-badge">[REFUND PROCESSING TIME]</span> (typically 5 to 7 business days).</li>
                <li><strong>Exclusions:</strong> Discounted clearance sale items, custom-tailored blouses, and personalized embroidered pieces are not eligible for standard return unless a verified structural defect is confirmed.</li>
              </ul>
            </section>

            {/* SECTION 13 */}
            <section id="term-13" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">13</span>
                <h2 className="section-title">Customized &amp; Made-to-Order Products</h2>
              </div>
              <p>
                Designs of Dreams takes immense pride in offering bespoke blouse customization, personalized embroidery, 
                and handcrafted tassel pairing:
              </p>
              <ul className="legal-list">
                <li><strong>Customer Responsibility for Measurements:</strong> You are solely responsible for ensuring that all body measurements, bust sizing, blouse lengths, sleeve styles, and color choices submitted through our customization forms are accurate.</li>
                <li><strong>Production Lock-in:</strong> Once an artisan begins custom cutting, dyeing, or hand embroidery (typically within 24 hours of order placement), orders cannot be cancelled or modified.</li>
                <li><strong>Return Restrictions on Custom Items:</strong> Custom-tailored blouses and bespoke monogrammed garments are uniquely crafted to individual patron specifications and cannot be restocked; hence, they are strictly non-returnable unless a verified stitching defect is validated by our QC managers.</li>
              </ul>
            </section>

            {/* SECTION 14 */}
            <section id="term-14" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">14</span>
                <h2 className="section-title">User Responsibilities</h2>
              </div>
              <p>As a User of the Designs of Dreams platform, you agree to:</p>
              <ul className="legal-list">
                <li>Provide accurate, genuine, and current identity, billing, and shipping details.</li>
                <li>Comply with all applicable Indian local, state, and national laws while accessing the Website.</li>
                <li>Respect intellectual property rights and artisanal designs showcased on the platform.</li>
                <li>Interact with our artisan support representatives and customer care staff with mutual courtesy and respect.</li>
              </ul>
            </section>

            {/* SECTION 15 */}
            <section id="term-15" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">15</span>
                <h2 className="section-title">Prohibited Activities</h2>
              </div>
              <p>Users are strictly prohibited from engaging in any of the following activities on our Website:</p>
              <ul className="legal-list">
                <li>Attempting unauthorized access to servers, databases, accounts, or networks connected to the Website.</li>
                <li>Deploying automated scraping bots, spiders, crawlers, or data-harvesting tools without written consent.</li>
                <li>Uploading or transmitting viruses, malware, trojans, or corrupted code that disrupts website functionality.</li>
                <li>Submitting fraudulent orders, exploiting coupon codes, using stolen payment cards, or initiating bad-faith chargebacks.</li>
                <li>Impersonating any person or entity, or misrepresenting an affiliation with Designs of Dreams.</li>
                <li>Copying, reproducing, or commercially redistributing our lookbook photographs, weaving motifs, or product descriptions.</li>
              </ul>
            </section>

            {/* SECTION 16 */}
            <section id="term-16" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">16</span>
                <h2 className="section-title">Intellectual Property Rights</h2>
              </div>
              <p>
                All content published on this Website—including but not limited to the brand name <strong>Designs of Dreams</strong>, 
                logos, trademark medallions, lookbook compositions, product photography, text descriptions, graphics, weaving pattern layouts, 
                and software code—is the proprietary intellectual property of <span className="placeholder-badge">[TRADEMARK OWNER / LEGAL BUSINESS NAME]</span> 
                and is protected under the <strong>Copyright Act, 1957</strong> and the <strong>Trade Marks Act, 1999</strong> of India.
              </p>
              <div className="policy-callout-box">
                <p>
                  <strong>No Commercial Exploitation:</strong> You may view, download, or print single copies of lookbook pages solely for 
                  personal, non-commercial reference. Any commercial duplication, scraping, unauthorized advertising use, or distribution is 
                  strictly prohibited and will trigger immediate legal enforcement.
                </p>
              </div>
            </section>

            {/* SECTION 17 */}
            <section id="term-17" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">17</span>
                <h2 className="section-title">User-Generated Content <span className="placeholder-badge">[IF USER REVIEWS/CONTENT ARE ENABLED]</span></h2>
              </div>
              <p>
                If the Website permits patrons to submit reviews, testimonials, comments, or customer styling photos:
              </p>
              <ul className="legal-list">
                <li>You warrant that you own or possess the necessary rights and consents to post such content.</li>
                <li>You grant Designs of Dreams a non-exclusive, royalty-free, worldwide license to display, publish, and adapt the review on our Website or social channels for legitimate promotional purposes.</li>
                <li>You agree not to submit content that is defamatory, obscene, infringing, abusive, or contains commercial solicitation. We reserve the right to moderate or remove inappropriate submissions.</li>
              </ul>
            </section>

            {/* SECTION 18 */}
            <section id="term-18" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">18</span>
                <h2 className="section-title">Promotions, Discounts &amp; Coupons</h2>
              </div>
              <p>
                Promotional voucher codes, festive discounts, or complimentary shipping perks issued by Designs of Dreams are subject to the following terms:
              </p>
              <ul className="legal-list">
                <li>Coupons are valid only within the specified promotional window and cannot be redeemed for cash or transferred.</li>
                <li>Only one promotional code may be applied per order unless explicitly stated otherwise.</li>
                <li>Coupons cannot be applied retroactively to previously confirmed or dispatched orders.</li>
                <li>We reserve the right to modify, cancel, or suspend any promotion if coupon abuse or system exploitation is detected.</li>
              </ul>
            </section>

            {/* SECTION 19 */}
            <section id="term-19" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">19</span>
                <h2 className="section-title">Third-Party Services</h2>
              </div>
              <p>
                Our e-commerce operations integrate with trusted third-party service providers, including payment gateways, 
                logistics carriers, and cloud hosting infrastructure. These third parties operate independently and maintain their own 
                respective terms of service and privacy practices. Designs of Dreams is not responsible for the independent operational 
                disruptions of such third parties beyond our reasonable control.
              </p>
            </section>

            {/* SECTION 20 */}
            <section id="term-20" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">20</span>
                <h2 className="section-title">Links to Third-Party Websites</h2>
              </div>
              <p>
                The Website may contain links or redirects to external websites (such as courier tracking portals or social media channels). 
                Such external links are provided solely for patron convenience. Designs of Dreams does not endorse, control, or accept liability 
                for the content, security, or privacy practices of external web destinations.
              </p>
            </section>

            {/* SECTION 21 */}
            <section id="term-21" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">21</span>
                <h2 className="section-title">Website Availability &amp; Maintenance</h2>
              </div>
              <p>
                While we strive to ensure 24/7 uninterrupted access to our digital atelier, access may occasionally be suspended or restricted 
                to allow for repairs, maintenance, system upgrades, or the introduction of new seasonal collections. We will make reasonable efforts 
                to schedule major maintenance during off-peak hours.
              </p>
            </section>

            {/* SECTION 22 */}
            <section id="term-22" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">22</span>
                <h2 className="section-title">Accuracy of Information</h2>
              </div>
              <p>
                We endeavor to ensure that all information on the Website—including pricing, fabric specifications, weave types, and stock 
                status—is accurate and up to date. However, occasional typographical errors, inaccuracies, or omissions may occur. We reserve the 
                right to correct any errata and to update product data without prior notice.
              </p>
            </section>

            {/* SECTION 23 */}
            <section id="term-23" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">23</span>
                <h2 className="section-title">Disclaimer of Warranties</h2>
              </div>
              <p>
                Except as expressly provided in our Product descriptions and subject to applicable consumer protection laws in India:
              </p>
              <ul className="legal-list">
                <li>The Website and its Products are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.</li>
                <li>We make no warranties, express or implied, regarding uninterrupted digital access, merchantability, or fitness for a particular purpose beyond our confirmed handcrafted specifications.</li>
                <li>Nothing in this disclaimer shall exclude or limit statutory consumer rights that cannot be lawfully waived under Indian law.</li>
              </ul>
            </section>

            {/* SECTION 24 */}
            <section id="term-24" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">24</span>
                <h2 className="section-title">Limitation of Liability</h2>
              </div>
              <p>
                To the maximum extent permitted by applicable Indian law:
              </p>
              <ul className="legal-list">
                <li>Designs of Dreams, its artisans, directors, and affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages arising out of the use of our Website or Products.</li>
                <li>Our total aggregate liability for any proven claim arising out of or related to an Order shall be strictly limited to the total amount paid by the Customer for the specific Product giving rise to the claim.</li>
              </ul>
            </section>

            {/* SECTION 25 */}
            <section id="term-25" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">25</span>
                <h2 className="section-title">Indemnification</h2>
              </div>
              <p>
                You agree to defend, indemnify, and hold harmless Designs of Dreams, its legal entity <span className="placeholder-badge">[LEGAL BUSINESS NAME]</span>, 
                artisans, officers, and employees from and against any claims, liabilities, damages, losses, or legal costs arising out of your 
                violation of these Terms, unlawful conduct, or infringement of any third-party intellectual property or privacy rights.
              </p>
            </section>

            {/* SECTION 26 */}
            <section id="term-26" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">26</span>
                <h2 className="section-title">Force Majeure</h2>
              </div>
              <p>
                Designs of Dreams shall not be held liable or deemed in breach of contract for any delay, delivery failure, or order cancellation 
                resulting from events beyond our reasonable control (&ldquo;Force Majeure&rdquo;). Such events include, without limitation: acts of God, 
                floods, earthquakes, fires, epidemics, civil unrest, acts of government or statutory embargoes, widespread raw silk shortages, 
                courier strikes, or major national telecommunications/internet blackouts.
              </p>
            </section>

            {/* SECTION 27 */}
            <section id="term-27" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">27</span>
                <h2 className="section-title">Suspension &amp; Termination</h2>
              </div>
              <p>
                We reserve the right to immediately suspend, restrict, or terminate your access to the Website or cancel your account without prior 
                notice if you breach any provision of these Terms, engage in payment fraud, or abuse our customer support or artisan staff. 
                Termination of access shall not affect rights, claims, or payment obligations accrued prior to termination.
              </p>
            </section>

            {/* SECTION 28 */}
            <section id="term-28" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">28</span>
                <h2 className="section-title">Governing Law &amp; Jurisdiction</h2>
              </div>
              <p>
                These Terms &amp; Conditions and any transactions executed on the Website shall be governed by and construed in accordance with 
                the laws of <strong>India <span className="placeholder-badge">[INDIA]</span></strong>.
              </p>
              <p>
                Subject to the dispute resolution provisions set forth below, the competent civil courts located within{" "}
                <span className="placeholder-badge">[STATE]</span>, India shall have exclusive jurisdiction over all legal disputes arising out of 
                or relating to these Terms.
              </p>
            </section>

            {/* SECTION 29 */}
            <section id="term-29" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">29</span>
                <h2 className="section-title">Dispute Resolution</h2>
              </div>
              <p>We are dedicated to resolving any patron concerns with mutual fairness and transparency:</p>
              <ul className="legal-list">
                <li><strong>Amicable Negotiation:</strong> In the event of any grievance or dispute regarding an order, product, or these Terms, the patron agrees to first contact our support desk at <span className="placeholder-badge">[SUPPORT EMAIL]</span> to attempt good-faith informal resolution.</li>
                <li><strong>Formal Proceedings:</strong> If the dispute cannot be amicably settled within thirty (30) business days, either party may pursue statutory remedies available before the competent courts of <span className="placeholder-badge">[STATE]</span>, India.</li>
              </ul>
            </section>

            {/* SECTION 30 */}
            <section id="term-30" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">30</span>
                <h2 className="section-title">Changes to Terms</h2>
              </div>
              <p>
                Designs of Dreams reserves the right to revise, modify, or replace these Terms at any time to accommodate operational, business, 
                or legal updates. When revisions are published, the &ldquo;Last Updated&rdquo; date at the top of this document will be amended. 
                Continued access or placing new orders following the posting of changes constitutes your acceptance of the revised Terms.
              </p>
            </section>

            {/* SECTION 31 */}
            <section id="term-31" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">31</span>
                <h2 className="section-title">Severability</h2>
              </div>
              <p>
                If any provision of these Terms is deemed unlawful, void, or for any reason unenforceable by a court of competent jurisdiction, 
                that specific provision shall be deemed severable and shall not impair the validity or enforceability of any remaining provisions.
              </p>
            </section>

            {/* SECTION 32 */}
            <section id="term-32" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">32</span>
                <h2 className="section-title">Waiver</h2>
              </div>
              <p>
                The failure or delay of Designs of Dreams to exercise or enforce any right, power, or provision under these Terms shall not 
                operate as a waiver of such right or provision in that or any subsequent instance.
              </p>
            </section>

            {/* SECTION 33 */}
            <section id="term-33" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">33</span>
                <h2 className="section-title">Entire Agreement</h2>
              </div>
              <p>
                These Terms &amp; Conditions, together with our Privacy Policy, Exchange &amp; Return Policy, and any written order confirmations, 
                constitute the entire legal understanding and agreement between you and Designs of Dreams regarding your use of the Website and 
                supersede all prior communications, proposals, or understandings.
              </p>
            </section>

            {/* SECTION 34 */}
            <section id="term-34" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">34</span>
                <h2 className="section-title">Contact Information</h2>
              </div>
              <p>
                For any inquiries, legal clarifications, or notices concerning these Terms &amp; Conditions, please reach out to our legal desk:
              </p>

              <div className="contact-highlight-card">
                <h3>Designs of Dreams</h3>
                <span className="role-tag">Atelier Legal Desk</span>
                <div className="info-rows">
                  <div className="info-row">
                    <FileText size={18} className="icon" />
                    <span><strong>Legal Business Name:</strong> <span className="placeholder-badge">[LEGAL BUSINESS NAME]</span></span>
                  </div>
                  <div className="info-row">
                    <Globe size={18} className="icon" />
                    <span><strong>Registered Address:</strong> <span className="placeholder-badge">[BUSINESS ADDRESS]</span></span>
                  </div>
                  <div className="info-row">
                    <Mail size={18} className="icon" />
                    <span><strong>Customer Support Email:</strong> <span className="placeholder-badge">[SUPPORT EMAIL]</span></span>
                  </div>
                  <div className="info-row">
                    <Scale size={18} className="icon" />
                    <span><strong>Legal &amp; Terms Email:</strong> <span className="placeholder-badge">[TERMS &amp; CONDITIONS CONTACT EMAIL]</span></span>
                  </div>
                  <div className="info-row">
                    <Phone size={18} className="icon" />
                    <span><strong>Telephone / WhatsApp:</strong> <span className="placeholder-badge">[PHONE NUMBER]</span></span>
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

            {/* SECTION 35 */}
            <section id="term-35" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">35</span>
                <h2 className="section-title">Important Policy Links</h2>
              </div>
              <p>
                We invite patrons to review our complementary operational and customer care policies:
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
                <Link href="/order#exchange" className="related-btn">
                  <span>Exchange &amp; Return Policy</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/terms-of-service#term-10" className="related-btn">
                  <span>Shipping Policy</span>
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
