import { useEffect, useDeferredValue, useState, startTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlarmClock,
  ArrowUpRight,
  BadgeIndianRupee,
  BellDot,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  LogOut,
  Menu,
  Megaphone,
  MonitorSmartphone,
  MoonStar,
  NotebookPen,
  Plus,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  SunMedium,
  TrendingUp,
  Upload,
  UserCircle2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  navigationGroups,
  OverviewSection,
  TeachersSection,
  StudentsSection,
  ClassroomsSection,
  FinanceSection,
  AttendanceSection,
  AcademicsSection,
  NoticesSection,
  ReportsSection,
  AnalyticsSection,
  SettingsSection,
} from "./components/sections";
import {
  AppCard,
  AvatarBlock,
  Badge,
  GradientButton,
  IconButton,
  Modal,
  NotificationBell,
} from "./components/ui";
import {
  addActivity,
  buildMonthlyFinanceSeries,
  createId,
  createStudentId,
  createTeacherId,
  getSession,
  getTheme,
  loadERPData,
  saveERPData,
  saveTheme,
  todayMeta,
} from "./lib/erp-store";
import {
  calculateAverage,
  clamp,
  formatCurrency,
  formatShortDate,
  initialsFromName,
} from "./lib/formatters";

const initialTeacherForm = {
  id: "",
  name: "",
  subject: "",
  salary: "",
  phone: "",
  email: "",
  joiningDate: "",
  password: "",
  photoName: "",
  workload: "20",
  leaveBalance: "4",
};

const initialClassroomForm = {
  id: "",
  name: "",
  roomName: "",
  capacity: "50",
  classTeacherId: "",
  academicYear: "2026-27",
};

const initialStudentForm = {
  name: "",
  className: "",
  rollNo: "",
  password: "",
  parentName: "",
  parentPhone: "",
  totalFees: "",
  dueDate: todayMeta.todayIso,
  remarks: "",
};

const initialPaymentForm = {
  studentId: "",
  amount: "",
  date: todayMeta.todayIso,
  note: "",
};

const initialAcademicForm = {
  title: "",
  type: "Exam",
  date: todayMeta.todayIso,
  audience: "",
};

const initialNoticeForm = {
  title: "",
  audience: "All Classes",
  priority: "info",
  message: "",
};

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createToast(message, tone = "info") {
  return { id: createId("toast"), message, tone };
}

function getNextClassName(className) {
  const value = String(className || "");
  const numberMatch = value.match(/(\d+)/);
  if (!numberMatch) return "";
  const currentNumber = Number(numberMatch[1]);
  if (currentNumber >= 10) return "";
  const suffixMatch = value.match(/-([A-Za-z0-9]+)$/);
  const suffix = suffixMatch ? `-${suffixMatch[1]}` : "";
  return `Class ${currentNumber + 1}${suffix}`;
}

