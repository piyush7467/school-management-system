import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import AdminLogin from './pages/Auth/AdminLogin';
import StudentLogin from './pages/Auth/StudentLogin';
import TeacherLogin from './pages/Auth/TeacherLogin';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import Dashboard from './pages/Admin/Dashboard';
import StudentDashboard from './pages/Student/StudentDashboard';
import Admin from './pages/Admin/Admin';
import Profile from './pages/Admin/Profile';
import TeacherProfile from './pages/Teacher/TeacherProfile';
import Student from './pages/Student/Student';
import Teacher from './pages/Teacher/Teacher';
import StudentProfile from './pages/Student/StudentProfile';
import Navbar from './components/Navbar';
import Notofication from './pages/Notofication';
import Teachers from './pages/Admin/Teachers';
import Students from './pages/Admin/Students/Students';
import Classes from './pages/Admin/Classes/Classes';
import Setting from './pages/Admin/Setting';
import ProtectedRoute from './components/ProtectedRoute';
import CreateTeacher from './pages/Admin/CreateTeacher';
import ViewTeacherDetails from './pages/Admin/ViewTeacherDetails';
import EditTeacherDetails from './pages/Admin/EditTeacherDetails';
import CreateStudent from './pages/Admin/Students/CreateStudent';
import ViewStudent from './pages/Admin/Students/ViewStudent';
import EditStudent from './pages/Admin/Students/EditStudent';
import AddClass from './pages/Admin/Classes/AddClass';
import ViewClass from './pages/Admin/Classes/ViewClass';
import EditClass from './pages/Admin/Classes/EditClass';
import ManageSections from './pages/Admin/Classes/ManageSections';
import AssignTeacher from './pages/Admin/Classes/AssignTeacher';
import AddStudents from './pages/Admin/Classes/AddStudents';
import AddSubject from './pages/Admin/Classes/AddSubject';
import SectionView from './pages/Admin/Classes/SectionView';
import Subjects from './pages/Admin/Classes/Subjects';
// import StudentComplaints from './pages/Student/StudentComplaints';
import StudentAnnouncement from './pages/Student/StudentAnnouncement';
import MyTransport from './pages/Student/MyTransport';
import AdminTransportDashboard from './pages/Admin/Transports/TransportDashboard';
import StudentAssignmentPage from './pages/Admin/Transports/StudentAssignmentPage';
import StudentAttendance from './pages/Admin/Attendance/StudentAttendance';
import TeacherAttendance from './pages/Admin/Attendance/TeacherAttendance';
import AttendanceReport from './pages/Admin/Attendance/AttendanceReport';
import TeacherMarkAttendance from './pages/Teacher/Attendance/TeacherMarkAttendance';
import AssignClassTeacher from './components/AssignClassTeacher';
import ManageClassTeachers from './components/ManageClassTeachers';
import AttendanceReportTeacherSide from './pages/Teacher/Attendance/AttendanceReportTeacherSide';
import MyAttendance from './pages/Student/Attendance/MyAttendance';
import ManageStudentClass from './pages/Student/ManageStudentClass';
import AdminViewTeacherAttendance from './pages/Admin/Attendance/AdminViewTeacherAttendance';
import MyTeacherAttendance from './pages/Teacher/Attendance/MyTeacherAttendance';
import TeacherAnnouncement from './pages/Teacher/TeacherAnnouncement';
import TeacherComplaint from './pages/Teacher/TeacherComplaint';
import TeacherClassPage from './pages/Teacher/TeacherClassPage';
import ExamList from './pages/Admin/Exam/ExamList';
import SubjectExamList from './pages/Admin/Exam/SubjectExamList';
import RoomList from './pages/Admin/RoomList';
import StudentComplaint from './pages/Student/StudentComplaint';

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/teacher/login', element: <TeacherLogin /> },
  { path: '/student/login', element: <StudentLogin /> },

  // Admin protected routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="admin">
        <Admin />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> }, // default redirect
      { path: "dashboard", element: <Dashboard /> },
      { path: "profile", element: <Profile /> },
      { path: "transport", element: <AdminTransportDashboard /> },
      { path: "transport/student-assignment", element: <StudentAssignmentPage /> },

      { path: "student-attendance", element: <StudentAttendance /> },
      { path: "student-attendance/attendance-report", element: <AttendanceReport /> },

      { path: "teacher-attendance", element: <TeacherAttendance /> },
      { path: "teacher-attendance/report", element: <AdminViewTeacherAttendance /> },


      { path: "teachers", element: <Teachers /> },
      { path: "teacher/create", element: <CreateTeacher /> },
      { path: "teacher/view/:id", element: <ViewTeacherDetails /> },
      { path: "teacher/edit/:id", element: <EditTeacherDetails /> },
      { path: "teachers/assign-class-teacher", element: <AssignClassTeacher /> },
      { path: "teachers/manage-class-teacher", element: <ManageClassTeachers /> },


      { path: "students", element: <Students /> },
      { path: "student/create", element: <CreateStudent /> },
      { path: "student/view/:id", element: <ViewStudent /> },
      { path: "student/edit/:id", element: <EditStudent /> },

      { path: "class", element: <Classes /> },
      { path: "class/create", element: <AddClass /> },
      { path: "class/view/:id", element: <ViewClass /> },
      { path: "class/edit/:id", element: <EditClass /> },

      { path: 'subjects', element: <Subjects /> },

      // { path: 'subjects', element: <Subjects /> },
      { path: "class/:id/section/:sectionId/subjects", element: <AddSubject /> }, // add students to section

      // New workflow routes
      { path: "class/:id/sections", element: <ManageSections /> }, // manage sections for a class

      { path: "class/:id/section/:sectionId/teachers", element: <AssignTeacher /> }, // assign teacher to section
      { path: "class/:id/section/:sectionId/students", element: <AddStudents /> }, // add students to section
      { path: "class/:id/section/:sectionId/view", element: <SectionView /> }, // add students to section

      { path: 'rooms', element: <RoomList /> },
      { path: 'exams', element: <ExamList /> },
      { path: 'exams/:examId/manage-exam', element: <SubjectExamList /> },


      { path: "settings", element: <Setting /> },
    ],
  },



  // Teacher protected routes
  {
    path: '/teacher',
    element: <ProtectedRoute role="teacher"><Teacher /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <TeacherDashboard /> },
      { path: 'profile', element: <TeacherProfile /> },
      { path: 'attendance', element: <TeacherMarkAttendance /> },
      { path: "attendance-report", element: <AttendanceReportTeacherSide /> },
      { path: "my-attendance", element: <MyTeacherAttendance /> },
      { path: 'announcements', element: <TeacherAnnouncement /> },
      { path: 'complaints', element: <TeacherComplaint /> },
      { path: 'classes', element: <TeacherClassPage /> },

    ],
  },

  // Student protected routes
  {
    path: '/student',
    element: <ProtectedRoute role="student"><Student /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },// redirect to student dashboard
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'profile', element: <StudentProfile /> },
      { path: 'announcements', element: <StudentAnnouncement /> },
      { path: 'complaints', element: <StudentComplaint /> },
      { path: 'transport', element: <MyTransport /> },
      { path: 'my-attendance', element: <MyAttendance /> },
      { path: 'classes', element: <ManageStudentClass /> },
    ],
  },

  // Notifications route (accessible by any logged-in user)
  {
    path: '/:role/notifications',
    element: (
      <ProtectedRoute role={null}>
        <>
          <Navbar />
          <Notofication />
        </>
      </ProtectedRoute>
    ),
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
