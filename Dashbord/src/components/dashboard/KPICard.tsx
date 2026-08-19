'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  growth: number;
  comparison: string;
  sparklineData: { value: number }[];
  accentColor?: 'gold' | 'orange' | 'green' | 'red';
  isAlert?: boolean;
}

export default function KPICard({
  title,
  value,
  prefix = '',
  suffix = '',
  growth,
  comparison,
  sparklineData,
  accentColor = 'gold',
  isAlert = false
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate counter from 0 to value
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    
    const duration = 1000; // 1s animation
    const increment = end / (duration / 16); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (val: number) => {
    if (prefix === '₹') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(val);
    }
    return prefix + val.toLocaleString('en-IN') + suffix;
  };

  const getAccentClass = () => {
    switch (accentColor) {
      case 'orange': return 'text-[#FF6A00]';
      case 'green': return 'text-[#0FA958]';
      case 'red': return 'text-[#D83A3A]';
      default: return 'text-[#FF6A00]';
    }
  };

  const getSparklineColor = () => {
    if (isAlert) return '#D83A3A';
    switch (accentColor) {
      case 'orange': return '#FF6A00';
      case 'green': return '#0FA958';
      case 'red': return '#D83A3A';
      default: return '#FF6A00';
    }
  };

  const isPositive = growth >= 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card rounded-[16px] sm:rounded-[24px] p-3 sm:p-6 shadow-luxury flex flex-col justify-between h-[140px] sm:h-[180px] hover:bg-white hover:border-[rgba(255, 106, 0,0.2)] transition-all duration-300 relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] sm:text-xs uppercase tracking-[0.1em] text-[#6E6E6E] font-medium leading-tight">{title}</p>
          <h3 className="font-inter text-lg sm:text-2xl font-light text-[#1A1A1A] mt-1 sm:mt-2 tracking-tight">
            {formatValue(displayValue)}
          </h3>
        </div>

        {/* Growth Badge */}
        {!isAlert ? (
          <div className={`flex items-center gap-0.5 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-inter ${
            isPositive 
              ? 'bg-green-50 text-[#0FA958]' 
              : 'bg-red-50 text-[#D83A3A]'
          }`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(growth)}%</span>
          </div>
        ) : (
          <div className="bg-red-50 text-[#D83A3A] p-2 rounded-full">
            <AlertTriangle size={16} className="animate-bounce" />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between mt-4">
        <p className="text-[10px] text-[#6E6E6E] font-poppins">{comparison}</p>
        
        {/* Sparkline mini-graph */}
        <div className="w-16 sm:w-24 h-8 sm:h-10 -mr-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
              <Line
                type="monotone"
                dataKey="value"
                stroke={getSparklineColor()}
                strokeWidth={1.5}
                dot={false}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Luxury Border Glow effect */}
      <div className={`absolute bottom-0 left-0 w-full h-[3px] opacity-10 bg-current ${getAccentClass()}`} />
    </motion.div>
  );
}
