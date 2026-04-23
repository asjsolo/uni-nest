import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Box, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ClipboardCheck,
  PackageCheck
} from "lucide-react";

function ReturnItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [confirmed, setConfirmed] = useState(false);
  const [returned, setReturned] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rentals`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load rentals");
        const found = data.find(r => r._id === id);
        if (found) setRental(found);
        else setFetchError("The return record you are looking for does not exist.");
      } catch (err) {
        setFetchError("Unable to load rental details");
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [id]);

  const handleReturn = async () => {
    if (!confirmed) {
      setError("Compliance check required. Please confirm item return condition.");
      return;
    }
    if (rental.remainingAmount > 0) {
        setError("Outstanding debit balance detected. Settlement required prior to asset return.");
        return;
    }
    setError("");
    try {
        const res = await fetch(`http://localhost:5000/api/rentals/${id}/return`, { method: "PATCH" });
        if (res.ok) {
            setReturned(true);
            setTimeout(() => navigate('/buyer/my-rentals'), 2000);
        } else {
            const data = await res.json();
            setError(data.message || "Termination process failure on institutional server.");
        }
    } catch (err) { setError("Network exception event. Please re-synchronize."); }
  };

  if (loading) return <div className="flex items-center justify-center py-32 bg-white"><div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-100 border-t-emerald-600"></div></div>;

  if (!rental) {
    return (
      <div className="bg-white">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-[3rem] p-24 text-center shadow-sm">
          <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-display font-black text-gray-900 mb-4 tracking-tight tracking-tight">Access Restricted</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-12">{fetchError}</p>
          <Link to="/buyer/my-rentals" className="inline-flex items-center gap-3 bg-gray-900 text-white font-black px-10 py-5 rounded-2xl shadow-xl hover:bg-emerald-600 transition-all uppercase tracking-widest text-[10px]">
            <ArrowLeft size={16} />
            Return to Registry
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <motion.div 
        initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
         <div className="w-20 h-20 bg-gray-50 text-gray-900 border border-gray-100 rounded-[2.2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
           <PackageCheck size={36} strokeWidth={2.5} />
         </div>
         <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 mb-2 tracking-tighter">Return Item</h1>
         <div className="flex items-center justify-center gap-3 mt-4 text-gray-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">Return Checklist</p>
         </div>
      </motion.div>

      <div className="max-w-5xl mx-auto">
        <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 p-10 md:p-16 border border-gray-100 group transition-all duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
             <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-50 pb-6 uppercase">
                   <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                   <h2 className="text-lg font-display font-black text-gray-900 tracking-tight">Rental Details</h2>
                </div>
                <div className="bg-gray-50/50 rounded-[2rem] p-8 space-y-6 border border-gray-100 shadow-inner">
                   <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Item Name</span>
                      <span className="font-display font-black text-gray-900 text-lg tracking-tight leading-none">{rental.item?.title}</span>
                   </div>
                   <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                      <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Lease Life</span>
                      <div className="flex items-center gap-3 text-right">
                         <span className="font-black text-gray-900 text-base leading-none tracking-tight">{new Date(rental.dates?.startDate).toLocaleDateString()}</span>
                         <ChevronRight size={14} className="text-gray-300" />
                         <span className="font-black text-gray-900 text-base leading-none tracking-tight">{new Date(rental.dates?.endDate).toLocaleDateString()}</span>
                      </div>
                   </div>
                   <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                      <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Record Status</span>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 uppercase tracking-widest leading-none">{rental.rentalStatus}</span>
                   </div>
                </div>
             </div>

             <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-gray-50 pb-6 uppercase">
                   <div className="w-1.5 h-6 bg-gray-900 rounded-full" />
                   <h2 className="text-lg font-display font-black text-gray-900 tracking-tight">Payment Status</h2>
                </div>
                <div className="bg-gray-900 text-white rounded-[2rem] p-10 space-y-6 shadow-2xl shadow-gray-900/20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                   <div className="relative z-10 flex justify-between items-center opacity-60">
                      <div className="flex items-center gap-2">
                         <CreditCard size={12} strokeWidth={3} />
                         <span className="font-black text-[9px] uppercase tracking-widest">Total Valuation</span>
                      </div>
                      <span className="font-black text-lg tracking-tight">Rs. {rental.totalAmount}</span>
                   </div>
                   <div className="relative z-10 pt-8 mt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck size={14} className="text-orange-400" />
                        <p className="text-orange-400 font-black uppercase tracking-[0.3em] text-[9px] leading-none mt-0.5">Amount Remaining</p>
                      </div>
                      <p className="text-5xl font-display font-black tracking-tighter leading-none">{rental.remainingAmount > 0 ? `Rs. ${rental.remainingAmount}` : "Paid"}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 mb-12 hover:border-emerald-500 transition-all duration-500 relative group/check">
             <label className="flex items-start gap-6 cursor-pointer">
                <div className="relative flex items-center justify-center pt-1.5 transition-transform group-hover/check:scale-110">
                   <input
                     type="checkbox"
                     checked={confirmed}
                     onChange={(e) => setConfirmed(e.target.checked)}
                     className="w-8 h-8 accent-emerald-500 rounded-xl cursor-pointer"
                   />
                </div>
                <div>
                   <h3 className="text-xl font-display font-black text-gray-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight leading-none mb-3 underline decoration-gray-200 underline-offset-8">Confirm Item Condition</h3>
                   <p className="text-gray-400 font-bold text-[13px] mt-4 leading-relaxed max-w-2xl px-6 py-4 bg-white border border-gray-50 rounded-2xl border-l-[6px] border-l-emerald-500 italic">
                     By initiating this termination request, you officially declare that the asset is being surrendered in its recorded physical state without undisclosed damage or operational failure.
                   </p>
                </div>
             </label>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="p-8 bg-red-50 text-red-600 rounded-[2rem] border border-red-100 font-black mb-10 flex items-center gap-6 text-[11px] uppercase tracking-widest shadow-xl shadow-red-500/5">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlertCircle size={24} />
                </div>
                <div className="flex-grow">
                   <p className="leading-relaxed">Error Event: {error}</p>
                </div>
                {rental.remainingAmount > 0 && (
                   <Link to={`/buyer/payment/${rental._id}`} className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-black transition shadow-lg text-[9px]">Settle Ledger First</Link>
                )}
              </motion.div>
            )}
            
            {returned && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-12 bg-emerald-600 text-white rounded-[3rem] text-center mb-10 shadow-2xl shadow-emerald-600/30">
                <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                   <ClipboardCheck size={32} />
                </div>
                <h3 className="text-3xl font-display font-black mb-2 uppercase tracking-tighter">Agreement Terminated</h3>
                <p className="font-bold opacity-80 uppercase text-[10px] tracking-[0.3em]">Handoff Verified // Closing Registry Entry</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleReturn}
            disabled={returned || !confirmed}
            className="w-full bg-gray-900 hover:bg-emerald-600 text-white font-display font-black text-2xl py-10 rounded-[3rem] shadow-2xl shadow-gray-900/10 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 uppercase tracking-[0.2em] flex items-center justify-center gap-4 group/btn"
          >
             {returned ? "Termination Logged" : "Confirm Return"}
             <ChevronRight size={32} className="group-hover/btn:translate-x-2 transition-transform" strokeWidth={3} />
          </button>
          
          <p className="text-center text-gray-300 font-black text-[9px] mt-12 uppercase tracking-[0.5em] opacity-40">Modular Asset Liquidation Protocol v1.0.4</p>
        </motion.div>
      </div>
    </div>
  );
}

export default ReturnItem;