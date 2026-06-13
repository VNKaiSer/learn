/**
 * 1. Bối cảnh
    Bạn đang xây dựng module tính phí giao hàng cho một nền tảng TMĐT. Hệ thống cần hỗ trợ nhiều đơn vị vận chuyển khác nhau. Mỗi đơn vị có quy trình tính phí và thời gian dự kiến hoàn toàn khác nhau dựa trên trọng lượng hàng hóa (weight tính bằng kg).

    2. Các đơn vị vận chuyển hiện tại:
    Giao Hàng Tiết Kiệm (GHTK):

    Phí cố định: 20,000 VND.

    Phí theo trọng lượng: Thêm 5,000 VND cho mỗi kg.

    Thời gian giao hàng: Luôn là 3 ngày.

    Giao Hàng Nhanh (GHN):

    Phí cố định: 30,000 VND.

    Phí theo trọng lượng: Thêm 8,000 VND cho mỗi kg.

    Thời gian giao hàng: Luôn là 1 ngày.

    Ninja Van:

    Phí cố định: 15,000 VND.

    Phí theo trọng lượng: 10,000 VND cho mỗi kg.

    Thời gian giao hàng: Luôn là 5 ngày.
 */

// 1 Create interface
interface IShippingCalculator {
    calculateFee(weight: number): number;
    getEstimatedDelivery(): string;
}

// 2 Create Concrete products
class GhtkCalculator implements IShippingCalculator {
    private fee: number = 20000;
    private feeByWeight: number = 5000;
    private estimatedTime: string = "3 day";
    calculateFee(weight: number): number {
        return this.fee + weight * this.feeByWeight;
    }
    getEstimatedDelivery(): string {
        return this.estimatedTime;
    }
}

class GhnCalculator implements IShippingCalculator {
    private fee: number = 30000;
    private feeByWeight: number = 5000;
    private estimatedTime: string = "1 day";
    calculateFee(weight: number): number {
        return this.fee + weight * this.feeByWeight;
    }
    getEstimatedDelivery(): string {
        return this.estimatedTime;
    }
}

class NinjaVanCalculator implements IShippingCalculator {
    private fee: number = 15000;
    private feeByWeight: number = 10000;
    private estimatedTime: string = "5 day";
    calculateFee(weight: number): number {
        return this.fee + weight * this.feeByWeight;
    }
    getEstimatedDelivery(): string {
        return this.estimatedTime;
    }
}

class DHLCalculator implements IShippingCalculator {
    private fee: number = 100000;
    private estimatedTime: string = "2 hour";
    calculateFee(_weight: number): number {
        return this.fee;
    }
    getEstimatedDelivery(): string {
        return this.estimatedTime;
    }
}
// 3 Tạo factory Creator

abstract class ShippingCalculatorFactory {
    public abstract createShippingCalculator(): IShippingCalculator;

    public calculateFee(weight: number): number {
        const caculator = this.createShippingCalculator()
        return caculator.calculateFee(weight);
    }

    public getEstimatedDelivery(): string {
        const caculator = this.createShippingCalculator()
        return caculator.getEstimatedDelivery();
    }
}

// 4. Create concrete factory
// class GhnCalculatorFactory extends ShippingCalculatorFactory {
//     public createShippingCalculator(): IShippingCalculator {
//         return new GhnCalculator()
//     }
// }

// class GhtkCalculatorFactory extends ShippingCalculatorFactory {
//     public createShippingCalculator(): IShippingCalculator {
//         return new GhtkCalculator();
//     }
// }

// class NinjaVanCalculatorFactory extends ShippingCalculatorFactory {
//     public createShippingCalculator(): IShippingCalculator {
//         return new NinjaVanCalculator()
//     }
// }

// class DHLCalculatorFactory extends ShippingCalculatorFactory {
//     public createShippingCalculator(): IShippingCalculator {
//         return new DHLCalculator()
//     }
// }

// Giao dien
export const ShippingType = {
    GHN: "GHN",
    GHTK: "GHTK",
    NINJA_VAN: "NINJA_VAN",
    DHL: "DHL"
} as const;

export type ShippingType = typeof ShippingType[keyof typeof ShippingType];

export interface ShippingSummary {
    fee: number;
    estimatedDelivery: string;
}

class ShippingService {
    private static readonly shipingProviders: Record<ShippingType, new () => IShippingCalculator> = {
        [ShippingType.GHN]: GhnCalculator,
        [ShippingType.GHTK]: GhtkCalculator,
        [ShippingType.NINJA_VAN]: NinjaVanCalculator,
        [ShippingType.DHL]: DHLCalculator
    };

    // Gom thành 1 hàm duy nhất nhận nhiệm vụ tạo đối tượng và trả về trọn gói thông tin
    public getShippingSummary(type: ShippingType, weight: number): ShippingSummary {
        const ProviderClass = ShippingService.shipingProviders[type];
        if (!ProviderClass) {
            throw new Error("Invalid shipping provider");
        }

        const calculator = new ProviderClass();

        return {
            fee: calculator.calculateFee(weight),
            estimatedDelivery: calculator.getEstimatedDelivery()
        };
    }
}

// Client
const service = new ShippingService();

console.log(service.getShippingSummary(ShippingType.GHN, 5));
console.log(service.getShippingSummary(ShippingType.GHTK, 5));
console.log(service.getShippingSummary(ShippingType.NINJA_VAN, 5));
console.log(service.getShippingSummary(ShippingType.DHL, 5));