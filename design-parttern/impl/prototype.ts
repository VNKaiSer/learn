
abstract class Shape {
    public x: number;
    public y: number;
    public color: string;

    constructor(source?: Shape) {
        if (source) {
            this.x = source.x;
            this.y = source.y;
            this.color = source.color;
        } else {
            this.x = 0;
            this.y = 0;
            this.color = "black";
        }
    }

    public abstract clone(): Shape;
}

class Circle extends Shape {
    public radius: number;

    constructor(source?: Circle) {
        super(source);
        if (source) {
            this.radius = source.radius;
        } else {
            this.radius = 0;
        }
    }

    public clone(): Shape {
        return new Circle(this);
    }
}

// --- KHÁCH HÀNG SỬ DỤNG ---
const firstCircle = new Circle();
firstCircle.x = 10;
firstCircle.y = 20;
firstCircle.color = "red";
firstCircle.radius = 15;

// Nhân bản hình tròn ban đầu
const clonedCircle = firstCircle.clone() as Circle;

console.log("Hình gốc: ", firstCircle);
console.log("Hình nhân bản: ", clonedCircle);
console.log("Hai hình có cùng tham chiếu không?", firstCircle === clonedCircle ? "Có" : "Không (Clone thành công)");