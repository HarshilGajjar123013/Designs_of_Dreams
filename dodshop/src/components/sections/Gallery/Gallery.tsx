"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Sparkles } from "lucide-react";
import "./Gallery.scss";

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  desc: string;
  gridClass: string;
}

const galleryData: GalleryItem[] = [
  {
    id: 1,
    title: "Detail & Thread",
    category: "Detail Studio",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    desc: "Finely spun gold threads embroidered onto heavy velvet.",
    gridClass: "collage-1"
  },
  {
    id: 2,
    title: "The Master Weaver",
    category: "Artisanal Handloom",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop",
    desc: "Varanasi master weaver hand-weaving mulberry silk over weeks.",
    gridClass: "collage-2"
  },
  {
    id: 3,
    title: "Zardozi Handwork",
    category: "Intricate Embroidery",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
    desc: "Detailed shadow embroidery from Lucknow on georgette.",
    gridClass: "collage-3"
  },
  {
    id: 4,
    title: "Heritage Spools",
    category: "Weaving Spools",
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800&auto=format&fit=crop",
    desc: "Premium colored threads ready for traditional handlooms.",
    gridClass: "collage-4"
  },
  {
    id: 5,
    title: "Draping Elegance",
    category: "Bridal Drape",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    desc: "Mulberry silk saree showing detailed pure silver zari work.",
    gridClass: "collage-5"
  },
  {
    id: 6,
    title: "Indigo Dye Vat",
    category: "Organic Coloring",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
    desc: "Traditional hand-dyeing processes using pure botanical indigo.",
    gridClass: "collage-6"
  },
  {
    id: 7,
    title: "The Crimson Silk",
    category: "Festive Crimson",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
    desc: "Crimson hand-dyed silk threads drying in the sun.",
    gridClass: "collage-7"
  },
  {
    id: 8,
    title: "Craft Dyeing Vat",
    category: "Colors & Craft",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
    desc: "Botanical ingredients creating natural organic coloring.",
    gridClass: "collage-8"
  }
];

const gridClasses = ["collage-1", "collage-2", "collage-3", "collage-4", "collage-5", "collage-6", "collage-7", "collage-8"];

const Gallery: React.FC = () => {
  const router = useRouter();
  const [mobileIndex, setMobileIndex] = useState(0);
  const [cmsGallery, setCmsGallery] = useState<GalleryItem[]>(galleryData);

  React.useEffect(() => {
    const loadCmsGallery = async () => {
      try {
        const res = await fetch("/api/cms");
        const data = await res.json();
        if (data.success && data.cms) {
          const rawGallery = data.cms.gallery;
          const cmsItems: GalleryItem[] = Array.isArray(rawGallery)
            ? rawGallery
            : (rawGallery && Array.isArray(rawGallery.items) ? rawGallery.items : []);
          if (cmsItems.length > 0) {
            setCmsGallery(cmsItems);
          } else {
            setCmsGallery(galleryData);
          }
        }
      } catch (err) {
        console.error("Failed to load storefront CMS gallery preview:", err);
      }
    };
    loadCmsGallery();
  }, []);

  const navigateToGallery = () => {
    router.push("/gallery");
  };

  const previewGallery = cmsGallery.slice(0, 8);

  return (
    <section className="gallery-section">
      <div className="gallery-section__container">
        
        {/* Title Block */}
        <div className="gallery-section__header">
          <motion.div 
            className="gallery-section__tag-box"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles size={14} className="gallery-section__sparkle" />
            <span className="gallery-section__tag">The Studio Archive</span>
          </motion.div>
          <motion.h2 
            className="gallery-section__title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Craft &amp; <span>Heritage</span> Moodboard
          </motion.h2>
          <motion.p 
            className="gallery-section__desc"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            A curated visual collage board showing every angle of our weaving studios, dyeing vats, and hand embroidery.
          </motion.p>
        </div>

        {/* Asymmetrical Collage Wall (Barber Moodboard style) */}
        <div className="collage-wall">
          {previewGallery.map((item, idx) => {
            const gridClass = gridClasses[idx] || `collage-${idx + 1}`;
            return (
              <motion.div
                key={item.id}
                className={`collage-item ${gridClass}`}
                onClick={navigateToGallery}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.8, delay: idx * 0.05, ease: [0.215, 0.61, 0.355, 1.0] }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="collage-item__img-wrapper">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
                    className="collage-item__img"
                  />
                  <div className="collage-item__overlay" />
                </div>

                {/* Hover Text Info Overlay */}
                <div className="collage-item__info">
                  <span className="collage-item__category">{item.category}</span>
                  <h4 className="collage-item__title">{item.title}</h4>
                  <p className="collage-item__desc">{item.desc}</p>
                  
                  <div className="collage-item__zoom">
                    <Maximize2 size={14} />
                  </div>
                </div>
                <div className="collage-item__border" />
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Gallery Carousel (Visible only on Mobile) */}
        <div className="mobile-gallery-carousel">
          <div className="mobile-gallery-carousel__wrapper" onClick={navigateToGallery}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="mobile-gallery-carousel__slide"
              >
                <div className="mobile-gallery-carousel__image-container">
                  <Image
                    src={previewGallery[mobileIndex]?.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600"}
                    alt={previewGallery[mobileIndex]?.title || "Gallery Image"}
                    fill
                    sizes="(max-width: 768px) 90vw, 30vw"
                    className="mobile-gallery-carousel__img"
                  />
                  <div className="mobile-gallery-carousel__overlay" />
                </div>
                
                <div className="mobile-gallery-carousel__info">
                  <span className="mobile-gallery-carousel__category">{previewGallery[mobileIndex]?.category}</span>
                  <h4 className="mobile-gallery-carousel__title">{previewGallery[mobileIndex]?.title}</h4>
                  <p className="mobile-gallery-carousel__desc">{previewGallery[mobileIndex]?.desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Nav Controls */}
            <button 
              className="mobile-gallery-nav mobile-gallery-nav--prev" 
              onClick={(e) => { e.stopPropagation(); setMobileIndex((mobileIndex - 1 + previewGallery.length) % previewGallery.length); }}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              className="mobile-gallery-nav mobile-gallery-nav--next" 
              onClick={(e) => { e.stopPropagation(); setMobileIndex((mobileIndex + 1) % previewGallery.length); }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="mobile-gallery-dots">
            {previewGallery.map((_, idx) => (
              <button 
                key={idx}
                className={`mobile-gallery-dot ${mobileIndex === idx ? "mobile-gallery-dot--active" : ""}`}
                onClick={(e) => { e.stopPropagation(); setMobileIndex(idx); }}
              />
            ))}
          </div>
        </div>

        {/* Centered CTA Button */}
        <div className="gallery-section__cta">
          <Link href="/gallery" className="gallery-btn">
            View More Exhibition
            <ChevronRight size={18} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Gallery;
