const express = require('express');
const router = express.Router();
const CalendarController = require('../app/controllers/CalendarController');
const { isAuthenticated } = require('../middleware/authConfig');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get calendar events with filters
router.get('/events', CalendarController.getEvents);

// Create a new calendar event
router.post('/events', CalendarController.createEvent);

// Update a calendar event
router.put('/events/:id', CalendarController.updateEvent);

// Delete a calendar event
router.delete('/events/:id', CalendarController.deleteEvent);

// Get upcoming events
router.get('/events/upcoming', CalendarController.getUpcomingEvents);

// Get events by month for calendar view
router.get('/events/month', CalendarController.getEventsByMonth);

// Get event details by ID
router.get('/events/:id', CalendarController.getEventById);

module.exports = router;