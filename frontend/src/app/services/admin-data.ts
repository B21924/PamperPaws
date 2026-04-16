import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Customer, Vet, Visit } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly baseUrl = 'http://localhost:8087/admin';

  constructor(private http: HttpClient) {}

  getCustomers() {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`);
  }

  getVets() {
    return this.http.get<Vet[]>(`${this.baseUrl}/vets`);
  }

  getVisits() {
    return this.http.get<Visit[]>(`${this.baseUrl}/visits`);
  }

  deleteVisit(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/visits/${id}`);
  }
}
