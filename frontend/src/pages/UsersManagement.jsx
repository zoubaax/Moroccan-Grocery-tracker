import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { 
    Users, 
    User,
    Edit, 
    Trash2, 
    Key, 
    Search, 
    X,
    Check,
    Loader2,
    AlertCircle,
    UserCircle,
    Shield,
    Mail,
    UserPlus,
    Filter,
    Download,
    RefreshCw,
    Eye,
    EyeOff,
    Crown,
    Store,
    Briefcase,
    Lock,
    ShieldCheck,
    CheckCircle,
    Sparkles,
    Zap
} from 'lucide-react';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Modals state
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('START');
    
    // Forms state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roleFilter, setRoleFilter] = useState('all');
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    
    // Register Form State
    const [registerData, setRegisterData] = useState({
        name: '', email: '', password: '', role: 'ROLE_CLIENT'
    });
    const [registerStatus, setRegisterStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setRegisterStatus({ type: '', message: '' });

        try {
            const payload = {
                ...registerData,
                role: registerData.role.replace('ROLE_', '').toLowerCase()
            };
            await api.post('/auth/register', payload);
            setRegisterStatus({ type: 'success', message: 'User registered successfully!' });
            setRegisterData({ name: '', email: '', password: '', role: 'ROLE_CLIENT' });
            fetchUsers(); // Refresh list
            setTimeout(() => setShowRegisterModal(false), 1500); // Close modal on success
        } catch (error) {
            setRegisterStatus({ 
                type: 'error', message: error.response?.data?.message || 'Registration failed' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            setShowDeleteConfirm(false);
            setSelectedUser(null);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to delete user';
            alert(msg);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.put(`/users/${selectedUser.id}`, selectedUser);
            setShowEditModal(false);
            fetchUsers();
        } catch (error) {
            alert("Update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePlanChangeSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.put(`/users/${selectedUser.id}/subscription`, { plan: selectedPlan });
            fetchUsers();
            setShowPlanModal(false);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update subscription plan';
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPlanBadgeClass = (plan) => {
        switch (plan) {
            case 'ULTIMATE': return 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-500/30 font-extrabold shadow-sm shadow-amber-500/5 hover:from-amber-500/20 hover:to-orange-500/20';
            case 'PRO': return 'bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-700 border-violet-500/30 font-extrabold shadow-sm shadow-violet-500/5 hover:from-violet-500/20 hover:to-indigo-500/20';
            default: return 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-slate-300/60 font-semibold hover:from-slate-100 hover:to-slate-200';
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.put(`/users/${selectedUser.id}/password`, newPassword, {
                headers: { 'Content-Type': 'text/plain' }
            });
            setShowPasswordModal(false);
            setNewPassword('');
            setShowPassword(false);
            alert("Password updated successfully");
        } catch (error) {
            alert("Reset failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleIcon = (role) => {
        switch(role?.name) {
            case 'ROLE_ADMIN': return <Crown size={14} />;
            case 'ROLE_MOUL7ANOUT': return <Store size={14} />;
            case 'ROLE_STAFF': return <Briefcase size={14} />;
            default: return <UserCircle size={14} />;
        }
    };

    const getRoleColor = (role) => {
        switch(role?.name) {
            case 'ROLE_ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'ROLE_MOUL7ANOUT': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'ROLE_STAFF': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role?.name === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role?.name === 'ROLE_ADMIN').length,
        moul7anouts: users.filter(u => u.role?.name === 'ROLE_MOUL7ANOUT').length,
        staff: users.filter(u => u.role?.name === 'ROLE_STAFF').length,
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Team Members</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage user access, roles, and permissions</p>
                    </div>
                    <button 
                        onClick={() => {
                            setRegisterStatus({ type: '', message: '' });
                            setShowRegisterModal(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                    >
                        <UserPlus size={18} />
                        Add New User
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div><p className="text-gray-400 text-xs uppercase font-semibold">Total Users</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p></div>
                            <div className="bg-indigo-50 p-2 rounded-lg"><Users size={18} className="text-indigo-600" /></div>
                        </div>
                    </div>
                    {/* ... other stats ... */}
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Filter size={16} className="text-gray-400" />
                            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="all">All Roles</option>
                                <option value="ROLE_ADMIN">Admin</option>
                                <option value="ROLE_MOUL7ANOUT">Store Owner</option>
                                <option value="ROLE_STAFF">Staff</option>
                            </select>
                            <button onClick={fetchUsers} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"><RefreshCw size={18} className="text-gray-500" /></button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32} /></td></tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{user.name.charAt(0).toUpperCase()}</div>
                                                <div><p className="font-medium text-gray-900">{user.name}</p><p className="text-xs text-gray-400">{user.email}</p></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {user.role?.name?.replace('ROLE_', '') || 'CLIENT'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role?.name === 'ROLE_MOUL7ANOUT' ? (
                                                <button
                                                    onClick={() => { 
                                                        setSelectedUser(user); 
                                                        setSelectedPlan(user.subscriptionPlan || 'START');
                                                        setShowPlanModal(true); 
                                                    }}
                                                    className={`text-[10px] tracking-wider uppercase font-bold px-3 py-1.5 rounded-xl border outline-none transition-all duration-200 hover:scale-105 shadow-sm active:scale-95 flex items-center gap-1.5 ${getPlanBadgeClass(user.subscriptionPlan || 'START')}`}
                                                >
                                                    {(user.subscriptionPlan || 'START') === 'ULTIMATE' ? <Sparkles size={11} className="text-amber-500 animate-pulse" /> : 
                                                     (user.subscriptionPlan || 'START') === 'PRO' ? <Crown size={11} className="text-violet-500" /> : <Store size={11} className="text-slate-500" />}
                                                    {user.subscriptionPlan || 'START'}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">ACTIVE</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }} className="p-2 text-gray-400 hover:text-amber-600"><Key size={16} /></button>
                                                <button onClick={() => { setSelectedUser(user); setShowEditModal(true); }} className="p-2 text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
                                                <button onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-600 p-2 rounded-lg text-white"><UserPlus size={20} /></div>
                                <div><h3 className="text-xl font-bold text-gray-900">Create New User</h3><p className="text-xs text-gray-500">Add a new member to the platform</p></div>
                            </div>
                            <button onClick={() => setShowRegisterModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleRegister} className="p-6 space-y-4">
                            {registerStatus.message && (
                                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
                                    registerStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                    {registerStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                    {registerStatus.message}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input required className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="John Doe" value={registerData.name} onChange={(e) => setRegisterData({...registerData, name: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input required type="email" className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="john@example.com" value={registerData.email} onChange={(e) => setRegisterData({...registerData, email: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Temporary Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input required type="password" className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="••••••••" value={registerData.password} onChange={(e) => setRegisterData({...registerData, password: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Assigned Role</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none" value={registerData.role} onChange={(e) => setRegisterData({...registerData, role: e.target.value})}>
                                            <option value="ROLE_CLIENT">Client</option>
                                            <option value="ROLE_STAFF">Staff</option>
                                            <option value="ROLE_MOUL7ANOUT">Moul7anout</option>
                                            <option value="ROLE_ADMIN">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowRegisterModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Full Name</label><input required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" value={selectedUser.name} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })} /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Email Address</label><input required type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} /></div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Shield size={20} /></div>
                            <div><h3 className="text-xl font-bold text-gray-900">Reset Password</h3><p className="text-xs text-gray-500">for {selectedUser.name}</p></div>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                                <div className="relative">
                                    <input required type={showPassword ? "text" : "password"} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 pr-10" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Key size={16} />}
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200"><AlertCircle size={24} className="text-red-600" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
                            <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete <span className="font-bold text-gray-900">{selectedUser.name}</span>? This action is permanent.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                                <button onClick={() => handleDelete(selectedUser.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"><Trash2 size={16} />Delete User</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription Plan Modal */}
            {showPlanModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] animate-in fade-in zoom-in-95 duration-300 overflow-hidden border border-slate-100">
                        {/* Modal Header */}
                        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between relative border-b border-indigo-950/20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="bg-gradient-to-tr from-indigo-500/20 to-indigo-500/5 p-3.5 rounded-2xl border border-indigo-400/20 text-indigo-300 shadow-inner flex items-center justify-center">
                                    <Sparkles size={22} className="animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-white tracking-wide">Configure Merchant Subscription</h3>
                                    <p className="text-xs text-indigo-200 mt-0.5 font-medium">Select the platform access tier for <span className="font-semibold text-white">{selectedUser.name}</span></p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setShowPlanModal(false)} className="text-indigo-200 hover:text-white transition-colors relative z-10 bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/5 hover:border-white/10"><X size={16} /></button>
                        </div>
                        
                        {/* Modal Body */}
                        <form onSubmit={handlePlanChangeSubmit} className="p-6 space-y-6 bg-slate-50/30">
                            {/* Target merchant summary banner */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-200/50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Merchant Account</p>
                                    <p className="font-extrabold text-slate-800 text-lg leading-tight">{selectedUser.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">{selectedUser.email}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black border tracking-wider uppercase shadow-sm ${getPlanBadgeClass(selectedUser.subscriptionPlan || 'START')}`}>
                                        {(selectedUser.subscriptionPlan || 'START') === 'ULTIMATE' ? <Sparkles size={11} className="animate-pulse" /> : 
                                         (selectedUser.subscriptionPlan || 'START') === 'PRO' ? <Crown size={11} /> : <Store size={11} />}
                                        {selectedUser.subscriptionPlan || 'START'}
                                    </span>
                                </div>
                            </div>

                            {/* Plan Cards Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                {/* START CARD */}
                                <div 
                                    onClick={() => setSelectedPlan('START')}
                                    className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[275px] hover:-translate-y-1 ${
                                        selectedPlan === 'START' 
                                            ? 'border-slate-600 bg-white shadow-xl shadow-slate-600/5 ring-4 ring-slate-600/5' 
                                            : 'border-slate-200/60 bg-white hover:border-slate-300 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    <div className="space-y-4">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${
                                            selectedPlan === 'START' 
                                                ? 'bg-slate-600 text-white border-transparent shadow-md shadow-slate-600/20' 
                                                : 'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                            <Store size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-base">Start</h4>
                                            <p className="text-[11px] text-slate-400 leading-normal font-medium mt-1">Essential tools for single shopkeepers.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5 pt-4 border-t border-slate-100/80">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Sales Tracker</div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Credit Ledger</div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400/80"><Lock size={13} className="text-slate-300/80 shrink-0" /> Marketplace</div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400/80"><Lock size={13} className="text-slate-300/80 shrink-0" /> AI Automation</div>
                                    </div>
                                </div>

                                {/* PRO CARD */}
                                <div 
                                    onClick={() => setSelectedPlan('PRO')}
                                    className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[275px] hover:-translate-y-1 ${
                                        selectedPlan === 'PRO' 
                                            ? 'border-violet-600 bg-white shadow-xl shadow-violet-600/5 ring-4 ring-violet-600/5' 
                                            : 'border-slate-200/60 bg-white hover:border-violet-300 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    <div className="space-y-4">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${
                                            selectedPlan === 'PRO' 
                                                ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white border-transparent shadow-md shadow-violet-600/20' 
                                                : 'bg-violet-50 text-violet-600 border-violet-100'
                                        }`}>
                                            <Crown size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-base">Pro</h4>
                                            <p className="text-[11px] text-slate-400 leading-normal font-medium mt-1">Supercharge your digital ordering reach.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5 pt-4 border-t border-slate-100/80">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Sales Tracker</div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Credit Ledger</div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Marketplace</div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400/80"><Lock size={13} className="text-slate-300/80 shrink-0" /> AI Automation</div>
                                    </div>
                                </div>

                                {/* ULTIMATE CARD */}
                                <div 
                                    onClick={() => setSelectedPlan('ULTIMATE')}
                                    className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[275px] overflow-hidden hover:-translate-y-1 ${
                                        selectedPlan === 'ULTIMATE' 
                                            ? 'border-amber-500 bg-white shadow-xl shadow-amber-500/10 ring-4 ring-amber-500/5' 
                                            : 'border-slate-200/60 bg-white hover:border-amber-300 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-3.5 py-1 rounded-bl-2xl shadow-sm uppercase tracking-widest border-b border-l border-amber-400/20">
                                        PREMIUM
                                    </div>
                                    <div className="space-y-4">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${
                                            selectedPlan === 'ULTIMATE' 
                                                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-transparent shadow-md shadow-amber-500/20' 
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            <Sparkles size={20} className={selectedPlan === 'ULTIMATE' ? 'animate-pulse' : ''} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-base">Ultimate</h4>
                                            <p className="text-[11px] text-slate-400 leading-normal font-medium mt-1">Full AI reminders & seamless scanner detour.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5 pt-4 border-t border-slate-100/80">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Sales Tracker</div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Credit Ledger</div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Marketplace</div>
                                        <div className="flex items-center gap-2 text-xs font-extrabold text-amber-600"><Zap size={13} className="text-amber-500 shrink-0 animate-pulse" /> AI Reminders</div>
                                    </div>
                                </div>
                            </div>

                            {/* Descriptive alert card with clean left border */}
                            <div className="bg-indigo-50/40 border border-indigo-100/60 border-l-4 border-l-indigo-600 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
                                <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-sm shadow-indigo-600/10 flex items-center justify-center shrink-0">
                                    <Sparkles size={16} className="animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <h5 className="font-extrabold text-slate-900 text-sm tracking-wide">Subscription Summary</h5>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        {selectedPlan === 'START' && "The Start plan is designed for basic bookkeeping. It allows normal sales operations and simple credit ledger storage, but restricts access to the digital ordering catalog and advanced automated tools."}
                                        {selectedPlan === 'PRO' && "The Pro plan enables the digital marketplace (Ma Pania). Clients can prepare their grocery lists and scan orders at the cash register to streamline their checkouts."}
                                        {selectedPlan === 'ULTIMATE' && "The Ultimate plan gives the merchant ultimate powers: all clients unlock the marketplace automatically, and they can send voice call and text debt reminders to customers written in respectful Moroccan Darija using advanced AI agents."}
                                    </p>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 px-4 py-3.5 border border-slate-200 hover:border-slate-300 rounded-2xl text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                    Save Subscription Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default UsersManagement;