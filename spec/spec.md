# SPEC — Conversational Symptom Triage Assistant
> Track: Healthcare · App tham chiếu: Ada Health  
> Batch 02 · Day 06 · 04/06/2026

---

## 1. Bằng chứng

### Self-use evidence
Nhóm tự dùng Ada Health với 10 test cases (sốt + đau họng, ho + sốt, đau đầu, đau bụng, đau ngực, khó thở, chóng mặt, mệt mỏi, mô tả mơ hồ, nhiều triệu chứng cùng lúc).

| Observation | Path | Học được |
|---|---|---|
| Nhập "sốt + đau họng 2 ngày" → Ada hỏi 8 câu trắc nghiệm liên tiếp → kết quả Flu/COVID-19 | Happy | App hoạt động đúng nhưng flow cứng nhắc, user phải kiên nhẫn |
| Kết quả không giải thích tại sao Flu xếp trên COVID-19 | Low-confidence | User bối rối, không biết tin kết quả nào |
| Nhập "đau ngực + khó thở" → Ada vẫn hỏi tiếp trước khi escalate | Failure | Red flag không được ưu tiên — nguy hiểm trong ca cấp cứu |
| Kết quả sai → không có nút sửa, chỉ restart | Correction | Correction path hoàn toàn thiếu, learning signal = 0 |

### Nguồn bên ngoài nhóm

| Quote / Observation | Nguồn | Pain |
|---|---|---|
| "Too many questions before getting any useful info" | Google Play review — Ada Health | Questionnaire fatigue |
| "It gave me 7 possible conditions and I had no idea which to focus on" | Reddit r/medical | Kết quả không giải thích |
| "Told me to rest at home when I actually had appendicitis" | App Store review — WebMD | Undertriage nguy hiểm |
| ChatGPT/Gemini undertriage 52% ca cấp cứu (audit BMJ 2026) | BMJ audit 2026 | General chatbot không safe cho medical |
| Babylon Health phá sản sau khi bỏ sót dấu hiệu đau tim | Public case study | Red flag phải được xử lý đặc biệt |

**Competitor pattern học được:**
- Ada Health: adaptive questioning tốt, triage 8 mức rõ, nhưng cứng nhắc và không explain output
- WebMD: body-map click → chính xác chỉ 3–36%, bắt user tự phân loại y khoa
- MyVinmec: human-in-loop tốt, tích hợp đặt lịch, nhưng không có triage tự động
- Babylon (đã phá sản): overclaim "ngang bác sĩ" → bỏ sót đau tim → mất trust hoàn toàn

---

## 2. Lát cắt để build

```
Cho người có triệu chứng nhẹ–vừa chưa biết có nên đi khám không,
prototype dùng AI để thu thập triệu chứng qua hội thoại tự nhiên,
hỏi tối đa 3 lượt bổ sung, rồi phân loại triage:
  → Self-care / See Doctor / Emergency
kèm giải thích "Dựa trên: [triệu chứng X, Y, Z]",
và bắt buộc escalate ngay nếu phát hiện red flag (đau ngực, khó thở).
```

**Không build trong Day 06:**
- Chẩn đoán bệnh cụ thể (tên bệnh)
- Treatment plan / hướng dẫn điều trị
- Tích hợp đặt lịch thật
- Hồ sơ bệnh nhân / lịch sử triệu chứng

---

## 3. AI Product Canvas

### VALUE — Cho ai, đau ở đâu?

**User:** Người trưởng thành có triệu chứng nhẹ–vừa, chưa biết mức độ nghiêm trọng, muốn tự đánh giá trước khi quyết định có đi khám không.

**Pain cụ thể:** Symptom checker hiện tại (Ada, WebMD) bắt user trả lời 8–15 câu hỏi trắc nghiệm cứng nhắc → drop-off cao. Kết quả trả về danh sách bệnh không có giải thích → user không biết tin cái nào, mất trust.

**AI giải gì mà cách hiện tại chưa giải tốt:** Hiểu mô tả tự nhiên của user, chủ động hỏi đúng chỗ cần, giải thích lý do đằng sau kết quả — thay vì bắt user điền form y khoa.

