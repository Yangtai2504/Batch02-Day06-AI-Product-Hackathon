/* ============================================================
   sessionLog.js — nhật ký phiên (localStorage)
   ------------------------------------------------------------
   Lưu lại mỗi phiên hội thoại để hiển thị ở "Lịch sử phiên" và
   cho phép xem lại (review) trên UI. Giữ tối đa 30 phiên gần nhất.
   ============================================================ */
const KEY = 'an.sessions.v1'
const MAX = 30

export function loadSessions() {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function persist(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    /* localStorage đầy / bị chặn — bỏ qua, không làm vỡ app */
  }
}

/** Thêm mới hoặc cập nhật 1 phiên (theo id), đẩy lên đầu danh sách. */
export function upsertSession(session) {
  const list = loadSessions().filter((s) => s.id !== session.id)
  list.unshift(session)
  persist(list)
  return list
}

export function removeSession(id) {
  const list = loadSessions().filter((s) => s.id !== id)
  persist(list)
  return list
}

export function clearSessions() {
  persist([])
  return []
}

/** Nhãn thời gian thân thiện: "11:14 · Hôm nay" */
export function formatWhen(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const clock = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  const days = Math.floor((startOfDay(now) - startOfDay(d)) / 86400000)
  let day
  if (days <= 0) day = 'Hôm nay'
  else if (days === 1) day = 'Hôm qua'
  else if (days < 7) day = `${days} ngày trước`
  else day = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  return `${clock} · ${day}`
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}
