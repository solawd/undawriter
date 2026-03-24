"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
interface DashboardStats {
  weeklyPolicyPurchases: { date: string, count: number }[];
  pendingClaimsCount: number;
  rejectedClaimsCount: number;
  successfulClaimsCount: number;
}

const SmoothLineChart = ({ data }: { data: { date: string; count: number }[] }) => {
  if (!data || data.length === 0) return <div className="text-gray-500">No data available</div>;

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const minCount = 0;
  
  const width = 800;
  const height = 300;
  const paddingX = 40;
  const paddingY = 40;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  
  const getX = (index: number) => paddingX + (index * chartWidth) / (data.length - 1 || 1);
  const getY = (count: number) => height - paddingY - ((count - minCount) / (maxCount - minCount)) * chartHeight;

  let pathData = "";
  if (data.length > 0) {
    pathData = `M ${getX(0)} ${getY(data[0].count)}`;
    for (let i = 0; i < data.length - 1; i++) {
        const curr = data[i];
        const next = data[i + 1];
        const cx1 = getX(i) + chartWidth / (data.length - 1) / 2;
        const cy1 = getY(curr.count);
        const cx2 = getX(i) + chartWidth / (data.length - 1) / 2;
        const cy2 = getY(next.count);
        pathData += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${getX(i+1)} ${getY(next.count)}`;
    }
  }

  const areaPath = pathData ? `${pathData} L ${getX(data.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z` : "";

  return (
    <div className="w-full overflow-x-auto relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-sm min-w-[600px]">
        {/* Grid lines */}
        {[0, 0.5, 1].map(ratio => {
           const y = height - paddingY - ratio * chartHeight;
           return (
             <g key={ratio}>
               <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#E5E7EB" strokeDasharray="4 4" />
               <text x={paddingX - 10} y={y + 4} fontSize="12" fill="#6B7280" textAnchor="end">
                 {Math.round(minCount + ratio * (maxCount - minCount))}
               </text>
             </g>
           )
        })}
        {areaPath && <path d={areaPath} fill="url(#colorCount)" opacity={0.2} />}
        {pathData && <path d={pathData} fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" className="animate-dash" />}
        {data.map((d, i) => (
          <g key={i} className="group cursor-pointer">
            <circle cx={getX(i)} cy={getY(d.count)} r="5" fill="#10B981" stroke="#fff" strokeWidth="2" className="transition-all group-hover:r-7" />
            <text x={getX(i)} y={height - 10} fontSize="12" fill="#6B7280" textAnchor="middle">
              {d.date.length > 5 ? d.date.substring(0, 5) : d.date}
            </text>
            <title>{d.date}: {d.count} policies</title>
          </g>
        ))}
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
          </linearGradient>
        </defs>
      </svg>
      <style dangerouslySetInnerHTML={{__html: `
        .animate-dash {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: draw 2s ease-out forwards;
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
      `}} />
    </div>
  )
}

export default function StaffDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/v1/staff/dashboard")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard stats", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-center text-red-500">Failed to load dashboard.</div>;
  }

  const maxCount = Math.max(...stats.weeklyPolicyPurchases.map(d => d.count), 1); // Avoid div by 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Staff Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Claims */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending Claims</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingClaimsCount}</p>
          </div>
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-2xl">
            ⏳
          </div>
        </div>

        {/* Successful Claims */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Successful Claims</p>
            <p className="text-3xl font-bold text-green-600">{stats.successfulClaimsCount}</p>
          </div>
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-2xl">
            ✅
          </div>
        </div>

        {/* Rejected Claims */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Rejected Claims</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejectedClaimsCount}</p>
          </div>
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-2xl">
            ❌
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-xl font-bold text-primary mb-6">Policies Sold (Last 7 Days)</h2>
        <div className="mt-4">
          <SmoothLineChart data={stats.weeklyPolicyPurchases} />
        </div>
      </div>
    </div>
  );
}
