import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ProductRating = ({ rating, maxRating = 5 }) => {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} color="#ffde59" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} color="#ffde59" />);
    } else {
      stars.push(<FaRegStar key={i} color="#ccc" />);
    }
  }

  return <div style={{ display: "flex", gap: 4 }}>{stars}</div>;
};

export default ProductRating;
