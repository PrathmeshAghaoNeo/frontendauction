import { Routes } from '@angular/router';
import { RoleGuard } from './services/auth.guard';

// Public Routes
import { StartPageComponent } from './component/start-page/start-page.component';
import { LoginComponent } from './component/login/login.component';
import { TestloginComponent } from './component/testlogin/testlogin.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';

// User Routes
import { RegUserLandingPageComponent } from './component/pages/reg-user-landing-page.component';

// Admin Routes
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { SettingsComponent } from './component/settings/settings.component';
import { ManageUserComponent } from './component/manage-user/manage-user.component';
import { AddUserComponent } from './component/add-user/add-user.component';
import { UpdateUserComponent } from './component/update-user/update-user.component';
import { DetailsUserComponent } from './component/details-user/details-user.component';

import { ManageAssetComponent } from './component/manage-asset/manage-asset.component';
import { AddAssetComponent } from './component/add-asset/add-asset.component';
import { ManageAssetCategoriesComponent } from './component/manage-assetcategories/manage-assetcategories.component';
import { AddAssetCategoriesComponent } from './component/add-assetcategories/add-assetcategories.component';
import { UpdateAssetCategoriesComponent } from './component/udpate-assetcategories/udpate-assetcategories.component';
import { AddRequestsComponent } from './component/add-requests/add-requests.component';

import { ManageAuctionComponent } from './component/manage-auction/manage-auction.component';
import { AddAuctionComponent } from './component/add-auction/add-auction.component';
import { UpdateAuctionComponent } from './component/update-auction/update-auction.component';

import { ManageRequestsComponent } from './component/manage-requests/manage-requests.component';
import { EditRequestsComponent } from './component/edit-requests/edit-requests.component';
import { ViewRequestComponent } from './component/view-request/view-request.component';

import { TransactionManagementComponent } from './component/manage-transaction/manage-transaction.component';
import { AddTransactionComponent } from './component/add-transaction/add-transaction.component';
import { UpdateTransactionComponent } from './component/update-transaction/update-transaction.component';

import { ChartComponent } from './component/chart/chart.component';
// import { AddRequestsComponent } from './component/add-requests/add-requests.component';
import { UserProfileComponent } from './component/user-profile/user-profile.component';
import { SignupComponent } from './component/signup/signup.component';
import { UserSignupComponent } from './component/user-signup/user-signup.component';
import { AssetDetailComponent } from './component/asset-details/asset-details.component';
import { DirectSaleComponent } from './component/direct-sale-assetpage/direct-sale-assetpage.component';



import { DirectSaleAssetsComponent } from './component/direct-sale-assets/direct-sale-assets.component';
import { AuctionAssetsComponent } from './component/auction-assets/auction-assets.component';
import { EditAssetComponent } from './component/edit-asset/edit-asset.component';
import { DirectBidComponent } from './component/direct-bid/direct-bid.component';
import { SignalrTestComponent } from './component/signalr-test/signalr-test.component';
import { BidWatchlistComponent } from './component/bid-watchlist/bid-watchlist.component';
import { BidAddToCartComponent } from './component/bid-add-to-cart/bid-add-to-cart.component';

export const routes: Routes = [
    { path: '', component: StartPageComponent,pathMatch: 'full'},
    {path:'login', component:LoginComponent},
    { path: 'landing-page', component: LandingPageComponent, },
    {path:'logintest', component:TestloginComponent},
    { path: 'reguserlandingpage', component: RegUserLandingPageComponent, canActivate: [RoleGuard], data: { role: 'User' }},
    {path:'dashboard', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'assets', component:ManageAssetComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'auctions', component:ManageAuctionComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    { path: 'users', component: ManageUserComponent,canActivate: [RoleGuard], data: { role: 'Admin' } },
    {path:'settings', component:SettingsComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'newUser', component:AddUserComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'newAuction', component:AddAuctionComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'update-auction/:id', component:UpdateAuctionComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    // Asset Management
  { path: 'assets', component: ManageAssetComponent },
  { path: 'newAsset', component: AddAssetComponent },
  { path: 'update-asset/:assetId', component: EditAssetComponent},
  
  
  

    { path: 'requests', component: ManageRequestsComponent,canActivate: [RoleGuard], data: { role: 'Admin' } },
    {path:'updateUser', component:UpdateUserComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'detailsUser', component:DetailsUserComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    { path: 'requestsnew', component: AddRequestsComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    { path: 'request-detail/:id', component: EditRequestsComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'assetcategories', component:ManageAssetCategoriesComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'addassetcategories', component:AddAssetCategoriesComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'update-assetcategories/:id', component:UpdateAssetCategoriesComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'transactions', component:TransactionManagementComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'newTransaction', component:AddTransactionComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'update-transaction/:id', component:UpdateTransactionComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'categories', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'roles', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'reports', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'view-request', component:ViewRequestComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'user-profile',component:UserProfileComponent,canActivate:[RoleGuard],data: { role: 'Admin' }},
    {path: 'testing', component:ChartComponent},  
    {path:'user-signup',component:UserSignupComponent},
    {path:'asset-details',component:AssetDetailComponent},
    {path:'direct-sale-assetpage/:id',component:DirectSaleComponent},
 

    {path: 'direct-sale-assets/:categoryId', component: DirectSaleAssetsComponent },
    
    {path:'auction-assets/:categoryId', component:AuctionAssetsComponent},    
    
    {path: 'testing', component:ChartComponent}, 
    {path: 'signal', component:SignalrTestComponent},
    
    { path: 'direct-bid', component: DirectBidComponent},
    { path: 'bid-watchlist', component: BidWatchlistComponent},
    { path: 'bid-add-to-cart', component: BidAddToCartComponent},

    
    
    
];
   

  