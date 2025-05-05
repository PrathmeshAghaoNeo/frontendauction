import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManageAssetService } from '../../services/asset.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-edit-asset',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './edit-asset.component.html',
  styleUrl: './edit-asset.component.css'
})
export class EditAssetComponent {

  documentUrls: string[] = [];

  // Inside your AddAssetComponent

  categories = [
    { id: 1, name: 'Auction' },
    { id: 2, name: 'Fixed Price' },
    { id: 3, name: 'Instant Buy' },
  ];


  // case 'Auction': return 1;
  // case 'Fixed Price': return 2;
  // case 'Instant Buy': return 3;

  
  // asset = {
  //   assetNumber: '24421',
  //   title: 'Asset Title',
  //   categoryId: 1,
  //   deposit: 20,
  //   sellerId: 1,
  //   commission: 10,
  //   startingPrice: 10000,
  //   reserveAmount: 15000,
  //   incrementalTime: 5,
  //   minIncrement: 500,
  //   makeOffer: false,
  //   featured: false,
  //   awardingId: 1,
  //   // deliveryRequired: false,
  //   statusId: 1,
  //   vatid: 1,
  //   vatpercent: 10,
  //   courtCaseNumber: '875874',
  //   registrationDeadline: 30,
  //   requestForViewing: true,
  //   requestForInquiry: true,
  //   description: '',
  //   MapLatitude:12,
  //   MapLongitude:12,
  //   adminFees: 120,
  //   auctionFees: 200,
  //   buyerCommission: 5,
  //   winnerId: 6,
  //   awardedPrice: 32425,
  //   salesNotes: 'mcdcmjs',
  //   galleryFiles: [] as File[],
  //   documentFiles: [] as File[],
  //   detailsJson: [] as Array<{ attributeName: string, attributeValue: string }>,
  //   auctionIds: [43] as number[]
  // };

  asset = {
    assetNumber: '',
    title: '',
    categoryId: 0,
    deposit: 0,
    sellerId: 0,
    commission: 0,
    startingPrice: 0,
    reserveAmount: 0,
    incrementalTime: 0,
    minIncrement: 0,
    makeOffer: false,
    featured: false,
    awardingId: 0,
    statusId: 0,
    vatid: 0,
    vatpercent: 0,
    courtCaseNumber: '',
    registrationDeadline: 0,
    requestForViewing: false,
    requestForInquiry: false,
    description: '',
    MapLatitude: 12.938,
    MapLongitude: 10.328,
    adminFees: 0,
    auctionFees: 0,
    buyerCommission: 0,
    winnerId: 6,
    awardedPrice: 0,
    salesNotes: '', // Bound to input
    galleryFiles: [] as File[],
    documentFiles: [] as File[],
    detailsJson: [] as Array<{ attributeName: string, attributeValue: string }>,
    auctionIds: [43] as number[]
  };

  // Dropdown state
  formValues = {
    makeOffer: 'Off',
    featured: 'Off',
    winnerAwarding: 'Manual',
    deliveryRequired: 'No',
    status: 'Draft',
    vat: 'Ex.',
    requestForViewing: 'Off',
    requestForInquiry: 'Off',
  };
  
  // Dropdown options
  makeOfferOptions = ['On', 'Off'];
  featuredOptions = ['On', 'Off'];
  winnerAwardingOptions = ['Automatic', 'Manual'];
  deliveryRequiredOptions = ['Yes', 'No'];
  statusOptions = ['Draft', 'Published', 'Ongoing', 'Closed', 'Archived'];
  vatOptions = ['Ex.', 'Inc.', 'N/A'];
  requestForViewingOptions = ['On', 'Off'];
  requestForInquiryOptions = ['On', 'Off'];

  constructor(private router: Router , private assetService: ManageAssetService) {}

  // ngOnInit(): void {
  //   this.asset = {
  //     assetNumber: 'TEST12345',
  //     title: 'Test Asset',
  //     categoryId: 1,
  //     deposit: 15,
  //     sellerId: 1,
  //     commission: 5,
  //     startingPrice: 10000,
  //     reserveAmount: 15000,
  //     incrementalTime: 10,
  //     minIncrement: 50,
  //     makeOffer: true,
  //     featured: false,
  //     awardingId: 2,
  //     // deliveryRequired: true,
  //     statusId: 1,
  //     vatid: 2,
  //     vatpercent: 5,
  //     courtCaseNumber: 'CC123',
  //     registrationDeadline: 7,
  //     requestForViewing: true,
  //     requestForInquiry: false,
  //     description: 'Test description for API check.',
  //     MapLatitude:12,
  //     MapLongitude:12,
  //     adminFees: 50,
  //     auctionFees: 100,
  //     buyerCommission: 3,
  //     winnerId: 6,
  //     awardedPrice: 10500,
  //     salesNotes: 'Sold at minimum price.',
  //     galleryFiles: [],
  //     documentFiles: [],
  //     detailsJson: [
  //       { attributeName: 'Color', attributeValue: 'Red' },
  //       { attributeName: 'Condition', attributeValue: 'New' }
  //     ],
  //     auctionIds: [1]
  //   };
  
