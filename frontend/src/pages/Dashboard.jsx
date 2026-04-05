import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Store,
  UserCheck
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { motion } from 'framer-motion';

// Mock Data for "Real" look
const analyticsData = [
  { name: 'Mon', value: 400 }, { name: 'Tue', value: 700 }, { name: 'Wed', value: 600 },
  { name: 'Thu', value: 1200 }, { name: 'Fri', value: 900 }, { name: 'Sat', value: 1500 },
  { name: 'Sun', value: 1300 },
];

const AdminDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard title="Total Platform Users" value="1,284" percent="+12.5%" icon={<Users className="text-indigo-600" />} trend="up" />
      <StatsCard title="Active 7anouts" value="48" percent="+4.2%" icon={<Store className="text-emerald-600" />} trend="up" />
      <StatsCard title="Monthly Revenue" value="42,850 DH" percent="+18.1%" icon={<TrendingUp className="text-amber-600" />} trend="up" />
      <StatsCard title="Support Tickets" value="12" percent="-2.4%" icon={<AlertCircle className="text-rose-600" />} trend="down" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="User Growth (Weekly)">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Platform Activity">
        <div className="space-y-5">
            <ActivityItem icon={<UserCheck className="text-blue-500" />} user="Driss" action="Registered new Staff account" time="2 mins ago" />
            <ActivityItem icon={<Package className="text-amber-500" />} user="Yassine" action="Uploaded 20 new products" time="15 mins ago" />
            <ActivityItem icon={<CreditCard className="text-emerald-500" />} user="Aicha" action="Paid 500 DH credit to Moul7anout" time="1 hour ago" />
            <ActivityItem icon={<Store className="text-purple-500" />} user="Platform" action="System update completed" time="5 hours ago" />
        </div>
      </Card>
    </div>
  </div>
);

const StaffDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard title="Pending Inventory" value="24 Items" icon={<Package className="text-amber-600" />} subtitle="Detected by Scanner" />
      <StatsCard title="Low Stock Alerts" value="8 SKUs" percent="Critical" icon={<AlertCircle className="text-rose-600" />} trend="down" />
      <StatsCard title="Total SKU Count" value="482" icon={<BarChart className="text-indigo-600" />} />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card title="Inventory Performance">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card title="Inventory Checklist">
          <div className="space-y-4">
            <ChecklistItem text="Verify milk delivery" status="done" />
            <ChecklistItem text="Scan bread batch 102" status="pending" />
            <ChecklistItem text="Update price of Dari Couscous" status="pending" />
            <ChecklistItem text="Check exp. date on Yogurt" status="done" />
          </div>
      </Card>
    </div>
  </div>
);

const Moul7anoutDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard title="Today's Revenue" value="1,850 DH" percent="+5%" icon={<ShoppingBag className="text-emerald-600" />} trend="up" />
      <StatsCard title="Client Credits" value="12,400 DH" percent="High Risk" icon={<CreditCard className="text-rose-600" />} trend="down" />
      <StatsCard title="New Customers" value="6" icon={<Users className="text-indigo-600" />} subtitle="Active this week" />
    </div>

    <Card title="Revenue Stream (DH)">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <Tooltip />
            <Line type="stepAfter" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  </div>
);

const ClientDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-rose-500 to-rose-600 p-8 rounded-3xl text-white shadow-xl shadow-rose-100 flex items-center justify-between overflow-hidden relative"
      >
        <div className="relative z-10">
          <p className="text-rose-100 font-bold text-xs uppercase tracking-widest mb-2">My Total Credit Balance</p>
          <h2 className="text-4xl font-black mb-1">450 DH</h2>
          <p className="text-rose-100 flex items-center gap-2 font-medium opacity-80"><Calendar size={14} /> Last updated: Today</p>
        </div>
        <CreditCard size={100} className="absolute -bottom-10 -right-10 text-white opacity-10" />
      </motion.div>

      <div className="grid grid-cols-2 gap-6">
        <StatsCard title="Points Loyalty" value="120" icon={<TrendingUp className="text-indigo-600" />} />
        <StatsCard title="Last Purchase" value="80 DH" icon={<ShoppingBag className="text-amber-600" />} />
      </div>
    </div>

    <Card title="Recent Activity">
        <div className="divide-y divide-gray-100">
            <PurchaseItem item="Couscous Fassi 1kg" price="14.50" date="Oct 12" />
            <PurchaseItem item="Bottle of Water 5L" price="12.00" date="Oct 11" />
            <PurchaseItem item="Shampoo Head&Shoulders" price="45.00" date="Oct 08" />
            <PurchaseItem item="Payment (DH Cash)" price="-200.00" date="Oct 05" variant="payment" />
        </div>
    </Card>
  </div>
);

// Helper Components
const StatsCard = ({ title, value, percent, icon, trend, subtitle }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gray-50 rounded-2xl">{icon}</div>
      {trend && (
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {percent}
        </span>
      )}
    </div>
    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-2xl font-black text-gray-800 tracking-tight">{value}</h3>
    {subtitle && <p className="text-[10px] text-gray-400 mt-2 font-medium">{subtitle}</p>}
  </motion.div>
);

const Card = ({ title, children }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest pl-1 border-l-4 border-indigo-600">{title}</h3>
      <button className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">View All</button>
    </div>
    {children}
  </div>
);

const ActivityItem = ({ icon, user, action, time }) => (
  <div className="flex items-center gap-4 group">
    <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-600 leading-tight">
        <span className="font-bold text-gray-900">{user}</span> {action}
      </p>
      <span className="text-[10px] text-gray-400 font-bold uppercase">{time}</span>
    </div>
  </div>
);

const ChecklistItem = ({ text, status }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer group">
    {status === 'done' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Clock size={18} className="text-amber-400 group-hover:animate-pulse" />}
    <span className={`text-sm font-medium ${status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{text}</span>
  </div>
);

const PurchaseItem = ({ item, price, date, variant }) => (
  <div className="py-4 flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-xl ${variant === 'payment' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
        <ShoppingBag size={18} className={variant === 'payment' ? 'text-emerald-600' : 'text-gray-400'} />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800 tracking-tight">{item}</p>
        <p className="text-[10px] text-gray-400 font-bold uppercase">{date}</p>
      </div>
    </div>
    <p className={`font-black tracking-tight ${variant === 'payment' ? 'text-emerald-600' : 'text-gray-900'}`}>
        {variant !== 'payment' && '+'}{price} DH
    </p>
  </div>
);

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Mar7ba, {user?.name.split(' ')[0]} 👋</h1>
              <p className="text-gray-500 font-medium tracking-tight">Today is {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            {user?.role === 'ROLE_ADMIN' && <AdminDashboard />}
            {user?.role === 'ROLE_STAFF' && <StaffDashboard />}
            {user?.role === 'ROLE_MOUL7ANOUT' && <Moul7anoutDashboard />}
            {user?.role === 'ROLE_CLIENT' && <ClientDashboard />}
        </DashboardLayout>
    );
};

export default Dashboard;