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
<<<<<<< HEAD
=======
  galleryId:number;
>>>>>>> 95ece7aed413107f8dbf8351ac690b01732c6dcb
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

<<<<<<< HEAD
=======

>>>>>>> 95ece7aed413107f8dbf8351ac690b01732c6dcb
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
<<<<<<< HEAD
  galleries: AssetGalleryDto[]; // Optional if images are returned

}
=======
  galleries: AssetGalleryDto[]; 
 
}
 
>>>>>>> 95ece7aed413107f8dbf8351ac690b01732c6dcb
