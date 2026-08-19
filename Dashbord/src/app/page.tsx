'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import KPICard from '@/components/dashboard/KPICard';
import { useAdminStore } from '@/store/adminStore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell 
} from 'recharts';
import { 
  ShoppingBag, Plus, RefreshCw, CheckCircle2, AlertTriangle, 
  ArrowRight, Truck, TrendingUp, Sparkles, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { role } = useAdminStore();

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string, nextPaymentStatus?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          ...(nextPaymentStatus ? { paymentStatus: nextPaymentStatus } : {})
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchStats();
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating order status');
    }
  };

  const handleReplenishStock = async (prodId: string) => {
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prodId,
          change: 10,
          reason: 'Replenishing low stock from Overview'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchStats();
      } else {
        alert(data.error || 'Failed to replenish stock');
      }
    } catch (e) {
      console.error(e);
      alert('Error replenishing stock');
    }
  };

  if (!mounted || loading || !stats) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-2 border-b-2 border-[#FF6A00] rounded-full animate-spin" />
          <p className="font-marcellus text-sm tracking-widest text-[#FF6A00] uppercase">Loading Atelier...</p>
        </div>
      </div>
    );
  }

  const {
    totalRevenue,
    totalOrders,
    activeCustomers,
    aov,
    pendingOrders,
    returns,
    refunds,
    lowStockAlerts,
    recentOrders,
    lowStockProducts,
    revenueTrend,
    categorySales
  } = stats;

  // Calculate dynamic growth metrics from last 6 months trend
  const prevRevenue = revenueTrend && revenueTrend[4] ? (revenueTrend[4].revenue || 0) : 0;
  const revenueGrowth = prevRevenue > 0 ? Number(((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)) : 0;

  const prevOrders = revenueTrend && revenueTrend[4] ? (revenueTrend[4].orders || 0) : 0;
  const ordersGrowth = prevOrders > 0 ? Number(((totalOrders - prevOrders) / prevOrders * 100).toFixed(1)) : 0;

  const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;
  const aovGrowth = prevAov > 0 ? Number(((aov - prevAov) / prevAov * 100).toFixed(1)) : 0;

  // Sparklines based on dynamic stats or historical indices
  const revenueSparkline = revenueTrend ? revenueTrend.map((m: any) => ({ value: m.revenue })) : [{ value: 0 }];
  const ordersSparkline = revenueTrend ? revenueTrend.map((m: any) => ({ value: m.orders })) : [{ value: 0 }];
  const customersSparkline = Array(6).fill({ value: activeCustomers });
  const aovSparkline = revenueTrend ? revenueTrend.map((m: any) => ({ value: m.orders > 0 ? m.revenue / m.orders : 0 })) : [{ value: 0 }];
  const pendingSparkline = Array(6).fill({ value: pendingOrders });
  const returnsSparkline = Array(6).fill({ value: returns });
  const refundsSparkline = Array(6).fill({ value: refunds });
  const stockSparkline = Array(6).fill({ value: lowStockAlerts });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-50 text-[#0FA958] border-[rgba(15,169,88,0.15)]';
      case 'PROCESSING': return 'bg-amber-50 text-[#D99A00] border-[rgba(217,154,0,0.15)]';
      case 'SHIPPED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'RETURNED': return 'bg-red-50 text-[#D83A3A] border-[rgba(216,58,58,0.15)]';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5 sm:space-y-6 lg:space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-marcellus text-xl sm:text-2xl lg:text-3xl font-light text-[#1A1A1A] tracking-wide">
              Atelier Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E6E] mt-1 font-poppins">
              Welcome back, <strong className="text-[#1A1A1A]">{role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Manager'}</strong>. Here is the operational state of the Designs of Dreams catalog.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchStats}
              className="px-4 py-2 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-xs font-semibold text-[#6E6E6E] hover:text-[#1A1A1A] hover:border-[#FF6A00] transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw size={14} /> Refresh Data
            </button>
            <Link 
              href="/catalog/products"
              className="px-4 py-2 bg-[#1A1A1A] text-white rounded-[16px] text-xs font-semibold hover:bg-[#FF6A00] transition-all flex items-center gap-2 shadow-md"
            >
              <Plus size={14} /> Add Product
            </Link>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <KPICard
            title="Total Revenue"
            value={totalRevenue}
            prefix="₹"
            growth={revenueGrowth}
            comparison="vs last month"
            sparklineData={revenueSparkline}
            accentColor="gold"
          />
          <KPICard
            title="Total Orders"
            value={totalOrders}
            growth={ordersGrowth}
            comparison="vs last month"
            sparklineData={ordersSparkline}
            accentColor="orange"
          />
          <KPICard
            title="Active Customers"
            value={activeCustomers}
            growth={0}
            comparison="total customer accounts"
            sparklineData={customersSparkline}
            accentColor="green"
          />
          <KPICard
            title="Average Order Value"
            value={aov}
            prefix="₹"
            growth={aovGrowth}
            comparison="vs last month"
            sparklineData={aovSparkline}
            accentColor="gold"
          />
          <KPICard
            title="Pending Orders"
            value={pendingOrders}
            growth={0}
            comparison="awaiting fulfillment"
            sparklineData={pendingSparkline}
            accentColor="orange"
          />
          <KPICard
            title="Returns Queue"
            value={returns}
            growth={0}
            comparison="active return cases"
            sparklineData={returnsSparkline}
            accentColor="red"
          />
          <KPICard
            title="Refunds Processed"
            value={refunds}
            growth={0}
            comparison="total refunds"
            sparklineData={refundsSparkline}
            accentColor="red"
          />
          <KPICard
            title="Inventory Alerts"
            value={lowStockAlerts}
            growth={0}
            comparison="items low on stock"
            sparklineData={stockSparkline}
            accentColor="red"
            isAlert={lowStockAlerts > 0}
          />
        </div>

        {/* Analytics Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Sales Chart */}
          <div className="lg:col-span-2 glass-card rounded-[20px] sm:rounded-[28px] p-4 sm:p-6 shadow-luxury flex flex-col justify-between min-h-[300px] sm:min-h-[400px]">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="font-marcellus text-lg text-[#1A1A1A] tracking-wider uppercase font-light">
                  Revenue Performance
                </h3>
                <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider font-inter">Monthly Sales & Volume</p>
              </div>
              <div className="flex items-center gap-1 bg-[#FAF9F6] border border-[rgba(0,0,0,0.06)] rounded-full p-1 text-[10px] font-semibold text-[#6E6E6E]">
                <button className="px-3 py-1.5 rounded-full bg-white text-[#FF6A00] shadow-sm">Monthly</button>
                <button className="px-3 py-1.5 rounded-full hover:text-[#1A1A1A]">Weekly</button>
              </div>
            </div>

            <div className="flex-1 w-full h-[200px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#FF6A00" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="name" stroke="#6E6E6E" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6E6E6E" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', fontSize: '12px' }} 
                    formatter={(value) => [`₹${(value as number).toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#FF6A00" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Categories Chart */}
          <div className="glass-card rounded-[20px] sm:rounded-[28px] p-4 sm:p-6 shadow-luxury flex flex-col justify-between min-h-[300px] sm:min-h-[400px]">
            <div className="border-b border-gray-100 pb-4 mb-4">
              <h3 className="font-marcellus text-lg text-[#1A1A1A] tracking-wider uppercase font-light">
                Revenue by Category
              </h3>
              <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider font-inter">Heritage vs Ready to Wear</p>
            </div>

            <div className="flex-1 w-full h-[220px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySales} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.02)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#6E6E6E" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(value) => [`₹${(value as number).toLocaleString()}`, 'Sales']}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={16}>
                    {categorySales.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
              {categorySales.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800 font-inter">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Row: Recent Orders and Low Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 glass-card rounded-[20px] sm:rounded-[28px] p-4 sm:p-6 shadow-luxury">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="font-marcellus text-lg text-[#1A1A1A] tracking-wider uppercase font-light">
                  Recent Orders
                </h3>
                <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider font-inter">Atelier Fulfillment Line</p>
              </div>
              <Link
                href="/orders"
                className="text-xs font-semibold text-[#FF6A00] hover:underline flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Fulfill</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="font-semibold text-xs text-gray-800 font-inter">{order.id}</td>
                      <td>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{order.customerName}</p>
                          <p className="text-[10px] text-gray-500">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="text-xs text-gray-600 font-light truncate max-w-[150px]">
                        {order.items.map((item: any) => `${item.name} (${item.quantity})`).join(', ')}
                      </td>
                      <td className="font-semibold text-xs text-gray-900 font-inter">
                        ₹{order.grandTotal.toLocaleString()}
                      </td>
                      <td>
                        <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 border rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.status === 'PROCESSING' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'PACKED')}
                            className="text-[10px] bg-white border border-[rgba(255, 106, 0,0.3)] hover:bg-[#FF6A00] hover:text-white px-2 py-1 rounded-md transition-all text-[#FF6A00] font-medium"
                          >
                            Pack Order
                          </button>
                        )}
                        {order.status === 'PACKED' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                            className="text-[10px] bg-white border border-blue-300 hover:bg-blue-600 hover:text-white px-2 py-1 rounded-md transition-all text-blue-600 font-medium"
                          >
                            Ship Order
                          </button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED', 'PAID')}
                            className="text-[10px] bg-white border border-green-300 hover:bg-[#0FA958] hover:text-white px-2 py-1 rounded-md transition-all text-[#0FA958] font-medium"
                          >
                            Deliver
                          </button>
                        )}
                        {order.status === 'DELIVERED' && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 size={12} className="text-[#0FA958]" /> Complete
                          </span>
                        )}
                        {order.status === 'RETURNED' && (
                          <span className="text-[10px] text-[#D83A3A] font-medium">Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="glass-card rounded-[20px] sm:rounded-[28px] p-4 sm:p-6 shadow-luxury flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                <div>
                  <h3 className="font-marcellus text-lg text-[#1A1A1A] tracking-wider uppercase font-light">
                    Atelier Stock Alerts
                  </h3>
                  <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider font-inter">Artisanal Low Inventories</p>
                </div>
                {lowStockAlerts > 0 && (
                  <span className="bg-red-50 text-[#D83A3A] text-[9px] uppercase tracking-widest px-2 py-0.5 rounded font-bold border border-red-100 animate-pulse">
                    Alert
                  </span>
                )}
              </div>

              {lowStockAlerts === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 size={36} className="text-[#0FA958] mb-3 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-[#1A1A1A]">All Stock Levels Stable</p>
                  <p className="text-[10px] text-[#6E6E6E] mt-1 font-poppins">No low stock thresholds breached.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map((product: any) => (
                    <div 
                      key={product.id} 
                      className="flex justify-between items-center p-3 rounded-2xl bg-white border border-[rgba(0,0,0,0.03)] hover:border-[#FF6A00] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">{product.name}</p>
                          <p className="text-[9px] text-[#D83A3A] font-semibold mt-0.5">
                            Only {product.stock} left in stock
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleReplenishStock(product.id)}
                        className="bg-[#FAF9F6] border border-[rgba(0,0,0,0.06)] hover:bg-[#FF6A00] hover:text-white px-2 py-1.5 rounded-xl text-[10px] font-semibold transition-all text-gray-700 flex items-center gap-1"
                      >
                        <Plus size={10} /> Replenish
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <Link
                href="/catalog/inventory"
                className="w-full bg-[#FAF9F6] border border-[rgba(0,0,0,0.06)] hover:border-[#FF6A00] hover:text-[#1A1A1A] py-3.5 rounded-[16px] text-xs font-semibold text-center text-gray-700 block transition-all shadow-sm"
              >
                Manage Atelier Inventory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
