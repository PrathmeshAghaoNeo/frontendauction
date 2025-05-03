import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Directive({
  selector: '[futureDate]',
  standalone: true,
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: FutureDateValidatorDirective,
    multi: true
  }]
})
export class FutureDateValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const value: NgbDateStruct = control.value;

    if (!value || !value.year || !value.month || !value.day) {
      return null; 
    }

    const selectedDate = new Date(value.year, value.month - 1, value.day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? null : { dateInvalid: true };
  }
}
