import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
 private http=inject(HttpClient);
 private apiUrl="http://localhost:3000/api";

  onSignup({name,email,password,avatarId}: {name:string,email:string,password:string,avatarId:string}): Observable<any>
  {
    return this.http.post(`${this.apiUrl}/auth/signup`,{name,email,password,avatarId});
  }

  onSignin({email,password}: {email:string,password:string}): Observable<any>
  {
    return this.http.post(`${this.apiUrl}/auth/login`,{email,password},{withCredentials:true});
  }
}
