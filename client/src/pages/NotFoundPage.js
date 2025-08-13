// src/pages/NotFoundPage.js
import React from "react";
import { Link } from "react-router-dom";
import "./CommonPages.css";

const NotFoundPage = () => (
  <div className="common-page notfound-page">
    <h2>404 - Page Not Found</h2>
    <p>Sorry, the page you are looking for does not exist.</p>
    <Link to="/" className="btn-primary">
      Go to Home
    </Link>
  </div>
);

export default NotFoundPage;
