import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  Calendar, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Plus,
  Inbox
} from "lucide-react";

function MyRentals() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/rentals");
                const data = await res.json();
                if (res.ok) setRentals(data);
            } catch (err) {
                console.error("Failed to fetch rentals", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRentals();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        show: { opacity: 1, scale: 1, y: 0 }
    };

    return (
        <div className="bg-white">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12">
                <div>
                   <h1 className="text-4xl font-display font-black text-gray-900 mb-1 tracking-tight">My Rentals</h1>
                   <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] leading-none">Track your rented items</p>
                   </div>
                </div>
                <Link to="/buyer/items" className="mt-6 md:mt-0 bg-gray-900 text-white font-black px-8 py-4 rounded-2xl shadow-xl hover:bg-emerald-600 transition-all flex items-center gap-3 uppercase tracking-widest text-[10px]">
                   <Plus size={16} />
                   Rent Something New
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-100 border-t-emerald-600"></div>
                </div>
            ) : rentals.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-24 text-center">
                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mx-auto mb-8">
                        <Inbox size={40} strokeWidth={1.5} className="text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-display font-black text-gray-900 mb-2 tracking-tight">No Rentals Yet</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">You haven't rented any items yet. Browse the marketplace to get started!</p>
                </motion.div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-8">
                    {rentals.map((rental) => (
                        <motion.div
                            variants={cardVariants}
                            key={rental._id}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-500 relative overflow-hidden group"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-emerald-600 opacity-20 group-hover:opacity-100 transition-all" />
                            
                            <div className="flex flex-col xl:flex-row gap-12">
                                <div className="flex-grow">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-10 pb-8 border-b border-gray-50">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-widest">ID: {rental._id.slice(-6)}</span>
                                            </div>
                                            <h2 className="text-3xl font-display font-black text-gray-900 leading-tight tracking-tight">
                                                {rental.item?.title || "Unknown Item"}
                                            </h2>
                                            <div className="flex items-center gap-3 mt-4">
                                                <Calendar size={14} className="text-gray-400" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    From: {new Date(rental.dates?.startDate).toLocaleDateString()} — To: {new Date(rental.dates?.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-black px-6 py-3 rounded-2xl self-start sm:self-auto border shadow-sm
                                            ${rental.rentalStatus === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                              : rental.rentalStatus === "Pending" ? "bg-amber-50 text-amber-700 border-amber-100"
                                              : "bg-gray-50 text-gray-400 border-gray-100"}
                                        `}>
                                            <div className={`w-2 h-2 rounded-full ${rental.rentalStatus === 'Active' ? 'bg-emerald-500' : 'bg-current'}`}></div>
                                            {rental.rentalStatus || "State Unknown"}
                                        </div>
                                    </div>

                                    {rental.notes && (
                                        <div className="mb-10 p-5 bg-gray-50 border-l-4 border-emerald-500 rounded-r-2xl">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Notes</p>
                                            <p className="text-gray-600 text-xs italic font-medium">"{rental.notes}"</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                              <CreditCard size={12} className="text-gray-300" />
                                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-0.5">Payment</p>
                                            </div>
                                            <p className="font-display font-black text-gray-900 tracking-tight text-lg">{rental.paymentType}</p>
                                        </div>
                                        <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-0.5">Total Amount</p>
                                            </div>
                                            <p className="font-display font-black text-gray-900 tracking-tight text-lg">Rs. {rental.totalAmount}</p>
                                        </div>
                                        <div className="p-6 bg-emerald-50/20 rounded-2xl border border-emerald-100/50">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mt-0.5">Paid</p>
                                            </div>
                                            <p className="font-display font-black text-emerald-600 tracking-tight text-lg">Rs. {rental.paidAmount}</p>
                                        </div>
                                        <div className="p-6 bg-amber-50/20 rounded-2xl border border-amber-100/50">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Clock size={12} className="text-amber-400" />
                                              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mt-0.5">Amount Due</p>
                                            </div>
                                            <p className="font-display font-black text-amber-600 tracking-tight text-lg">Rs. {rental.remainingAmount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row xl:flex-col justify-end gap-3 xl:min-w-[200px] items-center xl:items-stretch">
                                    {rental.remainingAmount > 0 && rental.rentalStatus !== "Returned" && (
                                        <Link
                                            to={`/buyer/payment/${rental._id}`}
                                            className="bg-gray-900 hover:bg-emerald-600 text-white font-black text-center text-[10px] py-5 rounded-2xl transition-all shadow-xl shadow-gray-900/10 active:scale-95 uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                                        >
                                            <CreditCard size={16} />
                                            Pay Now
                                        </Link>
                                    )}

                                    {rental.rentalStatus !== "Returned" && (
                                        <Link
                                            to={`/buyer/return/${rental._id}`}
                                            className="bg-white text-gray-900 hover:bg-gray-50 font-black text-center text-[10px] py-5 rounded-2xl transition-all border border-gray-200 active:scale-95 uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <ExternalLink size={16} />
                                            Return Item
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

export default MyRentals;