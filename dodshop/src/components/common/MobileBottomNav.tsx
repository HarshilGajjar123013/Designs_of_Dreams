"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Compass, 
  Heart, 
  ShoppingBag, 
  User, 
  MoreHorizontal,
  BookOpen,
  Mail
} from "lucide-react";

// Path generator that creates a smooth circular dip centered on the active tab's column position
const getPath = (index: number) => {
  const step = 100 / 6;
  const x = (index + 0.5) * step;
  
  // Custom dip transition coordinates (clamped to remain within 0-100 bounds)
  const x1 = x - 8.5;
  const x2 = x - 4.5;
  const x3 = x + 4.5;
  const x4 = x + 8.5;
  
  return `M 0 20 
          Q 0 10 10 10
          L ${Math.max(0, x1)} 10
          Q ${x2} 10 ${x - 3.5} 15.5
          A 6.5 6.5 0 0 0 ${x + 3.5} 15.5
          Q ${x3} 10 ${Math.min(100, x4)} 10
          L 90 10
          Q 100 10 100 20
          L 100 76
          L 0 76
          Z`;
};

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Popover State
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close popup menu on page changes
  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [pathname]);

  // Zustand Store values
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const user = useStore((state) => state.user);

  // Quantities for Badges (only access on client after mounting)
  const cartCount = mounted ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
  const wishlistCount = mounted ? wishlist.length : 0;

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Shop",
      href: "/collection",
      icon: Compass,
    },
    {
      label: "Fav",
      href: "/wishlist",
      badge: wishlistCount,
      icon: Heart,
    },
    {
      label: "Cart",
      href: "/cart",
      badge: cartCount,
      icon: ShoppingBag,
    },
    {
      label: "Profile",
      href: (mounted && user?.isLoggedIn) ? "/profile" : "/login",
      icon: User,
      avatarLabel: (mounted && user?.isLoggedIn && !user?.avatar) ? user.name.charAt(0).toUpperCase() : null,
      avatarUrl: (mounted && user?.isLoggedIn && user?.avatar) ? user.avatar : null,
    },
    {
      label: "More",
      href: "#",
      icon: MoreHorizontal,
    },
  ];

  // Helper to resolve active index
  const getActiveIndex = () => {
    if (isMoreMenuOpen) return 5;
    if (pathname === "/") return 0;
    if (pathname?.startsWith("/collection") || pathname?.startsWith("/product")) return 1;
    if (pathname === "/wishlist") return 2;
    if (pathname === "/cart") return 3;
    if (pathname === "/login" || pathname === "/profile" || pathname === "/order" || pathname === "/settings") return 4;
    return 0;
  };

  const activeIndex = getActiveIndex();
  const activeItem = navItems[activeIndex];
  const ActiveIcon = activeItem.icon;

  // Hide bottom nav on full-screen login and checkout pages
  if (pathname?.startsWith("/login") || pathname?.startsWith("/checkout")) return null;

  return (
    <>
      {/* Pop-up Cards Panel (About Us & Contact Us) above the bottom nav */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreMenuOpen(false)}
              className="md:hidden fixed inset-0 z-[9990] bg-black/40 backdrop-blur-[2px]"
            />
            
            {/* Side-by-side floating cards */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: 30, scale: 0.9, x: "-50%" }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="md:hidden fixed bottom-[96px] left-1/2 w-[calc(100%-2rem)] max-w-sm grid grid-cols-2 gap-4 z-[9991] overflow-visible"
            >
              {/* About Us Card */}
              <Link 
                href="/about"
                className="flex flex-col items-center justify-center py-6 px-4 bg-white border border-[#C5A059]/20 rounded-2xl shadow-xl hover:border-[#FF6A00] transition-all duration-300 group text-center cursor-pointer focus:outline-none relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#C5A059]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-12 h-12 rounded-full bg-[#FF6A00]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <BookOpen className="text-[#FF6A00]" size={22} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-800 relative z-10" style={{ fontFamily: "var(--font-poppins)" }}>About Us</span>
                <span className="text-[9px] text-zinc-400 mt-1 uppercase tracking-widest relative z-10">Our Heritage</span>
              </Link>

              {/* Contact Us Card */}
              <Link 
                href="/contact"
                className="flex flex-col items-center justify-center py-6 px-4 bg-white border border-[#C5A059]/20 rounded-2xl shadow-xl hover:border-[#FF6A00] transition-all duration-300 group text-center cursor-pointer focus:outline-none relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6A00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <Mail className="text-[#C5A059]" size={22} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-800 relative z-10" style={{ fontFamily: "var(--font-poppins)" }}>Contact Us</span>
                <span className="text-[9px] text-zinc-400 mt-1 uppercase tracking-widest relative z-10">Atelier Inquiries</span>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9998] h-[76px] px-2 pb-[safe-area-inset-bottom] overflow-visible">
        
        {/* Dynamic Path-Morphing Background */}
        <div className="absolute inset-0 -z-10 filter drop-shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
          <svg
            width="100%"
            height="76"
            viewBox="0 0 100 76"
            preserveAspectRatio="none"
            className="fill-white stroke-[#C5A059]/15"
          >
            <path
              d={getPath(activeIndex)}
              strokeWidth="0.5"
            />
          </svg>
        </div>

        <div className="relative w-full h-full flex items-center justify-between px-1 overflow-visible">
          
          {/* Floating Bubble containing Active Icon */}
          <motion.div
            className="absolute w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#FF6A00] shadow-[0_5px_15px_rgba(255,106,0,0.15)] z-20 border-[3px] border-white"
            style={{
              top: "0px",
              y: "-15px",
              x: "-50%",
            }}
            animate={{
              left: `${(activeIndex + 0.5) * (100 / 6)}%`
            }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* Active icon crossfade inside floating bubble */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 45, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {activeItem.avatarUrl ? (
                  <img src={activeItem.avatarUrl} alt={activeItem.label} style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                ) : activeItem.avatarLabel ? (
                  <div className="w-6 h-6 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] text-[11px] font-bold flex items-center justify-center">
                    {activeItem.avatarLabel}
                  </div>
                ) : (
                  <ActiveIcon size={20} strokeWidth={2.5} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Active Cart/Wishlist Badge on Floating Bubble */}
            {activeItem.badge !== undefined && activeItem.badge > 0 && (
              <motion.span 
                layoutId="activeBubbleBadge"
                className="absolute -top-1 -right-1 bg-[#C5A059] text-white text-[8px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 border border-white shadow-sm"
              >
                {activeItem.badge}
              </motion.span>
            )}
          </motion.div>

          {/* Navigation Tabs Row */}
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeIndex;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.label === "More") {
                    e.preventDefault();
                    setIsMoreMenuOpen(!isMoreMenuOpen);
                  } else {
                    setIsMoreMenuOpen(false);
                  }
                }}
                className="flex-1 flex flex-col items-center justify-end h-full pb-3 z-10 overflow-visible"
              >
                {/* Icon Container with pop-down animation when inactive */}
                <div className="h-7 flex items-center justify-center overflow-visible relative">
                  <motion.div
                    animate={{
                      scale: isActive ? 0 : 1,
                      opacity: isActive ? 0 : 1,
                      y: isActive ? -10 : 0
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  >
                    {item.avatarUrl ? (
                      <img src={item.avatarUrl} alt={item.label} style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} />
                    ) : item.avatarLabel ? (
                      <div className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold flex items-center justify-center border border-zinc-200">
                        {item.avatarLabel}
                      </div>
                    ) : (
                      <Icon size={19} className="text-zinc-500 hover:text-zinc-800" strokeWidth={1.75} />
                    )}

                    {/* Badge for Inactive Tabs */}
                    {!isActive && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-2.5 bg-[#C5A059] text-white text-[8px] font-bold rounded-full h-3.5 min-w-[14px] flex items-center justify-center px-0.5 border border-white">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                </div>

                {/* Label at the bottom */}
                <motion.span
                  className="text-[9px] font-semibold tracking-wider uppercase mt-1 transition-colors duration-300"
                  style={{ fontFamily: "var(--font-poppins)" }}
                  animate={{
                    color: isActive ? "#FF6A00" : "#71717a",
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? 0 : 2
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}

        </div>
      </div>
    </>
  );
}
