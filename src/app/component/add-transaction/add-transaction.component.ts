import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { Location, CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.css']
})
export class AddTransactionComponent implements OnInit {
  transactionForm!: FormGroup;
  minDateTime: string = '';

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
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.setMinDateTime();
    this.initializeForm();
  }

  private setMinDateTime(): void {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    this.minDateTime = istNow.toISOString().slice(0, 16); // format for datetime-local
  }

  private initializeForm(): void {
    this.transactionForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01), Validators.max(99999999)]],
      userId: [null, [Validators.required, Validators.min(1), Validators.max(99999)]],
      transactionTypeId: [null, Validators.required],
      paymentMethodId: [null, Validators.required],
      cardTypeId: [null, Validators.required],
      merchantTransactionId: ['', [
        Validators.required,
        Validators.maxLength(12),
        Validators.pattern(/^MERC\d{0,8}$/)
      ]],
      
      transactionDateTime: [null, Validators.required],
      statusId: [null, Validators.required],
      notes: ['', Validators.maxLength(100)]
    });
  }

  allowedSevenDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    const [integerPart, decimalPart] = input.value.split('.');

    if (integerPart.length > 7) {
      const trimmed = integerPart.slice(0, 7);
      input.value = decimalPart ? `${trimmed}.${decimalPart}` : trimmed;
      this.transactionForm.get('amount')?.setValue(parseFloat(input.value));
    }
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    this.transactionForm.markAllAsTouched();

    if (this.transactionForm.invalid) return;

    const formData = this.transactionForm.value;

    this.http.post(ApiEndpoints.TRANSACTIONS, formData).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Transaction Added Successfully',
          // text: `Transaction Number: ${response}`,
          confirmButtonText: 'OK'
        }).then(() => this.router.navigate(['/transactions']));
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'An error occurred. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
