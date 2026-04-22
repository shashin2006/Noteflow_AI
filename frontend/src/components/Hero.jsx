import { motion } from "framer-motion";

export default function Hero({ onGetStarted }) {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold mb-4">NoteFlow</h1>

      <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={onGetStarted}
  className="mt-6 px-6 py-3 bg-blue-600 text-black rounded-lg"
>
  Get Started
</motion.button>
    </div>
  );
}