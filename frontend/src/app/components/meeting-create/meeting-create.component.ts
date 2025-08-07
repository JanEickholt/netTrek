import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MeetingService } from '../../services/meeting.service';

@Component({
  selector: 'app-meeting-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meeting-create.component.html',
  styleUrls: ['./meeting-create.component.scss'],
})
export class MeetingCreateComponent {
  meetingForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private meetingService: MeetingService,
    private router: Router,
  ) {
    this.meetingForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      content: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  onSubmit(): void {
    if (this.meetingForm.invalid) {
      Object.keys(this.meetingForm.controls).forEach((key) => {
        this.meetingForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.meetingService.createMeeting(this.meetingForm.value).subscribe({
      next: () => {
        this.router.navigate(['/meetings']);
      },
      error: (error) => {
        console.error('Error creating meeting:', error);
        this.errorMessage.set(
          error.message || 'Fehler beim Erstellen des Meetings',
        );
        this.isSubmitting.set(false);
      },
      complete: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  navigateBack(): void {
    this.router.navigate(['/meetings']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.meetingForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.meetingForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} ist erforderlich`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} muss mindestens ${requiredLength} Zeichen lang sein`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Titel',
      content: 'Meeting-Inhalt',
    };
    return labels[fieldName] || fieldName;
  }
}
