import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { forkJoin } from 'rxjs';

import { AdminDataService } from '../../../services/admin-data';
import { Customer, Vet } from '../../../models/app.models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './admin-users.html',
})
export class AdminUsersComponent {
  private readonly admin = inject(AdminDataService);

  readonly customers = signal<Customer[]>([]);
  readonly vets = signal<Vet[]>([]);

  constructor() {
    forkJoin({
      customers: this.admin.getCustomers(),
      vets: this.admin.getVets(),
    }).subscribe({
      next: ({ customers, vets }) => {
        this.customers.set(customers);
        this.vets.set(vets);
      },
    });
  }
}
