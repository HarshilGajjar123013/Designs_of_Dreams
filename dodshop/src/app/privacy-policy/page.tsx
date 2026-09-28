"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Phone,
  Mail,
  ArrowLeft,
  Truck,
  CreditCard,
  Cookie,
  AlertTriangle,
  UserCheck,
  Bell,
  Globe,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import "./PrivacyPolicy.scss";

const SECTIONS = [
  { id: "section-1", title: "1. Privacy Policy & Overview" },
  { id: "section-2", title: "2. Information We Collect" },
  { id: "section-3", title: "3. How We Use Information" },
  { id: "section-4", title: "4. Legal Basis of Processing" },
  { id: "section-5", title: "5. How We Share Information" },
  { id: "section-6", title: "6. Payment Information" },
  { id: "section-7", title: "7. Shipping & Delivery" },
  { id: "section-8", title: "8. Cookies Policy" },
  { id: "section-9", title: "9. Third-Party Services" },
  { id: "section-10", title: "10. Data Retention" },
  { id: "section-11", title: "11. Data Security" },
  { id: "section-12", title: "12. User Rights & Choices" },
  { id: "section-13", title: "13. Marketing Communications" },
  { id: "section-14", title: "14. Children's Privacy" },
  { id: "section-15", title: "15. International Transfers" },
  { id: "section-16", title: "16. Account Security" },
  { id: "section-17", title: "17. Security Incidents" },
  { id: "section-18", title: "18. Policy Updates" },
  { id: "section-19", title: "19. Contact Us" },
  { id: "section-20", title: "20. Grievance Officer" },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("section-1");

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
            <ShieldCheck size={16} />
            <span>Data Protection &amp; Patron Trust</span>
          </div>

          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">
            Our commitment to safeguarding patron confidentiality, transactional transparency,
            and artisanal textile heritage.
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
            <strong>Important Legal Notice:</strong> This privacy document is a tailored operational draft for 
            Designs of Dreams. Placeholders marked with brackets such as{" "}
            <span className="placeholder-badge">[LEGAL BUSINESS NAME]</span>,{" "}
            <span className="placeholder-badge">[PRIVACY EMAIL]</span>, and{" "}
            <span className="placeholder-badge">[TO BE CONFIRMED]</span> must be reviewed, finalized, and validated 
            by a qualified legal professional prior to statutory public deployment.
          </div>
        </div>

        {/* ── Two-Column Main Layout ── */}
        <div className="legal-layout-wrapper">
          {/* ── Sticky Table of Contents (Desktop) ── */}
          <aside className="legal-sticky-sidebar">
            <div className="sidebar-header">
              <h3>Table of Contents</h3>
              <span className="toc-count">20 Sections</span>
            </div>

            <nav className="sidebar-nav-list" aria-label="Privacy Policy Sections">
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
              <a href="#section-19" className="btn-quick-contact">
                <Mail size={14} />
                <span>Privacy Contact</span>
              </a>
            </div>
          </aside>

          {/* ── Main Policy Content Column ── */}
          <div className="legal-content-main">
            {/* Intro Card */}
            <div className="legal-intro-card">
              <p>
                Welcome to <strong>Designs of Dreams</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us,&rdquo; or the &ldquo;Brand&rdquo;). 
                We operate an e-commerce platform dedicated to celebrating Indian textile heritage, artisanal craftsmanship, 
                and bespoke contemporary fashion. We place paramount importance on respecting your personal privacy and protecting 
                the information you share with us.
              </p>
              <div className="brand-pills">
                <span className="pill">Sarees &amp; Handlooms</span>
                <span className="pill">Dress Materials</span>
                <span className="pill">Dupattas</span>
                <span className="pill">Blouse Tassels</span>
                <span className="pill">Unstitched Blouses</span>
                <span className="pill">Artisanal Embroidery</span>
              </div>
            </div>

            {/* SECTION 1 */}
            <section id="section-1" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">01</span>
                <h2 className="section-title">Privacy Policy &amp; Scope</h2>
              </div>
              <p>
                This Privacy Policy explains how Designs of Dreams collects, uses, stores, processes, and protects your 
                personal information when you visit, browse, register an account, interact with customer support, or place an order 
                on our website: <span className="placeholder-badge">[WEBSITE URL]</span> (the &ldquo;Website&rdquo;).
              </p>
              <p>
                By accessing or using our Website, browsing our handcrafted collections, or commissioning custom artisanal pieces, 
                you acknowledge having read and understood the practices described herein. This policy applies to visitors, registered 
                account holders, and patrons purchasing our products within India and internationally <span className="placeholder-badge">[IF APPLICABLE]</span>.
              </p>
              <div className="policy-callout-box">
                <p>
                  <strong>Patron Confidentiality Commitment:</strong> We design our digital workflows around the same principles of integrity, 
                  care, and respect that guide our master artisans at their looms. We only collect information strictly necessary to fulfill your orders 
                  and elevate your atelier experience.
                </p>
              </div>
            </section>

            {/* SECTION 2 */}
            <section id="section-2" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">02</span>
                <h2 className="section-title">Information We Collect</h2>
              </div>
              <p>
                Depending on how you interact with Designs of Dreams, we collect information across the following specific categories:
              </p>

              <h3 className="sub-heading">A. Personal Identification &amp; Contact Information</h3>
              <p>Information you directly provide when creating an atelier account, submitting an inquiry, or completing a checkout:</p>
              <ul className="legal-list">
                <li><strong>Full Name:</strong> Required to identify your account and personalize your parcel shipping labels.</li>
                <li><strong>Email Address:</strong> Used for order confirmations, GST invoices, dispatch notifications, and customer support.</li>
                <li><strong>Telephone / Mobile Number:</strong> Utilized for courier delivery coordination and optional WhatsApp updates.</li>
                <li><strong>Delivery &amp; Billing Addresses:</strong> Street address, apartment/suite number, city, state, postal/PIN code, and country.</li>
                <li><strong>Bespoke Customization Details:</strong> Blouse measurement specifications, fabric selections, embroidery preferences, and tassel choices shared through our customization form.</li>
                <li><strong>Customer Support Records:</strong> Inquiries, communications, or notes exchanged with our team via email, contact forms, or messaging channels.</li>
              </ul>

              <h3 className="sub-heading">B. Transactional Information</h3>
              <p>When you purchase from Designs of Dreams, we retain necessary transactional records:</p>
              <ul className="legal-list">
                <li>Details of purchased items (SKU, title, quantity, price, fabric type).</li>
                <li>Order totals, delivery charges, discounts/coupons applied, and invoice numbers.</li>
                <li>Payment transaction status, timestamp, and gateway reference token.</li>
              </ul>
              <div className="policy-callout-box">
                <p>
                  <strong>No Storage of Sensitive Payment Credentials:</strong> Designs of Dreams <strong>does not</strong> capture, 
                  store, or process complete debit/credit card numbers, CVV/CVC codes, Net Banking passwords, or UPI PINs. All payments 
                  are handled directly by our authorized, certified third-party payment partner <span className="placeholder-badge">[PAYMENT PROVIDER NAME]</span>.
                </p>
              </div>

              <h3 className="sub-heading">C. Technical &amp; Device Information</h3>
              <p>Automatically collected when you navigate our Website:</p>
              <ul className="legal-list">
                <li><strong>Network &amp; Device Identifiers:</strong> Internet Protocol (IP) address, browser type and version, device model, and operating system.</li>
                <li><strong>Approximate Geolocation:</strong> Broad country, state, or city region derived from your IP address to calculate appropriate domestic delivery or currency displays.</li>
                <li><strong>Browsing Telemetry:</strong> Pages viewed, time spent on atelier collections, referral sources, and diagnostic error logs used solely for website stability.</li>
              </ul>

              <h3 className="sub-heading">D. Cookies &amp; Similar Technologies</h3>
              <p>
                We use small text files stored on your browser to support essential cart operations and personalize your browsing session. 
                Full details are set forth in Section 8 below.
              </p>
            </section>

            {/* SECTION 3 */}
            <section id="section-3" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">03</span>
                <h2 className="section-title">How We Use Your Information</h2>
              </div>
              <p>We process your personal information exclusively for verified, legitimate business and operational purposes:</p>
              <div className="policy-cards-grid">
                <div className="card-item">
                  <h4>Order Fulfillment</h4>
                  <p>Processing transactions, weaving/preparing garments, packaging, and dispatching your heirloom orders.</p>
                </div>
                <div className="card-item">
                  <h4>Account Management</h4>
                  <p>Enabling secure patron logins, order history tracking, and saved delivery address preferences.</p>
                </div>
                <div className="card-item">
                  <h4>Artisanal Tailoring</h4>
                  <p>Reviewing custom blouse measurements and embroidery briefs to ensure an immaculate, personalized fit.</p>
                </div>
                <div className="card-item">
                  <h4>Customer Care &amp; Exchanges</h4>
                  <p>Responding to inquiries, resolving transit queries, and processing size/design exchanges within 7 days.</p>
                </div>
                <div className="card-item">
                  <h4>Security &amp; Fraud Prevention</h4>
                  <p>Detecting fraudulent orders, preventing unauthorized account access, and verifying checkout safety.</p>
                </div>
                <div className="card-item">
                  <h4>Statutory Compliance</h4>
                  <p>Issuing valid GST tax invoices and complying with statutory bookkeeping obligations under Indian law.</p>
                </div>
              </div>
              <p>
                <strong>Essential Service vs. Marketing Communications:</strong> We strictly distinguish essential transactional 
                notifications (order receipts, dispatch tracking, security alerts) from optional promotional updates. You will only 
                receive promotional lookbooks or festive announcements where legally permitted and/or where you have explicitly opted in.
              </p>
            </section>

            {/* SECTION 4 */}
            <section id="section-4" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">04</span>
                <h2 className="section-title">Legal Basis &amp; Purpose of Processing</h2>
              </div>
              <p>
                In alignment with applicable Indian laws, including the Information Technology Act 2000, associated rules, 
                and emerging data protection principles, Designs of Dreams processes personal information on the following legal grounds:
              </p>
              <ul className="legal-list">
                <li>
                  <strong>Performance of a Contract:</strong> Processing necessary to fulfill our purchase agreement with you—including 
                  accepting payment, customizing handloom fabrics, and delivering your ordered garments.
                </li>
                <li>
                  <strong>Statutory &amp; Legal Obligations:</strong> Retaining financial records, tax invoices, and transaction logs 
                  mandated by Indian Goods and Services Tax (GST) laws and commercial accounting statutes.
                </li>
                <li>
                  <strong>Legitimate Business Interests:</strong> Safeguarding website integrity, preventing cyber threats and payment fraud, 
                  improving navigation performance, and maintaining customer service excellence.
                </li>
                <li>
                  <strong>With User Consent:</strong> When you voluntarily subscribe to our email newsletter, request WhatsApp notifications, 
                  or enable optional analytics cookies. You may revoke consent at any time without affecting past lawful processing.
                </li>
              </ul>
            </section>

            {/* SECTION 5 */}
            <section id="section-5" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">05</span>
                <h2 className="section-title">How We Share Information</h2>
              </div>
              <div className="policy-callout-box">
                <p>
                  <strong>Absolute Non-Sale Commitment:</strong> Designs of Dreams <strong>does not sell, rent, lease, or trade</strong> your 
                  personal data to any third-party brokers, marketing networks, or list aggregators under any circumstances.
                </p>
              </div>
              <p>
                To provide our e-commerce services, we share only necessary, purpose-limited information with authorized service providers:
              </p>
              <ul className="legal-list">
                <li>
                  <strong>Payment Gateways:</strong> Order identification and payable amount transmitted securely to licensed payment aggregators 
                  <span className="placeholder-badge">[PAYMENT PROVIDER NAME]</span> for checkout processing.
                </li>
                <li>
                  <strong>Logistics &amp; Courier Partners:</strong> Recipient name, delivery address, postal PIN code, and contact phone number 
                  shared with verified domestic/international couriers to enable parcel delivery, SMS tracking, and return/exchange pickups.
                </li>
                <li>
                  <strong>Hosting &amp; Infrastructure Providers:</strong> Secure cloud server facilities and database systems hosting our web application.
                </li>
                <li>
                  <strong>Customer Communication Services:</strong> Authorized email or SMS/WhatsApp gateway providers <span className="placeholder-badge">[IF APPLICABLE]</span> 
                  delivering your order updates.
                </li>
                <li>
                  <strong>Professional Advisors &amp; Legal Compliance:</strong> Chartered accountants, auditors, or legal counsel under binding 
                  confidentiality duties, or government/law-enforcement agencies where required by a valid judicial court order or statutory Indian regulation.
                </li>
              </ul>
            </section>

            {/* SECTION 6 */}
            <section id="section-6" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">06</span>
                <h2 className="section-title">Payment Information &amp; Gateway Processing</h2>
              </div>
              <p>
                All digital transactions on the Designs of Dreams website are handled through encrypted, RBI-authorized third-party payment 
                aggregators:
              </p>
              <div className="policy-callout-box">
                <p>
                  Authorized Payment Partner: <span className="placeholder-badge">[PAYMENT PROVIDER NAME]</span>
                </p>
              </div>
              <ul className="legal-list">
                <li>
                  During checkout, your payment card number, expiry date, CVV, Net Banking credentials, or UPI details are entered directly 
                  into the payment gateway&apos;s encrypted interface.
                </li>
                <li>
                  Payment providers operate under stringent <strong>PCI-DSS (Payment Card Industry Data Security Standard) Level 1</strong> compliance 
                  and process data under their own independent privacy policies.
                </li>
                <li>
                  Designs of Dreams only receives an encrypted transaction confirmation token, the authorization status (Success/Failed), 
                  and the payment method type (e.g., &ldquo;UPI&rdquo; or &ldquo;Credit Card&rdquo;) to mark your order as confirmed.
                </li>
              </ul>
            </section>

            {/* SECTION 7 */}
            <section id="section-7" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">07</span>
                <h2 className="section-title">Shipping &amp; Delivery Information</h2>
              </div>
              <p>
                To ensure your luxury textiles reach your doorstep safely, we coordinate closely with verified logistics partners:
              </p>
              <ul className="legal-list">
                <li>
                  <strong>Information Disclosed:</strong> Consignee name, destination address, landmark, PIN code, and contact telephone number.
                </li>
                <li>
                  <strong>Waybill &amp; Tracking:</strong> When your order is woven and dispatched, a unique Airway Bill (AWB) tracking number 
                  is generated. You may receive SMS or WhatsApp tracking notifications directly from our logistics partners.
                </li>
                <li>
                  <strong>Delivery Coordination:</strong> Courier agents may contact your phone number to coordinate gate access, OTP delivery 
                  confirmation, or reschedule a missed delivery attempt.
                </li>
                <li>
                  <strong>Exchanges:</strong> If you request a size or design exchange, your delivery details are shared for reverse courier pickup 
                  and subsequent re-dispatch.
                </li>
              </ul>
            </section>

            {/* SECTION 8 */}
            <section id="section-8" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">08</span>
                <h2 className="section-title">Cookies Policy &amp; Tracking</h2>
              </div>
              <p>
                Cookies are small data files placed on your computer or mobile device by your browser. We categorize our cookie usage as follows:
              </p>
              <div className="policy-cards-grid">
                <div className="card-item">
                  <h4>Essential / Strict Cookies</h4>
                  <p>Required to maintain your shopping cart, user authentication session, and checkout progress. The website cannot function without them.</p>
                </div>
                <div className="card-item">
                  <h4>Preference Cookies</h4>
                  <p>Remember your customized currency settings, saved delivery preferences, and wishlist selections for future visits.</p>
                </div>
                <div className="card-item">
                  <h4>Analytics Cookies <span className="placeholder-badge">[IF USED]</span></h4>
                  <p>Gather anonymous, aggregate traffic data to evaluate which collections are most loved and improve site performance.</p>
                </div>
              </div>
              <p>
                <strong>Managing Your Cookie Preferences:</strong> You can manage or block cookies at any time via your browser settings 
                (Chrome, Safari, Firefox, Edge). Please note that disabling essential cookies may prevent you from adding items to your bag, 
                signing in, or completing a checkout.
              </p>
            </section>

            {/* SECTION 9 */}
            <section id="section-9" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">09</span>
                <h2 className="section-title">Third-Party Services &amp; External Links</h2>
              </div>
              <p>
                Our Website may feature links to external websites, social media profiles (Instagram, Pinterest, Facebook), or third-party 
                communication utilities (e.g., direct WhatsApp chat links).
              </p>
              <p>
                These external platforms operate entirely independently from Designs of Dreams and maintain their own distinct privacy policies. 
                We do not endorse, oversee, or accept responsibility for the data protection practices, content, or security of external websites. 
                We encourage patrons to review the privacy terms of any third-party service they visit.
              </p>
            </section>

            {/* SECTION 10 */}
            <section id="section-10" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">10</span>
                <h2 className="section-title">Data Retention</h2>
              </div>
              <p>
                We retain personal information only for as long as reasonably required to fulfill the purposes for which it was gathered, 
                including:
              </p>
              <ul className="legal-list">
                <li>Active account maintenance as long as you maintain an account with Designs of Dreams.</li>
                <li>Completing purchases, handling size exchanges, and resolving post-delivery customer care requests.</li>
                <li>Complying with statutory tax, invoicing, and company record-keeping obligations under prevailing Indian law.</li>
                <li>Defending legal claims, establishing audit trails, and preventing ongoing fraud or security abuse.</li>
              </ul>
              <p>
                When personal data is no longer required for legitimate business or statutory purposes, it is securely anonymized or permanently deleted.
              </p>
            </section>

            {/* SECTION 11 */}
            <section id="section-11" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">11</span>
                <h2 className="section-title">Data Security Measures</h2>
              </div>
              <p>
                We maintain appropriate administrative, technical, and physical safeguards designed to protect your personal information against 
                accidental, unlawful, or unauthorized destruction, loss, alteration, access, or disclosure:
              </p>
              <ul className="legal-list">
                <li><strong>Encryption in Transit:</strong> All data transmissions between your browser and our servers are encrypted using modern Transport Layer Security (TLS 1.2 / TLS 1.3 / HTTPS).</li>
                <li><strong>Access Control:</strong> Administrative access to order records is restricted to authorized personnel on a strict need-to-know basis, protected by multi-factor authentication.</li>
                <li><strong>Infrastructure Hardening:</strong> Routine system security audits, software updates, and server firewall protections.</li>
              </ul>
              <div className="policy-callout-box">
                <p>
                  <strong>Internet Security Realities:</strong> While we enforce robust, industry-standard precautions, no electronic transmission 
                  over the internet or cloud storage repository can be guaranteed to be 100% impenetrable. We urge patrons to exercise care in 
                  protecting their own login credentials.
                </p>
              </div>
            </section>

            {/* SECTION 12 */}
            <section id="section-12" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">12</span>
                <h2 className="section-title">User Rights &amp; Choices</h2>
              </div>
              <p>
                Depending on applicable data protection laws, you possess meaningful rights regarding your personal information:
              </p>
              <ul className="legal-list">
                <li><strong>Right of Access &amp; Review:</strong> Request a summary of the personal information we hold concerning your account.</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate, incomplete, or outdated personal contact or delivery details.</li>
                <li><strong>Right to Erasure / Account Deletion:</strong> Request deletion of your user account and profile, subject to statutory record-keeping requirements for completed sales.</li>
                <li><strong>Right to Withdraw Consent:</strong> Where processing relies on your voluntary consent, you may withdraw it at any time.</li>
                <li><strong>Marketing Opt-Out:</strong> Unsubscribe from promotional mailers or text announcements at your convenience.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact our Privacy Desk at <span className="placeholder-badge">[PRIVACY EMAIL]</span>. 
                We will verify your identity before processing any data modification or deletion request.
              </p>
            </section>

            {/* SECTION 13 */}
            <section id="section-13" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">13</span>
                <h2 className="section-title">Marketing Communications &amp; Opt-Out</h2>
              </div>
              <p>
                From time to time, we may share announcements regarding new handloom collections, seasonal lookbooks, or private bridal trunk shows:
              </p>
              <ul className="legal-list">
                <li><strong>Opt-In Standard:</strong> We will only send promotional messages where permitted by law or where you have opted in.</li>
                <li><strong>One-Click Unsubscribe:</strong> Every promotional email features a direct &ldquo;Unsubscribe&rdquo; link. WhatsApp messages can be discontinued by replying &ldquo;STOP.&rdquo;</li>
                <li><strong>Transactional Exclusion:</strong> Opting out of marketing will <em>not</em> stop essential transactional communications, such as order receipts, shipping notifications, and exchange status updates.</li>
              </ul>
            </section>

            {/* SECTION 14 */}
            <section id="section-14" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">14</span>
                <h2 className="section-title">Children&apos;s Privacy</h2>
              </div>
              <p>
                Designs of Dreams does not knowingly solicit or collect personal information from individuals under the legal age of majority 
                (in India, minors under 18 years of age). Our collections and purchasing services are intended exclusively for adults who can 
                enter into legally binding contracts under the Indian Contract Act, 1872.
              </p>
              <p>
                If we discover that personal data of a minor has been collected without verifiable parental consent, we will promptly delete 
                such data from our active records. If you believe a minor has provided us with personal data, please contact us immediately.
              </p>
            </section>

            {/* SECTION 15 */}
            <section id="section-15" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">15</span>
                <h2 className="section-title">International Data Transfers <span className="placeholder-badge">[IF APPLICABLE]</span></h2>
              </div>
              <p>
                Designs of Dreams is based in India. If you access our Website or place orders from outside India, please note that your 
                information will be transferred to, stored, and processed within India and potentially other jurisdictions where our cloud 
                service providers or international logistics couriers maintain servers.
              </p>
              <p>
                Where cross-border data transfers occur, we take reasonable steps to ensure that your information receives an adequate level of 
                protection consistent with applicable legal requirements.
              </p>
            </section>

            {/* SECTION 16 */}
            <section id="section-16" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">16</span>
                <h2 className="section-title">Account Security &amp; Patron Responsibility</h2>
              </div>
              <p>
                While we implement rigorous security measures, patrons play a vital role in maintaining account safety:
              </p>
              <ul className="legal-list">
                <li>Keep your account password private and do not share credentials with third parties.</li>
                <li>Choose complex passwords combining upper and lower case letters, numbers, and symbols.</li>
                <li>Always log out of your account when accessing the Website from public or shared computers.</li>
                <li>Notify our support team immediately if you suspect unauthorized access or compromise of your account credentials.</li>
              </ul>
            </section>

            {/* SECTION 17 */}
            <section id="section-17" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">17</span>
                <h2 className="section-title">Data Breach &amp; Security Incidents</h2>
              </div>
              <p>
                Designs of Dreams maintains proactive protocols to identify, contain, and remediate potential security incidents involving 
                personal data:
              </p>
              <ul className="legal-list">
                <li><strong>Rapid Assessment:</strong> Immediate technical containment and forensic investigation upon detection of any suspicious system anomaly.</li>
                <li><strong>Remediation:</strong> Deploying software patches, resetting affected credentials, and reinforcing protective barriers.</li>
                <li><strong>Statutory &amp; User Notification:</strong> If a security incident poses a significant risk of harm to individuals, we will notify affected patrons and appropriate regulatory bodies in accordance with applicable Indian laws and regulatory directives.</li>
              </ul>
            </section>

            {/* SECTION 18 */}
            <section id="section-18" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">18</span>
                <h2 className="section-title">Changes to This Privacy Policy</h2>
              </div>
              <p>
                We may periodically update this Privacy Policy to reflect modifications in our artisanal services, technological infrastructure, 
                or statutory regulations under Indian law.
              </p>
              <p>
                When changes are made, we will revise the &ldquo;Last Updated&rdquo; date at the top of this document. For material modifications 
                that substantially alter how we handle your personal data, we will provide prominent notice on our homepage or send direct 
                notification where appropriate. Your continued use of the Website after such revisions constitutes your acceptance of the updated terms.
              </p>
            </section>

            {/* SECTION 19 */}
            <section id="section-19" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">19</span>
                <h2 className="section-title">Contact Us</h2>
              </div>
              <p>
                For privacy-related questions, requests, data corrections, or concerns, please reach out to our boutique management:
              </p>

              <div className="contact-highlight-card">
                <h3>Designs of Dreams</h3>
                <span className="role-tag">Atelier Privacy Inquiries</span>
                <div className="info-rows">
                  <div className="info-row">
                    <FileText size={18} className="icon" />
                    <span><strong>Legal Entity:</strong> <span className="placeholder-badge">[LEGAL BUSINESS NAME]</span></span>
                  </div>
                  <div className="info-row">
                    <Globe size={18} className="icon" />
                    <span><strong>Address:</strong> <span className="placeholder-badge">[BUSINESS ADDRESS]</span></span>
                  </div>
                  <div className="info-row">
                    <Mail size={18} className="icon" />
                    <span><strong>Email:</strong> <span className="placeholder-badge">[PRIVACY EMAIL]</span></span>
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
                  Customer Privacy Desk operates Monday to Saturday: 10:00 AM – 7:00 PM IST.
                </p>
              </div>
            </section>

            {/* SECTION 20 */}
            <section id="section-20" className="legal-section">
              <div className="section-header-row">
                <span className="section-num">20</span>
                <h2 className="section-title">Grievance Officer &amp; Redressal Mechanism</h2>
              </div>
              <p>
                In accordance with the Information Technology Act, 2000, and the Information Technology (Intermediary Guidelines and 
                Digital Media Ethics Code) Rules, 2021, the name and contact details of the Grievance Officer for consumer privacy grievances 
                are provided below:
              </p>

              <div className="contact-highlight-card">
                <h3>Privacy / Grievance Contact</h3>
                <span className="role-tag">Statutory Grievance Redressal</span>
                <div className="info-rows">
                  <div className="info-row">
                    <UserCheck size={18} className="icon" />
                    <span><strong>Name / Designation:</strong> <span className="placeholder-badge">[NAME / DESIGNATION]</span></span>
                  </div>
                  <div className="info-row">
                    <Mail size={18} className="icon" />
                    <span><strong>Email:</strong> <span className="placeholder-badge">[EMAIL]</span></span>
                  </div>
                  <div className="info-row">
                    <Phone size={18} className="icon" />
                    <span><strong>Phone:</strong> <span className="placeholder-badge">[PHONE]</span></span>
                  </div>
                  <div className="info-row">
                    <Globe size={18} className="icon" />
                    <span><strong>Postal Address:</strong> <span className="placeholder-badge">[ADDRESS]</span></span>
                  </div>
                </div>
                <p className="hours-note">
                  Complaints and grievances will be acknowledged within 48 hours and addressed within statutory timelines prescribed by applicable law.
                </p>
              </div>
            </section>

            {/* ── Related Policies Navigation Bar ── */}
            <div className="related-policies-bar">
              <h3>Related Policies &amp; Store Information</h3>
              <div className="related-links-grid">
                <Link href="/terms-of-service" className="related-btn">
                  <span>Terms &amp; Conditions</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/terms-of-service#shipping" className="related-btn">
                  <span>Shipping Policy</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/order#exchange" className="related-btn">
                  <span>Exchange Policy</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/settings#privacy" className="related-btn">
                  <span>Cookie Preferences</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/contact" className="related-btn">
                  <span>Contact Atelier</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
