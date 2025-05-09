import { Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { ManageAuctionComponent } from './component/manage-auction/manage-auction.component';
import { ManageUserComponent } from './component/manage-user/manage-user.component';
import { LoginComponent } from './component/login/login.component';
import { SettingsComponent } from './component/settings/settings.component';
import { AddUserComponent } from './component/add-user/add-user.component';
import { AddAuctionComponent } from './component/add-auction/add-auction.component';
import { AddAssetComponent } from './component/add-asset/add-asset.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { StartPageComponent } from './component/start-page/start-page.component';
import { RegUserLandingPageComponent } from './component/pages/reg-user-landing-page.component';
import { ManageRequestsComponent } from './component/manage-requests/manage-requests.component';
import { UpdateUserComponent } from './component/update-user/update-user.component';
import { DetailsUserComponent } from './component/details-user/details-user.component';
import { EditRequestsComponent } from './component/edit-requests/edit-requests.component';
import { RoleGuard } from './services/auth.guard';
import { ManageAssetComponent } from './component/manage-asset/manage-asset.component';
import { UpdateAuctionComponent } from './component/update-auction/update-auction.component';
import { TestloginComponent } from './component/testlogin/testlogin.component';
import { ManageAssetCategoriesComponent } from './component/manage-assetcategories/manage-assetcategories.component';
import { AddAssetCategoriesComponent } from './component/add-assetcategories/add-assetcategories.component';
import { UpdateAssetCategoriesComponent } from './component/udpate-assetcategories/udpate-assetcategories.component';
import { AddRequestComponent } from './component/add-requests/add-requests.component';


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
    { path: 'requests/new', component: AddRequestComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    { path: 'request-detail/:id', component: EditRequestsComponent,canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'transactions', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'assetcategories', component:ManageAssetCategoriesComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'addassetcategories', component:AddAssetCategoriesComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'update-assetcategories/:id', component:UpdateAssetCategoriesComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'roles', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},
    {path:'reports', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'Admin' }},

    { path: '**', redirectTo: '/assetcategories' }

];