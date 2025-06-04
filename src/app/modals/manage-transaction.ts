export interface Transaction {
  transactionId: number;
  transactionNumber: string;
  userId: number;
  userFullName: string;
  transactionTypeId: number;
  transactionTypeName: string;
  amount: number;
  paymentMethodId: number;
  paymentMethodName: string;
  cardTypeId?: number;
  cardTypeName?: string;
  merchantTransactionId?: string;
  transactionDateTime: Date | string;
  statusId: number;
  statusName: string;
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


 export interface UserTransaction {
  refNo: string;                 // e.g. "TXN202505280001"
  request: string;               // e.g. "Deposit", "Refund Request"
  dateTime: string;              // ISO datetime string, e.g. "2025-05-28T09:00:00Z"
  amount: number;                // e.g. 100.00 or -50.00
  type: string;                 // e.g. "Deposit", "Refund"
  method: string;               // e.g. "Bank Transfer", "—"
  status: string;               // e.g. "Completed", "Pending"
  approvedDateTime?: string | null;  // ISO datetime string or null
  approvedBy?: string | null;         // e.g. "Admin A" or null
  notes?: string | null;  
 
}
