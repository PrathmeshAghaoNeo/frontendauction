export interface Asset {
    assetId: number;
    title: string;
    categoryId: number;
    categoryName: string;  
    deposit: number;
    sellerId: number;
    assetNumber:string;
    commission: number;
    startingPrice: number;
    reserveAmount: number;
    incrementalTime: number;
    minIncrement: number;
    makeOffer: boolean;
    featured: boolean;
    awardingId: number;
    awardingMethod: string;
    statusId: number;
    statusName: string;    
    vatid: number;
    vatType: string;      
    vatpercent: number;
    courtCaseNumber: string;
    registrationDeadline: number;
    description: string;
    mapLatitude: number;
    mapLongitude: number;
    adminFees: number;
    auctionFees: number;
    buyerCommission: number;
    winnerId: number | null;  
    winnerName: string | null;
    awardedPrice: number | null;
    salesNotes: string;
    createdAt: string;        
    updatedAt: string;      
    galleries: Gallery[] ;
    documents: Document[];
  }
 
  export interface Gallery {
    mediaType: string;
    filePath: string;
    sortOrder: number;
    fileUrl : string;
  }
 
  export interface Document {
    documentId: number;
    documentType: string;
    filePath: string;
  }