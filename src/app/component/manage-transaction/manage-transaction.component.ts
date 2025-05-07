import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Transaction } from '../../modals/add-transaction';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, NgClass, NgFor } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-management',
  standalone: true,
  imports: [NgFor, NgClass, NgxPaginationModule, CurrencyPipe, DatePipe, FormsModule, RouterModule],
  templateUrl: './manage-transaction.component.html',
  styleUrls: ['./manage-transaction.component.css']
})
export class TransactionManagementComponent implements OnInit {
  @ViewChild('viewTransactionModal') viewTransactionModal: any;
  @ViewChild('deleteTransactionModal') deleteTransactionModal: any;

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];

  loading = false;
  page = 1;
  itemsPerPage = 10;

  // Filters
  searchText = '';
  filterTransactionType = 0;
  filterPaymentMethod = 0;
  filterStatus = 0;
  dateFilter: string | null = null;

  selectedTransaction: Transaction | null = null;

  // Static Dropdown Lists
  transactionTypes = [
    { id: 1, name: 'Deposit' },
    { id: 2, name: 'Invoice' },
    { id: 3, name: 'Receipt' },
    { id: 4, name: 'Refund' }
  ];

  paymentMethods = [
    { id: 1, name: 'Bank Transfer' },
    { id: 2, name: 'Cash' },
    { id: 3, name: 'Credit Card' },
    { id: 4, name: 'Debit Card' },
    { id: 5, name: 'Online Wallet' }
  ];

  statuses = [
    { id: 1, name: 'Active' },
    { id: 2, name: 'Pending' },
    { id: 3, name: 'Closed' },
    { id: 4, name: 'Completed' }
  ];

  constructor(
    private transactionService: TransactionService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.filteredTransactions = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    const transactionType = Number(this.filterTransactionType);
    const paymentMethod = Number(this.filterPaymentMethod);
    const status = Number(this.filterStatus);
  
    this.filteredTransactions = this.transactions.filter(transaction => {
      const matchesSearch = !search || 
        transaction.transactionNumber?.toLowerCase().includes(search) || 
        transaction.userFullName?.toLowerCase().includes(search);
  
      const matchesTransactionType = transactionType === 0 || transaction.transactionTypeId === transactionType;
      const matchesPaymentMethod = paymentMethod === 0 || transaction.paymentMethodId === paymentMethod;
      const matchesStatus = status === 0 || transaction.statusId === status;
  
      return matchesSearch && matchesTransactionType && matchesPaymentMethod && matchesStatus;
    });
  
    this.page = 1; // Reset to the first page after applying filters
  }
  
  
  clearDateFilter(): void {
    this.dateFilter = null;
    this.applyFilters();
  }

  openViewModal(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.modalService.open(this.viewTransactionModal, { centered: true, size: 'lg' });
  }

  openDeleteModal(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.modalService.open(this.deleteTransactionModal, { centered: true });
  }

  deleteTransactionConfirmed(): void {
    if (this.selectedTransaction) {
      this.loading = true;
      this.transactionService.deleteTransaction(this.selectedTransaction.transactionId).subscribe({
        next: () => {
          this.loadTransactions();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
          this.loading = false;
        }
      });
    }
  }

  getTransactionTypeName(id: number): string {
    const type = this.transactionTypes.find(t => t.id === id);
    return type ? type.name : 'Unknown';
  }

  getPaymentMethodName(id: number): string {
    const method = this.paymentMethods.find(p => p.id === id);
    return method ? method.name : 'Unknown';
  }

  getStatusName(id: number): string {
    return this.statuses.find(s => s.id === id)?.name || 'Unknown';
  }
}
