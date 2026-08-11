import { mockEvents } from './mockEvents';

export const mockStats = {
  totalEvents: mockEvents.length,
  upcomingEvents: mockEvents.filter(e => new Date(e.date) >= new Date()).length,
  totalRegistrations: 1247,
  pendingPayments: 23
};
