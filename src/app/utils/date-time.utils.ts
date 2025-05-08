
export function formatToDateTimeLocalFormat(dateStr: string | Date): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  

  export function normalizeDateTime(val: string): string {
    return val.length === 16 ? `${val}:00` : val;
  }
  
 
  export function futureDateValidator(control: import("@angular/forms").AbstractControl) {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const now = new Date();
    return selectedDate <= now ? { pastDate: true } : null;
  }
  
  export function endDateAfterStartDateValidator(group: import("@angular/forms").AbstractControl) {
    const start = group.get('startDateTime')?.value;
    const end = group.get('endDateTime')?.value;
  
    if (!start || !end) return null;
  
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    return endDate > startDate ? null : { endBeforeStart: true };
  }
  