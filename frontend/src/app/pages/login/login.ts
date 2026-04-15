import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  user = {
    username: '',
    password: ''
  };

  // constructor(private auth: AuthService) {}

  constructor(private auth: AuthService, private router: Router) {}
  
  // login() {
  //   this.auth.login(this.user).subscribe({
  //     next: (res: any) => {
  //       alert('Login successful!');
  //       console.log(res);
  //     },
  //     error: () => {
  //       alert('Invalid credentials');
  //     }
  //   });
  // }


  login() {
  this.auth.login(this.user).subscribe({
    next: (res: string) => {
      console.log("TOKEN:", res);

      // 🔥 STORE TOKEN
      sessionStorage.setItem('token', res);

      alert('Login successful!');

      // 🔥 REDIRECT
      // window.location.href = '/';   // or dashboard later
      this.router.navigate(['/dashboard']);   // clean redirect
    },
    error: () => {
      alert('Invalid credentials');
    }
  });
}
}