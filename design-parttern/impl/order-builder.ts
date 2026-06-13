export const PaymentMethod = {
    COD: 'COD',
    MOMO: 'MOMO',
    VNPAY: 'VNPAY',
} as const;

export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];

interface Order {
    customerName: string;
    customerPhone: string;

    shippingAddress?: string;

    items: {
        productId: string;
        quantity: number;
    }[];

    discountCode?: string;

    paymentMethod?: PaymentMethodType;

    note?: string;
}

class OrderBuilder {
    private order: Order;

    constructor() {
        this.order = {
            customerName: '',
            customerPhone: '',
            items: [],
        };
    }

    static create() {
        return new OrderBuilder();
    }

    static from(order: Order) {
        const builder = new OrderBuilder();

        builder.order = {
            ...order,
            items: [...order.items],
        };

        return builder;
    }

    customer(name: string, phone: string) {
        this.order.customerName = name;
        this.order.customerPhone = phone;
        return this;
    }

    addItem(productId: string, quantity: number) {
        if (quantity <= 0) {
            throw new Error('Invalid quantity');
        }

        this.order.items.push({ productId, quantity });
        return this;
    }

    shippingAddress(address: string) {
        this.order.shippingAddress = address;
        return this;
    }

    paymentMethod(method: PaymentMethodType) {
        this.order.paymentMethod = method;
        return this;
    }

    note(note: string) {
        this.order.note = note;
        return this;
    }

    discountCode(code: string) {
        this.order.discountCode = code;
        return this;
    }

    clearItems() {
        this.order.items = [];
        return this;
    }

    build(): Order {
        if (!this.order.customerName || !this.order.customerPhone) {
            throw new Error('Customer information is required');
        }

        if (this.order.items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        return {
            ...this.order,
            items: [...this.order.items],
        };
    }
}

const order = new OrderBuilder()
    .customer('Vo Tan Dat', '0909123456')
    .addItem('IPHONE15', 1)
    .addItem('AIRPODS', 2)
    .shippingAddress('123 Nguyen Hue')
    .discountCode('SALE50')
    .paymentMethod('MOMO')
    .note('Call before delivery')
    .build();

console.log(order);