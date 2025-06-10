export interface HighBiddingCustomer {
  userId: number;
  name: string;
  totalManualBids: number;
  totalManualBidAmount: number;
  totalAutoBids: number;
  totalAutoBidAmount: number;
  totalBidsCount: number;
  totalBidAmount: number;
}

export interface RequestTransaction {
  transactionId: number;
  transactionNumber: string;
  amount: number;
  userId: number;
  userName: string; // New

  transactionTypeId: number;
  transactionTypeName: string; // New

  paymentMethodId: number;
  paymentMethodName?: string; // New

  cardTypeId?: number | null;
  cardTypeName?: string | null; // New

  merchantTransactionId?: string;
  transactionDateTime: string | Date;

  statusId: number;
  statusName: string; // New

  notes?: string;
  documentPath?: string;

  createdByAdminID?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  createdBy?: number | null;
  createdDate?: string | Date | null;
  updatedBy?: number | null;
  updatedDate?: string | Date | null;
  deletedBy?: number | null;
  deletedDate?: string | Date | null;

  isDeleted: boolean;
}

export interface StatementOfAccountResponse {
  transactionId: number;
  transactionNumber: string;
  transactionDateTime: string; // or Date if you plan to parse it
  amount: number;
  transactionTypeId: number;
  transactionTypeName: string;
  paymentMethodId: number;
  paymentMethodName: string;
  statusId: number;
  statusName: string;
  notes: string;
  userId: number;
  userName: string;
}

export interface AuctionReport {
  auctionId: number;
  auctionNumber: string;
  title: string;
  type: string;
  startDateTime: string; // ISO date string
  endDateTime: string; // ISO date string
  statusId: number;
  statusName?: string | null;     // added field
  incrementalTime: number;
  createdDate: string; // ISO date string
  updatedDate: string | null;
  categoryId: number;
  categoryName?: string | null;   // added field
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  deletedDate: string | null;
  isDeleted: boolean;
  hangfireJobId: string | null;
}

