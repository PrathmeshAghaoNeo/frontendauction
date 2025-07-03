import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from './services/auth.guard';
import { StartPageComponent } from './component/start-page/start-page.component';
import { LoginComponent } from './component/login/login.component';
import { TestloginComponent } from './component/testlogin/testlogin.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { RegUserLandingPageComponent } from './component/pages/reg-user-landing-page.component';
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
import { UserProfileComponent } from './component/user-profile/user-profile.component';
import { SignupComponent } from './component/signup/signup.component';
import { UserSignupComponent } from './component/user-signup/user-signup.component';
import { AssetDetailComponent } from './component/asset-details/asset-details.component';

import { DirectSaleAssetsComponent } from './component/direct-sale-assets/direct-sale-assets.component';
import { AuctionAssetsComponent } from './component/auction-assets/auction-assets.component';
import { EditAssetComponent } from './component/edit-asset/edit-asset.component';
// import { DirectBidComponent } from './component/direct-bid/direct-bid.component';
import { SignalrTestComponent } from './component/signalr-test/signalr-test.component';
import { BidWatchlistComponent } from './component/bid-watchlist/bid-watchlist.component';
import { BidAddToCartComponent } from './component/bid-add-to-cart/bid-add-to-cart.component';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { ChatBotComponent } from './component/chat-bot/chat-bot.component';
import { GetOrdersComponentComponent } from './component/get-orders-component/get-orders-component.component';
import { GetOrderDetailsComponent } from './component/get-order-details/get-order-details.component';
import { AuditTrailComponent } from './component/audit-trail/audit-trail.component';
import { ReportsListComponent } from './component/reports-list/reports-list.component';
import { RefundRequestComponent } from './component/profile/refund-request/refund-request.component';
import { DepositPageComponent } from './component/deposit-page/deposit-page.component';
import { MyDetailsComponent } from './component/profile/my-details/my-details.component';
import { UserTransactionsComponent } from './component/profile/transaction-history/transaction-history.component';
import { MyPurchasesComponent } from './component/profile/my-purchases/my-purchases.component';
import { NotificationsComponent } from './component/profile/notifications/notifications.component';
import { SettingsPrivacyComponent } from './component/profile/settings-privacy/settings-privacy.component';
import { DepositLimitComponent } from './component/profile/deposit-limit/deposit-limit.component';
import { ChatbotAdminComponent } from './component/chatbot-admin/chatbot-admin.component';

import { ManageRolesComponent } from './component/manage-roles/manage-roles.component';
import { DirectSaleAssetComponent } from './component/direct-sale-assetpage/direct-sale-assetpage.component';
import { FilterComponent } from './component/filter/filter.component';
// import { BidHistoryComponent } from './component/bid-history/bid-history.component';

import { NgModule } from '@angular/core';
import { BidHistoryComponent } from './component/bid-history/bid-history.component';
import { CheckoutComponentComponent } from './component/checkout-component/checkout-component.component';
import { PaymentSuccessComponent } from './component/bid-add-to-cart/payment-success.component';
import { RoleUpdateComponent } from './component/role-update-component/role-update-component';
import { RoleCreateComponent } from './component/role-create-component/role-create-component';
import { LoginGuard } from './services/login-guard.service';
import { AssetMapComponent } from './asset-map/asset-map.component';

