import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ManageAssetService } from '../../services/asset.service';
import { AddAsset, AssetRequestDto, AssetResultDto, AssetTransactionDto, Seller } from '../../modals/add-asset';
import { Asset, AssetAllDetails, AssetDocumentFormDto, AssetGalleryDto, ReplaceAssetWinnerDto, TopBidderDto } from '../../modals/manage-asset';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Auction } from '../../modals/auctions';
import { AuctionService } from '../../services/auction.service';
import { environment } from '../../constants/enviroments';
import { AssetCategoriesService } from '../../services/assetcategories.service';
import { AssetCategory } from '../../modals/assetcategories';
import { LanguageService } from '../../services/language.service';
import * as L from 'leaflet';
declare var bootstrap: any; 

@Component({
  selector: 'app-edit-asset',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './edit-asset.component.html',
  styleUrl: './edit-asset.component.css',
})
export class EditAssetComponent implements OnInit {

  map!: L.Map;
  locationMarker!: L.Marker;
  previewMarker!: L.Marker;
  locationSearchQuery = '';
  searchedLat: number | null = null;
  searchedLng: number | null = null;
  showUpdateLocationButton = false;

  ngAfterViewInit(): void {
    // this.initMap();
  }

  initMap(): void {
    const lat = this.asset.mapLatitude || 0; // Default to 0 if not set
    const lng = this.asset.mapLongitude || 0; // Default to 0 if not set
    console.log(lat, lng , "in map initisalize time ");
    

    this.map = L.map('updateFormMap').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.addMarker(lat, lng);

     this.map.on('click', (e: L.LeafletMouseEvent) => {
    const clickedLat = e.latlng.lat;
    const clickedLng = e.latlng.lng;

    this.asset.mapLatitude = clickedLat;
    this.asset.mapLongitude = clickedLng;

    this.addMarker(clickedLat, clickedLng);
  }); 
  } 


  convertedGalleryFiles: File[] = [];

  environment = environment;
  assetIdparam!: number;
  existingGalleryImages: string[] = []; // From DB
  galleriesToUpload: File[] = [];
  documentsToUpload: File[] = [];
  attributeError: string | null = null;
  lattitudeError: string | null = null;
  longitudeError: string | null = null;
  auctionIds: number[] = [];
  selectedAuctions: Auction[] = [];
  sellers: Seller[] = [];
  langCode: string | null = 'en';

  imagePreviews: string[] = [];
  existingDocuments: string[] = [];
  
  auctions: Auction[] = [];

  // selectedReason: string = '';
  winnerNote: string = '';

  bidders: TopBidderDto[] = [];

  filteredAuctions: Auction[] = [];
  latestRequest: AssetRequestDto[] = [];
  results: AssetResultDto | undefined;
  transaction: AssetTransactionDto[]=[];
  
  attributeList: { attributeName: string; attributeValue: string }[] = [];
  asset: AssetAllDetails = {
    assetId: this.assetIdparam,
    languageId: 0,
    title: '',
    categoryId: 0,
    categoryName: '',
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
    awardingMethod: '',
    statusId: 0,
    statusName: '',
    vatid: 0,
    vatType: '',
    vatpercent: 0,
    courtCaseNumber: '',
    registrationDeadline: 0,
    description: '',
    mapLatitude: 0,
    mapLongitude: 0,
    adminFees: 0,
    auctionFees: 0,
    buyerCommission: 0,
    requestForViewing: false,
    requestForInquiry: false,
    winnerId: 0,
    winnerName: '',
    awardedPrice: 0,
    salesNotes: '',
    details: '',
    createdAt: '',
    updatedAt: '',
    assetNumber: '',
    auctionIds: [],
    galleries: [],
    documents: [],
    attributes: [],
    isAvailableForDirectSale: false,
    isDeleted: false,
     titleTranslated: '',
  descriptionTranslated:'',
  salesNotesTranslated:''
  };

  isLoading: boolean = false;
  error: string | null = null;
  isModalOpen: boolean = false;

  // Add these to your component class
  newGalleryFiles: File[] = [];
  newDocumentFiles: File[] = [];

