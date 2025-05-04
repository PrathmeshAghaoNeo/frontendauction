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
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiEndpoints } from '../../constants/api-endpoints';
import {
  formatToDateTimeLocalFormat,
  futureDateValidator,
  endDateAfterStartDateValidator,
  normalizeDateTime
} from '../../utils/date-time.utils';

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

  categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Vehicles' },
    { id: 3, name: 'Furniture' },
    { id: 4, name: 'Collectibles' },
    { id: 5, name: 'Real Estate' },
    { id: 6, name: 'Fashion' },
    { id: 7, name: 'Industrial Equipment' },
    { id: 8, name: 'Books & Media' },
    { id: 9, name: 'Sports & Outdoors' },
    { id: 10, name: 'Toys & Games' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auctionId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadAuction();
  }

  initForm() {
    this.auctionForm = this.fb.group(
      {
        auctionNumber: ['', [Validators.required, Validators.pattern(/^AUC\d{5}$/)]],
        title: ['', [Validators.required, Validators.maxLength(20)]],
        type: ['', Validators.required],
        startDateTime: ['', [this.futureDateValidator]],
        endDateTime: ['', [Validators.required, this.futureDateValidator]],
        statusId: ['', Validators.required],
        incrementalTime: ['', Validators.required],
        categoryId: ['', Validators.required]
      },
      {
        validators: [this.endDateAfterStartDateValidator]
      }
    );
  }

  loadAuction() {
    this.http.get<any>(`${ApiEndpoints.AUCTION}/${this.auctionId}`).subscribe({
      next: (data) => {
        this.auctionForm.patchValue({
          auctionNumber: data.auctionNumber,
          title: data.title,
          type: data.type,
          startDateTime: this.formatToDateTimeLocalFormat(data.startDateTime),
          endDateTime: this.formatToDateTimeLocalFormat(data.endDateTime),
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

  formatToDateTimeLocalFormat(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const now = new Date();
    return selectedDate <= now ? { pastDate: true } : null;
  }

  endDateAfterStartDateValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDateTime')?.value;
    const end = group.get('endDateTime')?.value;

    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);

    return endDate > startDate ? null : { endBeforeStart: true };
  }

  onSubmit() {
    if (this.auctionForm.invalid) {
      this.auctionForm.markAllAsTouched();
      Swal.fire('Incomplete Form', 'Please fill all required fields.', 'warning');
      return;
    }

    const formValue = this.auctionForm.value;

    const normalizeDateTime = (val: string): string =>
      val.length === 16 ? `${val}:00` : val;

    const payload = {
      auctionId: this.auctionId, // ✅ required by backend
      auctionNumber: formValue.auctionNumber,
      title: formValue.title,
      type: formValue.type,
      startDateTime: new Date(normalizeDateTime(formValue.startDateTime)).toISOString(),
      endDateTime: new Date(normalizeDateTime(formValue.endDateTime)).toISOString(),
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
