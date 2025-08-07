export interface Meeting {
  id: string;
  title: string;
  content: string;
  analysis?: MeetingAnalysis;
  created_at: string;
  status: 'processing' | 'completed' | 'failed';
}

export interface CreateMeetingRequest {
  title: string;
  content: string;
}

export interface CreateMeetingResponse {
  id: string;
  title: string;
  status: string;
}

export interface MeetingListItem {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

export interface MeetingAnalysis {
  summary: string;
  action_items: string[];
  participants: string[];
}
