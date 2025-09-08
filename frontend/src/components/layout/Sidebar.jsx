import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Upload 
} from 'lucide-react';

const Sidebar = ({ userRole }) => {
  const location = useLocation();

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Calendar, label: 'Calendar', path: '/calendar' },
      { icon: FileText, label: 'Files', path: '/files' },
    ];

    const studentItems = [
      { icon: BookOpen, label: 'Courses', path: '/courses' },
      { icon: GraduationCap, label: 'Exams', path: '/exams' },
      { icon: BarChart3, label: 'Grades', path: '/grades' },
    ];

    const teacherItems = [
      { icon: BookOpen, label: 'My Classes', path: '/teacher/classes' },
      { icon: BarChart3, label: 'Grades', path: '/teacher/grades' },
      { icon: GraduationCap, label: 'Exams', path: '/teacher/exams' },
      { icon: Users, label: 'Student Analytics', path: '/teacher/analytics' },
      { icon: Upload, label: 'File Management', path: '/teacher/files' },
    ];

    const adminItems = [
      { icon: Users, label: 'User Management', path: '/admin/users' },
      { icon: BookOpen, label: 'Course Management', path: '/admin/courses' },
      { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
      { icon: Settings, label: 'System Settings', path: '/admin/settings' },
    ];

    if (userRole === 'teacher') {
      return [...baseItems, ...teacherItems];
    } else if (userRole === 'admin') {
      return [...baseItems, ...adminItems];
    } else {
      return [...baseItems, ...studentItems];
    }
  };

  const menuItems = getMenuItems();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;