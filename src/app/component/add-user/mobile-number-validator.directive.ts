import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { Country } from '../../modals/user';

@Directive({
  selector: '[mobilenumber]',
  standalone: true,
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: MobileNumberValidatorDirective,
    multi: true
  }]
})
export class MobileNumberValidatorDirective implements Validator {

  @Input('mobilenumber') countries: Country[] = [];

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const countryId = control.parent?.get('countryId')?.value;
    const selectedCountry = this.countries.find(c => c.countryId === countryId);

    if (!selectedCountry) {
      return null;
    }

    const seriesStartArray = selectedCountry.seriesStart?.split(',') ?? [];
    const isValidPrefix = seriesStartArray.some(prefix => control.value.startsWith(prefix));
    if (!isValidPrefix) {
      return { invalidPrefix: true };
    }

    const { minLength, maxLength } = selectedCountry;
    if (control.value.length < minLength || control.value.length > maxLength) {
      return { invalidPhoneLength: true };
    }

    return null;
  }
}
