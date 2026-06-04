/* ============================================================
   triageEngine.js
   ------------------------------------------------------------
   "AI" lõi của An — Conversational Symptom Triage Assistant.

   Mặc định: rule-based engine mô phỏng hành vi AI, đủ để demo
   4 paths trong SPEC (Happy / Low-confidence / Red-flag / Correction).

   Để gắn AI thật (Claude): xem callRealModel() ở cuối file.
   Toàn bộ UI chỉ phụ thuộc vào 2 hàm: createSession() và handleUser().
   ============================================================ */

const norm = (s) => (s || '').toLowerCase().normalize('NFC')

/* ---- Red flags: bypass toàn bộ flow, ra Emergency ngay ---- */
const RED_FLAGS = [
  { label: 'đau ngực / tức ngực', kw: ['đau ngực', 'tức ngực', 'đau thắt ngực', 'đau tim'] },
  { label: 'khó thở', kw: ['khó thở', 'không thở được', 'hụt hơi', 'thở gấp', 'thở dốc'] },
  { label: 'đau đầu dữ dội đột ngột', kw: ['đau đầu dữ dội', 'đau đầu đột ngột', 'đau đầu kinh khủng', 'đau đầu như búa bổ'] },
  { label: 'dấu hiệu đột quỵ', kw: ['liệt', 'tê nửa người', 'méo miệng', 'méo mồm', 'nói ngọng', 'yếu nửa người'] },
  { label: 'mất ý thức / ngất', kw: ['ngất', 'mất ý thức', 'bất tỉnh', 'ngất xỉu', 'lơ mơ'] },
  { label: 'chảy máu nặng', kw: ['nôn ra máu', 'ói ra máu', 'đi ngoài ra máu', 'đi cầu ra máu', 'ho ra máu'] },
  { label: 'co giật', kw: ['co giật', 'động kinh'] },
]

/* ---- Lexicon trích xuất triệu chứng ---- */
const SYMPTOMS = [
  { label: 'Sốt', kw: ['sốt', 'nóng sốt', 'sốt cao', 'ấm đầu', 'nóng người'], specific: true },
  { label: 'Đau họng', kw: ['đau họng', 'rát họng', 'viêm họng', 'đau cổ họng'], specific: true },
  { label: 'Ho', kw: ['ho', 'ho khan', 'ho có đờm'], specific: true },
  { label: 'Sổ mũi', kw: ['sổ mũi', 'nghẹt mũi', 'chảy mũi', 'nghẹt mũi'], specific: true },
  { label: 'Mệt mỏi', kw: ['mệt', 'mệt mỏi', 'uể oải', 'kiệt sức', 'đuối'], specific: false },
  { label: 'Chóng mặt', kw: ['chóng mặt', 'choáng', 'xây xẩm', 'hoa mắt'], specific: false },
  { label: 'Buồn nôn', kw: ['buồn nôn', 'nôn nao', 'lợm giọng'], specific: true },
  { label: 'Đau đầu', kw: ['đau đầu', 'nhức đầu'], specific: true },
  { label: 'Đau bụng', kw: ['đau bụng', 'đau dạ dày', 'quặn bụng'], specific: true },
  { label: 'Tiêu chảy', kw: ['tiêu chảy', 'đi ngoài', 'đi lỏng'], specific: true },
  { label: 'Đau lưng', kw: ['đau lưng', 'đau thắt lưng'], specific: true },
  { label: 'Phát ban', kw: ['phát ban', 'nổi mẩn', 'nổi mề đay', 'ngứa da'], specific: true },
]

/* ---- Bệnh nền / thuốc — dùng cho Correction path ---- */
const CONTEXT_KW = ['bệnh nền', 'tiểu đường', 'huyết áp', 'tim mạch', 'hen', 'mang thai', 'có thai', 'đang uống thuốc', 'dị ứng', 'thuốc']

const hasAny = (t, list) => list.some((k) => t.includes(k))

function detectRedFlag(text) {
  const t = norm(text)
  for (const f of RED_FLAGS) if (hasAny(t, f.kw)) return f.label
  return null
}

function extractSymptoms(text) {
  const t = norm(text)
  const found = []
  for (const s of SYMPTOMS) {
    if (hasAny(t, s.kw)) found.push({ label: s.label, specific: s.specific })
  }
  return found
}

