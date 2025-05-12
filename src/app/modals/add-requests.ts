export interface AddRequest {
  requestId?: number;
  requestNumber: string;
  userId: number;
  username?: string;  // Added username field
  mobileNumber: string;
  email: string;
  requestTypeId: number;
  assetId: number;
  transactionId?: number | null;
  requestDateTime: string;
  requestStatusId: number;
  customerNote?: string;
  adminNote?: string;
  createdByAdmin: boolean;
  createdOn?: string;
  updatedOn?: string;
}

export interface EditRequest extends Partial<AddRequest> {
  // fields specific to edit, if any
}