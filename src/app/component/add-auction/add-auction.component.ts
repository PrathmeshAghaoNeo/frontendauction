import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Component({
  selector: 'app-add-auction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-auction.component.html',
  styleUrls: ['./add-auction.component.css']
})
export class AddAuctionComponent implements OnInit {
  auctionForm: FormGroup;
  statuses: any[] = [
    { statusId: 1, statusName: 'Pending' },
    { statusId: 2, statusName: 'Active' },
    { statusId: 3, statusName: 'Completed' },
    { statusId: 4, statusName: 'Cancelled' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.auctionForm = this.fb.group({
      auctionNumber: ['', Validators.required],
      title: ['', Validators.required],
      type: ['', Validators.required],
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
      statusId: ['', Validators.required],
      incrementalTime: ['', Validators.required],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit() {
    const currentDate = new Date();
    const formattedDate = this.formatDate(currentDate);
    this.auctionForm.patchValue({
      startDateTime: formattedDate,
      endDateTime: formattedDate
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

      this.http.post(`${ApiEndpoints.AUCTION}`, payload)
        .subscribe({
          next: res => {
            alert('Auction created successfully');
            this.auctionForm.reset();
          },
          error: err => {
            console.error(err);
            alert('Something went wrong');
          }
        });
    } else {
      this.auctionForm.markAllAsTouched();
      alert('Please fill out all required fields.');
    }
  }
}
