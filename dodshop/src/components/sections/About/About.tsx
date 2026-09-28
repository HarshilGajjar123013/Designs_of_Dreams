"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Heart,
  Users,
  Compass,
  ShieldCheck,
  Download,
  Printer,
  ArrowRight,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Leaf,
  CheckCircle2,
  Eye,
  Star,
  Feather,
} from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import AboutLookbookPrint from "./AboutLookbookPrint";
import "./About.scss";

// ── Philosophy Panels (Section 3) ──
const philosophyCards = [
  {
    num: "01",
    title: "Traditional Craft",
    tagline: "Heirloom Techniques",
    desc: "Preserving generational embroidery, zardozi needlework, and authentic handloom weaves passed down through master artisan lineages.",
    icon: <Compass size={22} />,
  },
  {
    num: "02",
    title: "Artisan Empowerment",
    tagline: "Dignity & Livelihoods",
    desc: "Creating sustainable employment opportunities for local artisans, especially rural women, providing financial independence and creative recognition.",
    icon: <Users size={22} />,
  },
  {
    num: "03",
    title: "Sustainable Fashion",
    tagline: "Conscious Luxury",
    desc: "Rejecting fast fashion in favor of natural mulberry silks, breathable pure cottons, and timeless heirloom garments designed to be cherished for generations.",
    icon: <Leaf size={22} />,
  },
  {
    num: "04",
    title: "Timeless Design",
    tagline: "Contemporary Grace",
    desc: "Harmonizing rich Indian heritage with modern silhouettes so that every drape feels effortless, celebratory, and authentically yours.",
    icon: <Sparkles size={22} />,
  },
];

// ── Craft & Collections (Section 4) ──
const collectionsData = [
  {
    id: "sarees",
    name: "Saree Collection",
    tagline: "Drapes That Tell Stories",
    desc: "From the majestic Royal Red to hand-detailed Classic Blue, each drape embodies sisterhood, cultural pride, and generational grace.",
    image: "/assets/lookbook/page_3.png",
    itemsCount: "8 Signature Drapes",
    link: "/shop?category=Sarees",
    highlights: ["Royal Red", "Vibrant Red", "Elegant Grey", "Classic Blue"],
  },
  {
    id: "dress-materials",
    name: "Dress Material Collection",
    tagline: "Handcrafted details, timeless expression.",
    desc: "Pure breathable fabrics adorned with bespoke hand-embroidered yokes, peacock motifs, and delicate sequence work.",
    image: "/assets/lookbook/page_4.png",
    itemsCount: "Unstitched Suites",
    link: "/shop?category=Dress+Materials",
    highlights: ["Embroidered Yokes", "Natural Silks", "Vibrant Hues", "Bespoke Cuts"],
  },
  {
    id: "dupattas",
    name: "Duppatta Collection",
    tagline: "Heritage | Handcrafted | Timeless",
    desc: "Intricate border embroidery, regal latkans, minimal motifs, and bold ikat weaves that elevate any traditional ensemble.",
    image: "/assets/lookbook/page_5.png",
    itemsCount: "Artisanal Borders",
    link: "/shop?category=Dupattas",
    highlights: ["Playful Trim", "Artisanal Beauty", "Ikat Elegance", "Royal Detail"],
  },
  {
    id: "blouse-tassels",
    name: "Blouse Tassels Collection",
    tagline: "Detail | Drape | Design | Delight",
    desc: "Traditional details meet modern appeal. Handcrafted coin charms, emerald drops, and royal latkans made bead-by-bead.",
    image: "/assets/lookbook/page_6.png",
    itemsCount: "Handmade Trims",
    link: "/shop?category=Accessories",
    highlights: ["Teal Coin Charm", "Emerald Elegance", "Traditional Jhumkas", "Royal Latkan"],
  },
  {
    id: "unstitched-blouses",
    name: "Unstitched Blouses Collection",
    tagline: "Embroider | Customise | Reimagine",
    desc: "Intricate mirror work, ruby radiance, and peacock gardens designed for endless customization by your master tailor.",
    image: "/assets/lookbook/page_7.png",
    itemsCount: "Custom Cut Pieces",
    link: "/shop?category=Blouses",
    highlights: ["Ruby Radiance", "Mirror Muse", "Peacock Garden", "Floral Whispers"],
  },
  {
    id: "fine-craftsmanship",
    name: "Fine Craftsmanship",
    tagline: "The art of embroidery, expressed through every stitch",
    desc: "Textured threadwork, botanical rosework, and layered folk floral art celebrating India's rich textile heritage.",
    image: "/assets/lookbook/page_8.png",
    itemsCount: "7 Signature Arts",
    link: "/shop",
    highlights: ["Textured Threadwork", "Botanical Art", "Ornamental Motifs", "Folk Floral"],
  },
];

