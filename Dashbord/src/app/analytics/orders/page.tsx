'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend
} from 'recharts';
import { Truck, CheckCircle2, ShoppingBag, Clock, RefreshCw } from 'lucide-react';

export default function OrderAnalytics() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to fetch orders for logistics analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadOrders();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-t-2 border-b-2 border-[#FF6A00] rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#FF6A00]">Loading Logistics Insights...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Calculate order statuses dynamically
  const statusCounts: Record<string, number> = {
    PENDING: 0,
    PROCESSING: 0,
    PACKED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    RETURNED: 0,
    REFUNDED: 0
  };

  orders.forEach((o: any) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const fulfillmentStageData = [
    { stage: 'Pending', count: statusCounts.PENDING || 0 },
    { stage: 'Processing', count: statusCounts.PROCESSING || 0 },
    { stage: 'Packed', count: statusCounts.PACKED || 0 },
    { stage: 'Shipped', count: statusCounts.SHIPPED || 0 },
    { stage: 'Delivered', count: statusCounts.DELIVERED || 0 },
    { stage: 'Returned', count: statusCounts.RETURNED || 0 },
    { stage: 'Refunded', count: statusCounts.REFUNDED || 0 }
  ];

  // Payment methods breakdown
  const paymentMethodMap: Record<string, number> = {};
  orders.forEach((o: any) => {
    if (o.paymentMethod) {
      paymentMethodMap[o.paymentMethod] = (paymentMethodMap[o.paymentMethod] || 0) + 1;
    }
  });

  const paymentData = Object.entries(paymentMethodMap).map(([name, value]: [string, number]) => ({
    name: name.replace('_', ' '),
    value: value
  })).filter((p: any) => p.value > 0);

  const paymentColors = ['#FF6A00', '#FF6A00', '#0FA958', '#D99A00'];

  // Average Lead Time calculation (createdAt to delivered time)
  const getAvgLeadTime = () => {
    let totalDays = 0;
    let count = 0;
    orders.forEach((o: any) => {
      if (o.status !== 'PENDING' && o.status !== 'CANCELLED') {
        const created = new Date(o.createdAt).getTime();
        const nextTime = o.trackingDetails?.logs && o.trackingDetails.logs.length > 0
          ? new Date(o.trackingDetails.logs[0].timestamp).getTime()
          : new Date().getTime();
        const diff = (nextTime - created) / (1000 * 60 * 60 * 24);
        totalDays += Math.max(0.1, diff);
        count += 1;
      }
    });
    return count > 0 ? (totalDays / count).toFixed(1) + ' Days' : '0.0 Days';
  };

  const avgLeadTime = getAvgLeadTime();

  // Fulfillment rate calculation
  const getFulfillmentRate = () => {
    const nonCancelled = orders.filter((o: any) => o.status !== 'CANCELLED');
    if (nonCancelled.length === 0) return '0.0%';
    const fulfilled = nonCancelled.filter((o: any) => ['DELIVERED', 'SHIPPED', 'PACKED'].includes(o.status));
    return ((fulfilled.length / nonCancelled.length) * 100).toFixed(1) + '%';
  };

  const fulfillmentRate = getFulfillmentRate();

  // Courier performance calculations
  const getCourierPerformance = () => {
    const performance: Record<string, { speedSum: number; successCount: number; totalCount: number }> = {};
    
    orders.forEach((o: any) => {
      const carrier = o.trackingDetails?.carrier;
      if (carrier) {
        if (!performance[carrier]) {
          performance[carrier] = { speedSum: 0, successCount: 0, totalCount: 0 };
        }
        const perf = performance[carrier];
        perf.totalCount += 1;
        
        if (o.status === 'DELIVERED' && o.trackingDetails?.logs && o.trackingDetails.logs.length > 0) {
          const created = new Date(o.createdAt).getTime();
          const deliveryLog = o.trackingDetails.logs.find((l: any) => l.status.toLowerCase().includes('delivered'));
          const deliveryTime = deliveryLog ? new Date(deliveryLog.timestamp).getTime() : new Date().getTime();
          const daysDiff = (deliveryTime - created) / (1000 * 60 * 60 * 24);
          perf.speedSum += Math.max(0.5, daysDiff);
          perf.successCount += 1;
        } else if (o.status === 'SHIPPED' || o.status === 'DELIVERED') {
          perf.successCount += 1;
        }
      }
    });
    
    const colorsList = ['#FF6A00', '#FF6A00', '#0FA958', '#D99A00'];
    return Object.entries(performance).map(([name, stats]: [string, any], idx: number) => {
      const avgSpeed = stats.successCount > 0 ? (stats.speedSum / stats.successCount).toFixed(1) : '2.0';
      const successRate = stats.totalCount > 0 ? Number((stats.successCount / stats.totalCount * 100).toFixed(1)) : 100.0;
      return {
        name,
        speed: `${avgSpeed} Days`,
        success: successRate,
        color: colorsList[idx % colorsList.length]
      };
    });
  };

  const courierPerformance = getCourierPerformance();

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Order Logistics & Analytics</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Fulfillments, Logistics, and Courier Metrics</p>
          </div>
          <button
            onClick={loadOrders}
            className="p-2 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-[#6E6E6E] hover:text-[#1A1A1A] hover:border-[#FF6A00] transition-all"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Top summary row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(255, 106, 0,0.08)] flex items-center justify-center text-[#FF6A00] flex-shrink-0">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Total Shipments</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{orders.length}</h3>
              <p className="text-[9px] text-[#6E6E6E] mt-0.5">Total orders in system</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(255,106,0,0.08)] flex items-center justify-center text-[#FF6A00] flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Avg. Lead Time</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{avgLeadTime}</h3>
              <p className="text-[9px] text-[#6E6E6E] mt-0.5">Order creation to dispatch</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(15,169,88,0.08)] flex items-center justify-center text-[#0FA958] flex-shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Fulfillment Rate</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{fulfillmentRate}</h3>
              <p className="text-[9px] text-[#0FA958] mt-0.5 font-medium">SLA targets met</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fulfillment Stages BarChart */}
          <div className="lg:col-span-2 glass-card rounded-[28px] p-6 shadow-luxury min-h-[400px] flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-widest">Fulfillment Flow</span>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] mt-1 font-light uppercase tracking-wider">
                Order Pipeline Volumes
              </h3>
            </div>

            <div className="w-full h-[280px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fulfillmentStageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)" />
                  <XAxis dataKey="stage" stroke="#6E6E6E" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6E6E6E" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(value) => [value, 'Orders Count']}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={24}>
                    {fulfillmentStageData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 4 ? '#0FA958' : index === 5 ? '#D83A3A' : '#FF6A00'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Methods Donut */}
          <div className="glass-card rounded-[28px] p-6 shadow-luxury flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-widest">Transactional Modes</span>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] mt-1 font-light uppercase tracking-wider">
                Payment Channel Split
              </h3>
            </div>

            <div className="w-full h-[200px] flex items-center justify-center relative">
              {paymentData.length === 0 ? (
                <div className="text-center text-xs text-[#6E6E6E] font-poppins">
                  No payment data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {paymentData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={paymentColors[index % paymentColors.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(val) => <span className="text-[10px] text-gray-500 font-poppins">{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              {paymentData.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-2">
                  No payments recorded.
                </div>
              ) : (
                paymentData.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 truncate">{item.name}</span>
                    <span className="font-semibold text-gray-800 font-inter">{item.value} Orders</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Courier Performance Grid */}
        <div className="glass-card rounded-[28px] p-6 shadow-luxury">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h3 className="font-marcellus text-xl text-[#1A1A1A] font-light uppercase tracking-wider">
              Courier Partner Performance Audits
            </h3>
            <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider font-inter">Delivery Speed & SLA Compliance</p>
          </div>

          {courierPerformance.length === 0 ? (
            <div className="text-center py-12 text-sm text-[#6E6E6E] font-poppins bg-[#FAF9F6] rounded-2xl border border-[rgba(0,0,0,0.03)]">
              No courier partner metrics recorded yet. Assign tracking details to orders to view performance stats.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courierPerformance.map((c: any, idx: number) => (
                <div 
                  key={idx} 
                  className="p-5 rounded-2xl bg-[#FAF9F6] border border-[rgba(0,0,0,0.03)] hover:border-[#FF6A00] transition-all flex flex-col justify-between h-[160px] relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900">{c.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Primary Delivery Partner</p>
                    </div>
                    <Truck size={16} style={{ color: c.color }} />
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider">Avg. Transit Speed</p>
                      <p className="font-inter text-xl font-light text-gray-800">{c.speed}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider">SLA Success</p>
                      <p className="font-inter text-lg font-semibold" style={{ color: c.success > 98 ? '#0FA958' : '#FF6A00' }}>{c.success}%</p>
                    </div>
                  </div>

                  {/* Accent bar */}
                  <div className="absolute bottom-0 left-0 h-1 w-full" style={{ backgroundColor: c.color }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
