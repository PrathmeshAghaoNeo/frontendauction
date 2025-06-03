import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssetCategoriesService } from '../../../services/assetcategories.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { TransactionService } from '../../../services/transaction.service';
import {
  TransactionMetadataService,
  PaymentMethod,
  TransactionType,
  CardType,
} from '../../../services/transaction-meta.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-deposit-limit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, GoogleMapsModule],
  templateUrl: './deposit-limit.component.html',
  styleUrls: ['./deposit-limit.component.css'], // fixed typo: styleUrl -> styleUrls
})
export class DepositLimitComponent implements OnInit {
  center: google.maps.LatLngLiteral = { lat: 26.2285, lng: 50.5861 };
  zoom = 15;
  markerPosition: google.maps.LatLngLiteral = this.center;
  mapOptions: google.maps.MapOptions = {
    center: this.center,
    zoom: 14,
  };

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  categories: any[] = [];
  selectedCategory: number | null = null;

  totalLimit = 0;
  currentDeposit = 0;
  topUpLimit = 0;
  availableLimit = 0;

  topUpAmount = 400;
  selectedPaymentMethod = '';

  paymentMethodsMeta: PaymentMethod[] = [];
  transactionTypesMeta: TransactionType[] = [];
  cardTypesMeta: CardType[] = [];
  paymentMethods: { label: string; value: string }[] = [];


  uploadedDocumentPath = '';
  currentUserId: number = 0; // TODO: Replace with actual logged-in user ID

  constructor(
    private assetCategoriesService: AssetCategoriesService,
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private metadataService: TransactionMetadataService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.setCurrentLocation();
    const userId = this.authService.getUserIdJwt();
    if (userId === null) {
      alert('User not authenticated. Cannot proceed.');
      return;
    }
    this.currentUserId = userId;
    this.loadUserDepositLimit(userId);
    const cached = this.metadataService.getCachedMetadata();
    if (cached) {
      this.populateMetadata(cached);
    } else {
      this.metadataService.fetchMetadata().subscribe({
        next: (data) => this.populateMetadata(data),
        error: (err) => console.error('Failed to fetch metadata', err),
      });
    }
  }

  populateMetadata(data: {
  paymentMethods: PaymentMethod[];
  transactionTypes: TransactionType[];
  cardTypes: CardType[];
}): void {
  this.paymentMethodsMeta = data.paymentMethods;
  this.transactionTypesMeta = data.transactionTypes;
  this.cardTypesMeta = data.cardTypes;

  this.paymentMethods = data.paymentMethods.map(pm => ({
    label: pm.paymentMethodName,
    value: this.mapPaymentMethodNameToValue(pm.paymentMethodName),
  }));
}
  setCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.center = { lat, lng };
          this.markerPosition = { lat, lng };
          this.zoom = 15;
        },
        (error) => {
          console.error('Error getting location:', error);
          alert(
            'Location access denied or unavailable. Showing default location.'
          );
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  fetchCategories(): void {
    this.assetCategoriesService.getAll().subscribe({
      next: (res) => (this.categories = res),
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod =
      this.selectedPaymentMethod === method ? '' : method;
  }

  uploadDeposit(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum allowed size is 5MB.');
        this.selectedFile = null;
        input.value = ''; // Reset file input
        return;
      }

      this.selectedFile = file;
      console.log('Selected file:', file);

      // TODO: Implement real file upload logic here.
      // For now, simulate upload success:
      this.uploadedDocumentPath = `uploads/${file.name}`;
    }
  }

  increaseLimit(): void {
    this.topUpAmount += 5000;
  }

  decreaseLimit(): void {
    if (this.topUpAmount > 5000) {
      this.topUpAmount -= 5000;
    }
  }

  addTransaction(): void {
    if (!this.selectedPaymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    // Determine if admin approval is required
    const adminApprovalRequiredMethods = ['bank', 'cheque']; // use values matching the keys
    const isManualMethod = adminApprovalRequiredMethods.includes(
      this.selectedPaymentMethod
    );
    const statusId = isManualMethod ? 1 : 3; // 1 = Pending, 3 = Completed

    const transactionBody = {
      amount: this.totalAmount,
      userId: this.currentUserId,
      transactionTypeId: 2, // Deposit type, can be made dynamic if needed
      paymentMethodId: this.getPaymentMethodId(this.selectedPaymentMethod),
      cardTypeId: 1, // You may want to add UI to select cardTypeId or make optional
      merchantTransactionId: this.generateMerchantTransactionId(),
      transactionDateTime: new Date().toISOString(),
      statusId: statusId,
      notes: `Top-up via ${this.selectedPaymentMethod}`,
      documentPath: this.uploadedDocumentPath || '',
    };

    this.transactionService.addTransaction(transactionBody).subscribe({
      next: (res) => {
        console.log('Transaction created:', res);
        alert('Transaction successfully added!');
        // Optionally reset form here or update UI accordingly
      },
      error: (err) => {
        console.error('Transaction failed:', err);
        alert('Failed to add transaction.');
      },
    });
  }

  mapPaymentMethodNameToValue(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('bank')) return 'bank';
    if (lower.includes('cheque')) return 'cheque';
    if (lower.includes('credit')) return 'card';
    if (lower.includes('debit')) return 'card';
    if (lower.includes('benefit')) return 'benefit';
    if (lower.includes('apple')) return 'apple';
    if (lower.includes('google')) return 'google';
    if (lower.includes('paypal')) return 'paypal';
    if (lower.includes('cash')) return 'cash';
    return lower;
  }

  getPaymentMethodId(methodValue: string): number {
    const match = this.paymentMethodsMeta.find(
      (pm) =>
        this.mapPaymentMethodNameToValue(pm.paymentMethodName) === methodValue
    );
    return match?.paymentMethodId ?? 0;
  }

  generateMerchantTransactionId(): string {
    return (
      'MERC' +
      Math.floor(Math.random() * 1_000_000_000)
        .toString()
        .padStart(9, '0')
    );
  }

  onCategoryChange(categoryId: number): void {
    this.selectedCategory = categoryId;
  }

  get depositAmount(): number {
    return this.topUpAmount * 0.1;
  }

  get vatAmount(): number {
    return this.depositAmount * 0.1;
  }

  get totalAmount(): number {
    return this.depositAmount + this.vatAmount;
  }

  get consumedPercentage(): number {
    return ((this.totalLimit - this.availableLimit) / this.totalLimit) * 100;
  }

  getProgressColor(percentage: number): string {
    if (percentage < 50) return 'yellow';
    else if (percentage < 80) return 'green';
    else return 'red';
  }

  loadUserDepositLimit(userId: number): void {
    this.userService.getUserDepositLimits(userId).subscribe({
      next: (res) => {
        this.totalLimit = res.totalLimit;
        this.currentDeposit = res.currentDeposit;
        this.availableLimit = res.availableLimit;
      },
      error: (err) => {
        console.error('Failed to fetch deposit limits', err);
        alert('Unable to fetch deposit limit info.');
      },
    });
  }
}
