import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-asset',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './add-asset.component.html',
  styleUrl: './add-asset.component.css'
})
export class AddAssetComponent {

  asset = {
    assetNumber: '65421',
    title: 'Asset Title',
    category: 'Cars',
    depositPercent: '20%',
    seller: 'Select',
    commissionPercent: '10%',
    startingPrice: 'BHD 10,000',
    reserveAmount: 'BHD 15,000',
    incrementalTime: '5 Minutes',
    minIncrement: 'BHD 500',
    makeOffer: 'On/Off',
    featured: 'On/Off',
    winnerAwarding: 'Automatic/Manual',
    deliveryRequired: 'Yes/No',
    status: 'Draft',
    vat: 'Ex.Inc./N/A',
    vatPercent: '10%',
    courtCaseNumber: '875874',
    registrationDeadline: '30 Days',
    requestForViewing: 'On/Off',
    requestForInquiry: 'On/Off',
    description: '',
    gallery: ['IMAGE 1', 'IMAGE 2'],
    color: 'Blue',
    condition: 'Used',
    documents: ['Terms & Conditions'],
    adminFees: '120',
    auctionFees: '200',
    buyerCommission: '5%',
    auctions: ['#2541 - Ended', '#8584 - Removed', '#8584 - Ongoing'],
    results: {
      totalBids: '1200',
      totalBidders: '90',
      startPrice: 'BHD 10,000',
      highestPrice: 'BHD 25,000',
      commission: 'BHD 250',
      totalPayable: 'BHD 25,000+',
    },
    winner: 'Ali Ashoor, 9201000XXX & 360X852XX',
    winnerDocuments: ['Passport', 'Personal ID'],
    requests: ['#6524 – 10:00 AM'],
    transactions: ['#6524 – 10:00 AM'],
  };

  dropdownFields = [
    { label: 'Make Offer', model: 'makeOffer', options: ['On/Off'] },
    { label: 'Featured', model: 'featured', options: ['On/Off'] },
    { label: 'Winner Awarding', model: 'winnerAwarding', options: ['Automatic/Manual'] },
    { label: 'Delivery Required', model: 'deliveryRequired', options: ['Yes/No'] },
    { label: 'Status', model: 'status', options: ['Draft'] },
    { label: 'VAT', model: 'vat', options: ['Ex.Inc./N/A'] },
    { label: 'Request for Viewing', model: 'requestForViewing', options: ['On/Off'] },
    { label: 'Request for Inquiry', model: 'requestForInquiry', options: ['On/Off'] },
  ];

  constructor( private router : Router) {}

  ngOnInit(): void {}

  updateAsset(): void {
    // You can connect this to a backend service
    console.log('Asset updated:', this.asset);
    alert('Asset updated successfully!');
  }
  assetRoute(){
    this.router.navigate(['assets']);
  }
}
