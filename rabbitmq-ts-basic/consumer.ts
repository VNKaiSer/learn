import amqp from 'amqplib';

const RABBIRMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

const PDF_EXCHANGE = 'pdf.topic.exchange'; // Exchange chính
const PDF_QUEUE = 'pdf.export.queue';       // Queue chính
const PDF_CREATE_QUEUE = 'pdf.create.queue'

const DLX_EXCHANGE = 'pdf.dlx';             // Exchange lỗi (DLX)
const DLQ_QUEUE = 'pdf.failed';             // Queue lỗi (DLQ)


const conn = await amqp.connect(RABBIRMQ_URL);
const channel = await conn.createChannel();

// Đảm bảo Queue đã được khởi tạo (assert) trước khi consume
await channel.assertQueue(
    PDF_QUEUE,
    {
        durable: true,
        messageTtl: 86400000, // 1 ngày
        deadLetterExchange: 'pdf.dlx',
        deadLetterRoutingKey: 'pdf.failed',
        maxLength: 100000,
    }
);

await channel.assertQueue(
    PDF_CREATE_QUEUE,
    {
        durable: true,
        messageTtl: 86400000, // 1 ngày
        deadLetterExchange: 'pdf.dlx',
        deadLetterRoutingKey: 'pdf.failed',
        maxLength: 100000,
    }
);

await channel.assertQueue(
    DLQ_QUEUE,
    {
        durable: true,
    }
);

// Lắng nghe đúng queue PDF_QUEUENAME
channel.consume(PDF_QUEUE, async (msg) => {
    if (!msg) return;

    try {
        const payload = JSON.parse(msg.content.toString());
        console.log("Consumer is processing message ... ", payload);

        // Xác nhận tin nhắn (phải truyền đối tượng msg gốc)
        channel.ack(msg);
    } catch (error) {
        console.error("Error processing message:", error);
        // Có thể reject tin nhắn nếu xử lý lỗi
        channel.nack(msg, false, false);
    }
});

channel.consume(
    PDF_CREATE_QUEUE,
    async (msg) => {
        if (!msg) return;

        try {
            const payload = JSON.parse(msg.content.toString());
            console.log("Consumer create is processing message ... ", payload);

            // Xác nhận tin nhắn (phải truyền đối tượng msg gốc)
            channel.ack(msg);
        } catch (error) {
            console.error("Error processing message:", error);
            // Có thể reject tin nhắn nếu xử lý lỗi
            channel.nack(msg, false, false);
        }
    }
)


console.log("Consumer is listening ... ");
