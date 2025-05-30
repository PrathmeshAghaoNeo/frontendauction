import { Component, Input, OnInit } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { UserTransaction } from '../../../modals/manage-transaction';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.css'
})
export class UserTransactionsComponent implements OnInit {
  @Input() userId!: number;
  transactions: UserTransaction[] = [];
  loading = true;
  error = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.transactionService.getUserTransactions(this.userId).subscribe({
      next: data => {
        this.transactions = data;
        this.loading = false;
       
      },
      error: error => {
        this.error = 'Failed to load transactions';
        this.loading = false;
      }
    });
  }
}