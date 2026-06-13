// Product interface
interface INotification {
    send(userId: string, message: string): void;
}

// Concrate products
class EmailNotification implements INotification {
    send(userId: string, message: string): void {
        console.log("Sending email to", userId, "with message", message);
    }
}

class SMSNotification implements INotification {
    send(userId: string, message: string): void {
        console.log("Sending SMS to", userId, "with message", message);
    }
}

class ZNSNotification implements INotification {
    send(userId: string, message: string): void {
        console.log("Sending ZNS to", userId, "with message", message);
    }
}

abstract class NotificationFactory {
    // factory method
    public abstract createNotification(): INotification

    public sendNotification(userId: string, message: string) {
        // Logic dùng chung
        const notification = this.createNotification();
        notification.send(userId, message);
    }
}

class EmailNotificationFactory extends NotificationFactory {
    createNotification(): INotification {
        return new EmailNotification();
    }
}

class SMSNotificationFactory extends NotificationFactory {
    createNotification(): INotification {
        return new SMSNotification();
    }
}

class ZNSNotificationFactory extends NotificationFactory {
    createNotification(): INotification {
        return new ZNSNotification();
    }
}

export const NotificationType = {
    EMAIL: "email",
    SMS: "sms",
    ZNS: "zns",
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

class NotificationService {
    // Registry map giữa NotificationType và Factory tương ứng (Simple Factory pattern)
    private static readonly products: Record<NotificationType, new () => NotificationFactory> = {
        [NotificationType.EMAIL]: EmailNotificationFactory,
        [NotificationType.SMS]: SMSNotificationFactory,
        [NotificationType.ZNS]: ZNSNotificationFactory,
    };

    public sendNotification(type: NotificationType, userId: string, message: string): void {
        const ProductClass = NotificationService.products[type];
        if (!ProductClass) throw new Error("Unsupported");

        // Khởi tạo trực tiếp từ Class Reference
        const processor = new ProductClass();
        processor.sendNotification(userId, message);
    }
}

// --- KHÁCH HÀNG SỬ DỤNG (CLIENT DEMO) ---
const service = new NotificationService();

console.log("--- Gửi Email ---");
service.sendNotification(NotificationType.EMAIL, "user_01", "Chào mừng bạn đến với hệ thống!");

console.log("\n--- Gửi SMS ---");
service.sendNotification(NotificationType.SMS, "user_02", "Mã xác thực OTP của bạn là: 9988");

console.log("\n--- Gửi ZNS (Zalo) ---");
service.sendNotification(NotificationType.ZNS, "user_03", "Đơn hàng #789 đã được giao thành công.");