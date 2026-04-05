import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { 
  ShoppingBag, 
  Search, 
  Calendar, 
  Filter, 
  ChevronRight, 
  Eye, 
  Download, 
  RefreshCw, 
  Clock, 
  Banknote, 
  CreditCard, 
  CheckCircle2, 
  ChevronDown,
  X,
  Package,
  TrendingUp,
  ArrowUpRight,
  PieChart,
  BarChart3,
  DollarSign,
  Receipt,
  Printer,
  Share2,
  MoreVertical,
  AlertCircle
} from 'lucide-react';

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);
    const [filterMethod, setFilterMethod] = useState('ALL');
    const [dateRange, setDateRange] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/sales/history');
            setSales(response.data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)));
        } catch (error) {
            console.error("Failed to fetch sales history", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDateRangeFilter = (saleDate) => {
        const today = new Date();
        const saleDateObj = new Date(saleDate);
        const diffDays = Math.floor((today - saleDateObj) / (1000 * 60 * 60 * 24));
        
        switch(dateRange) {
            case 'today': return diffDays === 0;
            case 'week': return diffDays <= 7;
            case 'month': return diffDays <= 30;
            case 'year': return diffDays <= 365;
            default: return true;
        }
    };

    const filteredSales = sales.filter(sale => {
        const matchesMethod = filterMethod === 'ALL' || sale.paymentMethod === filterMethod;
        const matchesSearch = sale.id.toString().includes(searchQuery) || 
                             sale.totalAmount.toString().includes(searchQuery);
        const matchesDate = getDateRangeFilter(sale.transactionDate);
        return matchesMethod && matchesSearch && matchesDate;
    });

    const stats = {
        totalRevenue: filteredSales.reduce((sum, s) => sum + s.totalAmount, 0),
        count: filteredSales.length,
        cashCount: filteredSales.filter(s => s.paymentMethod === 'CASH').length,
        cardCount: filteredSales.filter(s => s.paymentMethod === 'CARD').length,
        cashRevenue: filteredSales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.totalAmount, 0),
        cardRevenue: filteredSales.filter(s => s.paymentMethod === 'CARD').reduce((sum, s) => sum + s.totalAmount, 0),
        averageTicket: filteredSales.length > 0 ? filteredSales.reduce((sum, s) => sum + s.totalAmount, 0) / filteredSales.length : 0
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Sales History</h1>
                        <p className="text-gray-500 text-sm mt-1">Track and manage all your store transactions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchSales}
                            className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw size={18} className={`text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-sm">
                            <Download size={18} />
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <DollarSign size={20} />
                            </div>
                            <ArrowUpRight size={16} className="opacity-60" />
                        </div>
                        <p className="text-xs font-medium opacity-80 mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} DH</p>
                        <p className="text-xs opacity-70 mt-2">{stats.count} transactions</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <div className="bg-emerald-50 p-2 rounded-lg">
                                <ShoppingBag size={18} className="text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Active</span>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Total Sales</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
                        <p className="text-xs text-gray-400 mt-2">Completed orders</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <div className="bg-emerald-50 p-2 rounded-lg">
                                <Banknote size={18} className="text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Cash Payments</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.cashCount}</p>
                        <p className="text-xs text-gray-400 mt-2">{stats.cashRevenue.toLocaleString()} DH total</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <CreditCard size={18} className="text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Card Payments</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.cardCount}</p>
                        <p className="text-xs text-gray-400 mt-2">{stats.cardRevenue.toLocaleString()} DH total</p>
                    </div>
                </div>

                {/* Average Ticket Highlight */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-lg">
                                <TrendingUp size={18} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-amber-700">Average Ticket Value</p>
                                <p className="text-xl font-bold text-amber-900">{stats.averageTicket.toFixed(2)} DH</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-amber-600">per transaction</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by transaction ID or amount..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <select 
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>

                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                <button 
                                    onClick={() => setFilterMethod('ALL')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                                        filterMethod === 'ALL' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    All
                                </button>
                                <button 
                                    onClick={() => setFilterMethod('CASH')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                                        filterMethod === 'CASH' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Cash
                                </button>
                                <button 
                                    onClick={() => setFilterMethod('CARD')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                                        filterMethod === 'CARD' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Card
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-3" size={32} />
                                            <p className="text-gray-400 text-sm">Loading transactions...</p>
                                        </td>
                                    </tr>
                                ) : filteredSales.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-400">No sales found</p>
                                            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-semibold text-gray-900">
                                                    #{sale.id.toString().padStart(6, '0')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">{formatDate(sale.transactionDate)}</span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Clock size={12} />
                                                        {formatTime(sale.transactionDate)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Package size={14} className="text-gray-400" />
                                                    <span className="text-sm text-gray-600">{sale.items.length} items</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-lg font-bold text-indigo-600">
                                                    {sale.totalAmount.toFixed(2)} DH
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                                                    sale.paymentMethod === 'CASH' 
                                                        ? 'bg-emerald-50 text-emerald-700' 
                                                        : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                    {sale.paymentMethod === 'CASH' ? <Banknote size={12} /> : <CreditCard size={12} />}
                                                    {sale.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => setSelectedSale(sale)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Placeholder */}
                    {filteredSales.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing {filteredSales.length} of {sales.length} transactions
                            </p>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                    Previous
                                </button>
                                <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm">
                                    1
                                </button>
                                <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sale Details Modal */}
            {selectedSale && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Receipt size={20} className="text-indigo-600" />
                                        <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Transaction #{selectedSale.id.toString().padStart(6, '0')}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedSale(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Total Amount</p>
                                    <p className="text-xl font-bold text-gray-900">{selectedSale.totalAmount.toFixed(2)} DH</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Payment Method</p>
                                    <div className="flex items-center justify-center gap-1">
                                        {selectedSale.paymentMethod === 'CASH' ? <Banknote size={16} className="text-emerald-600" /> : <CreditCard size={16} className="text-blue-600" />}
                                        <p className="text-xl font-bold text-gray-900">{selectedSale.paymentMethod}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Total Items</p>
                                    <p className="text-xl font-bold text-gray-900">{selectedSale.items.length}</p>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{formatDate(selectedSale.transactionDate)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span>{formatTime(selectedSale.transactionDate)}</span>
                                </div>
                            </div>

                            {/* Items List */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Package size={16} />
                                    Items Purchased
                                </h4>
                                <div className="space-y-2">
                                    {selectedSale.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{item.product.name}</p>
                                                <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">{item.subTotal.toFixed(2)} DH</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 flex gap-3">
                            <button className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <Printer size={16} />
                                Print Receipt
                            </button>
                            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                                <Download size={16} />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default SalesHistory;