import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgSelectOption,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ManageAssetService } from '../../services/asset.service';
import { Location } from '@angular/common';

import { from } from 'rxjs';
import Swal from 'sweetalert2';
import { Auction } from '../../modals/auctions';
import { AuctionService } from '../../services/auction.service';
import { AssetCategory } from '../../modals/assetcategories';
import { AssetCategoriesService } from '../../services/assetcategories.service';
// import {NgSelectModule} from '@ng-select/ng-select';

@Component({
  selector: 'app-add-asset',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-asset.component.html',
  styleUrl: './add-asset.component.css',
})
export class AddAssetComponent {
  auctions: Auction[] = [];
  assetForm: FormGroup;
  documentUrls: string[] = [];
  imageUploadError: string = '';
  documentUploadError: string = '';
  formSubmitted = false;
  category : AssetCategory[] = [];

  imagePreviews: string[] = [];

  // this is for form submit the detsials
  detailsAdded: boolean = false;



  categories: AssetCategory[] = [];

  // Optional mapping for cleaner field names
  fieldLabels: { [key: string]: string } = {
    title: 'Asset Title',
    price: 'Starting Price',
    sellerId: 'Seller',
    description: 'Description',
    salesNotes: 'Sales Notes',
    // Add all fields you care about
  };

  getFieldLabel(key: string): string {
    return this.fieldLabels[key] || key;
  }

  

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
    awardedPrice: 170000,
    salesNotes: '', // Bound to input
    galleryFiles: [] as File[],
    documentFiles: [] as File[],
    detailsJson: [] as Array<{ attributeName: string; attributeValue: string }>,
    auctionIds: [] as number[],
    // auctionIds: [] as number[]
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
  // statusOptions = ['Draft', 'Published', 'Ongoing', 'Closed', 'Archived'];
  statusOptions = [
    'Draft',
    'Published',
    'Auctioned',
    'Archived',
    'Pending',
    'Approved',
    'Payment',
    'Registration',
    'Transferred',
    'Closed'
  ];

  vatOptions = ['Exclusive', 'Inclusive', 'Not Applicable'];
  requestForViewingOptions = ['On', 'Off'];
  requestForInquiryOptions = ['On', 'Off'];




  constructor(
    private fb: FormBuilder,
    private router: Router,
    private assetService: ManageAssetService,
    private location: Location,
    private assetCategoriesService: AssetCategoriesService,
    private auctionService: AuctionService
  ) {
    this.assetForm = this.fb.group({
    
      title: ['', [Validators.required, Validators.maxLength(255)]],
      categoryId: [0, [Validators.required, Validators.maxLength(10)]],
      deposit: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      sellerId: [0, [Validators.required, Validators.maxLength(10)]],
      commission: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      startingPrice: [0, [Validators.required, Validators.maxLength(10)]],
      reserveAmount: [0, [Validators.required, Validators.maxLength(12)]],
      incrementalTime: [0, [Validators.required, Validators.maxLength(5)]],
      minIncrement: [0, [Validators.required, Validators.maxLength(10)]],
      makeOffer: [false],
      featured: [false],
      awardingId: [0, Validators.required],
      statusId: [0, Validators.required],
      vatid: [0, Validators.required],
      vatpercent: [0, Validators.required],
      courtCaseNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^AUC\d{5}$/),
          Validators.maxLength(10),
        ],
      ],
      registrationDeadline: [
        0,
        [Validators.required, Validators.min(1), Validators.max(1000)],
      ],
      requestForViewing: [false],
      requestForInquiry: [false],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      MapLatitude: [12.938, Validators.required],
      MapLongitude: [10.328, Validators.required],
      adminFees: [0, Validators.required],
      auctionFees: [0, Validators.required],
      buyerCommission: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      winnerId: [6, Validators.required],
      awardedPrice: [0, Validators.required],
      salesNotes: ['', [Validators.required, Validators.maxLength(100)]],
      galleryFiles: [[] as File[]],
      documentFiles: [[] as File[]],
      detailsJson: [
        [] as Array<{ attributeName: string; attributeValue: string }>,
      ],
      auctionIds: [[43] as number[]],
    });
  }

  goBack1(): void {
    this.location.back();
  }
  onAuctionSelectionChange(selectedIds: number[]) {
    console.log('Selected auction IDs:', selectedIds);
  }
  

  
  ngOnInit() {
    // Log asset object on page load
    this.fetchAuctions();
    console.log('Asset on page load:', this.asset);
    this.assetCategoriesService.getAll().subscribe({
  next: (data) => {
    this.categories = data;
    console.log('Categories:', this.categories);
  },
  error: (err) => {
    console.error('Error fetching categories', err);
    Swal.fire('Error!', 'Failed to load categories.', 'error');
  },
});

    
    // Listen to value changes of the form
    this.assetForm.valueChanges.subscribe((changes) => {
      console.log('Asset changed:', changes);
    });
  }
  
  getSelectedAuctionText(): string {
  const selected = this.auctions.filter(a => this.asset.auctionIds.includes(a.auctionId));
  return selected.map(a => `#${a.auctionNumber}`).join(', ');
}

