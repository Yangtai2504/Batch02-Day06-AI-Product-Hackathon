import { motion } from 'framer-motion'
import { Cross } from './icons.jsx'
import { formatWhen } from '../lib/sessionLog.js'

const LEVEL_DOT = { green: '#45975c', amber: '#c07f30', red: '#c0473b' }

function DocIcon(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 3h7l4 4v14H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4M9.5 12h5M9.5 15.5h5" />
    </svg>
  )
}

export default function SessionHistory({ sessions = [], activeId, isReviewing, activeTitle, onNew, onOpen }) {
  // Phiên đang diễn ra (chưa nằm trong log hoặc chính là active) hiển thị ở đầu nếu có
  const liveShown = activeTitle && !isReviewing && !sessions.some((s) => s.id === activeId)

  return (
    <aside className="history">
      <p className="history__label">Lịch sử phiên</p>

      <button className="history__new" onClick={onNew}>
        <Cross width={17} height={17} /> Phiên mới
      </button>

      <div className="history__list">
        {liveShown && (
          <motion.div className="history__item is-active" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
            <span className="history__dot" />
            <span className="history__tx">
              <span className="history__title">{activeTitle}</span>
              <span className="history__when">Đang diễn ra</span>
            </span>
            <DocIcon className="history__ic" width={16} height={16} />
          </motion.div>
        )}

        {sessions.length === 0 && !liveShown && (
          <p className="history__empty">Chưa có phiên nào. Mỗi cuộc trò chuyện sẽ được lưu lại đây để bạn xem lại.</p>
        )}

        {sessions.map((s) => {
          const active = s.id === activeId
          return (
            <button
              key={s.id}
              className={`history__item ${active ? 'is-active' : ''}`}
              type="button"
              onClick={() => onOpen?.(s)}
              title="Bấm để xem lại phiên này"
            >
              {s.level ? (
                <span className="history__dot" style={{ background: LEVEL_DOT[s.level] || 'var(--sage)' }} />
              ) : (
                <span className="history__dot" style={{ background: '#b6c7ba', boxShadow: 'none' }} />
              )}
              <span className="history__tx">
                <span className="history__title">{s.title}</span>
                <span className="history__when">{active && isReviewing ? 'Đang xem · ' : ''}{formatWhen(s.updatedAt || s.startedAt)}</span>
              </span>
              <DocIcon className="history__ic" width={16} height={16} />
            </button>
          )
        })}
      </div>

      <p className="history__foot">Phiên được lưu cục bộ trên máy bạn (nhật ký localStorage).</p>
    </aside>
  )
}
