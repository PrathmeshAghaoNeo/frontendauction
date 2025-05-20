import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { CommonModule, Location } from '@angular/common';
import { AssetCategoriesService } from '../../services/assetcategories.service';
import { formatToDateTimeLocalFormat } from '../../utils/date-time.utils';
import { environment } from '../../constants/enviroments';

@Component({
  selector: 'app-update-assetcategories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './udpate-assetcategories.component.html',
  styleUrls: ['./udpate-assetcategories.component.css']
})
export class UpdateAssetCategoriesComponent implements OnInit {
  assetCategoryForm: FormGroup;
  assetCategoryId: string = '';

  statuses = [
    { statusId: 1, statusName: 'Draft' },
    { statusId: 2, statusName: 'Published' }
  ];

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
    iconFile: '',
    document: ''
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
      subCategory: ['', Validators.maxLength(30)],
      depositPercentage: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      details: ['', [Validators.required, Validators.maxLength(50)]],
      iconFile: [null], 
      document: [null],  
      icon: [null],
      statusId: ['', Validators.required],
      paymentMethods: this.fb.array([]),
      adminFees: [null, [Validators.pattern('^[0-9]*$')]],
      auctionFees: [null, [Validators.pattern('^[0-9]*$')]],
      buyersCommission: [null, [Validators.pattern('^[0-9]*$')]],
      registrationDeadline: [null],
      vat: [''],
      vatPercentage: [null, [Validators.pattern('^[0-9]*$')]]
    });
  }
  assetBaseUrl: string = `${environment.baseurl}`;
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.assetCategoryId = params.get('id') || '';
      this.loadAssetCategoryData();
    });
  }

 loadAssetCategoryData(): void {
  if (this.assetCategoryId) {
    this.http.get(`${ApiEndpoints.ASSETCATEGORIES}/${this.assetCategoryId}`).subscribe({
      next: (data: any) => {
        this.assetCategoryForm.patchValue({
          categoryName: data.categoryName,
          subCategory: data.subcategory,
          depositPercentage: data.depositPercentage,
          details: data.details,
          statusId: data.statusId,
          adminFees: data.adminFees,
          auctionFees: data.auctionFees,
          buyersCommission: data.buyerCommission,
          registrationDeadline: formatToDateTimeLocalFormat(data.registrationDeadline),
          vat: data.vatid,
          vatPercentage: data.vatpercentage,
          icon: data.icon, // e.g., "CategoryIcons/23f2c368-fa58-4d09-ad1f-addab5a4270d.png"
        });

        // FIX: Preview icon using correct key
        this.previewUrls['icon'] = data.icon ? 
          (data.icon.startsWith('http') ? data.icon : this.assetBaseUrl + data.icon) : null;

        // Document preview (if needed)
       this.previewUrls['document'] = data.document
  ? (data.document.startsWith('http') ? data.document : this.assetBaseUrl + data.document)
  : null;

        console.log('Preview URL for document:', this.previewUrls['document']);

        // Payment methods (if applicable)
        const formArray = this.assetCategoryForm.get('paymentMethods') as FormArray;
        formArray.clear();
        if (data.paymentMethods && Array.isArray(data.paymentMethods)) {
          data.paymentMethods.forEach((method: string) => {
            formArray.push(new FormControl(method));
          });
        }
      },
      error: () => {
        Swal.fire('Error', 'Failed to load asset category data', 'error');
      }
    });
  }
}




  goBack(): void {
    this.location.back();
  }

  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      this.assetCategoryForm.patchValue({ [controlName]: file });
      this.assetCategoryForm.get(controlName)?.markAsTouched();
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrls[controlName] = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  dateValidator(control: any) {
    if (control.value && isNaN(Date.parse(control.value))) {
      return { invalidDate: true };
    }
    return null;
  }
  onCheckboxChange(event: any) {
    const formArray = this.assetCategoryForm.get('paymentMethods') as FormArray;
    if (event.target.checked) {
      formArray.push(new FormControl(event.target.value));
    } else {
      const index = formArray.controls.findIndex((x) => x.value === event.target.value);
      if (index !== -1) {
        formArray.removeAt(index);
      }
    }
  }

  onSubmit(): void {
    if (!this.assetCategoryForm.valid) {
      this.assetCategoryForm.markAllAsTouched();
      return;
    }

    const formValue = this.assetCategoryForm.getRawValue();
    const formData = new FormData();

    formData.append('CategoryName', formValue.categoryName);
    formData.append('Subcategory', formValue.subCategory || '');
    formData.append('DepositPercentage', formValue.depositPercentage);
    formData.append('Details', formValue.details || '');

    // Helper function
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

    const iconFile = this.assetCategoryForm.get('iconFile')?.value;
    if (iconFile instanceof File) {
      formData.append('IconFile', iconFile);
    }

    const documentFile = this.assetCategoryForm.get('document')?.value;
    if (documentFile instanceof File) {
      formData.append('Document', documentFile);
    }

    this.http.put(`${ApiEndpoints.ASSETCATEGORIES}/${this.assetCategoryId}`, formData).subscribe({
      next: () => {
        Swal.fire('Success', 'Asset Category updated successfully!', 'success');
        this.router.navigate(['/assetcategories']);
      },
      error: (err) => {
        console.error('Update failed:', err);
        Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
      }
    });
  }
}