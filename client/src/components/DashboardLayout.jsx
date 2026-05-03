import { useState, useContext, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  LogOut, 
  Menu, 
  X, 
  QrCode,
  Bell,
} from 'lucide-react';
import { cn } from '../lib/utils';

export const DashboardLayout = ({ children, navItems }) => {
  const { user, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Map role to display name
  const getRoleDisplay = (role) => {
    const roleMap = {
      'adviser': 'Adviser',
      'officer': 'Officer',
      'student': 'Student'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isMobile && !isSidebarOpen ? -280 : 0,
          width: isMobile ? 280 : (isSidebarOpen ? 280 : 88)
        }}
        className={cn(
          "fixed inset-y-0 left-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl overflow-hidden flex flex-col border-r border-white/5",
          isMobile ? "z-50" : "z-50"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-white/10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/40">
            <QrCode className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          {(isSidebarOpen || isMobile) && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-2xl tracking-tight text-white"
            >
              AFM
            </motion.span>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems && navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/30 border-l-4 border-white/30" 
                  : "text-white/50 hover:bg-white/5 hover:text-white/90 border-l-4 border-transparent"
              )}
            >
              {item.icon && <item.icon className={cn("w-6 h-6 shrink-0", (!isSidebarOpen && !isMobile) ? "mx-auto" : "")} strokeWidth={2} />}
              {(isSidebarOpen || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-medium text-base tracking-wide text-inherit"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-4 w-full px-5 py-4 rounded-xl text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 border-l-4 border-transparent hover:border-red-400/30",
              (!isSidebarOpen && !isMobile) && "justify-center"
            )}
          >
            <LogOut className="w-6 h-6" strokeWidth={2} />
            {(isSidebarOpen || isMobile) && <span className="font-medium text-base">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 bg-gray-50",
          isMobile ? "ml-0" : (isSidebarOpen ? "ml-[280px]" : "ml-[88px]")
        )}
      >
        {/* Top Navbar */}
        <header className="h-16 lg:h-20 bg-white sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 lg:p-3 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 active:scale-95"
          >
            {isSidebarOpen && !isMobile ? <X className="w-5 h-5 lg:w-6 lg:h-6" /> : <Menu className="w-5 h-5 lg:w-6 lg:h-6" />}
          </button>

          <div className="flex items-center gap-3 lg:gap-6">
            <button className="relative p-2 lg:p-3 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="absolute top-2 right-2 lg:top-3 lg:right-3 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 lg:gap-4 pl-3 lg:pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <div className="font-bold text-gray-900 leading-none mb-1 text-sm lg:text-base">{user?.name}</div>
                <div className="text-[10px] font-black text-primary uppercase tracking-widest">{getRoleDisplay(user?.role)}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
