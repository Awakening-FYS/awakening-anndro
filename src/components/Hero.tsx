"use client"

import { motion } from "framer-motion"

export default function Hero() {
  return (
  <section
    className="flex-1 flex items-center justify-center text-center px-4 sm:px-6 py-20 bg-cover bg-center relative"
    style={{ backgroundImage: `url('/images/dazuo1.png')` }}
  >
  {/* overlay sits behind content: z-0 so it doesn't cover text and does not intercept pointer events */}
  <div className="absolute inset-0 bg-white/30 dark:bg-black/50 z-0 pointer-events-none" aria-hidden />
    <motion.div
      className="relative z-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-4xl font-bold mb-4">欢迎来到觉醒空间</h1>
      <p className="text-lg text-black-1200 dark:text-gray-300">
        通过冥想与正念，探索内心的宁静。
      </p>
    </motion.div>
  </section>
  )
}
