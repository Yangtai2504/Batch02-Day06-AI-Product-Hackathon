import { motion } from 'framer-motion'
import { Pulse } from './icons.jsx'

const time = () =>
  new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

export default function Message({ role, text, confirm, stamp }) {
  const ai = role === 'ai'
  return (
    <motion.div
      className={`msg ${ai ? 'ai' : 'user'}`}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="msg__avatar">{ai ? <Pulse /> : 'Bạn'}</div>
      <div className="msg__body">
        <div className="bubble">
          {confirm && <span style={{ color: 'var(--sage)', fontWeight: 600 }}>✓ Đã ghi nhận — </span>}
          {text}
        </div>
        <span className="msg__time">{stamp || time()}</span>
      </div>
    </motion.div>
  )
}
