import { environment } from "./enviroments";
 
 
const BASE_URL = environment.apiUrl;
 
export const ApiEndpoints = {
  ASSESTDOCUMENT: `${BASE_URL}/AssetDocument`,
  ASSETGALLERY: `${BASE_URL}/AssetGallery`,
  ASSETCATEGORIES:`${BASE_URL}/AssetCategories`,
  ASSETS: `${BASE_URL}/Assets`,
  AUCTION: `${BASE_URL}/Auction`,
  AUCTIONSETTINGS: `${BASE_URL}/auction-settings`,
  COUNTRY: `${BASE_URL}/Country`,
  DIRECTSALESETTINGS: `${BASE_URL}/DirectSaleSettings`,
  FINANCESETTINGS: `${BASE_URL}/FinanceSettings`,
  FOOTERLINKSETTINGS: `${BASE_URL}/FooterLinksSettings`,
  STATICPAGESETTINGS: `${BASE_URL}/StaticPagesSettings`,
  TRANSACTIONS: `${BASE_URL}/Transactions`,
  USER: `${BASE_URL}/User`,
  REQUEST: `${BASE_URL}/Request`,
  Auth: `${BASE_URL}/Auth`,
  Bid : `${BASE_URL}/Bid`,

  
};




