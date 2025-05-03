export interface Role {
    roleId: number;
    roleName: string;
  }
 
  export interface Status {
    statusId: number;
    statusName: string;
  }
  export interface Country {
    countryId: number;
    countryName: string;
    phoneCode: string;
    minLength: number;
    maxLength: number;
    seriesStart: string
    tblUsers?: (null)[] | null;
  }
 
  export interface User {
    name: string;
    mobileNumber: string;
    email: string;
    companyName: string;
    companyNumber: string;
    statusId: number |null;
    chatEnabled: boolean;
    roleId: number |null;
    personalIdNumber: string;
    gender: string |null;
    personalIdExpiryDate: string;
    countryId: number;
    profileImage: File | null;
    personalIdImage: File | null;
  }
 
  export interface UserView {
    userId: number
    uid: number
    name: string
    email: string
    mobileNumber: string
    companyName: string
    companyNumber: string
    statusId: number
    chatEnabled: boolean
    roleId: number
    personalIdNumber: string
    gender: string
    personalIdExpiryDate: string
    countryId: number
    profileImageUrl: any
    personalIdImageUrl: any
  }
  export interface PaginatedUserResult {
    users: UserView[];   
    totalCount: number;   
  }
  