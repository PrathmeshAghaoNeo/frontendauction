// Asset models matching backend DTOs

export interface AssetDetailDto {
    attributeName: string;
    attributeValue: string;
  }
  
  export interface CreateAssetsDto {
    title: string;
    categoryId: number;
    startingPrice: number;
    reserveAmount?: number;
    deposit?: number;
    commission?: number;
    sellerId?: number;
    statusId?: number;
    vatid?: number;
    vatpercent?: number;
    awardingId?: number;
    makeOffer: boolean;
    featured: boolean;
    courtCaseNumber?: string;
    registrationDeadline: number;
    description?: string;
    mapLatitude?: string;
    mapLongitude?: string;
    adminFees?: number;
    auctionFees?: number;
    buyerCommission?: number;
    winnerId?: number;
    awardedPrice?: number;
    salesNotes?: string;
    assetNumber?: string;
    incrementalTime?: number;
    minIncrement?: number;
    requestForViewing: boolean;
    requestForInquiry: boolean;
    
    galleryFiles: File[];
    documentFiles: File[];
    
    detailsJson: string; // JSON string for list of AssetDetailDto
  
    auctionIds: number[];
  }
  

