import React from "react";
import "./CartItem.css";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (e) => {
    let qty = parseInt(e.target.value);
    if (isNaN(qty) || qty < 1) qty = 1;
    onUpdateQuantity(item.cart_id, qty);
  };

  return (
    <div
      className="cart-item"
      tabIndex={0}
      aria-label={`Cart item: ${item.name}`}
    >
      <img
        src={`http://localhost:5000/images/${item.image}`}
        alt={item.name}
        className="cart-item-image"
        loading="lazy"
      />
      <div className="cart-item-details">
        <h4>{item.name}</h4>
        <p className="price">Price: ₹{item.price}</p>
        <label htmlFor={`qty-${item.cart_id}`} className="quantity-label">
          Quantity:
        </label>
        <input
          id={`qty-${item.cart_id}`}
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="cart-quantity-input"
          aria-live="polite"
          aria-label={`Change quantity for ${item.name}`}
          title="Change quantity"
        />
      </div>
      <button
        onClick={() => onRemove(item.cart_id)}
        className="remove-btn"
        aria-label={`Remove ${item.name} from cart`}
        title="Remove item"
      >
        ✖ Remove
      </button>
    </div>
  );
};

export default CartItem;
