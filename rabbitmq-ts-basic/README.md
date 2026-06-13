# RabbitMQ TypeScript Basic Demo

Dự án mẫu cơ bản sử dụng **RabbitMQ** với **TypeScript** và thư viện `amqplib`. Dự án này minh họa cách thiết lập hệ thống queue (hàng đợi) hoàn chỉnh bao gồm Topic Exchange, Queues, Routing Keys, và cơ chế xử lý lỗi sử dụng Dead Letter Exchange (DLX) & Dead Letter Queue (DLQ).

---

## 📌 Các Tính Năng Demo

1. **Topic Exchange**: Định tuyến tin nhắn linh hoạt dựa trên wildcard pattern (`*`, `#`).
2. **Dead Letter Exchange (DLX) & Dead Letter Queue (DLQ)**:
   - Tự động chuyển hướng các tin nhắn lỗi (bị reject/nack hoặc hết hạn TTL) sang một Exchange lỗi (`pdf.dlx`) và hàng đợi lỗi (`pdf.failed`).
   - Định cấu hình `messageTtl` (Time-To-Live) là 1 ngày và giới hạn số lượng tin nhắn tối đa (`maxLength` là 100,000).
3. **Producer & Consumer**: Viết hoàn toàn bằng TypeScript, chạy trực tiếp bằng `tsx` không cần build thủ công.

---

## 🛠️ Cấu Trúc Hệ Thống RabbitMQ

```mermaid
graph TD
    %% Producers
    P1[Producer: pdf.export] -->|routing key: pdf.export| EX[Exchange: pdf.topic.exchange]
    P2[Producer: pdf.create.user] -->|routing key: pdf.create.user| EX

    %% Exchange & Routing
    EX -->|binding: pdf.#| Q1[Queue: pdf.export.queue]
    EX -->|binding: pdf.create.#| Q2[Queue: pdf.create.queue]

    %% Consumers
    Q1 -->|consume/ack| C1[Consumer 1]
    Q2 -->|consume/ack| C2[Consumer 2]

    %% Dead Letter Queue flow
    Q1 -.->|Lỗi / Nack / Hết hạn| DLX[Dead Letter Exchange: pdf.dlx]
    Q2 -.->|Lỗi / Nack / Hết hạn| DLX
    DLX -->|routing key: pdf.failed| DLQ[Queue Lỗi: pdf.failed]
```

### Chi tiết cấu hình:

- **Exchange chính**: `pdf.topic.exchange` (Type: `topic`)
- **Hàng đợi (Queues)**:
  - `pdf.export.queue` (Lắng nghe routing key khớp với `pdf.#`)
  - `pdf.create.queue` (Lắng nghe routing key khớp với `pdf.create.#`)
- **Dead Letter Exchange (DLX)**: `pdf.dlx`
- **Dead Letter Queue (DLQ)**: `pdf.failed` (Liên kết với DLX qua routing key `pdf.failed`)

---

## 📁 Cấu Trúc Thư Mục

- [main.ts](file:///Users/kaiser/code/learn/rabbitmq-ts-basic/main.ts): File chính đóng vai trò setup các Exchange, Queue, DLX/DLQ và thực hiện publish (gửi) tin nhắn mẫu lên RabbitMQ.
- [consumer.ts](file:///Users/kaiser/code/learn/rabbitmq-ts-basic/consumer.ts): File Consumer lắng nghe các tin nhắn từ các queue tương ứng, xử lý tin nhắn và gửi tín hiệu xác nhận (`ack` hoặc `nack`).
- [package.json](file:///Users/kaiser/code/learn/rabbitmq-ts-basic/package.json): Chứa thông tin cấu hình scripts chạy dự án bằng `pnpm` và dependencies (`amqplib`, `tsx`, `typescript`).
- [tsconfig.json](file:///Users/kaiser/code/learn/rabbitmq-ts-basic/tsconfig.json): File cấu hình TypeScript.

---

## 🚀 Hướng Dẫn Chạy Dự Án

### 1. Cài đặt các thư viện phụ thuộc

Dự án sử dụng trình quản lý gói `pnpm`. Cài đặt dependencies bằng lệnh:

```bash
pnpm install
```

### 2. Thiết lập cấu hình kết nối

Tạo file `.env` tại thư mục gốc của dự án `rabbitmq-ts-basic` dựa trên `.env.example`:

```env
RABBITMQ_URL=amqp://kasier:4S12H2afTB5y@46.250.231.89:5672
```

_(Nếu bạn chạy RabbitMQ cục bộ hoặc máy chủ khác, hãy đổi URL này về địa chỉ của bạn)._

### 3. Chạy Setup và Gửi tin nhắn (Producer)

Lệnh sau sẽ khởi chạy `main.ts`, thiết lập toàn bộ cấu hình Exchanges/Queues trên RabbitMQ và gửi 2 tin nhắn demo:

```bash
pnpm start
```

**Kết quả mong đợi:**

```text
RabbitMQ setup completed successfully!
```

### 4. Chạy Consumer để xử lý tin nhắn

Mở một terminal mới và chạy lệnh sau để lắng nghe và xử lý tin nhắn:

```bash
pnpm consumer
```

**Kết quả mong đợi:**

```text
Consumer is listening ...
Consumer is processing message ...  { reportId: 1, userId: 99 }
Consumer create is processing message ...  { reportId: 2, userId: 99 }
```

---

## 📝 Giải Thích Code Quan Trọng

### Cấu hình DLX & DLQ cho Queue chính:

Khi khởi tạo queue, chúng ta truyền các option `deadLetterExchange` và `deadLetterRoutingKey` để chỉ định nơi gửi tin nhắn khi xảy ra lỗi:

```typescript
await channel.assertQueue(PDF_QUEUE, {
  durable: true,
  messageTtl: 86400000, // Tin nhắn tồn tại tối đa 1 ngày
  deadLetterExchange: DLX_EXCHANGE, // Chuyển tới Exchange lỗi
  deadLetterRoutingKey: "pdf.failed", // Định tuyến với key pdf.failed
  maxLength: 100000, // Số lượng tin nhắn tối đa trong hàng đợi
});
```

### Xử lý Message Ack/Nack ở Consumer:

Nếu tin nhắn xử lý thành công, gọi `channel.ack(msg)`. Nếu xảy ra lỗi và không muốn thử lại ngay (tránh crash hoặc loop vô hạn), ta gọi `channel.nack(msg, false, false)` để đưa tin nhắn sang DLQ:

```typescript
try {
  const payload = JSON.parse(msg.content.toString());
  console.log("Processing...", payload);
  channel.ack(msg); // Thành công
} catch (error) {
  console.error("Error:", error);
  // Đưa sang DLQ: requeue = false
  channel.nack(msg, false, false);
}
```
