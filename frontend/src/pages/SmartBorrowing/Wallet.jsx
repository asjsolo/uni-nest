import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Plus,
   History,
   ArrowUpRight,
   ArrowDownLeft,
   TrendingUp,
   Wallet as WalletIcon,
   ShieldCheck,
   Database,
   Clock
} from "lucide-react";

function Wallet() {
   const [balance, setBalance] = useState(0);
   const [amount, setAmount] = useState("");
   const [transactions, setTransactions] = useState([]);
   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchWallet = async () => {
         try {
            const res = await fetch("http://localhost:5000/api/wallet");
            const data = await res.json();

            if (!res.ok) {
               throw new Error(data.message || "Failed to load wallet");
            }

            setBalance(data.balance || 0);
            setTransactions(data.transactions || []);
         } catch (err) {
            setError(err.message || "Unable to load wallet");
         } finally {
            setLoading(false);
         }
      };

      fetchWallet();
   }, []);

   const handleAddFunds = async (e) => {
      e.preventDefault();

      setError("");
      setSuccess("");

      const numericAmount = Number(amount);

      if (!amount.trim()) {
         setError("Amount entry required");
         return;
      }

      if (isNaN(numericAmount) || numericAmount <= 0) {
         setError("Entry must be a positive numeric value");
         return;
      }

      try {
         const res = await fetch("http://localhost:5000/api/wallet/add-funds", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({ amount: numericAmount })
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.message || "Failed to add funds");
         }

         setBalance(data.balance || 0);
         setTransactions(data.transactions || []);
         setAmount("");
         setSuccess("Funds added successfully");
      } catch (err) {
         setError(err.message || "Unable to add funds");
      }
   };

   const handleQuickAdd = (value) => {
      setAmount(String(value));
      setError("");
      setSuccess("");
   };

   const isTopUp = (tx) => {
      return tx.type === "Added Funds" || tx.type === "Wallet Top Up";
   };

   const formatTransactionDate = (tx) => {
      const dateValue = tx.createdAt || tx.date;
      if (!dateValue) return "No date available";
      return new Date(dateValue).toLocaleString();
   };

   const totalTopUps = transactions.reduce((sum, tx) => {
      return isTopUp(tx) ? sum + Number(tx.amount) : sum;
   }, 0);

   if (loading) {
      return (
         <div className="bg-white pt-10 flex items-center justify-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-100 border-t-emerald-600"></div>
         </div>
      );
   }

   return (
      <div className="bg-white pt-10">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
            <motion.div
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="lg:col-span-2 bg-gray-900 rounded-[3rem] p-12 md:p-16 text-white relative overflow-hidden group shadow-2xl shadow-gray-900/40"
            >
               <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />

               <div className="relative z-10 flex flex-col h-full justify-between min-h-[320px]">
                  <div>
                     <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-3 opacity-60">
                           <ShieldCheck size={18} />
                           <span className="font-black text-[10px] uppercase tracking-[0.3em]">
                              Uni-Nest Wallet Account
                           </span>
                        </div>

                        <WalletIcon size={24} className="text-emerald-500" strokeWidth={2.5} />
                     </div>

                     <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                        Available Balance
                     </p>

                     <h2 className="text-6xl md:text-8xl font-display text-white tracking-tighter decoration-emerald-600 decoration-8 underline-offset-[16px]">
                        <span className="text-2xl text-emerald-400 mr-2">Rs.</span>
                        {balance.toFixed(2)}
                     </h2>
                  </div>

                  <div className="mt-12 flex flex-wrap gap-12 border-t border-white/5 pt-10">
                     <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 leading-none">
                           Security Status
                        </p>

                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <p className="font-black text-lg tracking-tight">Authenticated</p>
                        </div>
                     </div>

                     <div className="h-10 w-px bg-white/5 hidden sm:block"></div>

                     <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 leading-none">
                           Status
                        </p>
                        <p className="font-black text-lg tracking-tight text-emerald-100/90">
                           Verified Account
                        </p>
                     </div>
                  </div>
               </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white border border-gray-100 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden transition-all hover:shadow-xl"
            >
               <div className="absolute top-0 left-0 w-full h-2 bg-gray-900"></div>

               <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-900 mb-8 shadow-inner">
                  <TrendingUp size={36} strokeWidth={2.5} />
               </div>

               <h3 className="text-xl font-display font-black text-gray-900 mb-8 uppercase tracking-[0.2em] leading-none">
                  Wallet Stats
               </h3>

               <div className="w-full space-y-4">
                  <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-[1.8rem] group transition-all hover:bg-emerald-50 hover:border-emerald-200 text-left">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">
                        Total Added
                     </p>
                     <p className="text-2xl font-display font-black text-emerald-700 transition-transform group-hover:translate-x-1 tracking-tight">
                        Rs. {totalTopUps.toFixed(2)}
                     </p>
                  </div>

                  <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-[1.8rem] group transition-all hover:bg-emerald-50 hover:border-emerald-200 text-left">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">
                        Transactions
                     </p>
                     <p className="text-2xl font-display font-black text-gray-900 transition-transform group-hover:translate-x-1 tracking-tight">
                        {transactions.length} Total
                     </p>
                  </div>
               </div>
            </motion.div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="xl:col-span-4 bg-white border border-gray-100 rounded-[3rem] p-12 shadow-sm"
            >
               <h2 className="text-2xl font-display font-black text-gray-900 mb-2 tracking-tight">
                  Add Funds
               </h2>

               <div className="flex items-center gap-2 mt-2 mb-10">
                  <Plus size={14} className="text-emerald-500" />
                  <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest leading-none">
                     Wallet Recharge
                  </p>
               </div>

               <div className="mb-10">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4 leading-none text-center">
                     Quick Amounts
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                     {[500, 1000, 2000, 5000].map((val) => (
                        <button
                           key={val}
                           type="button"
                           onClick={() => handleQuickAdd(val)}
                           className="h-14 bg-gray-50 border border-gray-200 rounded-2xl font-black text-gray-800 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all active:scale-95 text-xs"
                        >
                           <span className="opacity-40 mr-1">Rs.</span>
                           {val}
                        </button>
                     ))}
                  </div>
               </div>

               <form onSubmit={handleAddFunds} className="space-y-6">
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-emerald-500 font-black">
                        Rs.
                     </div>

                     <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Input Amount"
                        className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] pl-16 pr-8 py-5 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-display font-black text-2xl text-gray-800 shadow-inner"
                     />
                  </div>

                  <AnimatePresence mode="wait">
                     {error && (
                        <motion.div
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0 }}
                           className="p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-[10px] font-black uppercase tracking-wider"
                        >
                           Exception: {error}
                        </motion.div>
                     )}

                     {success && (
                        <motion.div
                           initial={{ opacity: 0, x: 10 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0 }}
                           className="p-5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-[10px] font-black uppercase tracking-wider"
                        >
                           Success: {success}
                        </motion.div>
                     )}
                  </AnimatePresence>

                  <button
                     type="submit"
                     className="w-full h-18 bg-gray-900 hover:bg-emerald-600 text-white font-display font-black text-lg rounded-[1.5rem] shadow-2xl shadow-gray-900/10 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                     <Plus size={20} />
                     Add Funds
                  </button>
               </form>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 }}
               className="xl:col-span-8 bg-white border border-gray-100 rounded-[3rem] p-12 shadow-sm max-h-[720px] flex flex-col"
            >
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-gray-50 shrink-0">
                  <div>
                     <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight leading-none">
                        Transaction History
                     </h2>

                     <div className="flex items-center gap-2 mt-3 text-gray-400">
                        <History size={14} className="text-emerald-500" />
                        <p className="font-black text-[10px] uppercase tracking-[0.2em] leading-tight">
                           Activity History
                        </p>
                     </div>
                  </div>

                  <div className="mt-6 md:mt-0 bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] leading-none flex items-center gap-3 shadow-lg">
                     <Database size={14} className="text-emerald-400" />
                     {transactions.length} Verified Transactions
                  </div>
               </div>

               {transactions.length === 0 ? (
                  <div className="p-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                     <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mx-auto mb-8">
                        <TrendingUp size={40} strokeWidth={1.5} className="text-gray-300" />
                     </div>

                     <h3 className="text-xl font-bold text-gray-800 mb-2">
                        No transactions found
                     </h3>

                     <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        Your transaction history is currently empty.
                     </p>
                  </div>
               ) : (
                  <div className="space-y-4 overflow-y-auto pr-3 max-h-[520px] custom-scrollbar">
                     {transactions.map((tx) => (
                        <div
                           key={tx._id || tx.id}
                           className="p-8 rounded-[2rem] border border-gray-50 bg-gray-50/30 hover:bg-white hover:shadow-2xl hover:border-emerald-50 transition-all duration-300 group"
                        >
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                              <div className="flex items-center gap-6">
                                 <div
                                    className={`w-16 h-16 rounded-[1.4rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${isTopUp(tx)
                                       ? "bg-emerald-100 text-emerald-600"
                                       : "bg-gray-100 text-gray-400"
                                       }`}
                                 >
                                    {isTopUp(tx) ? (
                                       <ArrowDownLeft size={30} />
                                    ) : (
                                       <ArrowUpRight size={30} />
                                    )}
                                 </div>

                                 <div className="uppercase">
                                    <p className="font-black text-gray-900 text-xl group-hover:text-emerald-700 transition-colors tracking-tight leading-none mb-2">
                                       {tx.type}
                                    </p>

                                    <div className="flex items-center gap-2 text-gray-400 font-black text-[9px] tracking-widest">
                                       <Clock size={12} />
                                       {formatTransactionDate(tx)}
                                    </div>
                                 </div>
                              </div>

                              <div className="text-right">
                                 <p
                                    className={`text-3xl font-display font-black tracking-tight leading-none ${isTopUp(tx) ? "text-emerald-600" : "text-gray-900"
                                       }`}
                                 >
                                    {isTopUp(tx) ? "+" : "-"} Rs. {Number(tx.amount).toFixed(2)}
                                 </p>

                                 <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-2">
                                    {tx._id || tx.id}
                                 </p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </motion.div>
         </div>
      </div>
   );
}

export default Wallet;