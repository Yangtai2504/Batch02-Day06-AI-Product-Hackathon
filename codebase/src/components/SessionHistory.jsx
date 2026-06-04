import { motion } from 'framer-motion'
import { Cross } from './icons.jsx'

/* Lịch sử phiên — danh sách phiên trước (mock, mang tính minh hoạ sản phẩm). */
const PAST = [
  { id: 'p1', title: 'Sốt & Đau họng', when: 'Hôm qua' },
  { id: 'p2', title: 'Đau bụng', when: '2 ngày trước' },
  { id: 'p3', title: 'Kiểm tra định kỳ', when: '1 tuần trước' },
  { id: 'p4', title: 'Mệt mỏi, chóng mặt', when: '1 tuần trước' },
  { id: 'p5', title: 'Đau đầu', when: '2 tuần trước' },
  { id: 'p6', title: 'Phát ban da', when: '3 tuần trước' },
]

function DocIcon(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 3h7l4 4v14H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4M9.5 12h5M9.5 15.5h5" />
    </svg>
  )
}

export default function SessionHistory({ activeTitle, onNew }) {
  return (
    <aside className="history">
      <p className="history__label">Lịch sử phiên</p>

      <button className="history__new" onClick={onNew}>
        <Cross width={17} height={17} /> Phiên mới
      </button>

      <div className="history__list">
        {activeTitle && (
          <motion.div
            className="history__item is-active"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="history__dot" />
            <span className="history__tx">
              <span className="history__title">{activeTitle}</span>
              <span className="history__when">Đang diễn ra</span>
            </span>
            <DocIcon className="history__ic" width={16} height={16} />
          </motion.div>
        )}

        {PAST.map((p) => (
          <button key={p.id} className="history__item" type="button">
            <span className="history__tx">
              <span className="history__title">Phiên: {p.title}</span>
              <span className="history__when">{p.when}</span>
            </span>
            <DocIcon className="history__ic" width={16} height={16} />
          </button>
        ))}
      </div>

      <p className="history__foot">Phiên cũ chỉ mang tính minh hoạ trong prototype.</p>
    </aside>
  )
}