function extractTemp(text) {
  const m = norm(text).match(/(\d{2}([.,]\d)?)\s*(độ|°|do\b)/)
  if (m) {
    const v = parseFloat(m[1].replace(',', '.'))
    if (v >= 35 && v <= 43) return v
  }
  if (/sốt cao|sốt rất cao/.test(norm(text))) return 39
  return null
}

function extractDuration(text) {
  const t = norm(text)
  if (/hôm nay|sáng nay|vài giờ|mới bị|vừa mới/.test(t)) return 'hôm nay'
  const m = t.match(/(\d+)\s*(ngày|hôm|tuần)/)
  if (m) {
    const n = parseInt(m[1], 10)
    const unit = m[2]
    if (unit === 'tuần') return `${n} tuần`
    return `${n} ngày`
  }
  if (/mấy ngày|vài ngày/.test(t)) return 'vài ngày'
  return null
}

/* ---- Session ---- */
export function createSession() {
  return {
    stage: 'intake', // intake → questioning → done → emergency
    symptoms: [],
    facts: { duration: null, severity: null, associated: null, temp: null, context: null },
    pendingDim: null,
    askedDims: [],
    turns: 0,
    confidence: 0,
    confTier: 'none',
    missing: [],
    redFlag: null,
    result: null,
  }
}

const uniqBy = (arr, key) => {
  const seen = new Set()
  return arr.filter((x) => (seen.has(x[key]) ? false : seen.add(x[key])))
}

/* ---- Confidence + missing-info ---- */
function score(s) {
  const specific = s.symptoms.filter((x) => x.specific).length
  const dims = [
    specific > 0,
    !!s.facts.duration,
    !!(s.facts.severity || s.facts.temp),
    s.facts.associated !== null,
  ]
  const known = dims.filter(Boolean).length
  let conf = 28 + known * 15 // 28..88
  if (s.facts.context) conf += 6
  conf = Math.max(20, Math.min(94, conf))
  // Mô tả chỉ toàn triệu chứng mơ hồ (mệt, chóng mặt…) → giữ độ chắc chắn ở mức Thấp
  // dù đã trả lời đủ câu hỏi: bản thân mô tả chưa đủ cụ thể để kết luận.
  if (specific === 0) conf = Math.min(conf, 46)

  const missing = []
  if (!s.facts.duration) missing.push('Thời gian xuất hiện triệu chứng')
  if (!s.facts.severity && !s.facts.temp) missing.push('Mức độ / cường độ triệu chứng')
  if (s.facts.associated === null) missing.push('Các triệu chứng đi kèm')
  if (specific === 0) missing.push('Mô tả cụ thể hơn (đau ở đâu, kiểu gì)')

  const tier = conf >= 72 ? 'high' : conf >= 50 ? 'mid' : 'low'
  return { conf, tier, missing }
}

/* ---- Câu hỏi follow-up theo dimension còn thiếu ---- */
function nextQuestion(s) {
  const asked = s.askedDims
  const has = (d) => asked.includes(d)
  const sl = s.symptoms.map((x) => x.label)
  const isResp = sl.includes('Sốt') || sl.includes('Đau họng') || sl.includes('Ho')

  if (!s.facts.duration && !has('duration')) {
    return {
      dim: 'duration',
      text: 'Để đánh giá chính xác hơn, bạn cho mình biết: triệu chứng này xuất hiện từ khi nào?',
      quick: ['Hôm nay', '1–2 ngày', 'Hơn 3 ngày'],
    }
  }
  if (isResp && s.facts.associated === null && !has('associated')) {
    return {
      dim: 'associated',
      text: 'Bạn có bị ho, sổ mũi hoặc nghẹt mũi kèm theo không?',
      quick: ['Có', 'Không'],
    }
  }
  if (!s.facts.severity && !s.facts.temp && !has('severity')) {
    const target = sl[0] || 'triệu chứng'
    return {
      dim: 'severity',
      text: `Mức độ ${target.toLowerCase()} của bạn hiện ở mức nào?`,
      quick: ['Nhẹ', 'Vừa', 'Nặng'],
    }
  }
  if (s.symptoms.some((x) => x.label === 'Chóng mặt') && s.facts.associated === null && !has('associated2')) {
    return {
      dim: 'associated2',
      text: 'Bạn có kèm buồn nôn hoặc choáng khi đứng dậy không?',
      quick: ['Có', 'Không'],
    }
  }
  return null
}

