import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { Location } from '@angular/common';  // Import Location service


@Component({
  selector: 'app-add-transaction',
  standalone:true,
  imports: [ReactiveFormsModule, FormsModule,RouterModule],
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.css']
})
export class AddTransactionComponent implements OnInit {
  transactionForm!: FormGroup;

  // Sample options for transaction types, payment methods, etc.
  transactionTypes = [
    { id: 1, name: 'Deposit' },
    { id: 2, name: 'Withdrawal' }
  ];

  paymentMethods = [
    { id: 1, name: 'Cash' },
    { id: 2, name: 'Credit Card' },
    { id: 3, name: 'Debit Card' }
  ];

  cardTypes = [
    { id: 1, name: 'Visa' },
    { id: 2, name: 'MasterCard' },
    { id: 3, name: 'American Express' }
  ];

  statuses = [
    { id: 1, name: 'Pending' },
    { id: 2, name: 'Completed' },
    { id: 3, name: 'Cancelled' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router,private location: Location) { }

  ngOnInit() {
    this.transactionForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0)]],
      userId: [null, Validators.required],
      transactionTypeId: [null, Validators.required],
      paymentMethodId: [null, Validators.required],
      cardTypeId: [null, Validators.required],
      merchantTransactionId: ['', Validators.required],
      transactionDateTime: ['', Validators.required],
      statusId: [null, Validators.required],
      notes: ['', Validators.required],
      documentPath: ['', Validators.required]
    });
  }

  goBack(): void {
    this.location.back(); // This will navigate to the previous page in the browser's history
  }

  onSubmit() {
    if (this.transactionForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill all required fields before submitting.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const formData = this.transactionForm.value;
    const payload = {
      amount: formData.amount,
      userId: formData.userId,
      transactionTypeId: formData.transactionTypeId,
      paymentMethodId: formData.paymentMethodId,
      cardTypeId: formData.cardTypeId,
      merchantTransactionId: formData.merchantTransactionId,
      transactionDateTime: formData.transactionDateTime,
      statusId: formData.statusId,
      notes: formData.notes,
      documentPath: formData.documentPath
    };

    this.http.post(ApiEndpoints.TRANSACTIONS, payload).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Transaction Added Successfully',
          text: `Transaction Number: ${response}`,
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/transactions']); // Redirect to transaction list page
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'An error occurred. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
