import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
 private langSubject = new BehaviorSubject<string>(localStorage.getItem('lang') || 'en');
  lang$ = this.langSubject.asObservable();

  setLanguage(lang: string) {
    localStorage.setItem('lang', lang);
    this.langSubject.next(lang);
  }

  getCurrentLanguage(): string {
    return this.langSubject.getValue();
  }

}
