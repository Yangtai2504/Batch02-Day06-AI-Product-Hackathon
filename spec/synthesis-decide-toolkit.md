# Toolkit — Từ Evidence Đến Build Slice
Dùng sau khi nhóm đã có evidence. Mục tiêu là chốt một build slice đủ nhỏ cho Day 06.

---

## 1. Gom evidence thành cụm

| Cụm pain | Evidence hỗ trợ |
|---|---|
| **Questionnaire fatigue** | Ada Health yêu cầu trả lời chuỗi câu hỏi cứng nhắc → người dùng mất kiên nhẫn, dễ bỏ giữa chừng. WebMD bắt user tự chọn vùng/mức độ trên body-map → phụ thuộc quá nhiều vào kiến thức y khoa của user. |
| **Không hiểu lý do đằng sau kết quả** | Ada trả ra danh sách Flu + COVID-19 nhưng không giải thích rõ tại sao → user bối rối với nhiều khả năng bệnh cùng lúc, không biết tin cái nào. |
| **Red flag không được xử lý rõ ràng** | Babylon Health bỏ sót dấu hiệu đau tim → bị báo cáo, phá sản. ChatGPT/Gemini undertriage 52% ca cấp cứu. MyVinmec không có triage tự động → muốn hỏi phải qua người thật. |
| **AI tự tin nhưng không có guardrail** | General chatbot (ChatGPT/Gemini) hiểu mô tả tự nhiên tốt nhưng ~50% câu trả lời health có vấn đề, citation bịa ~60%. |

---

## 2. Viết insight

```text
User có triệu chứng nhẹ đến vừa không chỉ cần biết họ có thể mắc bệnh gì.
Họ thật ra cần một quy trình tự nhiên để mô tả tình trạng và hiểu được
lý do đằng sau từng đánh giá của hệ thống,
vì questionnaire cứng nhắc gây mệt mỏi và kết quả nhiều khả năng cùng lúc
gây bối rối, mất tin tưởng vào kết quả.
```

---

## 3. Viết opportunity

```text
Cơ hội là dùng AI để tự động trích xuất triệu chứng từ hội thoại tự nhiên,
chủ động hỏi bổ sung các thông tin còn thiếu, và giải thích rõ
triệu chứng nào dẫn tới từng nhận định,
giúp user hiểu được mức độ nghiêm trọng và hành động tiếp theo,
trong khi vẫn kiểm soát red flag / escalation bắt buộc sang người thật.
```

---

## 4. Chọn build slice

**Build slice:** Conversational Symptom Triage Assistant

| Câu hỏi | Đánh giá |
|---|---|
| User cụ thể chưa? | ✅ Người có triệu chứng nhẹ–vừa, chưa biết có nên đi khám không, dùng điện thoại mô tả tình trạng bằng ngôn ngữ tự nhiên. |
| Task đủ hẹp chưa? | ✅ Một session: mô tả triệu chứng → AI hỏi thêm tối đa 3 lượt → ra 1 trong 3 triage level. Demo được trong 3–5 phút. |
| AI decision rõ chưa? | ✅ AI phân loại: **Self-care / See Doctor / Emergency** — kèm giải thích triệu chứng nào dẫn tới kết quả đó. |
| Failure path rõ chưa? | ✅ Case mơ hồ: AI hỏi lại thay vì đoán. Case red flag (đau ngực + khó thở): bắt buộc escalate sang Emergency, không cho self-care. |
| Có evidence không? | ✅ Self-use Ada Health, competitor analysis 5 app, bài học từ Babylon failure. |

---

## 5. Quyết định: giữ, giảm scope, hay đổi hướng?

| Tình huống | Đánh giá | Quyết định |
|---|---|---|
| Evidence yếu, user mơ hồ | Evidence đủ từ self-use + 5 competitor | ✅ Giữ hướng |
| Ý tưởng quá rộng | "Conversational AI health assistant" quá rộng | ✅ Cắt xuống: chỉ build **symptom intake + triage level** — không build diagnosis, không build treatment plan |
| AI không cần thiết | Cần NLP để hiểu mô tả tự nhiên | ✅ AI cần thiết |
| Rủi ro cao | Medical context — red flag nguy hiểm | ✅ Dùng Conditional Automation: AI tự làm trong case rõ ràng, bắt buộc escalate khi có red flag keyword |
| Không demo được trong 1 ngày | 3 triage level + 1 happy path + 1 red flag path | ✅ Demo được ở Level 2 (mock prototype) |

---

## 6. Câu chốt cuối

```text
Dựa trên self-use Ada Health và phân tích 5 competitor (WebMD, MyVinmec, Babylon, ChatGPT/Gemini),
nhóm sẽ build Conversational Symptom Triage Assistant,
cho người có triệu chứng nhẹ–vừa chưa biết có nên đi khám không,
để giải quyết pain: questionnaire cứng nhắc gây mệt mỏi và kết quả không có giải thích gây mất tin tưởng,
bằng cách AI trích xuất triệu chứng từ hội thoại tự nhiên, hỏi tối đa 3 lượt bổ sung,
phân loại triage (Self-care / See Doctor / Emergency) kèm giải thích,
và sẽ test failure path: triệu chứng mơ hồ → AI hỏi lại,
và red flag (đau ngực + khó thở) → bắt buộc escalate Emergency, không cho phép self-care.
```

---

## 7. Backlog

Những thứ **không build trong Day 06**:

- Diagnosis cụ thể (tên bệnh) — rủi ro cao, cần validation y khoa
- Treatment plan / hướng dẫn điều trị
- Tích hợp đặt lịch khám thật
- Hồ sơ bệnh nhân / lịch sử triệu chứng
- Đa ngôn ngữ (ngoài tiếng Việt)
- Correction log / learning từ feedback user (cần moderation layer trước)
