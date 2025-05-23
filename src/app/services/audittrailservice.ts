import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';
import { AuditTrail } from '../modals/audittrail';

@Injectable({ providedIn: 'root' })
export class AuditLogService {

  constructor(private http: HttpClient) {}

  getAllAuditLogs(): Observable<any[]> {
    return this.http.get<AuditTrail[]>(`${ApiEndpoints.AUDITTRAIL}`);
  }
}
