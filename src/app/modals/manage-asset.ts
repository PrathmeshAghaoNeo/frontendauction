
export interface Asset {
  assetId: number;
  title: string;
  categoryId?: number;
  categoryName?: string;
  deposit?: number;
  sellerId: number;
  commission?: number;
  startingPrice: number;
  reserveAmount?: number;
  incrementalTime?: number;
  minIncrement?: number;
  makeOffer?: boolean;
  featured?: boolean;
  awardingId?: number;   
  awardingMethod?: string;
  statusId?: number;
  statusName?: string;
  vatid?: number;
  vatType?: string;
  vatpercent?: number;
  courtCaseNumber?: string;
  registrationDeadline?: number;
  description?: string;
  mapLatitude?: number;
  mapLongitude?: number;
  adminFees?: number;
  auctionFees?: number;
  requestForViewing: boolean;
  requestForInquiry: boolean;
  buyerCommission?: number;
  winnerId?: number;
  winnerName?: string;
  awardedPrice?: number;
  salesNotes?: string;
  details: string | null;
  createdAt?: string;
  updatedAt?: string;
  assetNumber: string;
  auctionIds: number[];
  galleries: AssetGalleryDto[];
  documents: AssetDocumentFormDto[];
  attributes: AssetDetailDto[];
  auctionStatusId?: number;
  isAvailableForDirectSale: boolean;
  isDeleted: boolean;
}

export interface AssetGalleryDto {
  galleryId: number;
  mediaType?: string;
  filePath?: string;
  fileUrl: string;
  sortOrder?: number;
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

export interface AssetDocumentFormDto {
  documentId: number;
  documentType?: string;
  filePath?: string;
}

export interface AssetDetailDto {
  attributeName: string;
  attributeValue: string;
}
  


export interface DirectSaleAssetDto {
  assetId: number;
  assetNumber: string;
  title: string;
  categoryId: number;
  deposit: number;
  minIncrement: number;
  description: string;
  isDeleted: boolean;
  salesNotes: string;
  price: number;
  thumbnailUrl: string | null;
  categoryName: string;
  isAvailableForDirectSale: boolean;
  galleries: AssetGalleryDto[];
 
}
 