import { Component, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {

  username = '';
  showDropdown = false;
  showSidebar = false;
  showAddPet = false;

  editMode = false;
  editingPetId: number | null = null;

  newPet: any = {
    name: '',
    type: '',
    age: '',
    image: ''
  };

  customerId: number = 0;
  pets: any[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef   // ✅ IMPORTANT
  ) {}

  // 🔥 INIT
  ngOnInit() {
    const token = sessionStorage.getItem('token');

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.username = payload.sub;

      this.loadCustomer();
    }
  }

  // 🔥 CUSTOMER
  loadCustomer() {
    this.http.get<any>(`http://localhost:8087/customers/username/${this.username}`)
      .subscribe({
        next: (res) => {
          this.customerId = res.id;

          this.loadPets();
          this.cdr.detectChanges();   // 🔥 FORCE UI UPDATE
          this.loadAppointments();
        },
        error: () => {
          alert("Error loading user");
          this.logout();
        }
      });
  }

  // 🔥 PETS (MAIN FIX HERE)
  loadPets() {
    this.http.get<any[]>(`http://localhost:8087/pets/customer/${this.customerId}`)
      .subscribe({
        next: (data) => {
          this.pets = data;

          this.cdr.detectChanges();   // 🔥 KEY FIX
        },
        error: (err) => {
          console.error("Pets load error", err);
        }
      });
  }

  // 🔥 ADD / UPDATE
  addPet() {

    if (!this.newPet.name || !this.newPet.type || !this.newPet.age) {
      alert("Please fill all fields");
      return;
    }

    if (this.editMode && this.editingPetId) {

      this.http.put(`http://localhost:8087/pets/${this.editingPetId}`, this.newPet)
        .subscribe(() => {
          this.loadPets();
          this.resetForm();
        });

    } else {

      this.http.post(`http://localhost:8087/pets/customer/${this.customerId}`, this.newPet)
        .subscribe(() => {
          this.loadPets();
          this.resetForm();
        });
    }
  }

  // 🔥 EDIT
  editPet(index: number) {
    const pet = this.pets[index];

    this.newPet = { ...pet };
    this.editMode = true;
    this.editingPetId = pet.id;
    this.showAddPet = true;
  }

  // 🔥 DELETE
  deletePet(petId: number) {
    if (!confirm("Delete this pet?")) return;

    this.http.delete(`http://localhost:8087/pets/${petId}`)
      .subscribe(() => {
        this.loadPets();
      });
  }

  resetForm() {
    this.newPet = { name: '', type: '', age: '', image: '' };
    this.showAddPet = false;
    this.editMode = false;
    this.editingPetId = null;
  }

  // 🔥 UI
  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  goToProfile() {
    alert("Profile coming soon 😄");
  }

  goToAppointments() {
    this.router.navigate(['/appointments']);
  }

  appointments: any[] = [];

  loadAppointments() {
  this.http.get<any[]>(`http://localhost:8087/visit/customer/${this.customerId}`)
    .subscribe(data => {
      this.appointments = data;
    });
}
}