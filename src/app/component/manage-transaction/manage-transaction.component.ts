import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Transaction } from '../../modals/add-transaction';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe, NgClass, NgFor } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-management',
  standalone: true,
  imports: [NgFor, NgClass, NgxPaginationModule, CurrencyPipe, DatePipe, FormsModule, RouterModule, CommonModule],
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
  itemsPerPage = 5;

  // Filters
  searchText = '';
  filterTransactionType = 0;
  filterPaymentMethod = 0;
  filterStatus = 0;
  filterCardType = 0; // Added card type filter
  filterStartDate: string | null = null;
  filterEndDate: string | null = null;

  selectedTransaction: Transaction | null = null;

  transactionTypes = [
    { id: 1, name: 'Receipt' },
    { id: 2, name: 'Deposit' },
    { id: 3, name: 'Refund' },
    { id: 4, name: 'Invoice' }
  ];

  paymentMethods = [
    { id: 1, name: 'Cash' },
    { id: 2, name: 'Bank Transfer' },
    { id: 3, name: 'Credit Card' },
    { id: 4, name: 'Debit Card' },
    { id: 5, name: 'Online Wallet' }
  ];

  cardTypes = [
    { id: 1, name: 'Visa' },
    { id: 2, name: 'MasterCard' },
    { id: 3, name: 'American Express' },
    { id: 4, name: 'AMEX' },
    { id: 5, name: 'Debit' }
  ];

  statuses = [
    { id: 1, name: 'Pending' },
    { id: 2, name: 'Completed' },
    { id: 3, name: 'Cancelled' },
    { id: 4, name: 'Failed' }
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
        this.transactions = data.sort((a, b) => b.transactionId - a.transactionId);
        this.filteredTransactions = this.applyFilters;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.loading = false;
      }
    });
  }

  get applyFilters(): Transaction[] {
    const search = this.searchText.trim().toLowerCase();
    const status = this.filterStatus?Number(this.filterStatus):0;
    const transactionType = this.filterTransactionType?Number(this.filterTransactionType):0;
    console.log("transactionType"+transactionType);
    const paymentMethod = this.filterPaymentMethod?Number(this.filterPaymentMethod):0;
    const cardType = this.filterCardType?Number(this.filterCardType):0;
    // const startDate = this.filterStartDate?Number(this.filterStartDate):0;
    // const endDate = this.filterEndDate;

    // Filtering logic
    console.log('Transactions before filtering:', this.transactions); //is not eamty here

    return this.transactions.filter(transaction => {
      console.log('Checking transaction:', transaction); //it gives in the console
      // const matchesSearch = !search || transaction.userId;
      const matchesStatus = status === 0 || transaction.statusId === status;
      console.log("match status scalled");
      const matchesTransactionType = transactionType === 0 || transaction.transactionTypeId === transactionType;
      const matchesPaymentMethod = paymentMethod === 0 || transaction.paymentMethodId === paymentMethod;
      const matchesCardType = cardType === 0 || transaction.cardTypeId === cardType;
      // const matchesDateRange = this.isWithinDateRange(transaction.transactionDate, startDate, endDate);

      return    matchesStatus && matchesTransactionType && matchesPaymentMethod && matchesCardType ;

    });
  }

  isWithinDateRange(transactionDate: string, startDate: string | null, endDate: string | null): boolean {
    const transactionDateObj = new Date(transactionDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && transactionDateObj < start) return false;
    if (end && transactionDateObj > end) return false;
    return true;
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterTransactionType = 0;
    this.filterPaymentMethod = 0;
    this.filterStatus = 0;
    this.filterCardType = 0;
    this.filterStartDate = null;
    this.filterEndDate = null;

    this.filteredTransactions = this.applyFilters;
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
          this.loadTransactions(); // Reload transactions after deletion
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
          this.loading = false;
        }
      });
    }
  }

  // Helper methods for getting names based on IDs
  getTransactionTypeName(id: number): string {
    const type = this.transactionTypes.find(t => t.id === id);
    console.log(type);
    return type ? type.name : 'Unknown';
  }

  getPaymentMethodName(id: number): string {
    const method = this.paymentMethods.find(p => p.id === id);
    console.log(method);
    return method ? method.name : 'Unknown';
  }

  getStatusName(id: number): string {

    return this.statuses.find(s => s.id === id)?.name || 'Unknown';
  }

  getCardTypeName(id: number): string {
    const card = this.cardTypes.find(c => c.id === id);
    console.log(card);
    return card ? card.name : 'Unknown';
  }
}
