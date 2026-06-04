# Template — Evidence Pack

Nộp kèm thin SPEC cuối Day 05.

## 1. Nhóm và track

**Tên nhóm:**  
**Track:**  
**Product/app đã chọn:**  
**Build slice đang nghĩ:**  

## 2. Self-use evidence

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| Nhập triệu chứng sốt + đau họng | ![Ada Health screenshot](../Screenshot/z7896448348863_d28c4c4805b978972aa5969b2438a838.jpg) | Low-confidence / Correction | App hỏi thêm nhiều câu, một số câu không liên quan nhưng tổng thể dự đoán khá chính xác. |
| Kết quả gợi ý Flu và COVID-19 | ![Ada Health screenshot](../Screenshot/z7896448337313_ecb3ddb2dba72a62710363546399c88c.jpg) | Low-confidence / Failure | Dự đoán gần đúng nhưng có thể tạo ra lo lắng với nhiều khả năng bệnh, cần rõ ràng hơn. |


## 3. User / review / social evidence

Nguồn có thể là review App Store/Play, group, comment, phỏng vấn nhanh, hoặc nguồn public khác.

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

Nếu chưa có nguồn ngoài nhóm, ghi rõ:

```text
Đây là giả định. Nhóm sẽ kiểm bằng [cách] trước checkpoint M1 Day 06.
```

## 4. Competitor / analog evidence

> Chi tiết đầy đủ (strength/weakness + nguồn kiểm chứng) ở `member3-competitor-research.md`.

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| **Ada Health** | Nhập triệu chứng free-text → AI hỏi loạt câu trắc nghiệm thích ứng → báo cáo mức khẩn + possible causes; có 8 mức triage. | Adaptive questioning + thang triage rõ ràng + disclaimer "không phải chẩn đoán". | ✅ Có — rút gọn thành "hỏi 3 câu → 3 mức". |
| **WebMD Symptom Checker** | Chọn triệu chứng trên body-map + vị trí/mức độ → danh sách bệnh khả dĩ (form/click, không hội thoại). | Né kiểu bắt user tự phân loại y khoa; AI nên gánh phần suy luận. Accuracy chỉ 3–36% → tránh false reassurance/overtriage. | ⚠️ Một phần — học cái nên tránh. |
| **MyVinmec (VN)** | App quản lý sức khỏe Vinmec: hồ sơ, đặt lịch, Q&A bác sĩ, khám từ xa; AI chủ yếu ở chẩn đoán hình ảnh, không triage hội thoại. | Human-in-the-loop + nối thẳng tới hành động (đặt lịch/bác sĩ thật). | ✅ Học pattern "AI gợi ý → chuyển đặt lịch/người thật". |
| **Babylon Health (đã phá sản 2023)** | Chatbot hội thoại triage → self-care / gặp GP / cấp cứu, nối video GP. | Bài học thất bại: đừng overclaim, phải xử lý red-flag, đừng giả AI khi chỉ là rule. Từng bỏ sót dấu hiệu đau tim. | ❌ Không build lại — dùng làm cảnh báo failure/trust. |
| **ChatGPT / Gemini (chatbot tổng quát)** | User gõ tự do mô tả triệu chứng → trả lời hội thoại, gợi ý nên làm gì; không có thang triage chuẩn. | Sức mạnh hội thoại tự nhiên, nhưng phải bọc bằng red-flag rule + ép dẫn nguồn (audit 2026: undertriage 52% ca cấp cứu). | ✅ Dùng LLM làm lõi + thêm guardrail. |

## 5. Evidence -> Insight

```text
Evidence nổi bật nhất:

Insight:
User không chỉ gặp [surface problem].
Thật ra họ cần [deeper need / decision support / trust / recovery].

Opportunity:
AI có thể giúp bằng cách [augment/automate hành động hẹp].
```

## 6. Evidence đổi SPEC như thế nào?

- [ ] Đổi user chính.
- [ ] Đổi pain statement.
- [ ] Đổi build slice.
- [ ] Đổi Auto/Aug decision.
- [ ] Đổi 4 paths.
- [ ] Đổi failure mode.
- [ ] Đổi owner/test plan.

Ghi rõ 1-2 thay đổi quan trọng:

```text
Trước evidence, nhóm định...
Sau evidence, nhóm đổi thành...
Lý do:
```