# Member 3 — Competitor / Analog Research

> Phần này điền vào **mục 4 "Competitor / analog evidence"** của `evidence-pack-template.md`.
> Domain nhóm: **symptom checker / triage triệu chứng** (theo `idea.md`).
> Dữ liệu dưới đây tổng hợp từ nghiên cứu, review và bài báo public (xem mục Nguồn cuối file), **không phải tự bịa**. Phần nào là giả định/gián tiếp đều ghi rõ.

## Kịch bản test chuẩn (để so sánh công bằng)

Dùng cùng input trên mọi app:
- **Case A (rõ ràng):** Sốt + đau họng 2 ngày.
- **Case B (mơ hồ):** Mệt mỏi, hơi chóng mặt.
- **Case C (red flag):** Đau ngực lan ra tay trái + khó thở.

---

## Bảng competitor (điền vào mục 4 evidence-pack)

| App / mô hình | Họ xử lý task triage thế nào? (User flow) | Strength | Weakness | Pattern học được | Áp dụng trong 1 ngày? |
|---|---|---|---|---|---|
| **Ada Health** | Nhập triệu chứng dạng free-text → AI hỏi loạt câu hỏi trắc nghiệm thích ứng (Bayesian, hỏi ít nhất có thể) → ra báo cáo: mức độ khẩn + danh sách "possible causes". Có **8 mức triage** từ Self-care → Gọi cấp cứu. | Hỏi thích ứng, ít gây mệt; có thang triage rất chi tiết (8 mức); luôn kèm disclaimer "không phải chẩn đoán"; triage tốt hơn diagnosis. | Top-1 diagnosis ~54–70%, vẫn kém bác sĩ; onboarding hỏi nhiều câu profile gây nản; phụ thuộc user mô tả đúng. | **Adaptive questioning** + **thang triage rõ ràng nhiều mức** + disclaimer rõ. | ✅ Có — bắt chước được "hỏi 3 câu → phân 3 mức" ở dạng tối giản. |
| **WebMD Symptom Checker** | Chọn triệu chứng trên body-map + chọn vị trí, mức độ → ra danh sách bệnh khả dĩ. Tương tác kiểu form/click, không hội thoại. | Phổ biến, nhiều người biết; nội dung y khoa phong phú để đọc thêm. | Diagnosis chính xác chỉ **3–36%** tùy bệnh; rủi ro **false reassurance** (bỏ sót dấu hiệu nguy cấp) và **overtriage**; phụ thuộc nặng vào việc user chọn đúng vùng/mức độ. | Né kiểu "ép user tự phân loại y khoa"; cần AI gánh phần suy luận thay vì bắt user chọn. | ⚠️ Một phần — học cái **nên tránh** hơn là cái nên copy. |
| **MyVinmec (VN)** | App quản lý sức khỏe của Vinmec: hồ sơ y tế online, đặt lịch, Q&A hỏi bác sĩ, khám từ xa, QR check-in. AI hiện chủ yếu ở **chẩn đoán hình ảnh y khoa**, *không* phải symptom triage hội thoại. | Bối cảnh **Việt Nam thật**, có bác sĩ thật phía sau; tích hợp đặt lịch → hành động tiếp theo rõ. | Không có triage triệu chứng tự động kiểu Ada; AI tập trung imaging; muốn hỏi phải qua người. | **Human-in-the-loop** + nối thẳng tới hành động (đặt lịch/hỏi bác sĩ). | ✅ Học pattern "AI gợi ý → chuyển sang đặt lịch/bác sĩ thật". |
| **Babylon Health (đã phá sản 2023)** | Chatbot hội thoại triage: hỏi triệu chứng → khuyến nghị self-care / gặp GP / cấp cứu; nối với video GP. | Ý tưởng hội thoại triage + telehealth liền mạch (mô hình tham vọng). | Tuyên bố "ngang bác sĩ" bị bác bỏ; thực chất là **decision tree if/then**; **bỏ sót dấu hiệu đau tim**; chẩn đoán nhầm; rủi ro "gaming" để lấy lịch khám; lộ dữ liệu; cuối cùng phá sản. | Bài học **thất bại**: đừng overclaim, phải xử lý red-flag, đừng giả AI khi chỉ là rule. | ❌ Không build lại — dùng làm cảnh báo về failure/trust. |
| **ChatGPT / Gemini (chatbot tổng quát)** | User gõ tự do mô tả triệu chứng → trả lời hội thoại, giải thích, gợi ý nên làm gì. Không có thang triage chuẩn. | Linh hoạt, hiểu mô tả tự nhiên; tốt để **chuẩn bị trước/sau khi gặp bác sĩ**. | Audit BMJ 2026: ~50% câu trả lời health có vấn đề; **undertriage 52% ca cấp cứu**; "nhận ra dấu hiệu nguy hiểm trong giải thích nhưng vẫn trấn an"; nguồn dẫn chỉ ~40% đầy đủ, nhiều citation bịa. | Học **sức mạnh hội thoại tự nhiên** nhưng phải **bọc** bằng red-flag rule + dẫn nguồn ép buộc. | ✅ Có thể dùng LLM làm lõi, nhưng phải thêm guardrail. |