// ── Craftsmanship Details (Section 5) ──
const craftsmanshipDetails = [
  {
    num: "01",
    title: "Embroidered Saree",
    desc: "A richly detailed canvas of colour and tradition, blending centuries-old weaving with hand-finished borders.",
    tag: "Heirloom Weave",
  },
  {
    num: "02",
    title: "Textured Threadwork",
    desc: "Layered embroidery motifs that create tactile relief and luminous depth across natural woven fabrics.",
    tag: "Relief Texture",
  },
  {
    num: "03",
    title: "Ornamental Motif",
    desc: "Reflective mirror accents, metallic threads, and symmetric circular medallions inspired by Indian temple geometry.",
    tag: "Heritage Geometry",
  },
  {
    num: "04",
    title: "Folk Floral Craft",
    desc: "Handworked petals and vines shaped with warmth and character, celebrating botanical forms with organic symmetry.",
    tag: "Floral Needlework",
  },
  {
    num: "05",
    title: "Botanical Embroidery",
    desc: "Delicate rosework with subtle tonal gradients, capturing the fragile elegance of blooming heritage gardens.",
    tag: "Tonal Shading",
  },
  {
    num: "06",
    title: "Contemporary Thread Art",
    desc: "Bold colour palettes balanced with micro-stitched accents, bridging antique craft with modern luxury silhouettes.",
    tag: "Modern Heritage",
  },
];

// ── Values Continuous Thread (Section 7) ──
const brandValues = [
  {
    name: "Tradition",
    tagline: "Rooted in History",
    desc: "Preserving time-honored Indian handcrafts and honoring the generational wisdom of our master artisans.",
  },
  {
    name: "Craftsmanship",
    tagline: "Human Artistry",
    desc: "Every bead, knot, stitch, and border is worked by hand, celebrating the irreplaceable warmth of human touch.",
  },
  {
    name: "Empowerment",
    tagline: "Dignity in Work",
    desc: "Creating sustainable livelihood opportunities for local rural women, fostering financial independence.",
  },
  {
    name: "Sustainability",
    tagline: "Slow & Conscious",
    desc: "Pure natural materials, ethical craft clusters, and heirloom designs built to outlive transient fast-fashion trends.",
  },
  {
    name: "Timeless Design",
    tagline: "Grace Across Eras",
    desc: "Creating garments that transcend seasons, celebrating heritage across mothers, daughters, and generations.",
  },
];

