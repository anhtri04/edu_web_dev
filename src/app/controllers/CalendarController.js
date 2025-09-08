const { CalendarEvent, Class } = require('../models');
const { Op } = require('sequelize');

class CalendarController {
  // Get calendar events for a user or class
  static async getEvents(req, res) {
    try {
      const { user_id, user_type, class_id, start_date, end_date, event_type } = req.query;
      
      let whereClause = {};
      
      // Filter by date range if provided
      if (start_date && end_date) {
        whereClause[Op.or] = [
          {
            start_date: {
              [Op.between]: [start_date, end_date]
            }
          },
          {
            end_date: {
              [Op.between]: [start_date, end_date]
            }
          },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: start_date } },
              { end_date: { [Op.gte]: end_date } }
            ]
          }
        ];
      }
      
      // Filter by class if provided
      if (class_id) {
        whereClause.class_id = class_id;
      }
      
      // Filter by event type if provided
      if (event_type) {
        whereClause.event_type = event_type;
      }
      
      // Filter by creator if user-specific events are requested
      if (user_id && user_type) {
        whereClause[Op.or] = [
          { created_by: user_id, creator_type: user_type },
          { class_id: { [Op.ne]: null } } // Include class events
        ];
      }
      
      const events = await CalendarEvent.findAll({
        where: whereClause,
        include: [
          {
            model: Class,
            attributes: ['class_id', 'class_name', 'semester']
          }
        ],
        order: [['start_date', 'ASC']]
      });
      
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch calendar events',
        error: error.message
      });
    }
  }

  // Create a new calendar event
  static async createEvent(req, res) {
    try {
      const {
        title,
        description,
        start_date,
        end_date,
        event_type,
        class_id,
        created_by,
        creator_type,
        is_all_day = false,
        location,
        color = '#3498db',
        is_recurring = false,
        recurrence_pattern
      } = req.body;

      const event = await CalendarEvent.create({
        title,
        description,
        start_date,
        end_date,
        event_type,
        class_id,
        created_by,
        creator_type,
        is_all_day,
        location,
        color,
        is_recurring,
        recurrence_pattern
      });

      res.status(201).json({
        success: true,
        message: 'Calendar event created successfully',
        data: event
      });
    } catch (error) {
      console.error('Error creating calendar event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create calendar event',
        error: error.message
      });
    }
  }

  // Update a calendar event
  static async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const event = await CalendarEvent.findByPk(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Calendar event not found'
        });
      }

      await event.update({
        ...updateData,
        updated_at: new Date()
      });

      res.json({
        success: true,
        message: 'Calendar event updated successfully',
        data: event
      });
    } catch (error) {
      console.error('Error updating calendar event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update calendar event',
        error: error.message
      });
    }
  }

  // Delete a calendar event
  static async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      
      const event = await CalendarEvent.findByPk(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Calendar event not found'
        });
      }

      await event.destroy();

      res.json({
        success: true,
        message: 'Calendar event deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete calendar event',
        error: error.message
      });
    }
  }

  // Get upcoming events for a user
  static async getUpcomingEvents(req, res) {
    try {
      const { user_id, user_type, days = 7 } = req.query;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + parseInt(days));

      const events = await CalendarEvent.findAll({
        where: {
          start_date: {
            [Op.between]: [startDate, endDate]
          },
          [Op.or]: [
            { created_by: user_id, creator_type: user_type },
            { class_id: { [Op.ne]: null } }
          ]
        },
        include: [
          {
            model: Class,
            attributes: ['class_id', 'class_name', 'semester']
          }
        ],
        order: [['start_date', 'ASC']],
        limit: 10
      });

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch upcoming events',
        error: error.message
      });
    }
  }

  // Get events by month for calendar view
  static async getEventsByMonth(req, res) {
    try {
      const { year, month, user_id, user_type } = req.query;
      
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      const events = await CalendarEvent.findAll({
        where: {
          [Op.or]: [
            {
              start_date: {
                [Op.between]: [startOfMonth, endOfMonth]
              }
            },
            {
              end_date: {
                [Op.between]: [startOfMonth, endOfMonth]
              }
            }
          ],
          [Op.or]: [
            { created_by: user_id, creator_type: user_type },
            { class_id: { [Op.ne]: null } }
          ]
        },
        include: [
          {
            model: Class,
            attributes: ['class_id', 'class_name', 'semester']
          }
        ],
        order: [['start_date', 'ASC']]
      });

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error fetching monthly events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch monthly events',
        error: error.message
      });
    }
  }

  // Get event details by ID
  static async getEventById(req, res) {
    try {
      const { id } = req.params;
      
      const event = await CalendarEvent.findByPk(id, {
        include: [
          {
            model: Class,
            attributes: ['class_id', 'class_name', 'semester', 'teacher_id']
          }
        ]
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Calendar event not found'
        });
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Error fetching event details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event details',
        error: error.message
      });
    }
  }
}

module.exports = CalendarController;