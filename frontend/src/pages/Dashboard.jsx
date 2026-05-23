import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import {
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Store,
  UserCheck,
  BarChart2,
  Loader2,
  ShoppingCart,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Palette ────────────────────────────────────────────────────────────────
const PLAN_COLORS = {
  START:    { bg: '#f0f9ff', ring: '#0ea5e9', text: '#0369a1', fill: '#38bdf8' },
  PRO:      { bg: '#f5f3ff', ring: '#7c3aed', text: '#5b21b6', fill: '#a78bfa' },
  ULTIMATE: { bg: '#fff7ed', ring: '#ea580c', text: '#9a3412', fill: '#fb923c' },
};

const PAYMENT_COLORS = {
  CASH:   '#10b981',
  CARD:   '#6366f1',
  CREDIT: '#f59e0b',
};

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = '', suffix = ' DH' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
      padding: '10px 16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    }}>
      <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 800 }}>
          {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('fr-MA') : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 rounded-2xl ${className}`}
    style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
);

// ─── Stats KPI Card ──────────────────────────────────────────────────────────
const KpiCard = ({ title, value, sub, icon, gradient, loading }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
    style={{
      background: 'white', borderRadius: 24,
      border: '1px solid #f1f5f9',
      padding: '28px 24px',
      position: 'relative', overflow: 'hidden',
    }}
  >
    {/* Gradient accent top-left */}
    <div style={{
      position: 'absolute', top: -32, left: -32, width: 120, height: 120,
      borderRadius: '50%', background: gradient, opacity: 0.12, filter: 'blur(20px)',
    }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{
        padding: 12, borderRadius: 16, background: gradient + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
    </div>
    {loading ? (
      <>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-32" />
      </>
    ) : (
      <>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>{title}</p>
        <h3 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1 }}>{value}</h3>
        {sub && <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 6 }}>{sub}</p>}
      </>
    )}
  </motion.div>
);

// ─── Chart Card ──────────────────────────────────────────────────────────────
const ChartCard = ({ title, children, action }) => (
  <div style={{
    background: 'white', borderRadius: 24, border: '1px solid #f1f5f9',
    padding: '28px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 20, borderRadius: 4, background: 'linear-gradient(180deg,#6366f1,#8b5cf6)' }} />
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ─── Activity Item ────────────────────────────────────────────────────────────
const activityConfig = {
  USER_REGISTRATION: { color: '#6366f1', bg: '#eef2ff', icon: <UserCheck size={15} color="#6366f1" /> },
  SALE_PROCESSED:    { color: '#10b981', bg: '#d1fae5', icon: <ShoppingCart size={15} color="#10b981" /> },
};
const ActivityRow = ({ type, user, action, time }) => {
  const cfg = activityConfig[type] || activityConfig.USER_REGISTRATION;
  return (
    <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
      <div style={{ padding: 10, borderRadius: 14, background: cfg.bg, flexShrink: 0 }}>{cfg.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: cfg.color }}>{user}</span>{' '}<span style={{ fontWeight: 500, color: '#64748b' }}>{action}</span>
        </p>
        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{time}</span>
      </div>
    </motion.div>
  );
};

// ─── Plan Badge ───────────────────────────────────────────────────────────────
const PlanBadge = ({ plan, count }) => {
  const c = PLAN_COLORS[plan] || PLAN_COLORS.START;
  return (
    <motion.div variants={fadeUp} style={{
      padding: '14px 18px', borderRadius: 18,
      background: c.bg, border: `1.5px solid ${c.ring}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: c.text, textTransform: 'uppercase', letterSpacing: 1 }}>{plan}</span>
      <span style={{ fontSize: 22, fontWeight: 900, color: c.ring }}>{count}</span>
    </motion.div>
  );
};

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (e) {
      console.error('Failed to load admin stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const fmtDH = (v) => {
    if (!v && v !== 0) return '—';
    const n = typeof v === 'object' ? parseFloat(Object.values(v).join('')) : parseFloat(v);
    return n.toLocaleString('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' DH';
  };

  // Build pie data for payment methods
  const paymentPie = stats ? Object.entries(stats.paymentMethodCounts || {}).map(([k, v]) => ({
    name: k, value: v, fill: PAYMENT_COLORS[k] || '#94a3b8',
  })) : [];

  const subscriptionData = stats ? Object.entries(stats.subscriptionDistribution || {}).map(([k, v]) => ({
    name: k, value: v, fill: PLAN_COLORS[k]?.fill || '#94a3b8',
  })) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>



      {/* ── KPI Cards ──────────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}
      >
        <KpiCard
          title="Total Users"
          value={loading ? '—' : stats?.totalUsers?.toLocaleString()}
          sub={`${stats?.moul7anoutCount ?? '—'} Shopkeepers · ${stats?.clientCount ?? '—'} Clients`}
          icon={<Users size={20} color="#6366f1" />}
          gradient="linear-gradient(135deg,#6366f1,#818cf8)"
          loading={loading}
        />
        <KpiCard
          title="Moul 7anout"
          value={loading ? '—' : stats?.moul7anoutCount?.toLocaleString()}
          sub="Active grocery stores"
          icon={<Store size={20} color="#10b981" />}
          gradient="linear-gradient(135deg,#10b981,#34d399)"
          loading={loading}
        />
        <KpiCard
          title="Total Products"
          value={loading ? '—' : stats?.totalProducts?.toLocaleString()}
          sub="Catalogued across all stores"
          icon={<Package size={20} color="#f59e0b" />}
          gradient="linear-gradient(135deg,#f59e0b,#fbbf24)"
          loading={loading}
        />
        <KpiCard
          title="Total Sales"
          value={loading ? '—' : stats?.totalSalesCount?.toLocaleString()}
          sub={`Platform revenue: ${loading ? '—' : fmtDH(stats?.totalRevenue)}`}
          icon={<ShoppingCart size={20} color="#ec4899" />}
          gradient="linear-gradient(135deg,#ec4899,#f472b6)"
          loading={loading}
        />
      </motion.div>

      {/* ── Revenue Chart + Activity Feed ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

        {/* Revenue Area Chart */}
        <ChartCard title="Revenue — Last 7 Days">
          {loading ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={28} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.dailySalesHistory || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                  <Tooltip content={<CustomTooltip suffix=" DH" />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3}
                    fill="url(#revenueGrad)"
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Mini legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            {loading ? (
              <>
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </>
            ) : (
              stats?.dailySalesHistory?.slice(-2).map((d, i) => (
                <div key={i}>
                  <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{d.name}</p>
                  <p style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{fmtDH(d.revenue)}</p>
                </div>
              ))
            )}
          </div>
        </ChartCard>

        {/* Activity Feed */}
        <ChartCard title="Recent Activity">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show">
              {(stats?.recentActivities || []).slice(0, 6).map((act, i) => (
                <ActivityRow key={i} {...act} />
              ))}
              {(!stats?.recentActivities?.length) && (
                <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: 13, fontWeight: 500, padding: '32px 0' }}>No activity yet</p>
              )}
            </motion.div>
          )}
        </ChartCard>
      </div>

      {/* ── Subscription Distribution + Payment Method + Daily Sales Bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

        {/* Subscription Donut */}
        <ChartCard title="Plan Distribution">
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={24} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={subscriptionData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} strokeWidth={0}>
                      {subscriptionData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v + ' stores', n]} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <motion.div variants={stagger} initial="hidden" animate="show"
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {subscriptionData.map((d, i) => (
                  <PlanBadge key={i} plan={d.name} count={d.value} />
                ))}
              </motion.div>
            </>
          )}
        </ChartCard>

        {/* Payment Method Pie */}
        <ChartCard title="Payment Methods">
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={24} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentPie} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={72} paddingAngle={3} strokeWidth={0}>
                      {paymentPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v + ' sales', n]} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {paymentPie.map((p, i) => (
                  <motion.div key={i} variants={fadeUp} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 14,
                    background: p.fill + '14', border: `1.5px solid ${p.fill}33`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.fill }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 900, color: p.fill }}>{p.value}</span>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </ChartCard>

        {/* Daily Sales Count Bar */}
        <ChartCard title="Daily Sale Count">
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={24} color="#f59e0b" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.dailySalesHistory || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip suffix=" sales" />} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={28}>
                    {(stats?.dailySalesHistory || []).map((entry, i) => (
                      <Cell key={i} fill={i === (stats?.dailySalesHistory?.length - 1) ? '#6366f1' : '#e0e7ff'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── User Role Breakdown Strip ───────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{
          background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', borderRadius: 24,
          padding: '24px 28px', border: '1px solid #e2e8f0',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
        }}
      >
        {[
          { label: 'Total Users',    value: stats?.totalUsers,       color: '#6366f1', icon: <Users size={16} color="#6366f1" /> },
          { label: 'Moul 7anout',    value: stats?.moul7anoutCount,   color: '#10b981', icon: <Store size={16} color="#10b981" /> },
          { label: 'Clients',        value: stats?.clientCount,       color: '#f59e0b', icon: <CreditCard size={16} color="#f59e0b" /> },
          { label: 'Staff Members',  value: stats?.staffCount,        color: '#ec4899', icon: <UserCheck size={16} color="#ec4899" /> },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ padding: 12, borderRadius: 16, background: item.color + '18' }}>{item.icon}</div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                {loading ? '—' : (item.value ?? '—').toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

    </div>
  );
};

// ─── Staff Dashboard ──────────────────────────────────────────────────────────
const StaffDashboard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
      {[
        { label: 'Pending Inventory', value: '24 Items', sub: 'Detected by Scanner', color: '#f59e0b', icon: <Package size={20} color="#f59e0b" /> },
        { label: 'Low Stock Alerts',  value: '8 SKUs',   sub: 'Requires restocking', color: '#ef4444', icon: <AlertCircle size={20} color="#ef4444" /> },
        { label: 'Total SKUs',        value: '482',       sub: 'In catalog',          color: '#6366f1', icon: <BarChart2 size={20} color="#6366f1" /> },
      ].map((c, i) => (
        <KpiCard key={i} title={c.label} value={c.value} sub={c.sub}
          icon={c.icon} gradient={`linear-gradient(135deg,${c.color},${c.color}aa)`} loading={false} />
      ))}
    </div>
    <ChartCard title="Inventory Checklist">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { text: 'Verify milk delivery', done: true },
          { text: 'Scan bread batch 102', done: false },
          { text: 'Update price of Dari Couscous', done: false },
          { text: 'Check exp. date on Yogurt', done: true },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderRadius: 16, background: item.done ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${item.done ? '#bbf7d0' : '#e2e8f0'}`,
          }}>
            {item.done
              ? <CheckCircle2 size={18} color="#10b981" />
              : <Clock size={18} color="#f59e0b" />}
            <span style={{ fontSize: 14, fontWeight: 600, color: item.done ? '#6b7280' : '#1e293b',
              textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  </div>
);

// ─── Moul 7anout Dashboard ────────────────────────────────────────────────────
const analyticsData = [
  { name: 'Mon', value: 400 }, { name: 'Tue', value: 700 }, { name: 'Wed', value: 600 },
  { name: 'Thu', value: 1200 }, { name: 'Fri', value: 900 }, { name: 'Sat', value: 1500 }, { name: 'Sun', value: 1300 },
];
const Moul7anoutDashboard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
      <KpiCard title="Today's Revenue" value="1,850 DH" sub="+5% vs yesterday" icon={<ShoppingBag size={20} color="#10b981" />} gradient="linear-gradient(135deg,#10b981,#34d399)" loading={false} />
      <KpiCard title="Client Credits" value="12,400 DH" sub="High risk balance" icon={<CreditCard size={20} color="#ef4444" />} gradient="linear-gradient(135deg,#ef4444,#f87171)" loading={false} />
      <KpiCard title="New Customers" value="6" sub="Active this week" icon={<Users size={20} color="#6366f1" />} gradient="linear-gradient(135deg,#6366f1,#818cf8)" loading={false} />
    </div>
    <ChartCard title="Revenue Stream (DH)">
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip suffix=" DH" />} />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  </div>
);

// ─── Client Dashboard ─────────────────────────────────────────────────────────
const ClientDashboard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: 28, padding: '32px 36px',
        background: 'linear-gradient(135deg,#be123c,#9f1239)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(190,18,60,0.3)',
      }}
    >
      <div style={{ position: 'absolute', bottom: -40, right: -40, opacity: 0.1 }}>
        <CreditCard size={160} color="white" />
      </div>
      <div>
        <p style={{ color: '#fecdd3', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>My Total Credit Balance</p>
        <h2 style={{ color: 'white', fontSize: 40, fontWeight: 900, letterSpacing: '-2px', marginBottom: 6 }}>450 DH</h2>
        <p style={{ color: '#fda4af', fontSize: 13, fontWeight: 500 }}>Last updated: Today</p>
      </div>
    </motion.div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <KpiCard title="Loyalty Points" value="120" icon={<TrendingUp size={20} color="#6366f1" />} gradient="linear-gradient(135deg,#6366f1,#818cf8)" loading={false} />
      <KpiCard title="Last Purchase" value="80 DH" icon={<ShoppingBag size={20} color="#f59e0b" />} gradient="linear-gradient(135deg,#f59e0b,#fbbf24)" loading={false} />
    </div>

    <ChartCard title="Recent Activity">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {[
          { item: 'Couscous Fassi 1kg', price: '+14.50', date: 'Oct 12' },
          { item: 'Bottle of Water 5L', price: '+12.00', date: 'Oct 11' },
          { item: 'Shampoo Head & Shoulders', price: '+45.00', date: 'Oct 08' },
          { item: 'Payment (DH Cash)', price: '-200.00', date: 'Oct 05', payment: true },
        ].map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ padding: 10, borderRadius: 14, background: p.payment ? '#d1fae5' : '#f1f5f9' }}>
                <ShoppingBag size={16} color={p.payment ? '#10b981' : '#94a3b8'} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{p.item}</p>
                <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{p.date}</p>
              </div>
            </div>
            <p style={{ fontSize: 16, fontWeight: 900, color: p.payment ? '#10b981' : '#0f172a' }}>{p.price} DH</p>
          </div>
        ))}
      </div>
    </ChartCard>
  </div>
);

// ─── Root Dashboard Page ──────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1, marginBottom: 6 }}>
          Mar7ba, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#64748b', fontWeight: 500, fontSize: 14 }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {user?.role === 'ROLE_ADMIN'       && <AdminDashboard />}
      {user?.role === 'ROLE_STAFF'       && <StaffDashboard />}
      {user?.role === 'ROLE_MOUL7ANOUT'  && <Moul7anoutDashboard />}
      {user?.role === 'ROLE_CLIENT'      && <ClientDashboard />}
    </DashboardLayout>
  );
};

export default Dashboard;