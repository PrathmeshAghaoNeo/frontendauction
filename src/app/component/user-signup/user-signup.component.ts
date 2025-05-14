import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { FutureDateValidatorDirective } from '../manage-user/future-date-validator.directive';
import { Router } from '@angular/router';
import { Country, Role, Status, User } from '../../modals/user';
import Swal from 'sweetalert2';
import { NgbDateParserFormatter, NgbDatepickerModule, NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { CustomDateFormatter } from '../../services/custom-date-formatter.service';
import { MobileNumberValidatorDirective } from '../add-user/mobile-number-validator.directive';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FutureDateValidatorDirective, FormsModule, NgbModule, NgbDatepickerModule, MobileNumberValidatorDirective],
  templateUrl: './user-signup.component.html',
  styleUrl: './user-signup.component.css',
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateFormatter }
  ]
})
export class UserSignupComponent implements OnInit {
  // Form state management
  currentStep = 1;
  submitted = false;

  // User model
  user: User = {
    name: '',
    mobileNumber: '',
    email: '',
    companyName: '',
    companyNumber: '',
    statusId: 3,
    chatEnabled: true,
    roleId: 1,
    personalIdNumber: '',
    gender: '',
    personalIdExpiryDate: '',
    countryId: 0,
    profileImage: null,
    personalIdImage: null,
    totalLimit: null,
    deposit: null
  };

  // Dropdown data
  roles: Role[] = [];
  statuses: Status[] = [];
  countries: Country[] = [];
  
  // Form validation
  minDate: NgbDateStruct;
  
  // Image preview URLs
  personalIdImagePreviewUrl: string | null = null;
  profileImagePreviewUrl: string | null = null;
  
  // ViewChild references
  @ViewChild('userForm') userForm!: NgForm;
  @ViewChild('mobileNumber') mobileNumber!: NgModel;

  constructor(
    private userService: UserService, 
    private router: Router, 
    private location: Location
  ) {
    // Set minimum date to today for expiry date picker
    const today = new Date();
    this.minDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  }

  ngOnInit(): void {
    this.loadDropdowns();
  }

  // Navigation methods for multi-step form
  goToNextStep(): void {
    // Validate step 1 fields before proceeding
    if (this.validateStep1()) {
      this.currentStep = 2;
    }
  }
  
  goToPreviousStep(): void {
    this.currentStep = 1;
  }

  goBack(): void {
    this.location.back();
  }

  // Validate step 1 fields
  validateStep1(): boolean {
    if (!this.user.name || !this.user.email || !this.user.gender || !this.user.profileImage) {
      // Mark fields as touched to trigger validation messages
      if (this.userForm) {
        Object.keys(this.userForm.controls).forEach(key => {
          const control = this.userForm.controls[key];
          control.markAsTouched();
        });
      }
      
      // Show error message if profile image is missing
      if (!this.user.profileImage) {
        Swal.fire({
          icon: 'error',
          title: 'Missing Information',
          text: 'Please upload a profile image',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      return false;
    }
    return true;
  }

  // Calculate total limit based on deposit
  updateTotalLimit(): void {
    if (this.user.deposit !== null) {
      // Handle the deposit value based on its type
      let depositValue: number;
      
      if (typeof this.user.deposit === 'string') {
        depositValue = !isNaN(parseFloat(this.user.deposit)) ? parseFloat(this.user.deposit) : 0;
      } else if (typeof this.user.deposit === 'number') {
        depositValue = this.user.deposit;
      } else {
        depositValue = 0;
      }
      
      this.user.totalLimit = depositValue * 10;
    } else {
      this.user.totalLimit = null;
    }
  }

  // Trigger validation on country change
  onCountryChange(): void {
    if (this.mobileNumber) {
      this.mobileNumber.control.updateValueAndValidity();
    }
  }

  // File handling
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
          showConfirmButton: false
        });
        input.value = ''; 
        if (field === 'profileImage') {
          this.profileImagePreviewUrl = null;
          this.user.profileImage = null;
        } else if (field === 'personalIdImage') {
          this.personalIdImagePreviewUrl = null;
          this.user.personalIdImage = null;
        }
        return;
      }
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'File size should be less than 2MB.',
          timer: 2000,
          showConfirmButton: false
        });
        input.value = ''; 
        if (field === 'profileImage') {
          this.profileImagePreviewUrl = null;
          this.user.profileImage = null;
        } else if (field === 'personalIdImage') {
          this.personalIdImagePreviewUrl = null;
          this.user.personalIdImage = null;
        }
        return;
      }
  
      // Set file and preview URL
      if (field === 'personalIdImage') {
        this.personalIdImagePreviewUrl = URL.createObjectURL(file);
        this.user.personalIdImage = file; 
      } else if (field === 'profileImage') {
        this.profileImagePreviewUrl = URL.createObjectURL(file);
        this.user.profileImage = file; 
      }
    }
  }

  // Load dropdown data
  loadDropdowns(): void {
    this.userService.getRoles().subscribe(data => {
      this.roles = data;
    });
    this.userService.getStatuses().subscribe(data => {
      this.statuses = data;
    });
    this.userService.getCountry().subscribe(data => {
      this.countries = data;
    });
  }

  // Get country name from ID
  getCountryName(countryId: number): string {
    const country = this.countries.find(c => c.countryId === countryId);
    return country ? country.countryName : '';
  }

  // Form submission
  onSubmit(): void {
    this.submitted = true;
    
    // Check form validity
    if (this.userForm.invalid || !this.user.profileImage || !this.user.personalIdImage) {
      // Mark all fields as touched to display validation errors
      Object.values(this.userForm.controls).forEach(control => {
        control.markAsTouched();
      });
      
      // Show error message if files are missing
      if (!this.user.profileImage || !this.user.personalIdImage) {
        Swal.fire({
          icon: 'error',
          title: 'Missing Information',
          text: !this.user.profileImage && !this.user.personalIdImage 
            ? 'Please upload both profile image and government ID image'
            : !this.user.profileImage 
              ? 'Please upload a profile image' 
              : 'Please upload a government ID image',
          timer: 2000,
          showConfirmButton: false
        });
      }
      return;
    }

    // Format date for API
    if (this.user.personalIdExpiryDate && typeof this.user.personalIdExpiryDate === 'object') {
      const d = this.user.personalIdExpiryDate as NgbDateStruct;
      this.user.personalIdExpiryDate = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
    }

    // Create FormData for file upload
    const formData = new FormData();
    for (const key in this.user) {
      const value = (this.user as any)[key];
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    }

    // Submit form data
    this.userService.addUser(formData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'User Added',
          text: 'User has been added successfully!',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/users']);
        });
      },
      error: (error) => {
        console.log('Full error response:', error);
        const errorMessage = typeof error?.error === 'string' 
          ? error.error 
          : error?.error?.message || 'An unknown error occurred';
        
        if (errorMessage.includes('A user with the same email, mobile number, or Goverment ID number already exists')) {
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: 'A user with the same email, mobile number, or personal ID number already exists.',
            timer: 4000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: 'An unknown error occurred while adding the user.',
            timer: 4000,
            showConfirmButton: false
          });
        }
      }
    });
  }
}