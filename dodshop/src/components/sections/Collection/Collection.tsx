"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, ChevronRight, Layers, Heart, ShoppingBag } from "lucide-react";
import "./Collection.scss";

interface CollectionItem {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  longDesc: string;
  image: string;
  link: string;
  badge: string;
  fabrics: string[];
  features: string[];
}

interface CollectionProps {
  initialCategories?: any[];
}

const defaultCategoryVisuals: Record<string, { image: string; badge: string; subtitle: string; desc: string; longDesc: string; fabrics: string[]; features: string[] }> = {
  Kurti: {
    badge: "Handcrafted Heritage",
    subtitle: "Chikankari & Designer Kurtis",
    desc: "Elegant shadow work embroidery from Lucknow on fine fabrics.",
    longDesc: "Our Kurti collection features authentic Chikankari hand embroidery and contemporary designer cuts. Every stitch is hand-sewn by master artisans, preserving age-old Lucknowi traditions for modern styling.",
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800&auto=format&fit=crop",
    fabrics: ["Georgette", "Premium Cotton", "Mulmul Silk"],
    features: ["Hand embroidery", "Shadow work", "Traditional motifs"]
  },
  Kurtis: {
    badge: "Handcrafted Heritage",
    subtitle: "Chikankari & Designer Kurtis",
    desc: "Elegant shadow work embroidery from Lucknow on fine fabrics.",
    longDesc: "Our Kurti collection features authentic Chikankari hand embroidery and contemporary designer cuts. Every stitch is hand-sewn by master artisans, preserving age-old Lucknowi traditions for modern styling.",
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800&auto=format&fit=crop",
    fabrics: ["Georgette", "Premium Cotton", "Mulmul Silk"],
    features: ["Hand embroidery", "Shadow work", "Traditional motifs"]
  },
  Saree: {
    badge: "Royal Drape",
    subtitle: "Banarasi & Heritage Sarees",
    desc: "Intricate pure gold and silver zari weaves from Varanasi.",
    longDesc: "Draped in sheer luxury, our sarees are hand-woven in Varanasi using the finest mulberry silk and real zari threads. A timeless inheritance designed to be passed down through generations.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    fabrics: ["Katan Silk", "Organza", "Chanderi"],
    features: ["Pure Zari work", "Kadwa weave", "Intricate borders"]
  },
  Sarees: {
    badge: "Royal Drape",
    subtitle: "Banarasi & Heritage Sarees",
    desc: "Intricate pure gold and silver zari weaves from Varanasi.",
    longDesc: "Draped in sheer luxury, our sarees are hand-woven in Varanasi using the finest mulberry silk and real zari threads. A timeless inheritance designed to be passed down through generations.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    fabrics: ["Katan Silk", "Organza", "Chanderi"],
    features: ["Pure Zari work", "Kadwa weave", "Intricate borders"]
  },
  Blouse: {
    badge: "Designer Cuts",
    subtitle: "Trendy & Artisanal Blouses",
    desc: "Statement designer silhouettes with elaborate embroidery.",
    longDesc: "Redefine elegance with blouses customized with elaborate handwork, zardozi, and contemporary necklines. The perfect companion to complete your royal ethnic look.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    fabrics: ["Raw Silk", "Velvet", "Brocade"],
    features: ["Zardozi detailing", "Custom tailoring", "Padded styling"]
  },
  Blouses: {
    badge: "Designer Cuts",
    subtitle: "Trendy & Artisanal Blouses",
    desc: "Statement designer silhouettes with elaborate embroidery.",
    longDesc: "Redefine elegance with blouses customized with elaborate handwork, zardozi, and contemporary necklines. The perfect companion to complete your royal ethnic look.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    fabrics: ["Raw Silk", "Velvet", "Brocade"],
    features: ["Zardozi detailing", "Custom tailoring", "Padded styling"]
  },
  Dupatta: {
    badge: "Signature Stoles",
    subtitle: "Handcrafted & Heavy Dupattas",
    desc: "Ornate borders and flowy drapes that elevate any outfit.",
    longDesc: "From Banarasi silk weaves to heavy Phulkari and Gota Patti work, our statement dupattas are designed to instantly elevate your basic silhouettes into royal ensembles.",
    image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop",
    fabrics: ["Pure Silk", "Chiffon", "Net"],
    features: ["Gota Patti work", "Banarasi borders", "Hand-dyed colors"]
  },
  Dupattas: {
    badge: "Signature Stoles",
    subtitle: "Handcrafted & Heavy Dupattas",
    desc: "Ornate borders and flowy drapes that elevate any outfit.",
    longDesc: "From Banarasi silk weaves to heavy Phulkari and Gota Patti work, our statement dupattas are designed to instantly elevate your basic silhouettes into royal ensembles.",
    image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop",
    fabrics: ["Pure Silk", "Chiffon", "Net"],
    features: ["Gota Patti work", "Banarasi borders", "Hand-dyed colors"]
  },
  "Heritage Weaves": {
    badge: "Artisanal Looms",
    subtitle: "Rare Masterpieces & Silks",
    desc: "Rare handloom treasures woven by generations of master artisans.",
    longDesc: "Preserving historical weaving patterns and centuries of royal tradition, our Heritage Weaves represent the pinnacle of Indian textile art.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    fabrics: ["Pure Mulberry Silk", "Zari Handloom", "Chanderi Weaves"],
    features: ["Gold Zari Border", "Kadwa Motif Weave", "Silk Mark Certified"]
  },
  Bridal: {
    badge: "Bridal Trousseau",
    subtitle: "Curated Bridal Couture",
    desc: "Exquisite couture designed for once-in-a-lifetime celebrations.",
    longDesc: "Intricate embroideries, heavy zardozi handcrafting, and royal drapes designed for modern regal brides.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    fabrics: ["Raw Silk", "Silk Velvet", "Pure Brocade"],
    features: ["Intricate Zardozi", "Custom Bridal Tailoring", "Hand-Dyed Colors"]
  }
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=800&auto=format&fit=crop"
];

