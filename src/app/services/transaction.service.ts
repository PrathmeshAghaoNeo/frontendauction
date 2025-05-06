import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/enviroments';

export interface Transaction {
  transactionId: number;
  transactionNumber: string;
  amount: number;
  userFullName: string;
  transactionType: string;
  paymentMethod: string;
  cardType: string;
  merchantTransactionId: string;
  transactionDateTime: string;
  status: string;
  notes: string;
  documentUrls: string[];
  userId?: number; // Optional property for filtering
}

export interface TransactionPaginatedResponse {
  data: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Original method - get all transactions
  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`);
  }
  
  // Get transactions by user ID
  getTransactionsByUserId(userId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions?userId=${userId}`);
  }
  
  // Get transactions with pagination
  getTransactionsPaginated(page: number = 1, pageSize: number = 10): Observable<TransactionPaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      
    return this.http.get<TransactionPaginatedResponse>(`${this.baseUrl}/transactions/paginated`, { params });
  }
  
  // Get transaction by ID
  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/transactions/${id}`);
  }
  
  // Search transactions by query
  searchTransactions(searchTerm: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions/search?term=${searchTerm}`);
  }
  
  // Filter transactions by multiple criteria
  filterTransactions(filters: {
    userId?: number;
    status?: string;
    transactionType?: string;
    fromDate?: string;
    toDate?: string;
  }): Observable<Transaction[]> {
    let params = new HttpParams();
    
    if (filters.userId) params = params.set('userId', filters.userId.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.transactionType) params = params.set('transactionType', filters.transactionType);
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions/filter`, { params });
  }
}