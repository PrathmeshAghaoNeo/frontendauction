import { Routes } from '@angular/router';
import { RoleGuard } from './services/auth.guard';

// Public Routes
import { StartPageComponent } from './component/start-page/start-page.component';
import { LoginComponent } from './component/login/login.component';
import { SignupComponent } from './component/signup/signup.component';
import { TestloginComponent } from './component/testlogin/testlogin.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';

// User Routes
import { RegUserLandingPageComponent } from './component/pages/reg-user-landing-page.component';
import { UserProfileComponent } from './component/user-profile/user-profile.component';

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

import { ManageAuctionComponent } from './component/manage-auction/manage-auction.component';
import { AddAuctionComponent } from './component/add-auction/add-auction.component';
import { UpdateAuctionComponent } from './component/update-auction/update-auction.component';

import { ManageRequestsComponent } from './component/manage-requests/manage-requests.component';
import { AddRequestsComponent } from './component/add-requests/add-requests.component';
import { EditRequestsComponent } from './component/edit-requests/edit-requests.component';
import { ViewRequestComponent } from './component/view-request/view-request.component';

import { TransactionManagementComponent } from './component/manage-transaction/manage-transaction.component';
import { AddTransactionComponent } from './component/add-transaction/add-transaction.component';
import { UpdateTransactionComponent } from './component/update-transaction/update-transaction.component';

import { ChartComponent } from './component/chart/chart.component';

export const routes: Routes = [
  // Public
  { path: '', component: StartPageComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'logintest', component: TestloginComponent },
  { path: 'landing-page', component: LandingPageComponent },

  // User Protected
  { path: 'reguserlandingpage', component: RegUserLandingPageComponent, canActivate: [RoleGuard], data: { role: 'User' } },

  // Admin Protected Routes
  {
    path: '',
    canActivate: [RoleGuard],
    data: { role: 'Admin' },
    children: [
      // Dashboard
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

      // Asset-Categories
      { path: 'assetcategories', component: ManageAssetCategoriesComponent },
      { path: 'addassetcategories', component: AddAssetCategoriesComponent },
      { path: 'update-assetcategories/:id', component: UpdateAssetCategoriesComponent },

      // Auctions
      { path: 'auctions', component: ManageAuctionComponent },
      { path: 'newAuction', component: AddAuctionComponent },
      { path: 'update-auction/:id', component: UpdateAuctionComponent },

      // Requests
      { path: 'requests', component: ManageRequestsComponent },
      { path: 'requestsnew', component: AddRequestsComponent },
      { path: 'requests/new', component: AddRequestsComponent }, // both formats for compatibility
      { path: 'request-detail/:id', component: EditRequestsComponent },
      { path: 'view-request', component: ViewRequestComponent },

      // Transactions
      { path: 'transactions', component: TransactionManagementComponent },
      { path: 'newTransaction', component: AddTransactionComponent },
      { path: 'update-transaction/:id', component: UpdateTransactionComponent },

      // Misc
      { path: 'categories', component: DashboardComponent },
      { path: 'roles', component: DashboardComponent },
      { path: 'reports', component: DashboardComponent },
      { path: 'user-profile', component: UserProfileComponent }
    ]
  },

  // Testing
  { path: 'testing', component: ChartComponent },

  // Fallback
  { path: '**', redirectTo: '/login' }
];
