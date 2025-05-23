import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-deposit-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './deposit-page.component.html',
  styleUrl: './deposit-page.component.css',
})
export class DepositPageComponent {
  depositForm: FormGroup;
  categories = ['Properties', 'Vehicles', 'Electronics'];
  selectedCategory = 'Properties';
  currentDeposit = 20000;
  totalLimit = 200000;
  availableLimit = 100000;
  topUpAmount = 21500;

  paymentMethods = [
    'Bank Transfer',
    'Cheque',
    'Credit Card',
    'Benefit',
    'Apple Pay',
    'Google Pay',
    'Paypal',
  ];

  constructor(private fb: FormBuilder) {
    this.depositForm = this.fb.group({
      category: ['', Validators.required],
      topUpLimit: [0, [Validators.required, Validators.min(1)]],
      paymentMethod: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.depositForm.valid) {
      console.log(this.depositForm.value);
    }
  }

  increaseTopUp() {
    const current = this.depositForm.get('topUpLimit')?.value || 0;
    this.depositForm.patchValue({ topUpLimit: current + 1000 });
  }

  decreaseTopUp() {
    const current = this.depositForm.get('topUpLimit')?.value || 0;
    if (current > 1000) {
      this.depositForm.patchValue({ topUpLimit: current - 1000 });
    }
  }
}
