import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {SIGNUP_REQUEST_TYPE} from 'interfaces'
import { environment } from '../../../environments/environment';
 
 

@Injectable({
  providedIn: 'root',
})

export class HttpService {
 private http=inject(HttpClient);
 
 private apiUrl = environment.apiUrl;

  onSignup({name,email,password,avatarId}: {name:string,email:string,password:string,avatarId:string}): Observable<any>
  {
    return this.http.post(`${this.apiUrl}/auth/signup`,{name,email,password,avatarId});
  }

  onSignin({email,password}: {email:string,password:string}): Observable<any>
  {
    return this.http.post(`${this.apiUrl}/auth/login`,{email,password},{withCredentials:true});
  }
}


