'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { KeyRound, ShieldAlert, ShieldCheck, Globe, Smartphone, Calendar, Search } from 'lucide-react';

export default function SignInDataPanel() {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/security');
        const data = await res.json();
        if (data.success) {
          // Filter security logs to only show sign-in/login related events
          const signInEvents = data.securityLogs.filter((log: any) => 
            log.action.toLowerCase().includes('login') || 
            log.action.toLowerCase().includes('sign in') || 
            log.action.toLowerCase().includes('session') ||
            log.action.toLowerCase().includes('failed login')
          );
          setLogs(signInEvents);
        }
      } catch (err) {
        console.error('Failed to fetch sign in logs:', err);
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

  const filteredLogs = logs.filter(log => 
    log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.ip && log.ip.includes(searchTerm))
  );

  const successfulLogins = logs.filter(log => log.status === 'SUCCESS').length;
  const blockedAttempts = logs.filter(log => log.status === 'FAILED').length;

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in font-poppins">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5">
          <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Sign In Database</h1>
          <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Permanent record of administrator logins, sessions, and blocked entry attempts</p>
        </div>

        {/* Telemetry Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(15,169,88,0.08)] flex items-center justify-center text-[#0FA958] flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Authorized Session Logins</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{successfulLogins} Sessions</h3>
              <p className="text-[9px] text-[#0FA958] mt-0.5 font-medium">Valid credentials supplied</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(216,58,58,0.08)] flex items-center justify-center text-[#D83A3A] flex-shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Blocked Unauthorized Access</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{blockedAttempts} Blocks</h3>
              <p className="text-[9px] text-[#D83A3A] mt-0.5 font-medium">Failed login credentials detected</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(255, 106, 0,0.08)] flex items-center justify-center text-[#FF6A00] flex-shrink-0">
              <KeyRound size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Total Authentication Logs</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{logs.length} Entries</h3>
              <p className="text-[9px] text-gray-400 mt-0.5">Protected by security vaults</p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex justify-between items-center gap-4 bg-white px-5 py-4 border border-[rgba(0,0,0,0.05)] rounded-[20px] shadow-sm">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by actor name, action, or IP address..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] placeholder-gray-400"
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="text-[10px] text-gray-400 font-inter">
            Showing {filteredLogs.length} of {logs.length} logged events
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="glass-card rounded-[28px] p-6 shadow-luxury">
          <div className="overflow-x-auto">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / Username</th>
                  <th>Privilege Level</th>
                  <th>Action Logs</th>
                  <th>IP Address</th>
                  <th>Browser Device</th>
                  <th>Auth Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="text-xs font-inter text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-gray-400" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>
                    <td className="font-semibold text-xs text-gray-900">{log.adminName}</td>
                    <td>
                      <span className="text-[8.5px] uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">
                        {log.role}
                      </span>
                    </td>
                    <td className="text-xs text-gray-700 max-w-xs leading-relaxed">{log.action}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-inter">
                        <Globe size={11} className="text-gray-400" />
                        <span>{log.ip || '127.0.0.1'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Smartphone size={12} className="text-gray-400" />
                        <span className="truncate max-w-[120px]" title={log.device}>{log.device || 'Unknown Client'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`text-[8.5px] uppercase tracking-wider font-bold px-2 py-0.5 border rounded-full ${
                        log.status === 'SUCCESS'
                          ? 'bg-green-50 text-[#0FA958] border-[rgba(15,169,88,0.15)]'
                          : 'bg-red-50 text-[#D83A3A] border-[rgba(216,58,58,0.15)]'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400 text-xs font-poppins italic">
                      No sign-in records match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
