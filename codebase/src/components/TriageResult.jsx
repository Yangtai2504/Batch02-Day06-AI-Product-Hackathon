import { motion } from 'framer-motion'
import { Info, ArrowRight } from './icons.jsx'

export default function TriageResult({ triage, onCta }) {
  const { level, eyebrow, label, icon, reason, conditions = [], actions = [], missing = [], confTier, ctas = [] } = triage

  return (
    <motion.div
      className={`triage ${level}`}
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="triage__head">
        <div className="triage__level-eyebrow">
          📋 Kết quả đánh giá · {eyebrow}
        </div>
        <motion.div
          className="triage__level"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
        >
          <span className="ic">{icon}</span>
          {label}
        </motion.div>
      </div>

      <div className="triage__body">
        <div>
          <div className="triage__section-l">Vì sao có kết luận này</div>
          <p className="triage__reason" dangerouslySetInnerHTML={{ __html: reason.replace(/Dựa trên/g, '<b>Dựa trên</b>') }} />
        </div>

        {confTier === 'low' && missing.length > 0 && (
          <div>
            <div className="triage__section-l">Thông tin còn thiếu ảnh hưởng độ chắc chắn</div>
            <ul className="action-list">
              {missing.map((m) => (
                <li key={m}><span className="arrow" style={{ color: 'var(--amber)' }}>•</span>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {conditions.length > 0 && (
          <div>
            <div className="triage__section-l">Có thể liên quan đến</div>
            <ul className="cond-list">
              {conditions.map((c) => (
                <li key={c.name}><span className="dot" />{c.name}{c.pct && <span className="pct">{c.pct}</span>}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="triage__section-l">Bạn nên làm gì</div>
          <ul className="action-list">
            {actions.map((a) => (
              <li key={a}><span className="arrow"><ArrowRight width={15} height={15} /></span>{a}</li>
            ))}
          </ul>
        </div>

        <div className="triage__disc">
          <Info />
          <span>Đây <b>không phải chẩn đoán y khoa</b>. Kết quả chỉ mang tính tham khảo để giúp bạn quyết định bước tiếp theo.</span>
        </div>

        <div className="triage__foot">
          {ctas.map((c) => (
            <button key={c.label} className={`btn btn--${c.kind === 'primary' ? 'primary' : 'ghost'}`} onClick={() => onCta(c)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
