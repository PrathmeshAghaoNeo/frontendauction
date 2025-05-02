// custom-date-formatter.service.ts
import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class CustomDateFormatter extends NgbDateParserFormatter {
  // Parse input string (from user) to NgbDateStruct
  parse(value: string): NgbDateStruct | null {
    if (value) {
      const [day, month, year] = value.split('-').map(Number);
      return { day, month, year };
    }
    return null;
  }

  // Format NgbDateStruct to display string (dd-mm-yyyy)
  format(date: NgbDateStruct | null): string {
    return date 
      ? `${this.padZero(date.day)}-${this.padZero(date.month)}-${date.year}`
      : '';
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }
}