import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class AppointmentsComponent {

  constructor(private http: HttpClient, private router: Router) {}

  appointment = {
    date: '',
    time: '',
    vetId: '',
    reason: ''
  };

  vets: any[] = [];
  timeSlots: string[] = [];
  appointments: any[] = [];

  customerId = 0;

  ngOnInit() {
    const token = sessionStorage.getItem('token');

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const username = payload.sub;

      this.http.get<any>(`http://localhost:8087/customers/username/${username}`)
        .subscribe({
          next: (res) => {
            this.customerId = res.id;

            this.loadAppointments();
            this.loadVets();
          },
          error: () => alert("Error loading user")
        });
    }
  }

  // 🔥 DATE LIMIT
  todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // 🔥 LOAD VETS
  loadVets() {
    this.http.get<any[]>('http://localhost:8087/vets')
      .subscribe({
        next: (data) => this.vets = data,
        error: (err) => console.error("Vets error", err)
      });
  }

  // 🔥 LOAD SLOTS
  loadSlots() {

  if (!this.appointment.vetId || !this.appointment.date) {
    console.log("Missing vetId or date");
    return;
  }

  const vetId = Number(this.appointment.vetId);

  console.log("Calling slots API:", vetId, this.appointment.date); // 🔥 DEBUG

  this.http.get<string[]>(
    `http://localhost:8087/vets/${vetId}/slots?date=${this.appointment.date}`
  ).subscribe({
    next: (data) => {
      console.log("SLOTS:", data);   // 🔥 VERY IMPORTANT
      this.timeSlots = data;
    },
    error: (err) => {
      console.error("Slots error", err);
    }
  });
}

  // 🔥 BOOK
  bookAppointment() {

    if (!this.appointment.date || !this.appointment.time || !this.appointment.vetId) {
      alert("Fill all fields");
      return;
    }

    const payload = {
  customerId: this.customerId,
  vetId: Number(this.appointment.vetId),
  visitDate: this.appointment.date,
  timeSlot: this.appointment.time,   // ✅ NEW
  reason: this.appointment.reason    // ✅ NEW
};

    this.http.post('http://localhost:8087/visit', payload)
      .subscribe({
        next: () => {
          this.loadAppointments();
          this.resetForm();
          alert("Appointment booked ✅");
        },
        error: (err) => {
          console.error(err);
          alert("Booking failed");
        }
      });
  }

  // 🔥 RESET
  resetForm() {
    this.appointment = { date: '', time: '', vetId: '', reason: ''};
    this.timeSlots = [];
  }

  // 🔥 LOAD APPOINTMENTS
  loadAppointments() {
  this.http.get<any[]>(`http://localhost:8087/visit/customer/${this.customerId}`)
    .subscribe({
      next: (data) => {
        this.appointments = data;

        console.log("Appointments:", data); // 🔥 debug
      }
    });
}

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}