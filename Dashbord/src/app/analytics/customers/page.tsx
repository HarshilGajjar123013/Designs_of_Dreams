'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { Users, Award, MapPin, RefreshCw, UserPlus } from 'lucide-react';

export default function CustomerAnalytics() {
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const [custRes, ordRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/orders')
      ]);
      const custData = await custRes.json();
      const ordData = await ordRes.json();
      if (custData.success) setCustomers(custData.customers || []);
      if (ordData.success) setOrders(ordData.orders || []);
    } catch (e) {
      console.error('Failed to fetch data for customer analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadCustomerData();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-t-2 border-b-2 border-[#FF6A00] rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#FF6A00]">Loading Customer Insights...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Joined in last 30 days
  const getJoinedThisMonth = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const count = customers.filter((c: any) => new Date(c.joinedDate) >= thirtyDaysAgo).length;
    return `+${count} accounts joined in last 30d`;
  };
  const customerGrowthText = getJoinedThisMonth();

  // Repeat Purchase Rate
  const getRepeatPurchaseRate = () => {
    if (customers.length === 0) return 0;
    const repeatCount = customers.filter((c: any) => c.totalOrders > 1).length;
    return Number((repeatCount / customers.length * 100).toFixed(1));
  };
  const repeatPurchaseRate = getRepeatPurchaseRate();

  // Average LTV
  const getAvgLTV = () => {
    if (customers.length === 0) return 0;
    const totalLTV = customers.reduce((sum: number, c: any) => sum + (c.totalSpent || 0), 0);
    return Math.floor(totalLTV / customers.length);
  };
  const avgLTV = getAvgLTV();

  // Dynamic retention index calculation
  const getRetentionData = () => {
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
      
      const startOfMonth = new Date(targetYear, targetMonthIdx, 1);
      const endOfMonth = new Date(targetYear, targetMonthIdx + 1, 0, 23, 59, 59);
      
      // Customers who joined BEFORE this month
      const existingCustomers = customers.filter((c: any) => new Date(c.joinedDate) < startOfMonth);
      
      // Customers who placed orders IN this month
      const activeCustomerIds = new Set(
        orders
          .filter((o: any) => {
            if (o.status === 'CANCELLED' || o.status === 'RETURNED') return false;
            const orderDate = new Date(o.createdAt);
            return orderDate >= startOfMonth && orderDate <= endOfMonth;
          })
          .map((o: any) => o.customerId)
      );
      
      const retainedCount = existingCustomers.filter((c: any) => activeCustomerIds.has(c.id)).length;
      
      const rate = existingCustomers.length > 0
        ? Math.min(100, Math.round((retainedCount / existingCustomers.length) * 100))
        : 0;
        
      data.push({
        month: months[targetMonthIdx],
        rate
      });
    }
    return data;
  };

  const retentionData = getRetentionData();

  // New vs Returning calculations
  const totalCustomers = customers.length;
  const repeatCustomersCount = customers.filter((c: any) => c.totalOrders > 1).length;
  const newCustomersCount = totalCustomers - repeatCustomersCount;

  const acquisitionData = [
    { name: 'Returning Clientele', value: repeatCustomersCount },
    { name: 'New Patrons', value: newCustomersCount }
  ].filter((item: any) => item.value > 0);

  const acquisitionColors = ['#FF6A00', '#FF6A00'];

  // Regional Sales Volume calculations
  const getRegionalDistribution = () => {
    const distributionMap: Record<string, number> = {};
    orders.forEach((o: any) => {
      if (o.status !== 'CANCELLED' && o.status !== 'RETURNED') {
        const state = o.shippingAddress?.state || 'Other';
        distributionMap[state] = (distributionMap[state] || 0) + o.grandTotal;
      }
    });
    
    const colorsList = ['#FF6A00', '#FF6A00', '#0FA958', '#D99A00', '#4E0707', '#6E6E6E'];
    return Object.entries(distributionMap)
      .map(([name, sales]: [string, number], idx: number) => ({
        name,
        sales,
        color: colorsList[idx % colorsList.length]
      }))
      .sort((a: any, b: any) => b.sales - a.sales)
      .slice(0, 5);
  };

  const regionalDistribution = getRegionalDistribution();

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Customer Demographics & CLV</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Acquisitions, LTV Leaderboards, and Locations</p>
          </div>
          <button
            onClick={loadCustomerData}
            className="p-2 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-[#6E6E6E] hover:text-[#1A1A1A] hover:border-[#FF6A00] transition-all"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Customer KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(255, 106, 0,0.08)] flex items-center justify-center text-[#FF6A00] flex-shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Total Client Base</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{customers.length} Accounts</h3>
              <p className="text-[9px] text-[#0FA958] mt-0.5 font-medium">{customerGrowthText}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(255,106,0,0.08)] flex items-center justify-center text-[#FF6A00] flex-shrink-0">
              <RefreshCw size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Repeat Purchase Rate</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{repeatPurchaseRate}%</h3>
              <p className="text-[9px] text-[#FF6A00] mt-0.5 font-medium">Clients with multiple orders</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(15,169,88,0.08)] flex items-center justify-center text-[#0FA958] flex-shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Average LTV</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">₹{avgLTV.toLocaleString()}</h3>
              <p className="text-[9px] text-[#6E6E6E] mt-0.5">Average customer value</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Retention LineChart */}
          <div className="lg:col-span-2 glass-card rounded-[28px] p-6 shadow-luxury min-h-[400px] flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-widest">Loyalty Timeline</span>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] mt-1 font-light uppercase tracking-wider">
                Customer Retention Index (%)
              </h3>
            </div>

            <div className="w-full h-[280px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)" />
                  <XAxis dataKey="month" stroke="#6E6E6E" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6E6E6E" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(value) => [`${value}%`, 'Retention Rate']}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#FF6A00" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* New vs Returning PieChart */}
          <div className="glass-card rounded-[28px] p-6 shadow-luxury flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-widest">Client Distribution</span>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] mt-1 font-light uppercase tracking-wider">
                Acquisition Split
              </h3>
            </div>

            <div className="w-full h-[200px] flex items-center justify-center relative">
              {acquisitionData.length === 0 ? (
                <div className="text-center text-xs text-[#6E6E6E] font-poppins">
                  No acquisition data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={acquisitionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {acquisitionData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={acquisitionColors[index % acquisitionColors.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(val) => <span className="text-[10px] text-gray-500 font-poppins">{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
              {totalCustomers === 0 ? (
                <div className="text-center text-xs text-gray-400 py-2">
                  No client records found.
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Returning Clientele</span>
                    <span className="font-semibold text-gray-800">
                      {totalCustomers > 0 ? ((repeatCustomersCount / totalCustomers) * 100).toFixed(1) : 0}% of client base
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Patrons</span>
                    <span className="font-semibold text-gray-800">
                      {totalCustomers > 0 ? ((newCustomersCount / totalCustomers) * 100).toFixed(1) : 0}% of client base
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lower Row: Geographic distribution and Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Buyers Leaderboard */}
          <div className="lg:col-span-2 glass-card rounded-[28px] p-6 shadow-luxury">
            <div className="border-b border-gray-100 pb-4 mb-4 flex justify-between items-center">
              <div>
                <h3 className="font-marcellus text-xl text-[#1A1A1A] font-light uppercase tracking-wider">
                  Atelier Top Buyers Leaderboard
                </h3>
                <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider font-inter">Couture Collectors & Patrons</p>
              </div>
              <Award size={18} className="text-[#FF6A00]" />
            </div>

            <div className="overflow-x-auto">
              {customers.length === 0 ? (
                <div className="text-center py-12 text-sm text-[#6E6E6E] font-poppins">
                  No client accounts registered yet.
                </div>
              ) : (
                <table className="luxury-table">
                  <thead>
                    <tr>
                      <th>Patron</th>
                      <th>Orders</th>
                      <th>Lifetime Spent</th>
                      <th>Preferences</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...customers]
                      .sort((a: any, b: any) => (b.totalSpent || 0) - (a.totalSpent || 0))
                      .map((c: any) => (
                        <tr key={c.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#FF6A00] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                                {c.avatar && (c.avatar.startsWith('http') || c.avatar.startsWith('data:image')) ? (
                                  <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                                ) : (
                                  c.avatar
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-900">{c.name}</p>
                                <p className="text-[10px] text-gray-500">{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="font-semibold text-xs text-gray-800 font-inter">{c.totalOrders} Orders</td>
                          <td className="font-semibold text-xs text-gray-900 font-inter">
                            ₹{c.totalSpent.toLocaleString()}
                          </td>
                          <td className="text-[10px] text-gray-500 max-w-[200px] truncate" title={c.notes}>
                            {c.notes || 'None'}
                          </td>
                          <td className="text-xs text-gray-600 font-inter">{c.joinedDate}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Regional Sales */}
          <div className="glass-card rounded-[28px] p-6 shadow-luxury flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#4E0707] tracking-widest">Geographics</span>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] mt-1 font-light uppercase tracking-wider">
                Regional Sales Volume
              </h3>
            </div>

            <div className="w-full h-[220px] mt-6 flex items-center justify-center">
              {regionalDistribution.length === 0 ? (
                <div className="text-center text-xs text-[#6E6E6E] font-poppins">
                  No regional data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.02)" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#6E6E6E" fontSize={10} tickLine={false} axisLine={false} width={80} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(value) => [`₹${(value as number).toLocaleString()}`, 'Sales Volume']}
                    />
                    <Bar dataKey="sales" radius={[0, 6, 6, 0]} barSize={12}>
                      {regionalDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              {regionalDistribution.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-2">
                  No sales recorded.
                </div>
              ) : (
                regionalDistribution.map((r: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={12} className="text-gray-400" />
                      <span>{r.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800 font-inter">₹{r.sales.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
