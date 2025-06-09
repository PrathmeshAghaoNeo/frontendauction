import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location, CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { TransactionMetadata } from '../../services/transaction-meta.service';
import { TransactionService } from '../../services/transaction.service';
import {
  TransactionMetadataService,
  CardType,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
} from '../../services/transaction-meta.service';

@Component({
  selector: 'app-update-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './update-transaction.component.html',
  styleUrls: ['./update-transaction.component.css'],
})
export class UpdateTransactionComponent implements OnInit {
  transactionForm!: FormGroup;
  transactionId!: number;
  minDateTime: string = new Date().toISOString().slice(0, 16);
  cardTypes: CardType[] = [];
  paymentMethods: PaymentMethod[] = [];
  transactionTypes: TransactionType[] = [];
  statuses: TransactionStatus[] = [];

  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private metadataService: TransactionMetadataService
  ) {}

  populateDropdowns(data: any): void {
    this.transactionTypes = [
      { transactionTypeId: 0, transactionTypeName: 'All Transaction Types' },
      ...data.transactionTypes,
    ];
    this.paymentMethods = [
      { paymentMethodId: 0, paymentMethodName: 'All Payment Methods' },
      ...data.paymentMethods,
    ];
    this.cardTypes = [
      { cardTypeId: 0, cardTypeName: 'All Card Types' },
      ...data.cardTypes,
    ];
    this.statuses = [
      { statusId: 0, statusName: 'All Statuses' },
      ...data.statuses,
    ];
  }

  ngOnInit(): void {
    const cached = this.metadataService.getCachedMetadata();
    if (cached) {
      this.populateDropdowns(cached);
    } else {
      this.metadataService.fetchMetadata().subscribe((data) => {
        this.populateDropdowns(data);
      });
    }
    this.transactionId = Number(this.route.snapshot.paramMap.get('id'));

    this.transactionForm = this.fb.group({
      transactionId: [this.transactionId], // <-- ADD THIS
      amount: [
        null,
        [Validators.required, Validators.min(0.01), Validators.max(9999999999)],
      ],
      userId: [
        null,
        [Validators.required, Validators.min(1), Validators.max(99999)],
      ],
      transactionTypeId: [null, Validators.required],
      paymentMethodId: [null, Validators.required],
      cardTypeId: [null, Validators.required],
      merchantTransactionId: [
        '',
        [Validators.maxLength(12), Validators.pattern(/^MERC\d{0,8}$/)],
      ],
      transactionDateTime: [null, Validators.required],
      statusId: [null, Validators.required],
      notes: ['', Validators.maxLength(100)],
      documentPath: ['', Validators.required],
    });

    this.loadTransaction();
  }

  loadTransaction() {
    this.http
      .get<any>(`${ApiEndpoints.TRANSACTIONS}/${this.transactionId}`)
      .subscribe({
        next: (data) => {
          console.log('API Response:', data);

          const transactionTypeId =
            this.transactionTypes.find(
              (type) => type.transactionTypeName === data.transactionType
            )?.transactionTypeId ?? null;

          const paymentMethodId =
            this.paymentMethods.find(
              (method) => method.paymentMethodName === data.paymentMethod
            )?.paymentMethodId ?? null;

          const cardTypeId =
            this.cardTypes.find((card) => card.cardTypeName === data.cardType)
              ?.cardTypeId ?? null;

          const statusId =
            this.statuses.find((status) => status.statusName === data.status)
              ?.statusId ?? null;

          const docpath = 'vhjjkjjkjj';

          // Ensure proper patchValue for the form
          this.transactionForm.patchValue({
            transactionId: data.transactionId, // Ensure correct name
            amount: data.amount,
            userId: data.userId,
            transactionTypeId: transactionTypeId,
            paymentMethodId: paymentMethodId,
            cardTypeId: cardTypeId,
            merchantTransactionId: data.merchantTransactionId,
            transactionDateTime: data.transactionDateTime?.slice(0, 16),
            statusId: statusId,
            notes: data.notes,
            documentPath: docpath,
          });

          console.log('Form after patching:', this.transactionForm.value);
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Failed to load transaction details.', 'error');
        },
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

  restrictMerchantId(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase();

    if (!value.startsWith('MERC')) {
      value = 'MERC';
    }

    const digitsOnly = value.slice(4).replace(/\D/g, '').slice(0, 8);
    input.value = 'MERC' + digitsOnly;
    this.transactionForm.get('merchantTransactionId')?.setValue(input.value);
  }

  allowedTenDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    const [integerPart, decimalPart] = input.value.split('.');
    if (integerPart.length > 10) {
      const trimmed = integerPart.slice(0, 10);
      input.value = decimalPart ? `${trimmed}.${decimalPart}` : trimmed;
      this.transactionForm.get('amount')?.setValue(parseFloat(input.value));
    }
  }

  onSubmit(): void {
    Object.values(this.transactionForm.controls).forEach((control) => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });

    if (this.transactionForm.invalid) {
      console.warn('Form is invalid:', this.transactionForm.value);
      return;
    }

    const updatedData = this.transactionForm.value;
    console.log('Data being sent to backend:', updatedData);

    this.http
      .put(`${ApiEndpoints.TRANSACTIONS}/${this.transactionId}`, updatedData)
      .subscribe({
        next: () => {
          Swal.fire(
            'Success',
            'Transaction updated successfully.',
            'success'
          ).then(() => {
            this.router.navigate(['/transactions']);
          });
        },
        error: (err) => {
          Swal.fire('Error', err.message || 'Update failed.', 'error');
        },
      });
  }

  goBack(): void {
    this.location.back();
  }
}
