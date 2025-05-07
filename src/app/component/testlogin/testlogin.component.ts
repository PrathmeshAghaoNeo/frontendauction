import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-testlogin',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './testlogin.component.html',
  styleUrl: './testlogin.component.css'
})
export class TestloginComponent {
  email: string = '';
  code: string = '';
  step = 1;
  error = '';
  otpArray = new Array(6); // to generate 6 input fields

  @ViewChildren('otpInputRef') inputs!: QueryList<ElementRef>;

  constructor(private authService: AuthService,private router: Router) {}

  ngAfterViewInit() {
    // Optionally focus the first input on load
    this.inputs.first.nativeElement.focus();
  }

  handleOtp(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    let isValidInput = value.match(/[0-9a-z]/gi);
    input.value = isValidInput ? value[0] : "";

    const inputsArray = this.inputs.toArray();

    if (event.key === 'Backspace' && index > 0) {
      inputsArray[index - 1].nativeElement.focus();
    } else if (index < inputsArray.length - 1 && isValidInput) {
      inputsArray[index + 1].nativeElement.focus();
    }

    if (index === inputsArray.length - 1 && isValidInput) {
      this.submit();
    }
  }

  handlePaste(event: ClipboardEvent) {
    const pastedData = event.clipboardData?.getData('text') || '';
    const pastedChars = pastedData.split('');

    const inputsArray = this.inputs.toArray();

    if (pastedChars.length === inputsArray.length) {
      inputsArray.forEach((inputRef, i) => {
        inputRef.nativeElement.value = pastedChars[i];
      });
      this.submit();
    }
  }

  submit() {
    let otp = '';
    this.inputs.forEach(inputRef => {
      const input = inputRef.nativeElement as HTMLInputElement;
      otp += input.value;
      input.disabled = true;
      input.classList.add('disabled');
    });

    console.log('OTP:', otp);

    // TODO: Call your API here
  }

}
