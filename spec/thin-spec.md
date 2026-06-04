# Template — Thin SPEC Cuối Day 05

Thin SPEC không phải PRD đầy đủ. Đây là bản cam kết đủ rõ để sáng Day 06 nhóm build ngay.

## 1. Track, product/app và user

**Track:** Healthcare
**Product/app thật:** Ada Health
**User cụ thể:** Người trưởng thành có triệu chứng nhẹ và chưa biết có nên đi khám hay không.
**Nhóm có phải user thật không? Nếu không, khác ở đâu?:** Một phần. Nhóm có thể đóng vai người dùng phổ thông, nhưng không đại diện cho bệnh nhân thực tế hoặc người có bệnh nền.

## 2. Evidence summary

| Evidence                                                                                                                                                                                  | Nguồn                       | User/pain nói lên điều gì?                                                                                                                                    | SPEC phải đổi gì?                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Người dùng đánh giá cao khi app giúp phân biệt mức độ nguy cấp và đưa ra bước tiếp theo thay vì chỉ liệt kê bệnh (P01, P02, P09, P10, P11)                        | Ada, WebMD reviews           | User không thực sự muốn "đoán bệnh"; họ muốn biết**có nguy hiểm không, có cần đi khám không, nên làm gì tiếp theo**.                   | Output phải ưu tiên**Triage + Next Action**. Kết quả gồm: mức độ khẩn cấp, lý do, dấu hiệu cần theo dõi và khuyến nghị hành động.                                        |
| User thích các câu hỏi follow-up chi tiết vì giúp kết quả đáng tin hơn (P06, P08) nhưng khó chịu khi phải trả lời lặp lại hoặc bị hỏi thiếu ngữ cảnh (N07, N13) | Ada, K Health, WebMD reviews | User chấp nhận trả lời nhiều câu hỏi nếu hiểu tại sao đang được hỏi. Điều họ ghét là câu hỏi lặp hoặc thiếu liên kết với câu trước. | Thiết kế**adaptive questioning**: mỗi câu hỏi phải dựa trên câu trả lời trước đó và giải thích ngắn gọn mục đích hỏi. Không yêu cầu nhập lại thông tin đã có. |
| Symptom checker dễ làm tăng lo âu khi đưa ra kết quả quá nghiêm trọng hoặc thiếu ngữ cảnh (N05, N10, N11)                                                                  | WebMD reviews, Reddit        | Người dùng health anxiety có thể bị cuốn vào vòng xoáy tự chẩn đoán và đánh giá quá mức nguy cơ.                                              | Thêm**confidence level**, low-confidence path và ngôn ngữ giảm báo động. Chỉ hiển thị cảnh báo nặng khi có đủ red flags hỗ trợ.                                             |
| User muốn kết quả đủ rõ để mang theo khi gặp bác sĩ hoặc specialist (P04, P11)                                                                                                | Ada, WebMD reviews           | Giá trị thực sự nằm ở việc giúp cuộc hẹn y tế hiệu quả hơn, không phải thay thế bác sĩ.                                                         | Tạo**Visit Summary**: tóm tắt triệu chứng, thời gian xuất hiện, câu trả lời quan trọng và lý do hệ thống đưa ra khuyến nghị.                                               |
| User có bệnh nền hoặc đang dùng thuốc cần được hỏi về bối cảnh sức khỏe cá nhân (P06, P12)                                                                             | Ada, WebMD reviews           | Kết quả chung chung dễ sai nếu không xét bệnh nền, thuốc đang dùng hoặc tiền sử sức khỏe.                                                          | Thu thập và tái sử dụng**Health Context Profile** (bệnh nền, thuốc, dị ứng, tuổi, giới tính) trong toàn bộ luồng đánh giá.                                                  |
| User mất niềm tin rất nhanh                                                                                                                                                            |                              |                                                                                                                                                                    |                                                                                                                                                                                                      |

## 3. Pain statement

```text
User đang gặp khó ở bước khai báo và mô tả triệu chứng cho hệ thống đánh giá sức khỏe,

vì các symptom checker hiện tại thường yêu cầu trả lời nhiều câu hỏi dạng form hoặc chọn đáp án có sẵn,

dẫn tới quá trình tương tác kéo dài, thiếu tự nhiên và làm người dùng mất kiên nhẫn trước khi nhận được kết quả.

Bằng chứng chính là observation từ self-use với Ada Health: người dùng phải trải qua nhiều vòng câu hỏi lựa chọn liên tiếp trước khi nhận được đánh giá cuối cùng.
```

## 4. Build slice

