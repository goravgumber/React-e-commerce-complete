import React from "react";
import { useCart } from "../context/CartContext";
import "./ProductCard.css";

import { IMAGE_BASE_URL } from "../config";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card" tabIndex={0} aria-label={`Product ${product.name}`}>
      <div className="image-wrapper">
        <img
          src={`${IMAGE_BASE_URL}/${product.image}`}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="desc" title={product.description}>
        {product.description}
      </p>
      <p className="product-price">
        <strong>₹{product.price}</strong>
      </p>
      <p className={`stock ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
        {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
      </p>

      <button
        className="add-to-cart-btn"
        onClick={() => addToCart(product.product_id || product.id)}
        disabled={product.stock === 0}
        aria-label={`Add ${product.name} to cart`}
        title={product.stock === 0 ? "Out of stock" : "Add to Cart"}
      >
        🛒 Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
