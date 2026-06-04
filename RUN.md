# Hướng dẫn chạy — An · Conversational Symptom Triage Assistant

Tài liệu cho người **clone repo về** chạy thử. Sản phẩm gồm **frontend React** (giao diện
chat) và **backend Gemini** (AI thật). Frontend chạy được độc lập bằng engine mô phỏng;
bật backend để có AI thật.

---

## 0. Yêu cầu

| Thành phần | Cần gì |
|---|---|
| Frontend | **Node.js ≥ 18** + npm — kiểm tra: `node -v`, `npm -v` |
| Backend (tùy chọn) | **Python ≥ 3.10** + `pip`, và một **GEMINI_API_KEY** |

> Lấy Gemini API key miễn phí tại: https://aistudio.google.com/apikey

---

## 1. Clone

```bash
git clone https://github.com/Yangtai2504/Batch02-Day06-AI-Product-Hackathon.git
cd Batch02-Day06-AI-Product-Hackathon
```

---

## 2. Chạy FRONTEND (bắt buộc)

```bash
cd codebase
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:5173**

> Chỉ với bước này, app đã chạy đầy đủ bằng **engine mô phỏng (rule-based)** — không cần
> API key. Đủ để demo cả 4 đường đi (Happy / Low-confidence / Red-flag / Correction).

### Thử nhanh (bấm ví dụ ở màn hình chào hoặc gõ vào ô chat)
| Luồng | Nhập |
|---|---|
| 🟡 Gặp bác sĩ | `Tôi bị sốt 38.5 độ và đau họng 2 ngày nay` → bấm **Có** |
| 🟢 Theo dõi tại nhà | `Tôi thấy mệt và hơi chóng mặt` → trả lời các câu hỏi |
| 🔴 Khẩn cấp | `Tôi đau ngực và khó thở` |
| ↩️ Sửa triệu chứng | Sau khi có kết quả, bấm **Sửa** ở khung "Triệu chứng AI ghi nhận" để xoá/thêm |

---

## 3. Chạy BACKEND Gemini (để có AI THẬT)

Mở **terminal thứ 2**:

```bash
cd codebase/backend
pip install -r requirements.txt          # cần google-genai
cp .env.example .env                      # rồi mở .env điền GEMINI_API_KEY=...
python3 server.py                         # http://localhost:8787
```

Kiểm tra backend sống chưa:
```bash
curl http://localhost:8787/health
# → {"ok": true, "model": "...", "hasKey": true}
```

### Nối frontend với backend
Tạo file `codebase/.env` (cùng cấp với `package.json`):
```bash
echo 'VITE_TRIAGE_API_URL=http://localhost:8787/triage' > codebase/.env
```
Rồi **chạy lại** `npm run dev` (Vite chỉ đọc `.env` lúc khởi động).

### Dấu hiệu Gemini đang chạy thật
- Mỗi tin nhắn AI hiện nhãn **`Gemini · ⏱ 1.2s`** (thời gian chạy) dưới bong bóng.
- Terminal backend in dòng `[triage] 1180ms · stage=... «...»` và ghi log vào
  `codebase/backend/logs/triage-YYYYMMDD.jsonl`.
- Khi backend tắt/lỗi, frontend **tự fallback** engine mô phỏng (nhãn đổi thành `demo`).

---

## 4. Tính năng đáng chú ý

- **Lịch sử phiên** (cột trái): mỗi cuộc trò chuyện được lưu (localStorage) kèm **thời gian
  chạy**; bấm vào một phiên cũ để **xem lại** (chế độ chỉ đọc), bấm **Phiên mới** để bắt đầu lại.
- **Guardrail**: đầu vào nghi spam/vô nghĩa/mâu thuẫn → AI hỏi **xác nhận lại** thay vì đoán;
  yêu cầu vi phạm đạo đức/pháp luật → **từ chối** và hướng tới hỗ trợ phù hợp.
- Mọi kết quả luôn kèm disclaimer **"không phải chẩn đoán y khoa"**.

---

## 5. Lỗi thường gặp

| Triệu chứng | Cách xử lý |
|---|---|
| `npm: command not found` | Chưa cài Node, hoặc Node cài cục bộ — thêm vào PATH trước khi gõ `npm` |
| AI vẫn trả lời kiểu mẫu, nhãn `demo` | Chưa tạo `codebase/.env`, hoặc chưa **restart** `npm run dev` sau khi tạo |
| `/triage` trả `Missing API key` | Chưa điền `GEMINI_API_KEY` trong `codebase/backend/.env` |
| Model báo lỗi không tồn tại | Đổi `GEMINI_MODEL` trong `backend/.env` (vd `gemini-2.0-flash`) |
| Cổng bận | Đổi cổng: frontend `npm run dev -- --port 5174`, backend sửa `TRIAGE_PORT` trong `.env` |

> ⚠️ **Không commit `.env`** (đã gitignore) — chứa API key. Chỉ chia sẻ `.env.example`.

Chi tiết kiến trúc & cách gắn AI: xem [`codebase/README.md`](codebase/README.md).
