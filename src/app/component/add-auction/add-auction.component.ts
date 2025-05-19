import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { formatToDateTimeLocalFormat, normalizeDateTime, futureDateValidator, endDateAfterStartDateValidator } from '../../utils/date-time.utils';  // Adjust the path if necessary
import { Location } from '@angular/common';
import { AssetCategory } from '../../modals/assetcategories';
import { AssetCategoriesService } from '../../services/assetcategories.service';

@Component({
  selector: 'app-add-auction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-auction.component.html',
  styleUrls: ['./add-auction.component.css']
})
export class AddAuctionComponent implements OnInit {
  auctionForm: FormGroup;
  currentDateTime!: string;

  statuses = [
    { statusId: 1, statusName: 'Pending' },
    { statusId: 2, statusName: 'Active' },
    { statusId: 3, statusName: 'Completed' },
    { statusId: 4, statusName: 'Cancelled' }
  ];

    categories: AssetCategory[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private assetCategoriesService: AssetCategoriesService,
    private location: Location  ) {
    this.currentDateTime = formatToDateTimeLocalFormat(new Date()); 

    this.auctionForm = this.fb.group(
      {
        auctionNumber: ['', [Validators.required, Validators.pattern(/^AUC\d{5}$/)]],
        title: ['', [Validators.required, Validators.maxLength(20)]],
        type: ['', Validators.required],
        startDateTime: ['', futureDateValidator],
        endDateTime: ['', [Validators.required, futureDateValidator]], 
        statusId: ['', Validators.required],
        incrementalTime: ['', Validators.required],
        categoryId: ['', Validators.required]
      },
      { validators: endDateAfterStartDateValidator } 
    );
  }

  ngOnInit() {
    const now = new Date();
    const formattedNow = formatToDateTimeLocalFormat(now);
    this.auctionForm.patchValue({
    startDateTime: formattedNow,
    endDateTime: formattedNow
});
this.assetCategoriesService.getAll().subscribe({
    next: (data) => {
      this.categories = data;
    },
    error: (err) => {
      console.error('Failed to load categories', err);
    }
  });

    console.log('Init datetime:', this.auctionForm.getRawValue());

  }
    


  goBack(): void {
    this.location.back();
  }

  onSubmit() {
    if (!this.auctionForm.valid) {
      this.auctionForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill all required fields correctly before submitting.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      return;
    }
  
    const formValue = this.auctionForm.getRawValue();  // <-- FIXED
  
    console.log('Raw startDateTime:', formValue.startDateTime);
    console.log('Raw endDateTime:', formValue.endDateTime);
  
    const normalizedStartDateTime = normalizeDateTime(formValue.startDateTime);
    const normalizedEndDateTime = normalizeDateTime(formValue.endDateTime);
  
    const payload = {
      auctionNumber: formValue.auctionNumber,
      title: formValue.title,
      type: formValue.type,
      startDateTime: new Date(normalizedStartDateTime).toISOString(),
      endDateTime: new Date(normalizedEndDateTime).toISOString(),
      statusId: +formValue.statusId,
      incrementalTime: +formValue.incrementalTime,
      categoryId: +formValue.categoryId
    };
  
    console.log('Payload:', payload);

    this.http.post(ApiEndpoints.AUCTION, payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Auction created successfully',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          this.auctionForm.reset();
          this.router.navigate(['/auctions']);
        });
      },
      error: (err) => {
        console.error('Full error:', err);
        let errorMessage = 'Something went wrong. Please try again.';
      
        if (err.status === 409) {
          errorMessage = 'Auction number already exists. Please choose a different one.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error?.errors && Array.isArray(err.error.errors)) {
          errorMessage = err.error.errors.join('\n');
        }
      
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
