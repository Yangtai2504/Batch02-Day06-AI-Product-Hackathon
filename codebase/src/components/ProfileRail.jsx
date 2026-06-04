import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Info, Cross } from './icons.jsx'
import { makeSymptom } from '../lib/triageEngine.js'

const TIER = {
  none: { cls: 'none', text: 'Chưa đủ dữ liệu' },
  low: { cls: 'low', text: 'Độ chắc chắn: Thấp' },
  mid: { cls: 'mid', text: 'Độ chắc chắn: Vừa' },
  high: { cls: 'high', text: 'Độ chắc chắn: Cao' },
}
const RING_COLOR = { none: '#c3bca8', low: '#d99a45', mid: '#3e6b5c', high: '#4f8a5f' }

function useCountUp(target) {
  const [val, setVal] = useState(target)
  const ref = useRef(target)
  useEffect(() => {
    const from = ref.current
    const to = target
    const start = performance.now()
    const dur = 700
    let raf
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + (to - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
      else ref.current = to
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return val
}

function ConfidenceRing({ value, tier }) {
  const r = 40
  const c = 2 * Math.PI * r
  const shown = useCountUp(value)
  const offset = c - (c * value) / 100
  const color = RING_COLOR[tier] || RING_COLOR.none
  return (
    <div className="gauge__ring">
      <svg width="92" height="92" viewBox="0 0 92 92">
        <circle cx="46" cy="46" r={r} fill="none" stroke="#e8e1d1" strokeWidth="8" />
        <motion.circle
          cx="46" cy="46" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: offset, stroke: color }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="gauge__pct">
        <div>
          <div className="gauge__num">{shown}%</div>
          <div className="gauge__den">chắc chắn</div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileRail({ session, onEditSymptoms }) {
  const { symptoms = [], confidence = 0, confTier = 'none', missing = [], stage, facts = {} } = session
  const tier = TIER[confTier] || TIER.none
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  const removeSymptom = (label) => onEditSymptoms?.(symptoms.filter((s) => s.label !== label))
  const addSymptom = () => {
    const next = makeSymptom(draft)
    if (next && !symptoms.some((s) => s.label === next.label)) onEditSymptoms?.([...symptoms, next])
    setDraft('')
    setAdding(false)
  }
  const factChips = []
  if (facts.duration) factChips.push(`⏱ ${facts.duration}`)
  if (facts.temp) factChips.push(`🌡 ${facts.temp}°C`)
  if (facts.severity) factChips.push(`📊 ${facts.severity}`)
  if (facts.associated === true) factChips.push('＋ có triệu chứng kèm')
  if (facts.context) factChips.push('🩹 bệnh nền / thuốc')

  return (
    <aside className="rail">
      {/* Confidence */}
      <section className="panel">
        <p className="panel__label">Độ chắc chắn đánh giá</p>
        <div className="gauge">
          <ConfidenceRing value={confidence} tier={confTier} />
          <div className="gauge__meta">
            <div className="gauge__title">Hồ sơ phiên</div>
            <span className={`conf-badge ${tier.cls}`}>{tier.text}</span>
            <p className="gauge__hint">
              {stage === 'intake'
                ? 'Mô tả triệu chứng để mình bắt đầu dựng hồ sơ.'
                : confTier === 'low'
                ? 'Cần thêm thông tin trước khi kết luận chắc chắn.'
                : 'Độ chắc chắn tăng dần khi bạn cung cấp thêm chi tiết.'}
            </p>
          </div>
        </div>
      </section>

      {/* Symptoms — editable */}
      <section className="panel">
        <div className="panel__head">
          <p className="panel__label" style={{ margin: 0 }}>Triệu chứng AI ghi nhận</p>
          {symptoms.length > 0 && (
            <button className="edit-toggle" onClick={() => { setEditing((v) => !v); setAdding(false) }}>
              {editing ? 'Xong' : 'Sửa'}
            </button>
          )}
        </div>

        {symptoms.length === 0 ? (
          <p className="empty-hint">Chưa có triệu chứng nào. Những gì bạn mô tả sẽ hiện ở đây để bạn kiểm tra lại — và bạn có thể sửa nếu mình hiểu sai.</p>
        ) : (
          <>
            <div className="chips">
              <AnimatePresence>
                {symptoms.map((s) => (
                  <motion.span
                    key={s.label}
                    className={`chip ${editing ? 'is-editing' : ''}`}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  >
                    <span className="chip__dot" />
                    {s.label}
                    {editing && (
                      <button className="chip__x" onClick={() => removeSymptom(s.label)} aria-label={`Xoá ${s.label}`}>
                        <Cross width={12} height={12} style={{ transform: 'rotate(45deg)' }} />
                      </button>
                    )}
                  </motion.span>
                ))}
              </AnimatePresence>

              {editing && (adding ? (
                <span className="chip chip--input">
                  <input
                    autoFocus
                    value={draft}
                    placeholder="triệu chứng…"
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addSymptom(); if (e.key === 'Escape') { setAdding(false); setDraft('') } }}
                    onBlur={() => { if (draft.trim()) addSymptom(); else setAdding(false) }}
                  />
                </span>
              ) : (
                <button className="chip chip--add" onClick={() => setAdding(true)}>＋ Thêm</button>
              ))}
            </div>

            {editing && <p className="edit-hint">Bấm ✕ để xoá hoặc “＋ Thêm” nếu mình hiểu sai triệu chứng. An sẽ đánh giá lại.</p>}

            {factChips.length > 0 && (
              <div className="chips" style={{ marginTop: 10 }}>
                {factChips.map((f) => (
                  <motion.span
                    key={f}
                    className="chip chip--fact"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {f}
                  </motion.span>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Missing info — only when meaningful */}
      <AnimatePresence>
        {missing.length > 0 && confTier === 'low' && (
          <motion.section
            className="panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            style={{ overflow: 'hidden' }}
          >
            <p className="panel__label">Thông tin còn thiếu</p>
            <ul className="missing-list">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <section className="panel panel--disclaimer" style={{ padding: 0, border: 'none', boxShadow: 'none', background: 'none' }}>
        <div className="disclaimer">
          <Shield />
          <span>
            <strong>An không đưa ra chẩn đoán y khoa.</strong> Đây là công cụ phân loại mức độ khẩn cấp để giúp bạn
            quyết định bước tiếp theo. Khi nghi ngờ, hãy liên hệ nhân viên y tế.
          </span>
        </div>
      </section>
    </aside>
  )
}
