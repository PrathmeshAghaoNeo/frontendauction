import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { Location } from '@angular/common';
import {
  formatToDateTimeLocalFormat,
  normalizeDateTime,
  futureDateValidator,
  endDateAfterStartDateValidator
} from '../../utils/date-time.utils'; // Adjust path if needed
import { AssetCategory } from '../../modals/assetcategories';
import { AssetCategoriesService } from '../../services/assetcategories.service';

@Component({
  selector: 'app-update-auction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-auction.component.html',
  styleUrls: ['./update-auction.component.css']
})
export class UpdateAuctionComponent implements OnInit {
  auctionForm!: FormGroup;
  auctionId!: number;
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
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private assetCategoriesService: AssetCategoriesService,
  ) { }

  ngOnInit(): void {
    this.auctionId = Number(this.route.snapshot.paramMap.get('id'));
    this.currentDateTime = formatToDateTimeLocalFormat(new Date());
    this.initForm();
    this.loadAuction();

    this.assetCategoriesService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      }
    });
  }

  initForm() {
    this.auctionForm = this.fb.group(
      {
        auctionNumber: ['', [Validators.required, Validators.pattern(/^AUC\d{5}$/)]],
        title: ['', [Validators.required, Validators.maxLength(20)]],
        type: ['', Validators.required],
        startDateTime: ['', Validators.required,],
        endDateTime: ['', Validators.required],
        statusId: ['', Validators.required],
        incrementalTime: ['', Validators.required],
        categoryId: ['', Validators.required]
      },
      {
        validators: [endDateAfterStartDateValidator]
      }
    );
  }

  goBack(): void {
    this.location.back();
  }

  loadAuction() {
    this.http.get<any>(`${ApiEndpoints.AUCTION}/${this.auctionId}`).subscribe({
      next: (data) => {
        this.auctionForm.patchValue({
          auctionNumber: data.auctionNumber,
          title: data.title,
          type: data.type,
          startDateTime: formatToDateTimeLocalFormat(data.startDateTime),
          endDateTime: formatToDateTimeLocalFormat(data.endDateTime),
          statusId: data.statusId,
          incrementalTime: data.incrementalTime,
          categoryId: data.categoryId
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to load auction details.', 'error');
      }
    });
  }

  onSubmit() {
    if (this.auctionForm.invalid) {
      this.auctionForm.markAllAsTouched();
      Swal.fire('Incomplete Form', 'Please fill all required fields.', 'warning');
      return;
    }

    const formValue = this.auctionForm.value;

    const payload = {
      auctionId: this.auctionId,
      auctionNumber: formValue.auctionNumber,
      title: formValue.title,
      type: formValue.type,
      startDateTime: normalizeDateTime(formValue.startDateTime),
      endDateTime: normalizeDateTime(formValue.endDateTime),
      statusId: +formValue.statusId,
      incrementalTime: +formValue.incrementalTime,
      categoryId: +formValue.categoryId
    };

    this.http.put(`${ApiEndpoints.AUCTION}/${this.auctionId}`, payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Auction updated successfully.', 'success').then(() => {
          this.router.navigate(['/auctions']);
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Update failed. Please try again.', 'error');
      }
    });
  }
}
