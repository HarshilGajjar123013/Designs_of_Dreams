"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { gsap } from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { ArrowRight, Play, ChevronLeft, ChevronRight, X } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./Hero.scss";

// ── SVG Icons (Restored) ──────────────────────────────────────────────────────
const IconLotus = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 4C14 4 16.5 8.5 14 14C11.5 8.5 14 4 14 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 14C14 14 8 10 4 14C8 18 14 14 14 14Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 14C14 14 20 10 24 14C20 18 14 14 14 14Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 14C14 14 10 20 14 24C18 20 14 14 14 14Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconHands = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M10 18V9C10 8.4 10.4 8 11 8C11.6 8 12 8.4 12 9V14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M12 11C12 10.4 12.4 10 13 10C13.6 10 14 10.4 14 11V14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M14 11.5C14 10.9 14.4 10.5 15 10.5C15.6 10.5 16 10.9 16 11.5V14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M16 12C16 11.4 16.4 11 17 11C17.6 11 18 11.4 18 12V18C18 21 15.5 23 13 23C10 23 8 21 8 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconArch = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M5 24V12L14 5L23 12V24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 24V18C10 15.8 11.8 14 14 14C16.2 14 18 15.8 18 18V24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="5" y1="24" x2="23" y2="24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconGem = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 4C14 4 18 10 14 14C10 10 14 4 14 4Z" stroke="currentColor" strokeWidth="1.2" />
    <path d="M14 24C14 24 10 18 14 14C18 18 14 24 14 24Z" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4 14C4 14 10 10 14 14C10 18 4 14 4 14Z" stroke="currentColor" strokeWidth="1.2" />
    <path d="M24 14C24 14 18 18 14 14C18 10 24 14 24 14Z" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="14" cy="14" r="2" fill="currentColor" />
  </svg>
);

const IconThread = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="1.2" />
    <path d="M14 4V8M14 20V24M4 14H8M20 14H24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M7 7L10 10M18 18L21 21M21 7L18 10M10 18L7 21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ── Data ─────────────────────────────────────────────────────────────────────
interface FeatureItem {
  id: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
  highlight?: boolean;
  popupTitle: string;
  popupSubtitle: string;
  popupBody: string;
  mainImage: string;
  thumbImages: string[];
}

const features: FeatureItem[] = [
  {
    id: 1, icon: <IconLotus />, title: "Heritage Storytelling", desc: "Rooted in history, crafted for today.",
    popupTitle: "The Art of Heritage Storytelling", popupSubtitle: "Where Centuries Become Couture",
    popupBody: "Every handcrafted piece carries generations of artistry, culture, and emotion. Designed not only to be worn, but remembered.",
    mainImage: "/assets/heritage/heritage_storytelling.png", thumbImages: ["/assets/heritage/handcrafted_luxury.png", "/assets/heritage/heritage_storytelling.png"],
  },
  {
    id: 2, icon: <IconHands />, title: "Handcrafted Luxury", desc: "Made by artisans, cherished for life.",
    popupTitle: "The Essence of Handcrafted Luxury", popupSubtitle: "Where Every Stitch Tells a Story",
    popupBody: "In a world of mass production, we choose the path of the artisan. Each piece passes through skilled hands that have honed their craft over decades.",
    mainImage: "/assets/heritage/handcrafted_luxury.png", thumbImages: ["/assets/heritage/heritage_storytelling.png", "/assets/heritage/handcrafted_luxury.png"],
  },
  {
    id: 3, icon: <IconArch />, title: "Museum Editorial Feel", desc: "Timeless pieces with a story to hold.",
    popupTitle: "A Museum of Living Fashion", popupSubtitle: "Curated, Not Created",
    popupBody: "Our collections are curated with the same reverence as a museum exhibition. Each garment is a testament to the intersection of art and fashion.",
    mainImage: "/assets/heritage/heritage_storytelling.png", thumbImages: ["/assets/heritage/handcrafted_luxury.png", "/assets/heritage/heritage_storytelling.png"],
  },
  {
    id: 4, icon: <IconGem />, title: "Premium Ethnic Identity", desc: "Elegant. Authentic. Unapologetically ours.",
    popupTitle: "Defining Premium Ethnic Identity", popupSubtitle: "Unapologetically Rooted, Effortlessly Global",
    popupBody: "Our designs celebrate the richness of Indian heritage without compromise. We merge the boldness of ethnic identity with the sophistication of modern luxury.",
    mainImage: "/assets/heritage/handcrafted_luxury.png", thumbImages: ["/assets/heritage/heritage_storytelling.png", "/assets/heritage/handcrafted_luxury.png"],
  },
  {
    id: 5, icon: <IconThread />, title: "Emotional Connection", desc: "More than fashion, it's an inheritance.",
    popupTitle: "The Power of Emotional Connection", popupSubtitle: "Woven with Love, Worn with Pride",
    popupBody: "Fashion fades, but emotion endures. We create garments that become part of your family's story — pieces that carry the warmth of generations.",
    mainImage: "/assets/heritage/heritage_storytelling.png", thumbImages: ["/assets/heritage/handcrafted_luxury.png", "/assets/heritage/heritage_storytelling.png"],
  },
];

