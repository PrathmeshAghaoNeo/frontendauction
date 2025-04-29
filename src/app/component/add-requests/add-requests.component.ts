import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import moment from 'moment';
import { AddRequest } from '../../modals/add-requests';
import { UserView } from '../../modals/user';
import { Asset } from '../../modals/manage-asset';
import { RequestServices } from '../../services/requests.service';
import { ManageUserComponent } from '../manage-user/manage-user.component';
import { ManageAssetComponent } from '../manage-asset/manage-asset.component';
import { UserService } from '../../services/user.service';
import { ManageassetService } from '../../services/asset.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
 
@Component({
  selector: 'app-add-request',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, FormsModule],
  templateUrl:'./add-requests.component.html' ,
  styleUrls: ['./add-requests.component.css'],
})
export class NewRequestComponent implements OnInit {
 
  newRequest: AddRequest = {} as AddRequest;
  currentDateTime: string = '';
  currentDateTimeStart: string = '';
  currentDateTimeEnd: string = '';
 
  users: UserView[] = [];
  assets: Asset[] = [];
 
  constructor(
    private requestService: RequestServices,
    private router: Router,
    private location: Location,
    private userservice: UserService,
    private assetservice: ManageassetService
  ) {}
 
  ngOnInit(): void {
    this.generateRequestNumber();
    this.loadUsers();
    this.loadAssets();
 
    const now = moment();
    this.currentDateTime = now.format('YYYY-MM-DDTHH:mm');
    this.currentDateTimeStart = now.startOf('day').format('YYYY-MM-DDT00:00');
    this.currentDateTimeEnd = now.endOf('day').format('YYYY-MM-DDT23:59');
    this.newRequest.startDateTime = this.currentDateTime;
  }
 
  loadUsers(): void {
    this.userservice.getAllUser().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Failed to load users', err)
    });
  }
 
  loadAssets(): void {
    this.assetservice.getAssets().subscribe({
      next: (data) => this.assets = data,
      error: (err) => console.error('Failed to load assets', err)
    });
  }
 
  generateRequestNumber() {
    const today = new Date();
    const yyyyMMdd = today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0');
    const randomThreeDigit = Math.floor(1 + Math.random() * 999).toString().padStart(3, '0');
    this.newRequest.requestNumber = `REQ-${yyyyMMdd}-${randomThreeDigit}`;
  }
 
  createNew(): void {
    const selectedDateTime = moment(this.newRequest.startDateTime);
    const now = moment();
    if (!selectedDateTime.isSame(now, 'day')) {
      alert('Start date/time must be from today only.');
      return;
    }
 
    this.newRequest.requestDateTime = this.newRequest.startDateTime;
 
    if (this.isFormValid()) {
      this.requestService.createRequest(this.newRequest).subscribe({
        next: () => {
          alert('Request created successfully!');
          this.router.navigate(['/requests']);
        },
        error: (err) => {
          console.error('Error creating request', err);
          alert('Failed to create request.');
        }
      });
    } else {
      alert('Please fill all required fields.');
    }
  }
 
  cancel(): void {
    this.router.navigate(['/requests']);
  }
 
  goBack(): void {
    this.location.back();
  }
 
  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
 
  isFormValid(): boolean {
    return (
      this.newRequest.userId != null &&
      this.newRequest.username != null && this.newRequest.username.trim() !== '' &&
      this.newRequest.requestTypeId != null &&
      this.newRequest.assetId != null &&
      this.newRequest.transactionId != null &&
      this.newRequest.startDateTime != null && this.newRequest.startDateTime.trim() !== '' &&
      this.newRequest.requestStatusId != null
    );
  }
 
  onUserSelect(userId: number): void {
    const selectedUser = this.users.find(u => u.userId === userId);
    if (selectedUser) {
      this.newRequest.username = selectedUser.name;
      this.newRequest.mobileNumber = selectedUser.mobileNumber;
      this.newRequest.email = selectedUser.email;
    }
  }
}