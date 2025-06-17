import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/enviroments';
import {
  TransactionType,
  PaymentMethod,
  CardType,
  TransactionStatus,
  AddTransaction,
  Transaction,
  UserTransaction,
} from '../modals/manage-transaction';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/Transactions`;

  constructor(private http: HttpClient) {}

  toFormData(transaction: AddTransaction): FormData {
    const formData = new FormData();

    formData.append('Amount', transaction.amount.toString());
    formData.append('UserId', transaction.userId.toString());
    formData.append(
      'TransactionTypeId',
      transaction.transactionTypeId.toString()
    );
    formData.append('PaymentMethodId', transaction.paymentMethodId.toString());
    if (transaction.cardTypeId != null) {
      formData.append('CardTypeId', transaction.cardTypeId.toString());
    }
    if (transaction.merchantTransactionId) {
      formData.append(
        'MerchantTransactionId',
        transaction.merchantTransactionId
      );
    }
    if (transaction.transactionDateTime) {
      formData.append(
        'TransactionDateTime',
        new Date(transaction.transactionDateTime).toISOString()
      );
    }
    formData.append('StatusId', transaction.statusId.toString());
    if (transaction.notes) {
      formData.append('Notes', transaction.notes);
    }

    if (transaction.documents) {
      formData.append('Documents', transaction.documents); // Must match DTO
    }

    if (transaction.documentUrl) {
      formData.append('DocumentPath', transaction.documentUrl);
    }

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
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== ''
        ) {
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
  addTransaction(transaction: FormData): Observable<Transaction> {
    console.log(transaction);
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  // Update an existing transaction
  updateTransaction(
    id: number,
    transaction: AddTransaction
  ): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }

  // Delete a transaction
  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get reference data for dropdowns
  getTransactionTypes(): Observable<TransactionType[]> {
    return this.http.get<TransactionType[]>(
      `${environment.apiUrl}/transaction-types`
    );
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(
      `${environment.apiUrl}/payment-methods`
    );
  }

  getCardTypes(): Observable<CardType[]> {
    return this.http.get<CardType[]>(`${environment.apiUrl}/card-types`);
  }

  getTransactionStatuses(): Observable<TransactionStatus[]> {
    return this.http.get<TransactionStatus[]>(
      `${environment.apiUrl}/transaction-statuses`
    );
  }

  getUserTransactions(userId: number|null): Observable<UserTransaction[]> {
    return this.http.get<UserTransaction[]>(
      `${this.apiUrl}/user/${userId}/transactions`
    );
  }
}
