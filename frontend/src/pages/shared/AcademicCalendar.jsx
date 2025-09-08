import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { calendarService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Search,
  Clock,
  MapPin,
  Users,
  BookOpen,
  GraduationCap,
  Bell,
  Edit,
  Trash2,
  Eye,
  X
} from 'lucide-react';

const AcademicCalendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get current month/year for API calls
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Fetch calendar events
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['calendarEvents', user?.id, currentMonth, currentYear, filterType],
    queryFn: () => calendarService.getEvents(user?.id, {
      month: currentMonth,
      year: currentYear,
      type: filterType !== 'all' ? filterType : undefined
    }),
    enabled: !!user?.id,
    select: (response) => response.data.data
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (eventData) => calendarService.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendarEvents']);
      setShowCreateModal(false);
    }
  });

  // Update event mutation  
  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, eventData }) => calendarService.updateEvent(eventId, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendarEvents']);
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (eventId) => calendarService.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendarEvents']);
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading calendar events. Please try again later.
      </div>
    );
  }

  const { events = [] } = eventsData || {};

  // Filter events based on search term
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'exam':
        return GraduationCap;
      case 'class':
        return BookOpen;
      case 'meeting':
        return Users;
      case 'deadline':
        return Clock;
      case 'announcement':
        return Bell;
      default:
        return Calendar;
    }
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case 'exam':
        return 'bg-red-500';
      case 'class':
        return 'bg-blue-500';
      case 'meeting':
        return 'bg-green-500';
      case 'deadline':
        return 'bg-yellow-500';
      case 'announcement':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start_date).toDateString();
      return eventDate === dateStr;
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const today = new Date();
  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const EventModal = ({ event, onClose, onEdit, onDelete }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          {event.description && (
            <p className="text-gray-600">{event.description}</p>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              {new Date(event.start_date).toLocaleDateString()} 
              {event.end_date && event.start_date !== event.end_date && 
                ` - ${new Date(event.end_date).toLocaleDateString()}`}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              {new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              {event.end_date && 
                ` - ${new Date(event.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
            </span>
          </div>
          
          {event.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full text-white ${getEventTypeColor(event.event_type)}`}>
              {event.event_type}
            </span>
          </div>
        </div>
        
        {(user?.user_type === 'teacher' || user?.user_type === 'admin') && (
          <div className="flex items-center space-x-2 mt-6">
            <button
              onClick={() => onEdit(event)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => onDelete(event.event_id)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const CalendarGrid = () => {
    const days = getDaysInMonth(currentDate);
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 bg-gray-50">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentDay = isToday(date);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-b border-r border-gray-200 ${
                  isCurrentDay ? 'bg-blue-50' : date ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'
                }`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => {
                        const EventIcon = getEventTypeIcon(event.event_type);
                        return (
                          <div
                            key={event.event_id}
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowEventModal(true);
                            }}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 text-white ${getEventTypeColor(event.event_type)}`}
                          >
                            <div className="flex items-center">
                              <EventIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{event.title}</span>
                            </div>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Academic Calendar
            </h1>
            <p className="text-gray-600">View and manage academic events and schedules</p>
          </div>
          {(user?.user_type === 'teacher' || user?.user_type === 'admin') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </button>
          )}
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Date Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Today
              </button>
            </div>

            {/* Filters and Search */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search events..."
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Events</option>
                <option value="exam">Exams</option>
                <option value="class">Classes</option>
                <option value="meeting">Meetings</option>
                <option value="deadline">Deadlines</option>
                <option value="announcement">Announcements</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                  <dd className="text-lg font-medium text-gray-900">{events.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Exams</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {events.filter(e => e.event_type === 'exam').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Classes</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {events.filter(e => e.event_type === 'class').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Deadlines</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {events.filter(e => e.event_type === 'deadline').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <CalendarGrid />

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onEdit={(event) => {
            // TODO: Implement edit modal
            console.log('Edit event:', event);
          }}
          onDelete={(eventId) => {
            deleteEventMutation.mutate(eventId);
          }}
        />
      )}
    </div>
  );
};

export default AcademicCalendar;