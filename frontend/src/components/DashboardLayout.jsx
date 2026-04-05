import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Search, Bell, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-72`}>
        {/* Top Navigation Bar */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 backdrop-blur-md bg-white/90">
          <button className="lg:hidden text-slate-500 hover:bg-slate-50 p-2 rounded-xl transition-all" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>

          {/* Search (Modern Styled) */}
          <div className="hidden sm:flex relative items-center max-w-md w-full mx-6 group">
            <Search className="absolute left-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all text-sm font-medium"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4 lg:gap-6">
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl relative transition-all group">
              <Bell size={20} className="group-hover:text-amber-500 transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
            </button>
            <div className="w-px h-8 bg-slate-100 mx-1 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{user?.role.replace('ROLE_', '')}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 p-[2px] shadow-lg shadow-indigo-100">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-indigo-600">
                  <UserCircle size={24} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
