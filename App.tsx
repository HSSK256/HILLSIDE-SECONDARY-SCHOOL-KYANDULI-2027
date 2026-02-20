
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import MarksEntry from './pages/MarksEntry';
import Attendance from './pages/Attendance';
import Insights from './pages/Insights';
import TeachersPortal from './pages/TeachersPortal';
import SubjectManagement from './pages/SubjectManagement';
import StaffManagement from './pages/StaffManagement';
import ReportCards from './pages/ReportCards';
import ParentPortal from './pages/ParentPortal';
import UNEBManagement from './pages/UNEBManagement';
import FinancialRecords from './pages/FinancialRecords';
import FeeStructurePage from './pages/FeeStructure';
import Announcements from './pages/Announcements';
import StudentPortal from './pages/StudentPortal';
import ClassTimetable from './pages/ClassTimetable';
import ExaminationPortal from './pages/ExaminationPortal';
import AccessControl from './pages/AccessControl';
import { LandingPage } from './pages/LandingPage';
import Admissions from './pages/Admissions'; 
import Contact from './pages/Contact'; 
import { SchoolLogo } from './components/SchoolLogo';
import Clock from './components/Clock';
import Notifications from './components/Notifications';
import { useNotifications } from './hooks/useNotifications';

import WeeklyReports from './pages/WeeklyReports';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Overview', icon: '📊', roles: [UserRole.ADMIN] },
  { path: '/my-performance', label: 'My Results', icon: '📈', roles: [UserRole.STUDENT] },
  { path: '/parents', label: 'Parent Home', icon: '🏠', roles: [UserRole.PARENT] },
  { path: '/weekly-reports', label: 'Weekly Reports', icon: '📅', roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT] },
  { path: '/timetable', label: 'Class Timetables', icon: '📅', roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT] },
  { path: '/exams', label: 'Exams Portal', icon: '📝', roles: [UserRole.ADMIN, UserRole.TEACHER] },
  { path: '/students', label: 'Students', icon: '🎓', roles: [UserRole.ADMIN, UserRole.TEACHER] },
  { path: '/staff', label: 'Staff Room', icon: '💼', roles: [UserRole.ADMIN] },
  { path: '/finance', label: 'Bursar', icon: '💰', roles: [UserRole.ADMIN, UserRole.PARENT] },
  { path: '/fees-config', label: 'Fee Structures', icon: '🏛️', roles: [UserRole.ADMIN] },
  { path: '/subjects', label: 'Curriculum', icon: '📚', roles: [UserRole.ADMIN, UserRole.TEACHER] },
  { path: '/teachers', label: 'My Schedule', icon: '⌚', roles: [UserRole.TEACHER, UserRole.ADMIN] },
  { path: '/uneb', label: 'UNEB Exams', icon: '🏅', roles: [UserRole.ADMIN] },
  { path: '/marks', label: 'Gradebook', icon: '✅', roles: [UserRole.ADMIN, UserRole.TEACHER] },
  { path: '/reports', label: 'Report Cards', icon: '📜', roles: [UserRole.ADMIN, UserRole.PARENT, UserRole.TEACHER] },
  { path: '/attendance', label: 'Attendance', icon: '📋', roles: [UserRole.ADMIN, UserRole.TEACHER] },
  { path: '/insights', label: 'AI Tutor', icon: '✨', roles: [UserRole.ADMIN] },
  { path: '/access-control', label: 'Access Control', icon: '🔐', roles: [UserRole.ADMIN] },
];

