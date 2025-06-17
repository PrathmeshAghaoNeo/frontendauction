import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { UserTransaction } from '../../../modals/manage-transaction';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.css',
})
export class UserTransactionsComponent implements OnInit {
  expandedNotes = new Set<number>();
  userId!: number|null;
  transactions: UserTransaction[] = [];
  loading = true;
  error = '';
  page = 1;
  itemsPerPage = 5;

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdJwt();

    this.transactionService.getUserTransactions(this.userId).subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load transactions';
        this.loading = false;
      },
    });
  }

  toggleNote(index: number): void {
    if (this.expandedNotes.has(index)) {
      this.expandedNotes.delete(index);
    } else {
      this.expandedNotes.add(index);
    }
  }

  isLongNote(note: string | null | undefined): boolean {
    return !!note && note.length > 20;
  }
}
