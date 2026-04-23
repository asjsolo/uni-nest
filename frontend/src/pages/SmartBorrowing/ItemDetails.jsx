import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Tag, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Zap,
  Info,
  Calendar,
  Layers
} from "lucide-react";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/items/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not find this item");
        setItem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-40 bg-white"><div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-100 border-t-emerald-600"></div></div>;

  if (error) {
    return (
      <div className="bg-white">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[3rem] p-24 text-center shadow-lg">
          <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-red-500">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-3xl font-display font-black text-gray-900 mb-4 tracking-tight uppercase">Item Not Found</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-12">{error}</p>
          <Link to="/buyer/items" className="bg-gray-900 text-white font-black px-10 py-5 rounded-2xl shadow-xl hover:bg-emerald-600 active:scale-95 transition-all text-xs uppercase tracking-widest">
            Back to Marketplace
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-12">
        <Link to="/buyer/items" className="inline-flex items-center gap-3 text-gray-400 hover:text-emerald-700 transition-colors font-black text-[10px] uppercase tracking-[0.2em] group">
          <div className="p-2 border border-gray-100 rounded-lg group-hover:bg-emerald-50 group-hover:border-emerald-50 transition-all">
            <ArrowLeft size={16} />
          </div>
          Back to Marketplace
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Asset Identity */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-12">
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="bg-white rounded-[3rem] border border-gray-100 p-10 md:p-16 shadow-sm hover:shadow-xl transition-all duration-700 overflow-hidden relative group"
           >
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 opacity-0 group-hover:opacity-100 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 transition-opacity duration-1000" />
              
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-4 mb-10">
                   <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 shadow-sm">
                      <ShieldCheck size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Verified Item</span>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl border border-gray-100">
                      <Tag size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.category} Category</span>
                   </div>
                   {item.isEmergency && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-pulse">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Emergency</span>
                      </div>
                   )}
                </div>

                <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 mb-8 leading-[1.1] tracking-tighter decoration-emerald-500 underline-offset-8">
                   {item.title}
                </h1>

                <div className="bg-gray-50/50 rounded-[2rem] p-10 border border-gray-100 shadow-inner group-hover:bg-white transition-colors duration-500">
                   <div className="flex items-center gap-3 mb-6">
                      <Info size={16} className="text-gray-300" />
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Product Details</h3>
                   </div>
                   <p className="text-gray-600 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-8">
                     "{item.description}"
                   </p>
                </div>
              </div>
           </motion.div>

           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 group transition-all hover:bg-emerald-50/20 hover:border-emerald-100">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gray-50 group-hover:bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-all shadow-sm">
                       <MapPin size={22} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Location</p>
                       <p className="text-xl font-display font-black text-gray-900 tracking-tight">{item.location}</p>
                    </div>
                 </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 group transition-all hover:bg-emerald-50/20 hover:border-emerald-100">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gray-50 group-hover:bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-all shadow-sm">
                       <Calendar size={22} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Availability</p>
                       <p className="text-xl font-display font-black text-gray-900 tracking-tight">{item.isAvailable ? 'Available Now' : 'Currently Rented'}</p>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* Right Column: Financials & Actions */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
             className="bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl shadow-gray-900/40 relative overflow-hidden group/card"
           >
              <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                 <div className="pb-12 border-b border-white/5 mb-12">
                   <div className="flex items-center justify-between mb-10 opacity-30 group-hover/card:opacity-100 transition-opacity">
                      <div className="flex items-center gap-3">
                         <Layers size={16} />
                         <span className="font-black text-[9px] uppercase tracking-[0.3em]">Item Pricing</span>
                      </div>
                      <ShieldCheck size={18} className="text-emerald-500" />
                   </div>
                   <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Price per day</p>
                   <div className="flex items-end gap-3">
                      <h2 className="text-7xl font-display font-black tracking-tighter leading-none decoration-emerald-500 decoration-8 underline-offset-[14px]">
                        Rs. {item.pricePerDay}
                      </h2>
                      <span className="text-emerald-500 font-bold text-sm uppercase tracking-widest mb-2 opacity-60">/ Day</span>
                   </div>
                 </div>

                 <div className="space-y-4 mb-12">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md flex items-center justify-between group/line hover:bg-white/10 transition-colors">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rental Type</span>
                       <span className="font-black text-lg tracking-tight uppercase">Daily</span>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md flex items-center justify-between group/line hover:bg-white/10 transition-colors">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Record</span>
                       <span className="font-mono text-xs opacity-60">ID: {item._id.slice(-8)}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <button
                      onClick={() => navigate(`/buyer/request-rental/${item._id}`)}
                      className="w-full h-20 bg-emerald-500 hover:bg-emerald-400 text-white font-display font-black text-2xl rounded-[2rem] shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-4 group/action overflow-hidden relative"
                    >
                       <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/action:translate-x-[100%] transition-transform duration-1000" />
                       <Zap size={24} strokeWidth={3} fill="currentColor" />
                       Rent Now
                    </button>
                    <button
                      onClick={() => navigate(`/buyer/inquiry/${item._id}`)}
                      className="w-full h-16 bg-white/5 hover:bg-white/10 text-white font-black text-[11px] rounded-[1.5rem] border border-white/10 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 backdrop-blur-md"
                    >
                       <MessageSquare size={16} />
                       Message Owner
                    </button>
                 </div>

                 <p className="text-center text-[8px] text-gray-700 font-black mt-10 uppercase tracking-[0.5em] opacity-40">Secured Student-to-Student Exchange</p>
              </div>
           </motion.div>

           <div className="bg-emerald-50/30 rounded-[2.5rem] p-10 border border-emerald-100/50 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-600 mb-6 shadow-sm border border-emerald-50">
                 <ShieldCheck size={24} />
              </div>
              <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-3">Student Guarantee</h4>
              <p className="text-[11px] font-bold text-emerald-700/60 leading-relaxed uppercase tracking-tight">All items are verified by students to ensure a safe and reliable exchange within the community.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;
