import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Initialize Lenis Smooth Scroll with "buttery" physics settings
const lenis = new window.Lenis({
  lerp: 0.08,             // Lower lerp = slower, butter-smooth scroll
  duration: 1.5,          // Increased duration for momentum
  smoothWheel: true,
  wheelMultiplier: 1.0,   // Standard velocity
  touchMultiplier: 2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) // Decelerating curve
});

window.lenis = lenis;

// Connect Lenis to GSAP Ticker for perfect sync
if (window.gsap && window.ScrollTrigger) {
  lenis.on('scroll', window.ScrollTrigger.update);
  window.gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  window.gsap.ticker.lagSmoothing(0);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