// ── Lookbook Gallery Images (Section 8) ──
const lookbookGallery = [
  {
    id: 1,
    pageNumber: 1,
    title: "The Lookbook Cover",
    category: "Editorial Cover",
    image: "/assets/lookbook/page_1.png",
    subtitle: "Crafted Traditions. Timeless Style.",
  },
  {
    id: 2,
    pageNumber: 2,
    title: "Our Story & Purpose",
    category: "Brand Story",
    image: "/assets/lookbook/page_2.png",
    subtitle: "Crafting dreams. Supporting artisans.",
  },
  {
    id: 3,
    pageNumber: 3,
    title: "Saree Collection",
    category: "Sarees",
    image: "/assets/lookbook/page_3.png",
    subtitle: "Drapes That Tell Stories",
  },
  {
    id: 4,
    pageNumber: 4,
    title: "Dress Material Collection",
    category: "Dress Materials",
    image: "/assets/lookbook/page_4.png",
    subtitle: "Handcrafted details, timeless expression.",
  },
  {
    id: 5,
    pageNumber: 5,
    title: "Duppatta Collection",
    category: "Dupattas",
    image: "/assets/lookbook/page_5.png",
    subtitle: "Details that make you unique",
  },
  {
    id: 6,
    pageNumber: 6,
    title: "Blouse Tassels Collection",
    category: "Tassels & Trims",
    image: "/assets/lookbook/page_6.png",
    subtitle: "Traditional details, modern appeal",
  },
  {
    id: 7,
    pageNumber: 7,
    title: "Unstitched Blouses",
    category: "Blouses",
    image: "/assets/lookbook/page_7.png",
    subtitle: "Blouse pieces for endless possibilities.",
  },
  {
    id: 8,
    pageNumber: 8,
    title: "Fine Craftsmanship",
    category: "Embroidery Art",
    image: "/assets/lookbook/page_8.png",
    subtitle: "Intricate threadwork & textures",
  },
  {
    id: 9,
    pageNumber: 9,
    title: "Local Artisans",
    category: "Artisans & Impact",
    image: "/assets/lookbook/page_9.png",
    subtitle: "Real People. Real Craft. Real Impact.",
  },
  {
    id: 10,
    pageNumber: 10,
    title: "Gratitude & Connection",
    category: "Closing Note",
    image: "/assets/lookbook/page_10.png",
    subtitle: "More than fashion, A brighter tomorrow",
  },
];

