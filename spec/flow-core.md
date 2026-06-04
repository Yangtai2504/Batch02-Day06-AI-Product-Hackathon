# Flow Lõi — Conversational Symptom Triage Assistant
> Dùng để dựng mockup Day 06 · Viết bởi Member 4

**1 flow lõi, 3 paths phải demo được tại Checkpoint 1.**

---

## Màn hình 0 — Entry

```
┌─────────────────────────────────────┐
│  🩺 Symptom Checker                 │
│                                     │
│  Bạn đang cảm thấy thế nào?         │
│  Mô tả triệu chứng bằng ngôn ngữ   │
│  tự nhiên — tôi sẽ hỏi thêm nếu    │
│  cần.                               │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Nhập triệu chứng...         │    │
│  └─────────────────────────────┘    │
│                    [Bắt đầu →]      │
└─────────────────────────────────────┘
```

**Logic:** Không questionnaire, không dropdown. User gõ tự do.

---

## PATH A — Happy Path

> Trigger: User mô tả triệu chứng rõ ràng, đủ thông tin

### Bước A1 — User nhập
```
User: "Tôi bị sốt 38.5 độ và đau họng 2 ngày nay"
```

### Bước A2 — AI xác nhận đã hiểu + hỏi 1 câu bổ sung
```
AI: "Tôi ghi nhận: sốt 38.5°C, đau họng, kéo dài 2 ngày.

     Bạn có bị ho hoặc sổ mũi không?"

[Có]  [Không]  [Gõ thêm...]
```
> Tối đa 3 lượt hỏi. Mỗi câu hỏi chỉ hỏi 1 thứ. Có nút chọn nhanh.

### Bước A3 — User trả lời
```
User: [Có]
```

### Bước A4 — AI ra kết quả triage
```
┌─────────────────────────────────────┐
│  📋 Kết quả đánh giá                │
│                                     │
│  ⚠️  GẶP BÁC SĨ TRONG 24H           │
│  ────────────────────────────────   │
│  Dựa trên: sốt 38.5°C + đau họng   │
│  + ho, kéo dài 2 ngày.             │
│                                     │
│  Có thể liên quan đến:              │
│  • Cúm mùa (Influenza)              │
│  • Viêm họng do virus               │
│                                     │
│  Nên làm gì:                        │
│  → Uống nhiều nước, hạ sốt          │
│  → Đặt lịch khám nếu sốt tăng      │
│     hoặc khó thở                    │
│                                     │
│  ⚠️ Đây không phải chẩn đoán y khoa │
│                                     │
│  [Bắt đầu lại]  [Lưu kết quả]      │
└─────────────────────────────────────┘
```

**Kết quả luôn gồm:** Triage level + Lý do (dựa trên triệu chứng nào) + Next action + Disclaimer.

---

## PATH B — Low-confidence Path

> Trigger: User mô tả mơ hồ, thiếu thông tin

### Bước B1 — User nhập
```
User: "Tôi thấy mệt và hơi chóng mặt"
```

### Bước B2 — AI nhận ra thiếu thông tin, hỏi lại
```
AI: "Tôi ghi nhận: mệt mỏi, chóng mặt.

     Để đánh giá chính xác hơn, bạn có thể
     cho tôi biết thêm:

     Triệu chứng này xuất hiện từ khi nào?"

[Hôm nay]  [1-2 ngày]  [Hơn 3 ngày]
```

### Bước B3 — Sau 3 lượt hỏi vẫn chưa đủ → hiện uncertainty
```
┌─────────────────────────────────────┐
│  📋 Kết quả đánh giá                │
│                                     │
│  🔵 THEO DÕI TẠI NHÀ               │
│  Độ chắc chắn: Thấp                │
│  ────────────────────────────────   │
│  Dựa trên thông tin hiện có,        │
│  triệu chứng chưa đủ rõ để         │
│  đánh giá chính xác.               │
│                                     │
│  Thông tin còn thiếu:               │
│  • Thời gian xuất hiện              │
│  • Mức độ chóng mặt                 │
│  • Có kèm buồn nôn không           │
│                                     │
│  Nên làm gì:                        │
│  → Theo dõi thêm 24h               │
│  → Đến khám nếu triệu chứng        │
│     nặng hơn hoặc thêm mới         │
│                                     │
│  [Mô tả thêm]  [Hỏi bác sĩ]       │
└─────────────────────────────────────┘
```

