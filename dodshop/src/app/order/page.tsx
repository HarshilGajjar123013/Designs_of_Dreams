"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, 
  MapPin, 
  Trash2, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  LogIn,
  Truck,
  ArrowLeft,
  Eye
} from "lucide-react";
import InvoiceGenerator from "@/components/common/InvoiceGenerator/InvoiceGenerator";
import "./Order.scss";

type TabType = "list" | "details" | "track" | "cancel" | "returns";

export default function OrderPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [orderFilter, setOrderFilter] = useState<"all" | "present" | "previous">("all");
  
  // Form input states
  const [cancelReason, setCancelReason] = useState("");
  const [returnOrderId, setReturnOrderId] = useState("");
  const [returnReason, setReturnReason] = useState("");

  const isPresentOrder = (status: string) => {
    const s = (status || "").toLowerCase();
    return s === "pending" || s === "processing" || s === "dispatched" || s === "shipped" || s === "out_for_delivery" || s === "woven" || s === "unpaid" || s === "packed";
  };

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

  useEffect(() => {
    if (mounted && user?.isLoggedIn && user?.id) {
      const fetchOrders = async () => {
        try {
          setIsLoading(true);
          const res = await fetch(`/api/orders?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setOrders(data.orders || []);
              if (data.orders && data.orders.length > 0) {
                setSelectedOrderId(data.orders[0].id);
                setReturnOrderId(data.orders[0].id);
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch orders:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    } else if (mounted) {
      setIsLoading(false);
    }
  }, [mounted, user]);

  // Handle URL Hash change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#details") setActiveTab("details");
      else if (hash === "#track") setActiveTab("track");
      else if (hash === "#cancel") setActiveTab("cancel");
      else if (hash === "#returns") setActiveTab("returns");
      else setActiveTab("list");
    }
  }, [mounted]);

  if (!mounted || isLoading) {
    return (
      <main className="relative pt-[120px] pb-[100px] bg-white min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0] || null;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab === "list" ? "" : tab;
    }
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`Cancellation request for ${selectedOrderId} has been submitted!`);
    setCancelReason("");
    setTimeout(() => {
      setSuccessMsg("");
      handleTabChange("list");
    }, 2000);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`Return/Refund request for ${returnOrderId} has been submitted successfully.`);
    setReturnReason("");
    setTimeout(() => {
      setSuccessMsg("");
      handleTabChange("list");
    }, 2000);
  };

  return (
    <main className="relative pt-[120px] pb-[100px] bg-white min-h-screen">
      {/* Decorative background jali */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='38' fill='none' stroke='%23000000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} 
      />

      <div className="order-page-container">
        {!user?.isLoggedIn ? (
          // ACCESS WARNING
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-6">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
            <p className="text-zinc-500 max-w-sm mb-8">You must be signed in to view your orders and purchase history.</p>
            <Link href="/login" className="btn-profile-submit flex items-center gap-2">
              <LogIn size={16} />
              Sign In to Account
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="order-header">
              <h2>My Atelier Orders</h2>
              <p>View your purchase history, track active orders, or manage returns and cancellations.</p>
            </div>

            {/* Notification alert */}
            <AnimatePresence>
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 font-semibold text-sm shadow-sm"
                >
                  <CheckCircle2 size={18} />
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Layout Grid */}
            <div className="order-layout">
              {/* Sidebar Navigation */}
              <aside className="order-sidebar">
                <div className="sidebar-nav-links">
                  <button 
                    className={`sidebar-btn ${activeTab === "list" ? "is-active" : ""}`}
                    onClick={() => handleTabChange("list")}
                  >
                    <Package size={16} />
                    My Orders List
                  </button>
                  <button 
                    className={`sidebar-btn ${activeTab === "details" ? "is-active" : ""}`}
                    onClick={() => handleTabChange("details")}
                  >
                    <Clock size={16} />
                    Order Details
                  </button>
                  <button 
                    className={`sidebar-btn ${activeTab === "track" ? "is-active" : ""}`}
                    onClick={() => handleTabChange("track")}
                  >
                    <Truck size={16} />
                    Track Order
                  </button>
                  <button 
                    className={`sidebar-btn ${activeTab === "cancel" ? "is-active" : ""}`}
                    onClick={() => handleTabChange("cancel")}
                  >
                    <Trash2 size={16} />
                    Cancel Order
                  </button>
                  <button 
                    className={`sidebar-btn ${activeTab === "returns" ? "is-active" : ""}`}
                    onClick={() => handleTabChange("returns")}
                  >
                    <RotateCcw size={16} />
                    Return Requests
                  </button>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="order-content-area">
                <AnimatePresence mode="wait">
                  {activeTab === "list" && (
                    <motion.div 
                      key="list-card"
                      className="order-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-dashed border-zinc-200 pb-4">
                        <div>
                          <h3 style={{ border: "none", padding: 0, margin: 0 }}>My Atelier Orders</h3>
                          <p style={{ fontSize: "0.8rem", color: "rgba(0,0,0,0.5)", margin: "4px 0 0 0" }}>
                            Track active shipments and view your complete past purchase history.
                          </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-full text-xs font-semibold">
                          <button
                            onClick={() => setOrderFilter("all")}
                            className={`px-3 py-1.5 rounded-full transition-all ${orderFilter === "all" ? "bg-[#FF6A00] text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
                          >
                            All ({orders.length})
                          </button>
                          <button
                            onClick={() => setOrderFilter("present")}
                            className={`px-3 py-1.5 rounded-full transition-all ${orderFilter === "present" ? "bg-[#FF6A00] text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
                          >
                            Present ({orders.filter(o => isPresentOrder(o.status)).length})
                          </button>
                          <button
                            onClick={() => setOrderFilter("previous")}
                            className={`px-3 py-1.5 rounded-full transition-all ${orderFilter === "previous" ? "bg-[#FF6A00] text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
                          >
                            Previous ({orders.filter(o => !isPresentOrder(o.status)).length})
                          </button>
                        </div>
                      </div>

                      <div className="orders-list space-y-8">
                        {orders.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Package className="text-[#C5A059] opacity-40 mb-4" size={48} />
                            <h4 className="text-lg font-bold text-zinc-900 mb-1">No Orders Found</h4>
                            <p className="text-zinc-500 text-sm max-w-xs mb-6">You have not placed any orders with this account yet.</p>
                            <Link href="/collection" className="btn-profile-submit" style={{ padding: "10px 20px" }}>
                              Browse Collection
                            </Link>
                          </div>
                        ) : (
                          <>
                            {/* PRESENT / ACTIVE ORDERS SECTION */}
                            {(orderFilter === "all" || orderFilter === "present") && orders.filter(o => isPresentOrder(o.status)).length > 0 && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
                                  <Truck size={16} />
                                  <span>Present & Active Orders ({orders.filter(o => isPresentOrder(o.status)).length})</span>
                                </div>

                                {orders.filter(o => isPresentOrder(o.status)).map((ord) => (
                                  <div key={ord.id} className="order-item-block border-l-4 border-l-[#FF6A00]">
                                    <div className="item-header">
                                      <div>
                                        <span className="order-id">{ord.id}</span>
                                        <div className="order-date">Placed: {ord.date}</div>
                                      </div>
                                      <span className={`status-badge ${ord.status}`}>
                                        ⏳ {ord.status.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="item-products">
                                      {ord.items.map((item: any, idx: number) => (
                                        <div key={idx} className="product-row">
                                          <div className="product-img-wrapper">
                                            <img src={item.image} alt={item.title} />
                                          </div>
                                          <div className="product-details">
                                            <h5>{item.title}</h5>
                                            <span>Size: {item.size} | Qty: {item.quantity}</span>
                                          </div>
                                          <div className="product-price">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="item-footer">
                                      <span className="total-label">Grand Total</span>
                                      <span className="total-amount">₹{ord.amount.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5 mt-4 items-center">
                                      <button 
                                        className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#FF6A00] text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 uppercase tracking-wider"
                                        onClick={() => {
                                          setSelectedOrderId(ord.id);
                                          handleTabChange("details");
                                        }}
                                      >
                                        <Eye size={13} /> View Details
                                      </button>
                                      
                                      <button 
                                        className="px-4 py-2 border border-[#FF6A00] text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        onClick={() => {
                                          setSelectedOrderId(ord.id);
                                          handleTabChange("track");
                                        }}
                                      >
                                        <Truck size={13} /> Track Order
                                      </button>

                                      <InvoiceGenerator
                                        data={{
                                          orderId: ord.id,
                                          date: ord.date,
                                          customerName: user?.name || "Valued Customer",
                                          customerEmail: user?.email || "",
                                          address: ord.address,
                                          paymentMode: ord.paymentMode,
                                          items: ord.items.map((item: any) => ({
                                            title: item.title,
                                            price: item.price,
                                            quantity: item.quantity,
                                            size: item.size,
                                          })),
                                          subtotal: ord.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0),
                                          gst: Math.round(ord.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0) * 0.05),
                                          shipping: ord.amount > 1999 ? 0 : 150,
                                          grandTotal: ord.amount,
                                        }}
                                        compact
                                        buttonClassName="px-4 py-2 bg-[#FF6A00] hover:bg-[#e05d00] text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 uppercase tracking-wider cursor-pointer border-0"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* PREVIOUS / PAST ORDERS SECTION */}
                            {(orderFilter === "all" || orderFilter === "previous") && orders.filter(o => !isPresentOrder(o.status)).length > 0 && (
                              <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 uppercase tracking-wider">
                                  <Package size={16} />
                                  <span>Previous & Completed Orders ({orders.filter(o => !isPresentOrder(o.status)).length})</span>
                                </div>

                                {orders.filter(o => !isPresentOrder(o.status)).map((ord) => (
                                  <div key={ord.id} className="order-item-block">
                                    <div className="item-header">
                                      <div>
                                        <span className="order-id">{ord.id}</span>
                                        <div className="order-date">Placed: {ord.date}</div>
                                      </div>
                                      <span className={`status-badge ${ord.status}`}>
                                        ✓ {ord.status.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="item-products">
                                      {ord.items.map((item: any, idx: number) => (
                                        <div key={idx} className="product-row">
                                          <div className="product-img-wrapper">
                                            <img src={item.image} alt={item.title} />
                                          </div>
                                          <div className="product-details">
                                            <h5>{item.title}</h5>
                                            <span>Size: {item.size} | Qty: {item.quantity}</span>
                                          </div>
                                          <div className="product-price">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="item-footer">
                                      <span className="total-label">Grand Total</span>
                                      <span className="total-amount">₹{ord.amount.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5 mt-4 items-center">
                                      <button 
                                        className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#FF6A00] text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 uppercase tracking-wider"
                                        onClick={() => {
                                          setSelectedOrderId(ord.id);
                                          handleTabChange("details");
                                        }}
                                      >
                                        <Eye size={13} /> View Details
                                      </button>

                                      <InvoiceGenerator
                                        data={{
                                          orderId: ord.id,
                                          date: ord.date,
                                          customerName: user?.name || "Valued Customer",
                                          customerEmail: user?.email || "",
                                          address: ord.address,
                                          paymentMode: ord.paymentMode,
                                          items: ord.items.map((item: any) => ({
                                            title: item.title,
                                            price: item.price,
                                            quantity: item.quantity,
                                            size: item.size,
                                          })),
                                          subtotal: ord.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0),
                                          gst: Math.round(ord.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0) * 0.05),
                                          shipping: ord.amount > 1999 ? 0 : 150,
                                          grandTotal: ord.amount,
                                        }}
                                        compact
                                        buttonClassName="px-4 py-2 bg-[#FF6A00] hover:bg-[#e05d00] text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 uppercase tracking-wider cursor-pointer border-0"
                                      />

                                      <button 
                                        className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full text-xs font-bold transition-all border-0 flex items-center gap-1.5 uppercase tracking-wider"
                                        onClick={() => {
                                          setReturnOrderId(ord.id);
                                          handleTabChange("returns");
                                        }}
                                      >
                                        <RotateCcw size={13} /> Return / Refund
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "details" && (
                    <motion.div 
                      key="details-card"
                      className="order-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3>Order Specifications</h3>
                        <button 
                          className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold uppercase hover:text-[#FF6A00] transition-colors"
                          onClick={() => handleTabChange("list")}
                        >
                          <ArrowLeft size={14} /> Back to Orders
                        </button>
                      </div>

                      {selectedOrder ? (
                        <div className="order-item-block" style={{ border: "none", padding: 0 }}>
                          <div className="item-header" style={{ paddingBottom: "16px", marginBottom: "16px" }}>
                            <div>
                              <span className="order-id">Order ID: {selectedOrder.id}</span>
                              <div className="order-date">Date Woven: {selectedOrder.date}</div>
                            </div>
                            <span className={`status-badge ${selectedOrder.status}`}>
                              {selectedOrder.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="item-products">
                            {selectedOrder.items.map((item: any, idx: number) => (
                              <div key={idx} className="product-row">
                                <div className="product-img-wrapper">
                                  <img src={item.image} alt={item.title} />
                                </div>
                                <div className="product-details">
                                  <h5>{item.title}</h5>
                                  <span>Size: {item.size} | Quantity: {item.quantity}</span>
                                </div>
                                <div className="product-price">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                              </div>
                            ))}
                          </div>

                          <div style={{ margin: "24px 0", padding: "18px 20px", backgroundColor: "#FAF9F6", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.04)" }}>
                            <div className="flex gap-2.5 items-start mb-3.5">
                              <MapPin size={16} className="text-[#FF6A00] mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">Delivery Address</span>
                                <p className="text-sm font-medium text-zinc-800 m-0 leading-relaxed">{selectedOrder.address}</p>
                              </div>
                            </div>
                            <div className="flex gap-2.5 items-start">
                              <Package size={16} className="text-[#FF6A00] mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">Payment Mode</span>
                                <p className="text-sm font-medium text-zinc-800 m-0">{selectedOrder.paymentMode}</p>
                              </div>
                            </div>
                          </div>

                          <div className="item-footer" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "16px" }}>
                            <span className="total-label">Grand Total (Incl. GST)</span>
                            <span className="total-amount" style={{ fontSize: "1.3rem" }}>₹{selectedOrder.amount.toLocaleString("en-IN")}</span>
                          </div>

                          {/* Download Invoice Button */}
                          <div style={{ marginTop: "24px" }}>
                            <InvoiceGenerator
                              data={{
                                orderId: selectedOrder.id,
                                date: selectedOrder.date,
                                customerName: user?.name || "Valued Customer",
                                customerEmail: user?.email || "",
                                address: selectedOrder.address,
                                paymentMode: selectedOrder.paymentMode,
                                items: selectedOrder.items.map((item: any) => ({
                                  title: item.title,
                                  price: item.price,
                                  quantity: item.quantity,
                                  size: item.size,
                                })),
                                subtotal: selectedOrder.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0),
                                gst: Math.round(selectedOrder.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0) * 0.05),
                                shipping: selectedOrder.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0) > 1999 ? 0 : 150,
                                grandTotal: selectedOrder.amount,
                              }}
                              buttonClassName="px-6 py-3 bg-[#FF6A00] hover:bg-[#e05d00] text-white rounded-full text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-lg border-0 inline-flex items-center gap-2 cursor-pointer"
                            />
                          </div>
                        </div>
                      ) : (
                        <p style={{ textAlign: "center", color: "rgba(0,0,0,0.4)", margin: "40px 0" }}>No order details available.</p>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "track" && (
                    <motion.div 
                      key="track-card"
                      className="order-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3>Track Shipments</h3>
                      {selectedOrder ? (
                        <>
                          <p style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.5)", marginBottom: "30px" }}>Order: <strong>{selectedOrder.id}</strong> | Tracking ID: <strong>AWB-{selectedOrder.id.replace("DOD-", "")}</strong></p>

                          <div className="tracker-timeline">
                            <div className="tracker-step is-completed">
                              <div className="step-dot">1</div>
                              <span className="step-label">Ordered (Confirmed)</span>
                            </div>
                            <div className="tracker-step is-completed">
                              <div className="step-dot">2</div>
                              <span className="step-label">Woven & Dispatched</span>
                            </div>
                            <div className="tracker-step">
                              <div className="step-dot">3</div>
                              <span className="step-label">Out for Courier</span>
                            </div>
                            <div className="tracker-step">
                              <div className="step-dot">4</div>
                              <span className="step-label">Atelier Delivered</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p style={{ textAlign: "center", color: "rgba(0,0,0,0.4)", margin: "40px 0" }}>No orders available to track.</p>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "cancel" && (
                    <motion.div 
                      key="cancel-card"
                      className="order-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3>Request Cancellation</h3>
                      <p style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.5)", marginBottom: "24px" }}>Only pending orders that have not been dispatched can be cancelled.</p>
                      
                      {orders.length > 0 ? (
                        <form onSubmit={handleCancelSubmit} className="order-cancel-form space-y-5">
                          <div className="profile-form-group">
                            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-2">Select Order ID</label>
                            <select 
                              value={selectedOrderId}
                              onChange={(e) => setSelectedOrderId(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 bg-white font-semibold text-sm outline-none transition-all"
                            >
                              {orders.map(o => (
                                <option key={o.id} value={o.id}>{o.id} — Placed {o.date} (₹{o.amount.toLocaleString('en-IN')})</option>
                              ))}
                            </select>
                          </div>
                          <div className="profile-form-group">
                            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-2">Reason for Cancellation</label>
                            <textarea 
                              required 
                              placeholder="Please tell us why you wish to cancel this order..."
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="w-full min-h-[120px] p-4 rounded-xl border border-zinc-200 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 font-medium text-sm outline-none transition-all resize-y"
                            />
                          </div>
                          <button 
                            type="submit" 
                            className="w-full py-3.5 px-8 bg-[#DC2626] hover:bg-[#b91c1c] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition-all border-0 cursor-pointer"
                          >
                            Submit Cancellation Request
                          </button>
                        </form>
                      ) : (
                        <p style={{ textAlign: "center", color: "rgba(0,0,0,0.4)", margin: "40px 0" }}>No active orders available to cancel.</p>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "returns" && (
                    <motion.div 
                      key="returns-card"
                      className="order-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3>Return / Refund Request</h3>
                      <p style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.5)", marginBottom: "24px" }}>Returns are accepted within 7 days of delivery. Motif tags must remain attached.</p>
                      
                      {orders.length > 0 ? (
                        <form onSubmit={handleReturnSubmit} className="order-cancel-form space-y-5">
                          <div className="profile-form-group">
                            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-2">Select Eligible Order</label>
                            <select 
                              value={returnOrderId}
                              onChange={(e) => setReturnOrderId(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 bg-white font-semibold text-sm outline-none transition-all"
                            >
                              {orders.map(o => (
                                <option key={o.id} value={o.id}>{o.id} — Placed {o.date} (₹{o.amount.toLocaleString('en-IN')})</option>
                              ))}
                            </select>
                          </div>
                          <div className="profile-form-group">
                            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-2">Briefly Describe Reason for Return</label>
                            <textarea 
                              required 
                              placeholder="Please explain the issue (sizing, pattern discrepancy, defect)..."
                              value={returnReason}
                              onChange={(e) => setReturnReason(e.target.value)}
                              className="w-full min-h-[120px] p-4 rounded-xl border border-zinc-200 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 font-medium text-sm outline-none transition-all resize-y"
                            />
                          </div>
                          <button 
                            type="submit" 
                            className="w-full py-3.5 px-8 bg-[#FF6A00] hover:bg-[#e05d00] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition-all border-0 cursor-pointer"
                          >
                            Submit Return Claim
                          </button>
                        </form>
                      ) : (
                        <p style={{ textAlign: "center", color: "rgba(0,0,0,0.4)", margin: "40px 0" }}>No orders available for return requests.</p>
                      )}
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
