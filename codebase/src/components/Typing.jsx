import { motion } from 'framer-motion'
import { Pulse } from './icons.jsx'

export default function Typing() {
  return (
    <motion.div
      className="msg ai"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <div className="msg__avatar"><Pulse /></div>
      <div className="msg__body">
        <div className="bubble" style={{ padding: 0 }}>
          <div className="typing"><span /><span /><span /></div>
        </div>
      </div>
    </motion.div>
  )
}
