import { Asset } from "./manage-asset";

export interface bidStats {
    highestBid : number;
    bidCount : number
}

export interface BidDto {
    auctionId: number;
    assetId: number |null;
    userId: number| null;
    bidAmount: number;
  }


export interface AutoBidDto{
    auctionId: number;
    assetId: number;
    userId: number |null; 
    maxBidAmount: number;
    isActive: boolean;
}



export interface WonBid {
  winnerId: number;
  assetId: number;
  userId: number;
  awardedPrice: number;
  reason: string;
  note: string;
  approved: boolean;
  createdAt: string;
  isSeen: boolean;
}



export interface BidDisplayModel {
  assetId: number;
  asset: Asset | null;

  // For ongoing bids
  bidAmount?: number;
  status?: string;

  // For won bids
  awardedPrice?: number;
  reason?: string;
  note?: string;
  approved?: boolean;
  isSeen?: boolean;
  createdAt?: string;
}