/* ---- Diễn giải câu trả lời follow-up ---- */
function applyAnswer(s, text) {
  const t = norm(text)
  const dim = s.pendingDim

  // user có thể bổ sung triệu chứng / red flag bất cứ lúc nào
  const more = extractSymptoms(text)
  if (more.length) s.symptoms = uniqBy([...s.symptoms, ...more], 'label')
  const dur = extractDuration(text)
  if (dur) s.facts.duration = dur
  const temp = extractTemp(text)
  if (temp) s.facts.temp = temp
  if (hasAny(t, CONTEXT_KW)) s.facts.context = text.trim()

  if (dim === 'duration') {
    s.facts.duration =
      s.facts.duration ||
      (/(hôm nay|hôm này)/.test(t) ? 'hôm nay' : /1.?2|một|hai/.test(t) ? '1–2 ngày' : /3|hơn|nhiều/.test(t) ? 'hơn 3 ngày' : 'vài ngày')
  } else if (dim === 'associated' || dim === 'associated2') {
    s.facts.associated = /có|đúng|ừ|phải|vâng/.test(t) && !/không/.test(t)
  } else if (dim === 'severity') {
    s.facts.severity = /nặng|dữ|nhiều/.test(t) ? 'nặng' : /vừa|trung/.test(t) ? 'vừa' : 'nhẹ'
  }
  s.pendingDim = null
}

/* ---- Quyết định triage level + dựng kết quả ---- */
function decideLevel(s) {
  const sl = s.symptoms.map((x) => x.label)
  const temp = s.facts.temp || 0
  const severe = s.facts.severity === 'nặng'
  const longDur = /hơn 3|tuần|nhiều/.test(s.facts.duration || '')
  const specific = s.symptoms.filter((x) => x.specific).length

  // See Doctor (amber): sốt + ≥1 triệu chứng hô hấp, hoặc sốt cao, hoặc nặng + kéo dài
  const respCombo = sl.includes('Sốt') && (sl.includes('Đau họng') || sl.includes('Ho') || s.facts.associated)
  if ((temp >= 38) || respCombo || severe || longDur) return 'amber'
  // mặc định Self-care (green)
  return 'green'
}

function buildResult(s) {
  const { conf, tier, missing } = score(s)
  s.confidence = conf
  s.confTier = tier
  s.missing = missing

  const level = decideLevel(s)
  const sl = s.symptoms.map((x) => x.label)
  const lowConf = tier === 'low'

  const symptomPhrase = () => {
    const parts = [...sl]
    if (s.facts.temp) {
      const i = parts.indexOf('Sốt')
      if (i >= 0) parts[i] = `sốt ${s.facts.temp}°C`
    }
    let p = parts.map((x, i) => (i === 0 || /°C/.test(x) ? x.toLowerCase() : x.toLowerCase())).join(', ')
    if (s.facts.duration) p += `, kéo dài ${s.facts.duration}`
    return p || 'các triệu chứng bạn mô tả'
  }

  const base = {
    level,
    confidence: conf,
    confTier: tier,
    symptoms: sl,
    facts: s.facts,
  }

  if (level === 'green') {
    return {
      ...base,
      eyebrow: 'Khuyến nghị',
      label: 'Theo dõi & tự chăm sóc tại nhà',
      icon: '🌿',
      reason: lowConf
        ? `Dựa trên thông tin hiện có (${symptomPhrase()}), triệu chứng chưa đủ rõ để đánh giá chắc chắn, nhưng chưa thấy dấu hiệu cần xử lý gấp.`
        : `Dựa trên ${symptomPhrase()}, các dấu hiệu hiện ở mức nhẹ và thường tự cải thiện.`,
      conditions: lowConf ? [] : [{ name: 'Mệt mỏi do căng thẳng / thiếu ngủ', pct: '' }, { name: 'Nhiễm siêu vi nhẹ', pct: '' }],
      actions: [
        'Nghỉ ngơi, uống đủ nước và theo dõi thêm 24–48h',
        'Ghi lại nếu triệu chứng nặng lên hoặc xuất hiện dấu hiệu mới',
        'Đến khám nếu kéo dài quá 3 ngày hoặc bạn thấy bất an',
      ],
      missing: lowConf ? missing : [],
      ctas: lowConf
        ? [{ label: 'Mô tả thêm', kind: 'ghost' }, { label: 'Lưu tóm tắt', kind: 'primary' }]
        : [{ label: 'Lưu tóm tắt', kind: 'primary' }, { label: 'Bắt đầu lại', kind: 'ghost' }],
    }
  }

  // amber — See Doctor
  return {
    ...base,
    eyebrow: 'Khuyến nghị',
    label: 'Nên gặp bác sĩ trong 24 giờ',
    icon: '🩺',
    reason: `Dựa trên ${symptomPhrase()}. Tổ hợp triệu chứng này nên được bác sĩ thăm khám để loại trừ nhiễm trùng cần điều trị.`,
    conditions: [
      { name: 'Cúm mùa (Influenza)', pct: '' },
      { name: 'Viêm họng do virus', pct: '' },
    ],
    actions: [
      'Uống nhiều nước, có thể dùng thuốc hạ sốt theo liều khuyến cáo',
      'Đặt lịch khám trong 24h, mang theo bản tóm tắt này',
      'Đến cấp cứu ngay nếu khó thở, sốt > 39.5°C hoặc lơ mơ',
    ],
    missing: lowConf ? missing : [],
    ctas: [{ label: 'Lưu tóm tắt cho bác sĩ', kind: 'primary' }, { label: 'Bắt đầu lại', kind: 'ghost' }],
  }
}