export default function About() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const categories = ["All", "Sarees", "Dress Materials", "Dupattas", "Blouses", "Artisans & Impact"];

  const filteredGallery = lookbookGallery.filter((item) => {
    if (activeCategoryFilter === "All") return true;
    if (activeCategoryFilter === "Sarees") return item.category.includes("Sarees");
    if (activeCategoryFilter === "Dress Materials") return item.category.includes("Dress Materials");
    if (activeCategoryFilter === "Dupattas") return item.category.includes("Dupattas");
    if (activeCategoryFilter === "Blouses") return item.category.includes("Blouses") || item.category.includes("Tassels");
    if (activeCategoryFilter === "Artisans & Impact") return item.category.includes("Artisans") || item.category.includes("Story");
    return true;
  });

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % lookbookGallery.length);
    }
  }, [lightboxIndex]);

  const prevLightbox = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + lookbookGallery.length) % lookbookGallery.length);
    }
  }, [lightboxIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, nextLightbox, prevLightbox]);

  return (
    <div className="about-editorial-root">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 1 — HERO / BRAND INTRODUCTION
          Royal Indian Architectural Jharokha Archway + Haute Couture
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="editorial-hero">
        <div className="hero-ornament-bg" />
        <div className="hero-radial-glow" />

        <div className="editorial-hero__container">
          <div className="editorial-hero__content">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="hero-eyebrow-pill"
            >
              <span className="gold-sparkle">✦</span>
              <span>THE STORY BEHIND THE CRAFT</span>
              <span className="gold-sparkle">✦</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.12 }}
              className="hero-headline"
            >
              Where Tradition <br />
              <span className="hero-headline--shimmer">Becomes a Dream.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.25 }}
              className="hero-description"
            >
              <strong>Designs of Dreams</strong> was born with a single guiding heartbeat: to create dignified,
              sustainable livelihoods for local Indian artisans, especially rural women, while bringing the
              timeless grace of handcrafted sarees, dupattas, and bespoke embroidery to modern celebrations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.38 }}
              className="hero-cta-group"
            >
              <a href="#our-story" className="btn-royal-primary">
                <span>Explore Our Craft</span>
                <ArrowRight size={16} />
              </a>

              <a
                href="/assets/lookbook/DOD_Lookbook.pdf"
                download="Designs_of_Dreams_Lookbook.pdf"
                className="btn-royal-secondary"
                title="Download original high-resolution Lookbook PDF"
              >
                <Download size={16} />
                <span>Download Lookbook (PDF)</span>
              </a>
            </motion.div>

            {/* Haute Couture Category Ribbon with Gold Foil Spacers */}
            <div className="hero-category-ribbon">
              <span>SAREES</span>
              <span className="gold-dot">✦</span>
              <span>DRESS MATERIALS</span>
              <span className="gold-dot">✦</span>
              <span>DUPATTAS</span>
              <span className="gold-dot">✦</span>
              <span>BLOUSES</span>
              <span className="gold-dot">✦</span>
              <span>TASSELS</span>
              <span className="gold-dot">✦</span>
              <span>FINE CRAFTSMANSHIP</span>
            </div>
          </div>

          {/* Right: Architectural Jharokha Archway Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="editorial-hero__visual"
          >
            <div className="hero-arch-frame">
              <div className="arch-outer-trim" />
              <div className="arch-inner-window">
                <img
                  src="/assets/lookbook/page_1.png"
                  alt="Designs of Dreams Lookbook Cover"
                  className="hero-arch-img"
                />
              </div>

              {/* Floating Wax Seal Medallion */}
              <div className="hero-wax-seal">
                <div className="seal-ring">
                  <span className="seal-brand">DESIGNS OF DREAMS</span>
                  <span className="seal-tag">ESTD • 2025</span>
                </div>
              </div>

              {/* Floating Couture Badge */}
              <div className="hero-floating-badge">
                <Sparkles size={14} className="badge-icon" />
                <span>HANDCRAFTED HERITAGE</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="hero-scroll-indicator">
          <span className="scroll-tag">DISCOVER THE STORY</span>
          <div className="scroll-mouse">
            <span className="scroll-wheel" />
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 2 — OUR STORY
          Luxury Magazine Spread with Metric Counters & Artisan Mission
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="our-story" className="editorial-story-section">
        <div className="editorial-container">

          {/* Social Impact Metric Counter Strip */}
          <div className="story-metrics-strip">
            <div className="metric-box">
              <span className="metric-num">120+</span>
              <span className="metric-label">Master Weavers & Rural Women Supported</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-box">
              <span className="metric-num">100%</span>
              <span className="metric-label">Handcrafted Needlework & Pure Heritage</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-box">
              <span className="metric-num">Late 2025</span>
              <span className="metric-label">Founded with an Artisan-First Mission</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-box">
              <span className="metric-num">6</span>
              <span className="metric-label">Signature Heritage Collections</span>
            </div>
          </div>

          <div className="story-split-grid">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9 }}
              className="story-split__left"
            >
              <div className="brand-story-badge">
                <span>ESTABLISHED PURPOSE</span>
              </div>

              <h2 className="editorial-title">
                OUR STORY
              </h2>
              <p className="story-tagline">
                Crafting dreams. Supporting artisans.
              </p>

              <div className="story-large-quote">
                <span className="quote-mark">&ldquo;</span>
                <p>
                  We believe every handcrafted piece carries more than colour, texture and design.
                  It carries patience, heritage, identity and the story of the hands that created it.
                </p>
                <span className="quote-author">— Designs of Dreams Atelier</span>
              </div>

              <div className="story-triad-pills">
                <div className="triad-pill">
                  <strong>TRADITIONAL CRAFT</strong>
                  <span>Generational Mastery</span>
                </div>
                <div className="triad-pill">
                  <strong>CONTEMPORARY GRACE</strong>
                  <span>Timeless Silhouettes</span>
                </div>
                <div className="triad-pill">
                  <strong>MADE WITH PURPOSE</strong>
                  <span>Empowering Women</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9 }}
              className="story-split__right"
            >
              <div className="story-editorial-card">
                <div className="story-card-top-accent" />
                <h3 className="story-card-heading">Founded with a Purpose</h3>

                <p className="story-narrative">
                  <strong>Designs of Dreams</strong> began in late 2025 with an unwavering mission:
                  to create sustainable employment opportunities for local artisans, especially rural women,
                  whose incredible skills and traditional embroidery deserve lasting recognition.
                </p>
                <p className="story-narrative">
                  Across villages and craft clusters, our women artisans practice embroidery techniques
                  passed down from mother to daughter—from fine French knots and delicate rosework to
                  zardozi embellishments and vibrant latkan making.
                </p>
                <p className="story-narrative">
                  Our aim is to support artisans with dignified work, financial independence, and a dedicated platform
                  where their craft can reach homes, celebrations, and wardrobes across generations.
                </p>

                {/* Overlapping Sheet Window */}
                <div className="story-card-sheet-preview">
                  <img
                    src="/assets/lookbook/page_2.png"
                    alt="Our Story Page from Lookbook"
                    className="sheet-img"
                  />
                  <div className="sheet-caption">
                    <span>Lookbook Page 02 • Our Story</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 3 — OUR PHILOSOPHY
          4 Luxury Editorial Information Panels with Gold Flourishes
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="editorial-philosophy-section">
        <div className="editorial-container">
          <div className="section-header-center">
            <span className="section-label-gold">PILLARS OF PURPOSE</span>
            <h2 className="editorial-title">Our Philosophy</h2>
            <p className="section-lead">
              Four principles that guide every weave, thread, stitch, and community initiative.
            </p>
          </div>

          <div className="philosophy-grid">
            {philosophyCards.map((card, i) => (
              <motion.div
                key={card.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="philosophy-card"
              >
                <div className="card-ornament-corner" />
                <div className="card-top-meta">
                  <span className="philosophy-num">{card.num}</span>
                  <div className="philosophy-icon">{card.icon}</div>
                </div>
                <h3 className="philosophy-title">{card.title}</h3>
                <span className="philosophy-tagline">{card.tagline}</span>
                <p className="philosophy-desc">{card.desc}</p>
                <div className="card-shimmer-bar" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 4 — CRAFT & COLLECTIONS
          High-Fashion Runway Showcase of the 6 Lookbook Collections
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="editorial-collections-section">
        <div className="editorial-container">
          <div className="collections-header-row">
            <div>
              <span className="section-label-gold">THE ATELIER PORTFOLIO</span>
              <h2 className="editorial-title">Craft & Collections</h2>
              <p className="section-lead">
                Explore the six distinct categories presented in our official Lookbook.
              </p>
            </div>
            <div className="collections-actions">
              <a
                href="/assets/lookbook/DOD_Lookbook.pdf"
                download="Designs_of_Dreams_Lookbook.pdf"
                className="btn-download-outline"
              >
                <Download size={15} />
                <span>Download Lookbook</span>
              </a>
            </div>
          </div>

          <div className="collections-interactive-gallery">
            {collectionsData.map((col, idx) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: idx * 0.08 }}
                className="collection-card"
              >
                <div className="collection-card__media">
                  <div className="media-arch-top">
                    <img
                      src={col.image}
                      alt={col.name}
                      className="collection-img"
                    />
                  </div>
                  <div className="collection-badge-pill">{col.itemsCount}</div>
                </div>

                <div className="collection-card__content">
                  <span className="col-tagline">{col.tagline}</span>
                  <h3 className="col-name">{col.name}</h3>
                  <p className="col-desc">{col.desc}</p>

                  <div className="col-highlights">
                    {col.highlights.map((h, i) => (
                      <span key={i} className="highlight-chip">{h}</span>
                    ))}
                  </div>

                  <Link href={col.link} className="col-explore-link">
                    <span>Explore Collection</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 5 — THE ART OF CRAFTSMANSHIP
          Dark Royal Midnight Velvet + Gilded Gold Embroidery Spotlight
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="editorial-craftsmanship-section">
        <div className="craft-velvet-glow" />

        <div className="editorial-container">
          <div className="craft-hero-banner">
            <span className="section-label-gold">TRADITION • PRECISION • ARTISANSHIP</span>
            <h2 className="craft-headline">FINE CRAFTSMANSHIP</h2>
            <p className="craft-subhead">
              The art of embroidery, expressed through every stitch.
            </p>
            <div className="craft-descriptors">
              <span>Intricate Threadwork</span>
              <span className="sep">✦</span>
              <span>Handcrafted Texture</span>
              <span className="sep">✦</span>
              <span>Timeless Detail</span>
            </div>
          </div>

          <div className="craftsmanship-editorial-grid">
            <div className="craft-editorial-lead-box">
              <div className="lead-box-gold-crest">❧ ❦ ☙</div>
              <h3 className="lead-box-title">Every Stitch Has a Soul</h3>
              <p className="lead-box-text">
                At Designs of Dreams, luxury is measured in the deliberate pacing of the needle.
                Behind every garment is hours of focused artisan handwork—from tracing balanced floral
                vines to layering raised satin stitches and knotting bespoke tassels.
              </p>
              <p className="lead-box-text">
                Every handcrafted piece carries the character, patience, and devotion of the artisan hands behind it.
              </p>
              <div className="artisan-signature-stamp">
                <span className="stamp-sub">DESIGNS OF DREAMS</span>
                <strong className="stamp-main">HANDCRAFTED WITH PURPOSE</strong>
                <span className="stamp-loc">ESTABLISHED LATE 2025</span>
              </div>
            </div>

            <div className="craft-cards-masonry">
              {craftsmanshipDetails.map((item) => (
                <div key={item.num} className="craft-item-panel">
                  <div className="panel-header">
                    <span className="item-num">{item.num}</span>
                    <span className="item-tag">{item.tag}</span>
                  </div>
                  <h4 className="item-title">{item.title}</h4>
                  <p className="item-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 6 — LOCAL ARTISANS
          Heartwarming & Emotional Asymmetric Storytelling
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="editorial-artisans-section">
        <div className="editorial-container">
          <div className="section-header-center">
            <span className="section-label-gold">PEOPLE • CRAFT • CULTURE</span>
            <h2 className="editorial-title">Local Artisans</h2>
            <p className="section-lead">
              Real People. Real Craft. Real Impact.
            </p>
          </div>

          <div className="artisan-story-asymmetric">
            {/* Left: Jharokha Arch Artisan Photography */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="artisan-visual-column"
            >
              <div className="artisan-arch-window">
                <img
                  src="/assets/lookbook/page_9.png"
                  alt="Local Artisans Working on Handcrafted Textiles"
                  className="artisan-sheet-img"
                />
                <div className="artisan-overlay-tag">
                  <span>REAL PEOPLE • REAL CRAFT • REAL IMPACT</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Emotional Impact Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="artisan-narrative-column"
            >
              <div className="artisan-statement-badge">
                <Heart size={16} className="heart-icon" />
                <span>Empowering Artisans. Enriching Lives.</span>
              </div>

              <h3 className="artisan-h3">We Create Opportunities</h3>

              <p className="artisan-p">
                At <strong>Designs of Dreams</strong>, we work closely with skilled local artisans
                who keep alive India&apos;s rich textile and embroidery heritage. Our pieces are a direct
                result of their talent, dedication, and years of practice passed down through generations.
              </p>

              <p className="artisan-p">
                By creating sustainable employment opportunities, especially for rural women, we aim to
                support artisan communities, preserve endangered traditional crafts, and bring their
                extraordinary handiwork to a dignified, wider platform.
              </p>

              <div className="impact-grid-four">
                <div className="impact-item">
                  <CheckCircle2 size={18} className="check-icon" />
                  <div>
                    <strong>Supporting Local Talent</strong>
                    <span>Providing fair, regular income</span>
                  </div>
                </div>
                <div className="impact-item">
                  <CheckCircle2 size={18} className="check-icon" />
                  <div>
                    <strong>Sustainable Livelihoods</strong>
                    <span>Financial independence for rural women</span>
                  </div>
                </div>
                <div className="impact-item">
                  <CheckCircle2 size={18} className="check-icon" />
                  <div>
                    <strong>Preserving Traditional Crafts</strong>
                    <span>Keeping ancient techniques alive</span>
                  </div>
                </div>
                <div className="impact-item">
                  <CheckCircle2 size={18} className="check-icon" />
                  <div>
                    <strong>Handmade Creations</strong>
                    <span>No mass machines, pure human warmth</span>
                  </div>
                </div>
              </div>

              <div className="artisan-concluding-quote">
                <p>&ldquo;Crafting a kinder, brighter tomorrow — one stitch at a time.&rdquo;</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 7 — OUR VALUES
          Continuous Golden Thread Connecting the 5 Pillars
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="editorial-values-section">
        <div className="editorial-container">
          <div className="section-header-center">
            <span className="section-label-gold">GUIDING PRINCIPLES</span>
            <h2 className="editorial-title">Our Values</h2>
            <p className="section-lead">
              A continuous golden thread connecting our past, our artisans, and our future.
            </p>
          </div>

          <div className="values-thread-track">
            <div className="thread-golden-line" />
            <div className="values-items-wrapper">
              {brandValues.map((val, i) => (
                <div key={val.name} className="value-thread-node">
                  <div className="node-marker">
                    <span className="node-dot" />
                    <span className="node-num">0{i + 1}</span>
                  </div>
                  <div className="node-content">
                    <h3 className="node-title">{val.name}</h3>
                    <span className="node-tagline">{val.tagline}</span>
                    <p className="node-desc">{val.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 8 — VISUAL LOOKBOOK EXPERIENCE
          Interactive Magazine Gallery + Full-Screen Lightbox Flip
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="editorial-lookbook-gallery-section">
        <div className="editorial-container">
          <div className="section-header-center">
            <span className="section-label-gold">ORIGINAL ARCHIVE</span>
            <h2 className="editorial-title">The Lookbook Gallery</h2>
            <p className="section-lead">
              Browse each page of our official Lookbook. Click any image to view in high-resolution or flip through pages.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="gallery-filter-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`filter-tab-btn ${activeCategoryFilter === cat ? "active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <div className="lookbook-gallery-grid">
            {filteredGallery.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="gallery-card"
                onClick={() => openLightbox(lookbookGallery.findIndex(g => g.id === item.id))}
              >
                <div className="gallery-card__inner">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="gallery-img"
                    loading="lazy"
                  />
                  <div className="gallery-overlay">
                    <span className="overlay-page-tag">Page 0{item.pageNumber}</span>
                    <span className="overlay-cat">{item.category}</span>
                    <h4 className="overlay-title">{item.title}</h4>
                    <span className="overlay-sub">{item.subtitle}</span>
                    <div className="overlay-zoom-btn">
                      <Maximize2 size={15} />
                      <span>View High-Res</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Enhanced Lightbox Modal with Next / Prev page controls */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lightbox-backdrop"
              onClick={closeLightbox}
            >
              <div
                className="lightbox-dialog"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="lightbox-top-bar">
                  <div className="lightbox-page-indicator">
                    <span>Lookbook Page {lookbookGallery[lightboxIndex].pageNumber} of {lookbookGallery.length}</span>
                    <strong className="lightbox-item-title">{lookbookGallery[lightboxIndex].title}</strong>
                  </div>

                  <div className="lightbox-actions-group">
                    <a
                      href="/assets/lookbook/DOD_Lookbook.pdf"
                      download="Designs_of_Dreams_Lookbook.pdf"
                      className="lightbox-download-action"
                      title="Download Full PDF"
                    >
                      <Download size={16} />
                      <span>Download PDF</span>
                    </a>

                    <button
                      type="button"
                      onClick={closeLightbox}
                      className="lightbox-close-btn"
                      title="Close (Esc)"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="lightbox-image-stage">
                  <button
                    type="button"
                    onClick={prevLightbox}
                    className="lightbox-nav-arrow arrow-prev"
                    title="Previous Page (←)"
                  >
                    <ChevronLeft size={28} />
                  </button>

                  <div className="lightbox-image-wrapper">
                    <img
                      src={lookbookGallery[lightboxIndex].image}
                      alt={lookbookGallery[lightboxIndex].title}
                      className="lightbox-img"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={nextLightbox}
                    className="lightbox-nav-arrow arrow-next"
                    title="Next Page (→)"
                  >
                    <ChevronRight size={28} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 9 — BRAND STATEMENT
          Calm Cream with Gilded Indian Heritage Flourishes
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="editorial-statement-section">
        <div className="statement-flourish-top">❧ ❦ ☙</div>

        <div className="editorial-container">
          <div className="statement-box">
            <h2 className="statement-quote">
              &ldquo;Tradition in Every Stitch. <br />
              Stories in Every Thread.&rdquo;
            </h2>
            <div className="statement-divider-line" />
            <p className="statement-body">
              Designs of Dreams is an invitation to celebrate the hands that weave India&apos;s heritage.
              When you wear one of our creations, you do not simply wear fashion—you carry forward an artisan&apos;s
              patience, an ancient tradition, and a brighter tomorrow for artisan families.
            </p>
          </div>
        </div>

        <div className="statement-flourish-bottom">❧ ❦ ☙</div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 10 — FINAL CTA
          Royal Invitation to Celebrate Tradition & Connect
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="editorial-final-cta-section">
        <div className="editorial-container">
          <div className="final-cta-card">
            <div className="final-card-gold-crest">❧ ❦ ☙</div>

            <div className="final-cta-badge">
              <Heart size={22} className="cta-heart" />
            </div>

            <h2 className="final-cta-title">Be Part of the Story</h2>
            <p className="final-cta-subtitle">
              Together, we celebrate tradition, empower artisans, and keep the beauty of handcrafted fashion alive.
            </p>

            <div className="final-cta-buttons">
              <Link href="/shop" className="btn-royal-primary">
                <span>Explore Collection</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="/assets/lookbook/DOD_Lookbook.pdf"
                download="Designs_of_Dreams_Lookbook.pdf"
                className="btn-royal-secondary"
              >
                <Download size={16} />
                <span>Download Lookbook (PDF)</span>
              </a>

              <button
                type="button"
                onClick={handlePrint}
                className="btn-print-ghost"
              >
                <Printer size={16} />
                <span>Print Story</span>
              </button>
            </div>

            {/* Direct Connect Options */}
            <div className="final-connect-bar">
              <span className="connect-label">STAY CONNECTED WITH OUR ATELIER</span>
              <div className="connect-links">
                <a
                  href="https://wa.me/917600074585?text=Hello%20Designs%20of%20Dreams,%20I%20would%20like%20to%20know%20more%20about%20your%20handcrafted%20collections!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="connect-chip connect-chip--wa"
                >
                  <FaWhatsapp size={18} />
                  <span>Call / WhatsApp: <strong>7600074585</strong></span>
                </a>

                <a
                  href="https://instagram.com/designs.of.dreams"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="connect-chip connect-chip--insta"
                >
                  <FaInstagram size={18} />
                  <span>@DESIGNS.OF.DREAMS</span>
                </a>
              </div>
            </div>

            <p className="final-motto">
              More than fashion, A brighter tomorrow ♡
            </p>
          </div>
        </div>
      </section>

      {/* ── High-Fidelity Printable 10-Page A4 Container (Print / PDF save) ── */}
      <AboutLookbookPrint />
    </div>
  );
}
