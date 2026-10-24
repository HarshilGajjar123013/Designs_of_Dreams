"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CheckCircle,
  AlertCircle,
  Sparkles,
  Mail,
  Lock,
  User,
  Home,
  Phone,
  Eye,
  EyeOff,
  LogOut,
  ChevronRight
} from "lucide-react";
import "./Login.scss";
import SaveRecoveryCodeModal from "@/components/auth/SaveRecoveryCodeModal";

// Validation schemas using Zod
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms & Conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Collage grid default fallback images representing Designs of Dreams collection
const DEFAULT_LOGIN_IMAGES = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1610030470298-4058fbb6190c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=400&q=80"
];

const DEFAULT_SIGNUP_IMAGES = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=400&q=80"
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const redirectTo = (rawRedirect && rawRedirect !== "/login" && rawRedirect !== "/signup") ? rawRedirect : "/";
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [mounted, setMounted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [dynamicLoginImages, setDynamicLoginImages] = useState<string[]>(DEFAULT_LOGIN_IMAGES);
  const [dynamicSignupImages, setDynamicSignupImages] = useState<string[]>(DEFAULT_SIGNUP_IMAGES);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Section state
  const [activeProfileSection, setActiveProfileSection] = useState<string | null>(null);

  // Recovery Code Modal state shown right after signup
  const [recoveryModalData, setRecoveryModalData] = useState<{
    isOpen: boolean;
    code: string;
    name: string;
    email: string;
  }>({
    isOpen: false,
    code: "",
    name: "",
    email: "",
  });

  const user = useStore((state) => state.user);
  const loginAction = useStore((state) => state.login);
  const signupAction = useStore((state) => state.signup);
  const logoutAction = useStore((state) => state.logout);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "signup" || tabParam === "login") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Fetch dynamic auth images from API
  useEffect(() => {
    const fetchAuthImages = async () => {
      try {
        const [loginRes, signupRes] = await Promise.all([
          fetch("/api/auth-images?page=login"),
          fetch("/api/auth-images?page=signup"),
        ]);
        const loginData = await loginRes.json();
        const signupData = await signupRes.json();

        if (loginData.success && Array.isArray(loginData.images) && loginData.images.length > 0) {
          setDynamicLoginImages(loginData.images);
        }
        if (signupData.success && Array.isArray(signupData.images) && signupData.images.length > 0) {
          setDynamicSignupImages(signupData.images);
        }
      } catch (err) {
        console.warn("Could not fetch dynamic auth images, using defaults:", err);
      }
    };
    fetchAuthImages();
  }, []);

  useEffect(() => {
    if (mounted && user?.isLoggedIn && !recoveryModalData.isOpen && !recoveryModalData.code) {
      router.push(redirectTo);
    }
  }, [mounted, user, router, redirectTo, recoveryModalData.isOpen, recoveryModalData.code]);

  // React Hook Form for Login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  // React Hook Form for Signup
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignupForm,
    watch: watchSignup
  } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const signupPassword = watchSignup ? watchSignup("password") || "" : "";

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

  const pwdStrength = getPasswordStrength(signupPassword);

  const getStrengthClass = (score: number) => {
    if (score === 1) return "weak";
    if (score === 2 || score === 3) return "medium";
    if (score === 4) return "strong";
    return "";
  };

  const onLogin = async (data: any) => {
    if (isSubmitting) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password })
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setErrorMsg(resData.error || "Login failed");
        return;
      }
      const { id, email, name, avatar, phone } = resData.user;
      loginAction(id, email, name, avatar, phone);
      setSuccessMsg(`Welcome back, ${name}!`);
      resetLoginForm();
      router.push(redirectTo);
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred during login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignup = async (data: any) => {
    if (isSubmitting) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          mobileNumber: data.mobileNumber,
          password: data.password
        })
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setErrorMsg(resData.error || "Signup failed");
        return;
      }
      const { id, email, name, avatar, phone } = resData.user;
      signupAction(id, email, name, avatar, phone);
      resetSignupForm();

      if (resData.recoveryCode) {
        setRecoveryModalData({
          isOpen: true,
          code: resData.recoveryCode,
          name: name,
          email: email,
        });
      } else {
        setSuccessMsg(`Welcome to Designs of Dreams, ${name}!`);
        router.push(redirectTo);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logoutAction();
    setSuccessMsg("Logged out successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (!mounted) return null;

  return (
    <main className="auth-page-wrapper">
      {/* LEFT COLUMN: Form panel */}
      <div className="auth-left-panel">

        {/* Mobile Top Header Decoration */}
        <div className="auth-mobile-header">
          <div className="auth-mobile-header__content">
            <img src="/logo.png" alt="Designs of Dreams" className="mobile-header-logo" />
            <span className="mobile-header-text">DESIGNS OF DREAMS</span>
          </div>
          <div className="mobile-header-wave-wrapper">
            <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 32L60 42.7C120 53 240 75 360 80C480 85 600 75 720 64C840 53 960 43 1080 42.7C1200 43 1320 53 1380 58.7L1440 64V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V32Z"
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>

        <div className="auth-form-container">

          {/* Logo & Brand Header */}
          <div className="auth-brand">
            <Link href="/" className="auth-brand-link">
              <img src="/logo.png" alt="Designs of Dreams" className="auth-brand-logo" />
              <span className="auth-brand-text">DESIGNS OF DREAMS</span>
            </Link>
          </div>

          <div className="auth-form-card">
            <AnimatePresence mode="wait">
              {user?.isLoggedIn ? (
                // LOGGED IN VIEW
                <motion.div
                  key="logged-in"
                  className="profile-panel text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="profile-details text-center">
                    <span className="profile-tag">
                      <Sparkles size={12} />
                      Atelier Account
                    </span>
                    <h3>Atelier Profile</h3>
                    <div className="profile-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                    <div className="profile-status">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span>Verified Atelier Member</span>
                    </div>
                  </div>

                  <div className="profile-menu-direct-links" style={{ width: "100%", margin: "20px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Link href="/profile" className="btn-direct-link">
                      <span>Profile</span>
                      <ChevronRight size={16} />
                    </Link>
                    <Link href="/order" className="btn-direct-link">
                      <span>Order</span>
                      <ChevronRight size={16} />
                    </Link>
                    <Link href="/settings" className="btn-direct-link">
                      <span>Settings</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>

                  <div className="profile-actions">
                    <Link href="/" className="btn-action btn-action--primary">
                      <Home size={16} />
                      Go to Homepage
                    </Link>
                    <button className="btn-action btn-action--secondary" onClick={handleLogout}>
                      <LogOut size={16} />
                      Logout Session
                    </button>
                  </div>
                </motion.div>
              ) : (
                // AUTHENTICATION FORMS (LOGIN / SIGNUP)
                <motion.div
                  key="auth-forms"
                  className="auth-flow-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Heading & Subtitle toggle */}
                  <div className="auth-header">
                    <h2>{activeTab === "login" ? "Welcome Back!" : "Good Morning!"}</h2>
                    <p className="auth-subtitle">
                      {activeTab === "login" ? (
                        <>
                          Don't have an account?{" "}
                          <button type="button" onClick={() => { setActiveTab("signup"); setErrorMsg(""); }} className="toggle-tab-link">
                            Sign Up
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{" "}
                          <button type="button" onClick={() => { setActiveTab("login"); setErrorMsg(""); }} className="toggle-tab-link">
                            Sign In
                          </button>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Status Alerts */}
                  {successMsg && (
                    <div className="auth-notification success">
                      <CheckCircle size={16} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="auth-notification error">
                      <AlertCircle size={16} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {activeTab === "login" ? (
                      // LOGIN FORM
                      <motion.form
                        key="login-form"
                        onSubmit={handleLoginSubmit(onLogin)}
                        className="auth-inputs-form"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="input-group">
                          <label>Email</label>
                          <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                              type="email"
                              placeholder="Type your email address"
                              className={loginErrors.email ? "is-invalid" : ""}
                              {...registerLogin("email")}
                            />
                          </div>
                          {loginErrors.email && <span className="error-text">{(loginErrors.email.message as string)}</span>}
                        </div>

                        <div className="input-group">
                          <label>Password</label>
                          <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Type your password"
                              className={loginErrors.password ? "is-invalid" : ""}
                              {...registerLogin("password")}
                            />
                            <button
                              type="button"
                              className="visibility-toggle"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {loginErrors.password && <span className="error-text">{(loginErrors.password.message as string)}</span>}
                        </div>

                        <div className="helper-row">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              {...registerLogin("rememberMe")}
                            />
                            <span>Remember Me</span>
                          </label>
                          <Link
                            href="/forgot-password"
                            className="forgot-link"
                          >
                            Forgot Password?
                          </Link>
                        </div>

                        <button type="submit" className="submit-auth-btn" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                              <span className="auth-spinner" />
                              Signing In...
                            </span>
                          ) : (
                            "Sign In"
                          )}
                        </button>
                      </motion.form>
                    ) : (
                      // SIGNUP FORM
                      <motion.form
                        key="signup-form"
                        onSubmit={handleSignupSubmit(onSignup)}
                        className="auth-inputs-form"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="name-row">
                          <div className="input-group">
                            <label>First Name</label>
                            <div className="input-wrapper">
                              <User className="input-icon" size={18} />
                              <input
                                type="text"
                                placeholder="First Name"
                                className={signupErrors.firstName ? "is-invalid" : ""}
                                {...registerSignup("firstName")}
                              />
                            </div>
                            {signupErrors.firstName && <span className="error-text">{(signupErrors.firstName.message as string)}</span>}
                          </div>

                          <div className="input-group">
                            <label>Last Name</label>
                            <div className="input-wrapper">
                              <User className="input-icon" size={18} />
                              <input
                                type="text"
                                placeholder="Last Name"
                                className={signupErrors.lastName ? "is-invalid" : ""}
                                {...registerSignup("lastName")}
                              />
                            </div>
                            {signupErrors.lastName && <span className="error-text">{(signupErrors.lastName.message as string)}</span>}
                          </div>
                        </div>

                        <div className="input-group">
                          <label>Email</label>
                          <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                              type="email"
                              placeholder="Type your email address"
                              className={signupErrors.email ? "is-invalid" : ""}
                              {...registerSignup("email")}
                            />
                          </div>
                          {signupErrors.email && <span className="error-text">{(signupErrors.email.message as string)}</span>}
                        </div>

                        <div className="input-group">
                          <label>Mobile Number</label>
                          <div className="input-wrapper">
                            <Phone className="input-icon" size={18} />
                            <input
                              type="tel"
                              placeholder="Type your mobile number"
                              className={signupErrors.mobileNumber ? "is-invalid" : ""}
                              {...registerSignup("mobileNumber")}
                            />
                          </div>
                          {signupErrors.mobileNumber && <span className="error-text">{(signupErrors.mobileNumber.message as string)}</span>}
                        </div>

                        <div className="input-group">
                          <label>Password</label>
                          <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Type your password"
                              className={signupErrors.password ? "is-invalid" : ""}
                              {...registerSignup("password")}
                            />
                            <button
                              type="button"
                              className="visibility-toggle"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>

                          {/* Segmented strength indicator */}
                          <div className="password-strength-indicator">
                            {[1, 2, 3, 4].map((seg) => (
                              <span
                                key={seg}
                                className={`strength-segment ${pwdStrength >= seg ? getStrengthClass(pwdStrength) : ""}`}
                              />
                            ))}
                          </div>

                          {signupErrors.password && <span className="error-text">{(signupErrors.password.message as string)}</span>}
                        </div>

                        <div className="input-group">
                          <label>Confirm Password</label>
                          <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className={signupErrors.confirmPassword ? "is-invalid" : ""}
                              {...registerSignup("confirmPassword")}
                            />
                            <button
                              type="button"
                              className="visibility-toggle"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {signupErrors.confirmPassword && <span className="error-text">{(signupErrors.confirmPassword.message as string)}</span>}
                        </div>

                        <div className="helper-row">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              {...registerSignup("agreeTerms")}
                            />
                            <span>I agree to <Link href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>Terms & Conditions</Link></span>
                          </label>
                        </div>
                        {signupErrors.agreeTerms && <span className="error-text" style={{ marginTop: '-8px' }}>{(signupErrors.agreeTerms.message as string)}</span>}

                        <button type="submit" className="submit-auth-btn" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                              <span className="auth-spinner" />
                              Creating Account...
                            </span>
                          ) : (
                            "Create Account"
                          )}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="auth-footer-terms">
                    <span>By clicking Sign Up, you agree to accept Designs of Dreams's <Link href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>Terms of Service</Link></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Bottom Wave Decoration */}
        <div className="auth-mobile-bottom-wave">
          <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 64L48 69.3C96 75 192 85 288 80C384 75 480 53 576 48C672 43 768 53 864 64C960 75 1056 85 1152 80C1248 75 1344 53 1392 42.7L1440 32V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V64Z"
              fill="#FF6A00"
            />
          </svg>
        </div>

      </div>

      {/* RIGHT COLUMN: 3x4 Grid Collage */}
      <div className="auth-right-panel">
        <div className="auth-collage-grid">
          {(activeTab === 'login' ? dynamicLoginImages : dynamicSignupImages).map((img, idx) => (
            <div key={`${activeTab}-${idx}`} className="collage-grid-item">
              <img
                src={img}
                alt={`Designs of Dreams Heritage Collage ${idx + 1}`}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    activeTab === 'login'
                      ? DEFAULT_LOGIN_IMAGES[idx % DEFAULT_LOGIN_IMAGES.length]
                      : DEFAULT_SIGNUP_IMAGES[idx % DEFAULT_SIGNUP_IMAGES.length];
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Backup Recovery Code Modal after successful registration */}
      <SaveRecoveryCodeModal
        isOpen={recoveryModalData.isOpen}
        recoveryCode={recoveryModalData.code}
        userName={recoveryModalData.name}
        userEmail={recoveryModalData.email}
        onComplete={() => {
          setRecoveryModalData({ isOpen: false, code: "", name: "", email: "" });
          setSuccessMsg(`Welcome to Designs of Dreams!`);
          router.push(redirectTo);
        }}
      />

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="recovery-modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="recovery-modal-card" style={{ maxWidth: "560px", textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
            <h2 className="recovery-modal-title" style={{ marginBottom: "12px", textAlign: "left" }}>Atelier Terms & Privacy</h2>
            <div style={{ maxHeight: "300px", overflowY: "auto", fontSize: "0.85rem", color: "#4A4A4A", lineHeight: "1.6", marginBottom: "20px" }}>
              <p style={{ marginBottom: "10px" }}><strong>1. Account Security:</strong> Designs of Dreams maintains cryptographic security for your account. You are provided a single-use backup recovery code upon registration to ensure zero unauthorized takeovers.</p>
              <p style={{ marginBottom: "10px" }}><strong>2. Privacy Guarantee:</strong> Your confidential contact information and order history are securely safeguarded and never shared with third-party advertisers.</p>
              <p style={{ marginBottom: "10px" }}><strong>3. Artisanal Authenticity:</strong> Each garment from Designs of Dreams is handcrafted using heritage weaving methods and tested materials.</p>
            </div>
            <button
              type="button"
              className="recovery-continue-btn"
              onClick={() => setShowTermsModal(false)}
            >
              <span>I Understand & Agree</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-white">Loading...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
