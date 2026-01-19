import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpService } from '../../services/httpclient/http-client';
import { MessageService } from 'primeng/api';
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, Toast],
  templateUrl: './signin.html',
  styleUrls: ['./signin.scss']
})
export class SigninComponent {
   private authService=inject(HttpService);
  private messageService=inject(MessageService);
  private routerLink=inject(Router);


  // 1. Form Setup
  signinForm = new FormGroup({
     
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });


  // 3. Submit Action
  onSubmit() {
    if (this.signinForm.valid) {
      const payload = {
        ...this.signinForm.value,
       
      };
      console.log('Registering User:', payload);
       this.authService.onSignin({email:payload.email!,password:payload.password!}).subscribe({
        next:(res)=>{
          console.log('Signin Successful:', res);
          // Store token in localStorage
          if (res.access_token) {
            localStorage.setItem('authToken', res.access_token);
            console.log('Token stored in localStorage');
          }
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Signin Successful' });
          setTimeout(() => {
             this.routerLink.navigate(['/lobby']);
            }, 1500);
        },
        error:(err)=>{
          console.error('Signin Failed:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Signin Failed' });
        }
      });
    }
  }
}