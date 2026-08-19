"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useStore, Product } from "@/store/useStore";
import { motion } from "framer-motion";
import {
  Star,
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
  X,
  Copy
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

// Mock 360 Rotating Frames
const mock360Frames = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop"
];

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

  // 360 Preview
  const [show360, setShow360] = useState(false);
  const [active360Index, setActive360Index] = useState(0);
  const isDragging360 = useRef(false);
  const dragStartX = useRef(0);

  // Video Modal
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Sticky Buy Bar on Scroll
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const buyButtonRef = useRef<HTMLDivElement>(null);

  // Share dropdown
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Helpful review vote


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
      setActiveFabric((matchedProduct.fabrics[0] || "Premium Katan Silk").trim());
      if (matchedProduct.category === "Saree") {
        setActiveSize("Standard Drape (5.5m + Blouse)");
      } else {
        setActiveSize(matchedProduct.sizes[0] || "M");
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



  // Copy product URL link
  const handleShareClick = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      setShowShareTooltip(false);
    }, 2000);
  }, []);


  // 360 degree drag rotation simulator
  const handle360MouseDown = useCallback((e: React.MouseEvent) => {
    isDragging360.current = true;
    dragStartX.current = e.clientX;
  }, []);

  const handle360MouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging360.current) return;
    const deltaX = e.clientX - dragStartX.current;
    if (Math.abs(deltaX) > 20) {
      const direction = deltaX > 0 ? 1 : -1;
      setActive360Index((prev) => (prev + direction + mock360Frames.length) % mock360Frames.length);
      dragStartX.current = e.clientX;
    }
  }, []);

  const handle360MouseUpOrLeave = useCallback(() => {
    isDragging360.current = false;
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

  // Related products: Ensure 3 unique similar products with unique images
  const relatedProducts = useMemo(() => {
    // Standard list of distinct saree products
    const distinctSarees: Product[] = [
      {
        id: "2",
        title: "Gilded Crimson Organza Saree",
        subtitle: "Lightweight Contemporary Silk",
        category: "Saree",
        subcategory: "Silk",
        desc: "Translucent pastel organza saree featuring hand-woven floral motifs and gold borders.",
        longDesc: "A delicate weave combining the lightweight translucency of premium organza.",
        price: 8499,
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
        badge: "Limited Edition",
        fabrics: ["Organza Silk"],
        features: ["Scalloped embroidery"],
        sizes: ["One Size"],
        rating: 4.7
      },
      {
        id: "3",
        title: "Emerald Green Banarasi Silk Saree",
        subtitle: "Traditional Zari Handloom",
        category: "Saree",
        subcategory: "Chanderi",
        desc: "Fine handloom Emerald Banarasi silk saree with hand-stitched zardozi gold borders.",
        longDesc: "A classical ensemble directly from Chanderi weavers.",
        price: 10999,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
        badge: "Artisanal Craft",
        fabrics: ["Banarasi Silk"],
        features: ["Hand zardozi work"],
        sizes: ["One Size"],
        rating: 4.8
      },
      {
        id: "3b",
        title: "Royal Blue Paithani Silk Saree",
        subtitle: "Maharashtrian Heritage Drape",
        category: "Saree",
        subcategory: "Paithani",
        desc: "Lustrous royal blue silk saree featuring handcrafted peacock zari pallu.",
        longDesc: "Traditional Paithani weave with hand-crafted peacock pallu motifs.",
        price: 14499,
        image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop",
        badge: "Heritage Weave",
        fabrics: ["Pure Silk"],
        features: ["Peacock zari pallu"],
        sizes: ["One Size"],
        rating: 4.9
      },
      {
        id: "3c",
        title: "Ivory Gold Chikankari Saree",
        subtitle: "Lucknowi Handwork Weave",
        category: "Saree",
        subcategory: "Chikankari",
        desc: "Ethereal ivory saree adorned with fine chikankari embroidery and gold Mukaish work.",
        longDesc: "Classic Lucknow chikankari on pure georgette silk.",
        price: 11299,
        image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800&auto=format&fit=crop",
        badge: "Atelier Signature",
        fabrics: ["Georgette Silk"],
        features: ["Mukaish work"],
        sizes: ["One Size"],
        rating: 4.8
      }
    ];

    // Filter store products matching category & not active product
    const storeFiltered = products.filter(
      (p) => p.category === activeProduct.category && String(p.id) !== String(activeProduct.id)
    );

    // Merge store items and distinct items
    const candidates = [...storeFiltered, ...distinctSarees];

    // Deduplicate strictly by title and image URL
    const seenTitles = new Set<string>([activeProduct.title.toLowerCase()]);
    const seenImages = new Set<string>();
    if (activeProduct.image) {
      seenImages.add(activeProduct.image.split('?')[0]);
    }

    const uniqueList: Product[] = [];
    for (const item of candidates) {
      const baseImg = item.image ? item.image.split('?')[0] : '';
      const titleLower = item.title.toLowerCase();

      if (!seenTitles.has(titleLower) && !seenImages.has(baseImg)) {
        seenTitles.add(titleLower);
        seenImages.add(baseImg);
        uniqueList.push(item);
      }
      if (uniqueList.length >= 3) break;
    }

    return uniqueList;
  }, [products, activeProduct]);

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
                className={`thumb-card ${activeThumbIndex === idx && !show360 ? "is-active" : ""}`}
                onClick={() => {
                  setActiveThumbIndex(idx);
                  setActiveImage(img);
                  setShow360(false);
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

            {/* 360 Thumbnail Trigger */}
            <div className={`thumb-card ${show360 ? "is-active" : ""}`} onClick={() => setShow360(true)}>
              <Image src={productImages[1] || productImages[0]} alt="360 Thumbnail" fill style={{ objectFit: "cover" }} />
              <div className="thumb-icon-overlay">
                <RotateCcw size={20} />
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

            {show360 ? (
              // 360 Interactive Viewer Screen
              <div className="viewer-360-screen">
                <button className="close-360" onClick={() => setShow360(false)}>
                  <X size={18} />
                </button>
                <div
                  className="viewer-360-image-holder"
                  onMouseDown={handle360MouseDown}
                  onMouseMove={handle360MouseMove}
                  onMouseUp={handle360MouseUpOrLeave}
                  onMouseLeave={handle360MouseUpOrLeave}
                >
                  <Image
                    src={mock360Frames[active360Index]}
                    alt="360 rotation Saree frame"
                    fill
                    style={{ objectFit: "contain" }}
                    draggable={false}
                  />
                </div>
                <div className="viewer-360-instruction">
                  Drag horizontal to rotate 360° preview
                </div>
              </div>
            ) : (
              // Standard Zoomable Main Viewport
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
            )}

            <div className="gallery-controls-360">
              <button className="control-btn" onClick={() => setShow360(!show360)} title="Toggle 360 Rotation">
                <RotateCcw size={18} />
              </button>
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
              <div className="variant-title">
                {activeProduct.category === "Saree" ? "Select Length & Size" : "Select Size"}
              </div>
              <div className="size-options">
                {activeProduct.category === "Saree"
                  ? ["Standard Drape (5.5m + Blouse)", "Custom Tailored Blouse (+₹1,500)"].map((sz) => (
                    <button
                      key={sz}
                      className={`option-btn ${activeSize === sz ? "is-active" : ""}`}
                      onClick={() => setActiveSize(sz)}
                    >
                      {sz}
                    </button>
                  ))
                  : activeProduct.sizes.map((sz) => (
                    <button
                      key={sz}
                      className={`option-btn size-circle ${activeSize === sz ? "is-active" : ""}`}
                      onClick={() => setActiveSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
              </div>
            </div>

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
          </div>



        </div>
      </div>

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
                <td className="spec-value">{activeFabric}</td>
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
      <section className="related-section" style={{ padding: "40px 0 20px" }}>
        <h2 className="related-title text-center text-3xl mb-8 serif-font">Related Products</h2>
        <div className="slider-container">
          <div className="slider-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
            {(dbRelatedProducts.length > 0 ? dbRelatedProducts : relatedProducts).slice(0, 4).map((item) => (
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
                    <div className="rating" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", fontWeight: 600, color: "#d97706" }}>
                      <Star size={14} fill="currentColor" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
          `✨ *Designs of Dreams (DOD)* ✨
Premium Handcrafted Indian Ethnic Wear — Direct from Artisans to You.

━━━━━━━━━━━━━━━━━━

🛍️ *${activeProduct.title}*
${activeProduct.subtitle}

${activeProduct.desc}

💰 *Price:* ₹${activeProduct.price.toLocaleString("en-IN")} (MRP ₹${(activeProduct.price / 0.6).toLocaleString("en-IN", { maximumFractionDigits: 0 })} — *40% OFF*)
🏷️ *Category:* ${activeProduct.category} — ${activeProduct.subcategory}
🧵 *Fabric:* ${activeProduct.fabrics.join(", ")}
⭐ *Rating:* ${activeProduct.rating}/5 (142 reviews)
✅ *Features:* ${activeProduct.features.join(" | ")}

👉 *View Product:* ${typeof window !== "undefined" ? window.location.href : ""}

━━━━━━━━━━━━━━━━━━

📂 *Browse Our Collections:*
🔹 Sarees → ${typeof window !== "undefined" ? window.location.origin : ""}/collection?category=Saree
🔹 Kurtis → ${typeof window !== "undefined" ? window.location.origin : ""}/collection?category=Kurti
🔹 Blouses → ${typeof window !== "undefined" ? window.location.origin : ""}/collection?category=Blouse
🔹 Dupattas → ${typeof window !== "undefined" ? window.location.origin : ""}/collection?category=Dupatta
🔹 Full Catalog → ${typeof window !== "undefined" ? window.location.origin : ""}/collection

━━━━━━━━━━━━━━━━━━

🏠 *About DOD Shop:*
Designs of Dreams is a premium Indian ethnic wear brand specializing in authentic handloom Banarasi sarees, Lucknow Chikankari kurtis, and designer blouses. Every piece is handcrafted by master artisans from Varanasi, Lucknow, and Jaipur — preserving centuries-old weaving traditions. We offer Silk Mark certified products, free express shipping, and 7-day easy returns.

🌐 *Visit:* ${typeof window !== "undefined" ? window.location.origin : ""}
`
        )}`}
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
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Varanasi Loom Craftsmanship Video"
              style={{ border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

    </main>
  );
}