  //   // Set default dropdowns to match the mappings
  //   this.formValues = {
  //     makeOffer: 'On',
  //     featured: 'Off',
  //     winnerAwarding: 'Manual',
  //     deliveryRequired: 'Yes',
  //     status: 'Draft',
  //     vat: 'Inc.',
  //     requestForViewing: 'On',
  //     requestForInquiry: 'Off',
  //   };
  // }

  // Mapping functions
  
  
  ngOnInit(): void {
    // Initializing asset with empty values
    // this.asset = {
    //   assetNumber: '',
    //   title: '',
    //   categoryId: 0,
    //   deposit: 0,
    //   sellerId: 0,
    //   commission: 0,
    //   startingPrice: 0,
    //   reserveAmount: 0,
    //   incrementalTime: 0,
    //   minIncrement: 0,
    //   makeOffer: false,
    //   featured: false,
    //   awardingId: 0,
    //   statusId: 0,
    //   vatid: 0,
    //   vatpercent: 0,
    //   courtCaseNumber: '',
    //   registrationDeadline: 0,
    //   requestForViewing: false,
    //   requestForInquiry: false,
    //   description: '',
    //   MapLatitude: 0,
    //   MapLongitude: 0,
    //   adminFees: 0,
    //   auctionFees: 0,
    //   buyerCommission: 0,
    //   winnerId: 6,
    //   awardedPrice: 0,
    //   salesNotes: '',
    //   galleryFiles: [],
    //   documentFiles: [],
    //   detailsJson: [],
    //   auctionIds: [43]
    // };
  }  
  
  getMakeOfferId(value: string): number {
    switch (value) {
      case 'On': return 1;
      case 'Off': return 0;
      default: return -1;
    }
  }

  getFeaturedId(value: string): number {
    switch (value) {
      case 'On': return 1;
      case 'Off': return 0;
      default: return -1;
    }
  }

  getWinnerAwardingId(value: string): number {
    switch (value) {
      case 'Automatic': return 1;
      case 'Manual': return 2;
      default: return -1;
    }
  }

  getDeliveryRequiredId(value: string): number {
    switch (value) {
      case 'Yes': return 1;
      case 'No': return 0;
      default: return -1;
    }
  }

  getStatusId(value: string): number {
    switch (value) {
      case 'Draft': return 1;
      case 'Published': return 2;
      case 'Ongoing': return 3;
      case 'Closed': return 4;
      case 'Archived': return 5;
      default: return -1;
    }
  }

  getVatId(value: string): number {
    switch (value) {
      case 'Ex.': return 1;
      case 'Inc.': return 2;
      case 'N/A': return 3;
      default: return -1;
    }
  }

  getRequestForViewingId(value: string): number {
    switch (value) {
      case 'On': return 1;
      case 'Off': return 0;
      default: return -1;
    }
  }

