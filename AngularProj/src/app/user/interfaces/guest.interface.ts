export interface GuestUser {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: string;
  status?: 'Accepted' | 'Pending' | 'Declined';
  createdAt?: string;
  eventId?: number | null;
  feedbackId?: number | null;
  expenses?: Expense[];
}

export interface Expense {
  id: number;
  eventId: number;
  name: string;
  amount: number;
  category: string;
  date?: string;
}

export interface Event {
  id: number;
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  status?: 'Pending' | 'Accepted' | 'Refused' | 'InProgress' | 'Completed' | 'Cancelled';
  guests?: number[]; // ← array of guest IDs
  guestCount?: number;
  expenses?: Expense[];
  feedbacks?: Feedback[];
  tasks?: number[];
  image?: string;
  category?: string;
}


export interface Feedback {
  id: number;
  guestId: number;
  eventId: number;
  comment: string;
  rating: number;
  createdAt: string;
}

export interface GuestStats {
  totalInvitations: number;
  acceptedEvents: number;
  averageRatingGiven: number;
  feedbackProvided: number;
}

export interface AppSettings {
  darkMode: boolean;
} 
export interface Invention {
  id: number;
  name: string;
  description: string;
  guestId: number; // id of the guest who owns it
  image?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
}
