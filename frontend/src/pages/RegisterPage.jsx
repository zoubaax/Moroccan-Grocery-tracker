import React, { useState } from 'react';
import api from '../api/axios';
import { UserPlus, User, Mail, Lock, ShieldCheck, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ROLE_CLIENT'
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Mapping roles to expected generic names if needed or keeping backend values
            const payload = {
                ...formData,
                role: formData.role.replace('ROLE_', '').toLowerCase()
            };
            
            await api.post('/auth/register', payload);
            setStatus({ type: 'success', message: 'User registered successfully!' });
            setFormData({ name: '', email: '', password: '', role: 'ROLE_CLIENT' });
        } catch (error) {
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Registration failed' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-100">
                    <UserPlus size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Add New User</h2>
                    <p className="text-sm text-slate-500">Create accounts for Staff or Moul7anout</p>
                </div>
            </div>

            {status.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 mb-8 border animate-in fade-in slide-in-from-top-2 duration-300 ${
                    status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium text-sm">{status.message}</span>
                </div>
            )}

            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            name="name"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Temporary Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Assigned Role</label>
                    <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            name="role"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="ROLE_CLIENT">Client</option>
                            <option value="ROLE_STAFF">Staff</option>
                            <option value="ROLE_MOUL7ANOUT">Moul7anout</option>
                            <option value="ROLE_ADMIN">Admin</option>
                        </select>
                    </div>
                </div>

                <div className="md:col-span-2 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Register New User'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;
