import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag, 
  LogOut, 
  UserPlus, 
  CreditCard, 
  Settings,
  ChevronRight,
  Store,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_MOUL7ANOUT', 'ROLE_CLIENT'] },
    { name: 'Inventory', path: '/inventory', icon: <Package size={20} />, roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
    { name: 'Users', path: '/users', icon: <Users size={20} />, roles: ['ROLE_ADMIN'] },
    { name: 'Customers', path: '/customers', icon: <Users size={20} />, roles: ['ROLE_MOUL7ANOUT'] },
    { name: 'Sales', path: '/sales', icon: <ShoppingBag size={20} />, roles: ['ROLE_ADMIN', 'ROLE_MOUL7ANOUT'] },
    { name: 'Credits', path: '/credits', icon: <CreditCard size={20} />, roles: ['ROLE_ADMIN', 'ROLE_MOUL7ANOUT', 'ROLE_CLIENT'] },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} />, roles: ['ROLE_ADMIN', 'ROLE_MOUL7ANOUT', 'ROLE_STAFF'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen bg-white border-r border-gray-100 z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-72 shadow-xl
      `}>
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Store size={26} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">7anoti</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SaaS Edition</p>
            </div>
            <button className="lg:hidden text-gray-400 hover:text-gray-600" onClick={toggleSidebar}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {filteredItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive(item.path) 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }
                `}
              >
                <span className={`${isActive(item.path) ? 'text-indigo-600' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.name}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
                {!isActive(item.path) && (
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-40 transition-all" />
                )}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="pt-6 mt-auto border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase">{user?.role?.replace('ROLE_', '')}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group font-medium"
            >
              <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;