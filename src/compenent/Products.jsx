import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "./Footer";

function Product() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search") || "";
    setSearchTerm(searchQuery);

    fetchProducts(searchQuery);
  }, [location.search]);

  const fetchProducts = async (searchQuery) => {
    try {
      const response = await fetch("http://localhost:3002/products");
      const data = await response.json();

      setProducts(data);
      filterProducts(data, searchQuery);
    } catch (error) {
      toast.error("Failed to load products from server!");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = (list, term) => {
    if (!term.trim()) {
      setFilteredProducts(list);
      return;
    }

    const filtered = list.filter(
      (p) =>
        p.name.toLowerCase().includes(term.toLowerCase()) ||
        p.category.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredProducts(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterProducts(products, value);
  };

  const addToCart = async (item) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const serverCheck = await fetch(
        `http://localhost:3002/cart?userId=${user.id}&productId=${item.id}`
      );
      const existsDB = await serverCheck.json();

      if (existsDB.length > 0) {

        await fetch(`http://localhost:3002/cart/${existsDB[0].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: existsDB[0].quantity + 1 }),
        });
      } else {
        await fetch("http://localhost:3002/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: 1,
            image: item.image,
            date: new Date().toISOString(),
          }),
        });
      }

      let localCart = JSON.parse(localStorage.getItem("cart")) || [];

      const existingLocal = localCart.find(
        (c) => Number(c.productId) === Number(item.id)
      );

      if (existingLocal) {
        existingLocal.quantity += 1;
      } else {
        localCart.push({
          productId: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(localCart));

      window.dispatchEvent(new Event("updateCart"));

      toast.success(`${item.name} added to cart`);
    } catch (error) {
      toast.error("Failed to add item to cart!");
    }
  };

  const addToWishlist = async (item) => {
    if (!user) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    try {
      const check = await fetch(
        `http://localhost:3002/wishlist?userId=${user.id}&productId=${item.id}`
      );
      const existsDB = await check.json();

      if (existsDB.length > 0) {
        toast.info("Already in wishlist");
        return;
      }

      await fetch("http://localhost:3002/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          productId: item.id,
          productName: item.name,
          price: item.price,
          image: item.image,
          date: new Date().toISOString(),
        }),
      });

      let oldWish = JSON.parse(localStorage.getItem("wishlist")) || [];

      const existsLocal = oldWish.find(
        (w) => Number(w.id) === Number(item.id)
      );

      if (!existsLocal) {
        oldWish.push({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
        });
      }

      localStorage.setItem("wishlist", JSON.stringify(oldWish));

      window.dispatchEvent(new Event("updateWishlist"));

      toast.success(`${item.name} added to wishlist`);
    } catch (error) {
      toast.error("Failed to add item to wishlist!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-xl text-amber-600">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Our Delicious Cakes
          </h1>

          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search cakes..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              🔍
            </span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <div className="relative">
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                <span className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded text-xs">
                  {item.category}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-amber-600 font-bold text-xl mb-3">₹{item.price}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => addToCart(item)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={() => addToWishlist(item)}
                    className="w-12 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg"
                  >
                    ♡
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-lg">
            No cakes found.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Product;