---

## Tổng hợp pattern cho nhóm (gợi ý cho Member 4 / 5)

**Pattern nên áp dụng:**
1. **Adaptive questioning ngắn** (Ada): hỏi 2–3 câu rồi mới kết luận, đừng hỏi cả profile.
2. **Thang triage rõ ràng** nhưng rút gọn: Emergency / See Doctor / Self-care (3 mức thay vì 8 của Ada).
3. **Red-flag rule cứng** (bài học Babylon + ChatGPT): đau ngực/khó thở → chuyển thẳng cấp cứu, không để AI "trấn an".
4. **Nối tới hành động thật** (MyVinmec): sau gợi ý → đặt lịch / gặp người thật.

**Pattern nên tránh (failure mode đối thủ):**
- False reassurance — bỏ sót ca nguy cấp (WebMD, ChatGPT, Babylon).
- Bắt user tự phân loại triệu chứng y khoa (WebMD body-map).
- Overclaim "ngang bác sĩ" mà không xử lý case khó (Babylon).
- Trả lời tự tin nhưng không dẫn nguồn / dẫn nguồn bịa (ChatGPT/Gemini).

**Khoảng trống cơ hội (gap) nhóm có thể nhắm:**
> Các đối thủ hoặc **quá phức tạp** (Ada 8 mức, onboarding dài) hoặc **quá lỏng/nguy hiểm** (ChatGPT không có guardrail). Cơ hội: một triage **hỏi 3 câu → 3 mức rõ ràng → có red-flag handling + dẫn nguồn**, đủ nhỏ để demo 3–5 phút.

---

## Nguồn (để kiểm chứng)

**Ada Health**
- https://pmc.ncbi.nlm.nih.gov/articles/PMC10582809/ — so sánh accuracy diagnosis & triage
- https://www.medrxiv.org/content/10.1101/2025.07.24.25332138v1.full.pdf — flow & 8 mức triage
- https://en.wikipedia.org/wiki/Ada_Health

**WebMD**
- https://pmc.ncbi.nlm.nih.gov/articles/PMC9385087/ — systematic review accuracy
- https://www.consumersearch.com/health-beauty/limitations-webmd-medical-symptom-checker — 5 hạn chế
- https://www.aao.org/eyenet/article/accuracy-of-the-webmd-symptom-checker

**MyVinmec**
- https://apps.apple.com/vn/app/myvinmec/id1494832536 — App Store
- https://play.google.com/store/apps/details?id=com.vinmec.onevinmec — Google Play
- https://www.vinmec.com/vie/chu-de/tri-tue-nhan-tao — AI của Vinmec (imaging)

**Babylon Health**
- https://theweek.com/health/babylon-health-the-failed-ai-wonder-app-that-dazzled-politicians
- https://en.wikipedia.org/wiki/Babylon_Health
- https://qz.com/1766418/how-using-babylon-healths-ai-symptom-checker-could-go-wrong

**ChatGPT / Gemini (health)**
- https://www.nature.com/articles/s41591-026-04297-7 — ChatGPT Health triage test
- https://www.digitalhealth.net/2026/02/chatgpt-health-fails-to-flag-over-50-of-medical-emergencies/
- https://teledirectmd.com/health-guides/ai-chatbot-medical-information-safety/ — audit BMJ 50% câu trả lời có vấn đề

---

*Member 3 — Competitor Research · Day 05 Batch 02. Số liệu mang tính tham khảo từ nguồn public; cần ghi rõ là "nguồn gián tiếp" trong evidence pack nếu nhóm chưa tự test lại trên app.*