export const routes: Routes = [
  { path: '', component: StartPageComponent, pathMatch: 'full', data: { animation: 'StartPage' } },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard], data: { animation: 'Login' } },
  { path: 'landing-page', component: LandingPageComponent, data: { animation: 'LandingPage' } },
  { path: 'logintest', component: TestloginComponent, data: { animation: 'LoginTest' } },
  {
    path: 'reguserlandingpage',
    component: RegUserLandingPageComponent,
    canActivate: [RoleGuard],
    data: { role: 'User', animation: 'RegUserLandingPage' },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'Dashboard' },
  },
  {
    path: 'assets',
    component: ManageAssetComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'ManageAssets' },
  },
  {
    path: 'newAsset',
    component: AddAssetComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'NewAsset' },
  },
  {
    path: 'update-asset/:assetId',
    component: EditAssetComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'UpdateAsset' },
  },
  {
    path: 'auctions',
    component: ManageAuctionComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'Auctions' },
  },
  {
    path: 'newAuction',
    component: AddAuctionComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'NewAuction' },
  },
  {
    path: 'update-auction/:id',
    component: UpdateAuctionComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'UpdateAuction' },
  },
  { path: 'settings', component: SettingsComponent, data: { animation: 'Settings' } },
  {
    path: 'requests',
    component: ManageRequestsComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'ManageRequests' },
  },
  {
    path: 'users',
    component: ManageUserComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'Users' },
  },
  { path: 'newUser', component: AddUserComponent, data: { animation: 'NewUser' } },
  {
    path: 'updateUser',
    component: UpdateUserComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'UpdateUser' },
  },
  {
    path: 'detailsUser',
    component: DetailsUserComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'DetailsUser' },
  },
  {
    path: 'requestsnew',
    component: AddRequestsComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'NewRequest' },
  },
  {
    path: 'request-detail/:id',
    component: EditRequestsComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'EditRequest' },
  },
  {
    path: 'assetcategories',
    component: ManageAssetCategoriesComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'AssetCategories' },
  },
  {
    path: 'addassetcategories',
    component: AddAssetCategoriesComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'AddAssetCategory' },
  },
  {
    path: 'update-assetcategories/:id',
    component: UpdateAssetCategoriesComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'UpdateAssetCategory' },
  },
  {
    path: 'transactions',
    component: TransactionManagementComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'Transactions' },
  },
  {
    path: 'newTransaction',
    component: AddTransactionComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'NewTransaction' },
  },
  {
    path: 'update-transaction/:id',
    component: UpdateTransactionComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'UpdateTransaction' },
  },
  { path: 'categories', component: DashboardComponent, canActivate: [RoleGuard], data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'Categories' } },
  { path: 'roles', component: ManageRolesComponent, data: { animation: 'Roles' } },
  { path: 'reports', component: ReportsListComponent, data: { animation: 'Reports' } },
  {
    path: 'view-request',
    component: ViewRequestComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'ViewRequest' },
  },
  {
    path: 'user-profile',
    component: UserProfileComponent,
    canActivate: [RoleGuard],
    data: { animation: 'UserProfile' },
    children: [
      { path: 'my-details', component: MyDetailsComponent, data: { animation: 'MyDetails' } },
      { path: 'notifications', component: NotificationsComponent, data: { animation: 'Notifications' } },
      { path: 'settings-privacy', component: SettingsPrivacyComponent, data: { animation: 'SettingsPrivacy' } },
      { path: 'deposit-limit', component: DepositLimitComponent, data: { animation: 'DepositLimit' } },
      { path: 'refund-request', component: RefundRequestComponent, data: { animation: 'RefundRequest' } },
      { path: 'transaction-history', component: UserTransactionsComponent, data: { animation: 'TransactionHistory' } },
      { path: 'my-purchases', component: MyPurchasesComponent, data: { animation: 'MyPurchases' } },
      { path: '', redirectTo: 'my-details', pathMatch: 'full' },
    ],
  },
  { path: 'payment-success', component: PaymentSuccessComponent, data: { animation: 'PaymentSuccess' } },
  { path: 'testing', component: ChartComponent, data: { animation: 'Chart' } },
  { path: 'updateRole/:id', component: RoleUpdateComponent, data: { animation: 'UpdateRole' } },
  { path: 'createRole', component: RoleCreateComponent, data: { animation: 'CreateRole' } },
  { path: 'user-signup', component: UserSignupComponent, data: { animation: 'UserSignup' } },
  { path: 'asset-details', component: AssetDetailComponent, data: { animation: 'AssetDetails' } },
  { path: 'audit-trial', component: AuditTrailComponent, data: { animation: 'AuditTrail' } },
  { path: 'direct-sale-assetpage/:assetId', component: DirectSaleAssetComponent, data: { animation: 'DirectSaleAsset' } },
  { path: 'order-details/:assetId', component: GetOrderDetailsComponent, data: { animation: 'OrderDetails' } },
  { path: 'direct-sale-assets/:categoryId', component: DirectSaleAssetsComponent, data: { animation: 'DirectSaleAssets' } },
  { path: 'auction-assets/:categoryId', component: AuctionAssetsComponent, data: { animation: 'AuctionAssets' } },
  { path: 'signal', component: SignalrTestComponent, data: { animation: 'SignalrTest' } },
  { path: 'bid-watchlist', component: BidWatchlistComponent, data: { animation: 'BidWatchlist' } },
  { path: 'bid-add-to-cart', component: BidAddToCartComponent, data: { animation: 'BidAddToCart' } },
  { path: 'page-not-found', component: PageNotFoundComponent, data: { animation: 'NotFound' } },
  { path: 'chat-bot', component: ChatBotComponent, data: { animation: 'ChatBot' } },
  { path: 'orders', component: GetOrdersComponentComponent, data: { animation: 'Orders' } },
  { path: 'refund-request', component: RefundRequestComponent, data: { animation: 'RefundRequestDuplicate' } },
  { path: 'deposit-page', component: DepositPageComponent, data: { animation: 'DepositPage' } },
  { path: 'bid-history', component: BidHistoryComponent, data: { animation: 'BidHistory' } },
  {
    path: 'chatbot-admin',
    component: ChatbotAdminComponent,
    canActivate: [RoleGuard],
    data: { role: ['Admin', 'Supplier', 'SuperAdmin', 'OnlyManageAssets'], animation: 'ChatbotAdmin' },
  },
  { path: 'asset-map', component: AssetMapComponent },
  { path: 'finalCheckout/:assetId', component: CheckoutComponentComponent, data: { animation: 'FinalCheckout' } },
  { path: 'filter', component: FilterComponent, data: { animation: 'Filter' } },
  { path: '**', redirectTo: 'page-not-found', data: { animation: 'Wildcard' } },

];
