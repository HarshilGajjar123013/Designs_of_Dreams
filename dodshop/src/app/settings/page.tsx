"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Shield,
  RotateCcw,
  CreditCard,
  HelpCircle,
  CheckCircle2,
  ShieldAlert,
  LogIn
} from "lucide-react";
import "./Settings.scss";

type TabType = "privacy" | "policies" | "requests" | "refunds";

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("privacy");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Privacy toggles state
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [personalizedAds, setPersonalizedAds] = useState(true);
  const [analyticsCookies, setAnalyticsCookies] = useState(true);

  // Zustand Store
  const user = useStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user?.isLoggedIn) {
      router.push("/login");
    }
  }, [mounted, user, router]);

  // Handle URL Hash change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#privacy") setActiveTab("privacy");
      else if (hash === "#policies") setActiveTab("policies");
      else if (hash === "#requests") setActiveTab("requests");
      else if (hash === "#refunds") setActiveTab("refunds");
      else setActiveTab("privacy");
    }
  }, [mounted]);

  if (!mounted) return null;

  const handleSavePrivacy = () => {
    setSaveSuccess("Privacy preferences updated successfully!");
    setTimeout(() => setSaveSuccess(""), 2000);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab === "privacy" ? "" : tab;
    }
  };

  return (
    <main className="relative pt-[120px] pb-[100px] bg-white min-h-screen">
      {/* Decorative background jali */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='38' fill='none' stroke='%23000000' stroke-width='0.5'/%3E%3C/svg%3E\")" }}
      />

      <div className="settings-page-container">
        {!user?.isLoggedIn ? (
          // ACCESS WARNING
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-6">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
            <p className="text-zinc-500 max-w-sm mb-8">You must be signed in to access account and privacy configurations.</p>
            <Link href="/login" className="btn-profile-submit flex items-center gap-2">
              <LogIn size={16} />
              Sign In to Account
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="settings-header">
              <h2>Preferences & Privacy</h2>
              <p>Configure cookie tracking, marketing notification frequencies, and view refund/return policies.</p>
            </div>

            {/* Notification alert */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 font-semibold text-sm shadow-sm"
                >
                  <CheckCircle2 size={18} />
                  {saveSuccess}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Layout Grid */}
            <div className="settings-layout">
              {/* Sidebar Navigation */}
              <aside className="settings-sidebar">
                <div className="sidebar-nav-links">
                  <button
                    className={`sidebar-btn ${activeTab === "privacy" ? "is-active" : ""}`}
                    onClick={() => handleTabChange("privacy")}
                  >
                    <Shield size={16} />
                    Privacy Settings
                  </button>
                  <button
                    className={`sidebar-btn ${activeTab === "policies" ? "is-active" : ""}`}
                    onClick={() => handleTabChange("policies")}
                  >
                    <HelpCircle size={16} />
                    Returns & Refunds
                  </button>
                  <button
                    className={`sidebar-btn ${activeTab === "requests" ? "is-active" : ""}`}
                    onClick={() => handleTabChange("requests")}
                  >
                    <RotateCcw size={16} />
                    Return Requests
                  </button>
                  <button
                    className={`sidebar-btn ${activeTab === "refunds" ? "is-active" : ""}`}
                    onClick={() => handleTabChange("refunds")}
                  >
                    <CreditCard size={16} />
                    Refund Status
                  </button>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="settings-content-area">
                <AnimatePresence mode="wait">
                  {activeTab === "privacy" && (
                    <motion.div
                      key="privacy-card"
                      className="settings-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3>Privacy & Data Configuration</h3>
                      <div className="privacy-list mb-6">
                        <div className="privacy-toggle-item">
                          <div className="toggle-details">
                            <h5>Marketing Email Notifications</h5>
                            <p>Receive weekly announcements of new handloom drops and seasonal collection invitations.</p>
                          </div>
                          <label className="switch-wrapper">
                            <input
                              type="checkbox"
                              checked={marketingEmails}
                              onChange={(e) => setMarketingEmails(e.target.checked)}
                            />
                            <span className="switch-slider"></span>
                          </label>
                        </div>

                        <div className="privacy-toggle-item">
                          <div className="toggle-details">
                            <h5>Two-Factor Authentication</h5>
                            <p>Verify logins using temporary tokens sent to your registered mobile number.</p>
                          </div>
                          <label className="switch-wrapper">
                            <input
                              type="checkbox"
                              checked={twoFactor}
                              onChange={(e) => setTwoFactor(e.target.checked)}
                            />
                            <span className="switch-slider"></span>
                          </label>
                        </div>

                        <div className="privacy-toggle-item">
                          <div className="toggle-details">
                            <h5>Personalized Advertisements</h5>
                            <p>Allow us to tailor social recommendations based on sarees you favored.</p>
                          </div>
                          <label className="switch-wrapper">
                            <input
                              type="checkbox"
                              checked={personalizedAds}
                              onChange={(e) => setPersonalizedAds(e.target.checked)}
                            />
                            <span className="switch-slider"></span>
                          </label>
                        </div>

                        <div className="privacy-toggle-item">
                          <div className="toggle-details">
                            <h5>Analytics Tracking Cookies</h5>
                            <p>Share anonymized navigation paths so our engineering team can audit load speeds.</p>
                          </div>
                          <label className="switch-wrapper">
                            <input
                              type="checkbox"
                              checked={analyticsCookies}
                              onChange={(e) => setAnalyticsCookies(e.target.checked)}
                            />
                            <span className="switch-slider"></span>
                          </label>
                        </div>
                      </div>
                      <button type="button" className="btn-profile-submit" onClick={handleSavePrivacy}>
                        Save Privacy Settings
                      </button>
                    </motion.div>
                  )}

                  {activeTab === "policies" && (
                    <motion.div
                      key="policies-card"
                      className="settings-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3>Returns & Refunds Policy</h3>
                      <div className="policy-accordion">
                        <div className="policy-block">
                          <h4>What is the return window?</h4>
                          <p>We offer a strict 7-day return policy for all unworn, unaltered handloom garments. The original atelier tags and motif security ribbons must remain fully attached.</p>
                        </div>
                        <div className="policy-block">
                          <h4>Are customized blouses eligible for return?</h4>
                          <p>Unfortunately, because custom blouses are tailored to individual body measurement profiles, they cannot be restocked or returned unless a structural stitching defect is validated by our QC managers.</p>
                        </div>
                        <div className="policy-block">
                          <h4>How long do refunds take?</h4>
                          <p>Once a return shipment is scanned into our Varanasi sorting facility, QC checks take 48 hours. Approved refunds are routed directly to the original payment instrument within 5-7 business days.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "requests" && (
                    <motion.div
                      key="requests-card"
                      className="settings-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3>Return Requests Log</h3>
                      <div className="status-timeline">
                        <div className="status-timeline-item">
                          <div className="status-indicator completed"></div>
                          <div className="status-details">
                            <h5>Order DOD-235198 Return Request</h5>
                            <p>Reason: Sizing mismatch on Chikankari Kurti. Item picked up by courier on May 22, 2026.</p>
                            <span className="status-badge completed">Returned & Refunded</span>
                          </div>
                        </div>

                        <div className="status-timeline-item">
                          <div className="status-indicator pending"></div>
                          <div className="status-details">
                            <h5>Order DOD-894751 Return Request</h5>
                            <p>Currently no active return requests exist for this order. Confirmed processing status.</p>
                            <span className="status-badge pending">No Active Request</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "refunds" && (
                    <motion.div
                      key="refunds-card"
                      className="settings-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3>Refund Status Tracker</h3>
                      <div className="status-timeline">
                        <div className="status-timeline-item">
                          <div className="status-indicator completed"></div>
                          <div className="status-details">
                            <h5>Refund AWB-98745210-REF</h5>
                            <p>Amount: ₹3,499. Routed via UPI transaction ID 2036495821 on May 24, 2026.</p>
                            <span className="status-badge completed" style={{ backgroundColor: "rgba(#10B981, 0.06)", color: "#059669" }}>Settled</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
