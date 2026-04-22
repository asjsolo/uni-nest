import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-emerald-700">UNI NEST Registration</h1>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" placeholder="John Doe" className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" placeholder="student@uninest.com" className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" placeholder="••••••••" className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          
          <Link to="/" className="w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Register Account
          </Link>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/" className="text-emerald-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
