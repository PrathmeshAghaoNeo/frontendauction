import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  isModalOpen = false;

  assetData: any[] = [];
  assetNames: string[] = [];
  priceRanges: string[] = [];
  durations: string[] = [];

  selectedAssetNames: { [key: string]: boolean } = {};
  selectedPriceRanges: { [key: string]: boolean } = {};
  selectedDurations: { [key: string]: boolean } = {};

  minPrice = 0;
  maxPrice = 10000;
  priceRange: [number, number] = [0, 10000];

  constructor() {}

  ngOnInit() {
    this.fetchAssetData();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  fetchAssetData() {
    // TODO: Replace with actual API call
    // Example: fetch('http://localhost:62627/api/Assets/directsaleasset?categoryId=44')
    //   .then(res => res.json())
    //   .then(data => { this.assetData = data; this.extractFilterOptions(); });
    // For now, use placeholder data:
    this.assetData = [
      { name: 'Asset 1', price: 500, duration: '1 month' },
      { name: 'Asset 2', price: 1500, duration: '3 months' },
      { name: 'Asset 3', price: 1000, duration: '6 months' }
    ];
    this.extractFilterOptions();
  }

  extractFilterOptions() {
    // Asset Names
    this.assetNames = Array.from(new Set(this.assetData.map(a => a.name)));
    this.assetNames.forEach(name => this.selectedAssetNames[name] = false);

    // Price Ranges (example: you can adjust this logic)
    const prices = this.assetData.map(a => a.price);
    this.minPrice = Math.min(...prices);
    this.maxPrice = Math.max(...prices);
    this.priceRange = [this.minPrice, this.maxPrice];
    // Example price ranges (can be improved)
    this.priceRanges = [
      `Min to ${this.maxPrice/2}`,
      `${this.maxPrice/2 + 1} to ${this.maxPrice}`
    ];
    this.priceRanges.forEach(range => this.selectedPriceRanges[range] = false);

    // Durations
    this.durations = Array.from(new Set(this.assetData.map(a => a.duration)));
    this.durations.forEach(duration => this.selectedDurations[duration] = false);
  }

  applyFilter() {
    // TODO: Implement API call with selected filters
    // Example: send selectedAssetNames, selectedPriceRanges, selectedDurations, priceRange to backend
    console.log('Apply filter with:', {
      assetNames: this.selectedAssetNames,
      priceRanges: this.selectedPriceRanges,
      durations: this.selectedDurations,
      priceRange: this.priceRange
    });
    this.closeModal();
  }
} 