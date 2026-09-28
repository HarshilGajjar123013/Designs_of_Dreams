"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Clock
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import "./Footer.scss";

const footerLinks = [
  {
    title: "The Collections",
    links: [
      { name: "Chikankari Kurtis", href: "/collection/kurti" },
      { name: "Banarasi Sarees", href: "/collection/saree" },
      { name: "Designer Blouses", href: "/collection/blouse" },
      { name: "Handcrafted Dupattas", href: "/collection/dupatta" },
      { name: "New Arrivals", href: "/collection" }
    ]
  },
  {
    title: "Heritage Story",
    links: [
      { name: "The Handloom Artistry", href: "/about" },
      { name: "Artisan Empowerment", href: "/about" },
      { name: "Natural Dye Processes", href: "/about" },
      { name: "Editorial Journal", href: "/" }
    ]
  },
  {
    title: "Client Care",
    links: [
      { name: "Private Consultations", href: "/contact" },
      { name: "Shipping & Returns", href: "/" },
      { name: "Care & Preservation", href: "/" },
      { name: "Tailoring & Fit Guide", href: "/" }
    ]
  }
];

const socialLinks = [
  { icon: <FaInstagram size={18} />, href: "#", label: "Instagram" },
  { icon: <FaFacebookF size={18} />, href: "#", label: "Facebook" },
  { icon: <FaTwitter size={18} />, href: "#", label: "Twitter" }
];

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname === "/login") return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Subscribed to the Editorial Newsletter!");
  };

  return (
    <footer className="footer">
      {/* Upper Newsletter Bar */}
      <div className="footer-newsletter">
        <div className="footer-newsletter__container">
          <div className="footer-newsletter__left">
            <div className="footer-newsletter__tag">
              <Sparkles size={14} />
              <span>Join The Inner Circle</span>
            </div>
            <h3>Subscribe to Our Editorial Journal</h3>
            <p>Receive exclusive invitations to private viewings, collection pre-launches, and stories from the loom.</p>
          </div>
          <form className="footer-newsletter__form" onSubmit={handleSubscribe}>
            <div className="footer-newsletter__input-group">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="footer-newsletter__input"
              />
              <span className="footer-newsletter__line" />
            </div>
            <button type="submit" className="footer-newsletter__btn">
              Subscribe
              <ArrowUpRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Main Links Directory */}
      <div className="footer-main">
        <div className="footer-main__container">

          {/* Brand Info Column */}
          <div className="footer-brand">
            <Link href="/" className="footer-brand__logo">
              <div className="footer-brand__emblem">
                <img src="/logo.png" alt="Logo" />
              </div>
              <div className="footer-brand__text">
                <span className="title">DESIGNS OF DREAMS</span>
              </div>
            </Link>
            <p className="footer-brand__desc">
              Preserving ancient weaving traditions, celebrating pure organic fibers, and tailoring contemporary luxury drapes for generations to cherish.
            </p>
            <div className="footer-contact">
              <div className="footer-contact__item">
                <MapPin size={16} />
                <span>Varanasi Atelier, Peeli Kothi, India</span>
              </div>
              <div className="footer-contact__item">
                <Phone size={16} />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </div>
              <div className="footer-contact__item">
                <Mail size={16} />
                <a href="mailto:hello@sareestyle.com">hello@sareestyle.com</a>
              </div>
            </div>
          </div>

          {/* Links Directory Columns */}
          <div className="footer-links-grid">
            {footerLinks.map((group, index) => (
              <div key={index} className="footer-links-col">
                <h4>{group.title}</h4>
                <ul className="footer-links-list">
                  {group.links.map((link, idx) => (
                    <li key={idx}>
                      <Link href={link.href} className="footer-link-item">
                        {link.name}
                        <span className="footer-link-item__line" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Atelier Hours Column */}
          <div className="footer-atelier">
            <h4>The Atelier Experience</h4>
            <div className="footer-atelier__hours">
              <div className="footer-atelier__row">
                <Clock size={15} />
                <span>Private Showroom Hours:</span>
              </div>
              <p>Mon - Sat: 11:00 AM - 08:00 PM</p>
              <p className="highlight">By Appointment Only</p>
            </div>
            <Link href="/contact" className="footer-atelier__cta">
              Book Consultation
              <ArrowUpRight size={16} />
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="footer-bottom">
        <div className="footer-bottom__container">
          <p className="footer-copyright">
            &copy; {currentYear} DESIGNS OF DREAMS. Rooted in Culture, Crafted for Generations.
          </p>

          <div className="footer-bottom__right">
            <div className="footer-socials">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className="footer-social-btn"
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <div className="footer-legal">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <span>&middot;</span>
              <Link href="/terms-of-service">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
