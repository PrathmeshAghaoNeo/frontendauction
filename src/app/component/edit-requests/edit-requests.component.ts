import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import Swal from 'sweetalert2';
import { EditRequests } from '../../modals/edit.requests';
import { UserView } from '../../modals/user';
import { Asset } from '../../modals/manage-asset';
import { Transaction } from '../../services/transaction.service';

import { RequestServices } from '../../services/requests.service';
import { UserService } from '../../services/user.service';
import { ManageAssetService } from '../../services/asset.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-edit-requests',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-requests.component.html',
  styleUrls: ['./edit-requests.component.css']
})
export class EditRequestsComponent implements OnInit {
  @ViewChild('requestForm') requestForm!: NgForm;
  requestId!: number;
  requestData: EditRequests = {} as EditRequests;
  isNewRequest: boolean = false;

  users: UserView[] = [];
  assets: Asset[] = [];
  transactions: Transaction[] = [];
  
  // Debug flags
  assetsLoaded: boolean = false;
  assetsError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestServices,
    private location: Location,
    private userService: UserService,
    private assetService: ManageAssetService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
    this.isNewRequest = this.requestId === 0;

    if (this.isNewRequest) {
      // Initialize a new request
      this.requestData = {
        requestId: 0,
        requestNumber: '',
        userId: 0,
        username: '',
        mobileNumber: '',
        email: '',
        requestTypeId: 0,
        assetId: 0,
        transactionId: 0,
        requestDateTime: new Date().toISOString(),
        requestStatusId: 1, // Default to Pending
        customerNote: '',
        adminNote: '',
        createdByAdmin: true,
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
        asset: null,
        requestStatus: null,
        requestType: null,
        tblRequestStatusHistories: [],
        transaction: null,
        user: null
      } as EditRequests;
    } else {
      this.loadRequestData();
    }

    // Load dependencies concurrently
    this.loadDependencies();
  }

  loadRequestData(): void {
    this.requestService.getRequestById(this.requestId).subscribe({
      next: (data) => {
        console.log('Request data loaded:', data);
        this.requestData = data;
      },
      error: (err) => {
        console.error('Error loading request:', err);
        this.showErrorAlert('Error loading request details');
      },
    });
  }

  loadDependencies(): void {
    // Load all dependencies at once
    this.loadUsers();
    this.loadAssets();
    this.loadTransactions();
  }

  loadUsers(): void {
    this.userService.getAllUser().subscribe({
      next: (data) => {
        console.log('Users loaded:', data.length);
        this.users = data;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.showErrorAlert('Failed to load users');
      }
    });
  }

  loadAssets(): void {
    this.assetService.getAssets().subscribe({
      next: (data) => {
        console.log('Assets loaded:', data.length);
        this.assets = data;
        this.assetsLoaded = true;
        
        // Debug: Print first few assets to console
        if (data.length > 0) {
          console.log('Sample assets:', data.slice(0, 3));
        }
      },
      error: (err) => {
        console.error('Failed to load assets', err);
        this.assetsError = err.message || 'Unknown error';
        this.showErrorAlert('Failed to load assets');
      }
    });
  }

  loadTransactions(): void {
    this.transactionService.getAllTransactions().subscribe({
      next: (data) => {
        console.log('Transactions loaded:', data.length);
        this.transactions = data;
      },
      error: (err) => {
        console.error('Failed to load transactions', err);
        this.showErrorAlert('Failed to load transactions');
      }
    });
  }

  onUserChange(event: any): void {
    const selected = this.users.find(u => u.userId === this.requestData.userId);
    if (selected) {
      this.requestData.username = selected.name;
      // You could also populate email if it's available in the user data
    }
  }

  getAssetName(assetId: number): string {
    const a = this.assets.find(x => x.assetId === assetId);
    return a ? (a.title || a.categoryName || 'Unnamed Asset') : 'Unknown';
  }

  getTypeName(id: number): string {
    return ['Unknown', 'Transfer of Ownership', 'Inquiry', 'Request for Viewing', 'Offer'][id] || 'Unknown';
  }

  getStatusName(id: number): string {
    return ['Unknown', 'Pending', 'Done', 'Approved', 'Rejected'][id] || 'Unknown';
  }

  updateRequest(): void {
    if (!this.validateForm()) return;

    const observable = this.isNewRequest
      ? this.requestService.createRequest(this.requestData)
      : this.requestService.updateRequest(this.requestId, this.requestData);

    observable.subscribe({
      next: () => {
        this.showSuccessAlert(
          this.isNewRequest ? 'New Request Created!' : 'Request updated successfully!'
        );
        this.router.navigate(['/requests']);
      },
      error: (err) => {
        console.error('Error saving request:', err);
        this.showErrorAlert(
          this.isNewRequest ? 'Error creating request' : 'Error updating request'
        );
      }
    });
  }

  validateForm(): boolean {
    if (!this.requestData.mobileNumber || this.requestData.mobileNumber.toString().length !== 10) {
      this.showErrorAlert('Please enter a valid 10-digit mobile number'); 
      return false; 
    }
    
    if (!this.requestData.email) { 
      this.showErrorAlert('Email is required'); 
      return false; 
    }
    
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRe.test(this.requestData.email)) { 
      this.showErrorAlert('Please enter a valid email address'); 
      return false; 
    }
    
    if (this.requestData.email.length > 20) { 
      this.showErrorAlert('Email cannot exceed 20 characters'); 
      return false; 
    }
    
    if (!this.requestData.userId) { 
      this.showErrorAlert('Please select a user'); 
      return false; 
    }
    
    if (!this.requestData.assetId) { 
      this.showErrorAlert('Please select an asset'); 
      return false; 
    }
    
    if (!this.requestData.requestTypeId) { 
      this.showErrorAlert('Please select a request type'); 
      return false; 
    }
    
    if (!this.requestData.transactionId) { 
      this.showErrorAlert('Please select a transaction'); 
      return false; 
    }
    
    if (!this.requestData.requestStatusId) { 
      this.showErrorAlert('Please select a status'); 
      return false; 
    }
    
    return true;
  }

  goBack(): void { 
    this.location.back(); 
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const c = event.which || event.keyCode;
    if (c < 48 || c > 57) event.preventDefault();
  }

  showSuccessAlert(msg: string) {
    Swal.fire({ 
      title: 'Success!', 
      text: msg, 
      icon: 'success', 
      confirmButtonText: 'OK', 
      confirmButtonColor: '#3085d6' 
    });
  }

  showErrorAlert(msg: string) {
    Swal.fire({ 
      title: 'Error!', 
      text: msg, 
      icon: 'error', 
      confirmButtonText: 'OK', 
      confirmButtonColor: '#d33' 
    });
  }

  getTransactionDisplay(transactionId: number | null): string {
    if (!transactionId) return '';
  
    const transaction = this.transactions.find(t => t.transactionId === transactionId);
    if (!transaction) return '';
  
    return `${transaction.transactionNumber} - ₹${transaction.amount} - ${transaction.userFullName}`;
  }
  
  isFieldInvalid(field: string): boolean {
    const formField = this.requestForm?.controls?.[field];
    return !!formField && formField.invalid && formField.touched;
  }
}