/* ---- Confirmation message khi vừa nhận intake ---- */
function confirmText(s) {
  const parts = []
  for (const sx of s.symptoms) {
    if (sx.label === 'Sốt' && s.facts.temp) parts.push(`sốt ${s.facts.temp}°C`)
    else parts.push(sx.label.toLowerCase())
  }
  let line = parts.join(', ')
  if (s.facts.duration) line += `, kéo dài ${s.facts.duration}`
  return line || 'những gì bạn vừa mô tả'
}

/* ============================================================
   API chính cho UI
   ============================================================ */
export function handleUser(prev, text) {
  const s = structuredClone(prev)

  // Red flag luôn được kiểm tra trước, ở mọi giai đoạn
  const flag = detectRedFlag(text)
  if (flag) {
    s.redFlag = flag
    s.stage = 'emergency'
    return { session: s, events: [{ type: 'emergency', flag }] }
  }

  /* ----- INTAKE: lượt mô tả đầu tiên ----- */
  if (s.stage === 'intake') {
    s.symptoms = extractSymptoms(text)
    s.facts.temp = extractTemp(text)
    s.facts.duration = extractDuration(text)
    if (hasAny(norm(text), CONTEXT_KW)) s.facts.context = text.trim()

    if (s.symptoms.length === 0) {
      // Không nhận ra triệu chứng → hỏi lại nhẹ nhàng
      return {
        session: s,
        events: [
          {
            type: 'question',
            text: 'Mình chưa nắm rõ triệu chứng của bạn. Bạn có thể mô tả cụ thể hơn không — ví dụ bạn thấy khó chịu ở đâu và như thế nào?',
            quick: ['Tôi bị sốt và đau họng', 'Tôi thấy mệt và chóng mặt'],
          },
        ],
      }
    }

    const sc = score(s)
    s.confidence = sc.conf
    s.confTier = sc.tier
    s.missing = sc.missing

    const confirm = {
      type: 'message',
      text: `Mình ghi nhận: ${confirmText(s)}.`,
      confirm: true,
    }

    const q = nextQuestion(s)
    if (q && s.turns < 3) {
      s.stage = 'questioning'
      s.pendingDim = q.dim
      s.askedDims = [...s.askedDims, q.dim]
      return { session: s, events: [confirm, { type: 'question', text: q.text, quick: q.quick }] }
    }
    // đủ thông tin ngay → ra kết quả
    s.stage = 'done'
    s.result = buildResult(s)
    return { session: s, events: [confirm, { type: 'result', triage: s.result }] }
  }

  /* ----- QUESTIONING: đang trong vòng hỏi follow-up ----- */
  if (s.stage === 'questioning') {
    applyAnswer(s, text)
    s.turns += 1

    const sc = score(s)
    s.confidence = sc.conf
    s.confTier = sc.tier
    s.missing = sc.missing

    const enough = sc.tier !== 'low' && s.facts.duration && (s.facts.associated !== null || s.facts.severity || s.facts.temp)
    const q = nextQuestion(s)

    if (q && s.turns < 3 && !enough) {
      s.pendingDim = q.dim
      s.askedDims = [...s.askedDims, q.dim]
      return { session: s, events: [{ type: 'question', text: q.text, quick: q.quick }] }
    }

    s.stage = 'done'
    s.result = buildResult(s)
    // Sau 3 lượt vẫn thiếu → kèm note low-confidence
    const pre =
      s.confTier === 'low'
        ? [{ type: 'message', text: 'Sau vài câu hỏi, thông tin vẫn chưa đủ để chắc chắn. Mình sẽ đưa ra đánh giá thận trọng kèm những gì còn thiếu:' }]
        : [{ type: 'message', text: 'Cảm ơn bạn. Mình đã đủ thông tin để đưa ra đánh giá:' }]
    return { session: s, events: [...pre, { type: 'result', triage: s.result }] }
  }

  /* ----- DONE: lượt sau khi đã có kết quả = Correction path ----- */
  if (s.stage === 'done') {
    const before = s.result ? s.result.level : null
    applyAnswer(s, text)
    // bổ sung triệu chứng mới nếu có
    const sc = score(s)
    s.confidence = sc.conf
    s.confTier = sc.tier
    s.missing = sc.missing
    s.result = buildResult(s)
    const changed = before !== s.result.level
    const note = s.facts.context
      ? `Đã cập nhật hồ sơ với bối cảnh sức khỏe bạn vừa cung cấp${changed ? ' — mức độ khuyến nghị đã thay đổi' : ''}. Mình đánh giá lại như sau:`
      : `Đã cập nhật theo thông tin mới${changed ? ' — mức độ khuyến nghị đã thay đổi' : ''}:`
    return { session: s, events: [{ type: 'message', text: note }, { type: 'result', triage: s.result }] }
  }

  return { session: s, events: [] }
}

