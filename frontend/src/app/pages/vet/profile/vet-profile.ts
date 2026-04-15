import { Component, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Vet } from '../../../models/app.models';
import { SessionAuthService } from '../../../services/session-auth';
import { VetDataService } from '../../../services/vet-data';

@Component({
  selector: 'app-vet-profile',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './vet-profile.html',
})
export class VetProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(SessionAuthService);
  private readonly vets = inject(VetDataService);

  readonly vet = signal<Vet | null>(null);
  readonly statusMessage = signal('');
  readonly errorMessage = signal('');
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    specialization: ['', Validators.required],
    experience: [0, [Validators.required, Validators.min(0)]],
    clinicAddress: ['', Validators.required],
    availableDays: ['', Validators.required],
    availableTime: ['', Validators.required],
  });

  constructor() {
    this.loadVet();
  }

  saveProfile() {
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
        ...this.form.getRawValue(),
      })
      .subscribe({
        next: (updatedVet) => {
          this.vet.set(updatedVet);
          this.saving.set(false);
          this.statusMessage.set('Veterinarian profile updated.');
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Unable to update the profile right now.');
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
          name: vet.name,
          email: vet.email,
          phone: vet.phone,
          specialization: vet.specialization,
          experience: vet.experience,
          clinicAddress: vet.clinicAddress,
          availableDays: vet.availableDays,
          availableTime: vet.availableTime,
        });
      },
    });
  }
}
