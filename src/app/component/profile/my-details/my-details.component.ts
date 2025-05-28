import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserView } from '../../../modals/user';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

interface UserProfile {
  userId: number;
  uid: number;
  name: string;
  email: string;
  mobileNumber: string;
  companyName: string;
  companyNumber: string;
  statusId: number;
  chatEnabled: boolean;
  roleId: number;
  personalIdNumber: string;
  gender: string;
  personalIdExpiryDate: string;
  countryId: number;
  profileImageUrl: string;
  personalIdImageUrl: string;
  totalLimit: number;
  deposit: number;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-my-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-details.component.html',
  styleUrl: './my-details.component.css',
})
export class MyDetailsComponent implements OnInit {
  user: UserProfile = {
    userId: 0,
    uid: 0,
    name: '',
    email: '',
    mobileNumber: '',
    companyName: '',
    companyNumber: '',
    statusId: 0,
    chatEnabled: false,
    roleId: 0,
    personalIdNumber: '',
    gender: 'Male',
    personalIdExpiryDate: '',
    countryId: 0,
    profileImageUrl: '',
    personalIdImageUrl: '',
    totalLimit: 0,
    deposit: 0,
    instagram: '',
    twitter: '',
    facebook: '',
  };

  isLoading = true;
  errorMessage = '';
  editMode = false;
  profileImageFile: File | null = null;
  profileImagePreviewUrl: string | null = null;
  personalIdImageFile: File | null = null;
  personalIdImagePreviewUrl: string | null = null;
  showDepositMenu = false;

  validationErrors: {
    mobileNumber?: string;
    personalIdNumber?: string;
    personalIdExpiryDate?: string;
    deposit?: string;
    totalLimit?: string;
  } = {};

