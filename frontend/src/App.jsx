import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BuyerDashboard from "./pages/SmartBorrowing/BuyerDashboard";
import BrowseItems from "./pages/SmartBorrowing/BrowseItems";
import ItemDetails from "./pages/SmartBorrowing/ItemDetails";
import SendInquiry from "./pages/SmartBorrowing/SendInquiry";
import RequestRental from "./pages/SmartBorrowing/RequestRental";
import MyRentals from "./pages/SmartBorrowing/MyRentals";
import Payment from "./pages/SmartBorrowing/Payment";
import ReturnItem from "./pages/SmartBorrowing/ReturnItem";
import MyInquiries from "./pages/SmartBorrowing/MyInquiries";
import Wallet from "./pages/SmartBorrowing/Wallet";

import MainLayout from "./pages/SmartBorrowing/components/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Buyer Authenticated Routes */}
        <Route element={<MainLayout />}>
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/items" element={<BrowseItems />} />
          <Route path="/buyer/items/:id" element={<ItemDetails />} />
          <Route path="/buyer/inquiry/:id" element={<SendInquiry />} />
          <Route path="/buyer/request-rental/:id" element={<RequestRental />} />
          <Route path="/buyer/my-rentals" element={<MyRentals />} />
          <Route path="/buyer/payment/:id" element={<Payment />} />
          <Route path="/buyer/return/:id" element={<ReturnItem />} />
          <Route path="/buyer/my-inquiries" element={<MyInquiries />} />
          <Route path="/buyer/wallet" element={<Wallet />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;