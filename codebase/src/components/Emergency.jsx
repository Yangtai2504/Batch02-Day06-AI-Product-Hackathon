import { motion } from 'framer-motion'
import { Phone, Alert, Sit, NoCar, Wind } from './icons.jsx'

const WHILE = [
  { icon: <Sit />, text: 'Ngồi hoặc nằm yên, giữ bình tĩnh' },
  { icon: <NoCar />, text: 'Không tự lái xe — nhờ người khác đưa đi' },
  { icon: <Wind />, text: 'Nới lỏng quần áo, hít thở chậm' },
]

export default function Emergency({ flag, onBack }) {
  return (
    <motion.div
      className="emergency"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="emergency__pulse-bg" />
      <motion.div
        className="emergency__inner"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {flag && (
          <div className="emergency__flag">
            <Alert width={15} height={15} /> Phát hiện dấu hiệu: {flag}
          </div>
        )}
        <div className="emergency__siren"><Phone /></div>
        <div className="emergency__eyebrow">Ưu tiên xử lý ngay</div>
        <h2 className="emergency__title">Cần hỗ trợ y tế khẩn cấp</h2>
        <p className="emergency__msg">
          Triệu chứng bạn mô tả có thể là dấu hiệu nguy hiểm cần được xử lý ngay lập tức.
          Đừng chờ đợi — hãy gọi cấp cứu.
        </p>

        <a className="call-btn" href="tel:115">
          <Phone /> Gọi 115 ngay
        </a>

        <div className="emergency__while">
          <h4>Trong lúc chờ hỗ trợ</h4>
          <ul>
            {WHILE.map((w, i) => (
              <li key={i}>{w.icon}{w.text}</li>
            ))}
          </ul>
        </div>

        <button className="emergency__back" onClick={onBack}>
          Đây không phải tình huống của tôi — quay lại
        </button>
      </motion.div>
    </motion.div>
  )
}
