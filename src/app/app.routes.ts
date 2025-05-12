import { Routes } from '@angular/router';
import { RoleGuard } from './services/auth.guard';

// Common Components
import { StartPageComponent } from './component/start-page/start-page.component';
import { LoginComponent } from './component/login/login.component';
import { TestloginComponent } from './component/testlogin/testlogin.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { RegUserLandingPageComponent } from './component/pages/reg-user-landing-page.component';

// Admin Dashboard Components
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { SettingsComponent } from './component/settings/settings.component';

// User Management
import { ManageUserComponent } from './component/manage-user/manage-user.component';
import { AddUserComponent } from './component/add-user/add-user.component';
import { UpdateUserComponent } from './component/update-user/update-user.component';
import { DetailsUserComponent } from './component/details-user/details-user.component';

// Asset Management
import { EditRequestsComponent } from './component/edit-requests/edit-requests.component';
import { ViewRequestComponent } from './component/view-request/view-request.component';
import { RoleGuard } from './services/auth.guard';
import { ManageAssetComponent } from './component/manage-asset/manage-asset.component';
import { AddAssetComponent } from './component/add-asset/add-asset.component';
import { ManageAssetCategoriesComponent } from './component/manage-assetcategories/manage-assetcategories.component';
import { AddAssetCategoriesComponent } from './component/add-assetcategories/add-assetcategories.component';
import { UpdateAssetCategoriesComponent } from './component/udpate-assetcategories/udpate-assetcategories.component';

// Auction Management
import { ManageAuctionComponent } from './component/manage-auction/manage-auction.component';
import { AddAuctionComponent } from './component/add-auction/add-auction.component';
import { UpdateAuctionComponent } from './component/update-auction/update-auction.component';

// Request Management
import { ManageRequestsComponent } from './component/manage-requests/manage-requests.component';
import { AddRequestComponent } from './component/add-requests/add-requests.component';
import { EditRequestsComponent } from './component/edit-requests/edit-requests.component';

// Transaction Management
import { TransactionManagementComponent } from './component/manage-transaction/manage-transaction.component';
import { AddTransactionComponent } from './component/add-transaction/add-transaction.component';
import { UpdateTransactionComponent } from './component/update-transaction/update-transaction.component';

// Miscellaneous
import { ChartComponent } from './component/chart/chart.component';
import { AddRequestsComponent } from './component/add-requests/add-requests.component';
import { UserProfileComponent } from './component/user-profile/user-profile.component';
import { SignupComponent } from './component/signup/signup.component';

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
    {path:'newAsset', component:AddAssetComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    { path: 'requests', component: ManageRequestsComponent,canActivate: [RoleGuard], data: { role: 'Admin' } },
    {path:'updateUser', component:UpdateUserComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'detailsUser', component:DetailsUserComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    { path: 'requestsnew', component: AddRequestsComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    { path: 'request-detail/:id', component: EditRequestsComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'transactions', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'categories', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'roles', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'reports', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'view-request', component:ViewRequestComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'user-profile',component:UserProfileComponent,canActivate:[RoleGuard],data: { role: 'Admin' }},
    {path:'signup',component:SignupComponent},
    {path: 'testing', component:ChartComponent},  
    { path: '**', redirectTo: '/login' }

  // Admin Routes
  {
    path: '',
    canActivate: [RoleGuard],
    data: { role: 'Admin' },
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'settings', component: SettingsComponent },

      // Users
      { path: 'users', component: ManageUserComponent },
      { path: 'newUser', component: AddUserComponent },
      { path: 'updateUser', component: UpdateUserComponent },
      { path: 'detailsUser', component: DetailsUserComponent },

      // Assets
      { path: 'assets', component: ManageAssetComponent },
      { path: 'newAsset', component: AddAssetComponent },

      // AssetsCategories
      { path: 'assetcategories', component: ManageAssetCategoriesComponent },
      { path: 'addassetcategories', component: AddAssetCategoriesComponent },
      { path: 'update-assetcategories/:id', component: UpdateAssetCategoriesComponent },

      // Auctions
      { path: 'auctions', component: ManageAuctionComponent },
      { path: 'newAuction', component: AddAuctionComponent },
      { path: 'update-auction/:id', component: UpdateAuctionComponent },

      // Requests
      { path: 'requests', component: ManageRequestsComponent },
      { path: 'requests/new', component: AddRequestComponent },
      { path: 'request-detail/:id', component: EditRequestsComponent },

      // Transactions
      { path: 'transactions', component: TransactionManagementComponent },
      { path: 'newTransaction', component: AddTransactionComponent },
      { path: 'update-transaction/:id', component: UpdateTransactionComponent },

      // Miscellaneous
      { path: 'categories', component: DashboardComponent },
      { path: 'roles', component: DashboardComponent },
      { path: 'reports', component: DashboardComponent },
    ]
  },

  // Wildcard redirect
  { path: '**', redirectTo: '/assetcategories' }
];
