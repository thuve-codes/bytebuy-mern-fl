import { useEffect, useState } from "react";
import { api } from "../api";
import { loadStripe } from "@stripe/stripe-js";
import {
  FaTrash,
  FaSpinner,
  FaShoppingCart,
  FaArrowLeft,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import logo from "./assets/ico.png";

const stripePromise = loadStripe(
  "pk_test_51RITe84gLRA5Z0ymYo5OqzxjQmB4hveFlxYRvFaON4L3emUQbxjxB696YCOP5xWNhySfLHFdcqqFnil0qNEyT92o00oIVxx6d0"
);

function QuantityInput({
  stock,
  productId,
  value,
  onQuantityChange,
  disabled,
}) {
  // Initialize inputValue as a number, capped between 1 and stock
  const [inputValue, setInputValue] = useState(() => {
    const initialValue = Number(value) || 1;
    return Math.max(
      1,
      Math.min(initialValue, stock != null ? stock : Infinity)
    );
  });

  // Sync inputValue with value prop when it changes
  useEffect(() => {
    const newValue = Number(value) || 1;
    const validValue = Math.max(
      1,
      Math.min(newValue, stock != null ? stock : Infinity)
    );
    setInputValue(validValue);
  }, [value, stock]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    // Allow empty input temporarily for user convenience
    if (val === "") {
      onQuantityChange(productId, "");
      return;
    }

    // Validate as a positive integer
    if (/^\d+$/.test(val)) {
      const num = parseInt(val, 10);
      const maxStock = stock != null ? stock : Infinity;
      if (num >= 1 && num <= maxStock) {
        onQuantityChange(productId, num);
      }
    }
  };

  const handleBlur = () => {
    let num = Number(inputValue);
    // Default to 1 if input is invalid or empty
    if (isNaN(num) || num < 1) {
      num = 1;
    }
    // Cap at stock if stock is defined
    const maxStock = stock != null ? stock : Infinity;
    num = Math.min(num, maxStock);
    setInputValue(num);
    onQuantityChange(productId, num);
  };

  const increment = () => {
    const currentValue = Number(inputValue) || 1;
    const maxStock = stock != null ? stock : Infinity;
    const newValue = Math.min(currentValue + 1, maxStock);
    setInputValue(newValue);
    onQuantityChange(productId, newValue);
  };

  const decrement = () => {
    const currentValue = Number(inputValue) || 1;
    const newValue = Math.max(currentValue - 1, 1);
    setInputValue(newValue);
    onQuantityChange(productId, newValue);
  };

  return (
    <div className="flex items-center">
      <button
        onClick={decrement}
        disabled={disabled || inputValue <= 1}
        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-l-md hover:bg-gray-300 disabled:opacity-50"
      >
        -
      </button>
      <input
        type="number"
        min={1}
        max={stock != null ? stock : undefined}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className="w-12 h-8 text-center border-t border-b border-gray-300 focus:outline-none"
      />
      <button
        onClick={increment}
        disabled={disabled || inputValue >= (stock != null ? stock : Infinity)}
        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-r-md hover:bg-gray-300 disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}

function Cart() {
  const [cart, setCart] = useState(null);
  const [userId, setUserId] = useState("");
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [loading, setLoading] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  const userData = (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const userName = userData?.name || "Guest";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Please login to view your cart");
      navigate("/");
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      if (!parsed._id) throw new Error("Invalid user");
      setUserId(parsed._id);
      loadCart(parsed._id);
    } catch {
      toast.error("Session error. Please log in again.");
      navigate("/");
    }
  }, [navigate]);

  const loadCart = async (uid) => {
    try {
      setLoading(true);
      const res = await api.get(`/cart/${uid}`);
      setCart(res.data);

      const updates = {};
      res.data.products.forEach((item) => {
        updates[item.productId] = item.quantity;
      });
      setPendingUpdates(updates);
    } catch (err) {
      console.error("Failed to load cart:", err);
      toast.error("Failed to load cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (productId, qty) => {
    setPendingUpdates((prev) => ({ ...prev, [productId]: qty }));
  };

  const confirmQty = async (productId) => {
    try {
      setUpdatingItem(productId);
      let quantity = pendingUpdates[productId];

      if (!quantity || quantity < 1) quantity = 1;

      const product = cart.products.find((p) => p.productId === productId);
      if (product && product.stock != null) {
        quantity = Math.min(quantity, product.stock);
      }

      const res = await api.put(`/cart/${userId}/${productId}`, { quantity });
      setCart(res.data);
      setPendingUpdates((prev) => ({ ...prev, [productId]: quantity }));
      toast.success("Quantity updated successfully");
    } catch (err) {
      console.error("Failed to update quantity:", err);
      toast.error("Failed to update quantity. Please try again.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdatingItem(productId);
      const res = await api.delete(`/cart/${userId}/${productId}`);
      if (res.data && res.data.products) {
        setCart(res.data);
        toast.success("Item removed from cart");
      } else {
        await loadCart(userId);
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
      toast.error("Failed to remove item. Please try again.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    try {
      setLoading(true);
      const res = await api.delete(`/cart/clear/${userId}`);
      if (res.data && res.data.products) {
        setCart(res.data);
        toast.success("Cart cleared successfully");
      } else {
        await loadCart(userId);
      }
    } catch (err) {
      console.error("Failed to clear cart:", err);
      toast.error("Failed to clear cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToCheckout = async () => {
    const hasOverstock = cart.products.some((p) => p.quantity > p.stock);
    if (hasOverstock) {
      toast.error("One or more items exceed available stock. Please adjust.");
      return;
    }

    try {
      setCheckoutLoading(true);
      const stripe = await stripePromise;
      const res = await api.post("/checkout/create-session", { userId });
      await stripe.redirectToCheckout({ sessionId: res.data.id });
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Failed to proceed to checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  if (!cart) return null;

  const totalAmount = cart.products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.products.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  localStorage.setItem("cartCount", totalItems.toString());

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
              <span>Cart ({totalItems})</span>
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

      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
          >
            <FaArrowLeft className="mr-2" />
            Continue Shopping
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Your Shopping Cart
          </h1>

          {cart.products.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FaShoppingCart className="mx-auto text-5xl text-gray-400 mb-4" />
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-500 mb-6">
                Start shopping to add items to your cart
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="divide-y divide-gray-200">
                {cart.products.map((item) => (
                  <div key={item.productId} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row">
                      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-32 h-32 object-contain rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-lg font-medium text-gray-900 ml-4">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Rs. {item.price.toLocaleString()} each
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <QuantityInput
                            stock={item.stock}
                            productId={item.productId}
                            value={pendingUpdates[item.productId]}
                            onQuantityChange={handleQtyChange}
                            disabled={updatingItem === item.productId}
                          />

                          <div className="flex space-x-3">
                            <button
                              onClick={() => confirmQty(item.productId)}
                              disabled={updatingItem === item.productId}
                              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 disabled:opacity-50"
                            >
                              {updatingItem === item.productId ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                "Update"
                              )}
                            </button>
                            <button
                              onClick={() => removeItem(item.productId)}
                              disabled={updatingItem === item.productId}
                              className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>

                        {item.quantity > item.stock && (
                          <p className="mt-2 text-sm text-red-600">
                            ⚠ Only {item.stock} available in stock
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>Rs. {totalAmount.toLocaleString()}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-6 flex justify-between space-x-4">
                  <button
                    onClick={clearCart}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={goToCheckout}
                    disabled={checkoutLoading}
                    className="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : (
                      "Checkout"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;
