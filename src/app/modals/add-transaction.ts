export interface Transaction {
    statusId: number;
    paymentMethodId: number;
    transactionTypeId: number;
    transactionId: number;
    transactionNumber: string;
    amount: number;
    userFullName: string;
    transactionType: string;
    paymentMethod: string;
    cardType?: string;
    merchantTransactionId?: string;
    transactionDateTime: Date | string;
    status: string;
    notes?: string;
    documentUrls: string[];
  }
  
  export interface AddTransaction {
    amount: number;
    userId: number;
    transactionTypeId: number;
    paymentMethodId: number;
    cardTypeId?: number;
    merchantTransactionId?: string;
    transactionDateTime?: Date | string; // Optional if server sets default to current time
    statusId: number;
    notes?: string;
    documents?: File[]; // For file uploads
  }
  
  export interface TransactionType {
    id: number;
    name: string;
  }
  
  export interface PaymentMethod {
    id: number;
    name: string;
  }
  
  export interface CardType {
    id: number;
    name: string;
  }
  
  export interface TransactionStatus {
    id: number;
    name: string;
  }