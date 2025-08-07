import { Routes } from '@angular/router';
import { MeetingListComponent } from './components/meeting-list/meeting-list.component';
import { MeetingCreateComponent } from './components/meeting-create/meeting-create.component';
import { MeetingDetailComponent } from './components/meeting-detail/meeting-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/meetings', pathMatch: 'full' },
  { path: 'meetings', component: MeetingListComponent },
  { path: 'meetings/new', component: MeetingCreateComponent },
  { path: 'meetings/:id', component: MeetingDetailComponent },
];