  // for the new documents
  newDocument: File[] = [];
  documentUploadError: string | null = null;
  imageUploadError: string | null = null;

  // Dropdown options
  makeOfferOptions = ['Yes', 'No'];
  featuredOptions = ['Yes', 'No'];
  // winnerAwardingOptions = ['Automatic', 'Manual'];
  deliveryRequiredOptions = ['Yes', 'No'];
  selectedOpton: number = 0;
  
  //   sellers = [
  //   { id: 1, name: 'Vaish Patil' },
  // ];

  statusOptions = [
    { id: 1, name: 'Draft' },
    { id: 2, name: 'Published' },
    { id: 3, name: 'Auctioned' },
    { id: 4, name: 'Archived' },
    { id: 5, name: 'Pending' },
    { id: 6, name: 'Approved' },
    { id: 7, name: 'Payment' },
    { id: 8, name: 'Registration' },
    { id: 9, name: 'Transferred' },
    { id: 10, name: 'Closed' },
  ];
  vatOptions = [
    { id: 1, name: 'Inclusive' },
    { id: 2, name: 'Exclusive' },
    { id: 3, name: 'None' },
  ];

  categories: AssetCategory[] = [];

  
 winnerAwardingOptions = [
  { id: 1, name: 'Automatic'},
  { id: 2, name: 'Manual' }
]
  requestForViewingOptions = [
    { id: 1, name: 'Yes' },
    { id: 0, name: 'No' },
  ];


  requestForInquiryOptions = [
    { id: 1, name: 'Yes' },
    { id: 0, name: 'No' },
  ];

  getRequestLabel(value: Number | undefined) {
    if (value == 0) {
      this.asset.requestForViewing = false;
    } else {
      this.asset.requestForViewing = true;
    }
  }
  constructor(
    private fb: FormBuilder,
    private assetService: ManageAssetService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private auctionService: AuctionService,
    private languageService: LanguageService,
    private assetCategoriesService: AssetCategoriesService
  ) {}

  
  goBack1(): void {
    this.location.back();
  }

  limitToThreeDigits(event: any) {
    const value = event.target.value;
    if (value && value.toString().length > 3) {
      event.target.value = value.toString().slice(0, 3);
      this.asset.deposit = parseInt(event.target.value, 10);
    }
}


 openSaleApprovalModal() {
    const modalElement = document.getElementById('saleApprovalModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    }

  ngOnInit(): void {
    console.log('assetId params', this.asset.assetId);
    this.getAssetIdFromRoute();
    // this.initMap()
    this.loadSellers();

    this.assetsRequests();
    this.assetsResults();
    this.assetsTransaction();

    console.log('Asset on page load:', this.asset.assetId);
    this.assetCategoriesService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      },
    });

      console.log(this.asset.mapLatitude, this.asset.mapLongitude);
  
  }



  submitWinnerChange(): void {
  if (!this.asset.winnerId || !this.selectedReason) {
    Swal.fire('Warning', 'Please select a winner and reason.', 'warning');
    return;
  }

  const dto: ReplaceAssetWinnerDto = {
    assetId: this.asset.assetId,
    userId: this.asset.winnerId,
    awardedPrice: this.asset.awardedPrice ?? 0,
    reason: this.selectedReason,
    note: this.winnerNote,
    approved: false, 
  };

  this.assetService.replaceWinner(dto).subscribe({
    next: (res) => {
      console.log('Winner updated successfully:', res);
      this.asset.winnerId = res.winnerId;
      this.updateWinnerName(res.winnerId); // Update UI

      Swal.fire({
        icon: 'success',
        toast: true,
        position: 'top',
        title:' Winner Updated',
        text: 'Winner updated successfully!',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        willClose: () => {
          window.location.reload();
        }
      })
      // this.isEditingWinner = false;
    },
    error: (err) => {
      console.error('Error updating winner:', err);
      alert('Failed to update winner.');
    },
  });
}


