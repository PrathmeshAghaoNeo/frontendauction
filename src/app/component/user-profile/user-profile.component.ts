import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserView } from '../../modals/user';

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
  [key: string]: any; // Index signature to allow dynamic property access
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
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
    gender: '',
    personalIdExpiryDate: '',
    countryId: 0,
    profileImageUrl: '',
    personalIdImageUrl: '',
    totalLimit: 0,
    deposit: 0,
    instagram: '',
    twitter: '',
    facebook: ''
  };

  isLoading = true;
  errorMessage = '';
  editMode = false;
  
  // Store original values for cancellation
  private originalValues: Partial<UserProfile> = {};

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.getUserById(1)
      .pipe(
        catchError((error: any) => {
          this.errorMessage = 'Failed to load user profile. Please try again later.';
          this.isLoading = false;
          console.error('Error loading user profile:', error);
          return of(null);
        })
      )
      .subscribe((data: UserView | null) => {
        if (data) {
          this.user = {
            ...data as any,
            // Initialize social media accounts if they don't exist in the API response
            instagram: (data as any).instagram || '',
            twitter: (data as any).twitter || '',
            facebook: (data as any).facebook || ''
          };
          this.isLoading = false;
        }
      });
  }

  toggleEditMode(): void {
    if (this.editMode) {
      // Save changes
      this.saveChanges();
    } else {
      // Enter edit mode - store original values for possible cancellation
      this.originalValues = { ...this.user };
      this.editMode = true;
    }
  }

  saveChanges(): void {
    this.isLoading = true;
    
    // Create FormData to send to the API
    const formData = new FormData();
    
    // Add user properties with proper capitalization as expected by the API
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
    
    // Add social media fields if they exist in your API
    if (this.user.instagram) formData.append('Instagram', this.user.instagram);
    if (this.user.twitter) formData.append('Twitter', this.user.twitter);
    if (this.user.facebook) formData.append('Facebook', this.user.facebook);

    this.userService.updateUser(this.user.userId, formData)
      .pipe(
        catchError((error: any) => {
          this.errorMessage = 'Failed to update profile. Please try again.';
          this.isLoading = false;
          console.error('Error updating profile:', error);
          return of(null);
        })
      )
      .subscribe((response: any) => {
        if (response) {
          // Update successful
          this.isLoading = false;
          this.editMode = false;
          // You could add a success message here
        }
      });
  }

  cancelEdit(): void {
    // Restore original values
    this.user = { ...this.user, ...this.originalValues };
    this.editMode = false;
  }

  onUploadPhoto(): void {
    // Implement file upload logic here
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.uploadProfileImage(file);
      }
    };
    fileInput.click();
  }

  uploadProfileImage(file: File): void {
    const formData = new FormData();
    formData.append('ProfileImage', file);
    formData.append('UserId', this.user.userId.toString());
    
    this.isLoading = true;
    
    // Using the UserService to upload the profile image
    this.userService.updateUser(this.user.userId, formData)
      .pipe(
        catchError((error: any) => {
          this.errorMessage = 'Failed to upload profile image. Please try again.';
          this.isLoading = false;
          console.error('Upload failed', error);
          return of(null);
        })
      )
      .subscribe((response: any) => {
        if (response) {
          // Refresh user data to get the updated image URL
          this.loadUserProfile();
        }
      });
  }

  onConnect(platform: string): void {
    if (platform === 'instagram') {
      this.user.instagram = this.user.instagram ? '' : 'instagram.com/user';
    } else if (platform === 'twitter') {
      this.user.twitter = this.user.twitter ? '' : 'twitter.com/user';
    } else if (platform === 'facebook') {
      this.user.facebook = this.user.facebook ? '' : 'facebook.com/user';
    }
  }

  isConnected(platform: string): boolean {
    if (platform === 'instagram') return !!this.user.instagram;
    if (platform === 'twitter') return !!this.user.twitter;
    if (platform === 'facebook') return !!this.user.facebook;
    return false;
  }
}