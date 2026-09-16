"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore, Product } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import "../collection/CollectionCatalog.scss"; // Reuse catalog styles for consistent UI grids

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const wishlist = useStore((state) => state.wishlist);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleQuickAdd = (product: Product) => {
    // Add default size (usually "S", "One Size", etc.)
    const defaultSize = product.sizes[0] || "One Size";
    addToCart(product, 1, defaultSize);
  };

  return (
    <main className="relative pt-[120px] pb-[100px] bg-white min-h-screen">
      {/* Decorative Jali Pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='38' fill='none' stroke='%23000000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} 
      />

      <div className="catalog-section__container">
        
        {/* Editorial Header */}
        <div className="catalog-header">
          <span className="catalog-header__tag">Your Vault</span>
          <h1 className="catalog-header__title">Atelier Wishlist</h1>
          <p className="catalog-header__desc">
            Your saved items of generation handloom silk and custom bridal weaves.
          </p>
        </div>

        {wishlist.length === 0 ? (
          // EMPTY WISHLIST STATE
          <div className="catalog-empty text-center">
            <div className="empty-icon-wrapper" style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255, 106, 0, 0.08)', 
              color: '#FF6A00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Heart size={40} />
            </div>
            <h3>Your Wishlist is Empty</h3>
            <p>You haven't favorited any masterpieces yet. Tap the heart on products you love to save them here.</p>
            <Link href="/collection" className="catalog-empty__btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Browse Master Catalog
            </Link>
          </div>
        ) : (
          // WISHLIST GRID
          <motion.div className="product-grid" layout>
            <AnimatePresence mode="popLayout">
              {wishlist.map((product) => (
                <motion.div
                  key={product.id}
                  layoutId={`wishlist-product-${product.id}`}
                  className="product-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="product-card__image-box">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="product-card__img"
                    />
                    <div className="product-card__overlay" style={{ opacity: 1 }} />
                    <span className="product-card__badge">{product.badge}</span>
                    
                    {/* Actions */}
                    <div className="product-card__actions" style={{ transform: 'translateY(0)', opacity: 1 }}>
                      <button 
                        className="action-btn"
                        onClick={() => toggleWishlist(product)}
                        title="Remove from Wishlist"
                        style={{ color: '#FF6A00' }}
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleQuickAdd(product)}
                        title="Add to Bag"
                      >
                        <ShoppingBag size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="product-card__info">
                    <span className="product-card__category">{product.subcategory}</span>
                    <h3 className="product-card__title">{product.title}</h3>
                    
                    <div className="product-card__meta">
                      <span className="price">₹{product.price.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {wishlist.length > 0 && (
          <div className="text-center" style={{ marginTop: '50px' }}>
            <Link href="/collection" className="back-link" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: 'rgba(26, 26, 26, 0.6)', 
              fontFamily: 'var(--font-poppins)', 
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}>
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
