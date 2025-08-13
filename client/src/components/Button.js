import React from "react";
import "./Button.css";

const Button = ({
  children,
  variant = "primary", // primary | secondary | danger
  disabled = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${disabled ? "btn-disabled" : ""} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
