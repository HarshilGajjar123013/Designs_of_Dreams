"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, Sparkles, Filter } from "lucide-react";
import "./Gallery.scss";

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  filterTag: string;
  image: string;
  desc: string;
}

const galleryData: GalleryItem[] = [
  {
    id: 1,
    title: "Detail & Thread",
    category: "Detail Studio",
    filterTag: "embroidery",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    desc: "Finely spun gold threads embroidered onto heavy velvet base fabric."
  },
  {
    id: 2,
    title: "The Master Weaver",
    category: "Artisanal Handloom",
    filterTag: "weaving",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop",
    desc: "Varanasi master weaver hand-weaving mulberry silk over weeks of dedicated labor."
  },
  {
    id: 3,
    title: "Zardozi Handwork",
    category: "Intricate Embroidery",
    filterTag: "embroidery",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
    desc: "Detailed shadow embroidery and metal wire applique from Lucknow on georgette."
  },
  {
    id: 4,
    title: "Heritage Spools",
    category: "Weaving Spools",
    filterTag: "weaving",
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800&auto=format&fit=crop",
    desc: "Premium colored silk threads prepared on traditional reels, ready for looms."
  },
  {
    id: 5,
    title: "Draping Elegance",
    category: "Bridal Drape",
    filterTag: "weaving",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    desc: "Mulberry silk saree exhibiting detailed pure silver zari brocade work."
  },
  {
    id: 6,
    title: "Indigo Dye Vat",
    category: "Organic Coloring",
    filterTag: "coloring",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
    desc: "Traditional hand-dyeing processes using pure organic botanical indigo vats."
  },
  {
    id: 7,
    title: "The Crimson Silk",
    category: "Festive Crimson",
    filterTag: "coloring",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
    desc: "Crimson hand-dyed organic silk threads drying in the afternoon sun."
  },
  {
    id: 8,
    title: "Craft Dyeing Vat",
    category: "Colors & Craft",
    filterTag: "coloring",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
    desc: "Botanical ingredients creating natural organic coloring solutions for yarn."
  },
  {
    id: 9,
    title: "Block Print Matrix",
    category: "Hand-Block Printing",
    filterTag: "finishing",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
    desc: "Hand-carved seasoned teak wood block matrices used for printing intricate motifs."
  },
  {
    id: 10,
    title: "Gold Zari Skeins",
    category: "Pure Zari Work",
    filterTag: "weaving",
    image: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop",
    desc: "Fine silver wire bundles electroplated with pure gold ready to be woven into borders."
  },
  {
    id: 11,
    title: "The Finishing Touch",
    category: "Quality Inspection",
    filterTag: "finishing",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=800&auto=format&fit=crop",
    desc: "Meticulous quality inspection and thread trimming on finished sarees before packing."
  },
  {
    id: 12,
    title: "Loom Drafting",
    category: "Design Mapping",
    filterTag: "weaving",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
    desc: "Traditional card drafting and loom-harness mapping for floral zari grids."
  }
];

const defaultCategories = [
  { id: "all", label: "All Masterpieces" },
  { id: "weaving", label: "Weaving Studio" },
  { id: "embroidery", label: "Intricate Embroidery" },
  { id: "coloring", label: "Organic Coloring" },
  { id: "finishing", label: "Artisanal Finishing" }
];

