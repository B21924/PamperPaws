import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink, NgFor], 
  templateUrl: './help.html',
  styleUrl: './help.css'
})
export class HelpComponent {

  faqs = [
    { question: "How do I book an appointment?", answer: "Login and go to appointment page.", open: false },
    { question: "Can I cancel appointments?", answer: "Yes, from your dashboard.", open: false },
    { question: "Do you provide emergency care?", answer: "Yes, 24/7 emergency services available.", open: false },
    { question: "How to contact a vet?", answer: "Use contact page or appointment system.", open: false },
    { question: "Do you offer vaccination?", answer: "Yes, all standard vaccinations available.", open: false },
    { question: "Can I reschedule appointments?", answer: "Yes, before scheduled time.", open: false },
    { question: "Is online consultation available?", answer: "Yes, via booking system.", open: false },
    { question: "Do you handle surgery cases?", answer: "Yes, advanced surgical care available.", open: false },
    { question: "How to register?", answer: "Click register on login page.", open: false },
    { question: "Are records stored?", answer: "Yes, pet health records are stored.", open: false },
    { question: "Do you treat all animals?", answer: "Mostly cats and dogs.", open: false },
    { question: "How to update profile?", answer: "Go to dashboard settings.", open: false },
    { question: "Is there a mobile app?", answer: "Currently web-based system only.", open: false },
    { question: "Do you offer grooming?", answer: "Yes, grooming services available.", open: false },
    { question: "How to reach clinic?", answer: "Use map in contact page.", open: false }
  ];

  toggle(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }
}