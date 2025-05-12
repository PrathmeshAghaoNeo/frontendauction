export interface Transaction {
    transactionId: number;
    transactionNumber: string;
    amount: number;
    userId: number;
    transactionTypeId: number;
    paymentMethodId: number;
    cardTypeId?: number;
    merchantTransactionId?: string;
    transactionDateTime: Date;
    statusId: number;
    notes?: string;
    documentPath?: string;
    createdByAdminID?: number;
    createdAt?: Date;
    updatedAt?: Date;
}