import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Customer, Pet, Vet, Visit } from '../../../models/app.models';
import { CustomerDataService } from '../../../services/customer-data';
import { SessionAuthService } from '../../../services/session-auth';
import { VetDataService } from '../../../services/vet-data';
import { VisitDataService } from '../../../services/visit-data';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, DatePipe],
  templateUrl: './customer-dashboard.html',
})
export class CustomerDashboardComponent {
  private readonly auth = inject(SessionAuthService);
  private readonly customers = inject(CustomerDataService);
  private readonly visits = inject(VisitDataService);
  private readonly vets = inject(VetDataService);

  readonly loading = signal(true);
  readonly customer = signal<Customer | null>(null);
  readonly pets = signal<Pet[]>([]);
  readonly appointments = signal<Visit[]>([]);
  readonly vetDirectory = signal<Record<number, Vet>>({});

  readonly upcomingAppointments = computed(() =>
    [...this.appointments()]
      .filter((visit) => visit.visitDate >= new Date().toISOString().split('T')[0])
      .sort((left, right) =>
        `${left.visitDate}-${left.timeSlot}`.localeCompare(`${right.visitDate}-${right.timeSlot}`),
      )
      .slice(0, 4),
  );

  constructor() {
    this.loadDashboard();
  }

  private loadDashboard() {
    const username = this.auth.session()?.username;
    if (!username) {
      this.loading.set(false);
      return;
    }

    this.customers.getCustomerByUsername(username).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        forkJoin({
          pets: this.customers.getPets(customer.id),
          appointments: this.visits.getVisitsByCustomer(customer.id),
          vets: this.vets.getAllVets(),
        }).subscribe({
          next: ({ pets, appointments, vets }) => {
            this.pets.set(pets);
            this.appointments.set(appointments);
            this.vetDirectory.set(
              vets.reduce<Record<number, Vet>>((accumulator, vet) => {
                accumulator[vet.id] = vet;
                return accumulator;
              }, {}),
            );
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }
}
