import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.currentDateTime = this.formatDate(new Date());
    this.auctionForm = this.fb.group({
      auctionNumber: ['', [Validators.required, Validators.pattern(/^AUC\d{5}$/)]], 
      title: ['', [Validators.required, Validators.maxLength(20)]], 
      type: ['', Validators.required],
      startDateTime: ['', [Validators.required, this.futureDateValidator]],
      endDateTime: ['', [Validators.required, this.futureDateValidator]],
      statusId: ['', Validators.required],
      incrementalTime: ['', Validators.required],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.auctionForm.patchValue({
      startDateTime: this.currentDateTime,
      endDateTime: this.currentDateTime
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  formatDisplayDate(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const now = new Date();
    return selectedDate <= now ? { pastDate: true } : null;
  }

  onSubmit() {
    if (this.auctionForm.valid) {
      const formValue = this.auctionForm.value;
  
      const payload = {
        auctionNumber: formValue.auctionNumber,
        title: formValue.title,
        type: formValue.type,
        startDateTime: new Date(formValue.startDateTime).toISOString(),
        endDateTime: new Date(formValue.endDateTime).toISOString(),
        statusId: +formValue.statusId,
        incrementalTime: +formValue.incrementalTime,
        categoryId: +formValue.categoryId
      };
  
      this.http.post(`${ApiEndpoints.AUCTION}`, payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Auction created successfully',
            confirmButtonText: 'OK'
          }).then(() => {
            this.auctionForm.reset();
            this.router.navigate(['/auctions']);
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong. Please try again.',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      this.auctionForm.markAllAsTouched(); 
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill all required fields correctly before submitting.',
        confirmButtonText: 'OK'
      });
    }
  }
  
}
