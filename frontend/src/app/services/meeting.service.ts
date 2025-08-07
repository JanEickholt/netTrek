import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  Meeting,
  CreateMeetingRequest,
  CreateMeetingResponse,
  MeetingListItem,
} from '../models/meeting.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private readonly baseUrl = environment.apiUrl || 'http://localhost:5000';
  private readonly http = inject(HttpClient);

  getAllMeetings(): Observable<{ meetings: MeetingListItem[] }> {
    return this.http
      .get<{ meetings: MeetingListItem[] }>(`${this.baseUrl}/meetings`)
      .pipe(catchError(this.handleError));
  }

  getMeetingById(id: string): Observable<Meeting> {
    return this.http
      .get<Meeting>(`${this.baseUrl}/meetings/${id}`)
      .pipe(catchError(this.handleError));
  }

  createMeeting(
    request: CreateMeetingRequest,
  ): Observable<CreateMeetingResponse> {
    return this.http
      .post<CreateMeetingResponse>(`${this.baseUrl}/meetings`, request)
      .pipe(catchError(this.handleError));
  }

  deleteMeeting(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/meetings/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ein unbekannter Fehler ist aufgetreten';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Fehler: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 404:
          errorMessage = 'Meeting nicht gefunden';
          break;
        case 500:
          errorMessage = 'Serverfehler bei der Verarbeitung';
          break;
        case 0:
          errorMessage = 'Verbindung zum Server fehlgeschlagen';
          break;
        default:
          errorMessage = `Fehler ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
