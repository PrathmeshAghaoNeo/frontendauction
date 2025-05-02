import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { FutureDateValidatorDirective } from '../manage-user/future-date-validator.directive';
import { UserView } from '../../modals/user';
import Swal from 'sweetalert2';
import { NgbDatepickerModule, NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';



@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CommonModule, FutureDateValidatorDirective, FormsModule, NgbDatepickerModule, NgbModule],
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {
  user: UserView = {} as UserView;
  countries: any[] = [];
  statuses: any[] = [];
  roles: any[] = [];
  selectedPhoneCode: string = '';
  profileImageFile: File | null = null;
  personalIdImageFile: File | null = null;
  userId!: number;
  @ViewChild('userForm') userForm!: NgForm;
  minDate: NgbDateStruct;
  personalIdExpiryDateStruct: NgbDateStruct | null = null;
  submitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private location: Location
  ) {
    const today = new Date();
    this.minDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParams['id'] ? +atob(this.route.snapshot.queryParams['id']) : null;
    if (userId !== null) {
      this.userId = userId;
    } else {
      console.error('User ID not found in URL');
    }

    this.loadUser();
    this.loadCountries();
    this.loadDropdownData();
  }
  goBack(): void {
    this.location.back();
  }

  loadUser() {
    this.userService.getUserById(this.userId).subscribe((data: UserView) => {
      this.user = data;
      if (this.user.personalIdExpiryDate) {
        const parts = this.user.personalIdExpiryDate.split('-');
        this.personalIdExpiryDateStruct = {
          year: +parts[0],
          month: +parts[1],
          day: +parts[2]
        };
      }
      const selectedCountry = this.countries.find(country => country.countryId === this.user.countryId);
      if (selectedCountry) {
        this.selectedPhoneCode = selectedCountry.phoneCode;
      }

    });
  }
  


  loadCountries() {
    this.userService.getCountry().subscribe((data: any[]) => {
      this.countries = data;
      if (this.user.countryId) {
        const selectedCountry = this.countries.find(country => country.countryId === this.user.countryId);
        if (selectedCountry) {
          this.selectedPhoneCode = selectedCountry.phoneCode;
        }
      }
    });
  }
  loadDropdownData() {
    this.userService.getStatuses().subscribe(data => {
      this.statuses = data;
    });
    this.userService.getRoles().subscribe(data => {
      this.roles = data;
    });
  }

  onProfileImageSelected(event: any) {
    this.profileImageFile = event.target.files[0];
  }

  onPersonalIdImageSelected(event: any) {
    this.personalIdImageFile = event.target.files[0];
  }
  getCountryName(countryId: number): string {
    const country = this.countries.find(c => c.countryId === countryId);
    return country ? country.countryName : '';
  }

  onUpdateUser(form: any) {
    this.submitted = true;
    if (this.userForm.invalid) {
      Object.values(this.userForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return; 
    }

    if (!this.profileImageFile && !this.user.profileImageUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'Please upload a Personal ID image.',
        showConfirmButton: false,
        timer: 2000 
      });
      return;
    }
    if (!this.personalIdImageFile && !this.user.personalIdImageUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'Please upload a Goverment ID image.',
        showConfirmButton: false,
        timer: 2000 
      });
      return;
    }
    if (this.personalIdExpiryDateStruct) {
      const d = this.personalIdExpiryDateStruct;
      this.user.personalIdExpiryDate = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
    }
    
    const formData = new FormData();

    for (let key in this.user) {
      const value = (this.user as any)[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    }

    // Append profile image if selected
    if (this.profileImageFile) {
      formData.append('profileImage', this.profileImageFile);
    }

    // Append personal ID image if selected
    if (this.personalIdImageFile) {
      formData.append('personalIdImage', this.personalIdImageFile);
    }

    formData.forEach((value, key) => {
      console.log(key + ': ' + (value instanceof File ? value.name : value));
    });
    this.userService.updateUser(this.userId, formData).subscribe({
      
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'User Updated',
          text: 'User details have been updated successfully!',
          confirmButtonColor: '#3085d6'
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
}