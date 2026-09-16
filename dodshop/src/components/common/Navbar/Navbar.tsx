"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  X,
  Menu,
  Home,
  Info,
  Layers,
  PhoneCall,
  LogIn,
  Gift,
} from "lucide-react";
import { useStore } from "@/store/useStore";

// ── DATA STRUCTURE ───────────────────────────────────────────────────────────
const taglines = [
  "Elegant Ethnic Wear for Every You",
  "Free Shipping on All Orders Above ₹1999",
  "Handcrafted with Love in India",
  "New Festive Collection Out Now!"
];

const DEFAULT_INITIAL_CATEGORIES = [
  { id: 'cat-sarees', name: 'Sarees', slug: 'sarees', description: "Timeless drapes from India's finest looms." },
  { id: 'cat-kurtis', name: 'Kurtis', slug: 'kurtis', description: "Elegant ethnic tops." },
  { id: 'cat-blouses', name: 'Blouses', slug: 'blouses', description: "Designer blouses." },
  { id: 'cat-dupattas', name: 'Dupattas', slug: 'dupattas', description: "Handwoven accessories." },
  { id: 'cat-heritage', name: 'Heritage Weaves', slug: 'heritage-weaves', description: "Rare handloom treasures." },
  { id: 'cat-bridal', name: 'Bridal', slug: 'bridal', description: "Curated bridal couture." },
];

const legacyCategoryPresets: Record<string, { fabrics?: string[]; subcategories?: string[] }> = {
  Kurti: {
    fabrics: ["Cotton", "Rayon", "Silk", "Georgette", "Chiffon", "Linen"],
    subcategories: ["Anarkali Kurti", "A-Line Kurti", "Straight Kurti", "Short Kurti", "Party Wear Kurti"]
  },
  Kurtis: {
    fabrics: ["Cotton", "Rayon", "Silk", "Georgette", "Chiffon", "Linen"],
    subcategories: ["Anarkali Kurti", "A-Line Kurti", "Straight Kurti", "Short Kurti", "Party Wear Kurti"]
  },
  Saree: {
    fabrics: ["Katan Silk", "Organza", "Chanderi", "Georgette", "Mulberry Silk"],
    subcategories: ["Banarasi", "Silk", "Chiffon", "Net", "Cotton", "Zari Handloom"]
  },
  Sarees: {
    fabrics: ["Katan Silk", "Organza", "Chanderi", "Georgette", "Mulberry Silk"],
    subcategories: ["Banarasi", "Silk", "Chiffon", "Net", "Cotton", "Zari Handloom"]
  },
  Blouse: {
    fabrics: ["Raw Silk", "Velvet", "Brocade", "Tissue", "Satin"],
    subcategories: ["Ready Made", "Custom", "Designer", "Bridal Blouses"]
  },
  Blouses: {
    fabrics: ["Raw Silk", "Velvet", "Brocade", "Tissue", "Satin"],
    subcategories: ["Ready Made", "Custom", "Designer", "Bridal Blouses"]
  },
  Dupatta: {
    fabrics: ["Pure Silk", "Chiffon", "Net", "Organza", "Georgette"],
    subcategories: ["Heavy Zari", "Light Drapes", "Floral Prints", "Banarasi Borders"]
  },
  Dupattas: {
    fabrics: ["Pure Silk", "Chiffon", "Net", "Organza", "Georgette"],
    subcategories: ["Heavy Zari", "Light Drapes", "Floral Prints", "Banarasi Borders"]
  }
};

