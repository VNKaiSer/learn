import amqp from 'amqplib';

const RABBIRMQ_URL = 'amqp://kasier:4S12H2afTB5y@46.250.231.89:5672';

// Khai báo tên rõ ràng
const PDF_EXCHANGE = 'pdf.topic.exchange'; // Exchange chính
const PDF_QUEUE = 'pdf.export.queue';       // Queue chính
const PDF_CREATE_QUEUE = 'pdf.create.queue'

const DLX_EXCHANGE = 'pdf.dlx';             // Exchange lỗi (DLX)
const DLQ_QUEUE = 'pdf.failed';             // Queue lỗi (DLQ)

const conn = await amqp.connect(RABBIRMQ_URL);
const channel = await conn.createChannel();

// ==========================================
// 1. CẤU HÌNH HỆ THỐNG XỬ LÝ LỖI (DLX / DLQ)
// ==========================================
// Tạo Exchange lỗi
await channel.assertExchange(DLX_EXCHANGE, 'topic', { durable: true });
// Tạo Queue lỗi
await channel.assertQueue(DLQ_QUEUE, { durable: true });
// Bind Queue lỗi vào Exchange lỗi với routing key 'pdf.failed'
await channel.bindQueue(DLQ_QUEUE, DLX_EXCHANGE, 'pdf.failed');


// ==========================================
// 2. CẤU HÌNH HỆ THỐNG CHÍNH (MAIN EX / QUEUE)
// ==========================================
// Tạo Exchange chính kiểu 'topic'
await channel.assertExchange(PDF_EXCHANGE, 'topic', { durable: true });

// Tạo Queue chính và cấu hình gửi tin nhắn lỗi về DLX_EXCHANGE
await channel.assertQueue(
    PDF_QUEUE,
    {
        durable: true,
        messageTtl: 86400000, // 1 ngày
        deadLetterExchange: DLX_EXCHANGE,   // Chuyển tới DLX khi lỗi
        deadLetterRoutingKey: 'pdf.failed',  // Gửi kèm routing key này
        maxLength: 100000,
    }
);

await channel.assertQueue(PDF_CREATE_QUEUE, {
    durable: true,
    messageTtl: 86400000, // 1 ngày
    deadLetterExchange: DLX_EXCHANGE,   // Chuyển tới DLX khi lỗi
    deadLetterRoutingKey: 'pdf.failed',  // Gửi kèm routing key này
    maxLength: 100000,
});
// Bind Queue chính vào Exchange chính với wildcard pattern 'pdf.#'
await channel.bindQueue(PDF_QUEUE, PDF_EXCHANGE, 'pdf.#');
await channel.bindQueue(PDF_CREATE_QUEUE, PDF_EXCHANGE, 'pdf.create.#');


channel.publish(
    PDF_EXCHANGE,
    'pdf.export',
    Buffer.from(
        JSON.stringify({
            reportId: 1,
            userId: 99,
        })
    ),
);

// Tin nhắn 2: Gửi đến exchange với key 'pdf.create.user'.
// Key này khớp với pattern 'pdf.create.*' -> đi vào queue 'pdf.create.queue'
channel.publish(
    PDF_EXCHANGE,
    'pdf.create.user',
    Buffer.from(
        JSON.stringify({
            reportId: 2,
            userId: 99,
        })
    ),
);


console.log('RabbitMQ setup completed successfully!');
