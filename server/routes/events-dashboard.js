import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id/dashboard', authenticateToken, (req, res) => {
  const eventId = req.params.id;

  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    db.all('SELECT * FROM registrations WHERE event_id = ? ORDER BY created_at DESC', [eventId], (err, registrations) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      const totalRegistrations = registrations.length;
      const capacity = event.capacity || 0;
      const capacityUtilization = capacity > 0 ? Math.round((totalRegistrations / capacity) * 100) : 0;
      const isFullyBooked = capacity > 0 && totalRegistrations >= capacity;

      const completedCount = registrations.filter(r => r.paymentStatus === 'completed').length;
      const pendingCount = registrations.filter(r => r.paymentStatus === 'pending').length;
      const failedCount = registrations.filter(r => r.paymentStatus === 'failed').length;

      const totalRevenue = registrations
        .filter(r => r.paymentStatus === 'completed')
        .reduce((sum, r) => sum + (parseFloat(r.paymentAmount) || 0), 0);

      const paymentMethods = {};
      registrations.forEach(r => {
        if (r.paymentMethod) {
          paymentMethods[r.paymentMethod] = (paymentMethods[r.paymentMethod] || 0) + 1;
        }
      });

      const colleges = {};
      registrations.forEach(r => {
        if (r.college) {
          colleges[r.college] = (colleges[r.college] || 0) + 1;
        }
      });

      const departments = {};
      registrations.forEach(r => {
        if (r.departments) {
          r.departments.split(',').forEach(dept => {
            const trimmed = dept.trim();
            if (trimmed) {
              departments[trimmed] = (departments[trimmed] || 0) + 1;
            }
          });
        }
      });

      const participationTypes = {};
      registrations.forEach(r => {
        if (r.participationType) {
          participationTypes[r.participationType] = (participationTypes[r.participationType] || 0) + 1;
        }
      });

      const analytics = {
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          category: event.category,
          capacity: capacity,
          description: event.description,
          image_url: event.image_url,
        },
        summary: {
          totalRegistrations,
          capacity,
          capacityUtilization,
          isFullyBooked,
          completedCount,
          pendingCount,
          failedCount,
          completionRate: totalRegistrations > 0 ? Math.round((completedCount / totalRegistrations) * 100) : 0,
          totalRevenue,
          averageRegistrationAmount: completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0,
        },
        paymentMethods,
        colleges,
        departments,
        participationTypes,
        registrations,
      };

      res.json(analytics);
    });
  });
});

router.get('/:id/export', authenticateToken, (req, res) => {
  const eventId = req.params.id;
  const format = req.query.format || 'csv';

  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    db.all('SELECT * FROM registrations WHERE event_id = ? ORDER BY created_at DESC', [eventId], (err, registrations) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (format === 'csv') {
        const headers = [
          'Registration ID',
          'Name',
          'College',
          'Departments',
          'Participation Type',
          'No. of Events',
          'Team Members',
          'Date',
          'Payment Amount',
          'Payment Status',
          'Payment Method',
          'Transaction ID',
          'Registered At',
        ];

        const escapeCSV = (value) => {
          if (value === null || value === undefined) return '';
          const str = String(value);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        const rows = registrations.map((reg) => [
          `GX-${String(reg.id).padStart(6, '0')}`,
          escapeCSV(reg.name),
          escapeCSV(reg.college),
          escapeCSV(reg.departments),
          escapeCSV(reg.participationType),
          escapeCSV(reg.noOfEvents),
          escapeCSV(reg.teamMembers),
          escapeCSV(reg.date),
          reg.paymentAmount || 0,
          reg.paymentStatus,
          escapeCSV(reg.paymentMethod),
          escapeCSV(reg.transactionId),
          escapeCSV(reg.created_at),
        ]);

        const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="event_${eventId}_${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.csv"`);
        res.send(csvContent);
      } else if (format === 'json') {
        const exportData = {
          event: {
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            category: event.category,
            capacity: event.capacity,
          },
          exportDate: new Date().toISOString(),
          totalRegistrations: registrations.length,
          registrations: registrations.map((reg) => ({
            registrationId: `GX-${String(reg.id).padStart(6, '0')}`,
            name: reg.name,
            college: reg.college,
            departments: reg.departments,
            participationType: reg.participationType,
            noOfEvents: reg.noOfEvents,
            teamMembers: reg.teamMembers,
            date: reg.date,
            paymentAmount: reg.paymentAmount,
            paymentStatus: reg.paymentStatus,
            paymentMethod: reg.paymentMethod,
            transactionId: reg.transactionId,
            registeredAt: reg.created_at,
          })),
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="event_${eventId}_${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json"`);
        res.json(exportData);
      } else {
        res.status(400).json({ message: 'Unsupported export format. Use csv or json.' });
      }
    });
  });
});

export default router;
