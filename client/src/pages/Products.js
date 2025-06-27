import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "./assets/ico.png"; // Replace with your actual logo path
import Footer from "./Footer";

Modal.setAppElement("#root");

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const userData = (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const userId = userData?._id || null;
  const userName = userData?.name || "Guest";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data);
        setFilteredProducts(res.data);
        const uniqueCategories = [
          "All",
          ...new Set(res.data.map((p) => p.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedProduct(null);
  };

  const addToCart = async () => {
    if (!userId) {
      toast.error("Please log in to add items to cart");
      navigate("/");
      return;
    }

    try {
      const quantity = 1;
      await api.post("/cart/add", {
        userId,
        product: {
          productId: selectedProduct._id,
          name: selectedProduct.name,
          image: selectedProduct.image,
          price: selectedProduct.price,
          quantity,
          stock: selectedProduct.stock,
        },
      });
      toast.success(`${selectedProduct.name} added to cart!`);
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === category));
    }
  };

  const getStarRating = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    for (let i = 0; i < full; i++)
      stars.push(<FaStar key={`f${i}`} className="text-yellow-400" />);
    if (half)
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    for (let i = 0; i < empty; i++)
      stars.push(<FaRegStar key={`e${i}`} className="text-yellow-400" />);

    return stars;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
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
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Our Products
          </h2>

          <div className="flex items-center space-x-4">
            <label className="text-gray-700 font-medium">
              Filter by Category:
            </label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p._id}
                onClick={() => openModal(p)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
              >
                <div className="relative pb-[100%] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="absolute h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">
                    {p.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    {getStarRating(p.rating)}
                    <span className="text-gray-600 text-sm ml-1">
                      ({p.rating})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-600">
                      Rs. {p.price.toLocaleString()}
                    </span>
                    <span
                      className={`text-sm ${
                        p.stock > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        {selectedProduct && (
          <div className="bg-white rounded-lg overflow-hidden max-w-2xl w-full">
            <div className="md:flex">
              <div className="md:w-1/2 bg-gray-100 p-6 flex items-center justify-center">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="max-h-96 object-contain"
                />
              </div>
              <div className="md:w-1/2 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedProduct.name}
                </h2>

                <div className="flex items-center mb-4">
                  {getStarRating(selectedProduct.rating)}
                  <span className="text-gray-600 ml-2">
                    ({selectedProduct.rating} rating)
                  </span>
                </div>

                <p className="text-3xl font-bold text-indigo-600 mb-4">
                  Rs. {selectedProduct.price.toLocaleString()}
                </p>

                <p className="text-gray-700 mb-4">
                  <span
                    className={`font-medium ${
                      selectedProduct.stock > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedProduct.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                  {selectedProduct.stock > 0 &&
                    ` (${selectedProduct.stock} available)`}
                </p>

                <p className="text-gray-600 mb-6">
                  {selectedProduct.description}
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={addToCart}
                    disabled={selectedProduct.stock <= 0}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                      selectedProduct.stock > 0
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={closeModal}
                    className="py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          transform: translate(-50%, -50%);
          background: transparent;
          border: none;
          padding: 0;
          max-width: 90%;
          width: 100%;
          outline: none;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
      <Footer />
    </div>
  );
}

export default Products;