function renderStudentProfile(student) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
          <AvatarBlock
            name={student.name}
            subtitle={`${student.className} • ${student.rollNo}`}
            meta={`${student.parentName || "Parent not added"} • ${student.id}`}
            accent={student.performanceAverage >= 85 ? "emerald" : "indigo"}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={student.performanceAverage >= 85 ? "success" : "info"}>
              Performance {student.performanceAverage}%
            </Badge>
            <Badge tone={student.attendancePercent >= 90 ? "success" : "warning"}>
              Attendance {student.attendancePercent}%
            </Badge>
            <Badge tone={student.pendingFees > 0 ? "warning" : "success"}>
              {student.pendingFees > 0 ? "Fee Pending" : "Fees Cleared"}
            </Badge>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Parent Details</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>Parent: {student.parentName || "Not added"}</p>
            <p>Phone: {student.parentPhone || "Not added"}</p>
            <p>Remarks: {student.remarks || "No remarks added yet."}</p>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Performance Analytics</h4>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {student.performance.map((item) => (
              <div key={item.subject} className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                <p className="text-sm text-slate-400">{item.subject}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.score}%</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Fee History</h4>
          <div className="mt-4 space-y-3">
            {(student.feeHistory || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-slate-950/30 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{formatCurrency(item.amount)}</p>
                  <p className="text-sm text-slate-400">{item.note}</p>
                </div>
                <Badge tone="success">{formatShortDate(item.date)}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderTeacherProfile(teacher) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
          <AvatarBlock
            name={teacher.name}
            subtitle={`${teacher.subject} • ${teacher.id}`}
            meta={`${teacher.classTeacherOf || "Class teacher not assigned"} • ${teacher.email || "No email"}`}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={teacher.salaryPaid ? "success" : "warning"}>
              {teacher.salaryPaid ? "Salary Paid" : "Salary Pending"}
            </Badge>
            <Badge tone={teacher.attendancePercent >= 92 ? "success" : "warning"}>
              Attendance {teacher.attendancePercent}%
            </Badge>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 text-sm text-slate-300">
          <p>Phone: {teacher.phone || "Not added"}</p>
          <p className="mt-2">Email: {teacher.email || "Not added"}</p>
          <p className="mt-2">Joining Date: {teacher.joiningDate || "Not added"}</p>
          <p className="mt-2">Workload: {teacher.workload} hours/week</p>
          <p className="mt-2">Leave Balance: {teacher.leaveBalance} days</p>
        </div>
      </div>
      <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
        <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Salary Payment History</h4>
        <div className="mt-4 space-y-3">
          {(teacher.salaryHistory || []).length ? (
            teacher.salaryHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-slate-950/30 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{formatCurrency(entry.amount)}</p>
                  <p className="text-sm text-slate-400">{entry.note || "Salary update"}</p>
                </div>
                <Badge tone={entry.status === "paid" ? "success" : "warning"}>
                  {formatShortDate(entry.date)}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No salary history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [data, setData] = useState(() => loadERPData());
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [theme, setTheme] = useState(() => getTheme());
  const [globalSearch, setGlobalSearch] = useState("");
  const [teacherFilters, setTeacherFilters] = useState({
    query: "",
    className: "all",
    salaryStatus: "all",
  });
  const [studentFilters, setStudentFilters] = useState({
    query: "",
    className: "all",
    attendance: "all",
    feeStatus: "all",
  });
  const [teacherForm, setTeacherForm] = useState(initialTeacherForm);
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [classroomForm, setClassroomForm] = useState(initialClassroomForm);
  const [classManagerForm, setClassManagerForm] = useState({
    selectedClass: "",
    renamedClassName: "",
    nextClassName: "",
  });
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [academicForm, setAcademicForm] = useState(initialAcademicForm);
  const [noticeForm, setNoticeForm] = useState(initialNoticeForm);
  const [toasts, setToasts] = useState([]);
  const [modalState, setModalState] = useState({ open: false, type: "", payload: null });
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

  const deferredGlobalSearch = useDeferredValue(globalSearch);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") {
      window.location.href = "./login.html?role=admin";
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!toasts.length) return undefined;
    const timeout = setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 2800);
    return () => clearTimeout(timeout);
  }, [toasts]);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const queueToast = (message, tone = "info") => {
    setToasts((current) => [...current, createToast(message, tone)].slice(-3));
  };

  const updateERPData = (mutator, toast) => {
    setData((current) => {
      const next = structuredClone(current);
      mutator(next);
      saveERPData(next);
      return next;
    });
    if (toast) queueToast(toast.message, toast.tone);
  };

  const logout = () => {
    sessionStorage.removeItem("sbhs-portal-session-v1");
    window.location.href = "./login.html?role=admin";
  };

  const switchSection = (sectionId) => {
    startTransition(() => {
      setActiveSection(sectionId);
      setMobileNavOpen(false);
    });
  };

  const classes = Array.from(
    new Set([
      ...data.classrooms.map((classroom) => classroom.name),
      ...data.students.map((student) => student.className),
    ].filter(Boolean))
  ).sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

  useEffect(() => {
    if (!classes.length) return;
    setClassManagerForm((current) => {
      const fallbackClass = classes.includes(current.selectedClass) ? current.selectedClass : classes[0];
      const nextState = {
        selectedClass: fallbackClass,
        renamedClassName:
          current.selectedClass === fallbackClass && current.renamedClassName
            ? current.renamedClassName
            : fallbackClass,
        nextClassName:
          current.selectedClass === fallbackClass && current.nextClassName
            ? current.nextClassName
            : getNextClassName(fallbackClass),
      };

      if (
        current.selectedClass === nextState.selectedClass &&
        current.renamedClassName === nextState.renamedClassName &&
        current.nextClassName === nextState.nextClassName
      ) {
        return current;
      }

      return nextState;
    });
  }, [classes]);

  const filteredTeachers = data.teachers
    .filter((teacher) => {
      const matchesQuery =
        !teacherFilters.query ||
        [teacher.name, teacher.subject, teacher.id].some((value) =>
          String(value).toLowerCase().includes(teacherFilters.query.toLowerCase())
        );
      const matchesClass =
        teacherFilters.className === "all" || teacher.classTeacherOf === teacherFilters.className;
      const matchesSalary =
        teacherFilters.salaryStatus === "all" ||
        (teacherFilters.salaryStatus === "paid" && teacher.salaryPaid) ||
        (teacherFilters.salaryStatus === "pending" && !teacher.salaryPaid);
      return matchesQuery && matchesClass && matchesSalary;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredStudents = data.students
    .filter((student) => {
      const matchesQuery =
        !studentFilters.query ||
        [student.name, student.rollNo, student.id].some((value) =>
          String(value).toLowerCase().includes(studentFilters.query.toLowerCase())
        );
      const matchesClass =
        studentFilters.className === "all" || student.className === studentFilters.className;
      const matchesAttendance =
        studentFilters.attendance === "all" ||
        (studentFilters.attendance === "healthy" && student.attendancePercent >= 90) ||
        (studentFilters.attendance === "warning" && student.attendancePercent < 90);
      const matchesFee =
        studentFilters.feeStatus === "all" ||
        (studentFilters.feeStatus === "paid" && student.pendingFees === 0) ||
        (studentFilters.feeStatus === "pending" && student.pendingFees > 0);
      return matchesQuery && matchesClass && matchesAttendance && matchesFee;
    })
    .sort((a, b) => b.performanceAverage - a.performanceAverage);

  const monthlySeries = buildMonthlyFinanceSeries(data);
  const totalRevenue = data.payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pendingFeeAmount = data.students.reduce((sum, student) => sum + Number(student.pendingFees || 0), 0);
  const averageAttendance = calculateAverage(data.students, (student) => student.attendancePercent);
  const teacherAttendanceAverage = calculateAverage(data.teachers, (teacher) => teacher.attendancePercent);
  const activeClasses = classes.length;
  const topTeacher = data.teachers.slice().sort((a, b) => b.attendancePercent - a.attendancePercent)[0];

  const overviewMetrics = [
    {
      icon: Users,
      label: "Total Students",
      value: data.students.length,
      trend: "↑ 8% admissions",
      tone: "info",
      sparkline: [20, 24, 18, 30, 28, 36, 40],
    },
    {
      icon: UserCircle2,
      label: "Total Teachers",
      value: data.teachers.length,
      trend: "Stable workforce",
      tone: "neutral",
      sparkline: [18, 20, 19, 22, 24, 22, 24],
    },
    {
      icon: BadgeIndianRupee,
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      trend: "↑ 12% this month",
      tone: "success",
      sparkline: [12, 16, 20, 22, 24, 28, 34],
    },
    {
      icon: Wallet,
      label: "Pending Fees",
      value: formatCurrency(pendingFeeAmount),
      trend: `${data.students.filter((item) => item.pendingFees > 0).length} students pending`,
      tone: "warning",
      sparkline: [34, 30, 28, 22, 20, 18, 16],
    },
    {
      icon: ClipboardCheck,
      label: "Attendance",
      value: `${averageAttendance}%`,
      trend: "↑ 5% this week",
      tone: "success",
      sparkline: [18, 22, 24, 26, 30, 32, 36],
    },
    {
      icon: BookOpen,
      label: "Exams This Week",
      value: data.events.filter((event) => event.type === "Exam").length,
      trend: "Academic review live",
      tone: "info",
      sparkline: [12, 14, 16, 14, 18, 20, 24],
    },
    {
      icon: Activity,
      label: "Active Classes",
      value: activeClasses,
      trend: "All sections synced",
      tone: "neutral",
      sparkline: [12, 14, 14, 16, 18, 18, 20],
    },
    {
      icon: Megaphone,
      label: "Notices Sent",
      value: data.notices.length,
      trend: "Communications healthy",
      tone: "warning",
      sparkline: [10, 11, 14, 16, 18, 19, 22],
    },
  ];

  const teacherMetrics = [
    {
      icon: UserCircle2,
      label: "Total Teachers",
      value: data.teachers.length,
      trend: `${filteredTeachers.length} visible now`,
      tone: "info",
      sparkline: [16, 18, 22, 20, 24, 25, 28],
    },
    {
      icon: Receipt,
      label: "Salary Paid",
      value: data.teachers.filter((teacher) => teacher.salaryPaid).length,
      trend: "Payroll cleared",
      tone: "success",
      sparkline: [14, 16, 18, 22, 24, 28, 32],
    },
    {
      icon: AlarmClock,
      label: "Salary Pending",
      value: data.teachers.filter((teacher) => !teacher.salaryPaid).length,
      trend: "Follow-up required",
      tone: "warning",
      sparkline: [28, 26, 24, 22, 20, 18, 16],
    },
    {
      icon: Activity,
      label: "Avg Attendance",
      value: `${teacherAttendanceAverage}%`,
      trend: `${topTeacher ? topTeacher.name : "No teacher"} leading`,
      tone: "success",
      sparkline: [18, 20, 22, 26, 28, 30, 34],
    },
  ];

  const financeMetrics = [
    {
      icon: BadgeIndianRupee,
      label: "Collected Revenue",
      value: formatCurrency(totalRevenue),
      trend: "Collections healthy",
      tone: "success",
      sparkline: [14, 16, 20, 26, 30, 34, 38],
    },
    {
      icon: Wallet,
      label: "Pending Fee Amount",
      value: formatCurrency(pendingFeeAmount),
      trend: "Reminder queue active",
      tone: "warning",
      sparkline: [38, 34, 30, 26, 22, 20, 18],
    },
    {
      icon: Receipt,
      label: "Fine Collected",
      value: formatCurrency(data.students.reduce((sum, student) => sum + student.fine, 0)),
      trend: "Auto fine enabled",
      tone: "danger",
      sparkline: [4, 6, 8, 10, 12, 16, 18],
    },
    {
      icon: TrendingUp,
      label: "Forecast",
      value: formatCurrency(Math.round(totalRevenue * 1.18)),
      trend: "Projected next cycle",
      tone: "info",
      sparkline: [10, 14, 20, 24, 30, 36, 42],
    },
  ];

  const attendanceCards = [
    { label: "Student Average", value: `${averageAttendance}%`, helper: "overall attendance score", icon: ClipboardCheck, tone: "success" },
    { label: "Teacher Average", value: `${teacherAttendanceAverage}%`, helper: "staff attendance score", icon: UserCircle2, tone: "info" },
    { label: "Warning Classes", value: classes.filter((className) => calculateAverage(data.students.filter((student) => student.className === className), (student) => student.attendancePercent) < 90).length, helper: "need admin follow-up", icon: BellDot, tone: "warning" },
  ];

  const academicCards = [
    { label: "Upcoming Exams", value: data.events.filter((event) => event.type === "Exam").length, helper: "scheduled this cycle", icon: BookOpen, tone: "info" },
    { label: "Homework Live", value: data.homework.length, helper: "teacher uploads available", icon: NotebookPen, tone: "success" },
    { label: "Resources", value: data.resources.length, helper: "notes and papers uploaded", icon: Upload, tone: "neutral" },
    { label: "Class Performance", value: `${calculateAverage(data.students, (student) => student.performanceAverage)}%`, helper: "current academic average", icon: TrendingUp, tone: "warning" },
  ];

  const studentSummary = {
    topPerformers: data.students.filter((student) => student.performanceAverage >= 85).length,
    lowAttendance: data.students.filter((student) => student.attendancePercent < 90).length,
    pendingFees: data.students.filter((student) => student.pendingFees > 0).length,
  };

  const reportCards = [
    { id: "salary", icon: Receipt, title: "Salary Report", description: "Printable salary report for audit and finance handoff." },
    { id: "attendance", icon: ClipboardCheck, title: "Attendance Export", description: "CSV export of teacher and student attendance snapshots." },
    { id: "students", icon: Users, title: "Student Summary PDF", description: "Export a clean student list with fees and performance flags." },
  ];

  const classDistribution = classes.map((className) => ({
    className,
    students: data.students.filter((student) => student.className === className).length,
  }));
  const classroomSummary = data.classrooms
    .map((classroom) => {
      const students = data.students.filter((student) => student.className === classroom.name);
      const classTeacher = data.teachers.find((teacher) => teacher.id === classroom.classTeacherId);
      return {
        id: classroom.id,
        name: classroom.name,
        roomName: classroom.roomName,
        academicYear: classroom.academicYear,
        capacity: Number(classroom.capacity || 50),
        classTeacherId: classroom.classTeacherId || "",
        classTeacherName: classTeacher?.name || "",
        students: students.length,
        pendingFees: students.filter((student) => student.pendingFees > 0).length,
        attendance: calculateAverage(students, (student) => student.attendancePercent),
        performance: calculateAverage(students, (student) => student.performanceAverage),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));

  const classHeatmap = classes.map((className, index) => {
    const classStudents = data.students.filter((student) => student.className === className);
    const attendance = calculateAverage(classStudents, (student) => student.attendancePercent);
    return {
      className,
      students: classStudents.length,
      attendance,
      alert:
        attendance >= 92
          ? "Attendance is healthy for this class."
          : attendance >= 85
            ? "Needs mid-week attendance follow-up."
            : "Critical attendance watchlist triggered.",
      week: Array.from({ length: 7 }, (_, dayIndex) => clamp(attendance - 4 + index + dayIndex, 72, 99)),
    };
  });

  const paymentFormState = {
    ...paymentForm,
    studentOptions: [
      { value: "", label: "Select Student" },
      ...data.students.map((student) => ({
        value: student.id,
        label: `${student.name} • ${student.className} • ${student.rollNo}`,
      })),
    ],
  };

  const teacherFilterMeta = {
    ...teacherFilters,
    classOptions: data.classrooms.map((classroom) => classroom.name),
    pendingAlerts:
      data.teachers.filter((teacher) => !teacher.salaryPaid).length +
      data.teachers.filter((teacher) => teacher.attendancePercent < 90).length,
    averageWorkload: calculateAverage(data.teachers, (teacher) => teacher.workload),
    topTeacher: topTeacher ? `${topTeacher.name} • ${topTeacher.attendancePercent}%` : "No teacher",
  };

  const studentFilterMeta = {
    ...studentFilters,
    classOptions: classes,
  };

  const classroomTeacherOptions = [
    { value: "", label: "Select class teacher later" },
    ...data.teachers.map((teacher) => ({
      value: teacher.id,
      label: `${teacher.name} • ${teacher.subject} • ${teacher.id}`,
    })),
  ];

  const filteredActivities = deferredGlobalSearch
    ? data.activities.filter((activityItem) =>
        `${activityItem.title} ${activityItem.subtitle}`.toLowerCase().includes(deferredGlobalSearch.toLowerCase())
      )
    : data.activities;

  const quickActions = [
    { id: "add-student", icon: Plus, title: "Add Student", description: "Open the student operations center and create a new account." },
    { id: "add-teacher", icon: UserCircle2, title: "Add Teacher", description: "Create teacher access, salary setup, and staff profile." },
    { id: "publish-notice", icon: BellDot, title: "Publish Notice", description: "Send a school-wide update with priority tagging." },
    { id: "record-payment", icon: BadgeIndianRupee, title: "Record Payment", description: "Capture fee collections and update pending balances." },
    { id: "upload-result", icon: BookOpen, title: "Upload Result", description: "Jump to academics and schedule a result workflow." },
    { id: "export-report", icon: Receipt, title: "Export Report", description: "Generate salary, attendance, or student export deliverables." },
  ];

  const adminRestrictedMobile = viewportWidth < 1100;

  const openSalaryReport = () => {
    const reportWindow = window.open("", "_blank", "width=960,height=720");
    if (!reportWindow) return;
    reportWindow.document.write(`
      <html>
        <head>
          <title>SBHS Teacher Salary Report</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; padding: 24px; background: #fff; color: #0f172a; }
            h1 { margin: 0 0 8px; }
            p { color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 14px; }
            th { background: #f8fafc; text-transform: uppercase; font-size: 12px; letter-spacing: 0.08em; }
          </style>
        </head>
        <body>
          <h1>SBHS Teacher Salary Report</h1>
          <p>Generated on ${todayMeta.todayReadable}</p>
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>ID</th>
                <th>Class</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              ${data.teachers
                .map(
                  (teacher) => `
                    <tr>
                      <td>${teacher.name}</td>
                      <td>${teacher.id}</td>
                      <td>${teacher.classTeacherOf}</td>
                      <td>${formatCurrency(teacher.salary)}</td>
                      <td>${teacher.salaryPaid ? "Paid" : "Pending"}</td>
                      <td>${teacher.attendancePercent}%</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.print();
    queueToast("Salary report opened for printing.", "info");
  };

  const openClassStudentReport = (className) => {
    const classStudents = data.students.filter((student) => student.className === className);
    const reportWindow = window.open("", "_blank", "width=1040,height=760");
    if (!reportWindow) return;
    reportWindow.document.write(`
      <html>
        <head>
          <title>SBHS ${className} Student Report</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; padding: 24px; background: #fff; color: #0f172a; }
            h1 { margin: 0 0 8px; }
            p { color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 14px; }
            th { background: #f8fafc; text-transform: uppercase; font-size: 12px; letter-spacing: 0.08em; }
          </style>
        </head>
        <body>
          <h1>${className} Student Report</h1>
          <p>${classStudents.length} students • Generated on ${todayMeta.todayReadable}</p>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>ID</th>
                <th>Roll No</th>
                <th>Attendance</th>
                <th>Performance</th>
                <th>Pending Fees</th>
              </tr>
            </thead>
            <tbody>
              ${
                classStudents.length
                  ? classStudents
                      .map(
                        (student) => `
                          <tr>
                            <td>${student.name}</td>
                            <td>${student.id}</td>
                            <td>${student.rollNo}</td>
                            <td>${student.attendancePercent}%</td>
                            <td>${student.performanceAverage}%</td>
                            <td>${formatCurrency(student.pendingFees)}</td>
                          </tr>
                        `
                      )
                      .join("")
                  : `<tr><td colspan="6">No students found in this class.</td></tr>`
              }
            </tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.print();
    queueToast(`${className} report opened for printing.`, "info");
  };

  const exportTeacherAttendanceCsv = () => {
    const rows = [
      ["Teacher Name", "Teacher ID", "Subject", "Class", "Attendance", "Salary Status"].join(","),
      ...data.teachers.map((teacher) =>
        [
          `"${teacher.name}"`,
          teacher.id,
          `"${teacher.subject}"`,
          `"${teacher.classTeacherOf}"`,
          teacher.attendancePercent,
          teacher.salaryPaid ? "Paid" : "Pending",
        ].join(",")
      ),
    ];
    downloadFile(rows.join("\n"), `sbhs-teacher-attendance-${todayMeta.todayIso}.csv`, "text/csv;charset=utf-8");
    queueToast("Attendance CSV downloaded.", "success");
  };

  const sectionContent = {
    overview: (
      <OverviewSection
        metrics={overviewMetrics}
        activities={filteredActivities}
        monthlySeries={monthlySeries}
        events={data.events.slice(0, 4)}
        quickActions={quickActions}
        onQuickAction={(actionId) => {
          const nextSection =
            actionId === "add-student"
              ? "students"
              : actionId === "add-teacher"
                ? "teachers"
                : actionId === "publish-notice"
                  ? "notices"
                  : actionId === "record-payment"
                    ? "finance"
                    : actionId === "upload-result"
                      ? "academics"
                      : "reports";
          switchSection(nextSection);
          queueToast("Quick action opened.", "info");
        }}
      />
    ),
    teachers: (
      <TeachersSection
        teacherMetrics={teacherMetrics}
        teacherFilters={teacherFilterMeta}
        setTeacherFilters={setTeacherFilters}
        teachers={filteredTeachers}
        teacherForm={teacherForm}
        setTeacherForm={setTeacherForm}
        onSaveTeacher={(event) => {
          event.preventDefault();
          if (!teacherForm.name || !teacherForm.subject || !teacherForm.password) {
            queueToast("Complete the teacher form first.", "warning");
            return;
          }
          updateERPData((next) => {
            if (teacherForm.id) {
              const teacher = next.teachers.find((item) => item.id === teacherForm.id);
              if (!teacher) return;
              Object.assign(teacher, {
                name: teacherForm.name,
                subject: teacherForm.subject,
                salary: Number(teacherForm.salary || 0),
                phone: teacherForm.phone,
                email: teacherForm.email,
                joiningDate: teacherForm.joiningDate,
                password: teacherForm.password,
                photoName: teacherForm.photoName,
                workload: Number(teacherForm.workload || 0),
                leaveBalance: Number(teacherForm.leaveBalance || 0),
              });
              addActivity(next, {
                type: "teacher",
                title: `${teacher.name} staff profile updated`,
                subtitle: "Teacher access, salary, or profile details were changed.",
                tone: "info",
              });
            } else {
              const newTeacherId = createTeacherId(next.teachers);
              next.teachers.unshift({
                id: newTeacherId,
                name: teacherForm.name,
                subject: teacherForm.subject,
                classTeacherOf: "",
                salary: Number(teacherForm.salary || 0),
                phone: teacherForm.phone,
                email: teacherForm.email,
                joiningDate: teacherForm.joiningDate,
                password: teacherForm.password,
                photoName: teacherForm.photoName,
                workload: Number(teacherForm.workload || 20),
                leaveBalance: Number(teacherForm.leaveBalance || 4),
                attendancePercent: 91,
                salaryPaid: false,
                todayStatus: "present",
                performanceIndex: 88,
                salaryHistory: [],
              });
              addActivity(next, {
                type: "teacher",
                title: `${teacherForm.name} teacher account created`,
                subtitle: "Teacher access is live and ready for classroom assignment.",
                tone: "success",
              });
            }
          }, createToast(teacherForm.id ? "Teacher updated." : "Teacher created.", "success"));
          setTeacherForm(initialTeacherForm);
        }}
        onEditTeacher={(teacher) =>
          setTeacherForm({
            id: teacher.id,
            name: teacher.name,
            subject: teacher.subject,
            salary: String(teacher.salary),
            phone: teacher.phone || "",
            email: teacher.email || "",
            joiningDate: teacher.joiningDate || "",
            password: teacher.password || "",
            photoName: teacher.photoName || "",
            workload: String(teacher.workload || 20),
            leaveBalance: String(teacher.leaveBalance || 4),
          })
        }
        onDeleteTeacher={(teacherId) => {
          const teacher = data.teachers.find((item) => item.id === teacherId);
          if (!teacher || !window.confirm(`Delete ${teacher.name} from the ERP staff list?`)) return;
          updateERPData((next) => {
            next.teachers = next.teachers.filter((item) => item.id !== teacherId);
            addActivity(next, {
              type: "teacher",
              title: `${teacher.name} removed from staff records`,
              subtitle: "Teacher account was deleted from the ERP.",
              tone: "danger",
            });
          }, createToast("Teacher deleted.", "danger"));
          if (teacherForm.id === teacherId) setTeacherForm(initialTeacherForm);
        }}
        onMarkPaid={(teacherId) => {
          updateERPData((next) => {
            const teacher = next.teachers.find((item) => item.id === teacherId);
            if (!teacher) return;
            teacher.salaryPaid = true;
            teacher.salaryHistory.unshift({
              id: createId("salary"),
              month: todayMeta.currentMonth,
              amount: teacher.salary,
              status: "paid",
              date: todayMeta.todayIso,
              note: "Marked paid from ERP dashboard.",
            });
            addActivity(next, {
              type: "salary",
              title: `${teacher.name} salary marked paid`,
              subtitle: "Finance cleared the salary record from the teacher dashboard.",
              tone: "success",
            });
          }, createToast("Salary marked paid.", "success"));
        }}
        onMarkPending={(teacherId) => {
          updateERPData((next) => {
            const teacher = next.teachers.find((item) => item.id === teacherId);
            if (!teacher) return;
            teacher.salaryPaid = false;
            teacher.salaryHistory.unshift({
              id: createId("salary"),
              month: todayMeta.currentMonth,
              amount: teacher.salary,
              status: "pending",
              date: todayMeta.todayIso,
              note: "Marked pending from ERP dashboard.",
            });
            addActivity(next, {
              type: "salary",
              title: `${teacher.name} salary moved to pending`,
              subtitle: "Finance flagged this salary for follow-up.",
              tone: "warning",
            });
          }, createToast("Salary moved to pending.", "warning"));
        }}
        onOpenTeacherProfile={(teacher) => setModalState({ open: true, type: "teacher-profile", payload: teacher })}
        onOpenTeacherHistory={(teacher) => setModalState({ open: true, type: "teacher-history", payload: teacher })}
        onBulkMarkPaid={() => {
          updateERPData((next) => {
            filteredTeachers.forEach((teacherItem) => {
              const teacher = next.teachers.find((item) => item.id === teacherItem.id);
              if (!teacher || teacher.salaryPaid) return;
              teacher.salaryPaid = true;
              teacher.salaryHistory.unshift({
                id: createId("salary"),
                month: todayMeta.currentMonth,
                amount: teacher.salary,
                status: "paid",
                date: todayMeta.todayIso,
                note: "Bulk salary payment from ERP dashboard.",
              });
            });
            addActivity(next, {
              type: "salary",
              title: "Bulk salary action completed",
              subtitle: `${filteredTeachers.length} filtered teacher records processed.`,
              tone: "success",
            });
          }, createToast("Filtered salary records updated.", "success"));
        }}
        onExportSalaryPdf={openSalaryReport}
        onExportAttendanceCsv={exportTeacherAttendanceCsv}
        onResetTeacherForm={() => setTeacherForm(initialTeacherForm)}
      />
    ),
    students: (
      <StudentsSection
        studentFilters={studentFilterMeta}
        setStudentFilters={setStudentFilters}
        students={filteredStudents}
        studentSummary={studentSummary}
        studentForm={studentForm}
        setStudentForm={setStudentForm}
        onSaveStudent={(event) => {
          event.preventDefault();
          if (!studentForm.name || !studentForm.className || !studentForm.rollNo || !studentForm.password) {
            queueToast("Complete the student onboarding form.", "warning");
            return;
          }
          updateERPData((next) => {
            const totalFees = Number(studentForm.totalFees || 0);
            const newStudentId = createStudentId(next.students);
            next.students.unshift({
              id: newStudentId,
              password: studentForm.password,
              name: studentForm.name,
              className: studentForm.className,
              rollNo: studentForm.rollNo,
              totalFees,
              paidFees: 0,
              pendingFees: totalFees,
              dueDate: studentForm.dueDate,
              fine: 0,
              attendancePercent: 88,
              performanceAverage: 74,
              performance: [
                { subject: "Math", score: 72 },
                { subject: "Science", score: 75 },
                { subject: "English", score: 76 },
              ],
              parentName: studentForm.parentName,
              parentPhone: studentForm.parentPhone,
              remarks: studentForm.remarks,
              feeHistory: [],
            });
            addActivity(next, {
              type: "student",
              title: "New student added",
              subtitle: `${studentForm.name} joined ${studentForm.className}.`,
              tone: "success",
            });
          }, createToast("Student created.", "success"));
          setStudentForm(initialStudentForm);
        }}
        onOpenStudent={(student) => setModalState({ open: true, type: "student", payload: student })}
        onSendBulkNotice={() => {
          switchSection("notices");
          queueToast("Jumped to notice center.", "info");
        }}
        onExportStudents={() => {
          const rows = [
            ["Student", "ID", "Class", "Roll", "Paid", "Pending", "Attendance", "Performance"].join(","),
            ...data.students.map((student) =>
              [
                `"${student.name}"`,
                student.id,
                `"${student.className}"`,
                student.rollNo,
                student.paidFees,
                student.pendingFees,
                student.attendancePercent,
                student.performanceAverage,
              ].join(",")
            ),
          ];
          downloadFile(rows.join("\n"), `sbhs-students-${todayMeta.todayIso}.csv`, "text/csv;charset=utf-8");
          queueToast("Student summary exported.", "success");
        }}
      />
    ),
    classrooms: (
      <ClassroomsSection
        classroomSummary={classroomSummary}
        classroomForm={classroomForm}
        setClassroomForm={setClassroomForm}
        classroomManagerForm={classManagerForm}
        setClassroomManagerForm={setClassManagerForm}
        teacherOptions={classroomTeacherOptions}
        onSaveClassroom={(event) => {
          event.preventDefault();
          if (!classroomForm.name) {
            queueToast("Add at least the class name to create a classroom.", "warning");
            return;
          }
          const duplicateClassroom = data.classrooms.find(
            (item) => item.name === classroomForm.name && item.id !== classroomForm.id
          );
          if (duplicateClassroom) {
            queueToast("A classroom with this name already exists.", "warning");
            return;
          }
          updateERPData((next) => {
            next.classrooms.forEach((classroom) => {
              if (classroom.classTeacherId === classroomForm.classTeacherId && classroom.id !== classroomForm.id) {
                classroom.classTeacherId = "";
              }
            });

            if (classroomForm.id) {
              const classroom = next.classrooms.find((item) => item.id === classroomForm.id);
              if (!classroom) return;
              const previousName = classroom.name;
              Object.assign(classroom, {
                name: classroomForm.name,
                roomName: classroomForm.roomName,
                capacity: Number(classroomForm.capacity || 50),
                classTeacherId: classroomForm.classTeacherId,
                academicYear: classroomForm.academicYear,
              });

              next.teachers.forEach((teacher) => {
                if (teacher.id === classroomForm.classTeacherId) {
                  teacher.classTeacherOf = classroomForm.name;
                } else if (teacher.classTeacherOf === previousName || teacher.classTeacherOf === classroomForm.name) {
                  teacher.classTeacherOf = "";
                }
              });

              if (previousName !== classroomForm.name) {
                next.students.forEach((student) => {
                  if (student.className === previousName) student.className = classroomForm.name;
                });
                next.homework.forEach((item) => {
                  if (item.className === previousName) item.className = classroomForm.name;
                });
                next.resources.forEach((item) => {
                  if (item.className === previousName) item.className = classroomForm.name;
                });
                next.attendanceLogs.forEach((entry) => {
                  if (entry.className === previousName) entry.className = classroomForm.name;
                });
                next.payments.forEach((payment) => {
                  if (payment.className === previousName) payment.className = classroomForm.name;
                });
              }

              addActivity(next, {
                type: "academic",
                title: `${classroomForm.name} classroom updated`,
                subtitle: "Classroom setup, capacity, or class teacher assignment changed.",
                tone: "info",
              });
            } else {
              next.teachers.forEach((teacher) => {
                if (teacher.id === classroomForm.classTeacherId) {
                  teacher.classTeacherOf = classroomForm.name;
                } else if (teacher.classTeacherOf === classroomForm.name) {
                  teacher.classTeacherOf = "";
                }
              });
              next.classrooms.unshift({
                id: `classroom-${Date.now()}`,
                name: classroomForm.name,
                roomName: classroomForm.roomName,
                capacity: Number(classroomForm.capacity || 50),
                classTeacherId: classroomForm.classTeacherId,
                academicYear: classroomForm.academicYear,
              });
              addActivity(next, {
                type: "academic",
                title: `${classroomForm.name} classroom created`,
                subtitle: "New classroom is available for student mapping and class teacher assignment.",
                tone: "success",
              });
            }
          }, createToast(classroomForm.id ? "Classroom updated." : "Classroom created.", "success"));
          setClassroomForm(initialClassroomForm);
        }}
        onEditClassroom={(classroom) =>
          setClassroomForm({
            id: classroom.id,
            name: classroom.name,
            roomName: classroom.roomName || "",
            capacity: String(classroom.capacity || 50),
            classTeacherId: classroom.classTeacherId || "",
            academicYear: classroom.academicYear || "2026-27",
          })
        }
        onDeleteClassroom={(classroomId) => {
          const classroom = data.classrooms.find((item) => item.id === classroomId);
          if (!classroom) return;
          const linkedStudents = data.students.filter((student) => student.className === classroom.name).length;
          if (linkedStudents > 0) {
            queueToast("Move students out of this class before deleting it.", "warning");
            return;
          }
          if (!window.confirm(`Delete ${classroom.name} classroom?`)) return;
          updateERPData((next) => {
            next.classrooms = next.classrooms.filter((item) => item.id !== classroomId);
            next.teachers.forEach((teacher) => {
              if (teacher.classTeacherOf === classroom.name) {
                teacher.classTeacherOf = "";
              }
            });
            addActivity(next, {
              type: "academic",
              title: `${classroom.name} classroom deleted`,
              subtitle: "Empty classroom was removed from the ERP registry.",
              tone: "danger",
            });
          }, createToast("Classroom deleted.", "danger"));
          if (classroomForm.id === classroomId) {
            setClassroomForm(initialClassroomForm);
          }
          if (classManagerForm.selectedClass === classroom.name) {
            setClassManagerForm({
              selectedClass: "",
              renamedClassName: "",
              nextClassName: "",
            });
          }
        }}
        onDownloadClassPdf={(className) => openClassStudentReport(className)}
        onRenameClass={(event) => {
          event.preventDefault();
          if (!classManagerForm.selectedClass || !classManagerForm.renamedClassName) {
            queueToast("Select a class and enter the updated class name.", "warning");
            return;
          }
          if (classManagerForm.selectedClass === classManagerForm.renamedClassName) {
            queueToast("The class name is already the same.", "info");
            return;
          }
          if (data.classrooms.some((classroom) => classroom.name === classManagerForm.renamedClassName)) {
            queueToast("That class name already exists. Use a different class label.", "warning");
            return;
          }
          updateERPData((next) => {
            next.classrooms.forEach((classroom) => {
              if (classroom.name === classManagerForm.selectedClass) {
                classroom.name = classManagerForm.renamedClassName;
              }
            });
            next.students.forEach((student) => {
              if (student.className === classManagerForm.selectedClass) {
                student.className = classManagerForm.renamedClassName;
              }
            });
            next.teachers.forEach((teacher) => {
              if (teacher.classTeacherOf === classManagerForm.selectedClass) {
                teacher.classTeacherOf = classManagerForm.renamedClassName;
              }
            });
            next.homework.forEach((item) => {
              if (item.className === classManagerForm.selectedClass) {
                item.className = classManagerForm.renamedClassName;
              }
            });
            next.resources.forEach((item) => {
              if (item.className === classManagerForm.selectedClass) {
                item.className = classManagerForm.renamedClassName;
              }
            });
            next.attendanceLogs.forEach((entry) => {
              if (entry.className === classManagerForm.selectedClass) {
                entry.className = classManagerForm.renamedClassName;
              }
            });
            next.payments.forEach((payment) => {
              if (payment.className === classManagerForm.selectedClass) {
                payment.className = classManagerForm.renamedClassName;
              }
            });
            addActivity(next, {
              type: "academic",
              title: `Class renamed to ${classManagerForm.renamedClassName}`,
              subtitle: `${classManagerForm.selectedClass} was updated across live ERP records.`,
              tone: "info",
            });
          }, createToast("Class name updated across ERP records.", "success"));
          setClassManagerForm((current) => ({
            ...current,
            selectedClass: current.renamedClassName,
            nextClassName: getNextClassName(current.renamedClassName),
          }));
        }}
        onPromoteClass={() => {
          if (!classManagerForm.selectedClass || !classManagerForm.nextClassName) {
            queueToast("No next class is available for promotion.", "warning");
            return;
          }
          if (data.classrooms.some((classroom) => classroom.name === classManagerForm.nextClassName)) {
            queueToast("The next class already exists. Rename or merge it manually first.", "warning");
            return;
          }
          if (!window.confirm(`Promote all students from ${classManagerForm.selectedClass} to ${classManagerForm.nextClassName}?`)) {
            return;
          }
          updateERPData((next) => {
            let promotedCount = 0;
            next.students.forEach((student) => {
              if (student.className === classManagerForm.selectedClass) {
                student.className = classManagerForm.nextClassName;
                promotedCount += 1;
              }
            });
            next.classrooms.forEach((classroom) => {
              if (classroom.name === classManagerForm.selectedClass) {
                classroom.name = classManagerForm.nextClassName;
              }
            });
            next.teachers.forEach((teacher) => {
              if (teacher.classTeacherOf === classManagerForm.selectedClass) {
                teacher.classTeacherOf = classManagerForm.nextClassName;
              }
            });
            addActivity(next, {
              type: "academic",
              title: `${classManagerForm.selectedClass} promoted to ${classManagerForm.nextClassName}`,
              subtitle: `${promotedCount} student records moved to the next class.`,
              tone: "success",
            });
          }, createToast("Students promoted to the next class.", "success"));
          setClassManagerForm((current) => ({
            ...current,
            selectedClass: current.nextClassName,
            renamedClassName: current.nextClassName,
            nextClassName: getNextClassName(current.nextClassName),
          }));
        }}
      />
    ),
    finance: (
      <FinanceSection
        monthlySeries={monthlySeries}
        financeSummary={financeMetrics}
        pendingStudents={data.students.filter((student) => student.pendingFees > 0).slice(0, 4)}
        paymentForm={paymentFormState}
        setPaymentForm={setPaymentForm}
        onRecordPayment={(event) => {
          event.preventDefault();
          if (!paymentForm.studentId || !paymentForm.amount) {
            queueToast("Select a student and enter payment amount.", "warning");
            return;
          }
          updateERPData((next) => {
            const student = next.students.find((item) => item.id === paymentForm.studentId);
            if (!student) return;
            const amount = Number(paymentForm.amount || 0);
            student.paidFees += amount;
            student.pendingFees = Math.max(0, student.pendingFees - amount);
            student.feeHistory.unshift({
              id: createId("fee"),
              date: paymentForm.date,
              amount,
              type: "fee",
              note: paymentForm.note || "ERP recorded fee payment",
            });
            next.payments.unshift({
              id: createId("payment"),
              studentId: student.id,
              studentName: student.name,
              className: student.className,
              amount,
              date: paymentForm.date,
              type: "Fee Payment",
              status: "received",
            });
            addActivity(next, {
              type: "payment",
              title: "Fee payment received",
              subtitle: `${student.name} paid ${formatCurrency(amount)}.`,
              tone: "success",
            });
          }, createToast("Payment recorded.", "success"));
          setPaymentForm(initialPaymentForm);
        }}
        onAutoFine={() => {
          updateERPData((next) => {
            next.students.forEach((student) => {
              if (student.pendingFees > 0 && student.dueDate && student.dueDate < todayMeta.todayIso) {
                student.fine += 100;
              }
            });
            addActivity(next, {
              type: "finance",
              title: "Auto fine calculator executed",
              subtitle: "Pending overdue accounts were updated with finance fines.",
              tone: "warning",
            });
          }, createToast("Auto fines applied to overdue accounts.", "warning"));
        }}
        onSendReminders={() => {
          updateERPData((next) => {
            addActivity(next, {
              type: "finance",
              title: "Fee reminder system triggered",
              subtitle: `${next.students.filter((student) => student.pendingFees > 0).length} reminders queued.`,
              tone: "info",
            });
          }, createToast("Fee reminders queued.", "info"));
        }}
      />
    ),
    attendance: <AttendanceSection attendanceCards={attendanceCards} classHeatmap={classHeatmap} />,
    academics: (
      <AcademicsSection
        academicCards={academicCards}
        events={data.events}
        academicForm={academicForm}
        setAcademicForm={setAcademicForm}
        onAddEvent={(event) => {
          event.preventDefault();
          if (!academicForm.title || !academicForm.date) {
            queueToast("Add a title and date for the academic event.", "warning");
            return;
          }
          updateERPData((next) => {
            next.events.unshift({
              id: createId("event"),
              title: academicForm.title,
              type: academicForm.type,
              date: academicForm.date,
              audience: academicForm.audience || "All Classes",
            });
            addActivity(next, {
              type: "academic",
              title: `${academicForm.title} added to academic calendar`,
              subtitle: `${academicForm.type} scheduled for ${formatShortDate(academicForm.date)}.`,
              tone: "info",
            });
          }, createToast("Academic event added.", "success"));
          setAcademicForm(initialAcademicForm);
        }}
      />
    ),
    notices: (
      <NoticesSection
        notices={data.notices}
        noticeForm={noticeForm}
        setNoticeForm={setNoticeForm}
        onPublishNotice={(event) => {
          event.preventDefault();
          if (!noticeForm.title || !noticeForm.message) {
            queueToast("Write a notice title and message first.", "warning");
            return;
          }
          updateERPData((next) => {
            next.notices.unshift({
              id: createId("notice"),
              title: noticeForm.title,
              message: noticeForm.message,
              audience: noticeForm.audience,
              priority: noticeForm.priority,
              date: todayMeta.todayReadable,
            });
            addActivity(next, {
              type: "notice",
              title: "Exam notice published",
              subtitle: `${noticeForm.title} was sent to ${noticeForm.audience}.`,
              tone: "info",
            });
          }, createToast("Notice published.", "success"));
          setNoticeForm(initialNoticeForm);
        }}
      />
    ),
    reports: (
      <ReportsSection
        reportCards={reportCards}
        onExportSalaryPdf={openSalaryReport}
        onExportAttendanceCsv={exportTeacherAttendanceCsv}
        onExportStudents={() => {
          downloadFile(JSON.stringify(data.students, null, 2), `sbhs-students-${todayMeta.todayIso}.json`, "application/json;charset=utf-8");
          queueToast("Student export downloaded.", "success");
        }}
      />
    ),
    analytics: <AnalyticsSection monthlySeries={monthlySeries} classDistribution={classDistribution} />,
    settings: (
      <SettingsSection
        settingsForm={data.settings}
        setSettingsForm={(updater) =>
          setData((current) => {
            const nextSettings =
              typeof updater === "function" ? updater(current.settings) : updater;
            const next = { ...current, settings: nextSettings };
            saveERPData(next);
            return next;
          })
        }
        onSaveSettings={(event) => {
          event.preventDefault();
          saveERPData(data);
          queueToast("System settings saved.", "success");
        }}
        onBackup={() => {
          downloadFile(JSON.stringify(data, null, 2), `sbhs-backup-${todayMeta.todayIso}.json`, "application/json;charset=utf-8");
          queueToast("Backup downloaded.", "success");
        }}
      />
    ),
  };

  if (adminRestrictedMobile) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_42%,_#0f172a_100%)] px-4 py-6 text-slate-100">
        <div className="mx-auto max-w-xl space-y-5">
          <AppCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-lg font-bold text-slate-950">
                  SB
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">SBHS Admin ERP</p>
                  <p className="text-xs text-slate-400">Desktop-first operations mode</p>
                </div>
              </div>
              <IconButton icon={LogOut} label="Logout" onClick={logout} />
            </div>
          </AppCard>

          <AppCard className="p-6">
            <Badge tone="warning">Desktop recommended</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
              This admin system is optimized for desktop use.
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Admin workflows in SBHS ERP are analytics-heavy and intentionally designed for larger screens. On smaller devices, you only get a restricted emergency view to prevent clutter and broken operations.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Students</p>
                <p className="mt-3 text-3xl font-semibold text-white">{data.students.length}</p>
                <p className="mt-2 text-sm text-slate-400">Live student accounts in the ERP.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pending Fees</p>
                <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(pendingFeeAmount)}</p>
                <p className="mt-2 text-sm text-slate-400">Finance team follow-up required.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <GradientButton onClick={() => switchSection("overview")} className="w-full">
                <Activity className="h-4 w-4" />
                View Quick Stats
              </GradientButton>
              <GradientButton variant="secondary" onClick={() => window.location.reload()} className="w-full">
                <MonitorSmartphone />
                Try Again on Larger Screen
              </GradientButton>
            </div>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/4 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Emergency Access</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-4 py-3">
                  <div>
                    <p className="font-medium text-white">Open Notices</p>
                    <p className="text-sm text-slate-400">Review urgent school announcements.</p>
                  </div>
                  <GradientButton variant="secondary" onClick={() => switchSection("notices")}>
                    Notices
                  </GradientButton>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-4 py-3">
                  <div>
                    <p className="font-medium text-white">Fee Status Snapshot</p>
                    <p className="text-sm text-slate-400">See pending fee amount and alerts only.</p>
                  </div>
                  <GradientButton variant="secondary" onClick={() => switchSection("finance")}>
                    Finance
                  </GradientButton>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_42%,_#0f172a_100%)] text-slate-100"
          : "bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#111827_48%,_#172554_100%)] text-slate-100"
      }`}
    >
      <div className="relative mx-auto grid min-h-screen max-w-[1680px] grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[280px] border-r border-white/10 bg-slate-950/88 px-4 py-5 backdrop-blur-2xl transition duration-300 xl:sticky ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
          } ${sidebarCollapsed ? "xl:w-[96px]" : ""}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-lg font-bold text-slate-950">
                SB
              </div>
              {!sidebarCollapsed ? (
                <div>
                  <p className="text-sm font-semibold text-white">SBHS ERP</p>
                  <p className="text-xs text-slate-400">Sahaj Blossom High School</p>
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <IconButton
                icon={sidebarCollapsed ? ChevronRight : ChevronLeft}
                label="Collapse sidebar"
                className="hidden xl:inline-flex"
                onClick={() => setSidebarCollapsed((value) => !value)}
              />
              <IconButton icon={X} label="Close" className="xl:hidden" onClick={() => setMobileNavOpen(false)} />
            </div>
          </div>

          <AppCard className="mt-5 p-4">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                {initialsFromName("SBHS Admin")}
              </div>
              {!sidebarCollapsed ? (
                <div>
                  <p className="font-medium text-white">SBHS Admin</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Online and operational
                  </div>
                </div>
              ) : null}
            </div>
            {!sidebarCollapsed ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/6 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Students</p>
                  <p className="mt-2 text-lg font-semibold text-white">{data.students.length}</p>
                </div>
                <div className="rounded-2xl bg-white/6 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Pending</p>
                  <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(pendingFeeAmount)}</p>
                </div>
              </div>
            ) : null}
          </AppCard>

          <div className="mt-6 space-y-6">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                {!sidebarCollapsed ? (
                  <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                    {group.title}
                  </p>
                ) : null}
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => switchSection(item.id)}
                        className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition duration-200 ${
                          active
                            ? "bg-gradient-to-r from-indigo-500/20 to-sky-400/14 text-white ring-1 ring-indigo-400/20"
                            : "text-slate-300 hover:bg-white/6 hover:text-white"
                        } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                      >
                        <span
                          className={`absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-sky-400 transition ${
                            active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                          }`}
                        />
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        {!sidebarCollapsed ? (
                          <>
                            <span className="flex-1 text-sm font-medium">{item.label}</span>
                            {item.id === "notices" ? (
                              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                                {data.notices.length}
                              </span>
                            ) : null}
                          </>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!sidebarCollapsed ? (
            <AppCard className="mt-6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">School Status</p>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-3 py-3">
                <div>
                  <p className="font-medium text-white">Session live</p>
                  <p className="text-sm text-slate-400">All systems operational</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-emerald-300" />
              </div>
            </AppCard>
          ) : null}
        </aside>

        <main className="relative min-w-0 px-4 pb-24 pt-4 sm:px-5 xl:px-6 xl:pb-10">
          <div className="sticky top-4 z-30 mb-6">
            <AppCard className="border-white/12 bg-slate-950/62 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3">
                  <IconButton icon={Menu} label="Open sidebar" className="xl:hidden" onClick={() => setMobileNavOpen(true)} />
                  <label className="flex min-w-[220px] flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200 md:min-w-[360px]">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input
                      value={globalSearch}
                      onChange={(event) => setGlobalSearch(event.target.value)}
                      placeholder="Global search across activity, students, teachers, and ERP signals"
                      className="w-full bg-transparent outline-none placeholder:text-slate-500"
                    />
                  </label>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <Badge tone="success">{data.settings.systemStatus}</Badge>
                  <GradientButton variant="secondary" onClick={() => switchSection("overview")}>
                    <Plus className="h-4 w-4" />
                    Quick Action
                  </GradientButton>
                  <NotificationBell count={data.activities.length} onClick={() => setNotificationPanelOpen((value) => !value)} />
                  <IconButton
                    icon={theme === "dark" ? SunMedium : MoonStar}
                    label="Toggle theme"
                    onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                  />
                  <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-3 py-2.5 text-sm text-slate-200 md:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-sm font-semibold text-white">
                      AD
                    </div>
                    <div>
                      <p className="font-medium text-white">SBHS Admin</p>
                      <p className="text-xs text-slate-400">Premium ERP workspace</p>
                    </div>
                  </div>
                  <IconButton icon={LogOut} label="Logout" onClick={logout} />
                </div>
              </div>

              <AnimatePresence>
                {notificationPanelOpen ? (
                  <motion.div
                    className="mt-4 grid gap-3 rounded-[24px] border border-white/10 bg-slate-950/72 p-4"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    {data.activities.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <p className="text-xs text-slate-400">{item.subtitle}</p>
                        </div>
                        <Badge tone={item.tone || "info"}>{item.time}</Badge>
                      </div>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </AppCard>
          </div>

          <div className="space-y-6">
            {sectionContent[activeSection]}
          </div>
        </main>

        <div className="fixed inset-x-4 bottom-4 z-30 xl:hidden">
          <AppCard className="border-white/10 bg-slate-950/78 px-2 py-2">
            <div className="grid grid-cols-5 gap-2">
              {navigationGroups[0].items.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => switchSection(item.id)}
                    className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition ${
                      active ? "bg-indigo-500/18 text-white" : "text-slate-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </AppCard>
        </div>

      </div>

      <Modal
        open={modalState.open}
        onClose={() => setModalState({ open: false, type: "", payload: null })}
        title={
          modalState.type === "student"
            ? modalState.payload?.name || "Student Profile"
            : modalState.payload?.name || "Teacher Profile"
        }
        subtitle={
          modalState.type === "student"
            ? "Student Profile Modal"
            : modalState.type === "teacher-history"
              ? "Teacher Salary History"
              : "Teacher Operations Modal"
        }
      >
        {modalState.type === "student" && modalState.payload ? renderStudentProfile(modalState.payload) : null}
        {(modalState.type === "teacher-profile" || modalState.type === "teacher-history") && modalState.payload
          ? renderTeacherProfile(modalState.payload)
          : null}
      </Modal>

      <div className="pointer-events-none fixed right-4 top-24 z-[60] flex w-[320px] flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className={`pointer-events-auto rounded-[24px] border px-4 py-4 text-sm shadow-[0_20px_50px_rgba(15,23,42,0.35)] backdrop-blur-xl ${
                toast.tone === "success"
                  ? "border-emerald-400/20 bg-emerald-500/12 text-emerald-100"
                  : toast.tone === "warning"
                    ? "border-amber-400/20 bg-amber-500/12 text-amber-100"
                    : toast.tone === "danger"
                      ? "border-rose-400/20 bg-rose-500/12 text-rose-100"
                      : "border-indigo-400/20 bg-indigo-500/12 text-indigo-100"
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
