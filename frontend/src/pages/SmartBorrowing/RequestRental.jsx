import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Package,
  ShieldCheck,
  Zap,
  Info,
  Clock
} from "lucide-react";

function RequestRental() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [formData, setFormData] = useState({ startDate: "", endDate: "", paymentType: "Full" });
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/items/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch item error:", err);
        setLoading(false);
      });
  }, [id]);

  const validate = () => {
    let tempErrors = {};
    if (!formData.startDate) tempErrors.startDate = "Start date required.";
    if (!formData.endDate) tempErrors.endDate = "End date required.";
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      tempErrors.endDate = "End date must be after start date.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const res = await fetch("http://localhost:5000/api/rentals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: id, ...formData, totalAmount: item.pricePerDay }),
        });
        if (res.ok) {
          setSuccess(true);
          setTimeout(() => navigate("/buyer/my-rentals"), 2000);
        }
      } catch (err) {
        console.error("Rental request error:", err);
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center py-40 bg-white"><div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-100 border-t-emerald-600"></div></div>;

  return (
    <div className="bg-white">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
        <Link to={`/buyer/items/${id}`} className="inline-flex items-center gap-3 text-gray-400 hover:text-emerald-700 transition-colors font-black text-[10px] uppercase tracking-[0.2em] group">
          <div className="p-2 border border-gray-100 rounded-lg group-hover:bg-emerald-50 group-hover:border-emerald-50 transition-all">
            <ArrowLeft size={16} />
          </div>
          Back to Item
        </Link>
      </motion.div>

      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Summary Details */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8 order-2 xl:order-1">
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-200/50">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600">
                        <Package size={22} strokeWidth={2.5} />
                      </div>
                       <div>
                         <h2 className="text-xl font-display font-black text-gray-900 leading-none">Order Summary</h2>
                         <p className="text-[9px] font-black text-gray-400 tracking-widest mt-2 uppercase">Item ID: {id?.slice(-6) || "N/A"}</p>
                       </div>
                   </div>

                   {item && (
                    <>
                      <h3 className="text-3xl font-display font-black text-gray-800 mb-8 tracking-tighter leading-none">{item.title}</h3>
                      <div className="space-y-4">
                          <div className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl">
                             <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Price per day</span>
                             <span className="font-black text-gray-900 text-lg">Rs. {item.pricePerDay}</span>
                          </div>
                          <div className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl">
                             <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Rental Type</span>
                              <span className="font-black text-gray-900 text-lg uppercase tracking-tight">Daily</span>
                          </div>
                      </div>
                    </>
                   )}
                </div>
             </motion.div>

             <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] p-10 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm border border-emerald-50">
                   <ShieldCheck size={28} />
                </div>
                 <h4 className="text-xs font-black text-emerald-900 uppercase tracking-[0.2em] mb-3">Secure Rental</h4>
                 <p className="text-[11px] font-bold text-emerald-700/60 leading-relaxed uppercase tracking-tight">Your request will be sent to the owner immediately after you confirm.</p>
              </div>
          </div>

          {/* Right: Request Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12 xl:col-span-7 bg-white border border-gray-100 rounded-[3rem] p-10 md:p-16 shadow-sm overflow-hidden group/form order-1 xl:order-2"
          >
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-12 pb-8 border-b border-gray-50">
                    <div className="w-14 h-14 bg-gray-900 text-white rounded-[1.4rem] flex items-center justify-center shadow-lg group-hover/form:scale-110 transition-transform">
                       <Calendar size={26} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-display font-black text-gray-900 tracking-tight leading-none uppercase underline decoration-emerald-500 decoration-8 underline-offset-8">Rental Dates</h1>
                 </div>

                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-600 text-white p-14 rounded-[2.5rem] text-center shadow-2xl shadow-emerald-500/20">
                      <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                         <CheckCircle2 size={40} />
                      </div>
                       <h3 className="text-3xl font-display font-black mb-4 uppercase tracking-tighter">Request Sent</h3>
                       <p className="font-bold opacity-80 uppercase text-[10px] tracking-[0.3em]">Wait for owner approval</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <div className="flex items-center gap-2 mb-4 px-2">
                             <Calendar size={12} className="text-gray-300" />
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-0.5">Start Date</label>
                          </div>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className={`w-full bg-gray-50 border rounded-2xl p-5 outline-none focus:ring-4 transition-all font-black text-sm tracking-tight ${
                              errors.startDate ? "border-red-500 focus:ring-red-500/10" : "border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/10"
                            }`}
                          />
                          {errors.startDate && (
                            <div className="flex items-center gap-2 text-red-600 text-[9px] font-black mt-3 uppercase tracking-widest pl-2">
                              <AlertCircle size={14} />
                              Record Error: {errors.startDate}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-4 px-2">
                             <Clock size={12} className="text-gray-300" />
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-0.5">End Date</label>
                          </div>
                          <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className={`w-full bg-gray-50 border rounded-2xl p-5 outline-none focus:ring-4 transition-all font-black text-sm tracking-tight ${
                              errors.endDate ? "border-red-500 focus:ring-red-500/10" : "border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/10"
                            }`}
                          />
                          {errors.endDate && (
                            <div className="flex items-center gap-2 text-red-600 text-[9px] font-black mt-3 uppercase tracking-widest pl-2">
                              <AlertCircle size={14} />
                              Record Error: {errors.endDate}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-4 px-2">
                           <CreditCard size={12} className="text-gray-300" />
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-0.5">Payment Method</label>
                         </div>
                        <div className="grid grid-cols-2 gap-4">
                            {["Full", "Deposit"].map(type => (
                             <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, paymentType: type })}
                                className={`h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                                  formData.paymentType === type ? "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200"
                                }`}
                             >
                               {type === "Full" ? "Full Payment" : type}
                             </button>
                            ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-4 px-2">
                           <Info size={12} className="text-gray-300" />
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-0.5">Optional Transaction Notes</label>
                        </div>
                        <textarea
                          rows="4"
                          placeholder="Provide any specific coordination details or requests here (optional)..."
                          value={formData.notes || ""}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm leading-relaxed shadow-inner placeholder:text-gray-300"
                        />
                      </div>

                      <div className="pt-8">
                         <button
                           type="submit"
                           className="w-full h-20 bg-gray-900 hover:bg-emerald-600 text-white font-display font-black text-lg rounded-[2rem] shadow-2xl shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-4 group/btn relative overflow-hidden"
                         >
                             <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                             <Zap size={22} strokeWidth={3} fill="currentColor" />
                             Confirm Rental
                          </button>
                         <p className="text-center text-[9px] text-gray-400 font-black mt-10 uppercase tracking-[0.4em] opacity-30">Uni-Nest Secure Rental System</p>
                      </div>
                    </form>
                  )}
                </AnimatePresence>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default RequestRental;