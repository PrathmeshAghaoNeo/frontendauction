  export interface AssetCategory {
      categoryId: number;         
      categoryName: string;               
      subcategory: string | null;         
      depositPercentage: number | null;   
      details: string | null;             
      adminFees: number | null;           
      auctionFees: number | null;        
      buyerCommission: number | null;     
      registrationDeadline: string;     
      IconFile: string;                      
      icon: string;                      
      document: string | null;            
      vatpercentage: number | null;       
      statusId: number | null;           
      vatid: string | null;               
      sortOrder: number | null;       
      statusName:string | null    
    }
    