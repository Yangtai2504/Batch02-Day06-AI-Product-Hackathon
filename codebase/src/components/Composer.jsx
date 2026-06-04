import { useRef, useState, useEffect } from 'react'
import { Send } from './icons.jsx'

export default function Composer({ onSend, disabled, locked }) {
  const [value, setValue] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 130) + 'px'
  }, [value])

  const submit = () => {
    const v = value.trim()
    if (!v || disabled) return
    onSend(v)
    setValue('')
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={`composer ${locked ? 'is-locked' : ''}`}>
      <div className="composer__inner">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          placeholder="Mô tả triệu chứng của bạn bằng lời…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          disabled={locked}
        />
        <button className="send-btn" onClick={submit} disabled={!value.trim() || disabled} aria-label="Gửi">
          <Send />
        </button>
      </div>
      <div className="composer__hint">
        An là prototype hỗ trợ — không thay thế chẩn đoán y khoa · Enter để gửi
      </div>
    </div>
  )
}