  getRequestForInquiryId(value: string): number {
    switch (value) {
      case 'On': return 1;
      case 'Off': return 0;
      default: return -1;
    }
  }

  
  preparePayload(): FormData {
    const formData = new FormData();

    // Append asset properties
    formData.append('AssetNumber', this.asset.assetNumber);
    formData.append('Title', this.asset.title);
    formData.append('CategoryId', this.asset.categoryId.toString());
    formData.append('Deposit', this.asset.deposit.toString());
    formData.append('SellerId', this.asset.sellerId.toString());
    formData.append('Commission', this.asset.commission.toString());
    formData.append('StartingPrice', this.asset.startingPrice.toString());
    formData.append('ReserveAmount', this.asset.reserveAmount?.toString() || '');
    formData.append('IncrementalTime', this.asset.incrementalTime.toString());
    formData.append('MinIncrement', this.asset.minIncrement.toString());
    formData.append('MakeOffer', this.asset.makeOffer.toString());
    formData.append('Featured', this.asset.featured.toString());
    formData.append('AwardingId', this.asset.awardingId.toString());
    formData.append('StatusId', this.asset.statusId.toString());
    formData.append('Vatid', this.asset.vatid.toString());
    formData.append('Vatpercent', this.asset.vatpercent.toString());
    formData.append('CourtCaseNumber', this.asset.courtCaseNumber);
    formData.append('RegistrationDeadline', this.asset.registrationDeadline.toString());
    formData.append('RequestForViewing', this.asset.requestForViewing.toString());
    formData.append('RequestForInquiry', this.asset.requestForInquiry.toString());
    formData.append('Description', this.asset.description); // ✅ You had this twice — removed duplicate
    formData.append('AdminFees', this.asset.adminFees.toString());
    formData.append('AuctionFees', this.asset.auctionFees.toString());
    formData.append('BuyerCommission', this.asset.buyerCommission.toString());
    formData.append('WinnerId', this.asset.winnerId.toString());
    formData.append('AwardedPrice', this.asset.awardedPrice.toString());
    formData.append('SalesNotes', this.asset.salesNotes || '');
    
    // Append detailsJson
    // this.asset.detailsJson.forEach((detail, index) => {
    //   formData.append(`details[${index}].attributeName`, detail.attributeName);
    //   formData.append(`details[${index}].attributeValue`,
    
    //     detail.attributeValue);
    //   });
    
    // Append detailsJson as a JSON string
    formData.append('detailsJson', JSON.stringify(this.asset.detailsJson));
    
    // Append gallery files
    this.asset.galleryFiles.forEach(file => {
      formData.append('GalleryFiles', file, file.name);
    });
  
      // Append document files
      this.asset.documentFiles.forEach(file => {
        formData.append('DocumentFiles', file, file.name);
      });
  
      console.log("data",this.asset);
      
      console.log('Prepared FormData:', formData);
      return formData;
    }
    
    updateAsset(): void {
      this.asset.makeOffer = this.getMakeOfferId(this.formValues.makeOffer) === 1;
      this.asset.featured = this.getFeaturedId(this.formValues.featured) === 1;
      this.asset.awardingId = this.getWinnerAwardingId(this.formValues.winnerAwarding);
      this.asset.statusId = this.getStatusId(this.formValues.status);
      this.asset.vatid = this.getVatId(this.formValues.vat);
      this.asset.requestForViewing = this.getRequestForViewingId(this.formValues.requestForViewing) === 1;
      this.asset.requestForInquiry = this.getRequestForInquiryId(this.formValues.requestForInquiry) === 1;
      
      const payload = this.preparePayload();
      
      // Call your service to save the asset
      this.assetService.addAssetWithGallery(payload).subscribe({
        next: (response) => {
          console.log('Asset created successfully:', response);
          alert('Asset created successfully!');
          this.router.navigate(['assets']);
        },
        error: (error) => {
          console.error('Error creating asset:', error);
          alert('Error creating asset. Please try again.');
        }
      });
    }
    
    // Inside your AddAssetComponent
  
  // getCategoryId(value: string): number {
  //   switch (value) {
  //     case 'Auction': return 1;
  //     case 'Fixed Price': return 2;
  //     case 'Instant Buy': return 3;
  //     // case 'Real Estate': return 4;
  //     // case 'Art': return 5;
  //     // case 'Collectibles': return 6;
  //     default: return -1; // Default case if no match is found
  //   }
  // }
  
  
    // Convert all dropdown values to numeric IDs
    // getMappedDropdownValues(): any {
    //   return {
    //     makeOffer: this.getMakeOfferId(this.formValues.makeOffer),
    //     featured: this.getFeaturedId(this.formValues.featured),
    //     winnerAwarding: this.getWinnerAwardingId(this.formValues.winnerAwarding),
    //     deliveryRequired: this.getDeliveryRequiredId(this.formValues.deliveryRequired),
    //     status: this.getStatusId(this.formValues.status),
    //     vat: this.getVatId(this.formValues.vat),
    //     requestForViewing: this.getRequestForViewingId(this.formValues.requestForViewing),
    //     requestForInquiry: this.getRequestForInquiryId(this.formValues.requestForInquiry),
    //   };
    // }
  
    
    
  // preparePayload(): FormData {
  //   const formData = new FormData();
  
