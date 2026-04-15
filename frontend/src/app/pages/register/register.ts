import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CustomerService } from '../../services/customer';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

 user = {
  username: '',
  name: '',
  password: '',
  email: '',
  phone: '',
  address: ''
};

  confirmPassword = '';

  constructor(private auth: AuthService,
            private customerService: CustomerService) {}


  
register() {

  if (this.user.password !== this.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  // 🔹 Auth payload
  const authPayload = {
    username: this.user.username,
    password: this.user.password,
    role: 'CUSTOMER',
    name: this.user.name
  };

  // 🔹 Customer payload
  const customerPayload = {
    username: this.user.username,
    name: this.user.name,
    email: this.user.email,
    phone: this.user.phone,
    address: this.user.address
  };

  // 🔥 Step 1: Register in auth-service
  this.auth.register(authPayload).subscribe({
    next: () => {

      // 🔥 Step 2: Create customer
      this.customerService.createCustomer(customerPayload).subscribe({
        next: () => {
          alert('Registered successfully!');
        },
        error: (err) => {
          console.error("FULL ERROR:", err);
          alert("Customer creation failed: " + JSON.stringify(err.error));
        }
      });

    },
    error: (err) => {
  console.error("AUTH ERROR:", err);
  alert("Auth registration failed: " + JSON.stringify(err.error));
}
  });
}
}