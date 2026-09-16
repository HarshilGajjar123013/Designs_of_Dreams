"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { FaGoogle, FaApple } from "react-icons/fa";
import "./Login.scss";

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

// Collage grid images representing Designs of Dreams collection
const collageImages = [
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

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [mounted, setMounted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Section state
  const [activeProfileSection, setActiveProfileSection] = useState<string | null>(null);

  const user = useStore((state) => state.user);
  const loginAction = useStore((state) => state.login);
  const signupAction = useStore((state) => state.signup);
  const logoutAction = useStore((state) => state.logout);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user?.isLoggedIn) {
      router.push("/");
    }
  }, [mounted, user, router]);

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
    setErrorMsg("");
    setSuccessMsg("");

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
      router.push("/");
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred during login. Please try again.");
    }
  };

  const onSignup = async (data: any) => {
    setErrorMsg("");
    setSuccessMsg("");

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
      setSuccessMsg(`Welcome to Designs of Dreams, ${name}!`);
      resetSignupForm();
      router.push("/");
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred during registration. Please try again.");
    }
  };

  const handleSocialLogin = (provider: string) => {
    setErrorMsg("");
    setSuccessMsg("");
    setTimeout(() => {
      const email = `user@${provider.toLowerCase()}.com`;
      const name = `${provider} Guest`;
      const mockId = `social-${provider.toLowerCase()}-${Date.now()}`;
      loginAction(mockId, email, name);
      setSuccessMsg(`Welcome back, connected with ${provider}!`);
      router.push("/");
    }, 800);
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
                          <a
                            href="#"
                            className="forgot-link"
                            onClick={(e) => { e.preventDefault(); alert("Password reset instructions have been sent to your email!"); }}
                          >
                            Forgot Password?
                          </a>
                        </div>

                        <button type="submit" className="submit-auth-btn">
                          Sign In
                        </button>

                        <div className="divider-row">
                          <span>Or continue with</span>
                        </div>

                        <div className="social-login-group">
                          <button type="button" className="social-btn" onClick={() => handleSocialLogin("Google")} aria-label="Continue with Google">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" style={{ flexShrink: 0 }}>
                              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                              <path fill="#4285F4" d="M46.5 24c0-1.63-.15-3.2-.43-4.75H24v9h12.75c-.55 2.92-2.2 5.4-4.69 7.07l7.29 5.65C43.64 36.63 46.5 30.93 46.5 24z" />
                              <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z" />
                              <path fill="#34A853" d="M24 38.5c-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48c6.48 0 11.93-2.13 15.89-5.81l-7.29-5.65c-2.29 1.57-5.23 2.46-8.6 2.46z" />
                            </svg>
                            <span>Continue with Google</span>
                          </button>
                          <button type="button" className="social-btn" onClick={() => handleSocialLogin("Apple")} aria-label="Continue with Apple">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="18" height="18" fill="currentColor" style={{ flexShrink: 0 }}>
                              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.37-6.15-2.82-2.32-6.57-6.8-11.25-13.43-5.07-7.25-9.41-15.62-13.01-25.13-3.6-9.51-5.42-18.78-5.42-27.82 0-13.16 3.13-24.25 9.38-33.26 6.25-9.01 14.4-13.56 24.46-13.68 4.7 0 9.77 1.25 15.22 3.76 5.45 2.5 8.94 3.76 10.47 3.76 1.28 0 4.67-1.18 10.19-3.53 5.51-2.35 10.15-3.46 13.93-3.35 10.93.23 19.59 4.19 25.96 11.89-9.07 5.51-13.52 13.25-13.35 23.23.17 7.9 3.03 14.54 8.59 19.94 5.56 5.39 12.22 8.36 20 8.91-1.94 5.57-4.5 11.24-7.66 17.02zM119.5 28.56c0-6.73 2.37-12.92 7.12-18.57 5.67-6.86 12.8-10.4 21.41-10.63.12 7.21-2.27 13.65-7.18 19.34-4.8 5.61-11.75 9.5-20.85 9.86-.34-2.12-.5-4.47-.5-7z" />
                            </svg>
                            <span>Continue with Apple</span>
                          </button>
                        </div>
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
                            <span>I agree to <Link href="#" onClick={(e) => { e.preventDefault(); alert("Terms & Conditions Modal"); }}>Terms & Conditions</Link></span>
                          </label>
                        </div>
                        {signupErrors.agreeTerms && <span className="error-text" style={{ marginTop: '-8px' }}>{(signupErrors.agreeTerms.message as string)}</span>}

                        <button type="submit" className="submit-auth-btn">
                          Create Account
                        </button>

                        <div className="divider-row">
                          <span>Or continue with</span>
                        </div>

                        <div className="social-login-group">
                          <button type="button" className="social-btn" onClick={() => handleSocialLogin("Google")} aria-label="Continue with Google">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" style={{ flexShrink: 0 }}>
                              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                              <path fill="#4285F4" d="M46.5 24c0-1.63-.15-3.2-.43-4.75H24v9h12.75c-.55 2.92-2.2 5.4-4.69 7.07l7.29 5.65C43.64 36.63 46.5 30.93 46.5 24z" />
                              <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z" />
                              <path fill="#34A853" d="M24 38.5c-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48c6.48 0 11.93-2.13 15.89-5.81l-7.29-5.65c-2.29 1.57-5.23 2.46-8.6 2.46z" />
                            </svg>
                            <span>Continue with Google</span>
                          </button>
                          <button type="button" className="social-btn" onClick={() => handleSocialLogin("Apple")} aria-label="Continue with Apple">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="18" height="18" fill="currentColor" style={{ flexShrink: 0 }}>
                              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.37-6.15-2.82-2.32-6.57-6.8-11.25-13.43-5.07-7.25-9.41-15.62-13.01-25.13-3.6-9.51-5.42-18.78-5.42-27.82 0-13.16 3.13-24.25 9.38-33.26 6.25-9.01 14.4-13.56 24.46-13.68 4.7 0 9.77 1.25 15.22 3.76 5.45 2.5 8.94 3.76 10.47 3.76 1.28 0 4.67-1.18 10.19-3.53 5.51-2.35 10.15-3.46 13.93-3.35 10.93.23 19.59 4.19 25.96 11.89-9.07 5.51-13.52 13.25-13.35 23.23.17 7.9 3.03 14.54 8.59 19.94 5.56 5.39 12.22 8.36 20 8.91-1.94 5.57-4.5 11.24-7.66 17.02zM119.5 28.56c0-6.73 2.37-12.92 7.12-18.57 5.67-6.86 12.8-10.4 21.41-10.63.12 7.21-2.27 13.65-7.18 19.34-4.8 5.61-11.75 9.5-20.85 9.86-.34-2.12-.5-4.47-.5-7z" />
                            </svg>
                            <span>Continue with Apple</span>
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="auth-footer-terms">
                    <span>By clicking Sign Up, you agree to accept Designs of Dreams's <Link href="#" onClick={(e) => e.preventDefault()}>Terms of Service</Link></span>
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
          {collageImages.map((img, idx) => (
            <div key={idx} className="collage-grid-item">
              <img src={img} alt={`Designs of Dreams Heritage Collage ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
