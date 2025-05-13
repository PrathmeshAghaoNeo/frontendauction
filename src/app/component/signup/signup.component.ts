import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  otpForm!: FormGroup;
  showOtpScreen = false;
  isSubmitting = false;
  resendTimer = 0;
  timerInterval: any;
  email: string = '';
  
  @ViewChild('digit1') digit1!: ElementRef<HTMLInputElement>;
  @ViewChild('digit2') digit2!: ElementRef<HTMLInputElement>;
  @ViewChild('digit3') digit3!: ElementRef<HTMLInputElement>;
  @ViewChild('digit4') digit4!: ElementRef<HTMLInputElement>;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^\d$/)]]
    });
  }

  onSignup(): void {
    if (this.signupForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.email = this.signupForm.value.email;
    
    console.log('Attempting to send OTP to:', this.email);
    
    // Try with direct HTTP call for debugging
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // Method 1: Try with direct HTTP request
    this.http.post(
      `${ApiEndpoints.Auth}/generate-otp`, 
      { email: this.email },
      { headers }
    ).subscribe({
      next: (response) => {
        console.log('OTP sent successfully via direct HTTP:', response);
        this.handleOtpSentSuccess();
      },
      error: (error) => {
        console.error('OTP generation failed via direct HTTP:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.error);
        
        // Try Method 2 if Method 1 fails
        this.tryAlternativeOtpSend();
      }
    });
  }
  
  tryAlternativeOtpSend(): void {
    console.log('Trying alternative OTP send method');
    
    // Method 2: Try with authService
    this.authService.sendOtp(this.email).subscribe({
      next: (response) => {
        console.log('OTP sent successfully via authService:', response);
        this.handleOtpSentSuccess();
      },
      error: (error) => {
        console.error('OTP generation failed via authService:', error);
        this.isSubmitting = false;
        
        // Try Method 3 if Method 2 fails
        this.tryFinalOtpSend();
      }
    });
  }
  
  tryFinalOtpSend(): void {
    console.log('Trying final OTP send method');
    
    // Method 3: Try string interpolation instead of object
    this.http.post(
      `${ApiEndpoints.Auth}/generate-otp`, 
      JSON.stringify({ email: this.email }),
      { 
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).subscribe({
      next: (response) => {
        console.log('OTP sent successfully via string method:', response);
        this.handleOtpSentSuccess();
      },
      error: (error) => {
        console.error('All OTP send methods failed:', error);
        this.isSubmitting = false;
        
        Swal.fire({
          icon: 'error',
          title: 'OTP Generation Failed',
          text: 'Failed to send verification code. Please check server logs for details.',
          timer: 3000
        });
      }
    });
  }
  
  handleOtpSentSuccess(): void {
    this.isSubmitting = false;
    this.showOtpScreen = true;
    this.startResendTimer();
    setTimeout(() => {
      if (this.digit1) {
        this.digit1.nativeElement.focus();
      }
    }, 100);
  }

  startResendTimer(): void {
    this.resendTimer = 30;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  resendOtp(): void {
    if (this.resendTimer > 0) {
      return;
    }
    
    this.http.post(
      `${ApiEndpoints.Auth}/generate-otp`, 
      { email: this.email },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).subscribe({
      next: (response) => {
        console.log('OTP resent successfully:', response);
        this.startResendTimer();
        this.resetOtpForm();
        setTimeout(() => {
          if (this.digit1) {
            this.digit1.nativeElement.focus();
          }
        }, 100);
        
        Swal.fire({
          icon: 'success',
          title: 'OTP Sent Again',
          text: 'A new verification code has been sent to your email',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('OTP resend failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to Resend OTP',
          text: 'Please try again later',
          timer: 2000
        });
      }
    });
  }

  resetOtpForm(): void {
    this.otpForm.reset();
  }

  onOtpInput(event: Event, nextInput?: HTMLInputElement, prevInput?: HTMLInputElement): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Allow only numbers
    if (value && !value.match(/^\d$/)) {
      input.value = '';
      return;
    }
    
    // Auto navigate between inputs
    if ((event as InputEvent).inputType !== 'deleteContentBackward') {
      if (value.length === 1 && nextInput) {
        nextInput.focus();
      }
    } else if (prevInput) {
      prevInput.focus();
    }
    
    // Auto-submit when all digits are filled
    if (this.otpForm.valid) {
      setTimeout(() => this.verifyOtp(), 300);
    }
  }

  verifyOtp(): void {
    if (this.otpForm.invalid) {
      return;
    }
    
    const code = 
      this.otpForm.value.digit1 + 
      this.otpForm.value.digit2 + 
      this.otpForm.value.digit3 + 
      this.otpForm.value.digit4;
    
    this.isSubmitting = true;
    console.log('Verifying OTP with email:', this.email, 'and code:', code);
    
    // Direct HTTP call for verification to see full response/error
    this.http.post(
      `${ApiEndpoints.Auth}/verify-otp`, 
      { email: this.email, code },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).subscribe({
      next: (response) => {
        console.log('OTP verification successful:', response);
        // After successful OTP verification, register the user
        this.registerUser();
      },
      error: (error) => {
        console.error('OTP verification failed:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.error);
        
        this.isSubmitting = false;
        this.resetOtpForm();
        
        Swal.fire({
          icon: 'error',
          title: 'Invalid OTP',
          text: 'Please enter the correct verification code',
          timer: 2000
        });
      }
    });
  }
  
  registerUser(): void {
    console.log('Registering user with data:', this.signupForm.value);
    
    // Now register the user with the validated email
    this.http.post(
      `${ApiEndpoints.Auth}/register`, 
      this.signupForm.value,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.isSubmitting = false;
        
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'Your account has been created successfully!',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Navigate to home or dashboard based on user role
        setTimeout(() => {
          const role = this.authService.getRoleJwt();
          console.log('User role:', role);
          if (role === 'Admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
        }, 2000);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.error);
        
        this.isSubmitting = false;
        
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: error.error?.message || 'Failed to create account. Please try again.',
          timer: 3000
        });
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}