import {
  Component,
  OnInit,
  OnDestroy,
  ViewContainerRef,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { takeWhile, switchMap } from 'rxjs/operators';
import { MeetingService } from '../../services/meeting.service';
import { Meeting } from '../../models/meeting.interface';
import { ConfirmationService } from '../../components/services/confirmation';

@Component({
  selector: 'app-meeting-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-detail.component.html',
  styleUrls: ['./meeting-detail.component.scss'],
})
export class MeetingDetailComponent implements OnInit, OnDestroy {
  meeting = signal<Meeting | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  meetingId: string;
  private pollingSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService,
    private confirmationService: ConfirmationService,
    private viewContainerRef: ViewContainerRef,
  ) {
    this.meetingId = this.route.snapshot.paramMap.get('id') || '';
    this.confirmationService.setViewContainerRef(this.viewContainerRef);
  }

  ngOnInit(): void {
    if (this.meetingId) {
      this.loadMeeting();
    } else {
      this.router.navigate(['/meetings']);
    }
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadMeeting(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.meetingService.getMeetingById(this.meetingId).subscribe({
      next: (meeting) => {
        this.meeting.set(meeting);
        this.isLoading.set(false);

        if (meeting.status === 'processing') {
          this.startPolling();
        }
      },
      error: (error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  private startPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }

    this.pollingSubscription = interval(3000)
      .pipe(
        takeWhile(() => this.meeting()?.status === 'processing', true),
        switchMap(() => this.meetingService.getMeetingById(this.meetingId)),
      )
      .subscribe({
        next: (meeting) => {
          this.meeting.set(meeting);
          if (meeting.status !== 'processing') {
            this.pollingSubscription?.unsubscribe();
          }
        },
        error: (error) => {
          this.errorMessage.set(error.message);
          this.pollingSubscription?.unsubscribe();
        },
      });
  }

  navigateBack(): void {
    this.router.navigate(['/meetings']);
  }

  async deleteMeeting(): Promise<void> {
    const currentMeeting = this.meeting();
    if (!currentMeeting) return;

    const confirmed = await this.confirmationService.confirm({
      title: 'Meeting löschen',
      message: `Möchten Sie das Meeting "${currentMeeting.title}" wirklich unwiderruflich löschen?`,
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    this.meetingService.deleteMeeting(this.meetingId).subscribe({
      next: () => {
        this.router.navigate(['/meetings']);
      },
      error: (error) => {
        this.errorMessage.set(error.message);
      },
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusClass(): string {
    const meeting = this.meeting();
    if (!meeting) return '';

    return `status-${meeting.status}`;
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      completed: 'Abgeschlossen',
      processing: 'Wird verarbeitet',
      failed: 'Fehlgeschlagen',
    };
    return statusMap[status] || 'Unbekannt';
  }
}
