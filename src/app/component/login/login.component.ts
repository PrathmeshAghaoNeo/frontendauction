import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],  
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // loginForm: FormGroup;

  //   this.loginForm = this.fb.group({
    //     email: ['', [Validators.required, Validators.email]],
    //     password: ['', Validators.required]
    //   });
    // }
    email: string = '';
    code: string = '';
    step = 1;
    error = '';
    otpLength = 6; // Set your OTP length (typically 4-6 digits)
    otpArray: string[] = new Array(this.otpLength).fill('');

    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

    ngOnInit(): void {
    this.auth.logout();
  }


  
  // login() {
  //   if(this.loginForm.invalid){
  //     Object.values(this.loginForm.controls).forEach(control => {
  //       control.markAsTouched();
  //     });
  //   }
  //   if (this.loginForm.valid) {
  //     const { email, password } = this.loginForm.value;
  //     const success = this.auth.login(email, password);
  //     if (success) {
  //       const role = this.auth.getRole();
  //       if (role === 'admin') {
  //         this.router.navigate(['/dashboard']);
  //       } else if (role === 'user') {
  //         this.router.navigate(['/reguserlandingpage']);
  //       }
  //     } else {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Login Failed',
  //         text: 'Invalid credentials'
  //       });
  //     }
  //   }
  // }

  sendOtp(form: NgForm) {
    if (!form.valid) return;
  
    console.log('Sending OTP to:', this.email);
  
    this.auth.sendOtp(this.email).subscribe({
      next: () => {
        console.log('OTP sent successfully');
        this.step = 2;
        this.error = '';
      },
      error: (err) => {
        console.error('Send OTP failed:', err);
        this.error = 'User Does not exist';
  
        Swal.fire({
          icon: 'error',
          title: 'Failed to send OTP',
          showConfirmButton: false,
          timer: 1000
        });
      }
    });
  }
  
  

  

  verifyOtp(form: NgForm) {
    if (!form.valid) return;
  
    this.auth.verifyOtp(this.email, this.code).subscribe({
      next: (res) => {
  
        const role = this.auth.getRoleJwt();
        console.log(role);
        setTimeout(() => {
          if (role === 'Admin') {
            this.router.navigate(['/dashboard']);
          } else if (role === 'User') {
            this.router.navigate(['/reguserlandingpage']);
          }
        }, 1000); // Delay navigation to wait for Swal to finish
      },
      error: () => {
        // Show error alert with 1s timer, no button
        Swal.fire({
          icon: 'error',
          title: 'Invalid OTP',
          showConfirmButton: false,
          timer: 1000
        });
      }
    });
  }
  
  
  
}