  //   const dropdownMapped = {
  //     makeOffer: this.getMakeOfferId(this.formValues.makeOffer),
  //     featured: this.getFeaturedId(this.formValues.featured),
  //     winnerAwarding: this.getWinnerAwardingId(this.formValues.winnerAwarding),
  //     deliveryRequired: this.getDeliveryRequiredId(this.formValues.deliveryRequired),
  //     statusId: this.getStatusId(this.formValues.status),
  //     vatid: this.getVatId(this.formValues.vat),
  //     requestForViewing: this.getRequestForViewingId(this.formValues.requestForViewing),
  //     requestForInquiry: this.getRequestForInquiryId(this.formValues.requestForInquiry),
  //   }; 
  


  //   const payload = {
  //     ...this.asset,
  //     ...dropdownMapped,
  //     // Remove details if your backend expects a different structure
  //     details: undefined
  //   };


  //   formData.append('asset', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

  //   // Append details
  //   this.asset.detailsJson.forEach((detail, index) => {
  //     formData.append(`details[${index}].attributeName`, detail.attributeName);
  //     formData.append(`details[${index}].attributeValue`, detail.attributeValue);
  //   });

    
  // // Append files
  // this.asset.galleryFiles.forEach(file => formData.append('galleryFiles', file));
 
  // this.documentUrls.forEach(url => formData.append('documentFiles', url));
  // this.asset.documentFiles.forEach(file => formData.append('documentFiles', file));

  // console.log('Request payload:', this.asset);

  //   console.log("this is payload" , formData);
  //   return formData;
  // }


  // // updateAsset(): void {
  // //   const dropdownMapped = this.getMappedDropdownValues();

  // //   // Example integration: attach to asset or send separately
  // //   const updatedPayload = {
  // //     ...this.asset,
  // //     ...dropdownMapped
  // //   };

  // //   console.log('Final Payload for Backend:', updatedPayload);
  // //   alert('Asset updated successfully!');
  // // }



  // updateAsset(): void {
  //   const payload = this.preparePayload();
    
  //   // Call your service to save the asset
  //   this.assetService.addAssetWithGallery(payload).subscribe({
  //     next: (response) => {
  //       console.log('Asset created successfully:', response);
  //       alert('Asset created successfully!');
  //       this.router.navigate(['assets']);
  //     },
  //     error: (error) => {
  //       console.error('Error creating asset:', error);
  //       alert('Error creating asset. Please try again.');
  //     }
  //   });
  // }


  assetRoute(): void {
    this.router.navigate(['assets']);
  }

  addDetail(): void {
    this.asset.detailsJson.push({ attributeName: '', attributeValue: '' });
  }

  removeDetail(index: number): void {
    this.asset.detailsJson.splice(index, 1);
  }

  // this is for validation of images on frontend side  
  imageUploadError: string = '';
  documentUploadError: string = '';



  // for images trying this 

  isImage(file: File | string): boolean {
    if (typeof file === 'string') {
      return file.startsWith('data:image'); // Check if it's a data URL
    }
    return file.type.startsWith('image/');
  }

  isVideo(fileUrl: string): boolean {
    return fileUrl.startsWith('data:video');
  }
  
  isDataUrl(file: File | string): boolean {
    return typeof file === 'string' && file.startsWith('data:');
  }
  
  
  
  // onGalleryFileSelected(event: any): void {
  //   const file: File = event.target.files[0];
  //   this.imageUploadError = '';
  //   if (file) {
  //     if (file.size > 500 * 1024) {
  //       this.imageUploadError = 'Image exceeds 500KB limit.';
  //       return;
  //     }
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const result = reader.result as string;
  //       this.asset.gallery.push(result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  //   event.target.value = '';
  // }
  

  // convertToDataUrl(file: File): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => resolve(reader.result as string);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(file);
  //   });
  // }
  



  onGalleryFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.imageUploadError = '';
    
    if (file) {
      if (file.size > 500 * 1024) {
        this.imageUploadError = 'Image exceeds 500KB limit.';
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        this.imageUploadError = 'Only image files are allowed.';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.asset.galleryFiles.push(file);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  }


  removeGalleryItem(index: number): void {
    this.asset.galleryFiles.splice(index, 1);
  }


  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.imageUploadError = '';
    
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        this.imageUploadError = 'Image exceeds 500KB limit.';
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        this.imageUploadError = 'Only image files are allowed.';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.asset.galleryFiles.push(file);
      };
      reader.readAsDataURL(file);
    }
  }

  
  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  
 



  /// for document 
  isPdfDataUrl(file: File | string): boolean {
    return typeof file === 'string' && file.endsWith('.pdf');
  }
  
