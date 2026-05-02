import { Navigate, Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, MapPin, Hotel, Utensils, Calendar, Users, LogOut, ExternalLink, Menu, X } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLayout() {
  const { user, role, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-brand-green">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const isOwner = role === 'owner' || user?.email?.toLowerCase() === 'vilaskr762@gmail.com';

  if (!role) {
    // ... (rest of the initialization logic remains same, just ensure it wraps properly)
    if (user?.email?.toLowerCase() === 'vilaskr762@gmail.com') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center">
          <div className="w-20 h-20 bg-brand-yellow rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-brand-yellow/20">
            <svg className="w-10 h-10 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-ink mb-2">Welcome, First Owner</h1>
          <p className="text-gray-500 mb-8 max-w-md text-sm">Your account is recognized as the primary admin email. Initialize your profile to continue.</p>
          <button 
            onClick={async () => {
              try {
                const { doc, setDoc, getDocFromServer } = await import('firebase/firestore');
                const { db } = await import('../lib/firebase');
                await setDoc(doc(db, 'admin_users', user.uid), {
                  email: user.email,
                  role: 'owner',
                  createdAt: Date.now()
                });
                window.location.reload();
              } catch (err: any) {
                console.error('Firestore Setup Error: ', err);
                alert(`Failed to initialize: ${err.message}`);
              }
            }}
            className="bg-brand-green text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-brand-green/20 hover:scale-105 transition-all text-sm uppercase tracking-widest"
          >
            Initialize Profile
          </button>
        </div>
      );
    }
     return <div className="flex items-center justify-center min-h-screen text-red-500 font-bold p-12 text-center bg-gray-50">Access Denied.</div>
  }

  const menuItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/places', icon: MapPin, label: 'Places' },
    { to: '/admin/stays', icon: Hotel, label: 'Stays' },
    { to: '/admin/food_spots', icon: Utensils, label: 'Food Spots' },
    { to: '/admin/itineraries', icon: Calendar, label: 'Itineraries' },
    ...(isOwner ? [{ to: '/admin/admin_users', icon: Users, label: 'Admins' }] : []),
  ];

  const SidebarContent = () => (
    <>
      <div className="p-8 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tighter text-brand-yellow">
          SAKLESHPUR<span className="text-white/60 block text-xs tracking-widest uppercase font-bold text-center-ish">Admin Panel</span>
        </h1>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive 
                  ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-4">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-brand-yellow transition-all font-medium text-sm">
          <ExternalLink className="w-4 h-4" />
          View Live Site
        </Link>
        <button 
          onClick={() => signOut(auth)}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-[#111827] text-white flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-[#111827]/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-[#111827] text-white z-50 flex flex-col shadow-2xl"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-brand-ink">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-black text-brand-ink tracking-tighter text-sm uppercase">Sakleshpur Diaries</h1>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        <div className="p-4 md:p-8 lg:p-12 max-w-6xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="min-w-0">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Authenticated Identity</p>
              <h2 className="text-brand-ink font-black text-lg flex flex-wrap items-center gap-2 md:gap-3 leading-tight truncate">
                {user.email} 
                <span className="bg-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-brand-green/20">
                  {role || 'PENDING'}
                </span>
              </h2>
            </div>
            <div className="hidden sm:block text-right">
               <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Registry ID</p>
               <p className="font-mono text-[11px] text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{user.uid}</p>
            </div>
          </header>
          
          <Outlet />
        </div>
      </main>
    </div>
  );
}
