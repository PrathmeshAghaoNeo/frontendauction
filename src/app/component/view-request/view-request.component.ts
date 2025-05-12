import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

import { EditRequests } from '../../modals/edit.requests';
import { UserView } from '../../modals/user';
import { Asset } from '../../modals/manage-asset';

import { RequestServices } from '../../services/requests.service';
import { UserService } from '../../services/user.service';
import { ManageAssetService } from '../../services/asset.service';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../modals/manage-transaction';

@Component({
  selector: 'app-view-request',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-request.component.html',
  styleUrls: ['./view-request.component.css']
})
export class ViewRequestComponent implements OnInit {
  requestId!: number;
  requestData: EditRequests = {} as EditRequests;
  
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
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.requestId === 0) {
      this.showErrorAlert('Invalid request ID');
      this.goBack();
    } else {
      this.loadRequestDetails();
      this.loadReferenceData();
    }
  }

  loadRequestDetails(): void {
    this.requestService.getRequestById(this.requestId).subscribe({
      next: (data) => {
        this.requestData = data;
      },
      error: (err) => {
        console.error('Error loading request:', err);
        this.showErrorAlert('Error loading request details');
        this.goBack();
      }
    });
  }

  loadReferenceData(): void {
    this.loadUsers();
    this.loadAssets();
    this.loadTransactions();
  }

  loadUsers(): void {
    this.userService.getAllUser().subscribe({
      next: (data) => this.users = data,
      error: (err) => {
        console.error('Failed to load users', err);
      }
    });
  }

  loadAssets(): void {
    this.assetService.getAssets().subscribe({
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

  getAssetName(assetId: number): string {
    const a = this.assets.find(x => x.assetId === assetId);
    return a ? (a.title || a.categoryName) : 'Unknown';
  }

  getTypeName(id: number): string {
    return ['Unknown', 'Transfer of Ownership', 'Inquiry', 'Request for Viewing', 'Offer'][id] || 'Unknown';
  }

  getStatusName(id: number): string {
    return ['Unknown', 'Pending', 'Done', 'Approved', 'Rejected'][id] || 'Unknown';
  }

  getTransactionDisplay(transactionId: number | null): string {
    if (!transactionId) return 'N/A';
  
    const transaction = this.transactions.find(t => t.transactionId === transactionId);
    if (!transaction) return 'Unknown';
  
    return `${transaction.transactionNumber} - ₹${transaction.amount} - ${transaction.userFullName}`;
  }

  navigateToEdit(): void {
    this.router.navigate(['/request-detail', this.requestId]);
  }

  goBack(): void {
    this.location.back();
  }

  showErrorAlert(msg: string): void {
    Swal.fire({ 
      title: 'Error!', 
      text: msg, 
      icon: 'error', 
      confirmButtonText: 'OK', 
      confirmButtonColor: '#d33' 
    });
  }
}