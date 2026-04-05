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
    CheckCircle
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
            alert("Failed to delete user");
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr><td colSpan="4" className="px-6 py-12 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32} /></td></tr>
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
        </DashboardLayout>
    );
};

export default UsersManagement;