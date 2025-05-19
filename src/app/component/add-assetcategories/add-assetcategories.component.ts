import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { CommonModule, Location } from '@angular/common';
import { AssetCategoriesService } from '../../services/assetcategories.service';
 
@Component({
  selector: 'app-add-assetcategories',
  standalone:true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './add-assetcategories.component.html',
  styleUrls: ['./add-assetcategories.component.css']
})
export class AddAssetCategoriesComponent implements OnInit {
  assetCategoryForm: FormGroup;
 
  statuses = [
    { statusId: 1, statusName: 'Draft' },
    { statusId: 2, statusName: 'Published' }
  ];
  minDate: string | undefined;
  paymentMethods = [
  { paymentMethodIds: 1, methodName: 'Bank Transfer' },
  { paymentMethodIds: 2, methodName: 'Cheque' },
  { paymentMethodIds: 3, methodName: 'Credit Card' },
  { paymentMethodIds: 4, methodName: 'Apple Pay' },
  { paymentMethodIds: 5, methodName: 'Debit Card' },
  { paymentMethodIds: 6, methodName: 'Google Pay' },
  { paymentMethodIds: 7, methodName: 'PayPal' },
];
 
  previewUrls: { [key: string]: string } = {
    icon: '',
    document: ''
  };
 
  formFiles: { [key: string]: File | null } = {
    iconFile: null,
    document: null
  };
 
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private assetCategoryService: AssetCategoriesService,
    private route: ActivatedRoute
  ) {
    this.assetCategoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.maxLength(20)]],
      subCategory: ['', [ Validators.maxLength(30)]],
      depositPercentage: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
      details: ['', Validators.required],
      statusId: ['', Validators.required],
      iconFile: [null, Validators.required],
      document: [null, Validators.required],
      paymentMethodIds: this.fb.control([]),
      adminFees: [null, Validators.pattern('^[0-9]+$')],
      auctionFees: [null, Validators.pattern('^[0-9]+$')],
      buyersCommission: [null, Validators.pattern('^[0-9]+$')],
      registrationDeadline: [''],
      vat: [''],
      vatPercentage: [null, [Validators.pattern('^[0-9]*$')]]
 
    });
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }
  dateValidator(control: any) {
    if (control.value && isNaN(Date.parse(control.value))) {
      return { invalidDate: true };
    }
    return null;
  }
  ngOnInit(): void {}
 
  get paymentMethodsArray(): FormArray {
    return this.assetCategoryForm.get('paymentMethods') as FormArray;
  }
  enforceMaxLength(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.value.length > 7) {
    input.value = input.value.slice(0, 7);
  }
}
 
  goBack(): void {
    this.location.back();
  }
 
  onCheckboxChange(event: any) {
  const selectedIds = this.assetCategoryForm.get('paymentMethodIds')?.value || [];
  const value = parseInt(event.target.value, 10);  // Ensure it's an integer
 
  if (event.target.checked) {
    if (!selectedIds.includes(value)) {
      selectedIds.push(value);  // Add the selected payment method ID
    }
  } else {
    const index = selectedIds.indexOf(value);
    if (index > -1) {
      selectedIds.splice(index, 1);  // Remove the unchecked payment method ID
    }
  }
 
  // Update the form control with the selected IDs
  this.assetCategoryForm.get('paymentMethodIds')?.setValue(selectedIds);
  this.assetCategoryForm.get('paymentMethodIds')?.markAsDirty();  // Mark the form as dirty if necessary
 
}
 
 
 
 
 
  onFileChange(event: any, controlName: 'iconFile' | 'document') {
    const file = event.target.files[0];
    if (!file) return;
 
    const isValidImage = controlName === 'iconFile' && file.type.startsWith('image/');
    const isValidDocument = controlName === 'document' && file.type === 'application/pdf';
 
    if (!isValidImage && !isValidDocument) {
      Swal.fire('Invalid File', 'Please upload a valid file.', 'error');
      return;
    }
 
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('File Too Large', 'Max size is 2MB.', 'error');
      return;
    }
 
    this.formFiles[controlName] = file;
 
    if (controlName === 'iconFile') {
      this.previewUrls[controlName] = URL.createObjectURL(file);
    } else {
      this.previewUrls[controlName] = URL.createObjectURL(file);
    }
  }
 
  onSubmit(): void {
  if (this.assetCategoryForm.invalid) {
    this.assetCategoryForm.markAllAsTouched();
    return;
  }
 
  const iconFile = this.formFiles['iconFile'];
  const documentFile = this.formFiles['document'];
 
  if (!iconFile || !documentFile) {
    Swal.fire('Missing Files', 'Please upload both an icon and a document.', 'warning');
    return;
  }
 
  const formValue = this.assetCategoryForm.getRawValue();
  const formData = new FormData();
 
  formData.append('categoryName', formValue.categoryName);
  formData.append('SubCategory', formValue.subCategory ?? '');
  formData.append('DepositPercentage', formValue.depositPercentage ?? '');
  formData.append('Details', formValue.details ?? '');
  function safeAppend(fd: FormData, key: string, value: any) {
      if (value !== undefined && value !== null) {
        fd.append(key, value.toString());
      }
    }
   safeAppend(formData, 'Vatid', formValue.vat);
    safeAppend(formData, 'AdminFees', formValue.adminFees);
    safeAppend(formData, 'AuctionFees', formValue.auctionFees);
    safeAppend(formData, 'BuyerCommission', formValue.buyersCommission);
    if (formValue.registrationDeadline) {
      safeAppend(formData, 'RegistrationDeadline', new Date(formValue.registrationDeadline).toISOString());
    }
    safeAppend(formData, 'Vatpercentage', formValue.vatPercentage);
    safeAppend(formData, 'StatusId', formValue.statusId);
  // Iterate over the selected payment method IDs instead of paymentMethods array
  const selectedPaymentMethods = formValue.paymentMethodIds;
    for (let methodId of selectedPaymentMethods) {
  formData.append('PaymentMethodIds', methodId.toString()); // or `${methodId}`
    }
 
  formData.append('IconFile', iconFile);
  formData.append('Document', documentFile);
  
 
  this.http.post(`${ApiEndpoints.ASSETCATEGORIES}/create`, formData).subscribe({
    next: () => {
      Swal.fire('Success', 'Asset Category created successfully!', 'success');
      this.router.navigate(['/assetcategories']);
    },
    error: (err) => {
      console.error('Create failed:', err);
      Swal.fire('Error', err?.error?.message || 'Something went wrong.', 'error');
    }
  });
}
 
}