toggleAuctionSelection(id: number) {
  const index = this.asset.auctionIds.indexOf(id);
  if (index > -1) {
    this.asset.auctionIds.splice(index, 1);
  } else {
    this.asset.auctionIds.push(id);
  }
  this.onAuctionSelectionChange(this.asset.auctionIds);
}

  fetchAuctions(): void {
    this.auctionService.getAllAuctions().subscribe({
      next: (data) => {
        this.auctions = data;
        console.log("auction" , this.auctions);
        },
        error: (err) => {
          console.error('Error fetching auctions', err);
          Swal.fire('Error!', 'Failed to load auctions.', 'error');
        }
      });
    }

  limitToThreeDigits(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 3) {
      input.value = input.value.slice(0, 3);
    }
  }

  limitToFourDigits(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 4) {
      input.value = input.value.slice(0, 4);
    }
  }

  enforceCommissionLimit(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = parseFloat(input.value);

    if (value > 100) {
      input.value = '100';
      this.asset.commission = 100;
    } else if (value < 0) {
      input.value = '0';
      this.asset.commission = 0;
    }
  }

  limitToSevenDigits(event: Event) {
    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/\D/g, '');

    if (input.value.length > 7) {
      input.value = input.value.slice(0, 7);
    }

    this.asset.courtCaseNumber = input.value;
  }



  getAuctionId(value: string): number {
    switch (value) {
      case 'Summer Auction 2023 AUC12345':
        return 43;
      case 'Winter Auction 2023 AUC12341':
        return 41;
      case 'Premium Collection Auction AUC12323':
        return 46;
      case 'Special Edition Auction AUC29212':
        return 48;
      default:
        return -1;
    }
  }
  getMakeOfferId(value: string): number {
    switch (value) {
      case 'On':
        return 1;
      case 'Off':
        return 0;
      default:
        return -1;
    }
  }

  getFeaturedId(value: string): number {
    switch (value) {
      case 'On':
        return 1;
      case 'Off':
        return 0;
      default:
        return -1;
    }
  }

  getWinnerAwardingId(value: string): number {
    switch (value) {
      case 'Automatic':
        return 1;
      case 'Manual':
        return 2;
      default:
        return -1;
    }
  }

  getDeliveryRequiredId(value: string): number {
    switch (value) {
      case 'Yes':
        return 1;
      case 'No':
        return 0;
      default:
        return -1;
    }
  }

  getStatusId(value: string): number {
    switch (value) {
      case 'Draft':
        return 1;
      case 'Published':
        return 2;
      case 'Auctioned':
        return 3;
      case 'Archived':
        return 4;
      case 'Pending':
        return 5;
      case 'Approved':
        return 6;
      case 'Payment':
        return 7;
      case 'Registration':
        return 8; // Fixed typo (Registeration -> Registration)
      case 'Transferred':
        return 9;
      case 'Closed':
        return 10; // Fixed typo (Cloased -> Closed)
      default:
        return -1;
    }
  }

  getVatId(value: string): number {
    switch (value) {
      case 'Ex.':
        return 1;
      case 'Inc.':
        return 2;
      case 'N/A':
        return 3;
      default:
        return -1;
    }
  }

  getRequestForViewingId(value: string): number {
    switch (value) {
      case 'On':
        return 1;
      case 'Off':
        return 0;
      default:
        return 1;
    }
  }

  getRequestForInquiryId(value: string): number {
    switch (value) {
      case 'On':
        return 1;
      case 'Off':
        return 0;
      default:
        return -1;
    }
  }

  preparePayload(): FormData {
    const formData = new FormData();

    // Append asset properties
    // formData.append('AssetNumber', this.asset.assetNumber);
    formData.append('Title', this.asset.title);
    formData.append('CategoryId', this.asset.categoryId.toString());
    formData.append('Deposit', this.asset.deposit.toString());
    formData.append('SellerId', this.asset.sellerId.toString());
    formData.append('Commission', this.asset.commission.toString());
    formData.append('StartingPrice', this.asset.startingPrice.toString());
    formData.append(
      'ReserveAmount',
      this.asset.reserveAmount?.toString() || ''
    );
    formData.append('IncrementalTime', this.asset.incrementalTime.toString());
    formData.append('MinIncrement', this.asset.minIncrement.toString());
    formData.append('MakeOffer', this.asset.makeOffer.toString());
    formData.append('Featured', this.asset.featured.toString());
    formData.append('AwardingId', this.asset.awardingId.toString());
    formData.append('StatusId', this.asset.statusId.toString());
    formData.append('Vatid', this.asset.vatid.toString());
    formData.append('Vatpercent', this.asset.vatpercent.toString());
    formData.append('CourtCaseNumber', this.asset.courtCaseNumber);
    formData.append(
      'RegistrationDeadline',
      this.asset.registrationDeadline.toString()
    );
    formData.append(
      'RequestForViewing',
      this.asset.requestForViewing.toString()
    );
    formData.append(
      'RequestForInquiry',
      this.asset.requestForInquiry.toString()
    );
    formData.append('Description', this.asset.description);
    formData.append('MapLatitude', this.asset.MapLatitude.toString());
    formData.append('MapLongitude', this.asset.MapLongitude.toString());

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

    // AUCTION ID
    this.asset.auctionIds.forEach((id) => {
      formData.append('AuctionIds', id.toString());
    });

    // Append gallery files
    this.asset.galleryFiles.forEach((file) => {
      formData.append('GalleryFiles', file, file.name);
    });

    // Append document files
    this.asset.documentFiles.forEach((file) => {
      formData.append('DocumentFiles', file, file.name);
    });

    console.log('data', this.asset);

    console.log('Prepared FormData:', formData);
    return formData;
  }
  // limitToTenDigits(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.value.length > 10) {
  //     input.value = input.value.slice(1, 10);
  //   }
  // }

  limitToTenDigits(event: Event) {
    const input = event.target as HTMLInputElement;

    // Check if the value is '0' or empty
    if (input.value === '0' || input.value === '') {
      input.setCustomValidity('Value must be at least 1'); // Set custom error message
    } else {
      input.setCustomValidity(''); // Reset error if input is valid
    }

    // Limit to 10 digits
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10); // Limit input to 10 digits
    }
  }

  showInvalidTooltip = false;

  onHoverSubmit(show: boolean) {
    this.showInvalidTooltip = show;
  }

  isGalleryValid(): boolean {
    return (
      Array.isArray(this.asset.galleryFiles) &&
      this.asset.galleryFiles.length > 0
    );
  }

  isDocumentValid(): boolean {
    return (
      Array.isArray(this.asset.documentFiles) &&
      this.asset.documentFiles.length > 0
    );
  }
  galleryError: string = '';
  documentError: string = '';

  adminFeesError: string = '';
  auctionFeesError: string = '';
  buyerCommissionError: string = '';
  descriptionError: string = '';
  salesNotesError: string = '';
  categoryError: string = '';
  incrementalTimeError: string = '';
  minIncrementError: string = '';
  depositError: string = '';
  commissionError: string = '';
  sellerError: string = '';
  courtCaseNumberError: string = '';
  registrationDeadlineError: string = '';
  auctionError : string = '';
  attributeError: string = '';

  updateAsset(form: any): void {
    // if (!this.assetForm.valid) {
    //   this.assetForm.markAllAsTouched();
    //   this.formSubmitted = true;
    //   return;
    // }

     if (!this.detailsAdded || this.asset.detailsJson.length === 0) {
    this.attributeError = 'Please add at least one attribute before submitting.';
    return; 
  }


    if (
      !this.isGalleryValid() ||
      !this.isDocumentValid() ||
      this.asset.adminFees == null ||
      this.asset.auctionFees == null ||
      this.asset.buyerCommission == null ||
      this.asset.adminFees === 0 ||
      this.asset.auctionFees === 0 ||
      this.asset.buyerCommission === 0 ||
      !this.asset.description ||
      !this.asset.salesNotes ||
      this.asset.description.trim() === '' ||
      this.asset.salesNotes.trim() === '' ||
      this.asset.deposit == null ||
      this.asset.deposit === 0 ||
      this.asset.commission == null ||
      this.asset.commission === 0 ||
      this.asset.incrementalTime == null ||
      this.asset.incrementalTime === 0 ||
      this.asset.minIncrement == null ||
      this.asset.minIncrement === 0 ||
      this.asset.categoryId === 0 ||
      this.asset.sellerId === 0 ||
      this.asset.courtCaseNumber == null ||
      this.asset.courtCaseNumber.trim() === '' ||
      this.asset.registrationDeadline == null ||
      this.asset.registrationDeadline === 0 ||
      !this.asset.auctionIds || this.asset.auctionIds.length === 0 ||
      
      this.asset.detailsJson.some(detail =>
        !detail.attributeName ||
        detail.attributeName.trim() === '' ||
        !detail.attributeValue ||
        detail.attributeValue.trim() === ''
      )
      
    ) {
      this.assetForm.markAllAsTouched();
      this.formSubmitted = true;

      if (!this.isGalleryValid()) {
        this.galleryError = 'At least one gallery image is required.';
      } else {
        this.galleryError = '';
      }

      if (!this.isDocumentValid()) {
        this.documentError = 'At least one document is required.';
      } else {
        this.documentError = '';
      }

      // Admin Fees validation
      if (this.asset.adminFees === 0 || this.asset.adminFees == null) {
        this.adminFeesError = 'Admin Fees cannot be zero or empty.';
      } else {
        this.adminFeesError = '';
      }

      // Auction Fees validation
      if (this.asset.auctionFees === 0 || this.asset.auctionFees == null) {
        this.auctionFeesError = 'Auction Fees cannot be zero or empty.';
      } else {
        this.auctionFeesError = '';
      }

      // Buyer Commission validation
      if (
        this.asset.buyerCommission === 0 ||
        this.asset.buyerCommission == null
      ) {
        this.buyerCommissionError = 'Buyer Commission cannot be zero or empty.';
      } else {
        this.buyerCommissionError = '';
      }

      // Description validation
      if (!this.asset.description || this.asset.description.trim() === '') {
        this.descriptionError = 'Description is required and cannot be empty.';
      } else {
        this.descriptionError = '';
      }

      // Sales Notes validation
      if (!this.asset.salesNotes || this.asset.salesNotes.trim() === '') {
        this.salesNotesError = 'Sales Notes is required and cannot be empty.';
      } else {
        this.salesNotesError = '';
      }

      // Deposit
      if (!this.asset.deposit || this.asset.deposit === 0) {
        this.depositError = 'Deposit is required and cannot be zero or empty.';
      } else {
        this.depositError = '';
      }

      // Commission
      if (!this.asset.commission || this.asset.commission === 0) {
        this.commissionError =
          'Commission is required and cannot be zero or empty.';
      } else {
        this.commissionError = '';
      }

      // Incremental Time
      if (!this.asset.incrementalTime || this.asset.incrementalTime === 0) {
        this.incrementalTimeError =
          'Incremental Time is required and cannot be zero or empty.';
      } else {
        this.incrementalTimeError = '';
      }

      // Min Increment
      if (!this.asset.minIncrement || this.asset.minIncrement === 0) {
        this.minIncrementError =
          'Minimum Increment is required and cannot be zero or empty.';
      } else {
        this.minIncrementError = '';
      }

      // Category
      if (!this.asset.categoryId || this.asset.categoryId === 0) {
        this.categoryError = 'Category is required.';
      } else {
        this.categoryError = '';
      }

      // Seller
      if (!this.asset.sellerId || this.asset.sellerId === 0) {
        this.sellerError = 'Seller is required.';
      } else {
        this.sellerError = '';
      }

      // Court Case Number
      if (
        !this.asset.courtCaseNumber ||
        this.asset.courtCaseNumber.trim() === ''
      ) {
        this.courtCaseNumberError =
          'Court Case Number is required and cannot be empty.';
      } else {
        this.courtCaseNumberError = '';
      }

      if (
        !this.asset.registrationDeadline ||
        this.asset.registrationDeadline === 0
      ) {
        this.registrationDeadlineError =
          'Registration Deadline is required and cannot be zero or empty.';
      } else {
        this.registrationDeadlineError = '';
      }

      if (!this.asset.auctionIds || this.asset.auctionIds.length === 0) {
        this.auctionError = 'At least one auction must be selected.';
      } else {
        this.auctionError = '';
      }

  
      if (this.asset.detailsJson.length === 0 || this.asset.detailsJson == null) {
        this.attributeError = 'At least one detail is required.';
      } else if (this.asset.detailsJson.some(detail => 
        !detail.attributeName || detail.attributeName.trim() === '' ||
        !detail.attributeValue || detail.attributeValue.trim() === '')) {
        this.attributeError = 'All attribute names and values must be filled.';
      } else {
        this.attributeError = '';
      }
      

      return;
    }

    this.asset.makeOffer = this.getMakeOfferId(this.formValues.makeOffer) === 1;
    this.asset.featured = this.getFeaturedId(this.formValues.featured) === 1;
    this.asset.awardingId = this.getWinnerAwardingId(
      this.formValues.winnerAwarding
    );
    this.asset.statusId = this.getStatusId(this.formValues.status);
    this.asset.vatid = this.getVatId(this.formValues.vat);
    this.asset.requestForViewing =
      this.getRequestForViewingId(this.formValues.requestForViewing) === 1;
    this.asset.requestForInquiry =
      this.getRequestForInquiryId(this.formValues.requestForInquiry) === 1;

    const payload = this.preparePayload();

    // console.log('Asset before submission:', this.asset);
    console.log(payload);

    this.assetService.addAssetWithGallery(payload).subscribe({
      next: (response) => {
        console.log('Asset created successfully:', response);
        Swal.fire({
          icon: 'success',
          title: 'Asset Created',
          text: 'Asset created successfully!',
        }).then(() => {
          this.router.navigate(['assets']);
        });
      },
      error: (error) => {
        console.error('Error creating asset:', error);
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Creation Failed',
        //   text: 'Error creating asset. Please try again.'
        // });
      },
    });
  }

  assetRoute(): void {
    this.router.navigate(['assets']);
  }

  addDetail(): void {
    this.asset.detailsJson.push({ attributeName: '', attributeValue: '' });
    this.detailsAdded = true;
  }

  removeDetail(index: number): void {
    this.asset.detailsJson.splice(index, 1);
  }

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
        this.imagePreviews.push(result); // Add the preview to the array
        console.log('Image preview:', result); // Debugging log to see the preview
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  }
  
  removeGalleryItem(index: number): void {
    this.asset.galleryFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1); // Remove the corresponding preview
  }
  fetchCategories(): void {
  this.assetCategoriesService.getAll().subscribe({
    next: (data) => {
      this.categories = data;
    },
    error: (err) => {
      console.error('Error fetching categories', err);
      Swal.fire('Error!', 'Failed to load categories.', 'error');
    }
  });
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
        this.imagePreviews.push(result); // Add the preview to the array
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
    const url = prompt(
      'Enter a document URL (must start with http:// or https://):'
    );
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

// if (!this.isGalleryValid() || !this.isDocumentValid() || !this.assetForm.valid) {
//   this.assetForm.markAllAsTouched();
//   this.formSubmitted = true;
//   return;
// }
// if (form.invalid) {
//   // Touch all controls to show errors
//   Object.values(form.controls).forEach(control => (control as AbstractControl).markAsTouched());
//   return;
// }

// Call your service to save the asset
// this.assetService.addAssetWithGallery(payload).subscribe({
//   next: (response) => {
//     console.log('Asset created successfully:', response);
//     alert('Asset created successfully!');
//     this.router.navigate(['assets']);
//   },
//   error: (error) => {
//     console.error('Error creating asset:', error);
//     alert('Error creating asset. Please try again.');
//   }
// });