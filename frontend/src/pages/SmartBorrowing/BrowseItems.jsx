import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  RotateCcw, 
  LayoutGrid,
  FileSearch,
  PackageSearch
} from "lucide-react";
import ItemCard from "./components/ItemCard";

function BrowseItems() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [emergencyOnly, setEmergencyOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/items");
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch items");
                setItems(data);
            } catch (err) {
                setError(err.message || "Unable to load items");
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const categories = ["All", ...new Set(items.map((item) => item.category))];

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category === "All" ? true : item.category === category;
            const matchesEmergency = emergencyOnly ? item.isEmergency === true : true;
            return matchesSearch && matchesCategory && matchesEmergency;
        });
    }, [items, search, category, emergencyOnly]);

    return (
        <div className="bg-white">
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-10 mb-12 shadow-sm"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                    <div>
                       <h1 className="text-3xl font-display font-black text-gray-900 mb-1 tracking-tight">Find Student Items</h1>
                       <div className="flex items-center gap-3 mt-2">
                        <FileSearch size={14} className="text-emerald-500" />
                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] leading-none">Student Marketplace</p>
                       </div>
                    </div>
                    
                    <button 
                        onClick={() => {setSearch(''); setCategory('All'); setEmergencyOnly(false);}}
                        className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-emerald-600 bg-white border border-gray-100 px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95 uppercase tracking-[0.2em]"
                    >
                        <RotateCcw size={14} strokeWidth={3} />
                        Clear Filters
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-5 relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-300 group-focus-within:text-emerald-500 transition-colors">
                            <Search size={20} strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-2xl pl-16 pr-6 py-4.5 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                        />
                    </div>

                    <div className="md:col-span-4 relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-300 group-focus-within:text-emerald-500 transition-colors">
                            <Filter size={20} strokeWidth={2.5} />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-2xl pl-16 pr-6 py-4.5 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-gray-700 appearance-none"
                        >
                            {categories.map((cat, index) => (
                                <option key={index} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <label className={`flex items-center justify-between h-full rounded-2xl border-2 px-6 py-4.5 cursor-pointer transition-all ${emergencyOnly ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={18} className={emergencyOnly ? "text-red-600" : "text-gray-400"} />
                                <span className="font-black uppercase tracking-widest text-[10px]">Emergency Items</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={emergencyOnly}
                                onChange={(e) => setEmergencyOnly(e.target.checked)}
                                className="w-5 h-5 accent-red-600 cursor-pointer"
                            />
                        </label>
                    </div>
                </div>
            </motion.div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="animate-spin rounded-full h-14 w-14 border-[3px] border-gray-100 border-t-emerald-600"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading items...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 border border-red-100 rounded-[2.5rem] p-12 text-center shadow-lg max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-display font-black mb-2 uppercase tracking-tight">Registry Link Failure</h3>
                    <p className="font-bold text-gray-400 text-xs mb-8 uppercase tracking-widest">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-red-600 text-white font-black px-8 py-3 rounded-xl hover:bg-red-700 transition active:scale-95 text-xs uppercase tracking-widest">Attempt Reconection</button>
                </div>
            )}

            {!loading && !error && filteredItems.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-24 text-center">
                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mx-auto mb-8">
                        <PackageSearch size={40} strokeWidth={1.5} className="text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-display font-black text-gray-900 mb-2 tracking-tight">No Matching Records</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">We could not identify any assets matching your specific query.</p>
                </div>
            ) : (
                !loading && !error && (
                    <motion.div 
                        initial="hidden" animate="show"
                        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredItems.map((item) => (
                            <motion.div 
                                key={item._id}
                                variants={{
                                    hidden: { opacity: 0, scale: 0.98, y: 10 },
                                    show: { opacity: 1, scale: 1, y: 0 }
                                }}
                            >
                                <ItemCard item={item} />
                            </motion.div>
                        ))}
                    </motion.div>
                )
            )}
        </div>
    );
}

export default BrowseItems;