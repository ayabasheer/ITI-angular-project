export interface GuestInvitation {
  id: number;
  eventId: number;
  eventName: string;
  eventDescription: string;
  eventDate: Date;
  eventTime: string;
  location: string;
  organizerName: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedDate: Date;
  respondedDate: Date | null;
  canProvideFeedback: boolean;
  eventImage: string | null;
}

export interface GuestFeedback {
  id: number;
  eventId: number;
  eventName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface UpcomingEvent {
  id: number;
  name: string;
  startDate: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export interface EventDetails {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  startDate: Date;
  endDate: Date;
  time: string;
  organizerName: string;
  guestCount: number;
  budget: number;
  progress: number;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  image: string | null;
  tasks: EventTask[];
  expenses: EventExpense[];
}

export interface EventTask {
  id: number;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline: Date;
  status: 'not-started' | 'in-progress' | 'completed';
  comments: string[];
}

export interface EventExpense {
  id: number;
  name: string;
  amount: number;
  category: 'venue' | 'decoration' | 'food' | 'music' | 'transport' | 'miscellaneous';
  date: Date;
  notes: string;
}

export interface GuestStats {
  totalInvitations: number;
  acceptedEvents: number;
  averageRatingGiven: number;
  feedbackProvided: number;
}
