"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useStore, Product } from "@/store/useStore";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Share2,
  CheckCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  Check,
  MessageCircle,
  Play,
  Copy,
  AlertCircle,
  Scissors,
  Palette,
  Clock,
  Send,
  X
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import "./ProductDetail.scss";

// ── Mock Additional Saree Assets ──
const galleryImagesMap: Record<string, string[]> = {
  "1": [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", // main
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop", // fabric zoom
    "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop", // weaving zoom
    "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop"  // border zoom
  ],
  "2": [
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop"
  ],
  "3": [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop"
  ]
};



// FBT Bundle Accessories
const bundleAccessories = [
  { id: "101", title: "Zardozi Raw Silk Blouse", price: 2499, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=150&auto=format&fit=crop" },
  { id: "102", title: "Organza Gota Patti Dupatta", price: 1499, image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=150&auto=format&fit=crop" }
];

export default function ProductDetails({ initialProduct }: { initialProduct?: Product | null }) {
  const params = useParams();
  const router = useRouter();

  // Unwrap ID param
  const rawId = params?.id;
  const productId = (rawId as string) || "1";

  // Zustand Store Hooks
  const products = useStore((state) => state.products);
  const wishlist = useStore((state) => state.wishlist);
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);

  // Get active product based on ID (fallback to first product if not found)
  const matchedProduct = initialProduct || products.find((p) => String(p.id) === String(productId)) || products[0];
  const [activeProduct, setActiveProduct] = useState<Product>(matchedProduct);

  // UI States
  const [activeImage, setActiveImage] = useState<string>("");
  const [activeThumbIndex, setActiveThumbIndex] = useState<number>(0);
  const [activeSize, setActiveSize] = useState<string>("Standard Drape (5.5m + Blouse)");
  const [activeFabric, setActiveFabric] = useState<string>("Premium Katan Silk");
  const [qty, setQty] = useState<number>(1);
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  // Interactive Zoom State
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);


  // Video Modal
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Sticky Buy Bar on Scroll
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const buyButtonRef = useRef<HTMLDivElement>(null);

  // Share dropdown
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [whatsappShareUrl, setWhatsappShareUrl] = useState<string>("#");

  // Bespoke Customization Form States (6 Sections)
  const [selectedCustomFabric, setSelectedCustomFabric] = useState<string>("");
  const [customColor, setCustomColor] = useState<string>("");
  const [selectedCustomBudget, setSelectedCustomBudget] = useState<string>("");
  const [customBudgetValue, setCustomBudgetValue] = useState<string>("");
  const [selectedAemroduri, setSelectedAemroduri] = useState<string>("");
  const [selectedTassels, setSelectedTassels] = useState<string>("Yes");
  const [timeEstimate, setTimeEstimate] = useState<number>(12);
  const [timeEstimateError, setTimeEstimateError] = useState<string | null>(null);
  const [customizerName, setCustomizerName] = useState<string>("");
  const [customizerEmail, setCustomizerEmail] = useState<string>("");
  const [customizerPhone, setCustomizerPhone] = useState<string>("");
  const [customizerNotes, setCustomizerNotes] = useState<string>("");
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [customSubmitSuccess, setCustomSubmitSuccess] = useState(false);
  const [customSubmitError, setCustomSubmitError] = useState<string | null>(null);
  const [customRequestId, setCustomRequestId] = useState<string | null>(null);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const customizationPanelRef = useRef<HTMLElement | null>(null);

  // Time estimate validation handler (cap <= 60 months)
  const handleTimeEstimateChange = (val: string | number) => {
    const num = Number(val);
    setTimeEstimate(num);
    if (isNaN(num) || num <= 0) {
      setTimeEstimateError("Please enter a valid timeline (minimum 1 month).");
    } else if (num > 60) {
      setTimeEstimateError("Time estimate cannot exceed 60 months.");
    } else {
      setTimeEstimateError(null);
    }
  };

  useEffect(() => {
    if (isCustomizationOpen && customizationPanelRef.current) {
      customizationPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isCustomizationOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const href = window.location.href;
    const fabricsText = (activeProduct.fabrics || []).join(", ");
    const featuresText = (activeProduct.features || []).join(" | ");
    const priceFormatted = activeProduct.price ? activeProduct.price.toLocaleString("en-IN") : "0";
    const mrpFormatted = activeProduct.price ? (activeProduct.price / 0.6).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0";

    const text = `✨ *Designs of Dreams (DOD)* ✨
Premium Handcrafted Indian Ethnic Wear — Direct from Artisans to You.

━━━━━━━━━━━━━━━━━━

🛍️ *${activeProduct.title}*
${activeProduct.subtitle || ""}

${activeProduct.desc || ""}

💰 *Price:* ₹${priceFormatted} (MRP ₹${mrpFormatted} — *40% OFF*)
🏷️ *Category:* ${activeProduct.category || "Saree"} — ${activeProduct.subcategory || ""}
🧵 *Fabric:* ${fabricsText}
⭐ *Rating:* ${activeProduct.rating || 5}/5 (142 reviews)
✅ *Features:* ${featuresText}

👉 *View Product:* ${href}

━━━━━━━━━━━━━━━━━━

📂 *Browse Our Collections:*
🔹 Sarees → ${origin}/collection?category=Saree
🔹 Kurtis → ${origin}/collection?category=Kurti
🔹 Blouses → ${origin}/collection?category=Blouse
🔹 Dupattas → ${origin}/collection?category=Dupatta
🔹 Full Catalog → ${origin}/collection

━━━━━━━━━━━━━━━━━━

🏠 *About DOD Shop:*
Designs of Dreams is a premium Indian ethnic wear brand specializing in authentic handloom Banarasi sarees, Lucknow Chikankari kurtis, and designer blouses. Every piece is handcrafted by master artisans from Varanasi, Lucknow, and Jaipur — preserving centuries-old weaving traditions. We offer Silk Mark certified products, free express shipping, and 7-day easy returns.

🌐 *Visit:* ${origin}
`;
    setWhatsappShareUrl(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
  }, [activeProduct]);

  // FBT checkbox states
  const [includeBlouse, setIncludeBlouse] = useState(true);
  const [includeDupatta, setIncludeDupatta] = useState(true);

  // Database Related Products State
  const [dbRelatedProducts, setDbRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchDbProducts() {
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(activeProduct.category)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            const mapped: Product[] = data.products
              .filter((p: any) => String(p.id) !== String(activeProduct.id))
              .map((p: any) => ({
                id: String(p.id),
                title: p.name || p.title,
                subtitle: p.subCategory || p.subcategory || activeProduct.category,
                category: p.category?.name || p.category || activeProduct.category,
                subcategory: p.subCategory || p.subcategory || "Handloom",
                desc: p.description || p.desc || "",
                longDesc: p.description || p.longDesc || "",
                price: Number(p.sellingPrice || p.price || 9999),
                image: (p.images && p.images[0]) || p.image || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
                badge: p.featured ? "Featured" : p.bestSeller ? "Best Seller" : "Artisanal Craft",
                fabrics: p.fabric ? [p.fabric] : (p.fabrics || ["Silk"]),
                features: p.features || ["Silk Mark Certified"],
                sizes: p.sizes || ["One Size"],
                rating: Number(p.rating || 4.8)
              }));

            if (isMounted && mapped.length > 0) {
              setDbRelatedProducts(mapped);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("DB products fetch fallback:", err);
      }
    }

    fetchDbProducts();
    return () => { isMounted = false; };
  }, [activeProduct]);

  // Synchronize state when product switches
  useEffect(() => {
    if (matchedProduct) {
      setActiveProduct(matchedProduct);
      const images = (matchedProduct as any).images && (matchedProduct as any).images.length > 0
        ? (matchedProduct as any).images
        : (galleryImagesMap[matchedProduct.id] || galleryImagesMap["1"]);
      setActiveImage(images[0]);
      setActiveThumbIndex(0);
      setActiveFabric(((matchedProduct as any).fabric || matchedProduct.fabrics?.[0] || "Premium Katan Silk").trim());
      if (matchedProduct.category === "Saree") {
        setActiveSize("Standard Drape (5.5m + Blouse)");
      } else {
        setActiveSize(matchedProduct.sizes[0] || "M");
      }

      // Initialize Bespoke Customization selections from product config
      const cfg = (matchedProduct as any).customizationConfig;
      if (cfg) {
        if (Array.isArray(cfg.fabrics) && cfg.fabrics.length > 0) {
          setSelectedCustomFabric(cfg.fabrics[0]);
        } else {
          setSelectedCustomFabric("Pure Mulberry Silk");
        }
        if (Array.isArray(cfg.budgetRanges) && cfg.budgetRanges.length > 0) {
          setSelectedCustomBudget(cfg.budgetRanges[0]);
        } else {
          setSelectedCustomBudget("₹10,000 – ₹20,000");
        }
        const activeTypes = Array.isArray(cfg.aemroduriTypes)
          ? cfg.aemroduriTypes.filter((a: any) => a.active !== false)
          : [];
        if (activeTypes.length > 0) {
          setSelectedAemroduri(activeTypes[0].name);
        } else {
          setSelectedAemroduri("Zardozi Handwork");
        }
        setSelectedTassels(cfg.allowTassels !== false ? "Yes" : "No");
        setTimeEstimate(12);
        setTimeEstimateError(null);
      }
    }
  }, [productId, matchedProduct]);

  // Scroll detection for sticky actions
  useEffect(() => {
    const handleScroll = () => {
      if (buyButtonRef.current) {
        const rect = buyButtonRef.current.getBoundingClientRect();
        // Visible when buy buttons are scrolled out of view
        setIsStickyVisible(rect.top < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const productImages = useMemo(() => {
    if ((activeProduct as any).images && (activeProduct as any).images.length > 0) {
      const validImages = (activeProduct as any).images.filter((img: any) => typeof img === 'string' && img.trim() !== '');
      if (validImages.length > 0) {
        return validImages;
      }
    }
    return galleryImagesMap[activeProduct.id] || galleryImagesMap["1"];
  }, [activeProduct]);

  // Hover Zoom Coordinates logic
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  }, []);

  // Add to Cart handler
  const handleAddCart = useCallback(() => {
    addToCart(activeProduct, qty, activeSize);
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2000);
  }, [addToCart, activeProduct, qty, activeSize]);

  // Buy Now handler
  const handleBuyNow = useCallback(() => {
    addToCart(activeProduct, qty, activeSize);
    router.push("/cart");
  }, [addToCart, activeProduct, qty, activeSize, router]);

  // Wishlist handler
  const isFavorited = useMemo(() => wishlist.some((item) => item.id === activeProduct.id), [wishlist, activeProduct.id]);
  const handleWishlistToggle = useCallback(() => {
    toggleWishlist(activeProduct);
  }, [toggleWishlist, activeProduct]);

  // Bespoke Customization Form Submit Handler
  const handleCustomizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomSubmitError(null);

    const cfg = (activeProduct as any).customizationConfig;
    const availableFabrics = cfg?.fabrics || ["Silk", "Cotton", "Linen", "Organza", "Georgette"];
    const effectiveFabric = selectedCustomFabric || availableFabrics[0];

    if (!effectiveFabric) {
      setCustomSubmitError("Please select a fabric option.");
      return;
    }

    if (!customColor.trim()) {
      setCustomSubmitError("Please enter your desired color (e.g. Royal Blue).");
      return;
    }

    const effectiveBudgetRange = selectedCustomBudget || "₹10,000 – ₹20,000";
    const finalBudget = effectiveBudgetRange === "Custom Budget" && customBudgetValue.trim()
      ? customBudgetValue.trim()
      : effectiveBudgetRange;

    if (!finalBudget) {
      setCustomSubmitError("Please select or enter your preferred budget.");
      return;
    }

    const availableEmbs = cfg?.aemroduriTypes
      ? cfg.aemroduriTypes.filter((a: any) => a.active !== false).map((a: any) => a.name)
      : ["Zardozi Handwork", "Aari Needlework", "Gota Patti Motifs", "Lucknowi Chikankari"];
    const effectiveAemroduri = selectedAemroduri || availableEmbs[0];

    if (!effectiveAemroduri) {
      setCustomSubmitError("Please select an Aemroduri (embroidery) type.");
      return;
    }

    if (selectedTassels !== "Yes" && selectedTassels !== "No") {
      setCustomSubmitError("Please select Yes or No for tassels.");
      return;
    }

    const months = Number(timeEstimate);
    if (isNaN(months) || months < 1 || months > 60) {
      setTimeEstimateError("Time estimate cannot exceed 60 months.");
      setCustomSubmitError("Time estimate must be between 1 and 60 months.");
      return;
    }

    setIsSubmittingCustom(true);
    try {
      const res = await fetch("/api/customizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: activeProduct.id,
          fabric: effectiveFabric,
          color: customColor.trim(),
          budget: finalBudget,
          aemroduriType: effectiveAemroduri,
          tassels: selectedTassels,
          timeEstimateMonths: months,
          customerName: customizerName.trim() || "Valued Patron",
          customerEmail: customizerEmail.trim() || "",
          customerPhone: customizerPhone.trim() || "",
          notes: customizerNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCustomSubmitSuccess(true);
        setCustomRequestId(data.request?.id ? String(data.request.id).slice(0, 8).toUpperCase() : `REQ-${Date.now().toString().slice(-6)}`);
      } else {
        setCustomSubmitError(data.error || "Failed to submit customization request. Please check inputs.");
      }
    } catch {
      setCustomSubmitError("Network connection error. Please try again.");
    } finally {
      setIsSubmittingCustom(false);
    }
  };



  // Copy product URL link
  const handleShareClick = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      setShowShareTooltip(false);
    }, 2000);
  }, []);




  // Math totals for Frequently Bought Together
  const fbtTotalPrice = useMemo(() => activeProduct.price + (includeBlouse ? 2499 : 0) + (includeDupatta ? 1499 : 0), [activeProduct.price, includeBlouse, includeDupatta]);
  const fbtOriginalPrice = useMemo(() => {
    const mainOriginalPrice = (activeProduct as any).mrp || (activeProduct.price / 0.6);
    return mainOriginalPrice + (includeBlouse ? 3999 : 0) + (includeDupatta ? 2499 : 0);
  }, [activeProduct, includeBlouse, includeDupatta]);

  const handleFbtCheckout = () => {
    addToCart(activeProduct, 1, activeSize);
    if (includeBlouse) {
      const mockBlouse: Product = {
        id: "101",
        title: "Zardozi Raw Silk Blouse",
        subtitle: "Custom Atelier Designer Blouse",
        category: "Blouse",
        subcategory: "Custom",
        desc: "Elaborately hand-embroidered custom designer blouse.",
        longDesc: "Elaborately hand-embroidered custom designer blouse.",
        price: 2499,
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
        badge: "Co-ord Set",
        fabrics: ["Raw Silk"],
        features: ["Zardozi embroidery"],
        sizes: ["38"],
        rating: 4.8
      };
      addToCart(mockBlouse, 1, "38");
    }
    if (includeDupatta) {
      const mockDupatta: Product = {
        id: "102",
        title: "Organza Gota Patti Dupatta",
        subtitle: "Luxury Gota Border Stole",
        category: "Dupatta",
        subcategory: "Light",
        desc: "Organza dupatta featuring handcrafted shimmering Gota Patti borders.",
        longDesc: "Organza dupatta featuring handcrafted shimmering Gota Patti borders.",
        price: 1499,
        image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop",
        badge: "Co-ord Set",
        fabrics: ["Organza"],
        features: ["Gota Patti"],
        sizes: ["One Size"],
        rating: 4.7
      };
      addToCart(mockDupatta, 1, "One Size");
    }
    router.push("/cart");
  };



  // FAQ data
  const faqData = useMemo(() => [
    {
      q: "How can I verify the authenticity of the silk and handloom weave?",
      a: "All our sarees carry the official Indian government-backed Silk Mark Certification tag, verifying the use of 100% pure natural silk warp and weft. You can verify the serial number on the Silk Mark India database. In addition, our sarees are accompanied by our Peeli Kothi workshop certificate of handloom authenticity."
    },
    {
      q: "What does unstitched blouse piece mean?",
      a: "Each saree order contains an additional 0.8-meter matching raw silk or brocade running blouse fabric. It is attached to the end of the saree. You can cut it off and get it stitched as per your design. If you choose our 'Custom Tailored Blouse' sizing option, we will tailor the blouse to your sizes before dispatching."
    },
    {
      q: "What is your recommended storage and care routine?",
      a: "We highly recommend professional dry cleaning only. To preserve the lustre of genuine silver or gold zari thread layers, store the saree folded individually inside a breathable, pure cotton muslin cover. Refold the saree along different lines every few months to prevent fiber creasing."
    }
  ], []);

  return (
    <main className="product-detail-page theme-dod relative pt-25">
      <div className="decorative-jali" />

      {/* ── STICKY TOP ACTIONS BAR (Desktop scroll reveal) ── */}
      <div className={`sticky-top-bar ${isStickyVisible ? "is-visible" : ""}`}>
        <div className="sticky-bar-container">
          <div className="sticky-product-info">
            <div className="sticky-thumb">
              <Image src={activeImage || productImages[0]} alt={activeProduct.title} fill style={{ objectFit: "cover" }} />
            </div>
            <div className="sticky-meta">
              <h4 className="sticky-title">{activeProduct.title}</h4>
              <span className="sticky-price">₹{activeProduct.price.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="sticky-actions">
            <button className="btn-luxury btn-cart" onClick={handleAddCart} style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
              Add to Bag
            </button>
            <button className="btn-luxury btn-buy" onClick={handleBuyNow} style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN DETAIL GRID ── */}
      <div className="product-main-container">

        {/* 1. Product Gallery Section */}
        <div className="gallery-wrapper">
          <div className="thumbnails-slider">
            {productImages.map((img: string, idx: number) => (
              <div
                key={idx}
                className={`thumb-card ${activeThumbIndex === idx ? "is-active" : ""}`}
                onClick={() => {
                  setActiveThumbIndex(idx);
                  setActiveImage(img);
                }}
              >
                <Image src={img} alt={`${activeProduct.title} detail ${idx + 1}`} fill style={{ objectFit: "cover" }} />
              </div>
            ))}

            {/* Video Thumbnail Trigger */}
            <div className="thumb-card" onClick={() => setShowVideoModal(true)}>
              <Image src={productImages[0]} alt="Video Thumbnail" fill style={{ objectFit: "cover" }} />
              <div className="thumb-icon-overlay">
                <Play size={20} fill="white" />
              </div>
            </div>
          </div>

          <div
            className="main-viewport"
            ref={mainImageRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => {
              setIsZoomed(false);
              setZoomPos({ x: 0, y: 0 });
            }}
          >
            <span className="gallery-overlay-badge">{activeProduct.badge}</span>

            {/* Standard Zoomable Main Viewport */}
            <div className="main-image-container">
              <Image
                src={activeImage || productImages[0]}
                alt={activeProduct.title}
                fill
                style={{
                  objectFit: "cover",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZoomed && !isTouchDevice ? "scale(1.8)" : "scale(1)"
                }}
                priority
              />
            </div>

            <div className="gallery-controls-360">
              <button className="control-btn" onClick={() => setShowVideoModal(true)} title="Watch Craftsmanship Video">
                <Play size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Product Information & Purchase column */}
        <div className="info-wrapper">
          <div className="info-header">
            <h1 className="product-title">{activeProduct.title}</h1>
          </div>

          <div className="pricing-block">
            <div className="price-row">
              <span className="current-price">₹{activeProduct.price.toLocaleString("en-IN")}</span>
              <span className="original-price">₹{((activeProduct as any).mrp || (activeProduct.price / 0.6)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              <span className="discount-badge">
                {(activeProduct as any).discountPercent !== undefined
                  ? `${(activeProduct as any).discountPercent}%`
                  : '40%'} OFF
              </span>
            </div>
            <p className="tax-info">Inclusive of all local goods and services taxes (GST @ 5%).</p>
          </div>

          <div className="stock-alert">
            <Sparkles size={16} />
            <span>Exclusive Heritage Loom: Only 2 pieces currently left in Varanasi showroom.</span>
          </div>

          {/* 3. Variant Selection */}
          <div className="variant-section">
            <div>
              <div className="variant-title">Weave / Fabric Type</div>
              <div className="fabric-options">
                {activeProduct.fabrics.map((fb) => {
                  const cleanFb = fb.trim();
                  return (
                    <button
                      key={cleanFb}
                      className={`option-btn ${activeFabric === cleanFb ? "is-active" : ""}`}
                      onClick={() => setActiveFabric(cleanFb)}
                    >
                      {cleanFb}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Purchase Actions */}
          <div className="purchase-block" ref={buyButtonRef}>
            <div className="qty-row">
              <span className="qty-label">Quantity:</span>
              <div className="qty-selector">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
                <span aria-live="polite">{qty}</span>
                <button onClick={() => setQty(qty + 1)} aria-label="Increase quantity">+</button>
              </div>
            </div>

            <div className="cta-buttons">
              <button
                className="btn-luxury btn-cart"
                onClick={handleAddCart}
                disabled={addSuccess}
              >
                {addSuccess ? (
                  <>
                    In Bag <Check size={18} />
                  </>
                ) : (
                  <>
                    Add to Bag <ShoppingBag size={18} />
                  </>
                )}
              </button>
              <button className="btn-luxury btn-buy" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>

            <div className="secondary-actions">
              <button className={`action-link ${isFavorited ? "is-active" : ""}`} onClick={handleWishlistToggle}>
                <Heart size={16} fill={isFavorited ? "var(--primary)" : "none"} />
                {isFavorited ? "Saved in Wishlist" : "Save to Wishlist"}
              </button>

              <div style={{ position: "relative" }}>
                <button className="action-link" onClick={() => setShowShareTooltip(!showShareTooltip)}>
                  <Share2 size={16} />
                  Share Masterpiece
                </button>

                {showShareTooltip && (
                  <div style={{
                    position: "absolute",
                    bottom: "35px",
                    right: 0,
                    background: "black",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 20,
                    whiteSpace: "nowrap"
                  }}>
                    <span style={{ fontSize: "0.75rem" }}>{shareSuccess ? "Copied!" : "Copy Link:"}</span>
                    <button
                      onClick={handleShareClick}
                      style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bespoke Customization Accordion */}
            {Boolean(
              (activeProduct as any).customizationConfig?.enabled ||
              (activeProduct as any).customizationConfig?.fabrics?.length > 0
            ) && (
              <div className="bespoke-customization-accordion">
                <button
                  type="button"
                  className={`bespoke-accordion-header ${isCustomizationOpen ? "is-open" : ""}`}
                  onClick={() => setIsCustomizationOpen((open) => !open)}
                  aria-expanded={isCustomizationOpen}
                >
                  <div className="bespoke-accordion-left">
                    <Sparkles size={18} className="bespoke-accordion-icon" />
                    <div>
                      <strong>Bespoke Couture Customization</strong>
                      <span>Choose Fabric, Custom Color, Budget, Aemroduri & Timeline</span>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`bespoke-accordion-chevron ${isCustomizationOpen ? "is-open" : ""}`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {Boolean(
        (activeProduct as any).customizationConfig?.enabled ||
        (activeProduct as any).customizationConfig?.fabrics?.length > 0
      ) && isCustomizationOpen && (
        <section
          ref={customizationPanelRef}
          className="bespoke-customization-section is-accordion is-fullwidth"
        >
          <div className="customization-container">
                    {customSubmitSuccess ? (
                      <div className="customization-success-card">
                        <div className="success-icon">
                          <CheckCircle size={44} />
                        </div>
                        <h3>Bespoke Request Confirmed</h3>
                        <p>
                          Thank you! Your artisanal customization request has been placed in our atelier queue
                          {customRequestId ? <> with reference ID: <strong>{customRequestId}</strong></> : null}.
                        </p>
                        <div className="summary-tags">
                          <div className="tag-row"><span>Fabric:</span> <strong>{selectedCustomFabric || ((activeProduct as any).customizationConfig?.fabrics?.[0] || "Pure Silk")}</strong></div>
                          <div className="tag-row"><span>Color:</span> <strong>{customColor || "—"}</strong></div>
                          <div className="tag-row"><span>Budget:</span> <strong>{selectedCustomBudget === "Custom Budget" && customBudgetValue ? customBudgetValue : (selectedCustomBudget || "₹10,000 – ₹20,000")}</strong></div>
                          <div className="tag-row"><span>Aemroduri:</span> <strong>{selectedAemroduri || "Zardozi Handwork"}</strong></div>
                          <div className="tag-row"><span>Tassels:</span> <strong>{selectedTassels}</strong></div>
                          <div className="tag-row"><span>Timeline:</span> <strong>{timeEstimate} Months</strong></div>
                        </div>
                        <button
                          type="button"
                          className="btn-reset"
                          onClick={() => {
                            setCustomSubmitSuccess(false);
                            setCustomColor("");
                            setCustomBudgetValue("");
                            setCustomizerNotes("");
                          }}
                        >
                          Customize Another Piece
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleCustomizationSubmit} className="customization-form">
                        <div className="customization-header accordion-form-intro">
                          <div className="badge-wrapper">
                            <Sparkles size={14} />
                            <span>Haute Couture Atelier</span>
                          </div>
                          <h2 className="serif-font">Customize Your Weave</h2>
                          <p className="customization-subtitle">
                            Create a one-of-a-kind masterpiece tailored to your fabric, color, embroidery, and budget. Handcrafted by Varanasi and Lucknow artisans.
                          </p>
                        </div>

                        <div className="customization-grid">
                          <div className="custom-card">
                            <div className="card-heading">
                              <span className="step-badge">1</span>
                              <div>
                                <h4>Select Fabric</h4>
                                <span className="card-sub">Artisanal handloom textiles</span>
                              </div>
                            </div>
                            <div className="options-chip-group">
                              {((activeProduct as any).customizationConfig?.fabrics || [
                                "Pure Silk", "Chanderi Silk", "Organza", "Linen", "Georgette"
                              ]).map((fab: string) => {
                                const isSel = (selectedCustomFabric === fab) || (!selectedCustomFabric && fab === ((activeProduct as any).customizationConfig?.fabrics?.[0] || "Pure Silk"));
                                return (
                                  <button
                                    key={fab}
                                    type="button"
                                    onClick={() => setSelectedCustomFabric(fab)}
                                    className={`chip-btn ${isSel ? "is-selected" : ""}`}
                                  >
                                    {fab}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="custom-card">
                            <div className="card-heading">
                              <span className="step-badge">2</span>
                              <div>
                                <h4>Color Preference</h4>
                                <span className="card-sub">Enter your desired shade</span>
                              </div>
                            </div>
                            <div className="color-input-wrapper">
                              <input
                                type="text"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                placeholder={(activeProduct as any).customizationConfig?.colorPlaceholder || "e.g. Royal Blue, Rani Pink, Emerald"}
                                className="custom-text-input"
                                required
                              />
                              <span className="hint-text">You can also mention Pantones or traditional hues like Gulabi, Jamuni, Firozi.</span>
                            </div>
                          </div>

                          <div className="custom-card">
                            <div className="card-heading">
                              <span className="step-badge">3</span>
                              <div>
                                <h4>Price / Budget Range</h4>
                                <span className="card-sub">Select or define allocation</span>
                              </div>
                            </div>
                            <div className="options-chip-group">
                              {((activeProduct as any).customizationConfig?.budgetRanges || [
                                "₹5,000 – ₹10,000", "₹10,000 – ₹20,000", "₹20,000 – ₹50,000", "Custom Budget"
                              ]).map((b: string) => {
                                const isSel = (selectedCustomBudget === b) || (!selectedCustomBudget && b === ((activeProduct as any).customizationConfig?.budgetRanges?.[0] || "₹10,000 – ₹20,000"));
                                return (
                                  <button
                                    key={b}
                                    type="button"
                                    onClick={() => setSelectedCustomBudget(b)}
                                    className={`chip-btn ${isSel ? "is-selected" : ""}`}
                                  >
                                    {b}
                                  </button>
                                );
                              })}
                            </div>
                            {selectedCustomBudget === "Custom Budget" && (
                              <div className="custom-budget-input-wrapper">
                                <input
                                  type="text"
                                  value={customBudgetValue}
                                  onChange={(e) => setCustomBudgetValue(e.target.value)}
                                  placeholder="Specify budget (e.g. ₹75,000)"
                                  className="custom-text-input"
                                  required
                                />
                              </div>
                            )}
                          </div>

                          <div className="custom-card">
                            <div className="card-heading">
                              <span className="step-badge">4</span>
                              <div>
                                <h4>Types of Aemroduri</h4>
                                <span className="card-sub">Handcrafted embellishment</span>
                              </div>
                            </div>
                            <div className="options-chip-group">
                              {(((activeProduct as any).customizationConfig?.aemroduriTypes?.filter((a: any) => a.active !== false).map((a: any) => a.name)) || [
                                "Zardozi Handwork", "Aari Needlework", "Gota Patti Motifs", "Lucknowi Chikankari"
                              ]).map((emb: string) => {
                                const isSel = (selectedAemroduri === emb) || (!selectedAemroduri && emb === (((activeProduct as any).customizationConfig?.aemroduriTypes?.[0]?.name) || "Zardozi Handwork"));
                                return (
                                  <button
                                    key={emb}
                                    type="button"
                                    onClick={() => setSelectedAemroduri(emb)}
                                    className={`chip-btn ${isSel ? "is-selected" : ""}`}
                                  >
                                    {emb}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="custom-card">
                            <div className="card-heading">
                              <span className="step-badge">5</span>
                              <div>
                                <h4>Tassels / Latkans</h4>
                                <span className="card-sub">Pallu edge ornamentation</span>
                              </div>
                            </div>
                            <div className="tassels-selector">
                              <button type="button" onClick={() => setSelectedTassels("Yes")} className={`tassel-pill ${selectedTassels === "Yes" ? "is-selected" : ""}`}>
                                <span className="dot" />
                                <span>Include Handcrafted Tassels (Yes)</span>
                              </button>
                              <button type="button" onClick={() => setSelectedTassels("No")} className={`tassel-pill ${selectedTassels === "No" ? "is-selected" : ""}`}>
                                <span className="dot" />
                                <span>Standard Hemming (No)</span>
                              </button>
                            </div>
                          </div>

                          <div className="custom-card">
                            <div className="card-heading">
                              <span className="step-badge">6</span>
                              <div>
                                <h4>Time Estimate</h4>
                                <span className="card-sub">Required weaving & craft timeline</span>
                              </div>
                            </div>
                            <div className="time-input-block">
                              <div className="time-display-row">
                                <label>Required Time Estimate (in months)</label>
                                <div className="number-stepper">
                                  <input
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={timeEstimate}
                                    onChange={(e) => handleTimeEstimateChange(e.target.value)}
                                    className={`time-input ${timeEstimate > 60 ? "input-error" : ""}`}
                                  />
                                  <span className="unit-label">Months</span>
                                </div>
                              </div>
                              <input
                                type="range"
                                min={1}
                                max={60}
                                value={Math.min(60, Math.max(1, timeEstimate))}
                                onChange={(e) => handleTimeEstimateChange(e.target.value)}
                                className="time-slider"
                              />
                              <div className="slider-labels">
                                <span>1 Month (Express)</span>
                                <span className="max-tag">Max: 60 Months</span>
                              </div>
                              {timeEstimateError && (
                                <div className="validation-alert">
                                  <AlertCircle size={14} />
                                  <span>{timeEstimateError}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="custom-contact-block">
                          <div className="contact-heading">
                            <h4>Patron & Delivery Information</h4>
                            <p>Our senior atelier stylist will reach out to review swatches and confirm your weave draft.</p>
                          </div>
                          <div className="contact-inputs-grid">
                            <input type="text" placeholder="Your Full Name *" value={customizerName} onChange={(e) => setCustomizerName(e.target.value)} className="custom-text-input" required />
                            <input type="email" placeholder="Your Email Address *" value={customizerEmail} onChange={(e) => setCustomizerEmail(e.target.value)} className="custom-text-input" required />
                            <input type="tel" placeholder="Phone / WhatsApp Number *" value={customizerPhone} onChange={(e) => setCustomizerPhone(e.target.value)} className="custom-text-input" required />
                          </div>
                          <div className="notes-wrapper">
                            <label className="input-label">Special Requests / Weave Customization Notes</label>
                            <textarea
                              rows={3}
                              placeholder="Add motif details, blouse measurements, zari density, or wedding date deadlines..."
                              value={customizerNotes}
                              onChange={(e) => setCustomizerNotes(e.target.value)}
                              className="custom-textarea"
                            />
                          </div>
                          {customSubmitError && (
                            <div className="submission-error-alert">
                              <AlertCircle size={16} />
                              <span>{customSubmitError}</span>
                            </div>
                          )}
                          <div className="submit-row">
                            <button type="submit" disabled={isSubmittingCustom || timeEstimate > 60 || timeEstimate < 1} className="btn-submit-custom">
                              {isSubmittingCustom ? "Submitting Request..." : "Request Bespoke Customization"}
                            </button>
                            <p className="guarantee-text">
                              <ShieldCheck size={16} />
                              <span>100% Authentic Handloom Certification & Dedicated Stylist Guarantee</span>
                            </p>
                          </div>
                        </div>
                      </form>
                    )}
          </div>
        </section>
      )}

      {/* ── 5. Trust Badge Strip ── */}
      <section className="trust-strip">
        <div className="trust-container">
          <div className="trust-card">
            <div className="trust-icon"><ShieldCheck size={20} /></div>
            <h4>Secure Payments</h4>
            <p>256-Bit SSL protection</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon"><RotateCcw size={20} /></div>
            <h4>Easy Returns</h4>
            <p>7-day hassle-free swap</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon"><Truck size={20} /></div>
            <h4>Free Shipping</h4>
            <p>Free domestic delivery</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon"><CheckCircle size={20} /></div>
            <h4>Silk Mark Certified</h4>
            <p>100% pure mulberry silk</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon"><Sparkles size={20} /></div>
            <h4>Authentic Handloom</h4>
            <p>Generational Varanasi weaving</p>
          </div>
        </div>
      </section>


      {/* ── 7, 8, 9. Highlights & Spec Section ── */}
      <section className="details-tab-section">
        <div className="description-box">
          <h2 className="serif-font text-2xl mb-4">The Craftsmanship Story</h2>
          <div className={`expandable-desc ${isDescExpanded ? "is-expanded" : ""}`} style={{ maxHeight: "140px" }}>
            {activeProduct.longDesc || activeProduct.desc || (activeProduct as any).description ? (
              <p className="mb-4 whitespace-pre-line">
                {activeProduct.longDesc || activeProduct.desc || (activeProduct as any).description}
              </p>
            ) : (
              <>
                <p className="mb-4">
                  Woven in the historical Peeli Kothi district of Varanasi, this Saree represents the ultimate peak of slow fashion. Our weavers utilize generational wooden handlooms, manually setting the warp threads and using real metallic zari wire matrices to weave authentic patterns that have graced royalty for centuries.
                </p>
                <p>
                  By bypassing intermediary powerlooms, Designs of Dreams ensures that master artisans receive sustainable wages. The Soft Sage hue combined with gold zari motifs represents a contemporary interpretation of Banarasi heritage, ideal for modern brides and luxury festive ensembles.
                </p>
              </>
            )}
          </div>

          <button className="toggle-desc-btn" onClick={() => setIsDescExpanded(!isDescExpanded)}>
            {isDescExpanded ? (
              <>
                Show Less <ChevronUp size={16} />
              </>
            ) : (
              <>
                Read Full Story <ChevronDown size={16} />
              </>
            )}
          </button>

          <div className="highlights-box">
            <h3 className="serif-font">Product Highlights</h3>
            <ul className="highlights-list">
              {activeProduct.features && activeProduct.features.length > 0 ? (
                activeProduct.features.map((f, idx) => (
                  <li key={idx}>
                    <CheckCircle size={16} />
                    <span>{f}</span>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <CheckCircle size={16} />
                    <span>Pure mulberry silk fabrics</span>
                  </li>
                  <li>
                    <CheckCircle size={16} />
                    <span>Traditional Kadwa zari weaves</span>
                  </li>
                  <li>
                    <CheckCircle size={16} />
                    <span>Woven in Peeli Kothi crossing</span>
                  </li>
                  <li>
                    <CheckCircle size={16} />
                    <span>Exquisite paisley border pallu</span>
                  </li>
                  <li>
                    <CheckCircle size={16} />
                    <span>Lightweight organic drape comfort</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="specs-box">
          <h3 className="serif-font text-2xl mb-4">Product Specifications</h3>
          <table className="specs-table">
            <tbody>
              <tr>
                <td className="spec-label">Fabric</td>
                <td className="spec-value">{(activeProduct as any).fabric || activeProduct.fabrics?.[0] || activeFabric || "Pure Mulberry Silk"}</td>
              </tr>
              <tr>
                <td className="spec-label">Saree Length</td>
                <td className="spec-value">{activeProduct.sareeLength || (activeProduct as any).sareeLength || "5.5 Meters"}</td>
              </tr>
              <tr>
                <td className="spec-label">Blouse Piece</td>
                <td className="spec-value">{activeProduct.blousePiece || (activeProduct as any).blousePiece || "0.8 Meters (Unstitched Included)"}</td>
              </tr>
              <tr>
                <td className="spec-label">Pattern</td>
                <td className="spec-value">{activeProduct.weaveType || (activeProduct as any).weaveType || "Traditional Kadwa Floral Grid"}</td>
              </tr>
              <tr>
                <td className="spec-label">Occasion</td>
                <td className="spec-value">{activeProduct.occasion || (activeProduct as any).occasion || "Wedding, Ceremonial, Bridal Wear"}</td>
              </tr>
              <tr>
                <td className="spec-label">Care Instructions</td>
                <td className="spec-value">{activeProduct.careInstructions || (activeProduct as any).careInstructions || "Dry Clean Only (Store in Muslin Bag)"}</td>
              </tr>
              <tr>
                <td className="spec-label">Country of Origin</td>
                <td className="spec-value">{activeProduct.origin || (activeProduct as any).origin || "India (Varanasi, UP)"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>


      {/* ── Related Products from Database ── */}
      {dbRelatedProducts.length > 0 && (
      <section className="related-section" style={{ padding: "40px 0 20px" }}>
        <h2 className="related-title text-center text-3xl mb-8 serif-font">Related Products</h2>
        <div className="slider-container">
          <div className="slider-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
            {dbRelatedProducts.slice(0, 4).map((item) => (
              <div key={item.id} className="product-card" style={{ display: "flex", flexDirection: "column", background: "var(--card-bg, #ffffff)", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}>
                <Link href={`/product/${item.id}`} className="product-card__image-box" style={{ flex: 1, aspectRatio: "4/5", position: "relative", display: "block" }}>
                  <Image src={item.image} alt={item.title} fill style={{ objectFit: "cover" }} />
                  <span className="product-card__badge" style={{ position: "absolute", top: "12px", left: "12px", background: "var(--primary, #800020)", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>
                    {item.badge}
                  </span>
                </Link>
                <div className="product-card__info" style={{ padding: "16px" }}>
                  <span className="product-card__category" style={{ fontSize: "0.75rem", color: "var(--accent-gold, #c5a059)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "1px" }}>
                    {item.subcategory}
                  </span>
                  <Link href={`/product/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <h3 className="product-card__title" style={{ fontSize: "1rem", fontWeight: 600, margin: "6px 0 10px", lineHeight: "1.3" }}>
                      {item.title}
                    </h3>
                  </Link>
                  <div className="product-card__meta" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                    <span className="price" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main, #1a1a1a)" }}>
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── 13. FAQ Accordions Section ── */}
      <section className="product-faq-section">
        <h2 className="faq-title">Frequently Checked Queries</h2>
        {faqData.map((faq, idx) => (
          <div key={idx} className={`faq-item ${activeFaqIndex === idx ? "is-open" : ""}`}>
            <button
              className="faq-trigger"
              onClick={() => setActiveFaqIndex(activeFaqIndex === idx ? null : idx)}
              aria-expanded={activeFaqIndex === idx}
              aria-controls={`faq-content-${idx}`}
            >
              <span>{faq.q}</span>
              {activeFaqIndex === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeFaqIndex === idx && (
              <div className="faq-content" id={`faq-content-${idx}`} role="region">
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ── 14. Mobile Sticky Purchase Bar ── */}
      <div className="mobile-sticky-bar">
        <div className="mobile-sticky-info">
          <div className="mobile-sticky-thumb">
            <Image src={productImages[0]} alt={activeProduct.title} fill style={{ objectFit: "cover" }} />
          </div>
          <div className="mobile-sticky-meta">
            <h5>{activeProduct.title}</h5>
            <span>₹{activeProduct.price.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div className="mobile-sticky-btns">
          <button className="mobile-btn-cart" onClick={handleAddCart}>
            Add
          </button>
          <button className="mobile-btn-buy" onClick={handleBuyNow}>
            Buy
          </button>
        </div>
      </div>

      {/* WhatsApp Share Button */}
      <a
        href={whatsappShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        title="Share this product on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp size={30} />
      </a>

      {/* ── Video Modal ── */}
      {showVideoModal && (
        <div
          className="popup-overlay"
          onClick={() => setShowVideoModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "90%", maxWidth: "800px", aspectRatio: "16/9", background: "black", borderRadius: "12px", overflow: "hidden" }}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.2)", border: "none", color: "white", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", zIndex: 10 }}
            >
              <X size={18} />
            </button>
            {activeProduct.videoUrl && (activeProduct.videoUrl.endsWith('.mp4') || activeProduct.videoUrl.endsWith('.webm') || activeProduct.videoUrl.endsWith('.mov') || activeProduct.videoUrl.startsWith('/uploads/')) ? (
              <video
                src={activeProduct.videoUrl}
                controls
                autoPlay
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <iframe
                width="100%"
                height="100%"
                src={activeProduct.videoUrl ? (activeProduct.videoUrl.includes('youtube.com/watch?v=') ? activeProduct.videoUrl.replace('watch?v=', 'embed/') + '?autoplay=1' : activeProduct.videoUrl.includes('youtu.be/') ? activeProduct.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1' : activeProduct.videoUrl) : "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"}
                title={`${activeProduct.title} Presentation Video`}
                style={{ border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}

    </main>
  );
}
