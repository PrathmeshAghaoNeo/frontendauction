import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linebreaks',
  standalone: true
})
export class LinebreaksPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/(?:\r\n|\r|\n)/g, '<br>');
  }
} 