### TRUST — Khi AI sai thì sao?

| Tình huống | Cách user nhận ra | Cách sửa |
|---|---|---|
| AI hiểu sai triệu chứng | AI xác nhận lại những gì đã hiểu trước khi ra kết quả | User sửa trực tiếp trong chat |
| Kết quả không đúng | Badge "Độ chắc chắn: Thấp" + liệt kê thông tin còn thiếu | Nút "Mô tả thêm" hoặc "Hỏi bác sĩ" |
| Red flag bị bỏ qua | Không xảy ra — red flag bypass toàn bộ flow, escalate ngay | — |
| User muốn report sai | Nút "Kết quả này chưa đúng" | Queue → human review trước khi update |

**Regain trust:** Mọi kết quả đều kèm disclaimer rõ ràng *"Đây không phải chẩn đoán y khoa"* và giải thích dựa trên triệu chứng nào.

### FEASIBILITY — Có đáng build không?

| Yếu tố | Đánh giá |
|---|---|
| Cost/request | ~$0.002–0.005 / session (Claude Haiku, ~500–1000 tokens) — chấp nhận được |
| Latency | < 2 giây / lượt hỏi — đủ cho chat UI |
| Data cần có | Chỉ cần system prompt + red flag keyword list — không cần dataset y khoa riêng |
| Rủi ro lớn nhất | Undertriage ca cấp cứu → mitigate bằng red flag bypass cứng |
| Ngưỡng kill | Nếu red flag detection sai > 5% trong test → dừng, không ship |

### LEARNING SIGNAL — Product tốt lên bằng cách nào?

User correction đi vào đâu: Nút "Kết quả này chưa đúng" → log vào queue → **human review bắt buộc** trước khi dùng để update bất cứ thứ gì.

Signal có giá trị: approve (user chấp nhận kết quả), retry (user mô tả lại), handoff (user bấm "Hỏi bác sĩ"), report sai.

**Không auto-learn:** Medical context — data poisoning từ user cố ý = nguy hiểm thật sự. Mọi correction phải qua moderation.

---

## 4. Augment hay Automate?

**Chọn: Augmentation + Conditional Automation cho red flag**

| Bước | Mức độ AI |
|---|---|
| Thu thập triệu chứng | Conditional Automation — AI chủ động dẫn dắt hội thoại, tự quyết câu hỏi tiếp theo |
| Phân loại triage | Augmentation — AI đề xuất mức độ + lý do, user là người quyết định có đi khám không |
| Red flag | Hard automation — AI bắt buộc escalate, không cho user override |

**Lý do không chọn full automation:** Sai thì hậu quả là sức khỏe con người — không thể hoàn tác. Human phải là decider cuối cùng.

**Human role:** Decider (với kết quả triage thông thường) + Rescuer (với correction queue)

---

## 5. Bốn đường đi

| Đường đi | Prototype thể hiện |
|---|---|
| **Happy** | User nhập "sốt 38.5°C + đau họng 2 ngày" → AI xác nhận đã hiểu → hỏi 1 câu (có ho không?) → ra kết quả "Gặp bác sĩ trong 24h" kèm giải thích "Dựa trên: sốt, đau họng, ho" |
| **Low-confidence** | User nhập "mệt và hơi chóng mặt" → AI hỏi 3 lượt → vẫn thiếu thông tin → hiển thị badge "Độ chắc chắn: Thấp" + liệt kê những gì còn thiếu + chip "Mô tả thêm" / "Hỏi bác sĩ" |
| **Failure** | User nhập "đau ngực + khó thở" → AI detect red flag → bypass toàn bộ flow → hiển thị ngay màn hình đỏ "Gọi 115 ngay" — không hỏi thêm câu nào |
| **Correction** | User nhập thêm "tôi đang dùng thuốc huyết áp" sau khi có kết quả → AI xác nhận lại và cập nhật đánh giá → giải thích "Kết quả thay đổi vì: bổ sung thông tin thuốc đang dùng" |

---

## 6. Failure modes nguy hiểm nhất

