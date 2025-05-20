import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ManageAssetService } from '../../services/asset.service';
import { AddAsset } from '../../modals/add-asset';
import { Asset, AssetDocumentFormDto, AssetGalleryDto } from '../../modals/manage-asset';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Auction } from '../../modals/auctions';
import { AuctionService } from '../../services/auction.service';
import { environment } from '../../constants/enviroments';
import { AssetCategoriesService } from '../../services/assetcategories.service';
import { AssetCategory } from '../../modals/assetcategories';

@Component({
  selector: 'app-edit-asset',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './edit-asset.component.html',
  styleUrl: './edit-asset.component.css',
})
export class EditAssetComponent implements OnInit {
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
  
  
  imagePreviews: string[] = [];
  existingDocuments: string[] = [];
  
  auctions: Auction[] = [];
  
  filteredAuctions: Auction[] = [];
  
  attributeList: { attributeName: string; attributeValue: string }[] = [];
  asset: Asset = {
    assetId: this.assetIdparam,
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
  winnerAwardingOptions = ['Automatic', 'Manual'];
  deliveryRequiredOptions = ['Yes', 'No'];
  selectedOpton: number= 0;
  
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
    { id: 3, name: 'None' }
  ];
  
 categories: AssetCategory[] = [];

requestForViewingOptions = [
  { id: 1, name: 'Yes' },
  { id: 0, name: 'No' }
];

requestForInquiryOptions = [
  { id: 1, name: 'Yes' },
  { id: 0, name: 'No' }
];


getRequestLabel(value: Number | undefined) {
  if(value== 0){
    this.asset.requestForViewing = false;
  }else{
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
    private assetCategoriesService: AssetCategoriesService,
  ) {
  }
  
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

  ngOnInit(): void {
    this.getAssetIdFromRoute();
    
    console.log('Asset on page load:', this.asset);
    this.assetCategoriesService.getAll().subscribe({
    next: (data) => {
      this.categories = data;
    },
    error: (err) => {
      console.error('Failed to load categories', err);
    }
  });
  }

  private getAssetIdFromRoute(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const assetIdParam = params.get('assetId');

        if (assetIdParam) {
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

    this.assetService.getAssetById(assetId).subscribe({
      next: (response: Asset) => {
        this.asset = response;
        this.isLoading = false;
        this.isModalOpen = true;
        this.attributeList = [...(this.asset.attributes || [])]; 
        console.log('Asset loaded successfully:', this.asset);
        this.fetchAuctions();

        // this.convertGalleryUrlsToFiles();
       
        
      },
      error: (err) => {
        this.error = 'Failed to load asset. Please try again later.';
        this.isLoading = false;
        console.error('Error loading asset:', err);
      },
    });
    
  }


  fetchAuctions(): void {
    this.auctionService.getAllAuctions().subscribe({
    next: (data) => {
      this.auctions = data;
      console.log("auction", this.auctions);

      this.selectedAuctions = this.auctions.filter(auction =>
        this.asset.auctionIds.includes(auction.auctionId)
      );
      console.log('Selected auctions:', this.selectedAuctions);
    
    },
    error: (err) => {
      console.error('Error fetching auctions', err);
      Swal.fire('Error!', 'Failed to load auctions.', 'error');
    }
  });
}

//////////////////////////////////=================================////////////////////////


galleryError: string = '';
documentError : string = '';

  updateAsset(form: NgForm): void {

    if(this.asset.attributes.length === 0){
      this.attributeError = 'Please add at least one attribute.'; 
      form.control.markAllAsTouched(); 
      return;
    }
    
    if(this.asset.mapLatitude === 0 || this.asset.mapLatitude === null){
      this.lattitudeError = 'Please add latitude.'; 
      form.control.markAllAsTouched(); 
      return;
    }
    if(this.asset.mapLongitude === 0 || this.asset.mapLongitude === null){
      this.longitudeError = 'Please add longitude.'; 
      form.control.markAllAsTouched(); 
      return;
    }
    if(this.asset.documents.length === 0 && this.newDocumentFiles.length === 0){
      this.documentError = 'Please add at least one document.'; 
      form.control.markAllAsTouched(); 
      return;
    }

    if(this.asset.galleries.length === 0 && this.newGalleryFiles.length === 0){ 
      this.galleryError = 'Please add at least one image.'; 
      form.control.markAllAsTouched(); 
      return;
    }

    if(form.invalid || this.asset.attributes.length === 0 ) {
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
      formData.append('requestForViewing', this.asset.requestForViewing ? 'true' : 'false');
      formData.append('requestForInquiry', this.asset.requestForInquiry ? 'true' : 'false');


      
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
          Swal.fire({
            icon: 'success',
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
      this.assetService.deleteAssetGallery(gallery.galleryId.toString()).subscribe({
        next: () => {
          console.log("we are in gallery delete logic");
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
  console.log('Document ID to delete:', doc.documentId  );

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this document?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      this.assetService.deleteAssetDocument(doc.documentId.toString()).subscribe({
        next: () => {
          console.log("Document deleted successfully");
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
      if (file.size > 500 * 1024) {
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
  this.existingDocuments = this.existingDocuments.filter(doc => doc !== docPath);
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
  
}



