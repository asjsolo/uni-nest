import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Lock,
  CircleDot,
  TrendingUp,
  Clock
} from "lucide-react";

function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [paid, setPaid] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletError, setWalletError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  useEffect(() => {
    const savedBalance = localStorage.getItem("walletBalance");
    if (savedBalance) setWalletBalance(Number(savedBalance));

    const fetchRental = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rentals`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load rentals");
        const found = data.find(r => r._id === id);
        if (found) setRental(found);
        else setFetchError("The payment record you are looking for does not exist.");
      } catch (err) {
        setFetchError("Unable to load rental details");
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [id]);

  const amountToPay = rental ? (
    rental.paymentType === "Deposit" && rental.remainingAmount > 0
      ? rental.remainingAmount
      : rental.paidAmount
  ) : 0;

  const handlePayment = async () => {
    setWalletError("");
    if (paymentMethod === "wallet") {
      if (walletBalance < amountToPay) {
        setWalletError("Insufficient wallet balance. Please add more funds to continue.");
        return;
      }
      const newBalance = walletBalance - amountToPay;
      setWalletBalance(newBalance);
      localStorage.setItem("walletBalance", newBalance);
      const savedTransactions = JSON.parse(localStorage.getItem("walletTransactions")) || [];
      const paymentTransaction = { id: Date.now(), type: "Rental Payment", amount: amountToPay, itemTitle: rental.item?.title || "Item Payment", date: new Date().toLocaleString() };
      const updatedTransactions = [paymentTransaction, ...savedTransactions];
      localStorage.setItem("walletTransactions", JSON.stringify(updatedTransactions));
      window.dispatchEvent(new Event("storage"));
    }
    try {
        const res = await fetch(`http://localhost:5000/api/rentals/${id}/pay`, { method: "PATCH" });
        if (res.ok) {
            setPaid(true);
            setTimeout(() => navigate('/buyer/my-rentals'), 2000);
        } else setWalletError("Payment failed on the server.");
    } catch (err) { setWalletError("Payment failed. Server not responding."); }
  };

  if (loading) return <div className="flex items-center justify-center py-32 bg-white"><div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-100 border-t-emerald-600"></div></div>;

  if (!rental) {
    return (
      <div className="bg-white">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[3rem] p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-display font-black text-gray-900 mb-4 tracking-tight">System Record Fault</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-12">{fetchError}</p>
          <Link to="/buyer/my-rentals" className="inline-flex items-center gap-3 bg-gray-900 text-white font-black px-10 py-5 rounded-2xl shadow-xl hover:bg-emerald-600 transition-all uppercase tracking-widest text-[10px]">
            <ArrowLeft size={16} />
            Abort & Return
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-7 space-y-10">
            <motion.div 
               initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
               className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                <div className="w-12 h-12 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center shadow-inner">
                  <FileText size={22} strokeWidth={2.5} />
                </div>
                 <div>
                    <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight leading-none">Order Summary</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{rental._id}</p>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[1.8rem] border border-gray-100/50">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                       <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Rental Item</span>
                    </div>
                    <span className="font-black text-gray-900 text-lg tracking-tight">{rental.item?.title}</span>
                </div>
                <div className="grid grid-cols-2 gap-5">
                   <div className="p-6 bg-gray-50/50 rounded-[1.8rem] border border-gray-100/50">
                      <div className="flex items-center gap-2 mb-3">
                         <Calendar size={12} className="text-gray-300" />
                          <p className="text-gray-400 font-black uppercase tracking-widest text-[9px] leading-none mt-0.5">From</p>
                       </div>
                       <p className="font-black text-gray-800 text-lg tracking-tight">{new Date(rental.dates?.startDate).toLocaleDateString()}</p>
                   </div>
                   <div className="p-6 bg-gray-50/50 rounded-[1.8rem] border border-gray-100/50">
                      <div className="flex items-center gap-2 mb-3">
                         <Clock size={12} className="text-gray-300" />
                          <p className="text-gray-400 font-black uppercase tracking-widest text-[9px] leading-none mt-0.5">To</p>
                       </div>
                       <p className="font-black text-gray-800 text-lg tracking-tight">{new Date(rental.dates?.endDate).toLocaleDateString()}</p>
                   </div>
                </div>
                 <div className="flex items-center justify-between p-6 bg-emerald-50 text-emerald-700 rounded-[1.8rem] border border-emerald-100">
                    <div className="flex items-center gap-3">
                       <ShieldCheck size={14} />
                       <span className="font-black uppercase tracking-widest text-[10px]">Security</span>
                    </div>
                    <span className="font-black text-lg tracking-tight">{rental.paymentType}</span>
                 </div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
               className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                <div className="w-12 h-12 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center shadow-inner">
                  <CreditCard size={22} strokeWidth={2.5} />
                </div>
                 <div>
                    <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight leading-none">Secure Payment</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 px-2 py-1 bg-gray-50 rounded w-max border border-gray-100">Protected Transaction</p>
                 </div>
              </div>

              <div className="space-y-4">
                <label className={`block relative p-8 rounded-[2rem] border-2 transition-all cursor-pointer ${paymentMethod === 'wallet' ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="relative group/check flex items-center justify-center">
                            <input type="radio" name="paymentMethod" value="wallet" checked={paymentMethod === 'wallet'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-6 h-6 accent-emerald-600 cursor-pointer" />
                         </div>
                          <div>
                             <p className="font-black text-gray-900 uppercase tracking-widest text-xs leading-none">Uni-Nest Wallet</p>
                             <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tight">Fast payment using your wallet balance.</p>
                          </div>
                      </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 leading-none">Balance</p>
                          <p className="text-emerald-700 font-black text-2xl tracking-tighter leading-none mt-1">Rs. {walletBalance.toFixed(2)}</p>
                       </div>
                   </div>
                </label>

                <label className={`block relative p-8 rounded-[2rem] border-2 transition-all cursor-not-allowed opacity-30 ${paymentMethod === 'manual' ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-50 bg-gray-50/50'}`}>
                   <div className="flex items-center gap-6">
                      <input type="radio" name="paymentMethod" value="manual" checked={paymentMethod === 'manual'} disabled className="w-6 h-6 accent-emerald-600" />
                       <div>
                          <p className="font-black text-gray-900 uppercase tracking-widest text-xs leading-none">Offline Payment</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tight">Pay the owner directly in person.</p>
                       </div>
                   </div>
                </label>
              </div>

              <AnimatePresence>
                {walletError && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6 bg-red-50 text-red-600 rounded-[1.5rem] border border-red-100 font-black text-[11px] mt-8 flex items-center gap-4 uppercase tracking-wide">
                     <AlertCircle size={18} />
                     Exception Event: {walletError}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-gray-900/40"
          >
            <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <div className="relative z-10 w-full">
               <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                  <h2 className="text-3xl font-display font-black tracking-tight leading-none">Total Amount</h2>
                  <Lock size={18} className="text-gray-600" />
               </div>
              
              <div className="space-y-6 mb-12">
                 <div className="flex justify-between items-center bg-gray-800/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                   <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                     <span className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px]">Total Rental Value</span>
                   </div>
                   <span className="font-black text-2xl tracking-tighter">Rs. {rental.totalAmount}</span>
                 </div>
                 <div className="flex justify-between items-center bg-gray-800/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                   <div className="flex items-center gap-3">
                     <TrendingUp size={14} className="text-emerald-500" />
                     <span className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px]">Already Paid</span>
                   </div>
                   <span className="font-black text-2xl text-emerald-400 tracking-tighter">- Rs. {rental.paidAmount}</span>
                 </div>
                
                <div className="pt-12 mt-12 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                       <CircleDot size={12} className="text-emerald-500 animate-pulse" />
                       <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] leading-none mt-0.5">Amount Due</p>
                    </div>
                   <div className="flex items-end justify-between">
                      <h3 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-none decoration-emerald-500/50 decoration-8 underline-offset-[16px]">
                         Rs. {amountToPay}
                      </h3>
                      <div className="hidden xl:flex w-20 h-20 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/30 items-center justify-center text-emerald-400 shadow-xl">
                         <CreditCard size={32} />
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 w-full pt-10">
               {paid ? (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-emerald-500 text-white rounded-[2rem] p-10 text-center font-display font-black text-2xl shadow-2xl shadow-emerald-500/40 uppercase tracking-[0.2em] flex items-center justify-center gap-4">
                    <CheckCircle2 size={32} />
                    Paid
                  </motion.div>
               ) : (
                   <button
                    onClick={handlePayment}
                    className="group/pay relative w-full h-24 bg-emerald-500 hover:bg-emerald-400 text-white font-display font-black text-2xl rounded-[2.5rem] shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-4 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/pay:translate-x-[100%] transition-transform duration-1000" />
                    Pay Now
                  </button>
               )}
               <p className="text-center text-[9px] text-gray-700 font-black mt-10 uppercase tracking-[0.5em] opacity-40">Secured via Uni-Nest Payment System</p>
            </div>
          </motion.div>
        </div>
    </div>
  );
}

export default Payment;