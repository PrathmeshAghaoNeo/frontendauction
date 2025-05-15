export interface Asset {
  assetId: number;
  title: string;
  categoryId: number;
  categoryName: string;  
  deposit: number;
  sellerId: number;
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
  assetNumber: string;
  createdAt: string;        
  updatedAt: string;       
  galleries: Gallery[] ;
  documents: Document[];
  
//added now
 attributes: AssetAttribute[];
 
}


// Add this interface for the attributes
export interface AssetAttribute {
  attributeName: string;
  attributeValue: string;
}


export interface Gallery {
[x: string]: any;
  mediaType: string;
  filePath: string;
  sortOrder: number;
  fileUrl : string;
   imageUrl: string;
}

export interface Document {
  documentId: number;
  documentType: string;
  filePath: string;
}