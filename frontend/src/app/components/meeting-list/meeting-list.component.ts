import { Component, OnInit, ViewContainerRef, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MeetingService } from '../../services/meeting.service';
import { MeetingListItem } from '../../models/meeting.interface';
import { ConfirmationService } from '../services/confirmation';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-list.component.html',
  styleUrls: ['./meeting-list.component.scss'],
})
export class MeetingListComponent implements OnInit {
  meetings = signal<MeetingListItem[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private meetingService: MeetingService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private viewContainerRef: ViewContainerRef,
  ) {
    this.confirmationService.setViewContainerRef(this.viewContainerRef);
  }

  ngOnInit(): void {
    this.loadMeetings();
  }

  loadMeetings(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.meetingService.getAllMeetings().subscribe({
      next: (response) => {
        this.meetings.set(response.meetings);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/meetings/new']);
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/meetings', id]);
  }

  async deleteMeeting(id: string, title: string): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Meeting löschen',
      message: `Möchten Sie das Meeting "${title}" wirklich unwiderruflich löschen?`,
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    this.meetingService.deleteMeeting(id).subscribe({
      next: () => {
        const currentMeetings = this.meetings();
        this.meetings.set(currentMeetings.filter((m) => m.id !== id));
      },
      error: (error) => {
        this.errorMessage.set(error.message);
      },
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      completed: 'Abgeschlossen',
      processing: 'Wird verarbeitet',
      failed: 'Fehlgeschlagen',
    };
    return statusMap[status] || 'Unbekannt';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  trackByMeetingId(index: number, meeting: MeetingListItem): string {
    return meeting.id;
  }
}
