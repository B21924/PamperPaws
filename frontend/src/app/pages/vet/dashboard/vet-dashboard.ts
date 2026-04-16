import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { forkJoin } from 'rxjs';

import { Customer, Vet, Visit } from '../../../models/app.models';
import { CustomerDataService } from '../../../services/customer-data';
import { SessionAuthService } from '../../../services/session-auth';
import { VetDataService } from '../../../services/vet-data';
import { VisitDataService } from '../../../services/visit-data';

@Component({
  selector: 'app-vet-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './vet-dashboard.html',
})
export class VetDashboardComponent {
  private readonly auth = inject(SessionAuthService);
  private readonly vets = inject(VetDataService);
  private readonly visits = inject(VisitDataService);
  private readonly customers = inject(CustomerDataService);

  readonly vet = signal<Vet | null>(null);
  readonly appointments = signal<Visit[]>([]);
  readonly customerDirectory = signal<Record<number, Customer>>({});
  readonly errorMessage = signal('');

  readonly today = new Date().toISOString().split('T')[0];
  readonly todaysAppointments = computed(() =>
    this.appointments()
      .filter((visit) => visit.visitDate === this.today)
      .sort((left, right) => left.timeSlot.localeCompare(right.timeSlot)),
  );
  readonly upcomingAppointments = computed(() =>
    this.appointments()
      .filter((visit) => visit.visitDate > this.today)
      .sort((left, right) =>
        `${left.visitDate}-${left.timeSlot}`.localeCompare(`${right.visitDate}-${right.timeSlot}`),
      ),
  );

  constructor() {
    this.loadData();
  }

  customerName(customerId: number) {
    return this.customerDirectory()[customerId]?.name ?? `Customer #${customerId}`;
  }

  customerPhone(customerId: number) {
    return this.customerDirectory()[customerId]?.phone ?? 'Not available';
  }

  private loadData() {
    const username = this.auth.session()?.username;
    if (!username) {
      return;
    }

    this.vets.getVetByUsername(username).subscribe({
      next: (vet) => {
        this.vet.set(vet);
        forkJoin({
          appointments: this.visits.getVisitsByVet(vet.id),
          customers: this.customers.getAllCustomers(),
        }).subscribe({
          next: ({ appointments, customers }) => {
            this.appointments.set(appointments);
            this.customerDirectory.set(
              customers.reduce<Record<number, Customer>>((accumulator, customer) => {
                accumulator[customer.id] = customer;
                return accumulator;
              }, {}),
            );
          },
          error: () => {
            this.errorMessage.set('Unable to load your appointment summary right now.');
          },
        });
      },
      error: () => {
        this.errorMessage.set('Unable to load your veterinary profile right now.');
      },
    });
  }
}
