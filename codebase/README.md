# An · Conversational Symptom Triage Assistant

> Trợ lý phân loại triệu chứng — mô tả bằng ngôn ngữ tự nhiên, An xác nhận lại điều đã
> hiểu, hỏi thêm tối đa 3 câu khi cần, rồi đưa ra **mức độ khẩn cấp + bước tiếp theo**
> kèm độ chắc chắn và lý do. Lấy cảm hứng & cải tiến từ Ada Health (track Healthcare).

Prototype frontend cho Day 06 — built với React + Vite + Framer Motion.

---

## Chạy thử

```bash
cd codebase
npm install
npm run dev          # mở http://localhost:5173
```

Build production: `npm run build` → `npm run preview`.

> Cần Node ≥ 18. Mặc định **không cần API key** — engine triage chạy bằng rule-based
> mô phỏng AI, đủ để demo cả 4 đường đi (xem dưới).

---

## 3 luồng demo (bấm thẳng các ví dụ ở màn hình chào)

| Đường đi | Nhập thử | An phản hồi |
|---|---|---|
| 🟡 **Happy** | `Tôi bị sốt 38.5 độ và đau họng 2 ngày nay` → bấm **Có** | Xác nhận triệu chứng → 1 câu hỏi → kết quả **Gặp bác sĩ trong 24h** (88% chắc chắn) + lý do + việc nên làm |
| 🟢 **Low-confidence** | `Tôi thấy mệt và hơi chóng mặt` → trả lời các câu hỏi | Nhận ra mô tả mơ hồ → giữ **Độ chắc chắn: Thấp**, liệt kê **thông tin còn thiếu**, khuyến nghị theo dõi tại nhà |
| 🔴 **Red flag** | `Tôi đau ngực và khó thở` | **Bypass toàn bộ flow** < 1s → màn hình đỏ **Gọi 115 ngay** + hướng dẫn trong lúc chờ |
| ↩️ **Correction** | (sau khi có kết quả) `thực ra tôi có bệnh nền tiểu đường` | Cập nhật hồ sơ, đánh giá lại và giải thích vì sao kết quả đổi |

Mọi kết quả luôn kèm disclaimer **"Đây không phải chẩn đoán y khoa"**.

---

## Thiết kế & kiến trúc

- **Aesthetic "Apothecary Calm"** — nền giấy ấm, xanh khuynh diệp (eucalyptus), tín hiệu
  triage xanh/hổ phách/đất nung. Font **Fraunces** (display serif) + **Be Vietnam Pro**
  (UI, hỗ trợ tiếng Việt đầy đủ) + **Spline Sans Mono** (nhãn). Tránh "AI slop".
- **Rail hồ sơ phiên** (trái): vòng tròn độ chắc chắn động, chip triệu chứng AI ghi nhận,
  thông tin còn thiếu, disclaimer — đúng yêu cầu "xác nhận lại điều AI đã hiểu" trong SPEC.
- **Khu chat** (phải): hội thoại, nút trả lời nhanh, kết quả triage in-thread, overlay
  khẩn cấp.

```
src/
├── App.jsx                  # state machine hội thoại, phát sự kiện engine
├── lib/triageEngine.js      # "AI" lõi: red-flag, trích xuất triệu chứng, confidence, 4 paths
├── components/
│   ├── ProfileRail.jsx      # vòng confidence + chip triệu chứng + thông tin thiếu
│   ├── TriageResult.jsx     # thẻ kết quả (3 mức triage)
│   ├── Emergency.jsx        # màn hình red-flag / Gọi 115
│   ├── Message / Typing / QuickReplies / Composer / WelcomeHero / icons
└── index.css                # design system (CSS variables, atmosphere, animations)
```

---

## Công cụ & API

| Hạng mục | Dùng gì |
|---|---|
| Framework | React 18 + Vite 5 |
| Animation | Framer Motion |
| Fonts | Fraunces · Be Vietnam Pro · Spline Sans Mono (Google Fonts) |
| AI (mặc định) | Rule-based triage engine mô phỏng — `src/lib/triageEngine.js` |
| AI thật | **Google Gemini** qua backend `backend/server.py` (xem dưới) |

### Chạy AI THẬT bằng Gemini (cho điểm "AI chạy thật trong ≥1 flow")

Backend Gemini đã có sẵn trong [`backend/`](backend/) — server HTTP `server.py` (chỉ dùng
stdlib cho tầng web) gọi Google Gemini qua `GeminiProvider`, trả về đúng schema
`{ events, profile }` mà frontend render.

```bash
# 1) Backend
cd codebase/backend
pip install -r requirements.txt          # cần google-genai
cp .env.example .env                      # rồi điền GEMINI_API_KEY
#   lấy key tại https://aistudio.google.com/apikey
python3 server.py                         # http://localhost:8787  (GET /health để kiểm tra)

# 2) Frontend — trong codebase/.env
echo 'VITE_TRIAGE_API_URL=http://localhost:8787/triage' > ../.env
npm run dev
```

- Khi đã trỏ `VITE_TRIAGE_API_URL`, toàn bộ hội thoại đi qua **Gemini thật**; chỉnh sửa
  triệu chứng cũng gửi correction về backend đánh giá lại.
- Backend tắt / thiếu key / trả JSON hỏng → frontend **tự fallback rule-based engine**,
  demo không bao giờ chết.
- Đổi model qua `GEMINI_MODEL` trong `backend/.env` (mặc định `gemini-2.0-flash`).
- **Không commit `.env`** (đã gitignore) — chỉ commit `.env.example`.

---

## Phân công

| Thành viên | Mã HV | Phần phụ trách |
|---|---|---|
| _(điền)_ | | Frontend / UI |
| _(điền)_ | | Triage engine / prompt |
| _(điền)_ | | Test 4 paths |
| _(điền)_ | | Demo script / repo |
| _(điền)_ | | Evidence / SPEC |

> Cập nhật bảng trên với mã học viên + họ tên thật của nhóm trước khi nộp.
