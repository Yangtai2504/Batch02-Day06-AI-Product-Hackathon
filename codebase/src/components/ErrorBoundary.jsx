import { Component } from 'react'

/* ============================================================
   ErrorBoundary — chặn lỗi render để app không "trắng màn hình".
   Hiện màn hình sự cố thân thiện + traceback (gập lại) để debug,
   và lưu lỗi gần nhất vào localStorage ('an.lastError').
   ============================================================ */
export default class ErrorBoundary extends Component {
  state = { error: null, stack: null }

  static getDerivedStateFromError(error) {
    return { error, stack: error?.stack || null }
  }

  componentDidCatch(error, info) {
    const componentStack = info?.componentStack || ''
    // Ghi log ra console + localStorage để dò vết
    console.error('[An] App lỗi:', error)
    console.error('[An] Component stack:', componentStack)
    this.setState({ stack: (error?.stack || '') + '\n\nComponent stack:' + componentStack })
    try {
      localStorage.setItem(
        'an.lastError',
        JSON.stringify({ message: String(error?.message || error), stack: error?.stack, componentStack, at: Date.now() }),
      )
    } catch {
      /* localStorage không khả dụng — bỏ qua */
    }
  }

  reload = () => window.location.reload()

  resetSessions = () => {
    try {
      localStorage.removeItem('an.sessions.v1')
      localStorage.removeItem('an.lastError')
    } catch {
      /* bỏ qua */
    }
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="errbox">
        <div className="errbox__atmos" />
        <div className="errbox__card">
          <div className="errbox__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4l9 16H3l9-16z" /><path d="M12 10v4M12 17.4v.2" />
            </svg>
          </div>
          <h1 className="errbox__title">An gặp sự cố</h1>
          <p className="errbox__msg">
            Giao diện vừa gặp một lỗi không mong muốn. Dữ liệu phiên của bạn vẫn được lưu cục bộ.
            Bạn có thể tải lại trang để tiếp tục.
          </p>

          <div className="errbox__row">
            <button className="errbox__btn errbox__btn--primary" onClick={this.reload}>Tải lại trang</button>
            <button className="errbox__btn" onClick={this.resetSessions}>Xoá nhật ký phiên & tải lại</button>
          </div>

          <details className="errbox__details">
            <summary>Chi tiết lỗi (traceback)</summary>
            <pre>{String(this.state.error?.message || this.state.error)}
{this.state.stack}</pre>
          </details>
        </div>
      </div>
    )
  }
}
