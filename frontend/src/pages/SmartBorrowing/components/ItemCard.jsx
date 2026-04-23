import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Tag, 
  Zap, 
  AlertCircle,
  Eye
} from "lucide-react";

function ItemCard({ item }) {
  return (
    <motion.div
      whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 hover:border-emerald-500/30 flex flex-col h-full"
    >
      <div className="p-8 pb-4">
        {/* Header Badbes */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.isEmergency ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}></div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${item.isEmergency ? "text-red-600" : "text-emerald-700"}`}>
                {item.isEmergency ? "Emergency" : "Verified"}
              </span>
            </div>
            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${item.isAvailable ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
               {item.isAvailable ? 'Available' : 'Rented'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 text-gray-400">
             <Tag size={10} />
             <span className="text-[9px] font-black uppercase tracking-widest">{item.category}</span>
          </div>
        </div>

        <h3 className="text-2xl font-display font-black text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1 tracking-tight">
          {item.title}
        </h3>
        <p className="text-gray-400 font-medium text-sm mt-3 line-clamp-2 leading-relaxed h-[40px]">
          {item.description}
        </p>
      </div>

      {/* Details Bar */}
      <div className="px-8 py-6 grid grid-cols-2 gap-4 border-t border-gray-50 bg-gray-50/10">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-400 border border-gray-100">
              <Clock size={14} />
           </div>
            <div>
              <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Rental Type</p>
              <p className="text-xs font-bold text-gray-700">Daily</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-500 border border-emerald-50">
              <Zap size={14} />
           </div>
           <div>
              <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Pricing</p>
              <p className="text-xs font-bold text-gray-900 leading-none mt-1">Rs. {item.pricePerDay}</p>
           </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-8 pt-4 mt-auto">
        <Link
          to={`/buyer/items/${item._id}`}
          className="w-full h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] group/btn transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-600/20 active:scale-95"
        >
          <Eye size={16} strokeWidth={2.5} />
          View Details
        </Link>
      </div>
    </motion.div>
  );
}

export default ItemCard;
