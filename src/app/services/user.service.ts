import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Country, Role, Status, User,UserView } from '../modals/user';
import { ApiEndpoints } from '../constants/api-endpoints';
 
@Injectable({
  providedIn: 'root'
})
export class UserService {
  

  constructor(private http:HttpClient) { }
 
  addUser(formData: FormData): Observable<any> {
    return this.http.post(`${ApiEndpoints.USER}/Add`, formData);
  }
  getUserById (id:number): Observable<UserView> {
    return this.http.get<UserView>(`${ApiEndpoints.USER}/${id}`);
  }
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${ApiEndpoints.USER}/roles`);
  }
 
  getStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(`${ApiEndpoints.USER}/statuses`);
  }
  getAllUser(): Observable<UserView[]>{
    return this.http.get<UserView[]>(ApiEndpoints.USER);
  }
  updateUser(userId: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${ApiEndpoints.USER}/update/${userId}`,formData);
  }
  getCountry(): Observable<Country[]>{
    return this.http.get<Country[]>(ApiEndpoints.COUNTRY)
  }
  deleteUser(userId:number): Observable<any> {
    return this.http.delete<any>(`${ApiEndpoints.USER}/delete/${userId}`);
  }
}