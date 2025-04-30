import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import moment from 'moment';
import { Location } from '@angular/common';
import { AddRequest } from '../../modals/add-requests';
import { RequestServices } from '../../services/requests.service';
 
@Component({
  selector: 'app-add-request',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl:'./add-requests.component.html',
  styleUrls: ['./add-requests.component.css'],
})
export class NewRequestComponent implements OnInit {
 
  newRequest: AddRequest = {} as AddRequest;
 
  currentDateTime: string = '';
  currentDateTimeStart: string = '';
  currentDateTimeEnd: string = '';
 
  constructor(
    private requestService: RequestServices,
    private router: Router,
    private location: Location
   
  ) {}
 
  goBack(): void {
    this.location.back();
  }
 
  ngOnInit(): void {
    this.generateRequestNumber();
 
    const now = moment();
    this.currentDateTime = now.format('YYYY-MM-DDTHH:mm');
    this.currentDateTimeStart = now.startOf('day').format('YYYY-MM-DDT00:00');
    this.currentDateTimeEnd = now.endOf('day').format('YYYY-MM-DDT23:59');
    this.newRequest.startDateTime = this.currentDateTime;
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
 
    // ✅ Validate: Only today's date allowed
    if (!selectedDateTime.isSame(now, 'day')) {
      alert('Start date/time must be from today only.');
      return;
    }
 
    //  Copy startDateTime into requestDateTime before saving
    this.newRequest.requestDateTime = this.newRequest.startDateTime;
 
    // Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = this.newRequest.email != null && emailRegex.test(this.newRequest.email.trim());
    if (!isEmailValid) {
      alert('Email is invalid. Please enter a valid email address.');
      return;
    }
 
    //  Mobile Number Length Validation
    const isMobileValid =
      typeof this.newRequest.mobileNumber === 'string' &&
      this.newRequest.mobileNumber.trim().length === 10 &&
      /^[0-9]+$/.test(this.newRequest.mobileNumber); // Optional: check for numeric only
 
    if (!isMobileValid) {
      alert('Mobile number must be exactly 10 digits and numeric only.');
      return;
    }
 
    //  Check All Other Fields
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
 
 
 
// Validate the mobile number length
isMobileNumberValid(): boolean {
  // Ensure mobileNumber is treated as a string and check if its length is exactly 10
  return typeof this.newRequest.mobileNumber === 'string' && this.newRequest.mobileNumber.length === 10;
}
 
 
 
  cancel(): void {
    this.router.navigate(['/requests']);
  }
 
  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
 
 
 
  isFormValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
    return (
      this.newRequest.userId != null &&
      this.newRequest.username != null && this.newRequest.username.trim() !== '' &&
      this.newRequest.requestTypeId != null &&
      this.newRequest.assetId != null &&
      this.newRequest.transactionId != null &&
      this.newRequest.startDateTime != null && this.newRequest.startDateTime.trim() !== '' &&
      this.newRequest.requestStatusId != null &&
      typeof this.newRequest.mobileNumber === 'string' && this.newRequest.mobileNumber.length === 10 &&
      this.newRequest.email != null &&
      emailRegex.test(this.newRequest.email.trim())
    );
  }
 
 
}
 