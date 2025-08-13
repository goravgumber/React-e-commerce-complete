import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./ImageCarousel.css";

const ImageCarousel = ({ images = [], autoPlayInterval = 3000 }) => {
  const [current, setCurrent] = useState(0);
  const length = images.length;
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrent((prevIndex) => (prevIndex === length - 1 ? 0 : prevIndex + 1));
    }, autoPlayInterval);

    return () => resetTimeout();
  }, [current, length, autoPlayInterval]);

  const prevSlide = () => {
    setCurrent(current === 0 ? length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === length - 1 ? 0 : current + 1);
  };

  if (length === 0) return null;

  return (
    <div className="carousel-container" aria-label="Image Carousel">
      <button
        className="carousel-arrow left-arrow"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <FaChevronLeft />
      </button>

      <div className="carousel-wrapper">
        {images.map((imgSrc, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === current ? "active" : ""}`}
            aria-hidden={index !== current}
          >
            {index === current && (
              <img
                src={imgSrc}
                alt={`Slide ${index + 1}`}
                className="carousel-image"
              />
            )}
          </div>
        ))}
      </div>

      <button
        className="carousel-arrow right-arrow"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <FaChevronRight />
      </button>

      <div className="carousel-dots" role="tablist">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`dot ${idx === current ? "active" : ""}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            role="tab"
            aria-selected={idx === current}
            tabIndex={idx === current ? 0 : -1}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
