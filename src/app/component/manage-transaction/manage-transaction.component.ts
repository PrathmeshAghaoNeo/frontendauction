import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Transaction } from '../../modals/add-transaction';
import { TransactionService } from '../../services/transaction.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-transaction-management',
  standalone:true,
  imports:[CurrencyPipe, DatePipe,ReactiveFormsModule,FormsModule,NgxPaginationModule,NgClass,RouterModule,CommonModule],
  templateUrl: './manage-transaction.component.html',
  styleUrls: ['./manage-transaction.component.css']
})
export class TransactionManagementComponent implements OnInit {
  @ViewChild('viewTransactionModal') viewTransactionModal: any;
  @ViewChild('deleteTransactionModal') deleteTransactionModal: any;

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' | '' = ''; // Include '' as a valid option
  loading = false;
  page = 1;
  itemsPerPage = 5;
  searchText = '';
  filterTransactionType = 0;
  filterStatus = 0;
  filterPaymentMethod = 0;
  filterCardType = 0;
  filterStartDate: string | null = null;
  filterEndDate: string | null = null;
  searchTerm: string = '';

  selectedTransaction: Transaction | null = null;

  constructor(
    private transactionService: TransactionService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data.sort((a, b) => b.transactionId - a.transactionId);
        console.log(this.transactions)
        // this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.loading = false;
      }
    });
  }

  get FilteredTransactions(): Transaction[] {
    const search = this.searchText.trim().toLowerCase();
    const cardType = +this.filterCardType;
    const paymentMethod = +this.filterPaymentMethod;
    const statusFilter = +this.filterStatus;

    const transactionTypeFilter = +this.filterTransactionType;

    return this.filteredTransactions = this.transactions.filter((transaction) =>{

       const matchesSearch = this.searchTerm.trim().length === 0 ||
        transaction.userFullName.toString().toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transaction.transactionNumber.toString().toLowerCase().includes(this.searchTerm.toLowerCase())  ||
        transaction.paymentMethodName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transaction.transactionTypeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transaction.cardTypeName?.toLowerCase().includes(this.searchTerm.toLowerCase())||
        transaction.statusName?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesTransactionType = transactionTypeFilter === 0 || transaction.transactionTypeId === transactionTypeFilter;
      const matchesStatus = statusFilter === 0 || transaction.statusId === statusFilter;
      const matchesCardType = cardType === 0 ||  transaction.cardTypeId === cardType;
      const matchesPaymentMethod = paymentMethod === 0 || transaction.paymentMethodId === paymentMethod;

       return matchesTransactionType && matchesStatus && matchesCardType && matchesSearch && matchesPaymentMethod;
     });
    }

    

  isWithinDateRange(transactionDate: Date | string, startDate: string | null, endDate: string | null): boolean {
    const txnDate = new Date(transactionDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && txnDate < start) return false;
    if (end && txnDate > end) return false;
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
  }


  

  sortTransactions(column: string): void {

  if (this.sortColumn === column) {
    if (this.sortDirection === 'asc') {
      this.sortDirection = 'desc';      
    } else if (this.sortDirection === 'desc') {
      this.sortDirection = '';
    } else {
      this.sortDirection = 'asc';
    }
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  if (this.sortDirection === '') {
    this.transactions = [...this.filteredTransactions];
    this.FilteredTransactions; // reapply filters if needed
    return;
  }
  
  const dir = this.sortDirection === 'asc' ? 1 : -1;
  
  this.transactions.sort((a, b) => {
    const valA = (a as any)[column];
    const valB = (b as any)[column];

    if (column.includes('Date') || column.includes('date')) {
      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();
      
      if (dateA < dateB) return -1 * dir;
      if (dateA > dateB) return 1 * dir;
      return 0;
    }

    const strA = valA?.toString().toLowerCase();
    const strB = valB?.toString().toLowerCase();

    if (strA < strB) return -1 * dir;
    if (strA > strB) return 1 * dir;
    return 0;
  });
}




  onFilterChange(): void {
    this.page = 1;
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
}