function formatMegaCategory(cat: any) {
  const preset = legacyCategoryPresets[cat.name] || {};

  const dbSubs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
  const presetSubs = preset.subcategories || [];
  const combinedSubs = Array.from(new Set([...dbSubs, ...presetSubs]));
  const subLinks = combinedSubs.length > 0
    ? combinedSubs.slice(0, 8)
    : [`${cat.name} Collection`, "New Arrivals", "Best Sellers", "Featured Styles"];

  const dbFabrics = Array.isArray(cat.fabrics) ? cat.fabrics : [];
  const presetFabrics = preset.fabrics || [];
  const combinedFabrics = Array.from(new Set([...dbFabrics, ...presetFabrics]));
  const fabricLinks = combinedFabrics.length > 0
    ? combinedFabrics.slice(0, 8)
    : ["Pure Silk", "Georgette", "Mulberry Cotton", "Artisanal Weave"];

  const designLinks = [
    "Hand Embroidered",
    "Zari Work",
    "Heritage Weave",
    "Festive Special",
    "Bridal Couture"
  ];

  return {
    title: cat.name,
    image: cat.image || "/mobile/saree.jpg",
    description: cat.description || `Exquisite ${cat.name} handcrafted for royal celebrations.`,
    sections: [
      {
        id: "categories",
        title: `${cat.name} Styles`,
        links: subLinks,
        viewAll: `View All ${cat.name}`
      },
      {
        id: "fabrics",
        title: `${cat.name} Fabrics`,
        links: fabricLinks,
        viewAll: "View All Fabrics"
      },
      {
        id: "crafts",
        title: "Artisanal Craft",
        links: designLinks,
        viewAll: "View All Designs"
      }
    ]
  };
}

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>(DEFAULT_INITIAL_CATEGORIES);
  const [activeTab, setActiveTab] = useState<string>("Sarees");
  const [mounted, setMounted] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
        setActiveTab((prev) => {
          if (prev && data.categories.some((c: any) => c.name === prev)) return prev;
          return data.categories[0].name;
        });
      }
    } catch (e) {
      console.warn("Failed to fetch categories in Navbar", e);
    }
  };

  // Profile dropdown states
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeDropdownSection, setActiveDropdownSection] = useState<string | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search overlay states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navSearchQuery.trim()) return;
    setIsSearchOpen(false);
    router.push(`/collection?search=${encodeURIComponent(navSearchQuery.trim())}`);
  };

  const handleSuggestionClick = (tag: string) => {
    setIsSearchOpen(false);
    setNavSearchQuery(tag);
    router.push(`/collection?search=${encodeURIComponent(tag)}`);
  };

  // Store connection
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const user = useStore((state) => state.user);
  const logoutAction = useStore((state) => state.logout);

  useEffect(() => {
    setMounted(true);
    fetchCategories();
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("focus", fetchCategories);
    const interval = setInterval(() => setTaglineIndex((p) => (p + 1) % taglines.length), 4000);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("focus", fetchCategories);
      clearInterval(interval);
    };
  }, []);

  if (pathname === "/login") return null;

  const shouldBeSolid = !isHome || isScrolled;

  const cartCount = mounted ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const wishlistCount = mounted ? wishlist.length : 0;
  const userLoggedIn = mounted ? !!user?.isLoggedIn : false;

  return (
    <header className={`navbar-wrapper ${shouldBeSolid ? "is-scrolled" : ""}`}>
      {/* ── TOP BAR (Hidden on Mobile) ────────────────────────────────────── */}
      <div className="navbar-top">
        <div className="navbar-top__container">
          <div className="navbar-top__left">
            <Mail size={14} className="navbar-top__icon" />
            <a href="mailto:hello@sareestyle.com">hello@sareestyle.com</a>
          </div>
          <div className="navbar-top__center">
            <span className="navbar-top__line" />
            <span className="navbar-top__dot" />
            <div className="navbar-top__slider">
              <AnimatePresence mode="wait">
                <motion.p key={taglineIndex} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -15, opacity: 0 }} transition={{ duration: 0.5 }}>
                  {taglines[taglineIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            <span className="navbar-top__dot" />
            <span className="navbar-top__line" />
          </div>
          <div className="navbar-top__right">
            <Phone size={14} className="navbar-top__icon" />
            <a href="tel:+919876543210">+91 98765 43210</a>
          </div>
        </div>
      </div>

      {/* ── MAIN NAVBAR ─────────────────────────────────────────────────────── */}
      <div className="navbar-main">
        <div className="navbar-main__container">
          {/* Brand Logo Box */}
          <Link href="/" className="navbar-brand">
            <div className="navbar-brand__logo-img">
              <img src="/logo.png" alt="Logo" />
            </div>
            <div className="navbar-brand__text">
              <h1 className="navbar-brand__title">DESIGNS OF DREAMS</h1>
              <p className="navbar-brand__tagline">Grace in Every Drape</p>
            </div>
          </Link>

          {/* Desktop Nav (Hidden on Mobile) */}
          <nav className="navbar-nav desktop-only">
            <ul className="navbar-nav__list">
              <li className="navbar-nav__item"><Link href="/" className="navbar-nav__link">Home</Link></li>
              <li className="navbar-nav__item"><Link href="/about" className="navbar-nav__link">About</Link></li>
              {/* MEGA MENU ITEM */}
              <li
                className="navbar-nav__item has-mega"
                onMouseEnter={() => {
                  fetchCategories();
                  setIsMegaOpen(true);
                }}
                onMouseLeave={() => setIsMegaOpen(false)}
              >
                <div
                  className="navbar-nav__link"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (!isMegaOpen) fetchCategories();
                    setIsMegaOpen(!isMegaOpen);
                  }}
                >
                  Collection <ChevronRight size={14} style={{ transform: isMegaOpen ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.3s' }} />
                </div>

                <AnimatePresence>
                  {isMegaOpen && (() => {
                    const currentCategory = categories.find((c) => c.name === activeTab) || categories[0];
                    const activeMenuData = currentCategory ? formatMegaCategory(currentCategory) : null;

                    return (
                      <motion.div
                        className="mega-menu"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="mega-menu__container" onClick={(e) => e.stopPropagation()}>
                          {/* Sidebar Tabs */}
                          <div className="mega-menu__sidebar">
                            {categories.map((cat) => (
                              <button
                                key={cat.id || cat.name}
                                className={`mega-menu__tab ${activeTab === cat.name ? "is-active" : ""}`}
                                onMouseEnter={() => setActiveTab(cat.name)}
                                onClick={() => {
                                  setIsMegaOpen(false);
                                  router.push(`/collection?category=${encodeURIComponent(cat.name)}`);
                                }}
                              >
                                {cat.name}
                                <ChevronRight size={16} />
                              </button>
                            ))}
                          </div>

                          {/* Content Grid */}
                          <div className="mega-menu__content">
                            <div className="mega-menu__grid">
                              {activeMenuData?.sections.map((section: any) => (
                                <div key={section.id} className="mega-menu__column">
                                  <div className="mega-menu__icon-circle">
                                    <Layers size={24} />
                                  </div>
                                  <h4 className="mega-menu__column-title">{section.title}</h4>
                                  <ul className="mega-menu__links">
                                    {section.links.map((link: string) => (
                                      <li key={link}>
                                        <Link
                                          href={`/collection?category=${encodeURIComponent(activeTab)}&sub=${encodeURIComponent(link)}`}
                                          className="mega-menu__link"
                                          onClick={() => setIsMegaOpen(false)}
                                        >
                                          {link}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                  <Link
                                    href={`/collection?category=${encodeURIComponent(activeTab)}`}
                                    className="mega-menu__view-all"
                                    onClick={() => setIsMegaOpen(false)}
                                  >
                                    {section.viewAll} <ChevronRight size={14} />
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </li>
              <li className="navbar-nav__item"><Link href="/contact" className="navbar-nav__link">Contact</Link></li>
            </ul>
          </nav>

          {/* Icons & Hamburger */}
          <div className="navbar-actions">
            {/* Search Icon Button: Now visible on both mobile and desktop */}
            <button
              className="navbar-actions__btn"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open Search"
            >
              <Search size={22} />
            </button>
            <Link href="/cart" className="navbar-actions__btn navbar-actions__btn--badge desktop-only">
              <ShoppingBag size={22} />
              {cartCount > 0 && <span className="navbar-actions__count">{cartCount}</span>}
            </Link>
            <Link href="/wishlist" className="navbar-actions__btn navbar-actions__btn--badge desktop-only">
              <Heart size={22} />
              {wishlistCount > 0 && <span className="navbar-actions__count">{wishlistCount}</span>}
            </Link>
            {userLoggedIn ? (
              <div className="navbar-profile-container desktop-only" ref={profileDropdownRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="navbar-actions__btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF6A00' }}
                  aria-expanded={isProfileDropdownOpen}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid #FF6A00" }}
                    />
                  ) : (
                    <User size={22} style={{ stroke: '#FF6A00' }} />
                  )}
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-poppins)', fontWeight: 600, color: '#FF6A00' }}>
                    {user?.name}
                  </span>
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      className="profile-dropdown"
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="profile-dropdown__header">
                        <span className="user-email">{user?.email}</span>
                      </div>
                      <div className="profile-dropdown__menu-items">

                        {/* Profile Link */}
                        <div className="dropdown-section">
                          <Link
                            href="/profile"
                            className="section-trigger"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span>Profile</span>
                          </Link>
                        </div>

                        {/* Order Link */}
                        <div className="dropdown-section">
                          <Link
                            href="/order"
                            className="section-trigger"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span>Order</span>
                          </Link>
                        </div>

                        {/* Settings Link */}
                        <div className="dropdown-section">
                          <Link
                            href="/settings"
                            className="section-trigger"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span>Settings</span>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="dropdown-section dropdown-section--logout">
                          <button
                            type="button"
                            className="section-trigger"
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              logoutAction();
                              router.push("/login");
                            }}
                          >
                            <span>Logout</span>
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="navbar-actions__btn desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={22} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── SEARCH OVERLAY ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="navbar-search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="navbar-search-overlay__close"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              <X size={32} />
            </button>

            <motion.div
              className="navbar-search-overlay__content"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="navbar-search-overlay__subtitle">Discover Our Masterpieces</span>
              <h2 className="navbar-search-overlay__title">What are you looking for?</h2>

              <form onSubmit={handleSearchSubmit} className="navbar-search-overlay__form">
                <div className="navbar-search-overlay__input-wrapper">
                  <input
                    type="text"
                    placeholder="Search for sarees, kurtis, blouses..."
                    value={navSearchQuery}
                    onChange={(e) => setNavSearchQuery(e.target.value)}
                    className="navbar-search-overlay__input"
                    autoFocus
                  />
                  <button type="submit" className="navbar-search-overlay__submit-btn">
                    <Search size={28} />
                  </button>
                </div>
              </form>

              <div className="navbar-search-overlay__suggestions">
                <p>Trending Searches:</p>
                <div className="suggestion-tags">
                  {["Banarasi", "Kurti", "Blouse", "Dupatta", "Anarkali", "Silk Saree"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSuggestionClick(tag)}
                      className="suggestion-tag"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
