import type { Organizer, Guest, Admin, EventModel, Task, Expense, Feedback, EventStatus, GuestStatus, Priority, ExpenseCategory } from '../models/interfaces';

function pad(n: number) { return n < 10 ? '0' + n : String(n); }
function isoDateOffset(base: Date, daysOffset: number, hour = 9, minute = 0) {
  const d = new Date(base);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randChoice<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeDemoPassword(role: string, id: number) {
  return `${role}!${id}`;
}


async function checkAssetExists(path: string): Promise<boolean> {
  try {
    const resp = await fetch(path, { method: 'GET', cache: 'no-store' });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function loadAndStoreLocalImages(options?: { count?: number, folderPath?: string }) {
  const count = options?.count ?? 8;
  let folder = options?.folderPath ?? 'assets/event-images';
  if (!folder.startsWith('/')) folder = '/' + folder;

  const extensions = ['jpg', 'jpeg', 'png', 'webp'];
  const images: string[] = [];

  for (let i = 1; i <= count; i++) {
    let found = false;
    for (const ext of extensions) {
      const path = `${folder}/image${i}.${ext}`;

      if (await checkAssetExists(path)) {
        images.push(path);
        found = true;
        break;
      }
    }
    if (!found) {
      for (const ext of extensions) {
        const path = `${folder}/${i}.${ext}`;
        if (await checkAssetExists(path)) {
          images.push(path);
          found = true;
          break;
        }
      }
    }
  }
 if (images.length === 0) {
    for (let i = 1; i <= count; i++) {
      images.push(`${folder}/image${i}.jpg`);
    }
  }

  try {
    localStorage.setItem('event_images', JSON.stringify(images));
  } catch (e) {
    console.warn('Unable to persist images to localStorage:', e);
  }
  return images;
}

export async function generateAndSaveAllWithImages() {
  const base = new Date('2025-10-11T09:00:00Z');
  const organizers: Organizer[] = [];
  const guests: Guest[] = [];
  const admins: Admin[] = [];
  const events: EventModel[] = [];
  const tasks: Task[] = [];
  const expenses: Expense[] = [];
  const feedbacks: Feedback[] = [];


  const loadedImages = await loadAndStoreLocalImages({ count: 8, folderPath: 'assets/event-images' });

  // --- Organizers ---
  for (let i = 1; i <= 100; i++) {
    organizers.push({
      id: i,
      name: `Organizer ${i}`,
      email: `organizer${i}@example.com`,
      password: makeDemoPassword('Organizer', i),
      phone: `+20100${100000 + i}`,
      role: 'Organizer',
      createdAt: isoDateOffset(base, -randInt(1, 30), 8, randInt(0, 59))
    });
  }

  // --- Admins ---
  for (let i = 1; i <= 100; i++) {
    admins.push({
      id: i,
      name: `Admin ${i}`,
      email: `admin${i}@example.com`,
      password: makeDemoPassword('Admin', i),
      role: 'Admin',
      createdAt: isoDateOffset(base, -randInt(1, 40), 7, randInt(0, 59))
    });
  }

  const categoryList = ['Conference', 'Meeting', 'Workshop', 'Webinar', 'Party'];
  const statusList: EventStatus[] = ['Upcoming', 'InProgress', 'Completed', 'Cancelled'];

  for (let i = 1; i <= 100; i++) {
    const creatorId = ((i - 1) % organizers.length) + 1;
    const startDays = i;
    const durationDays = randInt(0, 2);
    const start = isoDateOffset(base, startDays, 9 + (i % 6));
    const end = isoDateOffset(base, startDays + durationDays, 17);
    const category = categoryList[i % categoryList.length];
    const status = statusList[i % statusList.length];

    const guestCount = randInt(5, 120);

    const chosenImage = loadedImages.length ? loadedImages[(i - 1) % loadedImages.length] : '';

    events.push({
      id: i,
      name: `Event ${i} — ${category}`,
      description: `demo description for event ${i} for category ${category}.`,
      category,
      location: `Venue ${(i % 25) + 1}`,
      image: chosenImage,
      startDate: start,
      endDate: end,
      createdBy: creatorId,
      guestCount,
      guests: [],
      tasks: [],
      expenses: [],
      feedbacks: [],
      status,
      budget: 500 + i * 50,
      createdAt: isoDateOffset(base, Math.floor(i / 10) * -1, 8, randInt(0, 59)),
      updatedAt: isoDateOffset(base, Math.floor(i / 5), 10, randInt(0, 59))
    });
  }

  let nextGuestId = 1;
  for (const ev of events) {
    const numGuests = Math.min(ev.guestCount ?? randInt(5, 20), 300); // safety cap
    ev.guests = [];
    for (let g = 0; g < numGuests; g++) {
      const guest: Guest = {
        id: nextGuestId,
        name: `Guest ${nextGuestId}`,
        email: `guest${nextGuestId}@example.com`,
        password: makeDemoPassword('Guest', nextGuestId),
        phone: `+20111${900000 + nextGuestId}`,
        status: (['Invited', 'Accepted', 'Declined', 'Pending'] as GuestStatus[])[nextGuestId % 4],
        feedbackId: null,
        role: 'Guest',
        eventId: ev.id,
        createdAt: isoDateOffset(base, -randInt(1, 20), 9, randInt(0, 59))
      };
      guests.push(guest);
      ev.guests.push(guest.id);
      nextGuestId++;
    }
    ev.guestCount = ev.guests.length;
  }

  for (let i = 1; i <= 100; i++) {
    const eventId = ((i - 1) % events.length) + 1;
    const assignedTo = ((i - 1) % organizers.length) + 1;
    const statuses = ['Not Started', 'In Progress', 'Completed'] as const;
    const t: Task = {
      id: i,
      eventId,
      title: `Task ${i} for Event ${eventId}`,
      description: `Complete task ${i} for event ${eventId}`,
      assignedTo,
      priority: (['Low', 'Medium', 'High', 'Critical'] as Priority[])[i % 4],
      deadline: isoDateOffset(base, (eventId % 10) + 1, 17),
      status: statuses[i % statuses.length],
      comments: [`Auto-generated comment for task ${i}`],
      createdAt: isoDateOffset(base, -randInt(1, 5), 9, randInt(0, 59)),
      updatedAt: isoDateOffset(base, randInt(0, 3), 10, randInt(0, 59))
    };
    tasks.push(t);
    const ev = events.find(e => e.id === eventId);
    if (ev) ev.tasks.push(t.id);
  }

  let nextTaskId = tasks.length + 1;
  for (const ev of events) {
    const extraCount = randInt(1, 4);
    for (let k = 0; k < extraCount; k++) {
      const t: Task = {
        id: nextTaskId,
        eventId: ev.id,
        title: `Extra Task ${nextTaskId} for Event ${ev.id}`,
        description: `Auto extra task ${nextTaskId} for event ${ev.id}`,
        assignedTo: ((nextTaskId - 1) % organizers.length) + 1,
        priority: (['Low', 'Medium', 'High', 'Critical'] as Priority[])[nextTaskId % 4],
        deadline: isoDateOffset(base, ((ev.id + k) % 10) + 1, 17),
        status: ['Not Started', 'In Progress', 'Completed'][nextTaskId % 3] as any,
        comments: [`Auto-generated extra task ${nextTaskId}`],
        createdAt: isoDateOffset(base, -randInt(1, 5), 9, randInt(0, 59)),
        updatedAt: isoDateOffset(base, randInt(0, 3), 10, randInt(0, 59))
      };
      tasks.push(t);
      ev.tasks.push(t.id);
      nextTaskId++;
    }
  }

  const expenseCats: ExpenseCategory[] = ['Venue', 'Decoration', 'Food', 'Music', 'Transport', 'Miscellaneous'];
  let nextExpenseId = 1;
  for (const ev of events) {
    const numExpenses = randInt(1, 6);
    for (let x = 0; x < numExpenses; x++) {
      const amount = parseFloat((randInt(50, 2000) + Math.random()).toFixed(2));
      const ex: Expense = {
        id: nextExpenseId,
        eventId: ev.id,
        name: `Expense ${nextExpenseId} for Event ${ev.id}`,
        amount,
        category: expenseCats[nextExpenseId % expenseCats.length],
        date: isoDateOffset(base, (ev.id % 30) + x, 12, randInt(0, 59)),
        notes: nextExpenseId % 5 === 0 ? 'Auto-generated note' : undefined
      };
      expenses.push(ex);
      ev.expenses.push(ex.id);
      nextExpenseId++;
    }
  }

  const completedEventIds = events.filter(e => e.status === 'Completed').map(e => e.id);
  if (completedEventIds.length === 0) {
    for (let i = 0; i < 5 && i < events.length; i++) {
      events[i].status = 'Completed';
      completedEventIds.push(events[i].id);
    }
  }

  let nextFeedbackId = 1;
  for (const ev of events.filter(e => e.status === 'Completed')) {

    const guestIdsForEvent = ev.guests ?? [];
    for (const guestId of guestIdsForEvent) {
      const giveFeedback = Math.random() < 0.6; // 60% chance
      if (!giveFeedback) continue;

      const rating = randInt(1, 5);
      const comment = rating >= 4 ? `Great event ${ev.id}` : `Could improve event ${ev.id}`;
      const fb: Feedback = {
        id: nextFeedbackId,
        guestId,
        eventId: ev.id,
        rating,
        comment,
        createdAt: isoDateOffset(base, (ev.id % 10) + 3, 18, randInt(0, 59))
      };
      feedbacks.push(fb);
      ev.feedbacks.push(fb.id);

      const guestObj = guests.find(g => g.id === guestId);
      if (guestObj) guestObj.feedbackId = fb.id;

      nextFeedbackId++;
    }
  }

  events.forEach(ev => {
    ev.guestCount = ev.guests.length;
    if (ev.guestCount > 300) ev.guestCount = 300;
  });

  // Save to localStorage
  localStorage.setItem('organizers', JSON.stringify(organizers));
  localStorage.setItem('admins', JSON.stringify(admins));
  localStorage.setItem('guests', JSON.stringify(guests));
  localStorage.setItem('events', JSON.stringify(events));
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
  const snapshot = { organizers, admins, guests, events, tasks, expenses, feedbacks, generatedAt: new Date().toISOString() };
  return snapshot;
}
