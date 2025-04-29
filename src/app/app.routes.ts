import { Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { ManageAssetComponent } from './component/manage-asset/manage-asset.component';
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
import { AddRequestComponent } from './component/add-requests/add-requests.component';


export const routes: Routes = [
    { path: '', component: StartPageComponent },
    {path:'dashboard', component:DashboardComponent},
    {path:'assets', component:ManageAssetComponent},
    { path: 'landing-page', component: LandingPageComponent },
    {path:'auctions', component:ManageAuctionComponent},
    { path: 'users', component: ManageUserComponent },
    {path:'login', component:LoginComponent},
    {path:'settings', component:SettingsComponent},
    {path:'newUser', component:AddUserComponent},
    {path:'newAuction', component:AddAuctionComponent},
    {path:'newAsset', component:AddAssetComponent},
    { path: 'reguserlandingpage', component: RegUserLandingPageComponent },
    { path: 'requests', component: ManageRequestsComponent },
    {path:'updateUser', component:UpdateUserComponent},
    {path:'detailsUser', component:DetailsUserComponent},
    { path: 'requests/new', component: AddRequestComponent },
    { path: 'request-detail/:id', component: EditRequestsComponent },


];