  private originalValues: Partial<UserProfile> = {};

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService
      .getCurrentUser()
      .pipe(
        catchError((error) => {
          this.errorMessage =
            'Failed to load user profile. Please try again later.';
          this.isLoading = false;
          console.error('Error loading user profile:', error);
          return of(null);
        })
      )
      .subscribe((data: UserView | null) => {
        if (data) {
          this.user = {
            ...(data as any),
            instagram: (data as any).instagram || '',
            twitter: (data as any).twitter || '',
            facebook: (data as any).facebook || '',
          };

          this.profileImagePreviewUrl = this.user.profileImageUrl;
          this.personalIdImagePreviewUrl = this.user.personalIdImageUrl;

          this.isLoading = false;
        }
      });
  }

  

  toggleEditMode(): void {
    if (this.editMode) {
      if (!this.validateAllFields()) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please correct the errors before saving',
          confirmButtonText: 'OK',
        });
        return;
      }

      this.saveChanges();
    } else {
      this.originalValues = { ...this.user };
      this.profileImagePreviewUrl = this.user.profileImageUrl;
      this.personalIdImagePreviewUrl = this.user.personalIdImageUrl;
      this.editMode = true;
      this.validationErrors = {};
    }
  }

  saveChanges(): void {
    this.isLoading = true;

    const formData = new FormData();

    formData.append('Name', this.user.name);
    formData.append('MobileNumber', this.user.mobileNumber);
    formData.append('Email', this.user.email);
    formData.append('CompanyName', this.user.companyName || '');
    formData.append('CompanyNumber', this.user.companyNumber || '');
    formData.append('StatusId', this.user.statusId.toString());
    formData.append('ChatEnabled', this.user.chatEnabled.toString());
    formData.append('RoleId', this.user.roleId.toString());
    formData.append('PersonalIdNumber', this.user.personalIdNumber);
    formData.append('Gender', this.user.gender);
    formData.append('PersonalIdExpiryDate', this.user.personalIdExpiryDate);
    formData.append('CountryId', this.user.countryId.toString());
    formData.append('TotalLimit', this.user.totalLimit.toString());
    formData.append('Deposit', this.user.deposit.toString());

    if (this.user.instagram) formData.append('Instagram', this.user.instagram);
    if (this.user.twitter) formData.append('Twitter', this.user.twitter);
    if (this.user.facebook) formData.append('Facebook', this.user.facebook);

    if (this.profileImageFile) {
      formData.append('ProfileImage', this.profileImageFile);
    }

    if (this.personalIdImageFile) {
      formData.append('PersonalIdImage', this.personalIdImageFile);
    }

    this.userService
      .updateCurrentUser(formData)
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Failed to update profile. Please try again.';
          this.isLoading = false;
          console.error('Error updating profile:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.isLoading = false;
            this.editMode = false;
            this.profileImageFile = null;
            this.personalIdImageFile = null;

            Swal.fire({
              icon: 'success',
              title: 'Profile Updated',
              text: 'Your profile has been updated successfully!',
              timer: 2000,
              showConfirmButton: false,
            });

            this.loadUserProfile();
          }
        },
        error: (error) => {
          console.error('Error in subscribe:', error);
          this.errorMessage = 'Failed to update profile. Please try again.';
          this.isLoading = false;
        },
        complete: () => console.log('Update request completed'),
      });
  }

  
  cancelEdit(): void {
    this.user = { ...this.user, ...this.originalValues };
    this.profileImagePreviewUrl = this.user.profileImageUrl;
    this.personalIdImagePreviewUrl = this.user.personalIdImageUrl;
    this.profileImageFile = null;
    this.personalIdImageFile = null;
    this.editMode = false;
    this.validationErrors = {};
  }

  validateMobileNumber(value: string): string {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(value)
      ? ''
      : 'Please enter a valid phone number (10 digits)';
  }


  validatePersonalId(value: string): string {
    const idRegex = /^[A-Za-z0-9]{6,}$/;
    return idRegex.test(value)
      ? ''
      : 'ID/Passport must be at least 6 alphanumeric characters';
  }

  validateExpiryDate(value: string): string {
    const today = new Date();
    const expiryDate = new Date(value);
    return expiryDate > today ? '' : 'Expiry date must be in the future';
  }

  validateDeposit(value: number): string {
    const depositRegex = /^\d{1,7}(\.\d{1,2})?$/;
    return depositRegex.test(value.toString())
      ? ''
      : 'Enter a valid number with up to 7 digits and a maximum of 2 decimal places';
  }

  validateAllFields(): boolean {
    this.validationErrors = {};

    const mobileNumberError = this.validateMobileNumber(this.user.mobileNumber);
    if (mobileNumberError)
      this.validationErrors.mobileNumber = mobileNumberError;

    const personalIdError = this.validatePersonalId(this.user.personalIdNumber);
    if (personalIdError)
      this.validationErrors.personalIdNumber = personalIdError;

    const expiryDateError = this.validateExpiryDate(this.user.personalIdExpiryDate);
    if (expiryDateError)
      this.validationErrors.personalIdExpiryDate = expiryDateError;

    const depositError = this.validateDeposit(this.user.deposit);
    if (depositError)
      this.validationErrors.deposit = depositError;

    const totalLimitError = this.validateDeposit(this.user.totalLimit);
    if (totalLimitError)
      this.validationErrors.totalLimit = totalLimitError;

    return Object.keys(this.validationErrors).length === 0;
  }

  onUploadPhoto(): void {
    // Implement file upload logic here
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event) => {
      this.onFileChange(event, 'profileImage');
    };
    fileInput.click();
  }

  onMobileNumberChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.user.mobileNumber = input.value;
    const error = this.validateMobileNumber(input.value);
    if (error) {
      this.validationErrors.mobileNumber = error;
    } else {
      delete this.validationErrors.mobileNumber;
    }
  }

  onPersonalIdChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.user.personalIdNumber = input.value;
    const error = this.validatePersonalId(input.value);
    if (error) {
      this.validationErrors.personalIdNumber = error;
    } else {
      delete this.validationErrors.personalIdNumber;
    }
  }

  onExpiryDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.user.personalIdExpiryDate = input.value;
    const error = this.validateExpiryDate(input.value);
    if (error) {
      this.validationErrors.personalIdExpiryDate = error;
    } else {
      delete this.validationErrors.personalIdExpiryDate;
    }
  }

  onFileChange(event: Event, field: 'profileImage' | 'personalIdImage'): void {
      const input = event.target as HTMLInputElement;
  
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
  
        // Validate file type
        if (!file.type.startsWith('image/')) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid File',
            text: 'Please upload a valid image file.',
            timer: 2000,
            showConfirmButton: false,
          });
          input.value = '';
          return;
        }
  
        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
          Swal.fire({
            icon: 'error',
            title: 'File Too Large',
            text: 'File size should be less than 2MB.',
            timer: 2000,
            showConfirmButton: false,
          });
          input.value = '';
          return;
        }
  
        // Store the file and create a preview URL based on field type
        if (field === 'profileImage') {
          this.profileImageFile = file;
          this.profileImagePreviewUrl = URL.createObjectURL(file);
        } else if (field === 'personalIdImage') {
          this.personalIdImageFile = file;
          this.personalIdImagePreviewUrl = URL.createObjectURL(file);
        }
      }
    }

    onDepositChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    console.log('Deposit changed to:', value);
    this.user.deposit = isNaN(value) ? 0 : value;

    const error = this.validateDeposit(this.user.deposit);
    if (error) {
      this.validationErrors.deposit = error;
    } else {
      delete this.validationErrors.deposit;
    }
  }

  onTotalLimitChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    console.log('Total Limit changed to:', value);
    this.user.totalLimit = isNaN(value) ? 0 : value;

    const error = this.validateDeposit(this.user.totalLimit);
    if (error) {
      this.validationErrors.totalLimit = error;
    } else {
      delete this.validationErrors.totalLimit;
    }
  }

  removeIDPhoto(): void {
    this.personalIdImageFile = null;
    this.personalIdImagePreviewUrl = null;
    this.user.personalIdImageUrl = '';
  }

  onUploadIDPhoto(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event) => {
      this.onFileChange(event, 'personalIdImage');
    };
    fileInput.click();
  }

}
