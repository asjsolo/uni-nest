import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Clock, 
  Search, 
  Send,
  Inbox,
  User,
  ShieldCheck
} from "lucide-react";

function MyInquiries() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/inquiries");
                const data = await res.json();
                if (res.ok) setInquiries(data);
            } catch (err) {
                console.error("Failed to fetch inquiries", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInquiries();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <div className="bg-white">
            <div className="mb-12">
                <h1 className="text-4xl font-display font-black text-gray-900 mb-1 tracking-tight">My Messages</h1>
                <div className="flex items-center gap-2 mt-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] leading-none">Private Messages</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-100 border-t-emerald-600"></div>
                </div>
            ) : inquiries.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 border-2 border-dashed border-gray-100 rounded-[3rem] p-24 text-center">
                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mx-auto mb-8">
                        <Inbox size={40} strokeWidth={1.5} className="text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-display font-black text-gray-900 mb-2 tracking-tight">No Messages</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Your message history is currently empty.</p>
                </motion.div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-8">
                    {inquiries.map((inquiry) => (
                        <motion.div
                            variants={itemVariants}
                            key={inquiry._id}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-500 p-8 md:p-12 group"
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10 pb-8 border-b border-gray-50">
                                <div className="flex items-start gap-8">
                                    <div className="w-16 h-16 rounded-[1.8rem] bg-gray-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <MessageSquare size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-display font-black text-gray-900 group-hover:text-emerald-700 transition-colors tracking-tight leading-tight">
                                            {inquiry.item?.title || "Unknown Item"}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-4">
                                           <Clock size={12} className="text-gray-400" />
                                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                               Date: {new Date(inquiry.createdAt || Date.now()).toLocaleDateString()}
                                           </p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl border shadow-sm ${inquiry.status === "Replied"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : "bg-gray-50 text-gray-400 border-gray-100"
                                        }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${inquiry.status === 'Replied' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                    {inquiry.status || "Status Tracking: Active"}
                                </div>
                            </div>

                            <div className="pl-0 md:pl-24">
                                <div className="flex items-center gap-2 mb-4">
                                    <User size={12} className="text-gray-300" />
                                    <p className="text-gray-300 text-[10px] uppercase font-black tracking-[0.2em] leading-none">Your Message</p>
                                </div>
                                <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-50 relative group-hover:bg-white group-hover:border-emerald-50 transition-colors">
                                    <p className="text-gray-700 font-medium italic text-xl leading-relaxed">"{inquiry.message}"</p>
                                    <div className="mt-6 flex justify-end">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Messaging System</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

export default MyInquiries;