import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

/**
 * Converts a date or date string to a "datetime-local" string format used by HTML inputs.
 */
export function formatToDateTimeLocalFormat(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Normalizes a datetime-local string to full ISO string (ensures seconds are included).
 */
export function normalizeDateTime(val: string): string {
  return val.length === 16 ? `${val}:00` : val;
}

/**
 * Validator that ensures a selected date is in the future.
 */
export const futureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  const selectedDate = new Date(control.value);
  const now = new Date();
  return selectedDate <= now ? { pastDate: true } : null;
};

/**
 * Validator that ensures the end date is after the start date within a form group.
 */
export const endDateAfterStartDateValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const formGroup = group as FormGroup;
  const start = formGroup.get('startDateTime')?.value;
  const end = formGroup.get('endDateTime')?.value;

  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);

  return endDate > startDate ? null : { endBeforeStart: true };
};
