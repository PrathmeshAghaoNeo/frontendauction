import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { Location, CommonModule } from '@angular/common';
import {
  TransactionMetadataService,
  CardType,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
} from '../../services/transaction-meta.service';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.css'],
})
export class AddTransactionComponent implements OnInit {
  transactionForm!: FormGroup;
  minDateTime: string = '';
  submitting = false;
  cardTypes: CardType[] = [];
  paymentMethods: PaymentMethod[] = [];
  transactionTypes: TransactionType[] = [];
  statuses: TransactionStatus[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private metadataService: TransactionMetadataService
  ) {}

  ngOnInit(): void {
    this.setMinDateTime();
    this.initializeForm();
    this.setupCardValidation();
    this.loadMetadata(); // ← Add this
  }

  private setMinDateTime(): void {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    this.minDateTime = istNow.toISOString().slice(0, 16);
  }

  private initializeForm(): void {
    this.transactionForm = this.fb.group({
      amount: [
        null,
        [Validators.required, Validators.min(0.01), Validators.max(99999999)],
      ],
      userId: [
        null,
        [Validators.required, Validators.min(1), Validators.max(99999)],
      ],
      paymentMethodId: [null, Validators.required],
      cardTypeId: [null], // will be required conditionally
      transactionTypeId: [null, Validators.required],
      merchantTransactionId: [
        '',
        [Validators.maxLength(12), Validators.pattern(/^MERC\d{0,8}$/)],
      ],
      transactionDateTime: [null, Validators.required],
      statusId: [null, Validators.required],
      notes: ['', Validators.maxLength(100)],
    });
  }

  private setupCardValidation(): void {
    this.transactionForm
      .get('paymentMethodId')
      ?.valueChanges.subscribe((val) => {
        const cardControl = this.transactionForm.get('cardTypeId');
        if (val === 3 || val === 4) {
          cardControl?.setValidators([Validators.required]);
        } else {
          cardControl?.clearValidators();
        }
        cardControl?.updateValueAndValidity();
      });
  }

  loadMetadata(): void {
    const cached = this.metadataService.getCachedMetadata();
    if (cached) {
      this.populateDropdowns(cached);
    } else {
      this.metadataService
        .fetchMetadata()
        .subscribe((data) => this.populateDropdowns(data));
    }
  }

  populateDropdowns(data: any): void {
    this.transactionTypes = data.transactionTypes;
    this.paymentMethods = data.paymentMethods;
    this.cardTypes = data.cardTypes;
    this.statuses = data.statuses;
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

    this.submitting = true;
    const formData = this.transactionForm.value;

    // Auto-generate merchantTransactionId if needed
    if (
      !formData.merchantTransactionId &&
      (formData.paymentMethodId === 3 || formData.paymentMethodId === 4)
    ) {
      formData.merchantTransactionId =
        'MERC' +
        Math.floor(Math.random() * 1_000_000_000)
          .toString()
          .padStart(8, '0');
    }

    // Clean notes
    formData.notes = formData.notes?.trim();

    this.http.post(ApiEndpoints.TRANSACTIONS, formData).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Transaction Added Successfully',
          confirmButtonText: 'OK',
        }).then(() => this.router.navigate(['/transactions']));
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'An error occurred. Please try again.',
          confirmButtonText: 'OK',
        });
      },
      complete: () => {
        this.submitting = false;
      },
    });
  }
}
