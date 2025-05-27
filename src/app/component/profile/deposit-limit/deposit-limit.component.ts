import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssetCategoriesService } from '../../../services/assetcategories.service';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-deposit-limit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, GoogleMapsModule],
  templateUrl: './deposit-limit.component.html',
  styleUrl: './deposit-limit.component.css'
})
export class DepositLimitComponent implements OnInit {
  center: google.maps.LatLngLiteral = { lat: 26.2285, lng: 50.5861 }; // fallback
  zoom = 15;
  markerPosition: google.maps.LatLngLiteral = this.center;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedFile: File | null = null;
  categories: any[] = [];
  selectedCategory: any = null;
  totalLimit: number = 500000;
  currentDeposit: number = 20000;
  topUpLimit: number = 300000;
  selectedPaymentMethod: string = '';
  paymentMethods = [
    { label: 'Bank Transfer', value: 'bank' },
    { label: 'Cheque', value: 'cheque' },
    { label: 'Credit Card', value: 'card' },
    { label: 'Benefit', value: 'benefit' },
    { label: 'Apple Pay', value: 'apple' },
    { label: 'Google Pay', value: 'google' },
    { label: 'Paypal', value: 'paypal' }
  ];
  topUpAmount: number = 400000;
  availableLimit: number = 250000;

  constructor(private assetCategoriesService: AssetCategoriesService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.fetchCategories();
    this.setCurrentLocation();
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
  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = this.selectedPaymentMethod === method ? '' : method;
  }
  fetchCategories(): void {
    this.assetCategoriesService.getAll().subscribe(res => {
      this.categories = res;

    });
  }

  uploadDeposit(): void {
    this.fileInput.nativeElement.click(); // Trigger the file input click
  }
  mapOptions: google.maps.MapOptions = {
    center: { lat: 26.2285, lng: 50.5861 }, // Coordinates for Manama, Bahrain
    zoom: 14
  };
  // markerPosition: google.maps.LatLngLiteral = {
  //   lat: 26.2285,
  //   lng: 50.5861
  // };

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);

      // Optional: validate file type/size
      if (this.selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File is too large. Maximum allowed size is 5MB.');
        this.selectedFile = null;
        return;
      }

      // TODO: Upload to backend if required
      // this.uploadToServer(this.selectedFile);
    }
  }
  getProgressColor(percentage: number): string {
    if (percentage < 50) {
      return 'yellow';
    } else if (percentage < 80) {
      return 'green';
    } else {
      return 'red';
    }
  }

  get depositAmount(): number {
    return this.topUpAmount * 0.10;
  }

  get vatAmount(): number {
    return this.depositAmount * 0.10;
  }

  get totalAmount(): number {
    return this.depositAmount + this.vatAmount;
  }

  get consumedPercentage(): number {
    return (this.availableLimit / this.totalLimit) * 100;
  }

  onCategoryChange(categoryId: number) {
    this.selectedCategory = categoryId;
  }
  increaseLimit(): void {
    this.topUpAmount += 5000;
  }


  decreaseLimit(): void {
    if (this.topUpAmount > 5000) {
      this.topUpAmount -= 5000;
    }
  }

}
