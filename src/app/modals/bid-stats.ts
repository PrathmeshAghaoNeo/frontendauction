export interface bidStats {
    highestBid : number;
    bidCount : number
}

export interface BidDto {
    auctionId: number;
    assetId: number;
    userId: number;
    bidAmount: number;
  }