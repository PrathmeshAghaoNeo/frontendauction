import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../constants/enviroments";
import { TransactionType, PaymentMethod, CardType, TransactionStatus, AddTransaction, Transaction } from '../modals/manage-transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/Transactions`;

  constructor(private http: HttpClient) { }

  // Convert to FormData utility
  private toFormData(transaction: AddTransaction): FormData {
    const formData = new FormData();
    Object.entries(transaction).forEach(([key, value]) => {
      if (key === 'documents' && Array.isArray(value)) {
        value.forEach(file => formData.append('documents', file));
      } else if (value != null) {
        if (key === 'transactionDateTime') {
          formData.append(key, new Date(value).toISOString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return formData;
  }

  // Get all transactions
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  // Get transactions with optional filtering
  getFilteredTransactions(params?: any): Observable<Transaction[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<Transaction[]>(this.apiUrl, { params: httpParams });
  }

  // Get a single transaction by ID
  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  // Add a new transaction
  addTransaction(transaction: AddTransaction): Observable<Transaction> {
    if (transaction.documents && transaction.documents.length > 0) {
      return this.http.post<Transaction>(this.apiUrl, this.toFormData(transaction));
    } else {
      return this.http.post<Transaction>(this.apiUrl, transaction);
    }
  }

  // Update an existing transaction
  updateTransaction(id: number, transaction: AddTransaction): Observable<Transaction> {
    if (transaction.documents && transaction.documents.length > 0) {
      return this.http.put<Transaction>(`${this.apiUrl}/${id}`, this.toFormData(transaction));
    } else {
      return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction);
    }
  }

  // Delete a transaction
  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get reference data for dropdowns
  getTransactionTypes(): Observable<TransactionType[]> {
    return this.http.get<TransactionType[]>(`${environment.apiUrl}/transaction-types`);
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${environment.apiUrl}/payment-methods`);
  }

  getCardTypes(): Observable<CardType[]> {
    return this.http.get<CardType[]>(`${environment.apiUrl}/card-types`);
  }

  getTransactionStatuses(): Observable<TransactionStatus[]> {
    return this.http.get<TransactionStatus[]>(`${environment.apiUrl}/transaction-statuses`);
  }
}

