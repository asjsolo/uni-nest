import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/buyer/dashboard" },
    { name: "Browse Items", path: "/buyer/items" },
    { name: "My Rentals", path: "/buyer/my-rentals" },
    { name: "My Inquiries", path: "/buyer/my-inquiries" },
    { name: "Wallet", path: "/buyer/wallet" }
  ];

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-panel border-b border-gray-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Link to="/buyer/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg flex-shrink-0 flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">U</span>
          </div>
          <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-emerald-800 to-green-700 bg-clip-text text-transparent">
            UNI NEST
          </h1>
        </Link>

        <div className="flex flex-wrap items-center gap-1 md:gap-2 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive ? "text-emerald-800 bg-emerald-100/50 shadow-sm" : "text-gray-600 hover:text-emerald-700 hover:bg-gray-100"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute inset-0 border border-emerald-300 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            )
          })}
          
          <div className="w-px h-6 bg-gray-300 mx-2 hidden md:block"></div>
          
          <Link 
            to="/" 
            className="text-gray-500 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition-colors ml-2"
          >
            Logout
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;