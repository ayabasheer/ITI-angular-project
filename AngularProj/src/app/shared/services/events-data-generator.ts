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

/**
 * Updated generator:
 * - 100 organizers
 * - 100 admins
 * - 250 events (each created by exactly one organizer)
 *   * Each organizer creates a random number of events between 1 and 5 (sum equals 250)
 * - 600 guests distributed across events (round-robin)
 * - Exactly 50 tasks (distributed across events)
 * - Exactly 50 expenses (distributed across events)
 * - Feedbacks generated only for guests of Completed events; attempt to create 600 feedbacks (may reuse guests cyclically if needed)
 *
 * The rest of the structure and persistence to localStorage is preserved.
 */
export async function generateAndSaveAllWithImages() {
  const base = new Date('2025-10-11T09:00:00Z');

  // Counts (as requested)
  const NUM_ORGANIZERS = 100;
  const NUM_ADMINS = 100;
  const NUM_EVENTS = 300;
  const NUM_GUESTS = 300;
  const NUM_TASKS =4;
  const NUM_EXPENSES =6;
  const NUM_FEEDBACKS = 300;

  const organizers: Organizer[] = [];
  const guests: Guest[] = [];
  const admins: Admin[] = [];
  const events: EventModel[] = [];
  const tasks: Task[] = [];
  const expenses: Expense[] = [];
  const feedbacks: Feedback[] = [];

  const loadedImages = await loadAndStoreLocalImages({ count: 8, folderPath: 'assets/event-images' });

  // --- Organizers ---
  for (let i = 1; i <= NUM_ORGANIZERS; i++) {
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
  for (let i = 1; i <= NUM_ADMINS; i++) {
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

  // Determine how many events each organizer will create (1..5) while summing to NUM_EVENTS
  const minPerOrganizer = 1;
  const maxPerOrganizer = 5;
  // start by giving each organizer the minimum
  const organizerEventCounts: number[] = Array(NUM_ORGANIZERS).fill(minPerOrganizer);
  let assigned = NUM_ORGANIZERS * minPerOrganizer; // currently assigned events
  let remaining = NUM_EVENTS - assigned;

  // Distribute remaining events randomly but never exceed maxPerOrganizer
  const organizerIndices = Array.from({ length: NUM_ORGANIZERS }, (_, i) => i);
  while (remaining > 0) {
    // shuffle indices for fairness
    for (let idx = organizerIndices.length - 1; idx > 0; idx--) {
      const j = Math.floor(Math.random() * (idx + 1));
      [organizerIndices[idx], organizerIndices[j]] = [organizerIndices[j], organizerIndices[idx]];
    }
    let progress = false;
    for (const idx of organizerIndices) {
      if (remaining <= 0) break;
      if (organizerEventCounts[idx] < maxPerOrganizer) {
        organizerEventCounts[idx]++;
        remaining--;
        progress = true;
      }
    }
    // if no progress (all reached max), break to avoid infinite loop
    if (!progress) break;
  }

  // If still remaining due to inability to distribute (shouldn't happen), cap distribution evenly from start
  if (remaining > 0) {
    // force-distribute additional events ignoring max (rare fallback)
    let idx = 0;
    while (remaining > 0) {
      organizerEventCounts[idx % NUM_ORGANIZERS]++;
      idx++;
      remaining--;
    }
  }

  // Create events using organizerEventCounts
  let nextEventId = 1;
  for (let orgIdx = 0; orgIdx < NUM_ORGANIZERS; orgIdx++) {
    const countForOrganizer = organizerEventCounts[orgIdx];
    const creatorId = orgIdx + 1;
    for (let e = 0; e < countForOrganizer; e++) {
      if (nextEventId > NUM_EVENTS) break;
      const i = nextEventId;
      const startDays = i;
      const durationDays = randInt(0, 2);
      const start = isoDateOffset(base, startDays, 9 + (i % 6));
      const end = isoDateOffset(base, startDays + durationDays, 17);
      const category = categoryList[i % categoryList.length];

      // Set status probabilistically but ensure a decent number of Completed events (approx 30-40%)
      let status: EventStatus;
      const r = Math.random();
      if (r < 0.35) status = 'Completed';
      else if (r < 0.65) status = 'Upcoming';
      else if (r < 0.9) status = 'InProgress';
      else status = 'Cancelled';

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
        guestCount: 0,
        guests: [],
        tasks: [],
        expenses: [],
        feedbacks: [],
        status,
        budget: 500 + i * 50,
        createdAt: isoDateOffset(base, Math.floor(i / 10) * -1, 8, randInt(0, 59)),
        updatedAt: isoDateOffset(base, Math.floor(i / 5), 10, randInt(0, 59))
      });

      nextEventId++;
    }
  }

  // Safety: if for any reason we didn't reach NUM_EVENTS, create remaining events assigned to random organizers
  while (events.length < NUM_EVENTS) {
    const i = events.length + 1;
    const creatorId = ((i - 1) % organizers.length) + 1;
    const startDays = i;
    const durationDays = randInt(0, 2);
    const start = isoDateOffset(base, startDays, 9 + (i % 6));
    const end = isoDateOffset(base, startDays + durationDays, 17);
    const category = categoryList[i % categoryList.length];
    const r = Math.random();
    const status: EventStatus = r < 0.35 ? 'Completed' : (r < 0.7 ? 'Upcoming' : 'InProgress');

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
      guestCount: 0,
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

  // --- TASKS: exactly NUM_TASKS ---
  for (let i = 1; i <= NUM_TASKS; i++) {
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

  // --- EXPENSES: exactly NUM_EXPENSES, distributed across events round-robin ---
  const expenseCats: ExpenseCategory[] = ['Venue', 'Decoration', 'Food', 'Music', 'Transport', 'Miscellaneous'];
  let nextExpenseId = 1;
  for (let i = 1; i <= NUM_EXPENSES; i++) {
    const eventId = ((i - 1) % events.length) + 1;
    const amount = parseFloat((randInt(50, 2000) + Math.random()).toFixed(2));
    const ex: Expense = {
      id: nextExpenseId,
      eventId,
      name: `Expense ${nextExpenseId} for Event ${eventId}`,
      amount,
      category: expenseCats[nextExpenseId % expenseCats.length],
      date: isoDateOffset(base, (eventId % 30) + (i % 5), 12, randInt(0, 59)),
      notes: nextExpenseId % 5 === 0 ? 'Auto-generated note' : undefined
    };
    expenses.push(ex);
    const ev = events.find(e => e.id === eventId);
    if (ev) ev.expenses.push(ex.id);
    nextExpenseId++;
  }

  // --- GUESTS: exactly NUM_GUESTS, distribute round-robin across events ---
  const statusOpts: GuestStatus[] = ['Invited', 'Accepted', 'Declined', 'Pending'];
  let nextGuestId = 1;
  for (let i = 1; i <= NUM_GUESTS; i++) {
    const eventId = ((i - 1) % events.length) + 1;
    const guest: Guest = {
      id: nextGuestId,
      name: `Guest ${nextGuestId}`,
      email: `guest${nextGuestId}@example.com`,
      password: makeDemoPassword('Guest', nextGuestId),
      phone: `+20111${900000 + nextGuestId}`,
      status: statusOpts[nextGuestId % statusOpts.length],
      feedbackId: null,
      role: 'Guest',
      eventId,
      createdAt: isoDateOffset(base, -randInt(1, 20), 9, randInt(0, 59))
    };
    guests.push(guest);
    const ev = events.find(e => e.id === eventId);
    if (ev) ev.guests.push(guest.id);
    nextGuestId++;
  }

  // Ensure events.guestCount reflects actual guests
  events.forEach(ev => {
    ev.guestCount = ev.guests.length;
    if (ev.guestCount > 300) ev.guestCount = 300;
  });

  // --- FEEDBACKS: only for guests of Completed events; try to create NUM_FEEDBACKS entries ---
  const completedEventIds = events.filter(e => e.status === 'Completed').map(e => e.id);

  // Ensure there are enough completed events to attach feedbacks. If too few, mark some events Completed.
  if (completedEventIds.length < Math.max(10, Math.floor(events.length * 0.25))) {
    // mark additional events as Completed until we have approx 25% completed
    for (let i = 0; i < events.length && events.filter(e => e.status === 'Completed').length < Math.floor(events.length * 0.25); i++) {
      if (events[i].status !== 'Completed') {
        events[i].status = 'Completed';
      }
    }
  }

  // Recompute completedEventIds and eligible guests
  const updatedCompletedEventIds = events.filter(e => e.status === 'Completed').map(e => e.id);
  let eligibleGuests = guests.filter(g => updatedCompletedEventIds.includes(g.eventId));

  // If eligibleGuests is empty (unlikely), fallback to first N guests
  if (eligibleGuests.length === 0) {
    eligibleGuests = guests.slice(0, Math.min(10, guests.length));
  }

  let nextFeedbackId = 1;
  // We may need to assign multiple feedbacks per guest if eligibleGuests.length < NUM_FEEDBACKS
  let fCount = 0;
  while (fCount < NUM_FEEDBACKS) {
    const guest = eligibleGuests[fCount % eligibleGuests.length];
    const ev = events.find(e => e.id === guest.eventId);
    if (!ev || ev.status !== 'Completed') {
      // skip and continue (shouldn't happen often)
      fCount++;
      continue;
    }

    const giveFeedbackProb = 0.85; // high chance, but we are forcing total count to NUM_FEEDBACKS
    // If we want to respect probability and still reach NUM_FEEDBACKS, we can ignore the prob when cycling.
    const rating = randInt(1, 5);
    const comment = rating >= 4 ? `Great event ${guest.eventId}` : `Could improve event ${guest.eventId}`;
    const fb: Feedback = {
      id: nextFeedbackId,
      guestId: guest.id,
      eventId: guest.eventId,
      rating,
      comment,
      createdAt: isoDateOffset(base, (guest.eventId % 10) + 3, 18, randInt(0, 59))
    };

    feedbacks.push(fb);
    ev.feedbacks.push(fb.id);
    if (!guest.feedbackId) guest.feedbackId = fb.id;

    nextFeedbackId++;
    fCount++;
  }

  // Final consistency: update each event.guestCount (again) and clamp
  events.forEach(ev => {
    ev.guestCount = ev.guests.length;
    if (ev.guestCount > 300) ev.guestCount = 300;
  });

  // Save to localStorage (preserve previous keys and structure)
  localStorage.setItem('organizers', JSON.stringify(organizers));
  localStorage.setItem('admins', JSON.stringify(admins));
  localStorage.setItem('guests', JSON.stringify(guests));
  localStorage.setItem('events', JSON.stringify(events));
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

  const snapshot = {
    organizers,
    admins,
    guests,
    events,
    tasks,
    expenses,
    feedbacks,
    generatedAt: new Date().toISOString()
  };
  return snapshot;
}
