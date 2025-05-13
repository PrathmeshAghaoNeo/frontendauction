import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import moment from 'moment';
import { AddRequest } from '../../modals/add-requests';
import { UserView } from '../../modals/user';
import { Asset } from '../../modals/manage-asset';
import { RequestServices } from '../../services/requests.service';
import { UserService } from '../../services/user.service';
import { ManageAssetService } from '../../services/asset.service';
import { TransactionService } from '../../services/transaction.service';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { Transaction } from '../../modals/manage-transaction';

@Component({
  selector: 'app-add-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,RouterModule],
  templateUrl: './add-requests.component.html',
  styleUrls: ['./add-requests.component.css'],
  // imports: [CommonModule, RouterModule, FormsModule]
  
})
export class AddRequestsComponent implements OnInit {
  @ViewChild('formRef') formRef!: NgForm;
  
  newRequest: AddRequest = {} as AddRequest;
  currentDateTime: string = '';
  users: UserView[] = [];
  assets: Asset[] = [];
  transactions: Transaction[] = [];
  selectedUsername: string = '';
  
  // Form submission tracking
  formSubmitted = false;
  successMessage: string | null = null;

  constructor(
    private requestService: RequestServices,
    private router: Router,
    private location: Location,
    private userservice: UserService,
    private assetservice: ManageAssetService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    // Load server-generated template including requestNumber
    this.requestService.getNewTemplate().subscribe({
      next: template => {
        this.newRequest = template;
        // Initialize as numbers to ensure correct data types
        this.newRequest.requestStatusId = 1;
        this.newRequest.requestTypeId = 1;
        this.newRequest.transactionId = null;
        this.newRequest.createdByAdmin = false;
        
        // initialize date fields
        const now = moment();
        this.currentDateTime = now.format('YYYY-MM-DDTHH:mm');
        this.newRequest.requestDateTime = this.currentDateTime;
      },
      error: err => {
        console.error('Failed to load template', err);
      }
    });

    this.loadUsers();
    this.loadAssets();
    this.loadTransactions();
  }

  loadUsers(): void {
    this.userservice.getAllUser().subscribe({
      next: (data) => this.users = data,
      error: (err) => {
        console.error('Failed to load users', err);
      }
    });
  }

  loadAssets(): void {
    this.assetservice.getAssets().subscribe({
      next: (data) => this.assets = data,
      error: (err) => {
        console.error('Failed to load assets', err);
      }
    });
  }

  loadTransactions(): void {
    this.transactionService.getAllTransactions().subscribe({
      next: (data) => this.transactions = data,
      error: (err) => {
        console.error('Failed to load transactions', err);
      }
    });
  }

  // Update username when user changes
  onUserChange(): void {
    const selectedUser = this.users.find(user => user.userId === this.newRequest.userId);
    if (selectedUser) {
      this.selectedUsername = selectedUser.name;
      this.newRequest.username = selectedUser.name; // Add username to request
      
      // Optionally filter transactions by selected user
      // You can implement this if needed
    }
  }

  validateForm(): boolean {
    this.formSubmitted = true; // Mark form as submitted to show validation messages
    
    // Check each required field individually
    
    // User validation
    if (!this.newRequest.userId) {
      return false;
    }
    
    // Mobile Number validation
    if (!this.newRequest.mobileNumber) {
      return false;
    }
    
    const isMobileValid =
      typeof this.newRequest.mobileNumber === 'string' &&
      this.newRequest.mobileNumber.trim().length === 10 &&
      /^[0-9]+$/.test(this.newRequest.mobileNumber);

    if (!isMobileValid) {
      return false;
    }
    
    // Email validation
    if (!this.newRequest.email) {
      return false;
    }
    
    // More robust email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.newRequest.email.trim())) {
      return false;
    }
    
    // Request Type validation
    if (!this.newRequest.requestTypeId) {
      return false;
    }
    
    // Asset validation
    if (!this.newRequest.assetId) {
      return false;
    }
    
    // Transaction ID validation
    if (this.newRequest.transactionId === null || this.newRequest.transactionId === undefined) {
      return false;
    }
    
    // Date validation
    if (!this.newRequest.requestDateTime) {
      return false;
    }
    
    const selectedDateTime = moment(this.newRequest.requestDateTime);
    const now = moment();
    if (!selectedDateTime.isSame(now, 'day')) {
      return false;
    }
    
    // Status validation
    if (!this.newRequest.requestStatusId) {
      return false;
    }

    return true;
  }

  createNew(): void {
    if (!this.validateForm()) {
      return;
    }

    // Prepare the request object - ensure numeric types
    const requestToSubmit: AddRequest = {
      ...this.newRequest,
      // Convert string values to numbers
      userId: Number(this.newRequest.userId),
      requestTypeId: Number(this.newRequest.requestTypeId),
      assetId: Number(this.newRequest.assetId),
      transactionId: this.newRequest.transactionId ? Number(this.newRequest.transactionId) : null,
      requestStatusId: Number(this.newRequest.requestStatusId),
      // Ensure other fields are properly set
      createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
      updatedOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS')
    };

    console.log('Submitting request:', requestToSubmit);

    this.requestService.createRequest(requestToSubmit).subscribe({
      next: () => {
        this.successMessage = 'Request successfully submitted!';
        // Display success message for 2 seconds before navigating
        setTimeout(() => {
          this.router.navigate(['/requests']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error creating request', err);
      }
    });
  }

  // Check if field is invalid and touched (for template validation display)
  isFieldInvalid(fieldName: string): boolean {
    if (!this.formRef) return false;
    
    const control = this.formRef.form.get(fieldName);
    return control ? (control.invalid && (control.touched || this.formSubmitted)) : false;
  }

  // Get validation message for a field
  getErrorMessage(fieldName: string): string {
    if (!this.formRef) return '';
    
    const control = this.formRef.form.get(fieldName);
    if (!control || !control.errors) return '';
    
    // Return appropriate error message based on error type
    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['pattern']) {
      if (fieldName === 'mobileNumber') return 'Mobile number must be exactly 10 digits';
      if (fieldName === 'email') return 'Please enter a valid email address';
      return 'Invalid format';
    }
    if (control.errors['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['maxlength']) return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
    
    return 'Invalid value';
  }

  // Get transaction display text for the dropdown
  getTransactionLabel(transaction: Transaction): string {
    return `${transaction.transactionNumber} - ${transaction.amount} - ${transaction.userFullName}`;
  }

  cancel(): void {
    // delete the prepared number then go back
    if (this.newRequest.requestNumber) {
      this.requestService.deleteByNumber(this.newRequest.requestNumber)
        .subscribe({
          next: () => this.location.back(),
          error: err => {
            console.error('Failed to delete request number', err);
            this.location.back();
          }
        });
    } else {
      this.location.back();
    }
  }

  goBack(): void {
    this.cancel();
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  allowAlphaNumericAndHyphen(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z0-9\-]$/;
    const inputChar = event.key;
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}