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
  transactionTypeId: number;
  paymentMethodId: number;
  cardTypeId?: number | null;
  merchantTransactionId?: string;
  transactionDateTime: string | Date;
  statusId: number;
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
