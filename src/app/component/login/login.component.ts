import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
selector: 'app-login',
standalone: true,
imports: [FormsModule, CommonModule],
templateUrl: './login.component.html',
styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
email: string = '';
code: string = '';
step = 1;
error = '';
isLoading = false;
otpSent = false;
otpArray = new Array(6); 
isResending = false;
resendTimer = 0;
private resendInterval: any;

@ViewChildren('otpInputRef') inputs!: QueryList<ElementRef>;

constructor(private auth: AuthService, private router: Router) {}

ngOnInit(): void {
this.auth.logout();
}

ngAfterViewInit(): void {
if (this.step === 2) {
this.inputs.first?.nativeElement.focus();
}
}

sendOtp(form: NgForm): void {
if (!form.valid) return;


this.isLoading = true;
this.email = this.email.trim();

this.auth.sendOtp(this.email).subscribe({
  next: () => {
    Swal.fire({
      icon: 'success',
      title: 'OTP Sent',
      text: 'OTP has been sent to your email',
      timer: 500,
      showConfirmButton: false
    });

    setTimeout(() => {
      this.isLoading = false;
      this.step = 2;
      this.otpSent = true;
      this.startResendCountdown();

      // focus the first OTP input
      setTimeout(() => this.inputs.first?.nativeElement.focus(), 100);
    }, 400); 
  },
  error: (err) => {
    console.error('Send OTP failed:', err);
    this.isLoading = false;
    this.error = 'User does not exist';

    Swal.fire({
      icon: 'error',
      title: 'Failed to send OTP',
      showConfirmButton: false,
      timer: 1500
    });
  }
});
  

}


resendOtp(): void {
  this.isResending = true;
  this.isLoading = true;

  this.auth.sendOtp(this.email).subscribe({
    next: () => {
      this.isLoading = false;
      this.isResending = false;

      Swal.fire({
        icon: 'success',
        title: 'OTP Resent',
        text: 'A new OTP has been sent to your email',
        timer: 1500,
        showConfirmButton: false
      });

      // Clear OTP inputs and refocus
      this.otpArray = new Array(6);
      this.startResendCountdown();
      setTimeout(() => this.inputs.first?.nativeElement.focus(), 100);
    },
    error: () => {
      this.isLoading = false;
      this.isResending = false;

      Swal.fire({
        icon: 'error',
        title: 'Failed to resend OTP',
        text: 'Please try again later',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}
startResendCountdown(duration: number = 30): void {
  this.resendTimer = duration;
  this.resendInterval = setInterval(() => {
    this.resendTimer--;
    if (this.resendTimer <= 0) {
      clearInterval(this.resendInterval);
    }
  }, 1000);
}

newAssestRoute():void {
this.router.navigate(['user-signup']);
}

handleOtp(event: KeyboardEvent, index: number): void {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  const isValidInput = value.match(/[0-9a-z]/i); 
  input.value = isValidInput ? value[0] : "";

  const inputsArray = this.inputs.toArray();

  if (event.key === 'Backspace' && index > 0) {
    inputsArray[index - 1].nativeElement.focus();
  } else if (index < inputsArray.length - 1 && isValidInput) {
    inputsArray[index + 1].nativeElement.focus();
  }

  if (index === inputsArray.length - 1 && isValidInput) {
    this.submitOtpCode();
  }
}

handlePaste(event: ClipboardEvent): void {
event.preventDefault();
const pastedData = event.clipboardData?.getData('text') || '';
const pastedChars = pastedData.slice(0, 6).split('');


const inputsArray = this.inputs.toArray();
pastedChars.forEach((char, i) => {
  if (inputsArray[i]) {
    inputsArray[i].nativeElement.value = char;
  }
});

this.submitOtpCode();


}

submitOtpCode(): void {
let otp = '';
this.inputs.forEach((inputRef) => {
const input = inputRef.nativeElement as HTMLInputElement;
otp += input.value;

});


this.code = otp;


}

verifyOtp(form: NgForm): void {
if (!form.valid) return;


this.auth.verifyOtp(this.email, this.code).subscribe({
  next: () => {
    const role = this.auth.getRoleJwt();

    setTimeout(() => {
      if (role === 'Admin') {
        this.router.navigate(['/dashboard']);
      } else if (role === 'User') {
        this.router.navigate(['/reguserlandingpage']);
      }
    }, 500); 
  },
  error: () => {
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