const RoleGate = ({ 
  user, 
  allowedRoles, 
  children 
}: React.PropsWithChildren<{ 
  user: User; 
  allowedRoles: UserRole[]; 
}>) => {
  if (!allowedRoles.includes(user.role)) {
    let redirectPath = "/dashboard";
    if (user.role === UserRole.PARENT) redirectPath = "/parents";
    if (user.role === UserRole.STUDENT) redirectPath = "/my-performance";
    if (user.role === UserRole.TEACHER) redirectPath = "/teachers";
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
};

const SidebarContent = ({ user, onItemClick }: { user: User, onItemClick?: () => void }) => {
  const location = useLocation();
  const role = user.role;
  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex flex-col h-full text-slate-300 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header - Centered Logo Top */}
        <div className="flex flex-col items-center gap-4 mb-6 px-4 pt-8 text-center">
          <SchoolLogo className="w-24 h-24" />
          <div>
            <h1 className="text-xl font-bold text-white leading-tight tracking-tight">Hillside<br/><span className="text-blue-400 text-sm font-medium">Secondary School</span></h1>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="px-3 flex-1 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1.5">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onItemClick}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30' 
                      : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                  }`}
                >
                  <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                  <span className="font-bold text-sm tracking-wide">{item.label}</span>
                  {isActive && <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50 animate-pulse"></div>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="mt-4 mx-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {user.name[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Marquee Footer */}
        <div className="mt-4 py-2 bg-black/20 text-[10px] font-mono text-slate-500 overflow-hidden relative flex">
          <div className="animate-marquee shrink-0 whitespace-nowrap px-4">
             Hillside Secondary School-kyanduli • Our school motto is seek pearls and dive below • Developer dajames.ug256pro • +256780151137 •
          </div>
          <div className="animate-marquee shrink-0 whitespace-nowrap px-4">
             Hillside Secondary School-kyanduli • Our school motto is seek pearls and dive below • Developer dajames.ug256pro • +256780151137 •
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = ({ user, onLogout, onMenuToggle }: { user: User; onLogout: () => void; onMenuToggle: () => void }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markAsRead } = useNotifications(user.role);

  return (
  <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 print:hidden">
    <div className="flex items-center gap-4">
      <button onClick={onMenuToggle} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="hidden md:flex items-center gap-3 text-slate-500 text-sm font-medium">
         <span>Academic Year 2024</span>
         <span className="text-slate-300">|</span>
         <Clock />
      </div>
    </div>
        <div className="flex items-center gap-4">
      <button 
        onClick={() => setShowNotifications(s => !s)}
        className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>
      <button 
        onClick={onLogout}
        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
      >
        <span>🚪</span> Sign Out
      </button>
      {showNotifications && 
        <Notifications 
          notifications={notifications} 
          onClose={() => setShowNotifications(false)} 
          onMarkAsRead={markAsRead} 
        />
      }
    </div>
  </header>
  );
};

const AuthenticatedApp: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col font-sans">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 min-h-screen p-4 hidden md:block print:hidden shadow-xl z-30">
          <SidebarContent user={user} />
        </div>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden print:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 p-4 shadow-xl">
              <SidebarContent user={user} onItemClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <Header user={user} onLogout={onLogout} onMenuToggle={() => setIsMobileMenuOpen(true)} />
          <main className="p-6 overflow-y-auto max-w-7xl mx-auto w-full flex-1">
            <Routes>
              <Route path="/dashboard" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN]}>
                  <Dashboard />
                </RoleGate>
              } />
              <Route path="/my-performance" element={
                <RoleGate user={user} allowedRoles={[UserRole.STUDENT]}>
                  <StudentPortal currentUser={user} />
                </RoleGate>
              } />
              <Route path="/parents" element={
                <RoleGate user={user} allowedRoles={[UserRole.PARENT]}>
                  <ParentPortal currentUser={user} />
                </RoleGate>
              } />
              <Route path="/timetable" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT]}>
                  <ClassTimetable />
                </RoleGate>
              } />
              <Route path="/weekly-reports" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT]}>
                  <WeeklyReports currentUser={user} />
                </RoleGate>
              } />
              <Route path="/exams" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}>
                  <ExaminationPortal currentUser={user} />
                </RoleGate>
              } />
              <Route path="/students" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}>
                  <StudentManagement role={user.role} />
                </RoleGate>
              } />
              <Route path="/staff" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN]}>
                  <StaffManagement role={user.role} />
                </RoleGate>
              } />
              <Route path="/finance" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN, UserRole.PARENT]}>
                  <FinancialRecords role={user.role} currentUser={user} />
                </RoleGate>
              } />
              <Route path="/fees-config" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN]}>
                  <FeeStructurePage role={user.role} />
                </RoleGate>
              } />
              <Route path="/subjects" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}>
                  <SubjectManagement role={user.role} />
                </RoleGate>
              } />
              <Route path="/teachers" element={
                <RoleGate user={user} allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}>
                  <TeachersPortal role={user.role} currentUser={user} />
                </RoleGate>
              } />
              <Route path="/uneb" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN]}>
                  <UNEBManagement role={user.role} />
                </RoleGate>
              } />
              <Route path="/marks" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}>
                  <MarksEntry role={user.role} />
                </RoleGate>
              } />
              <Route path="/reports" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN, UserRole.PARENT, UserRole.TEACHER]}>
                  <ReportCards currentUser={user} />
                </RoleGate>
              } />
              <Route path="/attendance" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}>
                  <Attendance />
                </RoleGate>
              } />
              <Route path="/insights" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN]}>
                  <Insights />
                </RoleGate>
              } />
              <Route path="/access-control" element={
                <RoleGate user={user} allowedRoles={[UserRole.ADMIN]}>
                  <AccessControl />
                </RoleGate>
              } />
              <Route path="/announcements" element={<Announcements currentUser={user} />} />
              <Route path="*" element={<Navigate to={user.role === UserRole.STUDENT ? "/my-performance" : (user.role === UserRole.PARENT ? "/parents" : (user.role === UserRole.TEACHER ? "/teachers" : "/dashboard"))} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const getDashboardPath = (role?: UserRole) => {
    switch(role) {
      case UserRole.STUDENT: return "/my-performance";
      case UserRole.PARENT: return "/parents";
      case UserRole.TEACHER: return "/teachers";
      default: return "/dashboard";
    }
  };

  return (
    <HashRouter>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Login Page - Redirects if already logged in */}
        <Route path="/login" element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <Login onLogin={handleLogin} />} />
        
        {/* Protected Portal Routes */}
        <Route path="/*" element={
          user ? (
            <AuthenticatedApp user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
