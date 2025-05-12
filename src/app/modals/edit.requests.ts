
  
// export interface EditRequests {
//     requestId?: number;          
//     requestNumber: string;
//     userId: number;
//     username: string;
//     mobileNumber: string;
//     email: string;
//     requestTypeId: number;
//     assetId: number;
//     transactionId?: number;
//     requestDateTime: string;      
//     requestStatusId: number;
//     customerNote?: string;
//     adminNote?: string;
//     startDateTime?: string;
//     createdByAdmin: boolean;
//   }
  

export interface EditRequests {
  requestId: number;
  requestNumber: string;
  userId: number;
  username: string;
  mobileNumber: string;
  email: string;
  requestTypeId: number;
  assetId: number;
  transactionId: number;
  requestDateTime: string;
  requestStatusId: number;
  customerNote: string;
  adminNote: string;
  createdByAdmin: boolean;
  createdOn: string;
  updatedOn: string;
  asset: any | null;
  requestStatus: any | null;
  requestType: any | null;
  tblRequestStatusHistories: any[];
  transaction: any | null;
  user: any | null;
}