"""
An — Triage HTTP server (Gemini-backed)
========================================
Cầu nối giữa frontend React và Google Gemini cho luồng phân loại triệu chứng.

- POST /triage   body: { "history": [{role:"user"|"ai", text}], "message": "..." }
                 trả về: { "events": [...], "profile": {...} }  (đúng schema UI dùng)
- GET  /health   kiểm tra server + đã có GEMINI_API_KEY chưa

Chạy:
    cd codebase/backend
    pip install -r requirements.txt          # cần google-genai
    cp .env.example .env  &&  điền GEMINI_API_KEY
    python3 server.py                         # mặc định http://localhost:8787

Rồi ở frontend (codebase/.env):  VITE_TRIAGE_API_URL=http://localhost:8787/triage

Chỉ dùng stdlib cho tầng HTTP (không cần Flask). Gemini gọi qua GeminiProvider có sẵn.
"""
from __future__ import annotations

import json
import os
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from env_loader import load_dotenv
from providers.gemini_provider import GeminiProvider

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")

PORT = int(os.getenv("TRIAGE_PORT", "8787"))
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
PROVIDER = GeminiProvider(api_key_env="GEMINI_API_KEY", default_model=MODEL)

# ---------------------------------------------------------------------------
# System prompt — mã hoá toàn bộ quy tắc triage (theo spec/flow-core.md)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """\
Bạn là "An" — trợ lý phân loại triệu chứng (symptom triage) bằng tiếng Việt.
Bạn KHÔNG chẩn đoán bệnh; bạn phân loại mức độ khẩn cấp và gợi ý bước tiếp theo.

NGUYÊN TẮC:
1. Luôn XÁC NHẬN lại những triệu chứng đã hiểu trước khi hỏi tiếp hoặc ra kết quả.
2. Hỏi tối đa 3 lượt follow-up, MỖI LƯỢT CHỈ 1 CÂU, kèm 2-3 lựa chọn trả lời nhanh.
   Sau 3 lượt phải ra kết quả dù độ chắc chắn thấp.
3. RED FLAG (đau ngực, tức ngực, khó thở, đau đầu dữ dội đột ngột, liệt/tê nửa người/
   méo miệng, ngất/mất ý thức, nôn ra máu/đi ngoài ra máu, co giật) -> BỎ QUA toàn bộ
   flow, trả về NGAY 1 event type "emergency", KHÔNG hỏi thêm câu nào.
4. Ba mức triage: "green" = tự chăm sóc tại nhà; "amber" = nên gặp bác sĩ trong 24h;
   "red" = cần cấp cứu ngay.
5. Mô tả mơ hồ/thiếu thông tin (vd chỉ "mệt, chóng mặt") -> giữ confidence THẤP, liệt kê
   thông tin còn thiếu, ưu tiên hỏi thêm thay vì kết luận sớm.
6. Mọi kết quả luôn có lý do "Dựa trên: <triệu chứng>" và mang tính tham khảo.
7. Ngôn ngữ ấm áp, giảm lo âu; xưng "mình", gọi người dùng là "bạn".

NHIỆM VỤ: Dựa trên TOÀN BỘ hội thoại + tin nhắn mới nhất, quyết định bước kế tiếp và
TRẢ VỀ DUY NHẤT một JSON hợp lệ (không kèm chữ nào khác, không markdown) theo schema:

{
  "events": [
    // chọn các event phù hợp, theo thứ tự hiển thị:
    { "type": "message", "text": "...", "confirm": true|false },        // câu xác nhận/nói thường
    { "type": "question", "text": "câu hỏi", "quick": ["...","..."] },  // 1 câu hỏi + nút nhanh
    { "type": "result", "triage": {                                     // kết quả cuối
        "level": "green"|"amber"|"red",
        "eyebrow": "Khuyến nghị",
        "label": "Theo dõi & tự chăm sóc tại nhà" | "Nên gặp bác sĩ trong 24 giờ" | "Cần hỗ trợ y tế ngay",
        "icon": "🌿" | "🩺" | "🚨",
        "reason": "Dựa trên ... . Giải thích ngắn.",
        "conditions": [ {"name":"...", "pct":""} ],   // có thể rỗng; CHỈ liệt kê khả năng, không khẳng định
        "actions": ["việc nên làm 1","việc nên làm 2"],
        "missing": ["thông tin còn thiếu nếu confidence thấp"],
        "confTier": "low"|"mid"|"high",
        "confidence": 0-100,
        "ctas": [ {"label":"Lưu tóm tắt","kind":"primary"}, {"label":"Bắt đầu lại","kind":"ghost"} ]
    } },
    { "type": "emergency", "flag": "dấu hiệu nguy hiểm đã phát hiện" }   // CHỈ khi red flag
  ],
  "profile": {
    "stage": "intake"|"questioning"|"done"|"emergency",
    "symptoms": [ {"label":"Sốt","specific":true} ],   // triệu chứng đã trích xuất, viết hoa đầu
    "confidence": 0-100,
    "confTier": "none"|"low"|"mid"|"high",
    "missing": ["..."],
    "facts": { "duration": null|"2 ngày", "temp": null|38.5, "severity": null|"nhẹ", "associated": null|true|false, "context": null|"bệnh nền..." }
  }
}

