interface Notification {
    send(userId: string, message: string): void;
}

class EmailNotification implements Notification {
    send(userId: string, message: string): void {
        console.log("Sending email to", userId, "with message", message);
    }
}

class SMSNotification implements Notification {
    send(userId: string, message: string): void {
        console.log("Sending SMS to", userId, "with message", message);
    }
}

class ZNSNotification implements Notification {
    send(userId: string, message: string): void {
        console.log("Sending ZNS to", userId, "with message", message);
    }
}

abstract class NotificationFactory {
    public abstract createNotification(): Notification

    public sendNotification(userId: string, message: string) {
        const notification = this.createNotification();
        notification.send(userId, message);
    }
}

class EmailNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new EmailNotification();
    }
}

class SMSNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new SMSNotification();
    }
}

class ZNSNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new ZNSNotification();
    }
}
