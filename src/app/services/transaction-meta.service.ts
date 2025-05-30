import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface CardType {
  cardTypeId: number;
  cardTypeName: string;
}

export interface PaymentMethod {
  paymentMethodId: number;
  paymentMethodName: string;
}

export interface TransactionType {
  transactionTypeId: number;
  transactionTypeName: string;
}

export interface TransactionStatus {
  statusId: number;
  statusName: string;
}

export interface TransactionMetadata {
  cardTypes: CardType[];
  paymentMethods: PaymentMethod[];
  transactionTypes: TransactionType[];
  statuses: TransactionStatus[];
}

@Injectable({
  providedIn: 'root',
})
export class TransactionMetadataService {
  private metadataUrl = 'https://localhost:62627/api/Transactions/metadata'; // Adjust the URL to match your backend
  private metadataSubject = new BehaviorSubject<TransactionMetadata | null>(null);
  public metadata$ = this.metadataSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchMetadata(): Observable<TransactionMetadata> {
    return this.http.get<TransactionMetadata>(this.metadataUrl).pipe(
      tap((data) => this.metadataSubject.next(data)),
      catchError((error) => {
        console.error('Error loading metadata:', error);
        return of({
          cardTypes: [],
          paymentMethods: [],
          transactionTypes: [],
          statuses: [],
        } as TransactionMetadata);
      })
    );
  }

  getCachedMetadata(): TransactionMetadata | null {
    return this.metadataSubject.value;
  }
}
