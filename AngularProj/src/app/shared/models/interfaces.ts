export type EventStatus = 'Upcoming' | 'InProgress' | 'Completed' | 'Cancelled';
export type GuestStatus = 'Invited' | 'Accepted' | 'Declined' | 'Pending';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ExpenseCategory = 'Venue' | 'Decoration' | 'Food' | 'Music' | 'Transport' | 'Miscellaneous';
export type Role = 'Organizer' | 'Guest' | 'Admin';

export interface Organizer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  /** Plain-text password for demo purposes (optional) */
  password?: string;
  role: Role;
  createdAt: string;
}

export interface Guest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  /** Plain-text password for demo purposes (optional) */
  password?: string;
  status: GuestStatus;
  feedbackId?: number | null;
  eventId: number;
  createdAt: string;
  role: Role;

}

export interface Admin {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: Role;
  createdAt: string;
}

export interface EventModel {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  image?: string;
  startDate: string;
  endDate: string;
  createdBy: number;
  guestCount: number;
  guests: number[];
  tasks: number[];
  expenses: number[];
  feedbacks: number[];
  status: EventStatus;
  budget: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  eventId: number;
  title: string;
  description?: string;
  assignedTo?: number | null;
  priority: Priority;
  deadline: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  comments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: number;
  eventId: number;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
}

export interface Feedback {
  id: number;
  guestId: number;
  eventId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface FeedbackPayload {
  guestId: number;
  eventId: number;
  rating: number;
  comment?: string;
}

