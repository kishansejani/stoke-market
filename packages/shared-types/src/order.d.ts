export type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentGateway = 'RAZORPAY' | 'STRIPE' | 'MANUAL_INVOICE' | 'MOCK_SANDBOX';
export interface ProductPackage {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    priceINR: number;
    priceUSD: number;
    maxActivations: number;
    dataIncludedDays: number;
    features: string[];
    isPopular?: boolean;
}
export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    productId: string;
    productName: string;
    currency: 'INR' | 'USD';
    amount: number;
    tax: number;
    status: OrderStatus;
    licenseKey?: string;
    createdAt: string;
}
export interface CheckoutRequest {
    productId: string;
    currency: 'INR' | 'USD';
    gateway: PaymentGateway;
}
export interface CheckoutResponse {
    orderId: string;
    orderNumber: string;
    amount: number;
    currency: 'INR' | 'USD';
    gateway: PaymentGateway;
    gatewayOrderId?: string;
    gatewayKey?: string;
}
export interface PaymentVerificationRequest {
    orderId: string;
    gateway: PaymentGateway;
    paymentId: string;
    signature?: string;
}
//# sourceMappingURL=order.d.ts.map