import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { CommonModule, Location } from '@angular/common';

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
    iconFile: null,
    document: null
  };
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private location: Location,
  ) {
    this.assetCategoryForm = this.fb.group({
      categoryName: ['', Validators.required],
      subCategory: ['', Validators.maxLength(30)],
      depositPercentage: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
      details: ['', Validators.required],
      iconFile: [null, Validators.required],
      document: [null, Validators.required],
      paymentMethods: this.fb.array([]),
      statusId: ['', Validators.required],
      adminFees: [null, Validators.pattern('^[0-9]+$')],
      auctionFees: [null, Validators.pattern('^[0-9]+$')],
      buyersCommission: [null, Validators.pattern('^[0-9]+$')],
      registrationDeadline: [''],
      vat: ['',Validators.maxLength(5)],
      vatPercentage: [null, Validators.pattern('^[0-9]+$')]
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

  onCheckboxChange(event: any): void {
    const methodName = event.target.value;
    if (event.target.checked) {
      this.paymentMethodsArray.push(new FormControl(methodName));
    } else {
      const index = this.paymentMethodsArray.controls.findIndex(x => x.value === methodName);
      if (index !== -1) {
        this.paymentMethodsArray.removeAt(index);
      }
    }
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
    formData.append('Vat', formValue.vat ?? '');
    formData.append('VatPercentage', formValue.vatPercentage ?? '');
    formData.append('StatusId', formValue.statusId.toString());

    if (formValue.adminFees != null) formData.append('AdminFees', formValue.adminFees);
    if (formValue.auctionFees != null) formData.append('AuctionFees', formValue.auctionFees);
    if (formValue.buyersCommission != null) formData.append('BuyersCommission', formValue.buyersCommission);
    if (formValue.buyersCommission != null) formData.append('RegistrationDeadline', formValue.registrationDeadline); 
    

    for (let method of formValue.paymentMethods) {
      formData.append('PaymentMethods', method);
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
