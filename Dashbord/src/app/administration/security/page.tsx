'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ShieldAlert, ShieldCheck, Activity, Terminal, Globe, Smartphone } from 'lucide-react';

export default function SecurityPanel() {
  const [mounted, setMounted] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/security');
        const data = await res.json();
        if (data.success) {
          setSecurityLogs(data.securityLogs);
        }
      } catch (err) {
        console.error('Failed to fetch security logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (!mounted || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF6A00]"></div>
        </div>
      </AdminLayout>
    );
  }

  const failedAttemptsCount = securityLogs.filter(log => log.status === 'FAILED').length;

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5">
          <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Security Panel & Audits</h1>
          <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Real-time session records and admin activity logs</p>
        </div>

        {/* Security Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(15,169,88,0.08)] flex items-center justify-center text-[#0FA958] flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Firewall Protection</p>
              <h3 className="font-inter text-lg font-semibold text-gray-800 mt-1">ACTIVE</h3>
              <p className="text-[9px] text-[#0FA958] mt-0.5 font-medium">JWT Protection Layer Live</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(255, 106, 0,0.08)] flex items-center justify-center text-[#FF6A00] flex-shrink-0">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Activity Index</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{securityLogs.length} Records</h3>
              <p className="text-[9px] text-gray-400 mt-0.5">Logged actions since boot</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4 font-inter">
            <div className="w-12 h-12 rounded-full bg-[rgba(216,58,58,0.08)] flex items-center justify-center text-[#D83A3A] flex-shrink-0">
              <ShieldAlert size={20} className={failedAttemptsCount > 0 ? 'animate-pulse' : ''} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Unrecognized Access Blocks</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{failedAttemptsCount} Attempts</h3>
              <p className="text-[9px] text-[#D83A3A] mt-0.5 font-medium">IP blocks applied immediately</p>
            </div>
          </div>
        </div>

        {/* Security Logs Audit Table */}
        <div className="glass-card rounded-[28px] p-6 shadow-luxury">
          <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] font-light uppercase tracking-wider">
                Operational Audit trail logs
              </h3>
              <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider font-inter">Permanent record of system interactions</p>
            </div>
            <Terminal size={18} className="text-[#FF6A00]" />
          </div>

          <div className="overflow-x-auto">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / Admin Name</th>
                  <th>Role</th>
                  <th>Action Log Description</th>
                  <th>Network Address</th>
                  <th>Device / Agent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {securityLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-xs font-inter text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="font-semibold text-xs text-gray-900">{log.adminName}</td>
                    <td>
                      <span className="text-[8.5px] uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">
                        {log.role}
                      </span>
                    </td>
                    <td className="text-xs text-gray-700 leading-normal max-w-xs">{log.action}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-inter">
                        <Globe size={11} className="text-gray-400" />
                        <span>{log.ip}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Smartphone size={12} className="text-gray-400" />
                        <span className="truncate max-w-[120px]" title={log.device}>{log.device}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 border rounded-full ${
                        log.status === 'SUCCESS'
                          ? 'bg-green-50 text-[#0FA958] border-[rgba(15,169,88,0.15)]'
                          : 'bg-red-50 text-[#D83A3A] border-[rgba(216,58,58,0.15)]'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
