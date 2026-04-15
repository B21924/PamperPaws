import { Component, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Vet } from '../../../models/app.models';
import { SessionAuthService } from '../../../services/session-auth';
import { VetDataService } from '../../../services/vet-data';

@Component({
  selector: 'app-vet-availability',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './vet-availability.html',
})
export class VetAvailabilityComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(SessionAuthService);
  private readonly vets = inject(VetDataService);

  readonly vet = signal<Vet | null>(null);
  readonly statusMessage = signal('');
  readonly errorMessage = signal('');
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    availableDays: ['', Validators.required],
    availableTime: ['', Validators.required],
    clinicAddress: ['', Validators.required],
  });

  constructor() {
    this.loadVet();
  }

  saveAvailability() {
    if (this.form.invalid || !this.vet() || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const vet = this.vet()!;
    this.saving.set(true);
    this.statusMessage.set('');
    this.errorMessage.set('');

    this.vets
      .updateVet(vet.id, {
        username: vet.username,
        name: vet.name,
        specialization: vet.specialization,
        experience: vet.experience,
        phone: vet.phone,
        email: vet.email,
        clinicAddress: this.form.controls.clinicAddress.value,
        availableDays: this.form.controls.availableDays.value,
        availableTime: this.form.controls.availableTime.value,
      })
      .subscribe({
        next: (updatedVet) => {
          this.vet.set(updatedVet);
          this.saving.set(false);
          this.statusMessage.set('Availability updated.');
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Unable to update availability right now.');
        },
      });
  }

  private loadVet() {
    const username = this.auth.session()?.username;
    if (!username) {
      return;
    }

    this.vets.getVetByUsername(username).subscribe({
      next: (vet) => {
        this.vet.set(vet);
        this.form.patchValue({
          availableDays: vet.availableDays,
          availableTime: vet.availableTime,
          clinicAddress: vet.clinicAddress,
        });
      },
    });
  }
}