**Khác Happy path:** Có badge "Độ chắc chắn: Thấp" + liệt kê thông tin còn thiếu + 2 CTA rõ ràng.

---

## PATH C — Red Flag Path

> Trigger: User nhập triệu chứng nguy hiểm

### Bước C1 — User nhập
```
User: "Tôi đau ngực và khó thở"
```

### Bước C2 — AI detect red flag, BYPASS toàn bộ flow
```
┌─────────────────────────────────────┐
│  🚨 CẦN HỖ TRỢ Y TẾ NGAY          │
│                                     │
│  Triệu chứng bạn mô tả có thể      │
│  là dấu hiệu nguy hiểm cần         │
│  xử lý ngay lập tức.               │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📞  GỌI 115               │    │
│  └─────────────────────────────┘    │
│                                     │
│  Hoặc nhờ người đưa đến cấp cứu   │
│  gần nhất ngay bây giờ.            │
│                                     │
│  ────────────────────────────────   │
│  Trong lúc chờ:                     │
│  • Ngồi hoặc nằm yên               │
│  • Không tự lái xe                  │
│  • Nới lỏng quần áo                │
│                                     │
│  [Gọi 115 ngay]                    │
└─────────────────────────────────────┘
```

**Quan trọng:** Không hỏi thêm câu nào. Hiển thị ngay trong <1 giây. Nút "Gọi 115" là action duy nhất ưu tiên.

---

## Red flag keywords cần detect

| Từ khóa | Hành động |
|---|---|
| đau ngực, tức ngực | → PATH C ngay |
| khó thở, không thở được | → PATH C ngay |
| đau đầu dữ dội đột ngột | → PATH C ngay |
| liệt, tê nửa người, méo miệng | → PATH C ngay |
| mất ý thức, ngất xỉu | → PATH C ngay |
| nôn ra máu, đi ngoài ra máu nhiều | → PATH C ngay |

---

## Triage levels — 3 mức

| Level | Màu | Label | Ý nghĩa |
|---|---|---|---|
| Self-care | 🟢 Xanh | Tự chăm sóc tại nhà | Theo dõi, không cần đi khám ngay |
| See Doctor | 🟡 Vàng | Gặp bác sĩ trong 24h | Cần khám nhưng không khẩn cấp |
| Emergency | 🔴 Đỏ | Cần hỗ trợ y tế ngay | Gọi 115 hoặc đến cấp cứu |

---

## Quy tắc AI — Dũng cần implement

1. **Luôn xác nhận lại** những gì AI đã hiểu trước khi ra kết quả
2. **Tối đa 3 lượt hỏi** — sau 3 lượt phải ra kết quả dù confidence thấp
3. **Mỗi lượt hỏi 1 câu duy nhất** — không hỏi nhiều thứ cùng lúc
4. **Red flag → bypass ngay** — không hỏi thêm dù chỉ 1 câu
5. **Luôn kèm disclaimer** "Đây không phải chẩn đoán y khoa" ở mọi kết quả
6. **Kết quả luôn có lý do** — "Dựa trên: [triệu chứng X, Y, Z]"

---

## Checklist Checkpoint 1 — 11:00

- [ ] Màn hình 0: ô nhập text tự do
- [ ] PATH A: happy flow end-to-end chạy được (có thể hardcode)
- [ ] PATH B: hiển thị được badge "Độ chắc chắn: Thấp" + thông tin còn thiếu
- [ ] PATH C: detect "đau ngực" hoặc "khó thở" → hiện màn hình đỏ ngay
- [ ] Disclaimer xuất hiện ở mọi kết quả
