import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, LogOut, Package, Wallet, UserCircle, Briefcase, ShoppingBag, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();

    const getRoleAttributes = () => {
        switch (user?.role) {
            case 'ROLE_ADMIN':
                return { title: 'Admin Terminal', icon: <Briefcase />, color: 'bg-indigo-600', text: 'Manage system-wide operations.' };
            case 'ROLE_STAFF':
                return { title: 'Staff Workspace', icon: <Package />, color: 'bg-blue-500', text: 'Manage inventory and tracking.' };
            case 'ROLE_MOUL7ANOUT':
                return { title: 'Merchant Center', icon: <ShoppingBag />, color: 'bg-emerald-600', text: 'Manage your clients and shop.' };
            default:
                return { title: 'Client View', icon: <Wallet />, color: 'bg-sky-600', text: 'Track your grocery tabs.' };
        }
    };

    const roleData = getRoleAttributes();

    const cardItems = [
        { title: 'Profile', desc: 'Manage your settings.', icon: <UserCircle /> },
        { title: 'History', desc: 'View past activities.', icon: <LayoutDashboard /> },
        { title: 'Users', desc: 'View connected peers.', icon: <Users />, hide: user?.role === 'ROLE_CLIENT' },
    ].filter(i => !i.hide);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar / Top Nav */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-3">
                    <div className={`${roleData.color} p-2 rounded-lg text-white shadow-lg`}>
                        {roleData.icon}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">{roleData.title}</h1>
                        <p className="text-xs text-slate-400 font-medium tracking-tight uppercase">{user?.role}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right mr-2 border-r pr-4 border-slate-100">
                        <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">ONLINE</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 shadow-sm"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Hero / Welcome */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-700"></div>
                    <div className="relative z-10 max-w-2xl">
                        <span className="text-blue-400 text-sm font-bold tracking-widest uppercase mb-4 block">Dashboard Overview</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight italic">
                            Hello, {user?.name.split(' ')[0]}! 🚀
                        </h2>
                        <p className="text-slate-300 text-lg sm:text-xl font-medium leading-relaxed opacity-90">
                            {roleData.text} We've summarized your most important metrics below.
                        </p>
                    </div>
                </section>

                {/* Role Specific Actions */}
                {user?.role === 'ROLE_ADMIN' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldCheck className="text-indigo-600" size={20} />
                                    Administrator Shortcuts
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Management tools for system users.</p>
                            </div>
                            <Link to="/register" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 text-sm">
                                <UserPlus size={18} />
                                Create User
                            </Link>
                        </div>
                    </div>
                )}

                {/* Grid Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    {cardItems.map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl cursor-not-allowed group">
                            <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all mb-4">
                                {item.icon}
                            </div>
                            <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

const ShieldCheck = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
    </svg>
);

export default Dashboard;
