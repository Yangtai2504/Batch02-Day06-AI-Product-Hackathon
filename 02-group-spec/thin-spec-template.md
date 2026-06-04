# Template — Thin SPEC Cuối Day 05

Thin SPEC không phải PRD đầy đủ. Đây là bản cam kết đủ rõ để sáng Day 06 nhóm build ngay.

## 1. Track, product/app và user

**Track:** Healthcare
**Product/app thật:** Ada Health
**User cụ thể:** Người trưởng thành có triệu chứng nhẹ và chưa biết có nên đi khám hay không.
**Nhóm có phải user thật không? Nếu không, khác ở đâu?:** Một phần. Nhóm có thể đóng vai người dùng phổ thông, nhưng không đại diện cho bệnh nhân thực tế hoặc người có bệnh nền.

## 2. Evidence summary

| Evidence | Nguồn | User/pain nói lên điều gì? | SPEC phải đổi gì? |
| -------- | ------ | ------------------------------- | --------------------- |
|          |        |                                 |                       |
|          |        |                                 |                       |
|          |        |                                 |                       |

## 3. Pain statement

```text
User đang gặp khó ở bước khai báo và mô tả triệu chứng cho hệ thống đánh giá sức khỏe,

vì các symptom checker hiện tại thường yêu cầu trả lời nhiều câu hỏi dạng form hoặc chọn đáp án có sẵn,

dẫn tới quá trình tương tác kéo dài, thiếu tự nhiên và làm người dùng mất kiên nhẫn trước khi nhận được kết quả.

Bằng chứng chính là observation từ self-use với Ada Health: người dùng phải trải qua nhiều vòng câu hỏi lựa chọn liên tiếp trước khi nhận được đánh giá cuối cùng.
```

## 4. Build slice

```text
Cho người dùng đang muốn đánh giá tình trạng sức khỏe từ các triệu chứng họ gặp phải,

Prototype sẽ dùng AI để automate phân tích mô tả triệu chứng bằng ngôn ngữ tự nhiên, suy luận các thông tin còn thiếu và đặt câu hỏi tiếp theo phù hợp,

tTo ra danh sách các bệnh lý có khả năng liên quan cùng với giải thích ngắn gọn về các triệu chứng hỗ trợ cho nhận định đó,

Và xử lý trường hợp AI hiểu sai hoặc thiếu thông tin bằng cách xác nhận lại các triệu chứng đã suy luận, yêu cầu làm rõ các mô tả mơ hồ và hiển thị mức độ chắc chắn của kết quả.
```

## 5. Auto/Aug decision

Chọn một:

- [X] **Augmentation:** AI gợi ý/draft/phân loại, user quyết cuối.
- [ ] **Conditional automation:** AI tự làm trong case hẹp; case mơ hồ/rủi ro chuyển người.
- [ ] **Automation:** AI tự quyết và tự hành động.

**Lý do chọn:** Đây là bài toán sức khỏe có rủi ro cao. AI chỉ nên hỗ trợ ra quyết định.

**Human role:** Decider

## 6. Four paths

| Path               | Prototype phải thể hiện gì?                                                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Happy**          | User mô tả triệu chứng rõ ràng bằng ngôn ngữ tự nhiên. AI trích xuất đúng triệu chứng, hỏi thêm các thông tin còn thiếu, và đưa ra danh sách bệnh lý có khả năng liên quan cùng giải thích ngắn gọn. |
| **Low-confidence** | User cung cấp thông tin chưa đủ hoặc mô tả quá chung chung. AI nhận biết độ chắc chắn thấp và chủ động hỏi thêm để làm rõ thay vì đưa ra kết luận sớm.                                               |
| **Failure**        | AI hiểu sai triệu chứng hoặc suy luận sai hướng bệnh lý. Prototype cần thể hiện được tình huống này để đánh giá rủi ro và quan sát hậu quả.                                                          |
| **Correction**     | User phát hiện AI hiểu sai và chỉnh lại thông tin. AI cập nhật hồ sơ triệu chứng, điều chỉnh các bệnh lý khả dĩ và giải thích sự thay đổi trong kết quả.                                             |


## 7. Failure mode nguy hiểm nhất

```text
Nếu user mô tả triệu chứng bằng ngôn ngữ mơ hồ hoặc cách diễn đạt địa phương,

AI có thể suy luận sai triệu chứng cốt lõi và đưa ra các bệnh lý không phù hợp,

Hậu quả là người dùng nhận được đánh giá sai về tình trạng sức khỏe của mình và có thể trì hoãn việc tìm kiếm hỗ trợ y tế phù hợp.

Prototype sẽ xử lý bằng cách xác nhận lại các triệu chứng đã được AI trích xuất trước khi đưa ra kết quả và yêu cầu làm rõ khi độ chắc chắn thấp.

Owner kiểm thử path này là [Member phụ trách Test / Failure Path].
```

## 8. Owner plan cho sáng Day 06

| Thành viên | Việc phụ trách   | Bằng chứng cần có trong repo |
| ------------ | ------------------- | -------------------------------- |
|              | Research / evidence |                                  |
|              | SPEC                |                                  |
|              | Prototype           |                                  |
|              | Test / failure path |                                  |
|              | Demo script / repo  |                                  |
