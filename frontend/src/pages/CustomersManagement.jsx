import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { 
  Users, 
  Plus, 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  Lock, 
  X, 
  CheckCircle2, 
  Loader2, 
  MoreHorizontal,
  CreditCard,
  History,
  Trash2,
  Edit,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  UserCheck,
  UserX,
  Calendar,
  MessageCircle,
  Award,
  Star,
  Eye,
  DollarSign,
  Clock
} from 'lucide-react';

const CustomersManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    
    // Status & Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showTransactionsModal, setShowTransactionsModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // New Client Form
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', role: 'client'
    });

    // Edit Form
    const [editFormData, setEditFormData] = useState({
        name: '', email: '', phone: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/users/clients');
            setCustomers(response.data);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await api.post('/auth/register', formData);
            setStatus({ type: 'success', message: 'Account created successfully!' });
            setFormData({ name: '', email: '', phone: '', password: '', role: ['client'] });
            fetchCustomers();
            setTimeout(() => {
                setShowAddModal(false);
                setStatus({ type: '', message: '' });
            }, 1500);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Creation failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCustomer = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.put(`/users/${selectedCustomer.id}`, editFormData);
            fetchCustomers();
            setShowEditModal(false);
            setStatus({ type: 'success', message: 'Customer updated successfully!' });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: 'Update failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCustomer = async () => {
        try {
            await api.delete(`/users/${selectedCustomer.id}`);
            fetchCustomers();
            setShowDeleteConfirm(false);
            setSelectedCustomer(null);
            setStatus({ type: 'success', message: 'Customer deleted successfully!' });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: 'Delete failed.' });
        }
    };

    const openEditModal = (customer) => {
        setSelectedCustomer(customer);
        setEditFormData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || ''
        });
        setShowEditModal(true);
    };

    const openDeleteConfirm = (customer) => {
        setSelectedCustomer(customer);
        setShowDeleteConfirm(true);
    };

    const openTransactionsModal = (customer) => {
        setSelectedCustomer(customer);
        setShowTransactionsModal(true);
    };

    const filteredCustomers = customers
        .filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 c.phone?.includes(searchQuery);
            const matchesStatus = filterStatus === 'all' || 
                                 (filterStatus === 'active' && c.active) ||
                                 (filterStatus === 'inactive' && !c.active);
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'credit') return (b.currentBalance || 0) - (a.currentBalance || 0);
            return 0;
        });

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.active !== false).length,
        withCredit: customers.filter(c => (c.currentBalance || 0) > 0).length,
        totalCredit: customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0)
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Status Toast */}
                {status.message && (
                    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
                        status.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                        <span className="text-sm font-medium">{status.message}</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Customer Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your client base, track credit balances, and view transaction history</p>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-medium active:scale-95"
                    >
                        <UserPlus size={18} />
                        Add New Customer
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-semibold">Total Customers</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="bg-indigo-50 p-2 rounded-lg">
                                <Users size={18} className="text-indigo-600" />
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <TrendingUp size={12} />
                            <span>+12% this month</span>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-semibold">Active Clients</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                            </div>
                            <div className="bg-emerald-50 p-2 rounded-lg">
                                <UserCheck size={18} className="text-emerald-600" />
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">{Math.round((stats.active/stats.total)*100)}% of total</div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-semibold">Credit Customers</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.withCredit}</p>
                            </div>
                            <div className="bg-amber-50 p-2 rounded-lg">
                                <DollarSign size={18} className="text-amber-600" />
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">Active credit accounts</div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-semibold">Total Credit</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCredit.toLocaleString()} DH</p>
                            </div>
                            <div className="bg-purple-50 p-2 rounded-lg">
                                <CreditCard size={18} className="text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">Outstanding balance</div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by name, email, or phone number..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-gray-400" />
                                <select 
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Customers</option>
                                    <option value="active">Active Only</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            
                            <select 
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="name">Sort by Name</option>
                                <option value="credit">Sort by Credit</option>
                            </select>

                            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Download size={18} className="text-gray-500" />
                            </button>
                            <button onClick={fetchCustomers} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <RefreshCw size={18} className="text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Customers Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                        <p className="text-gray-500 text-sm">Loading customers...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                        <Users size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-400">No customers found</p>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-700"
                        >
                            Add your first customer
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCustomers.map((customer) => (
                            <div key={customer.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden group">
                                {/* Card Header */}
                                <div className="p-5 border-b border-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    Customer since {new Date(customer.createdAt).getFullYear()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <button className="text-gray-400 hover:text-gray-600 p-1">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail size={14} className="text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600 truncate">{customer.email || 'No email provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone size={14} className="text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600">{customer.phone || 'No phone number'}</span>
                                    </div>
                                    
                                    {/* Credit Balance */}
                                    <div className="mt-4 pt-3 border-t border-gray-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-500">Credit Balance</span>
                                            <span className="text-xs font-medium text-gray-500">Available Limit</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-gray-900">
                                                {(customer.currentBalance || 0).toLocaleString()} DH
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {(customer.creditLimit || 5000).toLocaleString()} DH
                                            </span>
                                        </div>
                                        <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                                            <div 
                                                className="bg-indigo-600 h-1.5 rounded-full transition-all"
                                                style={{ width: `${Math.min(((customer.currentBalance || 0) / (customer.creditLimit || 5000)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                    <button 
                                        onClick={() => openTransactionsModal(customer)}
                                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <History size={14} />
                                        History
                                    </button>
                                    <button 
                                        onClick={() => openEditModal(customer)}
                                        className="flex-1 px-3 py-2 text-xs font-medium text-indigo-600 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Edit size={14} />
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => openDeleteConfirm(customer)}
                                        className="px-3 py-2 text-xs font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Add New Customer</h3>
                                    <p className="text-sm text-gray-500 mt-1">Create a new customer account</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <form onSubmit={handleAddClient} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                <input 
                                    required 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                    placeholder="Enter customer name" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                    placeholder="customer@example.com" 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                <input 
                                    required 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                    placeholder="+212 6XX XXX XXX" 
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                                <input 
                                    required 
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                    placeholder="Create a password" 
                                    value={formData.password} 
                                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Create Customer
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Customer Modal */}
            {showEditModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Edit Customer</h3>
                                    <p className="text-sm text-gray-500 mt-1">Update customer information</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <form onSubmit={handleEditCustomer} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input 
                                    required 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                    value={editFormData.name} 
                                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                    value={editFormData.email} 
                                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input 
                                    required 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                    value={editFormData.phone} 
                                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} 
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Customer?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Are you sure you want to delete <span className="font-medium text-gray-900">{selectedCustomer.name}</span>? 
                                This action cannot be undone and will remove all customer data.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDeleteCustomer}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Delete Customer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions Modal */}
            {showTransactionsModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedCustomer.name}</p>
                            </div>
                            <button onClick={() => setShowTransactionsModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="text-center text-gray-500 py-8">
                                <History size={48} className="mx-auto mb-3 text-gray-300" />
                                <p>No transactions found</p>
                                <p className="text-sm mt-1">When customers make purchases, they'll appear here</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CustomersManagement;