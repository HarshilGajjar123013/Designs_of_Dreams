'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminStore, UserRole } from '@/store/adminStore';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Users,
  Percent,
  Inbox,
  Shield,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sliders,
  LogOut,
  ChevronDown,
  Layers,
  FileText,
  User,
  Activity,
  Lock,
  ArrowRight,
  Image
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href?: string;
  icon: any;
  roles: UserRole[];
  submenu?: { name: string; href: string; roles: UserRole[] }[];
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const SIDEBAR_STRUCTURE: SidebarSection[] = [
  {
    title: 'Dashboard',
    items: [
      { name: 'Overview', href: '/', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'MANAGER'] }
    ]
  },
  {
    title: 'Analytics',
    items: [
      {
        name: 'Analytics',
        icon: BarChart3,
        roles: ['SUPER_ADMIN'],
        submenu: [
          { name: 'Revenue', href: '/analytics/revenue', roles: ['SUPER_ADMIN'] },
          { name: 'Orders', href: '/analytics/orders', roles: ['SUPER_ADMIN'] },
          { name: 'Customers', href: '/analytics/customers', roles: ['SUPER_ADMIN'] }
        ]
      }
    ]
  },
  {
    title: 'Catalog',
    items: [
      {
        name: 'Catalog',
        icon: ShoppingBag,
        roles: ['SUPER_ADMIN', 'MANAGER'],
        submenu: [
          { name: 'Products', href: '/catalog/products', roles: ['SUPER_ADMIN', 'MANAGER'] },
          { name: 'Categories', href: '/catalog/categories', roles: ['SUPER_ADMIN', 'MANAGER'] },
          { name: 'Inventory', href: '/catalog/inventory', roles: ['SUPER_ADMIN', 'MANAGER'] }
        ]
      }
    ]
  },
  {
    title: 'Orders',
    items: [
      { name: 'Orders', href: '/orders', icon: Layers, roles: ['SUPER_ADMIN', 'MANAGER'] }
    ]
  },
  {
    title: 'Customers',
    items: [
      { name: 'Customer List', href: '/customers', icon: Users, roles: ['SUPER_ADMIN'] }
    ]
  },
  {
    title: 'CMS & Marketing',
    items: [
      { name: 'CMS Settings', href: '/cms', icon: Sliders, roles: ['SUPER_ADMIN'] },
      { name: 'Gallery', href: '/gallery', icon: Image, roles: ['SUPER_ADMIN'] },
      { name: 'Coupons', href: '/marketing/coupons', icon: Percent, roles: ['SUPER_ADMIN'] }
    ]
  },
  {
    title: 'Support',
    items: [
      { name: 'Contact Forms', href: '/support', icon: Inbox, roles: ['SUPER_ADMIN', 'MANAGER'] },
      { name: 'Check Out', href: '/support/checkout', icon: ShoppingBag, roles: ['SUPER_ADMIN', 'MANAGER'] }
    ]
  },
  {
    title: 'Administration',
    items: [
      {
        name: 'Administration',
        icon: Shield,
        roles: ['SUPER_ADMIN'],
        submenu: [
          { name: 'Admins & Roles', href: '/administration', roles: ['SUPER_ADMIN'] },
          { name: 'Sign Up Data', href: '/administration/signup-data', roles: ['SUPER_ADMIN'] },
          { name: 'Sign In Data', href: '/administration/signin-data', roles: ['SUPER_ADMIN'] },
          { name: 'Security Panel', href: '/administration/security', roles: ['SUPER_ADMIN'] }
        ]
      }
    ]
  },
  {
    title: 'Settings',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'MANAGER'] }
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Call useAuth to synchronize backend session with Zustand store
  useAuth();

  const { role, toggleRole, currentAdmin } = useAdminStore();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        useAdminStore.setState({
          currentAdmin: { id: '', name: 'Guest', email: '', role: 'MANAGER', avatar: 'G', status: 'INACTIVE', lastLogin: '' },
          role: 'MANAGER'
        });
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Auto-expand submenus that contain active route on mount
  useEffect(() => {
    SIDEBAR_STRUCTURE.forEach(section => {
      section.items.forEach(item => {
        if (item.submenu) {
          const hasActiveSub = item.submenu.some(sub => sub.href === pathname);
          if (hasActiveSub) {
            setOpenSubmenus(prev => ({ ...prev, [item.name]: true }));
          }
        }
      });
    });
  }, [pathname]);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Check if current route is authorized for active role
  const isAuthorized = (): boolean => {
    // Exact matching logic for pages
    let allowed = true;

    // Find the item corresponding to current pathname
    SIDEBAR_STRUCTURE.forEach(section => {
      section.items.forEach(item => {
        // Direct match
        if (item.href === pathname && !item.roles.includes(role)) {
          allowed = false;
        }
        // Submenu match
        if (item.submenu) {
          item.submenu.forEach(sub => {
            if (sub.href === pathname && !sub.roles.includes(role)) {
              allowed = false;
            }
          });
        }
      });
    });

    return allowed;
  };

  const isRouteActive = (href?: string, submenu?: { href: string }[]): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    if (href && pathname.startsWith(href)) {
      return true;
    }
    if (submenu) {
      return submenu.some(sub => pathname === sub.href);
    }
    return false;
  };

  const isSubrouteActive = (href: string): boolean => {
    return pathname === href;
  };

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-[#1A1A1A] font-poppins overflow-hidden">

      {/* MOBILE BACKDROP */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        className={`
          bg-white border-r border-[rgba(0,0,0,0.06)] flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          fixed top-0 left-0 h-full z-50
          lg:relative lg:z-30
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
      >
        {/* Logo Container */}
        <div className={`h-16 lg:h-20 flex items-center border-b border-[rgba(0,0,0,0.06)] relative ${collapsed ? 'justify-center px-2' : 'justify-between px-4 lg:px-6'}`}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <img src="/icon.png" alt="Logo" className="h-11 w-11 object-contain rounded-xl shadow-sm" />
              <div className="flex flex-col">
                <span className="font-marcellus text-sm tracking-[0.12em] uppercase font-bold text-gray-800 leading-tight">
                  Designs
                </span>
                <span className="font-marcellus text-[10px] tracking-[0.25em] uppercase text-[#FF6A00] font-bold">
                  Of Dreams
                </span>
              </div>
            </motion.div>
          )}

          {collapsed && (
            <div
              className="mx-auto cursor-pointer flex items-center justify-center animate-fade-in hover:scale-105 transition-transform"
              onClick={() => setCollapsed(false)}
              title="Expand Sidebar"
            >
              <img src="/icon.png" alt="DOD" className="h-11 w-11 object-contain rounded-lg cursor-pointer" />
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-full hover:bg-[#FAF9F6] border border-transparent hover:border-[rgba(0,0,0,0.06)] transition-all lg:hidden text-[#6E6E6E]"
          >
            <X size={18} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
              p-1 rounded-full bg-white border border-gray-200 shadow-md transition-all text-[#6E6E6E] hover:text-[#1A1A1A] hover:scale-105
              hidden lg:flex items-center justify-center
              ${collapsed ? 'absolute -right-3.5 top-6.5 z-50 w-7 h-7' : 'relative'}
            `}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 select-none scrollbar-thin">
          {SIDEBAR_STRUCTURE.map((section, idx) => {
            // Filter section items by role
            const visibleItems = section.items.filter(item => {
              if (item.submenu) {
                return item.submenu.some(sub => sub.roles.includes(role));
              }
              return item.roles.includes(role);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-2">
                {!collapsed && (
                  <h3 className="text-[10px] tracking-[0.25em] font-semibold text-[#FF6A00] uppercase px-3 mb-3">
                    {section.title}
                  </h3>
                )}

                <div className="space-y-1">
                  {visibleItems.map((item, itemIdx) => {
                    const active = isRouteActive(item.href, item.submenu);
                    const Icon = item.icon;

                    if (item.submenu) {
                      const isOpen = openSubmenus[item.name];
                      return (
                        <div key={itemIdx} className="space-y-1">
                          <button
                            onClick={() => toggleSubmenu(item.name)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[16px] text-sm transition-all ${active
                                ? 'bg-[rgba(255,106,0,0.08)] text-[#FF6A00] font-medium'
                                : 'text-[#6E6E6E] hover:text-[#1A1A1A] hover:bg-[#FAF9F6]'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={18} className={active ? 'text-[#FF6A00]' : 'text-[#6E6E6E]'} />
                              {!collapsed && <span>{item.name}</span>}
                            </div>
                            {!collapsed && (
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown size={14} />
                              </motion.div>
                            )}
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && !collapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden pl-10 pr-2 space-y-1"
                              >
                                {item.submenu
                                  .filter(sub => sub.roles.includes(role))
                                  .map((sub, subIdx) => {
                                    const subActive = isSubrouteActive(sub.href);
                                    return (
                                      <Link
                                        key={subIdx}
                                        href={sub.href}
                                        className={`block py-2 text-xs rounded-lg transition-all ${subActive
                                            ? 'text-[#FF6A00] font-semibold'
                                            : 'text-[#6E6E6E] hover:text-[#1A1A1A]'
                                          }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span>{sub.name}</span>
                                          {subActive && (
                                            <motion.div
                                              layoutId="activeIndicator"
                                              className="w-1 h-1 rounded-full bg-[#FF6A00]"
                                            />
                                          )}
                                        </div>
                                      </Link>
                                    );
                                  })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={itemIdx}
                        href={item.href || '#'}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-[16px] text-sm transition-all ${active
                            ? 'bg-[rgba(255,106,0,0.08)] text-[#FF6A00] font-medium border-l-2 border-[#FF6A00]'
                            : 'text-[#6E6E6E] hover:text-[#1A1A1A] hover:bg-[#FAF9F6]'
                          }`}
                      >
                        <Icon size={18} className={active ? 'text-[#FF6A00]' : 'text-[#6E6E6E]'} />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Admin Card */}
        <div className="p-4 border-t border-[rgba(0,0,0,0.06)]">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-[#FF6A00] text-white flex items-center justify-center font-semibold text-sm">
              {currentAdmin.avatar}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1A1A1A] truncate">{currentAdmin.name}</p>
                <p className="text-[10px] text-[#6E6E6E] truncate">{role.replace('_', ' ')}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="text-[#6E6E6E] hover:text-red-500 p-1 rounded-md hover:bg-red-50"
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* HEADER */}
        <header className="h-14 sm:h-16 lg:h-20 bg-white border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between px-3 sm:px-5 lg:px-8 z-20 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-1 rounded-lg hover:bg-[#FAF9F6] lg:hidden text-[#1A1A1A] shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block min-w-0">
              <h2 className="font-marcellus text-base lg:text-lg font-light text-[#1A1A1A] truncate">Atelier Command Center</h2>
              <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider -mt-1 font-inter">Live Operations Sync</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            {/* ROLE TOGGLE CONTROL */}
            <div className="hidden sm:flex items-center gap-2 bg-[#FAF9F6] border border-[rgba(0,0,0,0.06)] p-1 rounded-full">
              <button
                onClick={toggleRole}
                className="px-3 lg:px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 lg:gap-2 bg-white text-[#FF6A00] shadow-sm border border-[rgba(255,106,0,0.15)]"
              >
                <Activity size={12} className="text-[#0FA958] animate-pulse" />
                <span className="font-poppins uppercase tracking-wider font-semibold text-[10px]">
                  Role: {role.replace('_', ' ')}
                </span>
                <span className="text-[8px] bg-[rgba(0,0,0,0.04)] text-[#6E6E6E] px-1.5 py-0.5 rounded hidden lg:inline">
                  Toggle
                </span>
              </button>
            </div>

            {/* Mobile-only compact role badge */}
            <button
              onClick={toggleRole}
              className="sm:hidden p-2 rounded-full bg-[#FAF9F6] border border-[rgba(0,0,0,0.06)] text-[#FF6A00] shrink-0"
              title={`Role: ${role.replace('_', ' ')}`}
            >
              <Activity size={16} className="text-[#0FA958]" />
            </button>

            {/* Notification Badge */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-full hover:bg-[#FAF9F6] border border-transparent hover:border-[rgba(0,0,0,0.06)] text-[#6E6E6E] hover:text-[#1A1A1A] transition-all relative"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6A00]" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl shadow-luxury p-4 z-40 -right-2 sm:right-0"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                      <h4 className="font-marcellus text-sm font-semibold">Notifications</h4>
                      <span className="text-[10px] text-[#FF6A00] cursor-pointer">Mark all read</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3 text-xs">
                        <span className="w-2 h-2 rounded-full bg-[#FF6A00] mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">New Bridal Couture Inquiry</p>
                          <p className="text-gray-500 text-[10px] mt-0.5">Kareena Kapoor: &ldquo;London fittings...&rdquo;</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className="w-2 h-2 rounded-full bg-[#0FA958] mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">High-value Order Paid</p>
                          <p className="text-gray-500 text-[10px] mt-0.5">ORD-8921 by Aishwarya: ₹89,750</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className="w-2 h-2 rounded-full bg-[#D99A00] mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">Low Stock Alert</p>
                          <p className="text-gray-500 text-[10px] mt-0.5">Patola Double Ikat Saree: 1 left</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Options */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[rgba(0,0,0,0.06)] flex items-center justify-center cursor-pointer hover:border-[#FF6A00] transition-all"
              >
                <User size={16} className="text-[#FF6A00]" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl shadow-luxury py-2 z-40"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-[#1A1A1A]">{currentAdmin.name}</p>
                      <p className="text-[10px] text-[#6E6E6E] truncate">{currentAdmin.email}</p>
                    </div>
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-xs text-gray-700 hover:bg-[#FAF9F6] hover:text-[#FF6A00]"
                    >
                      Atelier Settings
                    </Link>
                    <Link
                      href="/administration"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-xs text-gray-700 hover:bg-[#FAF9F6] hover:text-[#FF6A00]"
                    >
                      Admin Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        toggleRole();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#FF6A00] hover:bg-orange-50 font-medium"
                    >
                      Switch Admin Role
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* WORKSPACE & AUTHORIZATION SCREEN LOCK */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 bg-[#FAF9F6] relative">
          <AnimatePresence mode="wait">
            {isAuthorized() ? (
              <motion.div
                key="authorized-content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="h-full"
              >
                {children}
              </motion.div>
            ) : (
              <motion.div
                key="unauthorized-lock"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="min-h-[70vh] flex flex-col items-center justify-center"
              >
                <div className="glass-card shadow-luxury rounded-[24px] p-6 sm:p-12 max-w-lg text-center border border-[rgba(255,106,0,0.15)] flex flex-col items-center mx-3">
                  <div className="w-16 h-16 rounded-full bg-[rgba(255,106,0,0.08)] border border-[rgba(255,106,0,0.2)] flex items-center justify-center mb-6 text-[#FF6A00]">
                    <Lock size={24} className="stroke-[1.5]" />
                  </div>

                  <h3 className="font-marcellus text-2xl text-[#1A1A1A] mb-3 uppercase tracking-wider font-light">
                    Access Restricted
                  </h3>

                  <p className="text-sm text-[#6E6E6E] font-poppins leading-relaxed mb-8 max-w-sm">
                    This section of the Designs of Dreams Atelier command center is reserved exclusively for the <strong>Super Administrator</strong> role. Financial analytics, security audit trails, and role definitions are protected.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <button
                      onClick={toggleRole}
                      className="flex-1 bg-[#1A1A1A] text-white py-3 px-6 rounded-[16px] text-xs font-semibold hover:bg-[#FF6A00] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Elevate Role <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="flex-1 bg-white text-[#6E6E6E] border border-[rgba(0,0,0,0.06)] py-3 px-6 rounded-[16px] text-xs font-semibold hover:bg-gray-50 transition-all duration-300"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
