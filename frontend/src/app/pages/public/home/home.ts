import { Component, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { SessionAuthService } from '../../../services/session-auth';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './home.html',
})
export class PublicHomeComponent {
  private readonly auth = inject(SessionAuthService);

  readonly session = this.auth.session;
  readonly dashboardPath = computed(() =>
    this.auth.landingPathForRole(this.session()?.role),
  );
}
