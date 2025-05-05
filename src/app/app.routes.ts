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
import { AddRequestComponent } from './component/add-requests/add-requests.component';


export const routes: Routes = [
    { path: '', component: StartPageComponent,pathMatch: 'full', canActivate: [RoleGuard]},
    {path:'login', component:LoginComponent},
    { path: 'landing-page', component: LandingPageComponent, },
    { path: 'reguserlandingpage', component: RegUserLandingPageComponent, canActivate: [RoleGuard], data: { role: 'user' }},
    {path:'dashboard', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'admin' }},
    {path:'assets', component:ManageAssetComponent,canActivate: [RoleGuard], data: { role: 'admin' }},
    {path:'auctions', component:ManageAuctionComponent,canActivate: [RoleGuard], data: { role: 'admin' }},
    { path: 'users', component: ManageUserComponent,canActivate: [RoleGuard], data: { role: 'admin' } },
    {path:'settings', component:SettingsComponent,canActivate: [RoleGuard], data: { role: 'admin' }},
    {path:'newUser', component:AddUserComponent,canActivate: [RoleGuard], data: { role: 'admin' }},
    {path:'newAuction', component:AddAuctionComponent,canActivate: [RoleGuard], data: { role: 'admin' }},
    {path:'newAsset', component:AddAssetComponent,canActivate: [RoleGuard], data: { role: 'admin' }},
    { path: 'requests', component: ManageRequestsComponent,canActivate: [RoleGuard], data: { role: 'admin' } },
    {path:'updateUser', component:UpdateUserComponent,canActivate: [RoleGuard], data: { role: 'admin' }},
    {path:'detailsUser', component:DetailsUserComponent,canActivate: [RoleGuard], data: { role: 'admin' }},
    { path: 'requests/new', component: AddRequestComponent,canActivate: [RoleGuard], data: { role: 'admin' }},
    { path: 'request-detail/:id', component: EditRequestsComponent,canActivate: [RoleGuard], data: { role: 'admin' } },
    {path:'transactions', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'admin' }},
    {path:'categories', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'admin' }},
    {path:'roles', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'admin' }},
    {path:'reports', component:DashboardComponent, canActivate: [RoleGuard], data: { role: 'admin' }},
    { path: '**', redirectTo: '/login' }

];
