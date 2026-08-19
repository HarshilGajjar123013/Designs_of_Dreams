'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie
} from 'recharts';
import { RefreshCw } from 'lucide-react';

const HEATMAP_HOURS = ['09:00', '12:00', '15:00', '18:00', '21:00'];
const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RevenueAnalytics() {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch('/api/products?limit=1000'),
        fetch('/api/orders')
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      if (prodData.success) setProducts(prodData.products || []);
      if (ordData.success) setOrders(ordData.orders || []);
    } catch (err) {
      console.error('Failed to fetch data for revenue analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-t-2 border-b-2 border-[#FF6A00] rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#FF6A00]">Loading Revenue Insights...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Helper date grouping calculations
  const getDailyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const now = new Date();
    // last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      
      let dayRevenue = 0;
      orders.forEach((order: any) => {
        if (order.status !== 'CANCELLED' && order.status !== 'RETURNED') {
          const orderDate = new Date(order.createdAt);
          if (orderDate.toDateString() === d.toDateString()) {
            dayRevenue += order.grandTotal;
          }
        }
      });
      data.push({ name: dayName, revenue: dayRevenue });
    }
    return data;
  };

  const getWeeklyData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const weeks = [
      { name: 'Week 1', start: 1, end: 7 },
      { name: 'Week 2', start: 8, end: 14 },
      { name: 'Week 3', start: 15, end: 21 },
      { name: 'Week 4', start: 22, end: 31 }
    ];
    
    return weeks.map((week: any) => {
      let weekRevenue = 0;
      orders.forEach((order: any) => {
        if (order.status !== 'CANCELLED' && order.status !== 'RETURNED') {
          const orderDate = new Date(order.createdAt);
          if (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear &&
            orderDate.getDate() >= week.start &&
            orderDate.getDate() <= week.end
          ) {
            weekRevenue += order.grandTotal;
          }
        }
      });
      return { name: week.name, revenue: weekRevenue };
    });
  };

  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const currentYear = now.getFullYear();
    
    for (let i = 5; i >= 0; i--) {
      let targetMonthIdx = currentMonthIdx - i;
      let targetYear = currentYear;
      if (targetMonthIdx < 0) {
        targetMonthIdx += 12;
        targetYear -= 1;
      }
      
      let monthRevenue = 0;
      orders.forEach((order: any) => {
        if (order.status !== 'CANCELLED' && order.status !== 'RETURNED') {
          const orderDate = new Date(order.createdAt);
          if (
            orderDate.getMonth() === targetMonthIdx &&
            orderDate.getFullYear() === targetYear
          ) {
            monthRevenue += order.grandTotal;
          }
        }
      });
      
      data.push({ name: months[targetMonthIdx], revenue: monthRevenue });
    }
    return data;
  };

  const getYearlyData = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
    
    return years.map((year: number) => {
      let yearRevenue = 0;
      orders.forEach((order: any) => {
        if (order.status !== 'CANCELLED' && order.status !== 'RETURNED') {
          const orderDate = new Date(order.createdAt);
          if (orderDate.getFullYear() === year) {
            yearRevenue += order.grandTotal;
          }
        }
      });
      return { name: year.toString(), revenue: yearRevenue };
    });
  };

  const timelineData = 
    timeframe === 'daily' ? getDailyData() :
    timeframe === 'weekly' ? getWeeklyData() :
    timeframe === 'monthly' ? getMonthlyData() :
    getYearlyData();

  // Dynamic Heatmap construction
  const getHeatmapData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const grid: Record<string, number[]> = {
      Mon: [0, 0, 0, 0, 0],
      Tue: [0, 0, 0, 0, 0],
      Wed: [0, 0, 0, 0, 0],
      Thu: [0, 0, 0, 0, 0],
      Fri: [0, 0, 0, 0, 0],
      Sat: [0, 0, 0, 0, 0],
      Sun: [0, 0, 0, 0, 0]
    };
    
    orders.forEach((order: any) => {
      if (order.status !== 'CANCELLED' && order.status !== 'RETURNED') {
        const d = new Date(order.createdAt);
        const rawDay = d.getDay();
        const dayIdx = (rawDay - 1 + 7) % 7;
        const dayName = days[dayIdx];
        
        const hour = d.getHours();
        let hourSlot = 0;
        if (hour < 11) hourSlot = 0; // 09:00
        else if (hour < 14) hourSlot = 1; // 12:00
        else if (hour < 17) hourSlot = 2; // 15:00
        else if (hour < 20) hourSlot = 3; // 18:00
        else hourSlot = 4; // 21:00
        
        if (grid[dayName]) {
          grid[dayName][hourSlot] += 1;
        }
      }
    });
    
    let maxCount = 0;
    Object.values(grid).forEach((row: number[]) => {
      row.forEach((val: number) => {
        if (val > maxCount) maxCount = val;
      });
    });
    
    const normalizedGrid: Record<string, number[]> = {};
    days.forEach((day: string) => {
      normalizedGrid[day] = grid[day].map((val: number) => 
        maxCount > 0 ? Number((val / maxCount).toFixed(2)) : 0
      );
    });
    
    return normalizedGrid;
  };
  
  const heatmapData = getHeatmapData();

  // Top Products & Categories calculations
  const productRevenueMap: Record<string, { name: string; revenue: number; category: string }> = {};
  
  products.forEach((p: any) => {
    productRevenueMap[p.id] = { name: p.name, revenue: 0, category: p.category };
  });

  orders
    .filter((o: any) => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
    .forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (productRevenueMap[item.productId]) {
          productRevenueMap[item.productId].revenue += item.price * item.quantity;
        } else {
          productRevenueMap[item.productId] = {
            name: item.name,
            revenue: item.price * item.quantity,
            category: 'Other'
          };
        }
      });
    });

  const topProducts = Object.values(productRevenueMap)
    .filter((p: any) => p.revenue > 0)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 4)
    .map((p: any) => ({
      name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
      revenue: p.revenue
    }));

  const categoryRevenueMap: Record<string, number> = {};
  
  products.forEach((p: any) => {
    if (p.category) {
      categoryRevenueMap[p.category] = 0;
    }
  });

  orders
    .filter((o: any) => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
    .forEach((order: any) => {
      order.items.forEach((item: any) => {
        const prod = products.find((p: any) => p.id === item.productId || p.name === item.name);
        const categoryName = prod ? prod.category : 'Other';
        categoryRevenueMap[categoryName] = (categoryRevenueMap[categoryName] || 0) + item.price * item.quantity;
      });
    });

  const topCategories = Object.entries(categoryRevenueMap)
    .map(([name, value]) => ({ name, value, color: '' }))
    .filter((c: any) => c.value > 0)
    .sort((a: any, b: any) => b.value - a.value);

  const colors = ['#FF6A00', '#FF6A00', '#0FA958', '#D99A00', '#4E0707', '#6E6E6E'];
  topCategories.forEach((cat: any, index: number) => {
    cat.color = colors[index % colors.length];
  });

  const totalCalculatedRevenue = orders
    .filter((o: any) => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
    .reduce((sum: number, o: any) => sum + o.grandTotal, 0);

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Revenue Insights</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Financial Performance & Audits</p>
          </div>
          <div className="flex items-center gap-2">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-2 rounded-[16px] text-xs font-semibold uppercase tracking-wider transition-all border ${
                  timeframe === t
                    ? 'bg-[#1A1A1A] text-white border-transparent'
                    : 'bg-white text-[#6E6E6E] border-[rgba(0,0,0,0.06)] hover:border-[#FF6A00]'
                }`}
              >
                {t}
              </button>
            ))}
            <button
              onClick={fetchData}
              className="p-2 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-[#6E6E6E] hover:text-[#1A1A1A] hover:border-[#FF6A00] transition-all"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Top Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area Chart */}
          <div className="lg:col-span-2 glass-card rounded-[28px] p-6 shadow-luxury min-h-[420px] flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-widest">Revenue Timeline</span>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] mt-1 font-light uppercase tracking-wider">
                Sales Volume
              </h3>
            </div>

            <div className="w-full h-[280px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGoldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#FF6A00" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)" />
                  <XAxis dataKey="name" stroke="#6E6E6E" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6E6E6E" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toLocaleString()}`} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(value) => [`₹${(value as number).toLocaleString()}`, 'Total Sales']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#FF6A00" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGoldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Rank */}
          <div className="glass-card rounded-[28px] p-6 shadow-luxury flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-widest">Top Rankings</span>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] mt-1 font-light uppercase tracking-wider">
                Top Revenue Products
              </h3>
            </div>

            <div className="w-full h-[220px] mt-6 flex items-center justify-center">
              {topProducts.length === 0 ? (
                <div className="text-center text-xs text-[#6E6E6E] font-poppins">
                  No products have generated revenue yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.02)" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#6E6E6E" fontSize={10} tickLine={false} axisLine={false} width={100} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(value) => [`₹${(value as number).toLocaleString()}`, 'Revenue Generated']}
                    />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={12}>
                      {topProducts.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#FF6A00' : '#FF6A00CC'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              {topProducts.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-2">
                  No sales recorded.
                </div>
              ) : (
                topProducts.map((p: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 truncate max-w-[150px]">{p.name}</span>
                    <span className="font-semibold text-gray-800 font-inter">₹{p.revenue.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lower Row: Category Share and Sales Density Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories Pie */}
          <div className="glass-card rounded-[28px] p-6 shadow-luxury flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#0FA958] tracking-widest">Share Allocation</span>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] mt-1 font-light uppercase tracking-wider">
                Category Contribution
              </h3>
            </div>

            <div className="w-full h-[220px] flex items-center justify-center relative">
              {topCategories.length === 0 ? (
                <div className="text-center text-xs text-[#6E6E6E] font-poppins">
                  No category data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {topCategories.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Est. Revenue</span>
                <span className="font-inter text-base font-semibold text-[#1A1A1A]">₹{totalCalculatedRevenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              {topCategories.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-2">
                  No sales recorded.
                </div>
              ) : (
                topCategories.map((cat: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800 font-inter">₹{cat.value.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Revenue Heatmap grid (Visual representation) */}
          <div className="lg:col-span-2 glass-card rounded-[28px] p-6 shadow-luxury flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-widest">Engagement Density</span>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] mt-1 font-light uppercase tracking-wider">
                Weekly Revenue Heatmap
              </h3>
            </div>

            <div className="flex-1 mt-6 flex flex-col justify-between">
              {/* Heatmap Grid */}
              <div className="space-y-2">
                {/* Column Headers (Hours) */}
                <div className="flex items-center">
                  <div className="w-12 text-[10px] font-semibold text-gray-400 uppercase">Day</div>
                  <div className="flex-1 grid grid-cols-5 gap-2 text-center text-[10px] font-semibold text-gray-400">
                    {HEATMAP_HOURS.map((h, i) => (
                      <div key={i}>{h}</div>
                    ))}
                  </div>
                </div>

                {/* Day Rows */}
                {HEATMAP_DAYS.map((day, dIdx) => (
                  <div key={dIdx} className="flex items-center">
                    <div className="w-12 text-xs font-semibold text-gray-600 font-inter">{day}</div>
                    <div className="flex-1 grid grid-cols-5 gap-2">
                      {heatmapData[day]?.map((val, vIdx) => (
                        <div
                          key={vIdx}
                          style={{ backgroundColor: `rgba(255, 106, 0, ${val})` }}
                          className="h-8 rounded-lg relative group transition-all duration-200 cursor-pointer border border-[rgba(255, 106, 0,0.05)] hover:border-[#FF6A00]"
                        >
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-50">
                            Sales Index: {Math.floor(val * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4 text-[10px] text-gray-500 font-poppins">
                <span>Lower Sales Density</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[rgba(255, 106, 0,0.1)]" />
                  <span className="w-3 h-3 rounded bg-[rgba(255, 106, 0,0.4)]" />
                  <span className="w-3 h-3 rounded bg-[rgba(255, 106, 0,0.7)]" />
                  <span className="w-3 h-3 rounded bg-[rgba(255, 106, 0,0.95)]" />
                </div>
                <span>Peak Sales Density</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
