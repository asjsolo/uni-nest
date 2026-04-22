import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Search, 
  Package, 
  MessageSquare, 
  Wallet, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldHalf
} from "lucide-react";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/buyer/dashboard", icon: LayoutDashboard },
    { name: "Browse Items", path: "/buyer/items", icon: Search },
    { name: "My Rentals", path: "/buyer/my-rentals", icon: Package },
    { name: "My Inquiries", path: "/buyer/my-inquiries", icon: MessageSquare },
    { name: "Wallet", path: "/buyer/wallet", icon: Wallet }
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isOpen ? 280 : 80,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }}
      className="fixed left-0 top-0 h-screen bg-gray-900 text-white z-50 flex flex-col shadow-2xl"
    >
      {/* Brand Section */}
      <div className="h-20 flex items-center px-6 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldHalf className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-4 font-display font-black text-xl tracking-tight whitespace-nowrap"
            >
              UNI NEST
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Links */}
      <nav className="flex-grow px-4 space-y-2">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`relative flex items-center h-12 rounded-xl transition-all duration-300 group ${
                isActive 
                ? "bg-emerald-500/10 text-emerald-400" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-2 font-bold text-sm whitespace-nowrap"
                  >
                    {link.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                />
              )}
              
              {!isOpen && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800 text-white text-[10px] uppercase font-black tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 shadow-xl whitespace-nowrap z-[60]">
                  {link.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link 
          to="/" 
          className="flex items-center h-12 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all px-0"
        >
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <LogOut size={20} strokeWidth={2} />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-2 font-bold text-sm whitespace-nowrap"
              >
                Logout Account
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <button
          onClick={toggleSidebar}
          className="w-full h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
