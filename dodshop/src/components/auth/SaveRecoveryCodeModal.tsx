"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Copy, Check, Download, ArrowRight, KeyRound } from "lucide-react";
import "./SaveRecoveryCodeModal.scss";

interface SaveRecoveryCodeModalProps {
  isOpen: boolean;
  recoveryCode: string;
  userName: string;
  userEmail: string;
  onComplete: () => void;
}

export default function SaveRecoveryCodeModal({
  isOpen,
  recoveryCode,
  userName,
  userEmail,
  onComplete,
}: SaveRecoveryCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmedSaved, setConfirmedSaved] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy
      const textArea = document.createElement("textarea");
      textArea.value = recoveryCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const fileContent = `=====================================================
DESIGNS OF DREAMS — BACKUP ACCOUNT RECOVERY CODE
=====================================================
Account Name:  ${userName}
Account Email: ${userEmail}
Issued On:     ${new Date().toLocaleString()}

YOUR BACKUP RECOVERY CODE:
>>> ${recoveryCode} <<<

CRITICAL SECURITY INSTRUCTIONS:
1. Store this recovery code in a private, secure location (such as a password manager or physical vault).
2. This code is the ONLY way to recover your account if you forget your password.
3. Designs of Dreams operates without SMS or email OTPs to protect your privacy.
4. Each recovery code is single-use and will be invalidated once redeemed.
=====================================================
`;

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dod-recovery-code-${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="recovery-modal-overlay">
        <motion.div
          className="recovery-modal-card"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header Icon */}
          <div className="recovery-modal-icon-badge">
            <KeyRound size={28} className="text-orange" />
          </div>

          <h2 className="recovery-modal-title">Save your recovery code</h2>
          <p className="recovery-modal-subtitle">
            Keep it somewhere private and secure.
          </p>

          <div className="recovery-modal-alert">
            <ShieldAlert size={18} className="alert-icon" />
            <span>
              This is the <strong>only time</strong> this backup code will be shown. You will need it to reset your password if you ever forget it.
            </span>
          </div>

          {/* Code Display Box */}
          <div className="recovery-code-box">
            <span className="recovery-code-label">BACKUP RECOVERY CODE</span>
            <div className="recovery-code-value" aria-label={`Recovery code: ${recoveryCode}`}>
              {recoveryCode}
            </div>
          </div>

          {/* Action Buttons: Copy & Download */}
          <div className="recovery-actions-row">
            <button
              type="button"
              className={`action-btn ${copied ? "action-btn--copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? "Copied!" : "Copy code"}</span>
            </button>

            <button
              type="button"
              className="action-btn"
              onClick={handleDownload}
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          </div>

          {/* Confirmation Checkbox */}
          <div className="recovery-checkbox-wrapper">
            <label className="recovery-checkbox-label">
              <input
                type="checkbox"
                checked={confirmedSaved}
                onChange={(e) => setConfirmedSaved(e.target.checked)}
              />
              <span className="checkmark" />
              <span className="label-text">
                I have saved my recovery code in a secure place.
              </span>
            </label>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            className="recovery-continue-btn"
            disabled={!confirmedSaved}
            onClick={onComplete}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
