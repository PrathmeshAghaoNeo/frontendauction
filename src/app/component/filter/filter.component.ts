import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnChanges {
  @Input() assets: any[] = [];
  @Output() filterChanged = new EventEmitter<any>();
  
  isPanelOpen = false;

  assetNames: string[] = [];
  priceRanges: number[] = [];
  durations: string[] = [];

  selectedAssetNames: { [key: string]: boolean } = {};
  selectedPriceRanges: { [key: number]: boolean } = {};
  selectedDurations: { [key: string]: boolean } = {};

  minPrice = 0;
  maxPrice = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['assets'] && this.assets) {
      this.extractFilterOptions();
    }
  }

  openPanel() {
    this.isPanelOpen = true;
  }

  closePanel() {
    this.isPanelOpen = false;
  }

  extractFilterOptions() {
    // Asset Names
    this.assetNames = Array.from(new Set(this.assets.map(a => a.title)));
    this.assetNames.forEach(name => this.selectedAssetNames[name] = false);

    // Prices
    const prices = this.assets.map(a => a.price);
    this.minPrice = Math.min(...prices);
    this.maxPrice = Math.max(...prices);
    this.priceRanges = Array.from(new Set(prices));
    this.priceRanges.forEach(price => this.selectedPriceRanges[price] = false);

    // Durations
    this.durations = Array.from(new Set(this.assets.map(a => a.duration)));
    this.durations.forEach(duration => this.selectedDurations[duration] = false);
  }

  applyFilter() {
    const selectedNames = Object.keys(this.selectedAssetNames).filter(k => this.selectedAssetNames[k]);
    const selectedPrices = Object.keys(this.selectedPriceRanges).filter(k => this.selectedPriceRanges[+k]).map(Number);
    const selectedDurations = Object.keys(this.selectedDurations).filter(k => this.selectedDurations[k]);
    this.filterChanged.emit({
      assetNames: selectedNames,
      prices: selectedPrices,
      durations: selectedDurations
    });
    this.closePanel();
  }
} 