confirmApproveSale(): void {
  if (!this.asset.winnerId || !this.selectedReason) {
    Swal.fire('Warning', 'Winner or reason not selected.', 'warning');
    return;
  }

  const dto: ReplaceAssetWinnerDto = {
    assetId: this.asset.assetId,
    userId: this.asset.winnerId,
    awardedPrice: this.asset.awardedPrice ?? 0,
    reason: this.selectedReason,
    note: this.winnerNote ?? '',
    approved: true
  };

  this.assetService.replaceWinner(dto).subscribe({
    next: (res) => {
      console.log('Sale approved & winner saved', res);
      this.asset.winnerId = res.winnerId;
      this.updateWinnerName(res.winnerId);

      // Close modal
      const modalElement = document.getElementById('saleApprovalModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }

      
      Swal.fire({
        icon: 'success',
        title: 'Winner Updated',
        text: 'Sale approved successfully!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        willClose: () => {
          window.location.reload();
        }

      });
      
    },
    error: (err) => {
      console.error('Error approving sale:', err);
      Swal.fire('Error', 'Failed to approve sale.', 'error');
    }
  });
}

    loadSellers(): void {
      this.assetService.getSellers().subscribe({
        next: (data) => {
          this.sellers = data;
          console.log('Sellers:', this.sellers);
        },
        error: (err) => {
          console.error('Failed to fetch sellers', err);
        },
      });
    }

  private getAssetIdFromRoute(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const assetIdParam = params.get('assetId');

        if (assetIdParam) {
          this.asset.assetId = +assetIdParam;
          this.assetIdparam = +assetIdParam;
          this.loadAsset(this.assetIdparam);
          
        } else {
          this.error = 'No asset ID provided in route';
          console.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error reading route parameters';
        console.error(this.error, err);
      },
    });
  }

  submitForm(form: NgForm) {
    if (form.valid) {
      this.updateAsset(form);
    }
  }

  loadAsset(assetId: number): void {
    if (!assetId || isNaN(assetId)) {
      this.error = 'Invalid asset ID';
      console.error(this.error);
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.assetService.getAllAssetDetails(assetId).subscribe({
      next: (response: AssetAllDetails) => {
        this.asset = response;
        console.log('changes',this.asset);
        this.isLoading = false;
        this.isModalOpen = true;
        this.attributeList = [...(this.asset.attributes || [])];
        console.log('Asset loaded successfully:', this.asset);
        this.fetchAuctions();

        this.initMap();

        // this.convertGalleryUrlsToFiles();
      },
      error: (err) => {
        this.error = 'Failed to load asset. Please try again later.';
        this.isLoading = false;
        console.error('Error loading asset:', err);
      },
    });
  }

  assetsRequests() {
    // console.log(/);
    this.assetService.getLatestRequest(this.asset.assetId).subscribe({
      next: (response: AssetRequestDto[]) => {
        console.log('Latest Requests:', response); // 🔍 Add this
        this.latestRequest = response;
      },
      error: (err) => {
        console.error('Error fetching latest request:', err);
      },
    });
  }

  assetsResults() {
    this.assetService.getLatestResult(this.asset.assetId).subscribe({
      next: (response: AssetResultDto) => {
        console.log('Latest Results:', response); // 🔍 Add this
        this.results = response;
      },
      error: (err) => {
        console.error('error fetching the results');
      },
    });
  }

  assetsTransaction() {
    this.assetService.getAssetTransaction(this.asset.assetId).subscribe({
    next: (response: AssetTransactionDto[]) => {
      this.transaction = response;
    },
    error: (err) => {
      console.error('Error fetching asset transactions:', err);
    }
  });
  }

  fetchAuctions(): void {
    this.auctionService.getAllAuctions().subscribe({
      next: (data) => {
        this.auctions = data;
        console.log('auction', this.auctions);

        this.selectedAuctions = this.auctions.filter((auction) =>
          this.asset.auctionIds.includes(auction.auctionId)
        );
        console.log('Selected auctions:', this.selectedAuctions);
      this.loadTopBidders(this.asset.assetId, this.selectedAuctions[0].auctionId);
      },
      error: (err) => {
        console.error('Error fetching auctions', err);
        Swal.fire('Error!', 'Failed to load auctions.', 'error');
      },
    });
  }


 loadTopBidders(assetId: number, auctionId: number): void {
  console.log('Loading top bidders for asset:', assetId, 'and auction:', auctionId);
  
  this.assetService.getTopBidders(assetId , auctionId).subscribe({
    // console.log('Loading top bidders for asset:', assetId, 'and auction:', auctionId);
    next: (data) => {
        this.bidders = data;
        console.log('Top bidders loaded:', this.bidders);
      },
      error: (err) => {
        console.error('Error loading top bidders:', err);
      },
    });
  } 
  
  /////////////////////=================================////////////////////////





  galleryError: string = '';
  documentError: string = '';

  updateAsset(form: NgForm): void {
    if (this.asset.attributes.length === 0) {
      this.attributeError = 'Please add at least one attribute.';
      form.control.markAllAsTouched();
      return;
    }

    if (this.asset.mapLatitude === 0 || this.asset.mapLatitude === null) {
      this.lattitudeError = 'Please add latitude.';
      form.control.markAllAsTouched();
      return;
    }
    if (this.asset.mapLongitude === 0 || this.asset.mapLongitude === null) {
      this.longitudeError = 'Please add longitude.';
      form.control.markAllAsTouched();
      return;
    }
    if (
      this.asset.documents.length === 0 &&
      this.newDocumentFiles.length === 0
    ) {
      this.documentError = 'Please add at least one document.';
      form.control.markAllAsTouched();
      return;
    }

    if (
      this.asset.galleries.length === 0 &&
      this.newGalleryFiles.length === 0
    ) {
      this.galleryError = 'Please add at least one image.';
      form.control.markAllAsTouched();
      return;
    }

    if (form.invalid || this.asset.attributes.length === 0) {
      this.attributeError = 'Please add at least one attribute.';
      this.lattitudeError = 'Please add latitude.';
      this.longitudeError = 'Please add longitude.';
      form.control.markAllAsTouched();
      return;
    }

    console.log(this.asset.requestForViewing);
    if (form.valid) {
      this.isLoading = true;

      const formData = new FormData();

      const excludedFields = [
        'auctionIds',
        'createdAt',
        'updatedAt',
        'details',
        'statusName',
        'vatType',
        'statusName',
        'awardingMethod',
        'winnerName',
        'categoryName',
        'auctionStatusId',
        'isAvailableForDirectSale',
        'isDeleted',
      ];

      console.log('--- FormData Preview ---', formData);
      for (let key in this.asset) {
        if (excludedFields.includes(key)) continue;

        const value = (this.asset as any)[key];

        if (Array.isArray(value) || typeof value === 'object') continue;

        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      }

      // (multiple files)
      this.newGalleryFiles.forEach((file) => {
        formData.append('NewGalleryImages', file);
      });

      this.newDocumentFiles.forEach((file) => {
        formData.append('NewDocuments', file);
      });

      formData.append('DetailsJson', JSON.stringify(this.asset.attributes));
      formData.append(
        'requestForViewing',
        this.asset.requestForViewing ? 'true' : 'false'
      );
      formData.append(
        'requestForInquiry',
        this.asset.requestForInquiry ? 'true' : 'false'
      );
      if (this.asset.languageId === 2) {
      formData.append('LanguageId', '2');
      formData.append('TranslatedTitle', this.asset.titleTranslated || '');
      formData.append('TranslatedDescription', this.asset.descriptionTranslated || '');
      formData.append('TranslatedSalesNotes', this.asset.salesNotesTranslated || '');
      } else if (this.asset.languageId === 0) {
      formData.append('LanguageId', '0');
      formData.append('RemoveTranslation', 'true');
      }



      console.log('--- FormData Preview ---');
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });
      console.log('--- End of FormData ---');

      console.log('this is form', this.asset);

      this.assetService.updateAssetWithGallery(formData).subscribe({
        // this.isLoading = false;
        next: (response) => {
          console.log('Asset updated successfully:', response);
          this.router.navigate(['/assets']);

          Swal.fire({
            icon: 'success',
            toast: true,
            position: 'top',
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true,
            title: 'Asset Updated',
            text: 'Asset updated successfully!',
          }).then(() => {
            this.router.navigate(['/assets']);
          });
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.error = error.message; // or error.error for backend response
          console.error('Error updating asset:', error.error || error.message);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'Error updating asset. Please try again.',
          });
        },
      });
    }
  }

  onModalClosed(): void {
    this.isModalOpen = false;
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  addDetail(): void {
    if (!this.asset.attributes) {
      this.asset.attributes = [];
    }
    this.asset.attributes.push({ attributeName: '', attributeValue: '' });
  }

  removeDetail(index: number): void {
    this.asset.attributes.splice(index, 1);
  }

  onGalleryFilesSelected(event: any): void {
    const file: File = event.target.files[0];
    this.imageUploadError = '';

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
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
        this.newGalleryFiles.push(file);
        this.imagePreviews.push(result);
        console.log('Image preview:', result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  }

  // Handle gallery image selection
  onGalleryFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.handleImageFiles(files);
  }

  removeNewGalleryItem(index: number) {
    this.imagePreviews.splice(index, 1);
    this.newGalleryFiles.splice(index, 1);
  }

  removeExistingGalleryImage(gallery: AssetGalleryDto): void {
    console.log('Gallery to delete:', gallery);
    console.log('Gallery ID to delete:', gallery.galleryId);

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this image?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.assetService
          .deleteAssetGallery(gallery.galleryId.toString())
          .subscribe({
            next: () => {
              console.log('we are in gallery delete logic');
              // Filter out the deleted gallery by id
              this.asset.galleries = this.asset.galleries.filter(
                (g) => g.galleryId !== gallery.galleryId
              );
              Swal.fire('Deleted!', 'Image has been deleted.', 'success');
            },
            error: (err) => {
              console.error('Error deleting image:', err);
              Swal.fire('Error!', 'Failed to delete image.', 'error');
            },
          });
      }
    });
  }

  removeExistingDocumentUsingDto(doc: AssetDocumentFormDto): void {
    console.log('Document to delete:', doc);
    console.log('Document ID to delete:', doc.documentId);

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this document?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.assetService
          .deleteAssetDocument(doc.documentId.toString())
          .subscribe({
            next: () => {
              console.log('Document deleted successfully');
              this.asset.documents = this.asset.documents.filter(
                (d) => d.documentId !== doc.documentId
              );
              Swal.fire('Deleted!', 'Document has been deleted.', 'success');
            },
            error: (err) => {
              console.error('Error deleting document:', err);
              Swal.fire('Error!', 'Failed to delete document.', 'error');
            },
          });
      }
    });
  }

  // Handle image drop
  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      this.onGalleryFilesSelected({ target: { files } });
    }
  }
  // Helper method to handle image files
  private handleImageFiles(files: FileList): void {
    this.imageUploadError = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.imageUploadError = 'Only image files are allowed.';
        return;
      }

      // Validate file size (example: 5MB limit)
      if (file.size > 2 * 1024 * 1024) {
        this.imageUploadError = 'Image exceeds 500KB limit.';
        continue;
      }

      this.newGalleryFiles.push(file);

      const reader = new FileReader();
      reader.readAsDataURL(file);
    }
  }

  // Handle document selection

  onDropPdf(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf' && file.size <= 500 * 1024) {
          this.newDocumentFiles.push(file);
        }
      }
    }
  }

  onDocumentSelected(event: any): void {
    const files: FileList = event.target.files;
    console.log('Files selected:', files);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.type !== 'application/pdf') {
        this.documentUploadError = 'Only PDF files are allowed.';
        return;
      }

      if (file.size > 500 * 1024) {
        this.documentUploadError = 'File size should be less than 500KB.';
        return;
      }

      this.newDocumentFiles.push(file);
      console.log('Added file:', file);
    }

    console.log('Selected documents:', this.newDocumentFiles);
    // Reset error if valid
    this.documentUploadError = null;
  }

  // Remove gallery item
  removeGalleryItem(index: number): void {
    if (this.asset.galleries) {
      this.asset.galleries.splice(index, 1);
    }
    // Also remove from newGalleryFiles if it's there
    if (index < this.newGalleryFiles.length) {
      this.newGalleryFiles.splice(index, 1);
    }
  }

  removeNewDocument(index: number): void {
    this.newDocumentFiles.splice(index, 1);
  }

  removeExistingDocument(docPath: string): void {
    this.existingDocuments = this.existingDocuments.filter(
      (doc) => doc !== docPath
    );
  }

  onDocumentFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    this.documentUploadError = '';

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const allowedTypes = ['application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          this.documentUploadError = 'Only PDF files are allowed.';
          continue;
        }
        if (file.size > 500 * 1024) {
          this.documentUploadError = 'Each document must be less than 500KB.';
          continue;
        }
        this.newDocumentFiles.push(file);
      }
    }
  }

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  isImage(file: File): boolean {
  return file.type.startsWith('image/');
}


