"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Calendar, Sparkles, Send, CheckCircle, RefreshCw, Search, ListFilter, X } from "lucide-react";
import "./Contact.scss";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  sku?: string;
  categoryId: string;
  sellingPrice?: number;
  images?: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [itemMode, setItemMode] = useState<'dropdown' | 'search'>('dropdown');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    categoryId: "",
    interest: "",
    productId: "",
    productName: "",
    date: "",
    message: ""
  });

  const fetchCategories = useCallback(async () => {
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        const activeCats = data.categories.filter((c: any) => c.isActive !== false);
        setCategories(activeCats);
        // Retain category if still valid, but DO NOT auto-select so "Select Your Category" shows first
        setForm((prev) => {
          if (prev.categoryId && !activeCats.some((c: CategoryItem) => c.id === prev.categoryId)) {
            return {
              ...prev,
              categoryId: "",
              interest: "",
              productId: "",
              productName: ""
            };
          }
          return prev;
        });
      } else {
        throw new Error(data.error || 'Failed to load categories');
      }
    } catch (err) {
      console.error('Failed to fetch categories for Contact page:', err);
      setCategoryError('Unable to load categories.');
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?limit=200', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products for Contact page:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    const onFocus = () => {
      fetchCategories();
      fetchProducts();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchCategories, fetchProducts]);

  // Filter products for the chosen category
  const categoryProducts = useMemo(() => {
    if (!form.categoryId) return [];
    return products.filter(
      p => p.categoryId === form.categoryId || p.category?.id === form.categoryId || (form.interest && p.category?.name?.toLowerCase() === form.interest.toLowerCase())
    );
  }, [products, form.categoryId, form.interest]);

  // Filter products by search query
  const searchFilteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return categoryProducts;
    const q = searchQuery.toLowerCase();
    return categoryProducts.filter(p =>
      p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
    );
  }, [categoryProducts, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.categoryId) {
      alert('Please select your category first');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categoryName: form.interest
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setForm({
            name: "",
            email: "",
            phone: "",
            categoryId: "",
            interest: "",
            productId: "",
            productName: "",
            date: "",
            message: ""
          });
          setSearchQuery("");
        }, 4000);
      } else {
        alert(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="contact-section">
      <div className="contact-section__container">

        {/* Left Side: Editorial Info */}
        <motion.div
          className="contact-info"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="contact-info__header">
            <span className="contact-info__tag">
              <Sparkles size={12} />
              Atelier Appointments
            </span>
            <h2 className="contact-info__title">Visit the <span>Atelier</span></h2>
            <p className="contact-info__desc">
              Experience the weight, drape, and texture of our heritage collections in person. Book a private styling consultation at our Peeli Kothi flagship workshop.
            </p>
          </div>

          <div className="contact-details">
            <div className="contact-card">
              <div className="contact-card__icon"><MapPin size={20} /></div>
              <div className="contact-card__content">
                <h4>Peeli Kothi Atelier</h4>
                <p>K-46/2, Near Peeli Kothi Crossing, Varanasi, UP, India</p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card__icon"><Phone size={20} /></div>
              <div className="contact-card__content">
                <h4>Private Styling Phone</h4>
                <p><a href="tel:+919876543210">+91 98765 43210</a></p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card__icon"><Mail size={20} /></div>
              <div className="contact-card__content">
                <h4>Atelier Inquiries</h4>
                <p><a href="mailto:appointments@sareestyle.com">appointments@sareestyle.com</a></p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card__icon"><Clock size={20} /></div>
              <div className="contact-card__content">
                <h4>Atelier Experience Hours</h4>
                <p>Monday – Saturday: 11:00 AM – 08:00 PM</p>
                <p className="highlight">Strictly by pre-booked appointment</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Appointment Booking Form */}
        <motion.div
          className="contact-booking"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="contact-booking__form-box">
            <h3>Request Styling Session</h3>
            <p>Fill out the details below, and our atelier concierge will contact you within 24 hours to confirm your private experience.</p>

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="booking-form__group">
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your Full Name"
                  className="booking-form__input"
                />
                <span className="booking-form__line" />
              </div>

              <div className="booking-form__row">
                <div className="booking-form__group">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Email Address"
                    className="booking-form__input"
                  />
                  <span className="booking-form__line" />
                </div>

                <div className="booking-form__group">
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone Number"
                    className="booking-form__input"
                  />
                  <span className="booking-form__line" />
                </div>
              </div>

              <div className="booking-form__row">
                <div className="booking-form__group">
                  <select
                    value={form.categoryId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const matched = categories.find((c) => c.id === selectedId);
                      setForm(prev => ({
                        ...prev,
                        categoryId: selectedId,
                        interest: matched ? matched.name : "",
                        productId: "",
                        productName: ""
                      }));
                      setSearchQuery("");
                    }}
                    disabled={categoryLoading || !!categoryError || categories.length === 0}
                    className="booking-form__input booking-form__select"
                    required
                  >
                    {categoryLoading ? (
                      <option value="" disabled>Loading categories...</option>
                    ) : categoryError ? (
                      <option value="" disabled>Unable to load categories.</option>
                    ) : categories.length === 0 ? (
                      <option value="" disabled>No categories available</option>
                    ) : (
                      <>
                        <option value="" disabled>Select Your Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <span className="booking-form__line" />
                  {categoryError && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#e53e3e' }}>Unable to load categories.</span>
                      <button
                        type="button"
                        onClick={() => fetchCategories()}
                        style={{
                          fontSize: '0.75rem',
                          color: '#FF6A00',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <RefreshCw size={11} /> Retry
                      </button>
                    </div>
                  )}
                </div>

                <div className="booking-form__group booking-form__group--date">
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="booking-form__input booking-form__date"
                  />
                  <span className="booking-form__line" />
                  <Calendar size={16} className="booking-form__date-icon" />
                </div>
              </div>

              {/* Item / Product Selection Under Selected Category */}
              <div className="item-selection-container">
                <div className="item-mode-header">
                  <span className="item-mode-header__label">
                    {form.interest ? `${form.interest} Item / Product` : 'Item / Product Selection'}
                  </span>

                  {/* Two Mode Switcher: Dropdown Select vs Search Filter */}
                  {form.categoryId && categoryProducts.length > 0 && (
                    <div className="item-mode-toggle">
                      <button
                        type="button"
                        onClick={() => { setItemMode('dropdown'); setIsSearchOpen(false); }}
                        className={`item-mode-toggle__btn ${itemMode === 'dropdown' ? 'item-mode-toggle__btn--active' : ''}`}
                      >
                        <ListFilter size={12} /> Dropdown Select
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemMode('search')}
                        className={`item-mode-toggle__btn ${itemMode === 'search' ? 'item-mode-toggle__btn--active' : ''}`}
                      >
                        <Search size={12} /> Search Filter
                      </button>
                    </div>
                  )}
                </div>

                {!form.categoryId ? (
                  <div className="booking-form__group">
                    <select disabled className="booking-form__input booking-form__select" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                      <option>Select your category first</option>
                    </select>
                    <span className="booking-form__line" />
                  </div>
                ) : categoryProducts.length === 0 ? (
                  <div className="booking-form__group">
                    <select disabled className="booking-form__input booking-form__select" style={{ opacity: 0.75 }}>
                      <option>Entire {form.interest} Collection (General Atelier Consultation)</option>
                    </select>
                    <span className="booking-form__line" />
                  </div>
                ) : itemMode === 'dropdown' ? (
                  /* MODE 1: DROPDOWN SELECTION */
                  <div className="booking-form__group">
                    <select
                      value={form.productId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        if (!pid) {
                          setForm(prev => ({ ...prev, productId: "", productName: "" }));
                        } else if (pid === "ALL") {
                          setForm(prev => ({ ...prev, productId: "ALL", productName: `Entire ${form.interest} Collection` }));
                        } else {
                          const matchedProd = categoryProducts.find(p => p.id === pid);
                          setForm(prev => ({
                            ...prev,
                            productId: pid,
                            productName: matchedProd ? matchedProd.name : ""
                          }));
                        }
                      }}
                      className="booking-form__input booking-form__select"
                    >
                      <option value="">Select Item / Product (Optional)</option>
                      <option value="ALL">Entire {form.interest} Collection</option>
                      {categoryProducts.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name} {prod.sellingPrice ? `— ₹${prod.sellingPrice.toLocaleString('en-IN')}` : ''}
                        </option>
                      ))}
                    </select>
                    <span className="booking-form__line" />
                  </div>
                ) : (
                  /* MODE 2: PRODUCT NAME SEARCHING FILTER */
                  <div className="booking-form__group">
                    <div className="item-search-wrapper">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        onBlur={() => setTimeout(() => setIsSearchOpen(false), 250)}
                        placeholder={`Search ${form.interest} items by product name...`}
                        className="item-search-wrapper__input"
                      />
                      <Search size={15} className="item-search-wrapper__icon" />
                      <span className="booking-form__line" />

                      {/* Filtered Dropdown Results */}
                      {isSearchOpen && (
                        <div className="item-search-dropdown">
                          <div
                            className="item-search-dropdown__item"
                            onMouseDown={() => {
                              setForm(prev => ({
                                ...prev,
                                productId: "ALL",
                                productName: `Entire ${form.interest} Collection`
                              }));
                              setSearchQuery(`Entire ${form.interest} Collection`);
                              setIsSearchOpen(false);
                            }}
                          >
                            <div className="item-search-dropdown__info">
                              <span className="item-search-dropdown__name">Entire {form.interest} Collection</span>
                              <span className="item-search-dropdown__meta">Consultation for entire collection</span>
                            </div>
                          </div>

                          {searchFilteredProducts.length === 0 ? (
                            <div className="item-search-dropdown__empty">
                              No {form.interest} products matching "{searchQuery}"
                            </div>
                          ) : (
                            searchFilteredProducts.map((prod) => {
                              const isSelected = form.productId === prod.id;
                              const imageSrc = (prod.images && prod.images[0]) || null;
                              return (
                                <div
                                  key={prod.id}
                                  className={`item-search-dropdown__item ${isSelected ? 'item-search-dropdown__item--selected' : ''}`}
                                  onMouseDown={() => {
                                    setForm(prev => ({
                                      ...prev,
                                      productId: prod.id,
                                      productName: prod.name
                                    }));
                                    setSearchQuery(prod.name);
                                    setIsSearchOpen(false);
                                  }}
                                >
                                  {imageSrc ? (
                                    <img src={imageSrc} alt={prod.name} className="item-search-dropdown__thumb" />
                                  ) : (
                                    <div className="item-search-dropdown__thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Sparkles size={14} style={{ color: '#FF6A00' }} />
                                    </div>
                                  )}
                                  <div className="item-search-dropdown__info">
                                    <span className="item-search-dropdown__name">{prod.name}</span>
                                    <span className="item-search-dropdown__meta">
                                      {prod.sellingPrice ? `₹${prod.sellingPrice.toLocaleString('en-IN')}` : ''}
                                      {prod.sku ? ` • ${prod.sku}` : ''}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Selected Item Indicator */}
                {form.productId && (
                  <div className="selected-item-pill">
                    Item Selected: <span>{form.productName || form.productId}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, productId: "", productName: "" }));
                        setSearchQuery("");
                      }}
                      title="Clear item selection"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>

              <div className="booking-form__group">
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Special requests or measurements (Optional)"
                  className="booking-form__input booking-form__textarea"
                />
                <span className="booking-form__line" />
              </div>

              <button type="submit" className="booking-form__btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Request Appointment'}
                {!submitting && <Send size={15} />}
              </button>
            </form>

            {/* Success Animation Notification */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  className="booking-form__success"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <CheckCircle size={24} className="success-icon" />
                  <div>
                    <h5>Request Submitted</h5>
                    <p>We have received your appointment request. Check your inbox shortly for our confirmation call.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