### Failure mode 1 — Undertriage ca cấp cứu (nguy hiểm nhất)
```
Khi: User dùng từ địa phương hoặc mô tả gián tiếp red flag
     ("tức ngực", "thở không ra hơi", "tim đập loạn")
AI có thể: không nhận ra keyword → đi vào flow thông thường
Hậu quả: chậm trễ cấp cứu → nguy hiểm tính mạng
Xử lý: mở rộng red flag list bằng synonym tiếng Việt + fallback
        "Nếu bạn cảm thấy nguy hiểm, hãy gọi 115 ngay"
        hiển thị ở mọi màn hình
```

### Failure mode 2 — Overtriage gây lo âu
```
Khi: User có health anxiety mô tả triệu chứng nhẹ nhưng nhiều
AI có thể: overweight số lượng triệu chứng → classify Emergency sai
Hậu quả: user hoảng loạn, đến cấp cứu không cần thiết
Xử lý: confidence level rõ ràng + ngôn ngữ giảm báo động
        + luôn kèm "Đây không phải chẩn đoán y khoa"
```

### Failure mode 3 — Data poisoning qua correction
```
Khi: User cố ý report sai hàng loạt để làm lệch kết quả
AI có thể: (nếu auto-learn) cập nhật rule sai → kết quả toàn hệ thống bị lệch
Hậu quả: nhiều user sau nhận kết quả sai
Xử lý: không auto-learn — mọi correction qua human review bắt buộc
        + rate limiting + anomaly detection trên correction pattern
```

---

## 7. Test plan & bằng chứng demo

### Test input 1 — Happy path
```
Input: "Tôi bị sốt 38 độ và đau họng từ hôm qua, có ho nhẹ"
Kỳ vọng:
  - AI xác nhận: sốt 38°C, đau họng, ho, 1 ngày
  - Hỏi thêm tối đa 1–2 câu (tiếp xúc ai không? có khó thở không?)
  - Kết quả: "Gặp bác sĩ trong 24h"
  - Lý do: "Dựa trên: sốt 38°C, đau họng, ho nhẹ"
  - Disclaimer xuất hiện
Pass khi: kết quả ra trong ≤ 3 lượt hỏi, có giải thích, có disclaimer
```

### Test input 2 — Red flag path
```
Input: "Tôi đau ngực dữ dội và khó thở"
Kỳ vọng:
  - AI KHÔNG hỏi thêm câu nào
  - Hiển thị ngay màn hình đỏ "Gọi 115 ngay"
  - Không có kết quả triage thông thường
Pass khi: màn hình đỏ xuất hiện trong < 1 giây, không có follow-up question
```

### Test input 3 — Low-confidence path
```
Input: "Tôi thấy không được khỏe lắm"
Kỳ vọng:
  - AI hỏi 3 lượt cụ thể hóa
  - Sau 3 lượt: badge "Độ chắc chắn: Thấp"
  - Liệt kê thông tin còn thiếu
  - 2 CTA: "Mô tả thêm" và "Hỏi bác sĩ"
Pass khi: không ra kết quả triage chắc chắn khi thiếu thông tin
```

**Bằng chứng giữ lại:** Screenshot từng path · System prompt version · Log kết quả test cases · Những đánh đổi đã cân nhắc (ghi trong `spec/decisions.md` nếu có)

---

## 8. Phân công

| Thành viên | Mã HV | Việc phụ trách | Giải thích được khi bị hỏi |
|---|---|---|---|
| Huyền | 2A202600650 | Build Frontend | UI flow trông thế nào? Component nào render path nào? |
| Kiên | 2A202600711 | Research / Evidence | Competitor làm gì? Pattern học được? |
| Dương | 2A202600823 | SPEC + Product Slice | Build slice là gì? Augment hay Automate? Tại sao? |
| Dũng | 2A202600906 | Prototype / Code | Code chạy thế nào? Prompt viết ra sao? |
| Lương | 2A202600881 | Test / Failure path | Failure mode chính? Prototype xử lý thế nào? |
| Thái | 2A202600968 | Research / Evidence | Tại sao chọn pain này? Evidence từ đâu? |
| Huỳnh | 2A202600805 | Test Final / Demo script / Repo / Deploy | Flow demo 5 phút? Ai nói gì? Thứ tự nào? |
