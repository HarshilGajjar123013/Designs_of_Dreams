"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/store/useStore";

// ── DATA STRUCTURE ───────────────────────────────────────────────────────────

const DEFAULT_INITIAL_CATEGORIES: any[] = [];

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
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const [announcements, setAnnouncements] = useState<string[]>([
    "FREE SHIPPING ON ALL ORDERS ABOVE ₹1999"
  ]);
  const [announcementActive, setAnnouncementActive] = useState<boolean>(true);
  const [announcementLink, setAnnouncementLink] = useState<string>("");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setActiveTab((prev) => {
            if (prev && data.categories.some((c: any) => c.name === prev)) return prev;
            return data.categories[0].name;
          });
        } else {
          setActiveTab("");
        }
      }
    } catch (e) {
      console.warn("Failed to fetch categories in Navbar", e);
    }
  };

  const fetchCms = async () => {
    try {
      const res = await fetch("/api/cms", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.cms) {
        setAnnouncementActive(data.cms.announcementActive ?? true);
        setAnnouncementLink(data.cms.announcementLink || "");
        if (data.cms.announcementText && data.cms.announcementText.trim()) {
          let lines: string[] = [];
          try {
            const parsed = JSON.parse(data.cms.announcementText);
            if (Array.isArray(parsed)) {
              lines = parsed.map((s: any) => String(s).trim()).filter((s: string) => s.length > 0);
            }
          } catch {}
          if (lines.length === 0) {
            lines = data.cms.announcementText
              .split(/\r?\n/)
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0);
          }
          setAnnouncements(lines.length > 0 ? lines : [data.cms.announcementText.trim()]);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch CMS announcement in Navbar", e);
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

  // Search overlay states & dynamic data
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const [liveSearchResults, setLiveSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dod_recent_searches");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 5));
        }
      } catch {}
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem("dod_recent_searches", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("dod_recent_searches");
    } catch {}
  };

  // Helper to extract first image safely (whether array or space-separated string)
  const getProductImage = useCallback((prod: any) => {
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      return prod.images[0];
    }
    if (typeof prod.images === "string" && prod.images.trim()) {
      const parts = prod.images.trim().split(/\s+/);
      if (parts.length > 0 && parts[0]) return parts[0];
    }
    return prod.image || "/mobile/saree.jpg";
  }, []);

  // Dynamic trending tags derived from live database categories, subcategories & fabrics
  const dynamicTrendingTags = useMemo(() => {
    const tags: string[] = [];
    if (categories && Array.isArray(categories)) {
      categories.forEach((cat) => {
        if (cat.name && typeof cat.name === "string" && cat.name.trim()) {
          tags.push(cat.name.trim());
        }
        if (Array.isArray(cat.subcategories)) {
          cat.subcategories.forEach((sub: string) => {
            if (sub && typeof sub === "string" && sub.trim()) {
              tags.push(sub.trim());
            }
          });
        }
        if (Array.isArray(cat.fabrics)) {
          cat.fabrics.forEach((fab: string) => {
            if (fab && typeof fab === "string" && fab.trim()) {
              tags.push(fab.trim());
            }
          });
        }
      });
    }

    const unique = Array.from(new Set(tags)).filter((t) => t.length > 1 && !t.includes(";;"));
    if (unique.length > 0) {
      return unique.slice(0, 8);
    }
    return ["Saree", "Kurti", "Pure Silk", "Couture", "Handloom"];
  }, [categories]);

  // Dynamic input placeholder based on live catalog data
  const dynamicPlaceholder = useMemo(() => {
    if (categories && categories.length > 0) {
      const names = categories
        .filter((c) => c.name && c.name.trim())
        .slice(0, 3)
        .map((c) => c.name.trim());
      if (names.length > 0) {
        return `Search for ${names.join(", ")}...`;
      }
    }
    return "Search for sarees, kurtis, blouses...";
  }, [categories]);

  // Live real-time search debounced effect
  useEffect(() => {
    const q = navSearchQuery.trim();
    if (!q) {
      setLiveSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=6`);
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setLiveSearchResults(data.products);
        } else {
          setLiveSearchResults([]);
        }
      } catch (err) {
        console.warn("Live search query failed:", err);
        setLiveSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [navSearchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = navSearchQuery.trim();
    if (!q) return;
    saveRecentSearch(q);
    setIsSearchOpen(false);
    router.push(`/collection?search=${encodeURIComponent(q)}`);
  };

  const handleSuggestionClick = (tag: string) => {
    saveRecentSearch(tag);
    setIsSearchOpen(false);
    setNavSearchQuery(tag);

    // If tag matches an active category, filter by category
    const matchedCategory = categories.find(
      (c) => c.name && c.name.toLowerCase() === tag.toLowerCase()
    );
    if (matchedCategory) {
      router.push(`/collection?category=${encodeURIComponent(matchedCategory.name)}`);
    } else {
      router.push(`/collection?search=${encodeURIComponent(tag)}`);
    }
  };

  const handleProductResultClick = (prod: any) => {
    saveRecentSearch(prod.name || navSearchQuery);
    setIsSearchOpen(false);
    setNavSearchQuery("");
    router.push(`/product/${prod.id || prod.slug}`);
  };

  // Store connection
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const user = useStore((state) => state.user);
  const logoutAction = useStore((state) => state.logout);

  useEffect(() => {
    setMounted(true);
    fetchCategories();
    fetchCms();
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("focus", fetchCategories);
    window.addEventListener("focus", fetchCms);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("focus", fetchCategories);
      window.removeEventListener("focus", fetchCms);
    };
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) {
      setTaglineIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setTaglineIndex((p) => (p + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcements]);

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
          {announcementActive && announcements.length > 0 ? (
            <div className="navbar-top__center">
              <span className="navbar-top__line" />
              <span className="navbar-top__dot" />
              <div className="navbar-top__slider">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={taglineIndex}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {announcementLink ? (
                      <Link href={announcementLink} className="hover:opacity-80 transition-opacity">
                        {announcements[taglineIndex] || announcements[0]}
                      </Link>
                    ) : (
                      announcements[taglineIndex] || announcements[0]
                    )}
                  </motion.p>
                </AnimatePresence>
              </div>
              <span className="navbar-top__dot" />
              <span className="navbar-top__line" />
            </div>
          ) : (
            <div className="navbar-top__center" style={{ visibility: "hidden" }} />
          )}
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
                          {categories.length > 0 ? (
                            <>
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
                            </>
                          ) : (
                            <div style={{ padding: "40px 24px", textAlign: "center", width: "100%" }}>
                              <p style={{ color: "#8E887E", fontSize: "14px", marginBottom: "12px" }}>
                                No categories added to the catalog yet.
                              </p>
                              <Link
                                href="/collection"
                                onClick={() => setIsMegaOpen(false)}
                                style={{
                                  display: "inline-block",
                                  padding: "8px 20px",
                                  border: "1px solid #C5A059",
                                  color: "#C5A059",
                                  fontSize: "12px",
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase",
                                  borderRadius: "4px"
                                }}
                              >
                                View Collection Catalog
                              </Link>
                            </div>
                          )}
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
              <X size={28} />
            </button>

            <motion.div
              className="navbar-search-overlay__content"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="navbar-search-overlay__subtitle">Discover Our Masterpieces</span>
              <h2 className="navbar-search-overlay__title">What are you looking for?</h2>

              <form onSubmit={handleSearchSubmit} className="navbar-search-overlay__form">
                <div className="navbar-search-overlay__input-wrapper">
                  <input
                    type="text"
                    placeholder={dynamicPlaceholder}
                    value={navSearchQuery}
                    onChange={(e) => setNavSearchQuery(e.target.value)}
                    className="navbar-search-overlay__input"
                    autoFocus
                  />
                  {navSearchQuery ? (
                    <button
                      type="button"
                      className="navbar-search-overlay__clear-btn"
                      onClick={() => setNavSearchQuery("")}
                      aria-label="Clear query"
                    >
                      <X size={20} />
                    </button>
                  ) : null}
                  <button type="submit" className="navbar-search-overlay__submit-btn" aria-label="Submit search">
                    <Search size={26} />
                  </button>
                </div>
              </form>

              {/* LIVE SEARCH RESULTS — If user typed query */}
              {navSearchQuery.trim().length > 0 ? (
                <div className="navbar-search-overlay__results">
                  {isSearching ? (
                    <div className="navbar-search-overlay__loading">
                      <div className="search-spinner" />
                      <span>Searching our catalog...</span>
                    </div>
                  ) : liveSearchResults.length > 0 ? (
                    <>
                      <div className="navbar-search-overlay__results-header">
                        <span>Matching Pieces ({liveSearchResults.length})</span>
                        <button
                          type="button"
                          className="results-view-all-link"
                          onClick={handleSearchSubmit}
                        >
                          View all results in shop <ArrowRight size={14} />
                        </button>
                      </div>

                      <div className="navbar-search-overlay__grid">
                        {liveSearchResults.map((prod) => {
                          const img = getProductImage(prod);
                          const price = prod.sellingPrice || prod.price || prod.mrp;
                          const categoryName = prod.category?.name || prod.subCategory || "Heritage Piece";
                          return (
                            <div
                              key={prod.id}
                              className="search-result-card"
                              onClick={() => handleProductResultClick(prod)}
                            >
                              <div className="search-result-card__image-wrap">
                                <img src={img} alt={prod.name} />
                              </div>
                              <div className="search-result-card__details">
                                <span className="search-result-card__category">{categoryName}</span>
                                <h4 className="search-result-card__title">{prod.name}</h4>
                                <div className="search-result-card__price">
                                  {price ? `₹${Number(price).toLocaleString('en-IN')}` : 'Inquire Price'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="navbar-search-overlay__empty">
                      <p>No products found matching &ldquo;{navSearchQuery}&rdquo;</p>
                      <span>Explore popular categories or fabrics below:</span>
                    </div>
                  )}
                </div>
              ) : null}

              {/* RECENT SEARCHES — If any exist and no active query */}
              {!navSearchQuery.trim() && recentSearches.length > 0 && (
                <div className="navbar-search-overlay__recent">
                  <div className="recent-header">
                    <div className="recent-title">
                      <Clock size={13} />
                      <span>Recent Searches:</span>
                    </div>
                    <button type="button" onClick={clearRecentSearches} className="recent-clear-btn">
                      Clear
                    </button>
                  </div>
                  <div className="suggestion-tags">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleSuggestionClick(term)}
                        className="suggestion-tag suggestion-tag--recent"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DYNAMIC CATEGORIES & TRENDING TAGS FROM LIVE DATABASE */}
              <div className="navbar-search-overlay__suggestions">
                <p>
                  <TrendingUp size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                  Trending Searches from Our Catalog:
                </p>
                <div className="suggestion-tags">
                  {dynamicTrendingTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSuggestionClick(tag)}
                      className="suggestion-tag"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC ATELIER CATEGORIES ROW */}
              {categories && categories.length > 0 && (
                <div className="navbar-search-overlay__categories-quick">
                  <span className="quick-title">Explore Store Categories:</span>
                  <div className="category-chips">
                    {categories.map((cat) => (
                      <button
                        key={cat.id || cat.name}
                        type="button"
                        className="category-chip"
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push(`/collection?category=${encodeURIComponent(cat.name)}`);
                        }}
                      >
                        <span>{cat.name}</span>
                        {typeof cat.productCount === "number" && cat.productCount > 0 && (
                          <span className="category-chip__count">{cat.productCount}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
