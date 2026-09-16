"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useStore, Product } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, X, Check, ChevronRight, SlidersHorizontal, IndianRupee, ChevronDown } from "lucide-react";
import "./CollectionCatalog.scss";

export default function CollectionCatalog({ 
  initialProducts,
  initialCategories 
}: { 
  initialProducts?: Product[];
  initialCategories?: any[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Zustand Store
  const storeProducts = useStore((state) => state.products);
  const [liveProducts, setLiveProducts] = useState<any[]>(
    Array.isArray(initialProducts) && initialProducts.length > 0 ? initialProducts : storeProducts
  );

  useEffect(() => {
    if (Array.isArray(initialProducts) && initialProducts.length > 0) {
      setLiveProducts(initialProducts);
    }
  }, [initialProducts]);

  // Live real-time sync with database API
  useEffect(() => {
    const fetchLiveProducts = () => {
      fetch("/api/products?limit=100")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.products) && data.products.length > 0) {
            const mapped = data.products.map((p: any) => ({
              id: p.id,
              title: p.name,
              subtitle: p.fabric || p.subCategory || '',
              categoryId: p.categoryId,
              category: p.category?.name || 'Saree',
              categorySlug: p.category?.slug || '',
              subcategory: p.subCategory,
              desc: p.description,
              longDesc: p.description,
              price: p.sellingPrice,
              mrp: p.mrp,
              discountPercent: p.discount,
              image: p.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600',
              badge: p.featured ? "Featured" : p.newArrival ? "New Arrival" : p.bestSeller ? "Best Seller" : "",
              fabrics: [p.fabric || 'Silk'],
              features: p.features || [],
              sizes: p.sizes || ['Free Size'],
              rating: p.rating || 5.0,
              images: p.images || []
            }));
            setLiveProducts(mapped);
          }
        })
        .catch((err) => console.warn("Failed to live sync products", err));
    };

    fetchLiveProducts();
    window.addEventListener("focus", fetchLiveProducts);
    return () => window.removeEventListener("focus", fetchLiveProducts);
  }, []);

  const products = liveProducts.length > 0 ? liveProducts : storeProducts;
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);

  // Dynamic max price
  const maxPossiblePrice = useMemo(() => {
    const highest = Math.max(...products.map((p) => p.price || 0), 50000);
    return Math.ceil(highest / 5000) * 5000;
  }, [products]);

  // States
  const [categories, setCategories] = useState<any[]>(initialCategories || []);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");

  // Price Filter States
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPossiblePrice]);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, maxPossiblePrice]);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const priceDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside for price dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(e.target as Node)) {
        setIsPriceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch fresh categories if not provided or to ensure live sync
  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
        })
        .catch((err) => console.warn("Failed to fetch categories", err));
    }
  }, [initialCategories]);

  // Parse query params on mount/change
  useEffect(() => {
    const category = searchParams.get("category");
    const sub = searchParams.get("sub");
    const search = searchParams.get("search");
    const minParam = searchParams.get("minPrice");
    const maxParam = searchParams.get("maxPrice");
    
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("All");
    }

    if (sub) {
      setActiveSubcategory(sub);
    } else {
      setActiveSubcategory(null);
    }

    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery("");
    }

    if (minParam || maxParam) {
      const minVal = minParam ? Math.max(0, parseInt(minParam)) : 0;
      const maxVal = maxParam ? parseInt(maxParam) : maxPossiblePrice;
      setPriceRange([minVal, maxVal]);
      setTempPriceRange([minVal, maxVal]);
    } else {
      setPriceRange([0, maxPossiblePrice]);
      setTempPriceRange([0, maxPossiblePrice]);
    }
  }, [searchParams, maxPossiblePrice]);

  // Handle category tab click
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setActiveSubcategory(null); // Clear subcategory on main category switch
    
    const params = new URLSearchParams(searchParams.toString());
    if (category !== "All") {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("sub");
    router.push(`/collection?${params.toString()}`);
  };

  const isPriceActive = priceRange[0] > 0 || priceRange[1] < maxPossiblePrice;

  const applyPriceFilter = (min: number, max: number) => {
    const safeMin = Math.max(0, Math.min(min, max));
    const safeMax = Math.max(safeMin, max);
    setPriceRange([safeMin, safeMax]);
    setIsPriceDropdownOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    if (safeMin > 0) {
      params.set("minPrice", safeMin.toString());
    } else {
      params.delete("minPrice");
    }
    if (safeMax < maxPossiblePrice) {
      params.set("maxPrice", safeMax.toString());
    } else {
      params.delete("maxPrice");
    }
    router.push(`/collection?${params.toString()}`);
  };

  const resetPriceFilter = () => {
    setPriceRange([0, maxPossiblePrice]);
    setTempPriceRange([0, maxPossiblePrice]);
    setIsPriceDropdownOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    router.push(`/collection?${params.toString()}`);
  };

  const pricePresets = [
    { label: "All Prices", min: 0, max: maxPossiblePrice },
    { label: "Under ₹5K", min: 0, max: 5000 },
    { label: "₹5K – ₹15K", min: 5000, max: 15000 },
    { label: "₹15K – ₹35K", min: 15000, max: 35000 },
    { label: "₹35K+", min: 35000, max: maxPossiblePrice },
  ];

  // Filter products
  const filteredProducts = products.filter((p: any) => {
    const pCat = (p.category || "").toLowerCase();
    const pSub = (p.subcategory || "").toLowerCase();
    const pCatId = p.categoryId || "";
    const pCatSlug = (p.categorySlug || "").toLowerCase();
    const selCat = selectedCategory.toLowerCase();
    
    const matchCategory = selectedCategory === "All" || 
                          pCatId === selectedCategory ||
                          pCat === selCat ||
                          pCatSlug === selCat ||
                          pCat.includes(selCat) || 
                          selCat.includes(pCat) ||
                          pSub.includes(selCat) ||
                          ((selCat.includes("saree") || selCat.includes("sadi")) && 
                           (pCat.includes("saree") || pCat.includes("sadi") || pCat.includes("weave")));
                          
    const matchSubcategory = !activeSubcategory || 
                            pSub === activeSubcategory.toLowerCase() ||
                            pSub.includes(activeSubcategory.toLowerCase());

    const matchSearch = !searchQuery ||
                        (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (p.subtitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.desc || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchPrice = (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1];
    
    return matchCategory && matchSubcategory && matchSearch && matchPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return String(a.id).localeCompare(String(b.id)); // Default / ID sort
  });

  const isFavorited = (productId: string) => wishlist.some((item) => String(item.id) === String(productId));

  return (
    <section className="catalog-section">
      <div className="catalog-section__container">
        
        {/* Page Editorial Header */}
        <div className="catalog-header">
          <span className="catalog-header__tag">Designs of Dreams</span>
          <h1 className="catalog-header__title">
            {activeSubcategory ? activeSubcategory : selectedCategory === "All" ? "Curated Masterpieces" : `${selectedCategory} Collection`}
          </h1>
          <p className="catalog-header__desc">
            Explore our curated catalog of traditional handlooms, heavy bridal zardozi, and contemporary silhouettes.
          </p>
        </div>

        {/* Filters Controls Panel */}
        <div className="catalog-controls">
          {/* Category Tabs */}
          <div className="catalog-tabs">
            <button
              className={`catalog-tabs__btn ${selectedCategory === "All" ? "is-active" : ""}`}
              onClick={() => handleCategoryChange("All")}
            >
              All Masterpieces
            </button>
            {categories.map((cat: any) => {
              const isCatActive =
                selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                selectedCategory.toLowerCase() === (cat.slug || "").toLowerCase() ||
                selectedCategory === cat.id;

              return (
                <button
                  key={cat.id || cat.slug || cat.name}
                  className={`catalog-tabs__btn ${isCatActive ? "is-active" : ""}`}
                  onClick={() => handleCategoryChange(cat.name)}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search, Price Range, and Sort Toolbar */}
          <div className="catalog-toolbar">
            <div className="search-box">
              <Search size={18} className="search-box__icon" />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-box__input"
              />
            </div>

            <div className="toolbar-actions">
              {/* Price Range Filter Dropdown */}
              <div className="price-filter-box" ref={priceDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                  className={`price-filter-btn ${isPriceActive ? "is-active" : ""}`}
                  title="Filter by Price Range"
                >
                  <IndianRupee size={15} />
                  <span>
                    {isPriceActive
                      ? `₹${priceRange[0].toLocaleString("en-IN")} – ₹${priceRange[1].toLocaleString("en-IN")}`
                      : "Price Range"}
                  </span>
                  <ChevronDown 
                    size={14} 
                    style={{ 
                      transform: isPriceDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", 
                      transition: "transform 0.25s ease" 
                    }} 
                  />
                </button>

                {isPriceDropdownOpen && (
                  <div className="price-dropdown-card">
                    <div className="price-dropdown-card__header">
                      <span className="price-dropdown-card__title">Pricing Range</span>
                      {isPriceActive && (
                        <button 
                          type="button" 
                          onClick={resetPriceFilter}
                          className="price-dropdown-card__reset"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    {/* Quick Presets */}
                    <div className="price-presets">
                      {pricePresets.map((preset) => {
                        const isPresetSelected =
                          tempPriceRange[0] === preset.min &&
                          tempPriceRange[1] === preset.max;

                        return (
                          <button
                            key={preset.label}
                            type="button"
                            className={`price-preset-pill ${isPresetSelected ? "is-active" : ""}`}
                            onClick={() => {
                              setTempPriceRange([preset.min, preset.max]);
                              applyPriceFilter(preset.min, preset.max);
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Slider */}
                    <div className="price-slider-wrap">
                      <div className="price-slider-labels">
                        <span>₹{tempPriceRange[0].toLocaleString("en-IN")}</span>
                        <span className="price-slider-max">Up to ₹{tempPriceRange[1].toLocaleString("en-IN")}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={maxPossiblePrice}
                        step={500}
                        value={tempPriceRange[1]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTempPriceRange([tempPriceRange[0], Math.max(tempPriceRange[0], val)]);
                        }}
                        className="price-slider"
                      />
                    </div>

                    {/* Inputs Row */}
                    <div className="price-inputs-row">
                      <div className="price-input-group">
                        <span className="price-input-label">Min</span>
                        <div className="price-input-box">
                          <span>₹</span>
                          <input
                            type="number"
                            min={0}
                            max={tempPriceRange[1]}
                            step={500}
                            value={tempPriceRange[0]}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setTempPriceRange([Math.max(0, val), tempPriceRange[1]]);
                            }}
                          />
                        </div>
                      </div>
                      <span className="price-inputs-dash">–</span>
                      <div className="price-input-group">
                        <span className="price-input-label">Max</span>
                        <div className="price-input-box">
                          <span>₹</span>
                          <input
                            type="number"
                            min={tempPriceRange[0]}
                            max={maxPossiblePrice}
                            step={500}
                            value={tempPriceRange[1]}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setTempPriceRange([tempPriceRange[0], Math.max(tempPriceRange[0], val)]);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      type="button"
                      onClick={() => applyPriceFilter(tempPriceRange[0], tempPriceRange[1])}
                      className="price-apply-btn"
                    >
                      Apply Range
                    </button>
                  </div>
                )}
              </div>

              {/* Sort Box */}
              <div className="sort-box">
                <SlidersHorizontal size={16} className="sort-box__icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-box__select"
                >
                  <option value="default">Default Sort</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(activeSubcategory || isPriceActive) && (
          <div className="active-filters-bar">
            {activeSubcategory && (
              <div className="active-filter-chip">
                <span>Subcategory: <strong>{activeSubcategory}</strong></span>
                <button 
                  onClick={() => {
                    setActiveSubcategory(null);
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("sub");
                    router.push(`/collection?${params.toString()}`);
                  }}
                  className="active-filter-chip__clear"
                  title="Clear Subcategory Filter"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            {isPriceActive && (
              <div className="active-filter-chip">
                <span>Price: <strong>₹{priceRange[0].toLocaleString("en-IN")} – ₹{priceRange[1].toLocaleString("en-IN")}</strong></span>
                <button 
                  onClick={resetPriceFilter}
                  className="active-filter-chip__clear"
                  title="Clear Price Filter"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="catalog-empty text-center">
            <h3>No items found</h3>
            <p>We couldn't find any products matching your active filters. Try adjusting your price range or category tabs.</p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setActiveSubcategory(null);
                resetPriceFilter();
                router.push("/collection");
              }}
              className="catalog-empty__btn"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <motion.div 
            className="product-grid"
            layout
          >
            <AnimatePresence mode="popLayout">
              {sortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layoutId={`product-${product.id}`}
                  className="product-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Image wrapper */}
                  <div className="product-card__image-box" onClick={() => router.push(`/product/${product.id}`)}>
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="product-card__img"
                    />
                    <div className="product-card__overlay" />
                    <span className="product-card__badge">{product.badge}</span>
                    
                    {/* Hover Actions */}
                    <div className="product-card__actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className={`action-btn ${isFavorited(product.id) ? "is-active" : ""}`}
                        onClick={() => toggleWishlist(product)}
                        title="Add to Wishlist"
                      >
                        <Heart size={18} fill={isFavorited(product.id) ? "var(--color-primary)" : "none"} />
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => router.push(`/product/${product.id}`)}
                        title="View Details"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="product-card__info">
                    <span className="product-card__category">{product.subcategory}</span>
                    <h3 className="product-card__title" onClick={() => router.push(`/product/${product.id}`)}>
                      {product.title}
                    </h3>
                    
                    <div className="product-card__meta">
                      <span className="price">₹{product.price.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>



    </section>
  );
}