```text
Cho người dùng đang có triệu chứng sức khỏe và chưa biết có cần đi khám hay không,

Prototype sẽ dùng AI để thu thập triệu chứng bằng ngôn ngữ tự nhiên, suy luận các thông tin còn thiếu và đặt câu hỏi follow-up phù hợp,

Từ đó đưa ra:
- Mức độ khẩn cấp
- Lý do
- Confidence level
- Thông tin còn thiếu ảnh hưởng tới confidence
- Bước tiếp theo được khuyến nghị

Và xử lý trường hợp AI hiểu sai hoặc thiếu thông tin bằng cách xác nhận lại triệu chứng đã suy luận, yêu cầu làm rõ các mô tả mơ hồ và hiển thị mức độ chắc chắn của kết quả.
```

## 5. Auto/Aug decision

Chọn một:

- [X] **Augmentation:** AI gợi ý/draft/phân loại, user quyết cuối.
- [ ] **Conditional automation:** AI tự làm trong case hẹp; case mơ hồ/rủi ro chuyển người.
- [ ] **Automation:** AI tự quyết và tự hành động.

**Lý do chọn:** Đây là bài toán sức khỏe có rủi ro cao. AI chỉ nên hỗ trợ ra quyết định.

**Human role:** Decider

## 6. Four paths

| Path                     | Prototype phải thể hiện gì?                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Happy**          | User mô tả triệu chứng tương đối rõ ràng bằng ngôn ngữ tự nhiên. AI trích xuất đúng các triệu chứng chính, hỏi thêm một số câu follow-up cần thiết, sau đó đưa ra mức độ khẩn cấp, các khả năng liên quan, lý do cho nhận định và hành động tiếp theo được khuyến nghị (ví dụ: theo dõi tại nhà hoặc đặt lịch khám). |
| **Low-confidence** | User cung cấp thông tin chưa đủ, mô tả mơ hồ hoặc thiếu các chi tiết quan trọng như thời gian xuất hiện, mức độ đau hoặc bệnh nền. AI nhận biết độ chắc chắn thấp, giải thích còn thiếu thông tin gì và chủ động hỏi thêm thay vì đưa ra đánh giá sớm.                                                                               |
| **Failure**        | AI diễn giải sai triệu chứng hoặc đánh giá sai mức độ nguy hiểm của tình trạng sức khỏe. Kết quả dẫn đến khuyến nghị không phù hợp (ví dụ: đánh giá quá nhẹ hoặc quá nghiêm trọng). Prototype cần thể hiện tình huống này để quan sát rủi ro và đánh giá tác động tới quyết định của người dùng.                         |
| **Correction**     | User phát hiện AI hiểu sai hoặc bổ sung thông tin mới (ví dụ: có bệnh nền, đang dùng thuốc, hoặc triệu chứng thực tế khác với AI suy luận). AI cập nhật hồ sơ triệu chứng, điều chỉnh mức độ khẩn cấp và các khả năng liên quan, đồng thời giải thích rõ vì sao kết quả thay đổi.                                                  |

## 7. Failure mode nguy hiểm nhất

```text
Nếu user mô tả triệu chứng bằng ngôn ngữ mơ hồ hoặc cách diễn đạt địa phương,

AI có thể suy luận sai triệu chứng cốt lõi và đưa ra các bệnh lý không phù hợp,

Hậu quả là người dùng nhận được đánh giá sai về tình trạng sức khỏe của mình và có thể trì hoãn việc tìm kiếm hỗ trợ y tế phù hợp.

Prototype sẽ xử lý bằng cách xác nhận lại các triệu chứng đã được AI trích xuất trước khi đưa ra kết quả và yêu cầu làm rõ khi độ chắc chắn thấp.

Owner kiểm thử path này là [Member phụ trách Test / Failure Path].
```

## 8. Owner plan cho sáng Day 06

| Thành viên  | Việc phụ trách   | Bằng chứng cần có trong repo                                                                         |
| ------------- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| Huyền, Kiên | Research / evidence | `evidence_pack.md`, link review nguồn, evidence summary, pain statement được trace từ evidence    |
| Dương       | SPEC                | `thin_spec.md` hoàn chỉnh (Pain Statement, Build Slice, Four Paths, Failure Mode, Auto/Aug Decision) |
| Dũng         | Prototype           | Source code prototype, prompt/system prompt, UI screenshot                                               |
| Lương       | Test / failure path | Test cases cho Happy / Low-confidence / Failure / Correction, screenshot hoặc log kết quả từng path  |
| Huỳnh        | Demo script / repo  | `demo_script.md`, README hướng dẫn chạy, video demo ngắn hoặc slide demo                         |
