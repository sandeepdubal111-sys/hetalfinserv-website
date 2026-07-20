import { useEffect, useState } from "react";
import Lenis from "lenis";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import GrainOverlay from "@/components/GrainOverlay";
import IntroLoader from "@/components/IntroLoader";
import HomePage from "@/pages/HomePage";
import ServicesPage from "@/pages/ServicesPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import CalculatorsPage from "@/pages/CalculatorsPage";

// Lenis smooth scrolling — respects reduced-motion
function useLenis() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    let raf;
    function frame(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
}

function ScrollToTopOnRoute() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return; // let page hashes handle themselves
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}

function Shell() {
  useLenis();
  const [introDone, setIntroDone] = useState(() => {
    if (typeof window === "undefined") return true;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    try {
      return !!sessionStorage.getItem("hf-intro-played-v1");
    } catch {
      return false;
    }
  });

  // Expose to descendants (Hero uses this to know when to start its reveal)
  useEffect(() => {
    window.__hfIntroDone = introDone;
    window.dispatchEvent(new CustomEvent("hf:intro-done", { detail: { done: introDone } }));
  }, [introDone]);

  return (
    <>
      <IntroLoader onDone={() => setIntroDone(true)} />
      <ScrollToTopOnRoute />
      <GrainOverlay />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/calculators" element={<CalculatorsPage />} />
        <Route path="/calculators/:slug" element={<CalculatorsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
      <WhatsAppFloat />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#0d0f0b",
            color: "#fdf9ee",
            border: "1px solid rgba(253,249,238,0.2)",
            borderRadius: 0,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.06em",
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </div>
  );
}
