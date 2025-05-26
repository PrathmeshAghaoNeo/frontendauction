import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-refund-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './refund-request.component.html',
  styleUrls: ['./refund-request.component.css'],
})
export class RefundRequestComponent implements OnInit {
  maxRefundAmount: number = 0;

  refundDetails = {
    amount: '',
    submissionDate: new Date().toISOString(),
    status: 'Pending Approval',
    reference: 'C1879852',
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private http: HttpClient,
    public router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserIdJwt();
    if (!userId) {
      alert('User not logged in');
      return;
    }

    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        if (user.deposit != null) {
          this.maxRefundAmount = user.deposit;
          this.refundDetails.amount = user.deposit.toString();
        } else {
          this.maxRefundAmount = 0;
          this.refundDetails.amount = '0';
        }
      },
      error: (err) => {
        console.error('Failed to fetch user:', err);
        alert('Could not load user details.');
      },
    });
  }

  validateRefundAmount(): void {
    const value = parseFloat(this.refundDetails.amount);
    if (value > this.maxRefundAmount) {
      alert(`Refund amount cannot exceed BHD ${this.maxRefundAmount}`);
      this.refundDetails.amount = this.maxRefundAmount.toString();
    }
  }

  createRefundTransaction(): void {
    const userId = this.authService.getUserIdJwt();
    if (!userId) {
      alert('User not logged in.');
      return;
    }

    const amount = parseFloat(this.refundDetails.amount);
    if (amount <= 0 || amount > this.maxRefundAmount) {
      alert(`Refund amount must be between 1 and ${this.maxRefundAmount}`);
      return;
    }

    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        const payload = {
          amount: amount,
          userId: user.userId,
          transactionTypeId: '3', // Refund
          paymentMethodId: '2',
          cardTypeId: '2',
          merchantTransactionId: 'MERC' + this.refundDetails.reference,
          transactionDateTime: new Date().toISOString().slice(0, 16),
          statusId: '1',
          notes: 'Refund requested via UI',
          documentPath:
            'documents/refund/' + this.refundDetails.reference + '.pdf',
          createdBy: user.userId,
        };

        this.http.post(ApiEndpoints.TRANSACTIONS, payload).subscribe({
          next: () => {
            alert('Refund request submitted successfully.');
            this.router.navigate(['/transactions']);
          },
          error: (err) => {
            console.error('Refund creation failed:', err);
            alert('Failed to submit refund.');
          },
        });
      },
      error: (err) => {
        console.error('User fetch failed:', err);
        alert('Could not retrieve user information.');
      },
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
  parseAmount(value: string): number {
    return parseFloat(value || '0');
  }
}
