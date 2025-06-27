import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaShoppingBag,
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import Footer from "./Footer";
import logo from "./assets/ico.png"; // Make sure to import your logo

function Success() {
  const navigate = useNavigate();

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userName = userData?.name || "Guest";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    // Clear cart from localStorage on successful payment
    localStorage.removeItem("cartCount");
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/products")}
          >
            <img src={logo} alt="ByteBuy" className="h-10" />
            <h1 className="text-2xl font-bold">ByteBuy</h1>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center space-x-1 hover:text-indigo-200 transition-colors"
            >
              <FaShoppingCart className="text-xl" />
              <span>Cart</span>
            </button>

            <div className="flex items-center space-x-2">
              <FaUser className="text-lg" />
              <span className="font-medium">{userName}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 hover:text-indigo-200 transition-colors"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <FaCheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-gray-600">
            Thank you for your purchase. Your order has been confirmed and will
            be processed shortly.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/products")}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaShoppingBag className="mr-2" />
              Continue Shopping
            </button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Success;
