import { motion } from 'framer-motion'

export default function QuickReplies({ options, onPick }) {
  return (
    <motion.div
      className="quick-row"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {options.map((opt) => (
        <motion.button
          key={opt}
          className="quick-chip"
          onClick={() => onPick(opt)}
          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
          whileTap={{ scale: 0.95 }}
        >
          {opt}
        </motion.button>
      ))}
    </motion.div>
  )
}