isPdf(file: File | string): boolean {
  if (typeof file === 'string') {
    return file.endsWith('.pdf'); // Check if it's a PDF URL
  }
  return file.type === 'application/pdf';
}

isUrl(doc: any): boolean {
  if (typeof doc === 'string') {
    return doc.startsWith('http') || doc.startsWith('https');
  }
  return false;
}
  getDocumentName(file: File | string): string {
    if (typeof file === 'string') {
      return file.split('/').pop() || ''; // If URL, extract name from URL
    }
    return file.name; // For File objects, return file name
  }

  
  onDocumentSelected(event: any): void {
    const file: File = event.target.files[0];
    this.documentUploadError = '';
    
    if (file) {
      if (file.size > 500 * 1024) {
        this.documentUploadError = 'PDF exceeds 500KB limit.';
        return;
      }
      
      if (file.type !== 'application/pdf') {
        this.documentUploadError = 'Only PDF files are allowed.';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.asset.documentFiles.push(file);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  }

  
  addDocumentLink(): void {
    const url = prompt('Enter a document URL (must start with http:// or https://):');
    if (url && this.isUrl(url)) {
      this.documentUrls.push(url); // Add URL to separate array
    } else if (url) {
      alert('Invalid URL. Please use http:// or https://');
    }
  }
  
  removeDocument(index: number): void {
    this.asset.documentFiles.splice(index, 1);
  }
  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Required to allow dropping
    event.stopPropagation();
  }
  
  onDropPdf(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.documentUploadError = '';
    
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        this.documentUploadError = 'PDF exceeds 500KB limit.';
        return;
      }
      
      if (file.type !== 'application/pdf') {
        this.documentUploadError = 'Only PDF files are allowed.';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.asset.documentFiles.push(file);
      };
      reader.readAsDataURL(file);
    }
  }

  
  


  ///winner document 


  winnerDocError: string = ''; // To show validation errors

  // === Drag and Drop Handlers ===
  onWinnerDocDragOver(event: DragEvent): void {
    event.preventDefault();
  }
  
  // onWinnerDocDrop(event: DragEvent): void {
  //   event.preventDefault();
  //   this.winnerDocError = '';
  
  //   const file = event.dataTransfer?.files?.[0];
  //   if (!file) return;
  
  //   if (file.size > 1 * 1024 * 1024) {
  //     this.winnerDocError = 'Unable to upload: File size must be under 1MB.';
  //     return;
  //   }
  
  //   if (file.type === 'application/pdf') {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const result = reader.result as string;
  //       this.asset.winnerDocuments.push(result);
  //     };
  //     reader.readAsDataURL(file);
  //   } else {
  //     this.winnerDocError = 'Only PDF files are allowed.';
  //   }
  // }
  
  // === File Input Handler ===
  // onWinnerDocumentSelected(event: any): void {
  //   const file: File = event.target.files[0];
  //   this.winnerDocError = '';
  
  //   if (!file) return;
  
  //   if (file.size > 1 * 1024 * 1024) {
  //     this.winnerDocError = 'Unable to upload: File size must be under 1MB.';
  //     event.target.value = '';
  //     return;
  //   }
  
  //   if (file.type === 'application/pdf') {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const result = reader.result as string;
  //       this.asset.winnerDocuments.push(result);
  //     };
  //     reader.readAsDataURL(file);
  //   } else {
  //     this.winnerDocError = 'Only PDF files are allowed.';
  //   }
  
  //   event.target.value = '';
  // }
  
  // // === Remove Handler ===
  // removeWinnerDocument(index: number): void {
  //   this.asset.winnerDocuments.splice(index, 1);
  // }
  
  // // === Type Checkers (if needed) ===
  // isPdfDoc(url: string): boolean {
  //   return url.endsWith('.pdf') || url.includes('application/pdf');
  // }
  
  // isPdfDataUrlDoc(url: string): boolean {
  //   return url.startsWith('data:');
  // }
  
  // isUrlDoc(url: string): boolean {
  //   return /^https?:\/\//.test(url);
  // }
  
  // getWinnerDocName(doc: string): string {
  //   if (this.isPdfDataUrlDoc(doc)) {
  //     return 'Uploaded PDF';
  //   } else {
  //     try {
  //       return decodeURIComponent(doc.split('/').pop() || doc);
  //     } catch {
  //       return doc;
  //     }
  //   }
  // }
    




  
}
