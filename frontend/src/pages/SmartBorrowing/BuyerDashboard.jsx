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
                  <h1 className="text-4xl md:text-5xl font-display font-black leading-tight mb-4 tracking-tighter">
                     Everything You Need, <br />In A Single Place.
                  </h1>
                  <p className="text-emerald-50/80 text-lg font-medium max-w-xl mb-12 leading-relaxed">
                     Easily rent items from other students or share your own things with the university community.
                  </p>
                  <div className="flex flex-wrap gap-4">
                     <Link to="/buyer/items" className="bg-white text-emerald-700 font-black px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                        <Search size={18} />
                        Browse Items
                     </Link>
                     <Link to="/buyer/wallet" className="bg-emerald-700/50 backdrop-blur-md text-white font-black px-10 py-4 rounded-2xl border border-white/10 hover:bg-emerald-700/70 transition-all flex items-center gap-3">
                        <Wallet size={18} />
                        Manage Wallet
                     </Link>
                     <Link to="/buyer/my-rentals" className="bg-emerald-700/50 backdrop-blur-md text-white font-black px-10 py-4 rounded-2xl border border-white/10 hover:bg-emerald-700/70 transition-all flex items-center gap-3">
                        <Wallet size={18} />
                        My Rentals
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
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Uni-Nest Wallet</p>
                        <TrendingUp size={16} />
                     </div>
                     <p className="text-gray-400 font-bold text-sm mb-2">Available Balance</p>
                     <h2 className="text-5xl font-display text-white tracking-tighter mb-2">
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
                        Add Funds
                     </Link>
                  </div>
               </div>
            </motion.div>
         </div>

         {/* Statistics Section */}
         <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12"
         >
            {[
               {
                  label: "Available Items",
                  value: items.length,
                  color: "text-gray-900",
                  icon: Package
               },
               {
                  label: "Active Rentals",
                  value: activeRentals.length,
                  color: "text-emerald-600",
                  icon: Activity
               },
               {
                  label: "Pending Requests",
                  value: pendingRentals.length,
                  color: "text-orange-500",
                  icon: Clock
               },
               {
                  label: "Emergency Items",
                  value: emergencyItems.length,
                  color: "text-red-600",
                  icon: AlertTriangle
               }
            ].map((stat, idx) => {
               const Icon = stat.icon;

               return (
                  <motion.div
                     key={idx}
                     variants={statVariants}
                     className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all group cursor-default"
                  >
                     <div className="flex items-center justify-between mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                           <Icon size={22} className="text-gray-400 group-hover:text-emerald-600" />
                        </div>

                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                           Live Data
                        </span>
                     </div>

                     <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 leading-none">
                        {stat.label}
                     </p>

                     <h3 className={`text-4xl font-display font-black leading-none ${stat.color}`}>
                        {stat.value}
                     </h3>
                  </motion.div>
               );
            })}
         </motion.div>
      </div>
   );
}

export default BuyerDashboard;