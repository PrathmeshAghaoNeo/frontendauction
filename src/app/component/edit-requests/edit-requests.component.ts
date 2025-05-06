import { Component, OnInit, ViewChild } from '@angular/core';
import { EditRequests } from '../../modals/edit.requests';
import { UserView } from '../../modals/user';
import { Asset } from '../../modals/manage-asset';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestServices } from '../../services/requests.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ManageAssetService } from '../../services/asset.service';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../services/transaction.service';
import Swal from 'sweetalert2'; // Import SweetAlert

@Component({
  selector: 'app-edit-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-requests.component.html',
  styleUrl: './edit-requests.component.css'
})
export class EditRequestsComponent implements OnInit {
    @ViewChild('requestForm') requestForm!: NgForm;
    requestId!: number;
    requestData: EditRequests = {} as EditRequests;
    isViewMode: boolean = false; // Flag to toggle between view and edit mode
    mode: string = 'view';
    
    // Add missing properties referenced in the template
    users: UserView[] = [];
    assets: Asset[] = [];
    transactions: Transaction[] = [];
   
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestServices,
    private location: Location,
    private userService: UserService,
    private assetService: ManageAssetService,
    private transactionService: TransactionService // Add TransactionService
  ) {}
 
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || 'view';
    });
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
 
    // Check if it's view-only mode
    const url = this.router.url;
    this.isViewMode = url.includes('view'); // If URL contains 'view', set to view mode
 
    if (this.requestId === 0) {
      this.requestData = {} as EditRequests;
    } else {
      this.requestService.getRequestById(this.requestId).subscribe({
        next: (data) => (this.requestData = data),
        error: (err) => {
          console.error('Error loading request:', err);
          this.showErrorAlert('Error loading request details');
        },
      });
    }

    // Load users and assets
    this.loadUsers();
    this.loadAssets();
    this.loadTransactions(); // Load transactions
  }
  
  // Add missing methods referenced in the template
  loadUsers(): void {
    this.userService.getAllUser().subscribe({
      next: (data) => this.users = data,
      error: (err) => {
        console.error('Failed to load users', err);
        this.showErrorAlert('Failed to load users');
      }
    });
  }

  loadAssets(): void {
    this.assetService.getAssets().subscribe({
      next: (data) => this.assets = data,
      error: (err) => {
        console.error('Failed to load assets', err);
        this.showErrorAlert('Failed to load assets');
      }
    });
  }
  
  // Add loadTransactions method
  loadTransactions(): void {
    this.transactionService.getAllTransactions().subscribe({
      next: (data) => this.transactions = data,
      error: (err) => {
        console.error('Failed to load transactions', err);
        this.showErrorAlert('Failed to load transactions');
      }
    });
  }

  // Add onUserChange method
  onUserChange(event: any): void {
    const selectedUser = this.users.find(user => user.userId === this.requestData.userId);
    if (selectedUser) {
      this.requestData.username = selectedUser.name;
    }
  }

  // Add getAssetName method
  getAssetName(assetId: number): string {
    if (!assetId || !this.assets.length) return 'Unknown';
    
    const asset = this.assets.find(a => a.assetId === assetId);
    return asset ? (asset.title || asset.categoryName) : 'Unknown';
  }
  
  // Add getTransactionLabel method
  getTransactionLabel(transactionId: number): string {
    if (!transactionId || !this.transactions.length) return 'Unknown';
    
    const transaction = this.transactions.find(t => t.transactionId === transactionId);
    if (!transaction) return 'Unknown';
    
    return `${transaction.transactionNumber} - ${transaction.amount} - ${transaction.userFullName}`;
  }
 
  updateRequest(): void {
    if (this.isViewMode) return; // 🛑 Prevent updates in view mode
    
    // Validate form before submitting
    if (!this.validateForm()) {
      return;
    }

    if (this.requestId === 0) {
      this.requestService.createRequest(this.requestData).subscribe({
        next: () => {
          this.showSuccessAlert('New Request Created!');
          this.router.navigate(['/requests']);
        },
        error: (err) => {
          console.error('Error creating request:', err);
          this.showErrorAlert('Error creating request');
        },
      });
    } else {
      this.requestService.updateRequest(this.requestId, this.requestData).subscribe({
        next: () => {
          this.showSuccessAlert('Request updated successfully!');
          this.router.navigate(['/requests']);
        },
        error: (err) => {
          console.error('Error updating request:', err);
          this.showErrorAlert('Error updating request');
        },
      });
    }
  }
  
  // Form validation
  validateForm(): boolean {
    // Check mobile number validation
    if (!this.requestData.mobileNumber || this.requestData.mobileNumber.toString().length !== 10) {
      this.showErrorAlert('Please enter a valid 10-digit mobile number');
      return false;
    }
    
    // Check email validation
    if (!this.requestData.email) {
      this.showErrorAlert('Email is required');
      return false;
    }
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;
    if (!emailPattern.test(this.requestData.email)) {
      this.showErrorAlert('Please enter a valid email address');
      return false;
    }
    
    if (this.requestData.email.length > 20) {
      this.showErrorAlert('Email cannot exceed 20 characters');
      return false;
    }
    
    // Check required fields
    if (!this.requestData.userId || this.requestData.userId === 0) {
      this.showErrorAlert('Please select a user');
      return false;
    }
    
    if (!this.requestData.assetId || this.requestData.assetId === 0) {
      this.showErrorAlert('Please select an asset');
      return false;
    }
    
    if (!this.requestData.requestTypeId || this.requestData.requestTypeId === 0) {
      this.showErrorAlert('Please select a request type');
      return false;
    }
    
    // Validate transaction ID (now it's a dropdown)
    if (!this.requestData.transactionId || this.requestData.transactionId === 0) {
      this.showErrorAlert('Please select a transaction');
      return false;
    }
    
    if (!this.requestData.requestStatusId || this.requestData.requestStatusId === 0) {
      this.showErrorAlert('Please select a status');
      return false;
    }
    
    return true;
  }
 
  goBack(): void {
    this.location.back(); // This takes the user back to the previous page
  }
 
  getTypeName(typeId: number): string {
    switch (typeId) {
      case 1: return 'Transfer of Ownership';
      case 2: return 'Inquiry';
      case 3: return 'Request for Viewing';
      case 4: return 'Offer';
      default: return 'Unknown';
    }
  }
 
  getStatusName(statusId: number): string {
    switch (statusId) {
      case 1: return 'Pending';
      case 2: return 'Done';
      case 3: return 'Approved';
      case 4: return 'Rejected';
      default: return 'Unknown';
    }
  }
 
  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  
  // SweetAlert helper methods
  showSuccessAlert(message: string): void {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6'
    });
  }
  
  showErrorAlert(message: string): void {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33'
    });
  }
}