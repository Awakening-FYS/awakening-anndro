"use client"

import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="flex-1 flex items-center justify-center text-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-4">欢迎来到觉醒空间</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          通过冥想与正念，探索内心的宁静。
        </p>
      </motion.div>
    </section>
  )
}
