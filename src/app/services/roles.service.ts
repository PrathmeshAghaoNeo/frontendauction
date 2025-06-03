import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';
import { PermissionKey, RoleWithPermissions } from '../modals/roles';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleWithPermissionsService {
  constructor(private http: HttpClient,private authService: AuthService,) {}

  private currentRole: RoleWithPermissions | null = null;

  getAllRoleWithPermissionss(): Observable<RoleWithPermissions[]> {
    return this.http.get<RoleWithPermissions[]>(`${ApiEndpoints.ROLE}`);
  }

  hasPermission(permissionKey: PermissionKey): boolean {
  const role = this.authService.getRole();
  return role?.[permissionKey] ?? false;
}

  isSuperAdmin(): boolean {
    const role = this.authService.getRole();
    return !!role?.superAdmin;
  }

  setRole(role: RoleWithPermissions): void {
    this.currentRole = role;
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
