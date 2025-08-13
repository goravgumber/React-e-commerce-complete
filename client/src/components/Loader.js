import React from "react";
import "./Loader.css";

const Loader = ({ size = 40, color = "#ffde59" }) => {
  return (
    <div
      className="loader"
      style={{
        width: size,
        height: size,
        borderColor: `${color} transparent transparent transparent`,
      }}
      role="status"
      aria-label="Loading"
    ></div>
  );
};

export default Loader;
