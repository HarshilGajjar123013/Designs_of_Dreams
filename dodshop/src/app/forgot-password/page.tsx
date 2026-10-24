"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Copy,
  Check,
  Download,
  ShieldAlert,
} from "lucide-react";
import "./ForgotPassword.scss";

type Step = 1 | 2 | 3 | 4;

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1 state
  const [identifier, setIdentifier] = useState("");
  const [challengeToken, setChallengeToken] = useState("");

  // Step 2 state
  const [recoveryCode, setRecoveryCode] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Step 3 state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 4 state
  const [newRecoveryCode, setNewRecoveryCode] = useState("");
  const [copiedNewCode, setCopiedNewCode] = useState(false);
  const [confirmedNewSaved, setConfirmedNewSaved] = useState(false);

  // Auto-format recovery code into XXXX-XXXX-XXXX-XXXX
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 16);
    const parts: string[] = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    setRecoveryCode(parts.join("-"));
  };

  // Password strength logic
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const pwdStrength = getPasswordStrength(newPassword);

  const getStrengthClass = (score: number) => {
    if (score === 1) return "weak";
    if (score === 2 || score === 3) return "medium";
    if (score === 4) return "strong";
    return "";
  };

  // ── Step 1 Handler: Identify Account ──────────────────────────────────────────
  const handleIdentifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!identifier.trim()) {
      setErrorMsg("Please enter your username, email, or registered mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/recovery/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Unable to proceed. Please try again.");
        return;
      }

      setChallengeToken(data.challengeToken);
      setStep(2);
    } catch {
      setErrorMsg("A network error occurred. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 Handler: Verify Recovery Code ──────────────────────────────────────
  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const normalized = recoveryCode.replace(/[-\s]/g, "").trim();
    if (normalized.length < 12) {
      setErrorMsg("Please enter a valid backup recovery code (format: XXXX-XXXX-XXXX-XXXX)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/recovery/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeToken,
          recoveryCode: recoveryCode.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Invalid backup recovery code. Please check and try again.");
        return;
      }

      setResetToken(data.resetToken);
      setStep(3);
    } catch {
      setErrorMsg("A network error occurred. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 Handler: Create New Password ────────────────────────────────────────
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters in length");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/recovery/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to reset password. Please try again.");
        return;
      }

      setNewRecoveryCode(data.newRecoveryCode || "");
      setStep(4);
    } catch {
      setErrorMsg("A network error occurred while resetting password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Copy new code helper
  const handleCopyNewCode = async () => {
    if (!newRecoveryCode) return;
    try {
      await navigator.clipboard.writeText(newRecoveryCode);
      setCopiedNewCode(true);
      setTimeout(() => setCopiedNewCode(false), 2500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = newRecoveryCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedNewCode(true);
      setTimeout(() => setCopiedNewCode(false), 2500);
    }
  };

  // Download new code helper
  const handleDownloadNewCode = () => {
    if (!newRecoveryCode) return;
    const fileContent = `=====================================================
DESIGNS OF DREAMS — NEW BACKUP RECOVERY CODE
=====================================================
Identifier:    ${identifier}
Reset Date:    ${new Date().toLocaleString()}

YOUR NEW BACKUP RECOVERY CODE:
>>> ${newRecoveryCode} <<<

CRITICAL INSTRUCTIONS:
- Your previous recovery code has been permanently invalidated.
- Save this new code in a secure location (e.g. password manager).
- Use this code if you ever need to reset your password again.
=====================================================
`;
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dod-new-recovery-code-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="forgot-pwd-page-wrapper">
      {/* Background jali pattern */}
      <div
        className="forgot-pwd-pattern"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='38' fill='none' stroke='%23000000' stroke-width='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="forgot-pwd-container">
        {/* Step Progression Indicators */}
        <div className="recovery-stepper">
          {[
            { num: 1, label: "Identify" },
            { num: 2, label: "Recovery Code" },
            { num: 3, label: "New Password" },
            { num: 4, label: "Complete" },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div
                className={`stepper-node ${step === s.num ? "active" : step > s.num ? "completed" : ""}`}
              >
                <div className="node-circle">
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span className="node-label">{s.label}</span>
              </div>
              {idx < 3 && (
                <div className={`stepper-line ${step > s.num ? "completed" : ""}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card Box */}
        <div className="forgot-pwd-card">
          <AnimatePresence mode="wait">
            {/* ══════════════════════════════════════════════════════════════════
                SCREEN 1 — IDENTIFY ACCOUNT (STEP 1)
            ══════════════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className="step-content"
              >
                <div className="card-badge">
                  <User size={24} className="badge-icon" />
                </div>
                <span className="step-tag">Step 1</span>
                <h1 className="step-title">Identify Account</h1>
                <p className="step-description">
                  Enter the username or registered mobile number associated with your account.
                </p>

                {errorMsg && (
                  <div className="error-alert">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleIdentifySubmit} className="recovery-form">
                  <div className="input-group">
                    <label htmlFor="identifier-input">Username or mobile number</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <input
                        id="identifier-input"
                        type="text"
                        placeholder="e.g. yourname@example.com or mobile"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="submit-recovery-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-text">Checking...</span>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="back-link-row">
                    <Link href="/login" className="back-link">
                      <ArrowLeft size={16} />
                      <span>Back to Sign In</span>
                    </Link>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCREEN 2 — ENTER RECOVERY CODE (STEP 2)
            ══════════════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className="step-content"
              >
                <div className="card-badge">
                  <KeyRound size={24} className="badge-icon" />
                </div>
                <span className="step-tag">Step 2</span>
                <h2 className="step-title">Enter Recovery Code</h2>
                <p className="step-description">
                  Enter the backup code you saved when creating your account.
                </p>

                {errorMsg && (
                  <div className="error-alert">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyCodeSubmit} className="recovery-form">
                  <div className="input-group">
                    <label htmlFor="recovery-code-input">Backup recovery code</label>
                    <div className="input-wrapper input-wrapper--code">
                      <input
                        id="recovery-code-input"
                        type="text"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        value={recoveryCode}
                        onChange={handleCodeChange}
                        className="code-input"
                        maxLength={19}
                        autoFocus
                        required
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  <div className="security-notice">
                    <ShieldAlert size={16} className="notice-icon" />
                    <span>
                      Never display the original code, even partially. Do not reveal whether a particular account or code exists.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="submit-recovery-btn"
                    disabled={loading || recoveryCode.replace(/[^a-zA-Z0-9]/g, "").length < 12}
                  >
                    {loading ? (
                      <span className="spinner-text">Verifying Code...</span>
                    ) : (
                      <>
                        <span>Verify Recovery Code</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="back-link-row">
                    <button
                      type="button"
                      className="back-btn"
                      onClick={() => {
                        setErrorMsg("");
                        setStep(1);
                      }}
                    >
                      <ArrowLeft size={16} />
                      <span>Use a different account</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCREEN 3 — CREATE NEW PASSWORD (STEP 3)
            ══════════════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className="step-content"
              >
                <div className="card-badge">
                  <ShieldCheck size={24} className="badge-icon" />
                </div>
                <span className="step-tag">Step 3</span>
                <h2 className="step-title">Create New Password</h2>
                <p className="step-description">
                  Your recovery code has been verified. Create a new password.
                </p>

                {errorMsg && (
                  <div className="error-alert">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="recovery-form">
                  <div className="input-group">
                    <label htmlFor="new-password">New password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        className="visibility-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="password-strength-indicator">
                        <div className={`strength-segment ${pwdStrength >= 1 ? getStrengthClass(pwdStrength) : ""}`} />
                        <div className={`strength-segment ${pwdStrength >= 2 ? getStrengthClass(pwdStrength) : ""}`} />
                        <div className={`strength-segment ${pwdStrength >= 3 ? getStrengthClass(pwdStrength) : ""}`} />
                        <div className={`strength-segment ${pwdStrength >= 4 ? getStrengthClass(pwdStrength) : ""}`} />
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label htmlFor="confirm-password">Confirm new password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="visibility-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="advice-box">
                    <span>Use a long, unique password that you have not used elsewhere.</span>
                  </div>

                  <button
                    type="submit"
                    className="submit-recovery-btn"
                    disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                  >
                    {loading ? (
                      <span className="spinner-text">Updating Password...</span>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCREEN 4 — PASSWORD UPDATED (STEP 4)
            ══════════════════════════════════════════════════════════════════ */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="step-content"
              >
                <div className="card-badge card-badge--success">
                  <CheckCircle2 size={32} className="badge-icon badge-icon--success" />
                </div>
                <h2 className="step-title">Password Updated</h2>
                <p className="step-description">
                  Your password has been changed successfully.
                </p>
                <p className="session-notice">
                  All existing sessions have been invalidated. Sign in with your new password.
                </p>

                {/* Newly issued recovery code */}
                {newRecoveryCode && (
                  <div className="new-code-container">
                    <span className="code-box-header">YOUR NEW BACKUP RECOVERY CODE</span>
                    <div className="code-box-display">{newRecoveryCode}</div>
                    <p className="code-box-note">
                      Your old recovery code has been consumed and deactivated. Please save your new code below.
                    </p>

                    <div className="code-actions-row">
                      <button
                        type="button"
                        className={`action-btn ${copiedNewCode ? "action-btn--copied" : ""}`}
                        onClick={handleCopyNewCode}
                      >
                        {copiedNewCode ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copiedNewCode ? "Copied!" : "Copy code"}</span>
                      </button>

                      <button
                        type="button"
                        className="action-btn"
                        onClick={handleDownloadNewCode}
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </button>
                    </div>

                    <div className="confirm-checkbox">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={confirmedNewSaved}
                          onChange={(e) => setConfirmedNewSaved(e.target.checked)}
                        />
                        <span>I have saved my new recovery code in a secure place.</span>
                      </label>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="submit-recovery-btn"
                  disabled={newRecoveryCode ? !confirmedNewSaved : false}
                  onClick={() => router.push("/login")}
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
