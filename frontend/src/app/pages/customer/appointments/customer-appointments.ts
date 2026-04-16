import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { Customer, Vet, Visit } from '../../../models/app.models';
import { CustomerDataService } from '../../../services/customer-data';
import { SessionAuthService } from '../../../services/session-auth';
import { VetDataService } from '../../../services/vet-data';
import { VisitDataService } from '../../../services/visit-data';

@Component({
  selector: 'app-customer-appointments',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, DatePipe],
  templateUrl: './customer-appointments.html',
})
export class CustomerAppointmentsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(SessionAuthService);
  private readonly customers = inject(CustomerDataService);
  private readonly vets = inject(VetDataService);
  private readonly visits = inject(VisitDataService);

  readonly customer = signal<Customer | null>(null);
  readonly vetsList = signal<Vet[]>([]);
  readonly appointments = signal<Visit[]>([]);
  readonly timeSlots = signal<string[]>([]);
  readonly statusMessage = signal('');
  readonly errorMessage = signal('');
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    vetId: ['', Validators.required],
    visitDate: ['', Validators.required],
    timeSlot: ['', Validators.required],
    reason: ['', Validators.required],
  });

  readonly upcomingAppointments = computed(() =>
    [...this.appointments()].sort((left, right) =>
      `${left.visitDate}-${left.timeSlot}`.localeCompare(`${right.visitDate}-${right.timeSlot}`),
    ),
  );

  constructor() {
    this.loadData();
  }

  todayDate() {
    return new Date().toISOString().split('T')[0];
  }

  loadSlots() {
    const vetId = Number(this.form.controls.vetId.value);
    const visitDate = this.form.controls.visitDate.value;
    if (!vetId || !visitDate) {
      this.timeSlots.set([]);
      return;
    }

    this.vets.getSlots(vetId, visitDate).subscribe({
      next: (slots) => this.timeSlots.set(slots),
      error: () => this.errorMessage.set('Unable to load time slots right now.'),
    });
  }

  bookAppointment() {
    if (this.form.invalid || !this.customer() || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.statusMessage.set('');
    this.errorMessage.set('');

    this.visits
      .createVisit({
        customerId: this.customer()!.id,
        vetId: Number(this.form.controls.vetId.value),
        visitDate: this.form.controls.visitDate.value,
        timeSlot: this.form.controls.timeSlot.value,
        reason: this.form.controls.reason.value,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.statusMessage.set('Appointment booked successfully.');
          this.form.reset({ vetId: '', visitDate: '', timeSlot: '', reason: '' });
          this.timeSlots.set([]);
          this.loadAppointments();
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Booking failed. Please try another slot.');
        },
      });
  }

  vetName(vetId: number) {
    return this.vetsList().find((vet) => vet.id === vetId)?.name ?? `Vet #${vetId}`;
  }

  private loadData() {
    const username = this.auth.session()?.username;
    if (!username) {
      return;
    }

    this.customers.getCustomerByUsername(username).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        forkJoin({
          vets: this.vets.getAllVets(),
          appointments: this.visits.getVisitsByCustomer(customer.id),
        }).subscribe({
          next: ({ vets, appointments }) => {
            this.vetsList.set(vets);
            this.appointments.set(appointments);
          },
        });
      },
    });
  }

  private loadAppointments() {
    if (!this.customer()) {
      return;
    }

    this.visits.getVisitsByCustomer(this.customer()!.id).subscribe({
      next: (appointments) => this.appointments.set(appointments),
    });
  }
}