// ── Slides Data ──────────────────────────────────────────────────────────────
const DEFAULT_SLIDES = [
  {
    id: 1,
    image: "/assets/hero/hero_1.png",
    badge: "The Future of Craft",
    heading: "A place to display your <span>Heritage.</span>",
    description: "Where centuries old traditions meet contemporary craftsmanship. Handcrafted for the modern world.",
    primaryCTA: "Explore Collection",
    secondaryCTA: "Our Story"
  },
  {
    id: 2,
    image: "/assets/hero/hero_2.png",
    badge: "Artisan Excellence",
    heading: "Elegance in Every <span>Thread.</span>",
    description: "Discover the intricate details of hand-woven luxury. Each piece tells a story of passion and precision.",
    primaryCTA: "View Details",
    secondaryCTA: "Philosophy"
  },
  {
    id: 3,
    image: "/assets/hero/hero_3.png",
    badge: "Premium Identity",
    heading: "Redefining <span>Luxury</span> Fashion.",
    description: "Unapologetically authentic. Timeless pieces designed to empower your unique style and heritage.",
    primaryCTA: "Shop Now",
    secondaryCTA: "Watch Film"
  }
];

// ── Framer Motion Variants ───────────────────────────────────────────────────
const contentVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.5 + i * 0.1,
      duration: 0.8,
      ease: [0.215, 0.61, 0.355, 1.0] as any // Casting as any to bypass strict cubic-bezier array check if needed, or use string
    }
  })
};

// ── Popup Animation Variants ─────────────────────────────────────────────────
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as any } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut" as const } },
};
const popupVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
  exit: { opacity: 0, y: 40, scale: 0.97, transition: { duration: 0.35, ease: "easeInOut" as const } },
};
const textSlideVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }),
};
const imageRevealVariants = {
  hidden: { opacity: 0, scale: 1.08 },
  visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: 0.3 + i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] as any } }),
};

interface HeroProps {
  initialCms?: any;
}

