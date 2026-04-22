import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  User,
  Info
} from "lucide-react";

function SendInquiry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState("");
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
    if (!message.trim()) tempErrors.message = "Message statement is required for verification.";
    else if (message.length < 10) tempErrors.message = "Message must exceed 10 characters for valid inquiry.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const res = await fetch("http://localhost:5000/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: id, message }),
        });
        if (res.ok) {
          setSuccess(true);
          setTimeout(() => navigate("/buyer/my-inquiries"), 2000);
        }
      } catch (err) {
        console.error("Inquiry Submission Error:", err);
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
          Back to Asset Registry
        </Link>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-[3rem] p-10 md:p-16 shadow-sm overflow-hidden relative group"
        >
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                 <div className="w-14 h-14 bg-gray-900 text-white rounded-[1.4rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <MessageSquare size={26} strokeWidth={2.5} />
                 </div>
                 <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 tracking-tight leading-none uppercase underline decoration-emerald-500 decoration-4 underline-offset-8">Initiate Request</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">Module: Inquiries v2.1.0</p>
                 </div>
              </div>

              {item && (
                <div className="bg-gray-50/50 rounded-[2rem] p-10 border border-gray-100 mb-12 shadow-inner group-hover:bg-white transition-colors duration-500">
                   <div className="flex items-center gap-3 mb-6">
                      <Info size={14} className="text-gray-300" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Record Identifier</p>
                   </div>
                   <h2 className="text-3xl font-display font-black text-gray-800 tracking-tighter mb-4 leading-none">{item.title}</h2>
                   <div className="flex flex-wrap gap-4 mt-6">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm transition-transform hover:scale-105">
                         <ShieldCheck size={12} className="text-emerald-500" />
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Security ID: {item._id.slice(-6)}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm transition-transform hover:scale-105">
                         <User size={12} className="text-gray-300" />
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Status: Available</span>
                      </div>
                   </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-600 text-white p-12 rounded-[2.5rem] text-center shadow-2xl shadow-emerald-600/30">
                    <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                       <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-display font-black mb-2 uppercase tracking-tight">Transmission Successful</h3>
                    <p className="font-bold opacity-80 uppercase text-[10px] tracking-[0.3em]">Handoff Request Recorded in Peer Registry</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-4 px-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Message Statement</label>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">Min 10 Characters</span>
                      </div>
                      <textarea
                        rows="6"
                        placeholder="State your operational requirement or inquiry regarding this asset..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`w-full bg-gray-50/50 border rounded-[2rem] p-8 outline-none focus:ring-4 transition-all font-medium text-lg leading-relaxed shadow-inner placeholder:text-gray-300 ${
                          errors.message ? "border-red-500 focus:ring-red-500/10" : "border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/10"
                        }`}
                      />
                      <AnimatePresence>
                        {errors.message && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-600 text-[10px] mt-4 font-black uppercase tracking-widest pl-4">
                            <AlertCircle size={14} />
                            Exception: {errors.message}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="pt-6">
                       <button
                         type="submit"
                         className="w-full h-20 bg-gray-900 hover:bg-emerald-600 text-white font-display font-black text-xl rounded-[2rem] shadow-2xl shadow-gray-900/10 active:scale-95 transition-all flex items-center justify-center gap-4 group/btn relative overflow-hidden"
                       >
                          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                          <Send size={24} strokeWidth={3} />
                          Dispatch Message
                       </button>
                    </div>
                  </form>
                )}
              </AnimatePresence>
           </div>
        </motion.div>

        <div className="mt-12 p-8 border border-gray-100 border-dashed rounded-[2rem] flex items-center gap-6">
           <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 flex-shrink-0">
             <ShieldCheck size={24} />
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
             Security Note: All modular communications are indexed for peer transparency. Ensure your message adheres to the UniNest framework protocols for asset exchange.
           </p>
        </div>
      </div>
    </div>
  );
}

export default SendInquiry;