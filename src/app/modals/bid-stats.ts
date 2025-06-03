export interface bidStats {
    highestBid : number;
    bidCount : number
}
export interface bidStatsBulk {
    assetId: number,
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
