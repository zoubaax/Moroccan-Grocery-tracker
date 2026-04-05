import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ShieldCheck,
  UserPlus,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Settings,
  HelpCircle,
  ChevronRight,
  Activity,
  DollarSign,
  BarChart3,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const Dashboard = () => {
    const { user } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('today');

    // Stats based on roles with enhanced data
    const stats = useMemo(() => [
        { 
            title: 'Total Sales', 
            value: '12,450 MAD', 
            change: '+12.5%', 
            isUp: true, 
            icon: <ShoppingBag size={22} />, 
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600',
            trend: 'up',
            subtitle: 'vs last month'
        },
        { 
            title: 'Active Credits', 
            value: '4,200 MAD', 
            change: '-2.4%', 
            isUp: false, 
            icon: <CreditCard size={22} />, 
            color: 'from-amber-500 to-amber-600',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600',
            trend: 'down',
            subtitle: 'credit balance'
        },
        { 
            title: 'Inventory Count', 
            value: '142', 
            change: '+3 new', 
            isUp: true, 
            icon: <Package size={22} />, 
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            trend: 'up',
            subtitle: 'SKU in stock'
        },
        { 
            title: 'Total Customers', 
            value: '89', 
            change: '+12.1%', 
            isUp: true, 
            icon: <Users size={22} />, 
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
            trend: 'up',
            subtitle: 'active customers'
        },
    ], []);

    const recentTransactions = [
        { id: 'TX-001', title: 'Vente de Lait & Pain', amount: '15.50 MAD', type: 'CASH SALE', time: '2 mins ago', status: 'completed', customer: 'Ahmed B.' },
        { id: 'TX-002', title: 'Achat Légumes Bio', amount: '42.00 MAD', type: 'CARD PAYMENT', time: '15 mins ago', status: 'completed', customer: 'Fatima Z.' },
        { id: 'TX-003', title: 'Fournitures Bureau', amount: '128.00 MAD', type: 'BANK TRANSFER', time: '1 hour ago', status: 'pending', customer: 'Karim H.' },
        { id: 'TX-004', title: 'Vente Électronique', amount: '899.00 MAD', type: 'CASH SALE', time: '3 hours ago', status: 'completed', customer: 'Sofia M.' },
    ];

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsRefreshing(false);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section with Enhanced Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                                Welcome back, {user?.name.split(' ')[0]}! 👋
                            </h1>
                            <div className="hidden lg:flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                                <Zap size={14} className="fill-current" />
                                <span>7 active orders</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-base">
                            Here's what's happening with your business today.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Period Selector */}
                        <div className="flex bg-gray-100 rounded-xl p-1">
                            {['today', 'week', 'month'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        selectedPeriod === period 
                                            ? 'bg-white shadow-sm text-gray-900' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {period.charAt(0).toUpperCase() + period.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <button 
                            onClick={handleRefresh}
                            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-sm"
                        >
                            <RefreshCw size={18} className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        
                        {user?.role === 'ROLE_ADMIN' && (
                            <Link 
                                to="/register" 
                                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 text-sm"
                            >
                                <UserPlus size={18} />
                                Add User
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Grid with Enhanced Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div 
                            key={idx} 
                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                        <div className={`${stat.textColor}`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {stat.change}
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {stat.title}
                                    </p>
                                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                        {stat.value}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {stat.subtitle}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Progress Bar for Visual Interest */}
                            <div className="h-1 bg-gray-50 w-full">
                                <div className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-500 group-hover:w-full w-3/4`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity with Enhanced Table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-50 p-2 rounded-xl">
                                        <Clock size={20} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                                        <p className="text-sm text-gray-500">Latest 4 transactions from your store</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Download size={16} className="text-gray-500" />
                                    </button>
                                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                        View All
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Transactions List */}
                        <div className="divide-y divide-gray-50">
                            {recentTransactions.map((transaction) => (
                                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                                                <DollarSign size={18} className="text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-gray-900 text-sm">{transaction.title}</p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(transaction.status)}`}>
                                                        {transaction.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>{transaction.type}</span>
                                                    <span>•</span>
                                                    <span>{transaction.time}</span>
                                                    <span>•</span>
                                                    <span>Customer: {transaction.customer}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{transaction.amount}</p>
                                            <p className="text-xs text-gray-400">{transaction.id}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View More Link */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <button className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                Load more transactions
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Quick Actions & Security */}
                    <div className="space-y-6">
                        {/* Security Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
                            
                            <div className="relative z-10">
                                <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                                    <ShieldCheck size={24} className="text-indigo-200" />
                                </div>
                                
                                <h4 className="text-xl font-bold mb-2">Account Security</h4>
                                <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                                    Your account is protected with role-based access control and JWT authentication.
                                </p>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-indigo-200">2FA Status</span>
                                        <span className="font-semibold bg-emerald-400/20 px-2 py-0.5 rounded-full text-xs">Enabled</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-indigo-200">Last Login</span>
                                        <span className="font-semibold">Today, 09:34 AM</span>
                                    </div>
                                </div>
                                
                                <button className="mt-6 w-full bg-white/10 hover:bg-white/20 rounded-xl py-2.5 text-sm font-semibold transition-all backdrop-blur-sm">
                                    Security Settings
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-purple-50 p-2 rounded-xl">
                                    <Zap size={18} className="text-purple-600" />
                                </div>
                                <h4 className="font-bold text-gray-900">Quick Actions</h4>
                            </div>
                            
                            <div className="space-y-3">
                                {[
                                    { icon: <Package size={16} />, label: 'Add New Product', color: 'bg-blue-50 text-blue-600' },
                                    { icon: <Users size={16} />, label: 'Invite Team Member', color: 'bg-green-50 text-green-600' },
                                    { icon: <BarChart3 size={16} />, label: 'View Reports', color: 'bg-orange-50 text-orange-600' },
                                    { icon: <Settings size={16} />, label: 'Settings', color: 'bg-gray-50 text-gray-600' },
                                ].map((action, idx) => (
                                    <button 
                                        key={idx}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`${action.color} p-1.5 rounded-lg`}>
                                                {action.icon}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{action.label}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-xl shadow-sm">
                                        <HelpCircle size={20} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Need Help?</h4>
                                        <p className="text-xs text-gray-500">24/7 Support Available</p>
                                    </div>
                                </div>
                                <button className="text-indigo-600 hover:text-indigo-700">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-3">
                                Check our documentation or contact support for assistance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;