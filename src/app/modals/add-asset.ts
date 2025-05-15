export interface AddAsset {
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
  buyerCommission?: number;
  winnerId?: number;
  awardedPrice?: number;
  salesNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  assetNumber: string;
  auctionIds: number[];
  galleries: AssetGalleryDto[];
  documents: AssetDocumentFormDto[];
  attributes: AssetDetailDto[];
}

export interface AssetGalleryDto {
  mediaType?: string;
  filePath?: string;
  fileUrl: string;
  sortOrder?: number;
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
 