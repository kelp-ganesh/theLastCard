import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
 private http=inject(HttpClient);
 private apiUrl="https://qd89949c-3000.inc1.devtunnels.ms/api";

  onSignup({name,email,password,avatarId}: {name:string,email:string,password:string,avatarId:string}): Observable<any>
  {
    return this.http.post(`${this.apiUrl}/auth/signup`,{name,email,password,avatarId});
  }

  onSignin({email,password}: {email:string,password:string}): Observable<any>
  {
    return this.http.post(`${this.apiUrl}/auth/login`,{email,password},{withCredentials:true});
  }
}
