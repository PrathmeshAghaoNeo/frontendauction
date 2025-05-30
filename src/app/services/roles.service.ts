import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';
import { RoleWithPermissions } from '../modals/roles';

@Injectable({
  providedIn: 'root'
})
export class RoleWithPermissionsService {
  constructor(private http: HttpClient) {}

  getAllRoleWithPermissionss(): Observable<RoleWithPermissions[]> {
    return this.http.get<RoleWithPermissions[]>(`${ApiEndpoints.ROLE}`);
  }

  getRoleWithPermissionsById(id: number): Observable<RoleWithPermissions> {
    return this.http.get<RoleWithPermissions>(`${ApiEndpoints.ROLE}/${id}`);
  }

  updateRoleWithPermissions(id: number, data: any): Observable<any> {
    return this.http.put(`${ApiEndpoints.ROLE}/${id}`, data);
  }

  deleteRoleWithPermissions(id: number): Observable<any> {
    return this.http.delete(`${ApiEndpoints.ROLE}/${id}`);
  }
}