const Hero: React.FC<HeroProps> = ({ initialCms }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const floatRef1 = useRef<HTMLDivElement>(null);
  const floatRef2 = useRef<HTMLDivElement>(null);

  // Dynamic CMS-controlled Hero values
  const [heroImage, setHeroImage] = useState<string>(
    initialCms?.heroImage?.trim() || "/assets/hero/hero_1.png"
  );
  const [heroHeading, setHeroHeading] = useState<string>(
    initialCms?.heroTitle?.trim() || ""
  );
  const [heroDescription, setHeroDescription] = useState<string>(
    initialCms?.heroSubtitle?.trim() || ""
  );

  const refreshHeroCms = async () => {
    try {
      const res = await fetch("/api/cms", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.cms) {
        if (data.cms.heroImage && data.cms.heroImage.trim()) {
          setHeroImage(data.cms.heroImage.trim());
        } else {
          setHeroImage("/assets/hero/hero_1.png");
        }
        if (data.cms.heroTitle && data.cms.heroTitle.trim()) {
          setHeroHeading(data.cms.heroTitle.trim());
        }
        if (data.cms.heroSubtitle && data.cms.heroSubtitle.trim()) {
          setHeroDescription(data.cms.heroSubtitle.trim());
        }
      }
    } catch (e) {
      console.warn("Could not refresh hero CMS data:", e);
    }
  };

  useEffect(() => {
    refreshHeroCms();
    window.addEventListener("focus", refreshHeroCms);
    return () => window.removeEventListener("focus", refreshHeroCms);
  }, []);

  // Compute slides dynamically with hero background image on primary slide (and any additional slides)
  const activeSlides = useMemo(() => {
    let customImages: string[] = [];
    if (heroImage && heroImage.trim()) {
      try {
        const parsed = JSON.parse(heroImage);
        if (Array.isArray(parsed)) {
          customImages = parsed.map((s) => String(s).trim());
        }
      } catch {}
    }

    return DEFAULT_SLIDES.map((slide, index) => {
      const slideCustomImage = customImages[index] || (index === 0 ? heroImage : "");
      return {
        ...slide,
        image: slideCustomImage && slideCustomImage.trim() ? slideCustomImage : slide.image,
        heading: (index === 0 && heroHeading) ? heroHeading : slide.heading,
        description: (index === 0 && heroDescription) ? heroDescription : slide.description,
      };
    });
  }, [heroImage, heroHeading, heroDescription]);

  // ── Popup State ──
  const [activePopup, setActivePopup] = useState<FeatureItem | null>(null);
  const [hoveredFeatureId, setHoveredFeatureId] = useState<number | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  const openPopup = useCallback((card: FeatureItem) => {
    setActivePopup(card);
    setActiveGalleryIdx(0); // Reset gallery index when opening
    // Removed body scroll lock per request "back side scroll work"
  }, []);

  const closePopup = useCallback(() => {
    setActivePopup(null);
  }, []);

  const allGalleryImages = activePopup ? [activePopup.mainImage, ...activePopup.thumbImages] : [];

  const handleNextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveGalleryIdx((prev) => (prev + 1) % allGalleryImages.length);
  };

  const handlePrevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveGalleryIdx((prev) => (prev - 1 + allGalleryImages.length) % allGalleryImages.length);
  };

  // ── GSAP Floating Animations ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (floatRef1.current) {
        gsap.to(floatRef1.current, {
          x: "random(-50, 50)",
          y: "random(-50, 50)",
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true
        });
      }

      if (floatRef2.current) {
        gsap.to(floatRef2.current, {
          x: "random(-60, 60)",
          y: "random(-60, 60)",
          duration: 7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true
        });
      }

      // Floating effect for the content - subtle and high FPS
      gsap.to(".hero__content", {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        force3D: true
      });
    }, containerRef);

    // Parallax effect on mouse move with optimization
    let xPos = 0;
    let yPos = 0;
    let animationFrameId: number;

    const updateParallax = () => {
      gsap.to(".hero__image-wrapper", {
        x: xPos,
        y: yPos,
        duration: 2,
        ease: "power2.out",
        force3D: true,
        overwrite: "auto"
      });
      animationFrameId = requestAnimationFrame(updateParallax);
    };

    const handleMouseMove = (e: MouseEvent) => {
      xPos = (e.clientX / window.innerWidth - 0.5) * 30;
      yPos = (e.clientY / window.innerHeight - 0.5) * 30;
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(updateParallax);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section ref={containerRef} className="hero">
      {/* Background Layers */}
      <div ref={floatRef1} className="hero__float" style={{ top: "10%", left: "5%" }} />
      <div ref={floatRef2} className="hero__float" style={{ bottom: "10%", right: "5%" }} />

      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        speed={1500}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop={true}
        navigation={{
          prevEl: ".hero__nav-btn--prev",
          nextEl: ".hero__nav-btn--next",
        }}
        pagination={{
          el: ".hero__pagination",
          clickable: true,
        }}
        className="hero__swiper"
      >
        {activeSlides.map((slide) => (
          <SwiperSlide key={slide.id} className="hero__slide">
            {({ isActive }) => (
              <>
                {/* Background Image with Zoom effect */}
                <div className="hero__image-wrapper">
                  <motion.img
                    src={slide.image}
                    alt={slide.badge}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: isActive ? 1.05 : 1.2 }}
                    transition={{ duration: 10, ease: "linear" }}
                  />
                </div>

                {/* Dark Overlay */}
                <div className="hero__overlay" />

                {/* Content */}
                <div className="hero__content">
                  <AnimatePresence>
                    {isActive && (
                      <>
                        <motion.span
                          className="hero__badge"
                          variants={contentVariants}
                          custom={0}
                          initial="hidden"
                          animate="visible"
                        >
                          {slide.badge}
                        </motion.span>

                        <motion.h1
                          className="hero__heading"
                          variants={contentVariants}
                          custom={1}
                          initial="hidden"
                          animate="visible"
                          dangerouslySetInnerHTML={{ __html: slide.heading }}
                        />

                        <motion.p
                          className="hero__description"
                          variants={contentVariants}
                          custom={2}
                          initial="hidden"
                          animate="visible"
                        >
                          {slide.description}
                        </motion.p>

                        <motion.div
                          className="hero__actions"
                          variants={contentVariants}
                          custom={3}
                          initial="hidden"
                          animate="visible"
                        >
                          <button className="hero__btn hero__btn--primary">
                            {slide.primaryCTA}
                            <ArrowRight size={18} />
                          </button>
                          <button className="hero__btn hero__btn--secondary">
                            {slide.secondaryCTA}
                            {slide.secondaryCTA.toLowerCase().includes("film") || slide.secondaryCTA.toLowerCase().includes("story") ? <Play size={18} /> : null}
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </SwiperSlide>
        ))}

        {/* Custom Navigation */}
        <button className="hero__nav-btn hero__nav-btn--prev">
          <ChevronLeft size={24} />
        </button>
        <button className="hero__nav-btn hero__nav-btn--next">
          <ChevronRight size={24} />
        </button>

        {/* Custom Pagination */}
        <div className="hero__pagination" />
      </Swiper>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* FEATURE STRIP — Interactive Heritage Cards                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="hero__features-container">
        <motion.div
          className="hero__features"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {features.map((f, i) => (
            <React.Fragment key={f.title}>
              <div
                className={`hero__feature ${f.highlight ? "hero__feature--highlight" : ""} ${hoveredFeatureId !== null && hoveredFeatureId !== f.id ? "hero__feature--dimmed" : ""} ${hoveredFeatureId === f.id ? "hero__feature--active" : ""}`}
                onMouseEnter={() => setHoveredFeatureId(f.id)}
                onMouseLeave={() => setHoveredFeatureId(null)}
                onClick={() => openPopup(f)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openPopup(f)}
              >
                <span className="hero__feature-icon">{f.icon}</span>
                <div className="hero__feature-content">
                  <h3 className="hero__feature-title">{f.title}</h3>
                  <p className="hero__feature-desc">{f.desc}</p>
                </div>
                <span className="hero__feature-arrow"><ArrowRight size={14} /></span>
              </div>
              {i < features.length - 1 && <div className="hero__feature-divider" />}
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* HERITAGE POPUP MODAL                                                */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activePopup && (
          <motion.div className="hero-popup__overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit" onClick={closePopup}>
            <motion.div className="hero-popup" variants={popupVariants} initial="hidden" animate="visible" exit="exit" onClick={(e) => e.stopPropagation()}>
              <button className="hero-popup__close" onClick={closePopup} aria-label="Close popup"><X size={22} /></button>
              <div className="hero-popup__container">
                {/* LEFT: Editorial Content */}
                <div className="hero-popup__content">
                  <motion.span className="hero-popup__label" variants={textSlideVariants} custom={0} initial="hidden" animate="visible">{activePopup.popupSubtitle}</motion.span>
                  <motion.div className="hero-popup__gold-line" variants={textSlideVariants} custom={1} initial="hidden" animate="visible" />
                  <motion.h2 className="hero-popup__title" variants={textSlideVariants} custom={2} initial="hidden" animate="visible">{activePopup.popupTitle}</motion.h2>
                  <motion.p className="hero-popup__body" variants={textSlideVariants} custom={3} initial="hidden" animate="visible">{activePopup.popupBody}</motion.p>
                </div>
                {/* RIGHT: Editorial Gallery with Navigation */}
                <div className="hero-popup__gallery">
                  <motion.div className="hero-popup__main-img" variants={imageRevealVariants} custom={0} initial="hidden" animate="visible">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeGalleryIdx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="hero-popup__img-slide"
                      >
                        <Image
                          src={allGalleryImages[activeGalleryIdx]}
                          alt={activePopup.popupTitle}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{ objectFit: 'cover' }}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Gallery Nav Buttons */}
                    <div className="hero-popup__gallery-nav">
                      <button className="hero-popup__nav-btn" onClick={handlePrevImg}><ChevronLeft size={20} /></button>
                      <button className="hero-popup__nav-btn" onClick={handleNextImg}><ChevronRight size={20} /></button>
                    </div>

                    <div className="hero-popup__img-counter">
                      {activeGalleryIdx + 1} / {allGalleryImages.length}
                    </div>
                  </motion.div>

                  <div className="hero-popup__thumbs">
                    {allGalleryImages.map((img, idx) => (
                      <motion.div
                        key={idx}
                        className={`hero-popup__thumb ${activeGalleryIdx === idx ? "hero-popup__thumb--active" : ""}`}
                        variants={imageRevealVariants}
                        custom={idx + 1}
                        initial="hidden"
                        animate="visible"
                        onClick={() => setActiveGalleryIdx(idx)}
                      >
                        <Image src={img} alt={`${activePopup.title} detail ${idx + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* QUOTE BAND (Restored)                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="hero__quote-band">
        <div className="hero__quote-inner">
          <motion.blockquote
            className="hero__quote"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <em>
              &ldquo;We don&rsquo;t just create clothing, we preserve traditions.&rdquo;
              <br />
              Every thread carries a story. Every piece carries a legacy.
            </em>
          </motion.blockquote>

          <div className="hero__brand-sig">
            <div className="hero__brand-emblem">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="1" />
                <path d="M12 26V14L18 10L24 14V26" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                <path d="M15 26V21H21V26" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="hero__brand-lines">
              <span>ROOTED IN CULTURE.</span>
              <span>CRAFTED FOR GENERATIONS.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;