import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Package, 
  MessageSquare, 
  Wallet, 
  Activity, 
  Clock, 
  Search, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from "lucide-react";

function BuyerDashboard() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [items, setItems] = useState([]);
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    const savedBalance = localStorage.getItem("walletBalance");
    if (savedBalance) setWalletBalance(Number(savedBalance));

    const fetchDashboardData = async () => {
        try {
            const [itemsRes, rentalsRes] = await Promise.all([
                fetch("http://localhost:5000/api/items"),
                fetch("http://localhost:5000/api/rentals")
            ]);
            if (itemsRes.ok) setItems(await itemsRes.json());
            if (rentalsRes.ok) setRentals(await rentalsRes.json());
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        }
    };
    fetchDashboardData();
  }, []);

  const emergencyItems = items.filter((item) => item.isEmergency);
  const activeRentals = rentals.filter((rental) => rental.rentalStatus === "Active");
  const pendingRentals = rentals.filter((rental) => rental.rentalStatus === "Pending");

  const statVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-grow bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-emerald-600/20"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-6">
                 <ShieldCheck size={16} className="text-emerald-300" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100">Portal Version 4.0 // Verified</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-display font-black leading-tight mb-4 tracking-tighter">
                 Everything You Need, <br/>On a Single Dashboard.
               </h1>
               <p className="text-emerald-50/80 text-lg font-medium max-w-xl mb-12 leading-relaxed">
                 Seamlessly facilitate university logistics through our high-performance peer-to-peer ecosystem.
               </p>
               <div className="flex flex-wrap gap-4">
                  <Link to="/buyer/items" className="bg-white text-emerald-700 font-black px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                    <Search size={18} />
                    Explore Catalog
                  </Link>
                  <Link to="/buyer/wallet" className="bg-emerald-700/50 backdrop-blur-md text-white font-black px-10 py-4 rounded-2xl border border-white/10 hover:bg-emerald-700/70 transition-all flex items-center gap-3">
                    <Wallet size={18} />
                    Wallet Management
                  </Link>
               </div>
            </div>
          </motion.div>

          {/* Quick Wallet Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-[400px] bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group"
          >
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
             <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                   <div className="flex items-center justify-between mb-8 opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Vault</p>
                      <TrendingUp size={16} />
                   </div>
                   <p className="text-gray-400 font-bold text-sm mb-2">Total Credit Liquidity</p>
                   <h2 className="text-5xl font-display font-black tracking-tighter mb-2">
                     <span className="text-2xl text-emerald-500 mr-2">Rs.</span>{walletBalance.toFixed(2)}
                   </h2>
                </div>

                <div className="mt-8 space-y-4">
                   <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Activity size={16} className="text-emerald-400" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Active Leases</span>
                      </div>
                      <span className="font-black text-xl leading-none">{activeRentals.length}</span>
                   </div>
                   <Link to="/buyer/wallet" className="group/btn relative w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs rounded-[1.5rem] transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3 uppercase tracking-widest overflow-hidden">
                     <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                     <Plus size={16} />
                     Deposit Credits
                   </Link>
                </div>
             </div>
          </motion.div>
      </div>

      {/* Statistics Section */}
      <motion.div 
        initial="hidden" animate="show"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12"
      >
        {[
          { label: "Total Sessions", value: rentals.length, color: "text-gray-900", icon: Activity },
          { label: "Asset Transfers", value: activeRentals.length, color: "text-emerald-600", icon: Package },
          { label: "System Alerts", value: pendingRentals.length, color: "text-orange-500", icon: Clock },
          { label: "Prioritized Items", value: emergencyItems.length, color: "text-red-600", icon: AlertTriangle }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={idx} variants={statVariants} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all group cursor-default">
              <div className="flex items-center justify-between mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                    <Icon size={22} className="text-gray-400 group-hover:text-emerald-600" />
                 </div>
                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Analytics.v1</span>
              </div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 leading-none">{stat.label}</p>
              <h3 className={`text-4xl font-display font-black leading-none ${stat.color}`}>{stat.value}</h3>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Grid Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
         <div className="xl:col-span-2 space-y-8">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm transition-all hover:shadow-lg">
                <div className="flex items-center justify-between mb-10">
                   <div>
                    <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight">Deployment Hub</h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Direct access to module operations.</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Link to="/buyer/items" className="flex items-center gap-6 p-8 bg-emerald-50/30 rounded-[1.8rem] border border-emerald-100/50 hover:bg-emerald-500 hover:border-emerald-500 transition-all group">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Search size={24} className="text-emerald-600" />
                      </div>
                      <div>
                         <p className="font-black text-emerald-900 group-hover:text-white transition-colors text-lg tracking-tight">Initiate Discovery</p>
                         <p className="text-[10px] text-emerald-700/60 group-hover:text-emerald-100 font-black uppercase tracking-widest mt-1">Global Marketplace</p>
                      </div>
                      <ChevronRight size={18} className="ml-auto text-emerald-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
                   </Link>
                   <Link to="/buyer/my-rentals" className="flex items-center gap-6 p-8 bg-slate-50 rounded-[1.8rem] border border-slate-200/50 hover:bg-gray-900 hover:border-gray-900 transition-all group">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Package size={24} className="text-gray-900" />
                      </div>
                      <div>
                         <p className="font-black text-gray-900 group-hover:text-white transition-colors text-lg tracking-tight">Rental Tracking</p>
                         <p className="text-[10px] text-gray-500 group-hover:text-gray-400 font-black uppercase tracking-widest mt-1">Lifecycle Records</p>
                      </div>
                      <ChevronRight size={18} className="ml-auto text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                   </Link>
                </div>
            </div>

            {emergencyItems.length > 0 && (
              <div className="bg-gradient-to-r from-red-600 via-red-600 to-rose-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-red-600/20 group">
                 <div className="flex items-center justify-between mb-10 overflow-hidden">
                    <div className="relative z-10">
                       <h2 className="text-2xl font-display font-black tracking-tight flex items-center gap-3">
                         <AlertTriangle size={24} className="text-red-200" />
                         Emergency Protocol Engaged
                       </h2>
                       <p className="text-red-100/70 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Prioritized Asset Fulfillment Required</p>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20 animate-pulse">
                      <Activity size={20} />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                    {emergencyItems.slice(0, 2).map(item => (
                       <div key={item._id} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 flex items-center justify-between group/card hover:bg-white/20 transition-all">
                          <div>
                             <p className="font-black text-xl mb-1 tracking-tight">{item.title}</p>
                             <div className="flex items-center gap-2 mt-2">
                               <Package size={12} className="text-red-200" />
                               <p className="text-[9px] font-black uppercase tracking-widest text-red-100">{item.category}</p>
                             </div>
                          </div>
                          <Link to={`/buyer/items/${item._id}`} className="w-12 h-12 bg-white text-red-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
                             <ChevronRight size={24} strokeWidth={3} />
                          </Link>
                       </div>
                    ))}
                 </div>
              </div>
            )}
         </div>

         <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden transition-all hover:shadow-lg">
            <div className="relative z-10 h-full flex flex-col">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight leading-none">Security Ledger</h2>
                  <div className="px-3 py-1.5 rounded-lg bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">Live Stream</div>
               </div>

               <div className="space-y-8 flex-grow">
                  {items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="relative pl-8 border-l-2 border-gray-100 last:border-0 pb-10">
                       <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white rounded-full border-2 border-gray-200 group-hover:border-emerald-500 transition-colors"></div>
                       <div className="-mt-1">
                          <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Entry: Network Authorization</p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-gray-400">
                             <Clock size={12} />
                             <span>{new Date().toLocaleTimeString()}</span>
                          </div>
                          <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                             <p className="text-[11px] font-bold text-gray-600 leading-relaxed italic">Reference asset: "{item.title}" successfully indexed for peer discovery.</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               <button className="w-full py-4 mt-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-[10px] text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all uppercase tracking-[0.2em]">
                 Load System History
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

export default BuyerDashboard;