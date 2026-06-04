import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createSession, handleUser } from './lib/triageEngine.js'
import { Cross, Restart } from './components/icons.jsx'
import Message from './components/Message.jsx'
import Typing from './components/Typing.jsx'
import QuickReplies from './components/QuickReplies.jsx'
import Composer from './components/Composer.jsx'
import WelcomeHero from './components/WelcomeHero.jsx'
import ProfileRail from './components/ProfileRail.jsx'
import TriageResult from './components/TriageResult.jsx'
import Emergency from './components/Emergency.jsx'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export default function App() {
  const [session, setSession] = useState(createSession)
  const [items, setItems] = useState([])
  const [quick, setQuick] = useState(null)
  const [typing, setTyping] = useState(false)
  const [busy, setBusy] = useState(false)
  const [emergency, setEmergency] = useState(null)

  const idRef = useRef(0)
  const preEmergency = useRef(null)
  const scrollRef = useRef(null)
  const started = items.some((i) => i.role === 'user')

  const push = useCallback((item) => {
    setItems((prev) => [...prev, { id: ++idRef.current, ...item }])
  }, [])

  // autoscroll
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [items, typing, quick])

  const playEvents = useCallback(
    async (events) => {
      setBusy(true)
      for (const ev of events) {
        setTyping(true)
        const dwell = ev.type === 'emergency' ? 380 : 620 + Math.min((ev.text || '').length, 80) * 6
        await sleep(dwell)
        setTyping(false)
        if (ev.type === 'emergency') {
          setEmergency({ flag: ev.flag })
          break
        }
        if (ev.type === 'message' || ev.type === 'question') {
          push({ type: 'message', role: 'ai', text: ev.text, confirm: ev.confirm })
          if (ev.type === 'question') setQuick(ev.quick || null)
        } else if (ev.type === 'result') {
          push({ type: 'result', triage: ev.triage })
        }
        await sleep(170)
      }
      setBusy(false)
    },
    [push],
  )

  const send = useCallback(
    (text) => {
      if (busy) return
      push({ type: 'message', role: 'user', text })
      setQuick(null)
      preEmergency.current = session
      const { session: ns, events } = handleUser(session, text)
      setSession(ns)
      playEvents(events)
    },
    [busy, session, push, playEvents],
  )

  const reset = useCallback(() => {
    setItems([])
    setSession(createSession())
    setQuick(null)
    setTyping(false)
    setBusy(false)
    setEmergency(null)
  }, [])

  const onBack = useCallback(() => {
    setEmergency(null)
    if (preEmergency.current) setSession(preEmergency.current)
  }, [])

  const onCta = useCallback(
    (cta) => {
      if (/bắt đầu lại/i.test(cta.label)) return reset()
      if (/lưu/i.test(cta.label)) {
        push({ type: 'message', role: 'ai', text: '✓ Đã lưu bản tóm tắt phiên này. Bạn có thể mang theo khi đi khám — gồm triệu chứng, thời gian, câu trả lời và lý do mình đưa ra khuyến nghị.' })
        return
      }
      if (/mô tả thêm/i.test(cta.label)) {
        push({ type: 'message', role: 'ai', text: 'Được — bạn cứ kể thêm bất kỳ chi tiết nào: thời gian, mức độ, hay bệnh nền / thuốc đang dùng. Mình sẽ cập nhật lại đánh giá.' })
        return
      }
      if (/bác sĩ/i.test(cta.label)) {
        push({ type: 'message', role: 'ai', text: 'Mình đã chuẩn bị sẵn bản tóm tắt để bạn chia sẻ với bác sĩ hoặc nhân viên y tế. Trong lúc đó, hãy theo dõi nếu triệu chứng nặng lên.' })
      }
    },
    [reset, push],
  )

  return (
    <>
      <div className="atmos">
        <div className="atmos__grain" />
        <div className="atmos__veil" />
      </div>

      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand__mark"><Cross /></div>
            <div>
              <div className="brand__name">An<em> · sức khỏe</em></div>
              <div className="brand__sub">Symptom Triage Assistant</div>
            </div>
          </div>
          <div className="topbar__right">
            <span className="pill-note"><span className="pulse-dot" /> Phiên đang hoạt động</span>
            {started && (
              <button className="restart-btn" onClick={reset}>
                <Restart /> Phiên mới
              </button>
            )}
          </div>
        </header>

        <div className="workspace">
          <ProfileRail session={session} />

          <main className="chat">
            <div className="chat__scroll" ref={scrollRef}>
              <div className="thread">
                {!started && <WelcomeHero onPick={send} />}

                <AnimatePresence initial={false}>
                  {items.map((it) =>
                    it.type === 'result' ? (
                      <motion.div key={it.id} layout>
                        <TriageResult triage={it.triage} onCta={onCta} />
                      </motion.div>
                    ) : (
                      <Message key={it.id} role={it.role} text={it.text} confirm={it.confirm} />
                    ),
                  )}
                </AnimatePresence>

                <AnimatePresence>{typing && <Typing key="typing" />}</AnimatePresence>

                <AnimatePresence>
                  {quick && !typing && !busy && (
                    <QuickReplies options={quick} onPick={send} />
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Composer onSend={send} disabled={busy} locked={!!emergency} />

            <AnimatePresence>
              {emergency && <Emergency flag={emergency.flag} onBack={onBack} />}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  )
}
