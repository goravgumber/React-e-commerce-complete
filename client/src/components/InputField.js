import React from "react";
import "./InputField.css";

const InputField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  ...props
}) => {
  return (
    <div className="input-field">
      <label htmlFor={id} className="input-label">
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
        className={`input-control ${error ? "input-error" : ""}`}
        {...props}
      />
      {error && (
        <div id={`${id}-error`} className="input-error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default InputField;
