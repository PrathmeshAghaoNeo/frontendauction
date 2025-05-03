import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FutureDateValidatorDirective } from '../manage-user/future-date-validator.directive';
import { Router, } from '@angular/router';
import { Country, Role, Status, User } from '../../modals/user';
import Swal from 'sweetalert2';
import { NgbDateParserFormatter, NgbDatepickerModule, NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { CustomDateFormatter } from '../../services/custom-date-formatter.service';
import { MobileNumberValidatorDirective } from './mobile-number-validator.directive';




@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FutureDateValidatorDirective, FormsModule, NgbModule, NgbDatepickerModule, MobileNumberValidatorDirective],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css',
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateFormatter }
  ]
})
export class AddUserComponent implements OnInit {
  user: User = {
    name: '',
    mobileNumber: '',
    email: '',
    companyName: '',
    companyNumber: '',
    statusId: 0,
    chatEnabled: true,
    roleId: 0,
    personalIdNumber: '',
    gender: '',
    personalIdExpiryDate: '',
    countryId: 0,
    profileImage: null,
    personalIdImage: null
  };

  roles: Role[] = [];
  statuses: Status[] = [];
  countries: Country[] = [];
  selectedPhoneCode: string = '';
  @ViewChild('userForm') userForm!: NgForm;
  submitted = false;
  minDate: NgbDateStruct;
  personalIdImagePreviewUrl: string | null = null;
  profileImagePreviewUrl: string | null = null;

  // bsConfig: Partial<BsDatepickerConfig>;
  // this.bsConfig = {dateInputFormat: 'DD-MM-YYYY',  // Set the date format

  constructor(private userService: UserService, private router: Router, private location: Location) {
    const today = new Date();
    this.minDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  };

  ngOnInit(): void {
    this.loadDropdowns();
  }
  goBack(): void {
    this.location.back();
  }

  onFileChange(event: Event, field: 'profileImage' | 'personalIdImage'): void {
    const input = event.target as HTMLInputElement;
   
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (field === 'personalIdImage') {
        this.personalIdImagePreviewUrl = URL.createObjectURL(file);
      } else if (field === 'profileImage') {
        this.profileImagePreviewUrl = URL.createObjectURL(file);
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        input.value = '';
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB.');
        input.value = '';
        return;
      }

      this.user[field] = file;
    }
  }

  loadDropdowns(): void {
    this.userService.getRoles().subscribe(data => {
      console.log('Roles:', data);
      this.roles = data;
    });
    this.userService.getStatuses().subscribe(data => this.statuses = data);
    this.userService.getCountry().subscribe(data => this.countries = data);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.personalIdImagePreviewUrl = URL.createObjectURL(file);
      console.log(this.personalIdImagePreviewUrl);
    }
  }
  onSubmit(): void {
    this.submitted = true;
    if (this.userForm.invalid) {

      Object.values(this.userForm.controls).forEach(control => {
        control.markAsTouched();
      });
      if (!this.user.profileImage || !this.user.personalIdImage) {
        return;
      }
      return;
    }
    if (this.user.personalIdExpiryDate && typeof this.user.personalIdExpiryDate === 'object') {
      const d = this.user.personalIdExpiryDate as NgbDateStruct;
      this.user.personalIdExpiryDate = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
    }

    const formData = new FormData();
    console.log("sub")
    for (const key in this.user) {
      const value = (this.user as any)[key];
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value.toString());
      }
    }
    formData.forEach((value, key) => {
      console.log(key + ': ' + (value instanceof File ? value.name : value));
    });
    this.userService.addUser(formData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'User Added',
          text: 'User has been added successfully!'
        }).then(() => {
          this.router.navigate(['/users']);
        });
      },
      error: (error) => {
        console.error('Error adding user:', error);
        const fullMessage = error.error || 'Unknown error occurred.';
        const extractedMessage = fullMessage.split('\r\n')[0];
        Swal.fire({
          icon: 'error',
          title: 'Add Failed',
          text: `Something went wrong while adding the user.${extractedMessage}`
        });
      }
    });
  }
  getCountryName(countryId: number): string {
    const country = this.countries.find(c => c.countryId === countryId);
    return country ? country.countryName : '';
  }
}