const mapDbCategoryToItem = (cat: any, index: number): CollectionItem => {
  const preset = defaultCategoryVisuals[cat.name] || {};
  const image = cat.image || preset.image || fallbackImages[index % fallbackImages.length];

  const dbFabrics = Array.isArray(cat.fabrics) && cat.fabrics.length > 0 ? cat.fabrics : [];
  const fabrics = dbFabrics.length > 0 ? dbFabrics : (preset.fabrics || ["Pure Silk", "Fine Handloom", "Artisanal Cotton"]);

  const dbSubs = Array.isArray(cat.subcategories) && cat.subcategories.length > 0 ? cat.subcategories : [];
  const features = dbSubs.length > 0 ? dbSubs : (preset.features || ["Handcrafted", "Heritage Weave", "Custom Tailoring"]);

  return {
    id: index + 1,
    title: cat.name,
    subtitle: cat.description ? cat.description : (preset.subtitle || `${cat.name} Masterpieces`),
    desc: cat.description ? cat.description : (preset.desc || `Curated collection of artisanal ${cat.name}.`),
    longDesc: preset.longDesc || cat.description || `Explore our exclusive collection of ${cat.name}, designed with royal craftsmanship and the finest fabrics.`,
    image,
    link: `/collection?category=${encodeURIComponent(cat.name)}`,
    badge: preset.badge || "Signature Collection",
    fabrics,
    features
  };
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.215, 0.61, 0.355, 1.0] as any
    }
  }
};

