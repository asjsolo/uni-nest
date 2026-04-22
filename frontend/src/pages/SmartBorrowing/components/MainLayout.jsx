import { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Settings, 
  User, 
  CircleDot, 
  Search,
  Menu,
  X,
  Wallet
} from "lucide-react";
import Sidebar from "./Sidebar";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [balance, setBalance] = useState(Number(localStorage.getItem("walletBalance") || 0));
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      setBalance(Number(localStorage.getItem("walletBalance") || 0));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const pageTitles = {
    "/buyer/dashboard": "Dashboard Overview",
    "/buyer/items": "University Inventory",
    "/buyer/my-rentals": "My Active Rentals",
    "/buyer/my-inquiries": "Communications",
    "/buyer/wallet": "Digital Wallet & History",
    "/buyer/request-rental": "Rental Request",
    "/buyer/payment": "Secure Checkout",
    "/buyer/return": "Item Return",
    "/buyer/inquiry": "New Inquiry"
  };

  const getTitle = () => {
    const path = location.pathname;
    const base = Object.keys(pageTitles).find(key => path.startsWith(key));
    return pageTitles[base] || "Portal";
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <motion.div
        initial={false}
        animate={{ 
          marginLeft: sidebarOpen ? 280 : 80,
          width: `calc(100% - ${sidebarOpen ? 280 : 80}px)`,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="flex-grow flex flex-col h-screen overflow-y-auto main-content-area"
      >
        {/* Global Toolbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-4">
             <div>
               <h2 className="text-xl font-display font-black text-gray-900 tracking-tight leading-none">{getTitle()}</h2>
               <div className="flex items-center gap-2 mt-1.5">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute inset-0"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 relative"></div>
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-400">Mainnet: Connected</span>
               </div>
             </div>
           </div>

           <div className="flex items-center gap-2">
              {/* Wallet Quick Access */}
              <Link 
                to="/buyer/wallet" 
                className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 mr-2 hover:bg-emerald-100 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Wallet size={14} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1 opacity-60">My Balance</p>
                  <p className="font-display font-black text-sm tracking-tight leading-none">
                    Rs. {balance.toFixed(2)}
                  </p>
                </div>
              </Link>

              <button className="w-10 h-10 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors">
                <Search size={18} />
              </button>
              <button className="w-10 h-10 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors relative">
                <Bell size={18} />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
              </button>
              <div className="h-6 w-px bg-gray-100 mx-2"></div>
              <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-gray-900 leading-none">Student ID</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Verified User</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/10">
                   <User size={20} strokeWidth={2.5} />
                </div>
              </div>
           </div>
        </header>

        {/* Main Content Stage */}
        <div className="p-8 pb-20 w-full max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </motion.div>
      
      {/* Mobile Toggle */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
          <button 
            onClick={toggleSidebar}
            className="w-14 h-14 bg-emerald-600 rounded-full text-white shadow-2xl flex items-center justify-center text-xl transition-transform active:scale-95"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
      </div>
    </div>
  );
}

export default MainLayout;
