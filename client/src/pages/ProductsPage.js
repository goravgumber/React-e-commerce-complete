import React, { useEffect, useState, useMemo } from "react";
import axios from "../axios";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import ToastNotification from "../components/ToastNotification";
import Pagination from "../components/Pagination";
import debounce from "lodash/debounce";
import "./ProductsPage.css";

const PAGE_SIZE = 12;

const ProductsPage = ({ searchTerm }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCart();

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/products");
        setProducts(res.data);
        setCurrentPage(1); // reset to first page when products reload
      } catch (err) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Debounced search filter
  const debouncedFilter = useMemo(
    () =>
      debounce((term) => {
        if (!term) {
          setFilteredProducts(products);
        } else {
          const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(term.toLowerCase()),
          );
          setFilteredProducts(filtered);
        }
        setCurrentPage(1); // reset page on search
      }, 300),
    [products],
  );

  useEffect(() => {
    debouncedFilter(searchTerm);
    return () => debouncedFilter.cancel();
  }, [searchTerm, debouncedFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="products-page">
      <h2>Products</h2>

      {loading && (
        <div className="loader-container">
          <Loader size={60} />
        </div>
      )}

      {error && (
        <ToastNotification
          type="error"
          message={error}
          onClose={() => setError(null)}
          duration={4000}
        />
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <p className="no-products">No products found matching "{searchTerm}"</p>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <>
          <div className="product-list">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id || product.product_id}
                product={product}
                addToCart={() => addToCart(product.product_id || product.id, 1)}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default ProductsPage;
