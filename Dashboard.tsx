
import React, { useState, useEffect } from 'react';
import { Activity, Wallet, ShieldCheck, Clock, HardDrive, Globe, Lock, Users, Server, Box, AlertCircle, TrendingUp } from 'lucide-react';
import { ServiceType, UserRole } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { COST_DATA, INITIAL_INSTANCES, INITIAL_BUCKETS } from '../constants';

interface DashboardProps {
  onChangeView: (view: ServiceType) => void;
  role: UserRole;
}

const Widget = ({ title, children, className = '', restricted = false, subtitle = '' }: { title: string, children?: React.ReactNode, className?: string, restricted?: boolean, subtitle?: string }) => (
  <div className={`bg-white border border-gray-300 rounded-sm shadow-sm p-4 flex flex-col ${className} ${restricted ? 'relative overflow-hidden' : ''}`}>
    <div className="flex justify-between items-start mb-4 border-b pb-2 border-gray-100">
        <div>
            <h3 className="font-bold text-lg text-[#161e2d]">{title}</h3>
            {subtitle && <p className="text-[10px] text-gray-500 font-medium uppercase">{subtitle}</p>}
        </div>
        {restricted && <Lock size={14} className="text-gray-400" />}
    </div>
    <div className="flex-1">
        {children}
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ onChangeView, role }) => {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem('aws_cloud_database');
    if (raw) {
        try {
            const users = JSON.parse(raw);
            setUserCount(users.length);
        } catch (e) {
            setUserCount(0);
        }
    }
  }, []);

  const isAdmin = role === 'admin';

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Admin Privilege Header */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-orange-600 to-orange-400 p-1 rounded-t-sm -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6">
             <div className="bg-white/90 backdrop-blur-sm py-2 px-6 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-orange-800">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Root Account Privileged View</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-bold text-orange-900/50">MFA: ENABLED</span>
                    <span className="text-[10px] font-bold text-orange-900/50">REGION: GLOBAL-1</span>
                </div>
             </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-[#161e2d]">Console Home</h1>
            <p className="text-sm text-gray-500">Welcome back to the StreaX Management Console.</p>
        </div>
        <div className={`text-xs px-3 py-1 rounded border font-bold uppercase ${isAdmin ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
          {isAdmin ? 'Root User' : 'IAM User'}
        </div>
      </div>

      {/* Admin-only Organization Summary */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between shadow-sm">
                <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Total Instances</p>
                    <p className="text-2xl font-bold">{INITIAL_INSTANCES.length}</p>
                </div>
                <Server size={24} className="text-blue-600 opacity-20" />
            </div>
            <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between shadow-sm">
                <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Active Buckets</p>
                    <p className="text-2xl font-bold">{INITIAL_BUCKETS.length}</p>
                </div>
                <Box size={24} className="text-[#ec7211] opacity-20" />
            </div>
            <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between shadow-sm border-l-4 border-l-red-600">
                <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">IAM Users</p>
                    <p className="text-2xl font-bold">{userCount}</p>
                </div>
                <Users size={24} className="text-red-600 opacity-20" />
            </div>
             <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between shadow-sm">
                <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Est. Monthly Cost</p>
                    <p className="text-2xl font-bold text-green-700">$1,950.00</p>
                </div>
                <TrendingUp size={24} className="text-green-600 opacity-20" />
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Widget title="Recently visited" subtitle="Service History">
           <div className="space-y-3">
             <button onClick={() => onChangeView(ServiceType.EC2)} className="w-full text-left p-2 hover:bg-gray-50 flex items-center justify-between group border border-transparent hover:border-gray-200 rounded">
                <span className="text-[#0073bb] font-semibold group-hover:underline">EC2</span>
                <span className="text-xs text-gray-500">Instances</span>
             </button>
             <button onClick={() => onChangeView(ServiceType.S3)} className="w-full text-left p-2 hover:bg-gray-50 flex items-center justify-between group border border-transparent hover:border-gray-200 rounded">
                <span className="text-[#0073bb] font-semibold group-hover:underline">S3</span>
                <span className="text-xs text-gray-500">Buckets</span>
             </button>
             {isAdmin && (
                <button onClick={() => onChangeView(ServiceType.IAM)} className="w-full text-left p-2 hover:bg-red-50 flex items-center justify-between group border border-transparent hover:border-red-100 rounded">
                    <span className="text-red-700 font-semibold group-hover:underline">IAM (Users DB)</span>
                    <span className="text-xs text-red-400 italic">Privileged Access</span>
                </button>
             )}
             <div className="w-full text-left p-2 hover:bg-gray-50 flex items-center justify-between group border border-transparent hover:border-gray-200 rounded cursor-pointer">
                <span className="text-[#0073bb] font-semibold group-hover:underline">Billing Dashboard</span>
                <span className="text-xs text-gray-500">Manage Costs</span>
             </div>
           </div>
        </Widget>

        <Widget title="StreaX Health" subtitle="Global Service Status">
            <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Activity size={24} />
                </div>
                <div>
                    <p className="font-bold text-[#161e2d]">Operational</p>
                    <p className="text-sm text-gray-500">All services operating normally</p>
                </div>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b py-1"><span>Open issues</span><span className="font-bold">0</span></div>
                <div className="flex justify-between border-b py-1"><span>Scheduled changes</span><span className="font-bold">0</span></div>
                <div className="flex justify-between py-1 text-blue-600 font-medium hover:underline cursor-pointer">
                    <span>View all events</span>
                </div>
            </div>
        </Widget>

        <Widget title="StreaX Advisor" subtitle="Optimization Alerts">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck className="text-green-600" size={20} />
                        <span className="text-sm font-medium">Security</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">0 check flags</span>
                </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Wallet className="text-yellow-600" size={20} />
                        <span className="text-sm font-medium">Cost Optimization</span>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">2 suggestions</span>
                </div>
                <div className="p-2 bg-blue-50 rounded border border-blue-100 flex items-center space-x-2">
                    <AlertCircle size={14} className="text-blue-600" />
                    <span className="text-[10px] text-blue-800">Upgrade to Enterprise support for full access.</span>
                </div>
             </div>
        </Widget>
      </div>

      <Widget title="Cost & Usage" subtitle="Monthly Billing Forecast" className="h-80">
          <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={COST_DATA}>
                      <defs>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ec7211" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#ec7211" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#888'}} />
                      <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#888'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '4px', border: '1px solid #ddd', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#ec7211', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="cost" stroke="#ec7211" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </Widget>

      <div>
        <h2 className="text-xl font-bold text-[#161e2d] mb-4">Explore StreaX</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
                { title: 'Launch a VM', desc: 'With EC2', icon: Clock },
                { title: 'Build a web app', desc: 'With App Engine', icon: Activity },
                { title: 'Host a static website', desc: 'With S3', icon: HardDrive },
                { title: 'Register a domain', desc: 'With StreaX DNS', icon: Globe },
            ].map((item, idx) => (
                <div key={idx} className="bg-white p-4 border border-gray-300 rounded shadow-sm hover:border-[#ec7211] cursor-pointer transition-colors group">
                    <div className="font-bold text-[#0073bb] mb-1 group-hover:text-[#ec7211]">{item.title}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <span>{item.desc}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
