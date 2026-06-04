# Test Report — An Symptom Triage Assistant

> Báo cáo kiểm thử từ bộ test cases của Lương

- **Người thực hiện:** Huỳnh
- **Ngày:** 04/06/2026

---

## Kết quả test chi tiết

| Test | Input tóm tắt | Kết quả thực tế | Pass/Fail | Ghi chú |
|---|---|---|---|---|
| A1 | Sốt + đau họng + ho | AI xác nhận sốt 38°C, đau họng, ho nhẹ, 1 ngày; hỏi thêm 1-2 câu; kết quả 🟡 See Doctor; có explanation và disclaimer | PASS | UI hiển thị đúng nội dung và disclaimer |
| A2-L2 | Ho nhiều, sốt nhẹ | Kết quả vẫn 🟡 See Doctor, nhất quán với A1 | PASS | Diễn đạt khác nhưng luồng triage ổn |
| A2-L3 | Người nóng, nuốt đau | Kết quả vẫn 🟡 See Doctor, nhất quán | PASS | Hệ thống nhận diện tốt triệu chứng tiếng Việt |
| A2-L4 | Fever + sore throat (EN) | Kết quả vẫn 🟡 See Doctor | PASS | Hỗ trợ diễn đạt tiếng Anh đơn giản |
| B1 | Không được khỏe | AI hỏi tối đa 3 lượt, sau đó hiển thị badge ⚠️ Độ chắc chắn: Thấp và liệt kê thông tin còn thiếu | PASS | Không có kết quả chắc chắn khi dữ liệu mơ hồ |
| B2 | Mệt + chóng mặt (4 turns) | Sau 3 lượt vẫn ra kết quả với explanation; confidence thấp | PASS | Luồng low-confidence hoạt động như thiết kế |
| C1 | Đau ngực + khó thở | Màn hình đỏ Emergency xuất hiện ngay, có hướng dẫn "Gọi 115 ngay" | PASS | Không có follow-up question trước khi escalate |
| C2-1 | Tức ngực | Escalate ngay | PASS | Red flag được phát hiện qua synonym tiếng Việt |
| C2-2 | Thở không ra hơi | Escalate ngay | PASS | Đúng yêu cầu red flag |
| C2-3 | Tim đập loạn | Escalate ngay | PASS | Red flag trigger chính xác |
| C2-4 | Đau đầu như sét đánh | Escalate ngay | PASS | Dấu hiệu đột quỵ được nhận diện |
| C2-5 | Nửa người tê | Escalate ngay | PASS | Red flag nghiêm trọng được phát hiện |
| C3 | Sốt + tức ngực (mixed) | Màn hình đỏ Emergency ngay, không triage thường | PASS | Tức ngực ưu tiên khởi tạo emergency |
| D1 | Sốt + ho → thêm thuốc | AI cập nhật đánh giá với giải thích do thông tin thuốc ức chế miễn dịch | PASS | Cho thấy tính năng correction hoạt động |
| D2 | Đau bụng → sửa = đầy hơi | AI xác nhận lại, điều chỉnh đúng, không giữ nguyên hiểu sai | PASS | Khả năng sửa lỗi ban đầu hoạt động tốt |

---

## Tổng hợp

- **Tổng số test:** 15
- **Pass:** 15
- **Fail:** 0
- **Red flag pass rate:** 6/6

## Ghi chú nghiệm thu

1. Luồng **PATH A** (Happy Path) chạy đúng và cung cấp explanation + disclaimer.
2. Luồng **PATH B** (Low-confidence) không tự đưa ra kết luận chắc chắn khi thông tin thiếu.
3. Luồng **PATH C** (Red Flag) đạt 100% với 6/6 trường hợp, không hỏi thêm trước khi escalate.
4. Luồng **PATH D** (Correction) cho phép người dùng cập nhật thông tin và điều chỉnh kết quả.

## Kết luận

Prototype đã đáp ứng đầy đủ các yêu cầu kiểm thử theo bộ test case của Lương. Mọi test case đều đạt PASS và hệ thống có thể trình diễn được cả 4 luồng: Happy Path, Low-confidence Path, Red Flag Path và Correction Path.

---

## Evidence

- Đã lưu ảnh chụp màn hình từng test case theo yêu cầu.
- Nên đính kèm screenshot vào báo cáo nếu nộp cùng slide/demo.