/* ============================================================
   Chỉnh sửa triệu chứng thủ công (Correction path từ UI)
   ------------------------------------------------------------
   Khi user thấy AI ghi nhận sai → xoá / thêm chip triệu chứng.
   Nếu đã có kết quả thì đánh giá lại và giải thích.
   ============================================================ */
export function makeSymptom(label) {
  const clean = (label || '').trim()
  if (!clean) return null
  const n = norm(clean)
  const found = SYMPTOMS.find((s) => norm(s.label) === n || s.kw.some((k) => n.includes(k)))
  if (found) return { label: found.label, specific: found.specific }
  return { label: clean.charAt(0).toUpperCase() + clean.slice(1), specific: true }
}

export function setSymptoms(prev, symptoms) {
  const s = structuredClone(prev)
  s.symptoms = uniqBy(symptoms.filter(Boolean), 'label')
  // Đồng bộ fact với chip: bỏ "Sốt" thì xoá luôn nhiệt độ kèm theo
  if (!s.symptoms.some((x) => x.label === 'Sốt')) s.facts.temp = null
  const sc = score(s)
  s.confidence = sc.conf
  s.confTier = sc.tier
  s.missing = sc.missing

  if (s.stage === 'done') {
    const before = s.result ? s.result.level : null
    s.result = buildResult(s)
    const changed = before !== s.result.level
    return {
      session: s,
      events: [
        {
          type: 'message',
          text: `Bạn vừa chỉnh sửa lại danh sách triệu chứng. Mình đã cập nhật hồ sơ${changed ? ' — mức độ khuyến nghị thay đổi theo' : ''} và đánh giá lại:`,
        },
        { type: 'result', triage: s.result },
      ],
    }
  }
  return { session: s, events: [] }
}

/* ============================================================
   Gắn AI THẬT (Google Gemini) — tùy chọn
   ------------------------------------------------------------
   Frontend KHÔNG giữ API key. Backend Gemini nằm ở codebase/backend/
   (server.py) — gọi Gemini với system prompt triage và trả về cùng
   schema { events, profile } mà UI dùng.

   Bật: trỏ VITE_TRIAGE_API_URL → http://localhost:8787/triage
   (xem .env.example và backend/README chi tiết). Lỗi → App tự fallback.
   ============================================================ */
export async function callRealModel(history, userText) {
  const url = import.meta.env.VITE_TRIAGE_API_URL
  if (!url) throw new Error('VITE_TRIAGE_API_URL chưa cấu hình — đang dùng rule-based engine.')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, message: userText }),
  })
  if (!res.ok) throw new Error('Triage API error ' + res.status)
  return res.json() // kỳ vọng: { events: [...] } cùng schema với handleUser
}
