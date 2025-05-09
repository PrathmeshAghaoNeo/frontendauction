import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-add-assetcategories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-assetcategories.component.html',
  styleUrls: ['./add-assetcategories.component.css']
})
export class AddAssetCategoriesComponent implements OnInit {
  assetCategoryForm: FormGroup;

  statuses = [
    { statusId: 1, statusName: 'Draft' },
    { statusId: 2, statusName: 'Published' }
  ];
  paymentMethods = [
    { methodId: 1, methodName: 'Bank Transfer' },
    { methodId: 2, methodName: 'Debit Card' },
    { methodId: 3, methodName: 'Apply Pay' },
    { methodId: 4, methodName: 'Google Pay' },
    { methodId: 5, methodName: 'Cheque' },
  ];

  previewUrls: { [key: string]: string } = {
    icon: '',
    document: ''
  };

  formFiles: { [key: string]: File | null } = {
    icon: null,
    document: null
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private location: Location
  ) {
    this.assetCategoryForm = this.fb.group({
      categoryId: [null],
      categoryName: ['', [Validators.required]],
      subcategory: ['', [Validators.maxLength(50)]],
      depositPercentage: [null, [Validators.pattern('^[0-9]+$')]],
      details: ['', [Validators.maxLength(200)]],
      adminFees: [null, [Validators.pattern('^[0-9]+$')]],
      auctionFees: [null, [Validators.pattern('^[0-9]+$')]],
      buyerCommission: [null, [Validators.pattern('^[0-9]+$')]],
      registrationDeadline: [null],
      iconFile: [null, [Validators.required]],
      document: [null, [Validators.required]],
      vatpercentage: [null, [Validators.pattern('^[0-9]+$')]],
      statusId: [1, [Validators.required]],
      vatid: [null],
      sortOrder: [null],
      statusName: [null]
    });
  }

  ngOnInit(): void {}

  goBack(): void {
    this.location.back();
  }
  onCheckboxChange(event: any): void {
    const formArray = this.assetCategoryForm.get('paymentMethods') as FormArray;
  
    if (event.target.checked) {
      // Add the selected payment method to the FormArray if checked
      formArray.push(new FormControl(event.target.value));
    } else {
      // Remove the unselected payment method from the FormArray if unchecked
      const index = formArray.controls.findIndex(c => c.value === event.target.value);
      if (index !== -1) {
        formArray.removeAt(index);
      }
    }
  }
  
  onFileChange(event: any, controlName: 'iconFile' | 'document') {
    const file = event.target.files[0];
    if (!file) return;
  
    const isImage = file.type.startsWith('image/');
    const isDocument = controlName === 'document';
  
    if (!isImage && !isDocument) {
      Swal.fire('Invalid File', 'Please upload a valid file.', 'error');
      return;
    }
  
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('File Too Large', 'Max size is 2MB.', 'error');
      return;
    }
  
    this.formFiles[controlName] = file;
  
    if (isImage) {
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
  
    formData.append('CategoryName', formValue.categoryName);
    formData.append('Subcategory', formValue.subcategory ?? '');
    formData.append('DepositPercentage', formValue.depositPercentage ?? '');
    formData.append('Details', formValue.details ?? '');
    formData.append('Vatpercentage', formValue.vatpercentage ?? '');
    formData.append('StatusId', formValue.statusId.toString());
  
    if (formValue.adminFees !== null && formValue.adminFees !== undefined) {
      formData.append('AdminFees', formValue.adminFees.toString());
    }
    if (formValue.auctionFees !== null && formValue.auctionFees !== undefined) {
      formData.append('AuctionFees', formValue.auctionFees.toString());
    }
    if (formValue.buyerCommission !== null && formValue.buyerCommission !== undefined) {
      formData.append('BuyerCommission', formValue.buyerCommission.toString());
    }
  
    if (formValue.registrationDeadline) {
      const isoDate = new Date(formValue.registrationDeadline).toISOString();
      formData.append('RegistrationDeadline', isoDate);
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
        Swal.fire('Error', err?.error?.message || 'Something went wrong. Please try again.', 'error');
      }
    });
  }
}

