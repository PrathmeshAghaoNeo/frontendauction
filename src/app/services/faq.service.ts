import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';
import { ChatbotAdminFaq } from '../modals/chatbot-admin';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  constructor(private http: HttpClient) {}

  getFaqs(): Observable<ChatbotAdminFaq[]> {
    return this.http.get<ChatbotAdminFaq[]>(`${ApiEndpoints.FAQ}/GetAllFaq`);
  }

  getFaq(id: number): Observable<ChatbotAdminFaq> {
    return this.http.get<ChatbotAdminFaq>(`${ApiEndpoints.FAQ}/${id}`);
  }

  addFaq(faq: Partial<ChatbotAdminFaq>): Observable<ChatbotAdminFaq> {
    return this.http.post<ChatbotAdminFaq>(ApiEndpoints.FAQ, faq);
  }

  updateFaq(id: number, faq: Partial<ChatbotAdminFaq>): Observable<ChatbotAdminFaq> {
    return this.http.put<ChatbotAdminFaq>(`${ApiEndpoints.FAQ}/${id}`, faq);
  }

  deleteFaq(id: number): Observable<any> {
    return this.http.delete(`${ApiEndpoints.FAQ}/${id}`);
  }
} 