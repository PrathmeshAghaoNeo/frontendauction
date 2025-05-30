import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssetCategoriesService } from '../../../services/assetcategories.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { TransactionService } from '../../../services/transaction.service';
import { TransactionMetadataService, PaymentMethod, TransactionType, CardType } from '../../../services/transaction-meta.service';

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

  totalLimit = 500000;
  currentDeposit = 20000;
  topUpLimit = 300000;

  selectedPaymentMethod = '';

  paymentMethodsMeta: PaymentMethod[] = [];
  transactionTypesMeta: TransactionType[] = [];
  cardTypesMeta: CardType[] = [];

  // These are redundant with paymentMethodsMeta but you might want them for UI if needed
  paymentMethods = [
    { label: 'Bank Transfer', value: 'bank' },
    { label: 'Cheque', value: 'cheque' },
    { label: 'Credit Card', value: 'card' },
    { label: 'Benefit', value: 'benefit' },
    { label: 'Apple Pay', value: 'apple' },
    { label: 'Google Pay', value: 'google' },
    { label: 'Paypal', value: 'paypal' },
  ];

  topUpAmount = 400000;
  availableLimit = 250000;

  uploadedDocumentPath = '';
  currentUserId = 1; // TODO: Replace with actual logged-in user ID

  constructor(
    private assetCategoriesService: AssetCategoriesService,
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private metadataService: TransactionMetadataService
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.setCurrentLocation();

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
          alert('Location access denied or unavailable. Showing default location.');
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
    this.selectedPaymentMethod = this.selectedPaymentMethod === method ? '' : method;
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
    const isManualMethod = adminApprovalRequiredMethods.includes(this.selectedPaymentMethod);
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

  getPaymentMethodId(method: string): number {
    const map: Record<string, number> = {
      bank: 1,
      cheque: 2,
      card: 3,
      benefit: 4,
      apple: 5,
      google: 6,
      paypal: 7,
    };
    return map[method] ?? 0;
  }

  generateMerchantTransactionId(): string {
    return 'MERC' + Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
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
    return (this.availableLimit / this.totalLimit) * 100;
  }

  getProgressColor(percentage: number): string {
    if (percentage < 50) return 'yellow';
    else if (percentage < 80) return 'green';
    else return 'red';
  }
}
