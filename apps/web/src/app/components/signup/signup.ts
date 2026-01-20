import { Component, inject, signal } from '@angular/core';
import { ToastModule, Toast } from 'primeng/toast';
import { ButtonModule, Button } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpService } from '../../services/httpclient/http-client';
import { Router } from '@angular/router';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, Toast, Button],
  templateUrl: './signup.html',
  styleUrls: []
})
export class SignupComponent {
   
  private authService=inject(HttpService);
  private messageService=inject(MessageService);
  private routerLink=inject(Router);
  selectedAvatarSeed = signal<number>(1);
  
  
  
  signupForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    
  });
  
  
 onSubmit() {
    if (this.signupForm.valid) {
      const payload = {
        ...this.signupForm.value,
        
      };
      //console.log('Registering User:', payload);
      
      this.authService.onSignup({name:payload.username!,email:payload.email!,password:payload.password!,avatarId:this.selectedAvatarSeed().toString()}).subscribe({
        next:(res)=>{
          
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Signup Successful' });
        setTimeout(() => {
           this.routerLink.navigate(['/signin']);
          }, 1500);
       
        },
        error:(err)=>{
          console.error('Signup Failed:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Signup Failed' });
        }
      });
    }
  }
}