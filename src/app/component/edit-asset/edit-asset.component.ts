import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ManageAssetService } from '../../services/asset.service';
import { AddAsset } from '../../modals/add-asset';
import { Asset } from '../../modals/manage-asset';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Auction } from '../../modals/auctions';
import { AuctionService } from '../../services/auction.service';
import { environment } from '../../constants/enviroments';

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
  
  categories = [
    { id: 1, name: 'Auction' },
    { id: 2, name: 'Fixed Price' },
    { id: 3, name: 'Instant Buy' },
  ];

requestForViewingOptions = [
  { id: 1, name: 'Yes' },
  { id: 0, name: 'No' }
];

requestForInquiryOptions = [
  { id: 1, name: 'Yes' },
  { id: 0, name: 'No' }
];


// // Method to display 'Yes' for true and 'No' for false
getRequestLabel(value: Number | undefined) {
  // Default to false if value is undefined
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
     private auctionService: AuctionService
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

  }

  private getAssetIdFromRoute(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const assetIdParam = params.get('assetId');
        // this.attributeList = [...(this.asset.attributes || [])];

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
        this.handleGalleryConversion();
        
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

async handleGalleryConversion(): Promise<void> {
  // await this.convertGalleryUrlsToFiles();
}

// async convertGalleryUrlsToFiles(): Promise<void> {
//   this.convertedGalleryFiles = [];

//   for (let i = 0; i < this.asset.galleries.length; i++) {
//     const gallery = this.asset.galleries[i];
//     const fullUrl = `${environment.baseurl}${gallery.filePath}`;
//     console.log("Full image URL:", fullUrl);

//     // Extract extension from filePath
//     const extMatch = gallery.filePath?.match(/\.(jpg|jpeg|png)$/i);
//     const extension = extMatch ? extMatch[1].toLowerCase() : 'jpg';
//     const mimeType = this.getMimeType(extension);
//     const filename = `gallery-${i}.${extension}`;

//     try {
//       const file = await this.imageUrlToFile(fullUrl, filename, mimeType);
//       this.convertedGalleryFiles.push(file);

//       console.log(`File ${i}:`, file);
//     } catch (error) {
//       console.error(`Error converting gallery image ${i}:`, error);
//     }
//   }

//   console.log("All converted gallery files:", this.convertedGalleryFiles);
// }

// imageUrlToFile(url: string, filename: string, mimeType: string): Promise<File> {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = 'anonymous'; // Needed to avoid CORS issues

//     img.onload = () => {
//       const canvas = document.createElement('canvas');
//       canvas.width = img.width;
//       canvas.height = img.height;

//       const ctx = canvas.getContext('2d');
//       if (!ctx) return reject(new Error("Failed to get canvas context."));

//       ctx.drawImage(img, 0, 0);

//       canvas.toBlob(blob => {
//         if (blob) {
//           const file = new File([blob], filename, { type: mimeType });
//           resolve(file);
//         } else {
//           reject(new Error("Failed to convert image to blob."));
//         }
//       }, mimeType);
//     };

//     img.onerror = () => reject(new Error(`Image failed to load: ${url}`));
//     img.src = url;
//   });
// }

// getMimeType(extension: string): string {
//   switch (extension.toLowerCase()) {
//     case 'png':
//       return 'image/png';
//     case 'jpeg':
//     case 'jpg':
//       return 'image/jpeg';
//     default:
//       return 'image/jpeg'; // Default fallback
//   }
// }


////////////////////////==============///////////////////
galleryError: string = '';
  updateAsset(form: NgForm): void {
    
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

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (!this.asset.galleries) {
          this.asset.galleries = [];
        }
        this.asset.galleries.push({
          fileUrl: e.target.result,
          filePath: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle document selection
  onDocumentSelected(event: any): void {
    const files: FileList = event.target.files;
    this.handleDocumentFiles(files);
  }

  // Handle PDF drop
  onDropPdf(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.handleDocumentFiles(event.dataTransfer.files);
    }
  }

  // Helper method to handle document files
  private handleDocumentFiles(files: FileList): void {
    this.documentUploadError = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (file.type !== 'application/pdf') {
        this.documentUploadError = 'Only PDF files are allowed';
        continue;
      }

      // Validate file size (example: 10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        this.documentUploadError = 'PDF must be less than 10MB';
        continue;
      }
      
      this.newDocumentFiles.push(file);

      // Add to documents array for preview
      if (!this.asset.documents) {
        this.asset.documents = [];
      }
      this.asset.documents.push({
        documentId: 0, // Temporary, will be assigned by backend
        filePath: file.name,
      });
    }
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

  // Remove document
  removeDocument(index: number): void {
    if (this.asset.documents) {
      this.asset.documents.splice(index, 1);
    }
    // Also remove from newDocumentFiles if it's there
    if (index < this.newDocumentFiles.length) {
      this.newDocumentFiles.splice(index, 1);
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