const Collection: React.FC<CollectionProps> = ({ initialCategories }) => {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>(initialCategories || []);
  const [activePopup, setActivePopup] = useState<CollectionItem | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.warn("Failed to fetch categories on landing page", err);
    }
  };

  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetchCategories();
    }
    window.addEventListener("focus", fetchCategories);
    return () => window.removeEventListener("focus", fetchCategories);
  }, [initialCategories]);

  const collectionsData: CollectionItem[] = categories.map((cat, idx) => mapDbCategoryToItem(cat, idx));

  const openPopup = (collection: CollectionItem) => {
    setActivePopup(collection);
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  return (
    <section className="collection-section">
      <div className="collection-section__container">
        {/* Header Area */}
        <div className="collection-section__header">
          <motion.span 
            className="collection-section__tag"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Curated Masterpieces
          </motion.span>
          <motion.h2 
            className="collection-section__title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            The Heritage <span>Collections</span>
          </motion.h2>
          <motion.p 
            className="collection-section__desc"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Explore our signature lines handcrafted for celebrations, rooted in centuries of weaving and artisanal tradition.
          </motion.p>
        </div>

        {/* Collection Cards Grid (Strictly 4 Cards) */}
        <motion.div 
          className="collection-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {collectionsData.map((item) => (
            <motion.div
              key={item.id}
              className={`collection-card ${hoveredCardId !== null && hoveredCardId !== item.id ? "collection-card--dimmed" : ""}`}
              variants={cardVariants}
              onMouseEnter={() => setHoveredCardId(item.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => router.push(item.link)}
            >
              <div className="collection-card__image-wrapper">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="collection-card__image"
                  priority={item.id <= 2}
                />
                <div className="collection-card__overlay" />
              </div>

              {/* Floating Content */}
              <div className="collection-card__content">
                <div className="collection-card__meta-top">
                  <span className="collection-card__serial">0{item.id}</span>
                  <span className="collection-card__badge">{item.badge}</span>
                </div>
                
                <h3 className="collection-card__title">
                  {item.title}
                  <span className="collection-card__title-line" />
                </h3>
                <p className="collection-card__subtitle">{item.subtitle}</p>
                <p className="collection-card__text">{item.desc}</p>
                
                <div className="collection-card__action">
                  <span className="collection-card__btn-text">Explore View</span>
                  <div className="collection-card__icon-box">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>

              {/* Decorative Border Layer */}
              <div className="collection-card__border" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* QUICK VIEW POPUP MODAL */}
      <AnimatePresence>
        {activePopup && (
          <motion.div 
            className="collection-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
          >
            <motion.div 
              className="collection-popup"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="collection-popup__close" onClick={closePopup} aria-label="Close popup">
                <X size={20} />
              </button>

              <div className="collection-popup__grid">
                {/* Visual Half */}
                <div className="collection-popup__visual">
                  <Image
                    src={activePopup.image}
                    alt={activePopup.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="collection-popup__visual-overlay" />
                  <span className="collection-popup__visual-badge">{activePopup.badge}</span>
                </div>

                {/* Info Half */}
                <div className="collection-popup__info">
                  <span className="collection-popup__label">Exquisite Artistry</span>
                  <h2 className="collection-popup__title">{activePopup.title}</h2>
                  <p className="collection-popup__subtitle">{activePopup.subtitle}</p>
                  
                  <div className="collection-popup__divider" />
                  
                  <p className="collection-popup__desc">{activePopup.longDesc}</p>
                  
                  <div className="collection-popup__details">
                    <div className="collection-popup__detail-group">
                      <h4>Signature Fabrics</h4>
                      <div className="collection-popup__tags">
                        {activePopup.fabrics.map((f, i) => (
                          <span key={i} className="collection-popup__tag-item">{f}</span>
                        ))}
                      </div>
                    </div>
                    <div className="collection-popup__detail-group">
                      <h4>Heritage Details</h4>
                      <ul className="collection-popup__list">
                        {activePopup.features.map((feat, i) => (
                          <li key={i} className="collection-popup__list-item">
                            <ChevronRight size={14} />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link href={activePopup.link} className="collection-popup__cta" onClick={closePopup}>
                    View Entire Collection
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Collection;
