interface NotificationService {
    send(message: string): Promise<void>;
}

class EmailService implements NotificationService {
    async send(message: string): Promise<void> {
        console.log(`Sending email: ${message}`);
    }
}

class SlackSDK {
    async postMessage(channel: string, text: string): Promise<void> {
        console.log(`Slack -> ${channel}: ${text}`);
    }
}

class SmsSDK {
    sendSms(
        phone: string,
        content: string
    ): void {
        console.log(
            `SMS -> ${phone}: ${content}`
        );
    }
}

class SlackAdapter implements NotificationService {
    constructor(
        private readonly sdk: SlackSDK,
        private readonly channel: string
    ) { }

    async send(message: string): Promise<void> {
        await this.sdk.postMessage(this.channel, message);
    }

}

class SmsAdapter implements NotificationService {
    constructor(
        private readonly smsSDK: SmsSDK,
        private readonly phoneNumber: string
    ) { }

    async send(message: string): Promise<void> {
        this.smsSDK.sendSms(this.phoneNumber, message);
    }
}

class NotificationManager {
    constructor(
        private readonly service: NotificationService
    ) { }

    async notify(message: string) {
        await this.service.send(message);
    }
}

// Slack v2
class SlackSDKV2 {
    async sendToChannel(data: {
        channelId: string;
        body: string;
    }): Promise<void> { }
}

class SlackSDKV2Adapter implements NotificationService {
    constructor(
        private readonly sdk: SlackSDKV2,
        private readonly channel: string
    ) { }

    async send(message: string): Promise<void> {
        await this.sdk.sendToChannel({
            channelId: this.channel,
            body: message
        });
    }

}

const notificationService: NotificationService =
    new SlackAdapter(
        new SlackSDK(),
        '#general',
    );

const manager: NotificationManager = new NotificationManager(notificationService);

await manager.notify('Server is down');

const smsNotificationService: NotificationService =
    new SmsAdapter(
        new SmsSDK(),
        '+84900000000'
    );

const smsManager: NotificationManager = new NotificationManager(smsNotificationService);

await smsManager.notify('Server is down');

export { };