QUY TẮC EVENT THEO TÌNH HUỐNG:
- Lượt đầu mô tả triệu chứng (chưa đủ): events = [message(confirm), question]. stage="questioning".
- Còn hỏi tiếp: events = [question]. stage="questioning".
- Đã đủ / hết 3 lượt: events = [message, result]. stage="done".
- Red flag bất kỳ lúc nào: events = [emergency]. stage="emergency".
Chỉ trả JSON. Không thêm lời dẫn.
"""


def _extract_json(text: str) -> dict | None:
    if not text:
        return None
    cleaned = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(cleaned)
    except Exception:
        pass
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(cleaned[start : end + 1])
        except Exception:
            return None
    return None


def _build_messages(history: list[dict], message: str) -> list[dict]:
    msgs: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in history or []:
        role = turn.get("role")
        text = (turn.get("text") or "").strip()
        if not text:
            continue
        msgs.append({"role": "assistant" if role == "ai" else "user", "content": text})
    msgs.append({"role": "user", "content": (message or "").strip()})
    return msgs


def _normalize(data: dict) -> dict:
    """Đảm bảo schema tối thiểu để UI không vỡ."""
    events = data.get("events") if isinstance(data.get("events"), list) else []
    profile = data.get("profile") if isinstance(data.get("profile"), dict) else {}
    profile.setdefault("stage", "questioning")
    profile.setdefault("symptoms", [])
    profile.setdefault("confidence", 0)
    profile.setdefault("confTier", "none")
    profile.setdefault("missing", [])
    profile.setdefault("facts", {})
    return {"events": events, "profile": profile}


def triage(payload: dict) -> dict:
    messages = _build_messages(payload.get("history", []), payload.get("message", ""))
    resp = PROVIDER.complete(messages, tools=None, model=MODEL, temperature=0.3)
    parsed = _extract_json(resp.text or "")
    if not parsed:
        raise ValueError(f"Gemini không trả JSON hợp lệ: {(resp.text or '')[:200]}")
    return _normalize(parsed)


class Handler(BaseHTTPRequestHandler):
    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code: int, body: dict) -> None:
        raw = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self._cors()
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        if self.path.rstrip("/") == "/health":
            self._json(200, {"ok": True, "model": MODEL, "hasKey": bool(os.getenv("GEMINI_API_KEY"))})
        else:
            self._json(404, {"error": "not_found"})

    def do_POST(self) -> None:  # noqa: N802
        if self.path.rstrip("/") != "/triage":
            self._json(404, {"error": "not_found"})
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length) or b"{}")
        except Exception as exc:
            self._json(400, {"error": "bad_request", "message": str(exc)})
            return
        try:
            self._json(200, triage(payload))
        except Exception as exc:
            # Trả lỗi để frontend tự fallback sang rule-based engine.
            self._json(500, {"error": type(exc).__name__, "message": str(exc)})

    def log_message(self, fmt: str, *args) -> None:  # bớt log ồn
        print(f"[triage] {self.address_string()} {fmt % args}")


def main() -> None:
    has_key = bool(os.getenv("GEMINI_API_KEY"))
    print(f"An triage server → http://localhost:{PORT}  (model={MODEL}, key={'có' if has_key else 'CHƯA cấu hình'})")
    if not has_key:
        print("  ⚠️  Chưa có GEMINI_API_KEY trong .env — /triage sẽ trả lỗi, frontend sẽ fallback rule-based.")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
