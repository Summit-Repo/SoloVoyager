import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, map, of, retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private baseUrl = 'http://127.0.0.1:5000';
  public loginUrl = `${this.baseUrl}/auth/login`;
  public registerUrl = `${this.baseUrl}/auth/register`
  public resetPasswordUrl = `${this.baseUrl}/auth/reset_password`


  constructor(private http: HttpClient) { }
  checkLogin(userDetails: any): Observable<any> {
    const postData = {
      username: userDetails.username,
      password: userDetails.password
    };
    return this.http.post(this.loginUrl, postData).pipe(
      map((response: any) => {
        sessionStorage.setItem('token', response['token'])
        sessionStorage.setItem('isAdmin', response['isAdmin'])
        return response;
      })
    );
  }

  register(username: any, password: any): Observable<any> {
    const userData = {
      username: username,
      password: password
    };
    return this.http.post(this.registerUrl, userData).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  reset(username: any, password: any, newPassword: any): Observable<any> {
    const userData = {
      username: username,
      old_password: password,
      new_password: newPassword
    };
    return this.http.post(this.resetPasswordUrl, userData).pipe(
      map((response: any) => {
        return response;
      })
    );
  }
}
