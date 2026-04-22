import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "../components/Hero";
import LoginSection from "../pages/login";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="h-screen overflow-hidden relative bg-white">
      <AnimatePresence mode="wait">
        {!showLogin && (
          <motion.div
            key="hero"
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95, filter: "blur(6px)" }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Hero onGetStarted={() => setShowLogin(true)} />
          </motion.div>
        )}

        {showLogin && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <LoginSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}