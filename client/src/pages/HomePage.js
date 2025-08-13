// src/pages/HomePage.js
import React from "react";
import ImageCarousel from "../components/ImageCarousel";
import "./CommonPages.css";

import banner1 from "../assets/banner1.png";
import banner2 from "../assets/banner2.png";
import banner3 from "../assets/banner3.png";

const banners = [banner1, banner2, banner3];

const HomePage = () => (
  <div className="common-page home-page">
    <ImageCarousel images={banners} />
    <div className="home-content">
      <h1>Welcome to Our Store</h1>
      <p>Discover the best products with amazing discounts.</p>
      <a href="/products" className="btn-primary">
        Shop Now
      </a>
    </div>
  </div>
);

export default HomePage;
