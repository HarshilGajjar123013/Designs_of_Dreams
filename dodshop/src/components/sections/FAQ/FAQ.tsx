"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, Sparkles, MessageCircle, Truck, Shield, Scissors } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const faqCategories = [
  { id: "all", label: "All Questions" },
  { id: "product", label: "Our Products" },
  { id: "shipping", label: "Shipping" },
  { id: "care", label: "Care & Exchanges" },
];

const faqData: { category: string; item: FAQItem }[] = [
  {
    category: "product",
    item: {
      question: "Are your garments made from 100% pure silk and authentic handlooms?",
      answer: "Absolutely. At Designs of Dreams, we deal exclusively in certified pure silks (including Katan mulberry silk, tussar, and raw silk) and handloom organic fibers. Every piece is hand-spun and crafted by master weavers in India, preserving ancient Peeli Kothi and Varanasi techniques.",
      icon: <Sparkles size={18} />
    }
  },
  {
    category: "product",
    item: {
      question: "How long does it take to weave a custom handloom saree?",
      answer: "Depending on the complexity of the pattern and the weave style (like heavy zardozi, Kadwa, or Jamdani), a single handloom saree takes anywhere between 15 to 30 days of meticulous manual labor (150 to 300 hours). Custom bridal couture orders typically require 4 to 6 weeks to finalize.",
      icon: <Scissors size={18} />
    }
  },
  {
    category: "shipping",
    item: {
      question: "What are your shipping rates and delivery timelines?",
      answer: "We offer complimentary express shipping across India on all orders exceeding ₹1,999. For standard orders, domestic delivery takes 3 to 5 business days. We also ship globally via DHL/FedEx; international delivery takes 7 to 12 business days, with rates calculated dynamically at checkout.",
      icon: <Truck size={18} />
    }
  },
  {
    category: "care",
    item: {
      question: "What is your exchange policy?",
      answer: "We offer a 7-day exchange policy for all unworn, unaltered standard garments with original atelier tags intact. You can request a size or design exchange, or receive atelier store credit. Custom-sized blouses and personalized bespoke embroidery orders are final sale once handcrafting begins.",
      icon: <Shield size={18} />
    }
  },
  {
    category: "care",
    item: {
      question: "How should I store and care for my luxury silk sarees?",
      answer: "We highly recommend professional dry cleaning only. To preserve the shine of real gold and silver zari threads, store your sarees wrapped individually in breathable cotton or muslin bags. Avoid spraying perfume directly on the zari and refold the sarees every few months to prevent fiber creasing.",
      icon: <MessageCircle size={18} />
    }
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFaqs = activeCategory === "all" 
    ? faqData 
    : faqData.filter(f => f.category === activeCategory);

  return (
    <section className="faq-section">
      {/* Decorative background elements */}
      <div className="faq-section__deco-circle faq-section__deco-circle--1" />
      <div className="faq-section__deco-circle faq-section__deco-circle--2" />

      <div className="faq-section__container">
        
        {/* Editorial Heading */}
        <motion.div 
          className="faq-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="faq-header__tag">
            <HelpCircle size={14} /> Client Concierge
          </span>
          <h2 className="faq-header__title">Frequently Asked Questions</h2>
          <p className="faq-header__desc">
            Find immediate answers regarding our organic textiles, custom atelier orders, shipping networks, and heritage preservation.
          </p>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div 
          className="faq-tabs"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              className={`faq-tabs__btn ${activeCategory === cat.id ? "is-active" : ""}`}
              onClick={() => { setActiveCategory(cat.id); setActiveIndex(null); }}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* FAQ Accordion List */}
        <div className="faq-list">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="faq-list__inner"
            >
              {filteredFaqs.map((entry, index) => {
                const isOpen = activeIndex === index;
                return (
                  <motion.div 
                    key={index}
                    className={`faq-item ${isOpen ? "is-open" : ""}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <button 
                      className="faq-item__trigger" 
                      onClick={() => toggleFAQ(index)}
                      aria-expanded={isOpen}
                    >
                      <div className="faq-item__left">
                        <span className="faq-item__number">{String(index + 1).padStart(2, "0")}</span>
                        <span className="faq-item__icon-circle">{entry.item.icon}</span>
                        <span className="faq-item__question">{entry.item.question}</span>
                      </div>
                      <span className="faq-item__toggle">
                        <motion.div
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Plus size={20} />
                        </motion.div>
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          className="faq-item__content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="faq-item__answer-inner">
                            <p>{entry.item.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="faq-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p>Still have questions?</p>
          <a href="/contact" className="faq-cta__btn">
            <MessageCircle size={16} />
            Contact Our Atelier
          </a>
        </motion.div>

      </div>
    </section>
  );
}
