// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Role-Based Permissions System
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { AdminRole } from '@dod/database';

export type Permission =
  | 'dashboard:view'
  | 'dashboard:revenue_chart'
  // Products
  | 'products:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'products:archive'
  | 'products:feature'
  | 'products:upload'
  // Categories
  | 'categories:view'
  | 'categories:create'
  | 'categories:edit'
  | 'categories:delete'
  // Collections
  | 'collections:view'
  | 'collections:create'
  | 'collections:edit'
  | 'collections:delete'
  // Inventory
  | 'inventory:view'
  | 'inventory:adjust'
  | 'inventory:logs'
  | 'inventory:alerts'
  // Orders
  | 'orders:view'
  | 'orders:detail'
  | 'orders:status'
  | 'orders:tracking'
  | 'orders:cancel'
  // Returns
  | 'returns:view'
  | 'returns:approve'
  | 'returns:reject'
  | 'returns:refund'
  // Customers
  | 'customers:view'
  | 'customers:detail'
  | 'customers:notes'
  | 'customers:export'
  // Contact Forms
  | 'contact:view'
  | 'contact:reply'
  | 'contact:archive'
  // Analytics
  | 'analytics:revenue'
  | 'analytics:orders'
  | 'analytics:customers'
  | 'analytics:reports'
  // CMS
  | 'cms:view'
  | 'cms:edit'
  // Marketing
  | 'marketing:view'
  | 'marketing:create'
  | 'marketing:edit'
  | 'marketing:delete'
  // Administration
  | 'administration:view'
  | 'administration:create'
  | 'administration:status'
  // Security
  | 'security:view'
  // Settings
  | 'settings:view'
  | 'settings:edit';

/**
 * Permission map for each role
 */
const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    // Full access to everything
    'dashboard:view', 'dashboard:revenue_chart',
    'products:view', 'products:create', 'products:edit', 'products:delete', 'products:archive', 'products:feature', 'products:upload',
    'categories:view', 'categories:create', 'categories:edit', 'categories:delete',
    'collections:view', 'collections:create', 'collections:edit', 'collections:delete',
    'inventory:view', 'inventory:adjust', 'inventory:logs', 'inventory:alerts',
    'orders:view', 'orders:detail', 'orders:status', 'orders:tracking', 'orders:cancel',
    'returns:view', 'returns:approve', 'returns:reject', 'returns:refund',
    'customers:view', 'customers:detail', 'customers:notes', 'customers:export',
    'contact:view', 'contact:reply', 'contact:archive',
    'analytics:revenue', 'analytics:orders', 'analytics:customers', 'analytics:reports',
    'cms:view', 'cms:edit',
    'marketing:view', 'marketing:create', 'marketing:edit', 'marketing:delete',
    'administration:view', 'administration:create', 'administration:status',
    'security:view',
    'settings:view', 'settings:edit',
  ],
  MANAGER: [
    'dashboard:view',
    'products:view', 'products:create', 'products:edit', 'products:archive', 'products:feature', 'products:upload',
    'categories:view', 'categories:create', 'categories:edit',
    'collections:view', 'collections:create', 'collections:edit',
    'inventory:view', 'inventory:adjust', 'inventory:logs', 'inventory:alerts',
    'orders:view', 'orders:detail', 'orders:status', 'orders:tracking',
    'returns:view', 'returns:approve',
    'customers:view', 'customers:detail', 'customers:notes',
    'contact:view', 'contact:reply', 'contact:archive',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Sidebar navigation items with role-based visibility
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  permission?: Permission;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const SIDEBAR_NAVIGATION: NavSection[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Products', href: '/catalog/products', icon: 'Package', permission: 'products:view' },
      { label: 'Categories', href: '/catalog/categories', icon: 'Tag', permission: 'categories:view' },
      { label: 'Collections', href: '/catalog/collections', icon: 'Gem', permission: 'collections:view' },
      { label: 'Inventory', href: '/catalog/inventory', icon: 'Warehouse', permission: 'inventory:view' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Orders', href: '/orders', icon: 'ShoppingBag', permission: 'orders:view' },
      { label: 'Returns & Refunds', href: '/orders/returns', icon: 'RotateCcw', permission: 'returns:view' },
      { label: 'Customers', href: '/customers', icon: 'Users', permission: 'customers:view' },
      { label: 'Contact Forms', href: '/support', icon: 'MessageSquare', permission: 'contact:view' },
      { label: 'Check Out', href: '/support/checkout', icon: 'ShoppingBag', permission: 'orders:view' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Revenue Analytics', href: '/analytics/revenue', icon: 'TrendingUp', permission: 'analytics:revenue' },
      { label: 'Order Analytics', href: '/analytics/orders', icon: 'BarChart3', permission: 'analytics:orders' },
      { label: 'Customer Analytics', href: '/analytics/customers', icon: 'UserCheck', permission: 'analytics:customers' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'CMS Editor', href: '/cms', icon: 'PenTool', permission: 'cms:view' },
      { label: 'Coupons & Marketing', href: '/marketing', icon: 'Ticket', permission: 'marketing:view' },
      { label: 'Admin Management', href: '/administration', icon: 'Shield', permission: 'administration:view' },
      { label: 'Security Logs', href: '/administration/security', icon: 'Lock', permission: 'security:view' },
      { label: 'Settings', href: '/settings', icon: 'Settings', permission: 'settings:view' },
    ],
  },
];