reasons = [
  'Incorrect Winner',
  'Bidder Disqualified',
  'Manual Reassignment',
  'Technical Error'
];

showChangeWinner = false;
reasonSelected = false;
selectedReason: string | null = null;

reasonVisible = false;

toggleChangeWinner() {
  this.showChangeWinner = !this.showChangeWinner;
  if (!this.showChangeWinner) {
    this.reasonVisible = false;
    this.selectedReason = null;
    // this.asset.winnerId = null;
  }
}
  
updateWinnerName(id: number | undefined): void {
  console.log('Updating winner name with ID:', id);
  const bidder = this.bidders.find(b => b.userId === id);
  if (bidder) {
    console.log('Selected winner:', 'with ID:', );
    this.asset.winnerName = bidder.userName;  
    this.asset.winnerId = bidder.userId;  

    console.log('Selected winner:', this.asset.winnerName, 'with ID:', this.asset.winnerId);
  }
}




 searchLocation(): void {
    if (!this.locationSearchQuery.trim()) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.locationSearchQuery)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          alert('Location not found.');
          return;
        }

        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        this.searchedLat = lat;
        this.searchedLng = lng;


        this.asset.mapLatitude = lat;
        this.asset.mapLongitude = lng;

        this.showUpdateLocationButton = true;

        this.map.setView([lat, lng], 15);

        if (this.previewMarker) {
          this.map.removeLayer(this.previewMarker);
        }

        this.previewMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'custom-label',
            html: `<div style="background:#ffc;border:1px solid #999;padding:2px 6px;border-radius:4px;">📍 Preview</div>`,
            iconSize: [100, 30],
            iconAnchor: [50, 15]
          })
        }).addTo(this.map);
      })
      .catch(error => {
        console.error('Error searching location:', error);
        alert('Search failed. Try again.');
      });
  }

  confirmUpdateLocation(): void {
    if (this.searchedLat != null && this.searchedLng != null) {
      this.asset.mapLatitude = this.searchedLat;
      this.asset.mapLongitude = this.searchedLng;
      console.log('Updating asset location to:', this.asset.mapLatitude, this.asset.mapLongitude);
      console.log('Adding marker at:', this.searchedLat, this.searchedLng);
      
      

      this.addMarker(this.searchedLat, this.searchedLng);
      this.map.setView([this.searchedLat, this.searchedLng], 15);
      this.showUpdateLocationButton = false;

      if (this.previewMarker) {
        this.map.removeLayer(this.previewMarker);
        this.previewMarker = null as any;
      }
    }
  }

  addMarker(lat: number, lng: number): void {
    if (this.locationMarker) {
      this.map.removeLayer(this.locationMarker);
    }

    this.locationMarker = L.marker([lat, lng], {
      draggable: true
    }).addTo(this.map);

    this.locationMarker.on('dragend', () => {
      const pos = this.locationMarker.getLatLng();
      this.asset.mapLatitude = pos.lat;
      this.asset.mapLongitude = pos.lng;
    });
  }


  onManualCoordinateChange(): void {
  const lat = this.asset.mapLatitude;
  const lng = this.asset.mapLongitude;

  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
    this.map.setView([lat, lng], 15);
    this.addMarker(lat, lng);
  }
}


}
