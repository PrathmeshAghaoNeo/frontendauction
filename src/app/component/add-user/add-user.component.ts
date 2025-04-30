import { Component, OnInit,ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FutureDateValidatorDirective } from '../manage-user/future-date-validator.directive';
import { Router,  } from '@angular/router';
import { Country, Role, Status, User } from '../../modals/user';




@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule,FutureDateValidatorDirective,FormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
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
    // bsConfig: Partial<BsDatepickerConfig>;
    // this.bsConfig = {dateInputFormat: 'DD-MM-YYYY',  // Set the date format

    constructor(private userService: UserService, private router: Router) {
    };

    ngOnInit(): void {
      this.loadDropdowns();
    }

    onFileChange(event: Event, field: 'profileImage' | 'personalIdImage'): void {
      const input = event.target as HTMLInputElement;

      if (input.files && input.files.length > 0) {
        const file = input.files[0];

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
      const formData = new FormData();
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
        next: (response) =>{
          console.log('User added successfully!', response);
          this.router.navigate(['/users']);
          
        },
        error: (error) => console.error('Error adding user:', error)
      });
    }
    getCountryName(countryId: number): string {
      const country = this.countries.find(c => c.countryId === countryId);
      return country ? country.countryName : '';
    }
  }