const GalleryDetails: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [cmsGallery, setCmsGallery] = useState<GalleryItem[]>(galleryData);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(defaultCategories);
  const [loading, setLoading] = useState<boolean>(true);

  React.useEffect(() => {
    const loadCmsGallery = async () => {
      try {
        const res = await fetch("/api/cms");
        const data = await res.json();
        if (data.success && data.cms) {
          // Robustly parse items and tags whether returned flat or nested
          const rawGallery = data.cms.gallery;
          const cmsItems: GalleryItem[] = Array.isArray(rawGallery)
            ? rawGallery
            : (rawGallery && Array.isArray(rawGallery.items) ? rawGallery.items : []);
          
          const rawTags = data.cms.galleryFilterTags || (rawGallery && rawGallery.filterTags);
          const cmsTags: { id: string; label: string }[] = Array.isArray(rawTags) ? rawTags : [];

          if (cmsItems.length > 0) {
            setCmsGallery(cmsItems);
          } else {
            setCmsGallery(galleryData);
          }

          if (Array.isArray(rawTags) && rawTags.length > 0) {
            setCategories([
              { id: "all", label: "All Masterpieces" },
              ...rawTags
            ]);
          } else if (Array.isArray(rawTags) && rawTags.length === 0) {
            setCategories([{ id: "all", label: "All Masterpieces" }]);
          } else {
            setCategories(defaultCategories);
          }
        }
      } catch (err) {
        console.error("Failed to load storefront CMS gallery:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCmsGallery();
  }, []);

  // Filter gallery items
  const filteredData = useMemo(() => {
    if (activeFilter === "all") return cmsGallery;
    return cmsGallery.filter((item) => item.filterTag === activeFilter);
  }, [activeFilter, cmsGallery]);

  const openLightbox = (id: number) => {
    const originalIndex = cmsGallery.findIndex((item) => item.id === id);
    setLightboxIndex(originalIndex);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % cmsGallery.length);
    }
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + cmsGallery.length) % cmsGallery.length);
    }
  };

  return (
    <section className="details-gallery-section">
      <div className="details-gallery-section__container">
        
        {/* Header Block */}
        <div className="details-gallery-section__header">
          <div className="details-gallery-section__tag-box">
            <Sparkles size={14} className="details-gallery-section__sparkle" />
            <span className="details-gallery-section__tag">Atelier Exhibition</span>
          </div>
          <h1 className="details-gallery-section__title">
            The Designs of Dreams <span>Exhibition Gallery</span>
          </h1>
          <p className="details-gallery-section__desc">
            Step behind the scenes of luxury handloom weaving. Explore our visual moodboard detailing natural dyeing vats, wood block matrices, and hand embroidery studios.
          </p>
        </div>

        {/* Categories / Filter Bar */}
        <div className="details-gallery-filters">
          <div className="details-gallery-filters__icon-box">
            <Filter size={14} />
            <span>Filter By:</span>
          </div>
          <div className="details-gallery-filters__list">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`filter-btn ${activeFilter === cat.id ? "filter-btn--active" : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div 
          layout 
          className="details-gallery-grid"
        >
          <AnimatePresence mode="popLayout">
            {filteredData.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="details-gallery-card"
                onClick={() => openLightbox(item.id)}
              >
                <div className="details-gallery-card__img-wrapper">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="details-gallery-card__img"
                    priority={item.id <= 6}
                  />
                  <div className="details-gallery-card__overlay" />
                </div>

                <div className="details-gallery-card__info">
                  <span className="details-gallery-card__category">{item.category}</span>
                  <h4 className="details-gallery-card__title">{item.title}</h4>
                  <p className="details-gallery-card__desc">{item.desc}</p>
                  
                  <div className="details-gallery-card__zoom">
                    <Maximize2 size={14} />
                  </div>
                </div>
                <div className="details-gallery-card__border" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            className="details-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button className="details-lightbox-close" onClick={closeLightbox} aria-label="Close lightbox">
              <X size={24} />
            </button>

            <button className="details-lightbox-nav details-lightbox-nav--prev" onClick={prevSlide} aria-label="Previous slide">
              <ChevronLeft size={30} />
            </button>

            <motion.div 
              className="details-lightbox-content"
              key={lightboxIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="details-lightbox-image-wrapper">
                <img
                  src={cmsGallery[lightboxIndex].image}
                  alt={cmsGallery[lightboxIndex].title}
                  className="details-lightbox-image"
                />
              </div>

              <div className="details-lightbox-caption">
                <div className="details-lightbox-caption__left">
                  <span className="details-lightbox-tag">{cmsGallery[lightboxIndex].category}</span>
                  <h3 className="details-lightbox-title">{cmsGallery[lightboxIndex].title}</h3>
                </div>
                <p className="details-lightbox-desc">{cmsGallery[lightboxIndex].desc}</p>
              </div>
            </motion.div>

            <button className="details-lightbox-nav details-lightbox-nav--next" onClick={nextSlide} aria-label="Next slide">
              <ChevronRight size={30} />
            </button>

            <div className="details-lightbox-counter">
              0{lightboxIndex + 1} / 0{cmsGallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GalleryDetails;
