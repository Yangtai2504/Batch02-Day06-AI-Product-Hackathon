import { motion } from 'framer-motion'
import { ArrowRight } from './icons.jsx'

const EXAMPLES = [
  { icon: '🤒', q: 'Tôi bị sốt 38.5 độ và đau họng 2 ngày nay', tag: 'Đường thuận' },
  { icon: '😵‍💫', q: 'Tôi thấy mệt và hơi chóng mặt', tag: 'Khi chưa chắc' },
  { icon: '🫀', q: 'Tôi đau ngực và khó thở', tag: 'Khẩn cấp' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export default function WelcomeHero({ onPick }) {
  return (
    <motion.div className="hero" variants={container} initial="hidden" animate="show">
      <motion.div className="hero__eyebrow" variants={item}>
        Trợ lý phân loại triệu chứng
      </motion.div>
      <motion.h1 className="hero__title" variants={item}>
        Kể mình nghe bạn đang thấy <em>không khỏe</em> ở đâu
      </motion.h1>
      <motion.p className="hero__lede" variants={item}>
        Mô tả bằng ngôn ngữ tự nhiên — mình sẽ xác nhận lại điều đã hiểu, hỏi thêm vài câu khi cần,
        rồi cho bạn biết <strong>mức độ khẩn cấp</strong> và <strong>bước tiếp theo nên làm</strong>.
      </motion.p>
      <motion.div className="hero__examples" variants={item}>
        {EXAMPLES.map((ex) => (
          <button key={ex.q} className="example-card" onClick={() => onPick(ex.q)}>
            <span className="example-card__ic">{ex.icon}</span>
            <span className="example-card__tx">
              <span className="example-card__q">"{ex.q}"</span>
              <span className="example-card__t">{ex.tag}</span>
            </span>
            <ArrowRight className="example-card__arrow" width={18} height={18} />
          </button>
        ))}
      </motion.div>
    </motion.div>
  )
}
