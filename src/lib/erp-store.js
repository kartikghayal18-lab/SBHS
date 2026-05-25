import { calculateAverage } from "./formatters";

export const STORAGE_KEY = "sbhs-portal-data-v1";
export const SESSION_KEY = "sbhs-portal-session-v1";
export const THEME_KEY = "sbhs-erp-theme-v1";

const currentDate = new Date();
const currentMonth = currentDate.toISOString().slice(0, 7);
const todayIso = currentDate.toISOString().slice(0, 10);
const todayReadable = currentDate.toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const createClassroomIdFromName = (name) =>
  `classroom-${String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

const createSeedData = () => ({
  admins: [{ id: "admin", password: "admin123", name: "SBHS Admin" }],
  teachers: [
    {
      id: "SBHS-T001",
      password: "teach123",
      name: "Priya Sharma",
      subject: "Mathematics",
      classTeacherOf: "Class 7-A",
      salary: 28000,
      attendancePercent: 96,
      salaryPaid: true,
      phone: "+91 9876543210",
      email: "priya.sharma@sbhs.edu",
      joiningDate: "2024-06-10",
      todayStatus: "present",
      workload: 24,
      performanceIndex: 92,
      leaveBalance: 6,
      salaryHistory: [
        {
          id: "sal-seed-001",
          month: currentMonth,
          amount: 28000,
          status: "paid",
          date: todayIso,
          note: "Monthly salary cleared.",
        },
      ],
    },
    {
      id: "SBHS-T002",
      password: "teach456",
      name: "Amol Shinde",
      subject: "Hindi",
      classTeacherOf: "Class 10-A",
      salary: 29000,
      attendancePercent: 89,
      salaryPaid: false,
      phone: "+91 9988776655",
      email: "amol.shinde@sbhs.edu",
      joiningDate: "2023-08-12",
      todayStatus: "late",
      workload: 20,
      performanceIndex: 84,
      leaveBalance: 4,
      salaryHistory: [],
    },
  ],
  classrooms: [
    {
      id: createClassroomIdFromName("Class 7-A"),
      name: "Class 7-A",
      roomName: "Room 207",
      capacity: 50,
      classTeacherId: "SBHS-T001",
      academicYear: "2026-27",
    },
    {
      id: createClassroomIdFromName("Class 10-A"),
      name: "Class 10-A",
      roomName: "Room 410",
      capacity: 50,
      classTeacherId: "SBHS-T002",
      academicYear: "2026-27",
    },
  ],
  students: [
    {
      id: "SBHS-S001",
      password: "stud123",
      name: "Aarav Singh",
      className: "Class 7-A",
      rollNo: "07A-12",
      totalFees: 18000,
      paidFees: 14500,
      pendingFees: 3500,
      dueDate: "2026-05-20",
      fine: 250,
      attendancePercent: 94,
      performanceAverage: 82,
      performance: [
        { subject: "Math", score: 86 },
        { subject: "Science", score: 80 },
        { subject: "English", score: 84 },
      ],
      parentName: "Rajesh Singh",
      parentPhone: "+91 9000000001",
      remarks: "Consistent performer in mathematics.",
      feeHistory: [
        {
          id: "fee-1",
          date: "2026-04-12",
          amount: 14500,
          type: "fee",
          note: "Quarterly fee payment",
        },
      ],
    },
    {
      id: "SBHS-S002",
      password: "stud234",
      name: "Ananya Das",
      className: "Class 7-A",
      rollNo: "07A-14",
      totalFees: 18000,
      paidFees: 18000,
      pendingFees: 0,
      dueDate: "2026-05-18",
      fine: 0,
      attendancePercent: 97,
      performanceAverage: 88,
      performance: [
        { subject: "Math", score: 90 },
        { subject: "Science", score: 86 },
        { subject: "English", score: 88 },
      ],
      parentName: "Sudipta Das",
      parentPhone: "+91 9000000002",
      remarks: "Top performer in science.",
      feeHistory: [
        {
          id: "fee-2",
          date: "2026-04-08",
          amount: 18000,
          type: "fee",
          note: "Full payment completed",
        },
      ],
    },
    {
      id: "SBHS-S003",
      password: "stud345",
      name: "Prasad Kulkarni",
      className: "Class 10-A",
      rollNo: "10A-03",
      totalFees: 18500,
      paidFees: 5000,
      pendingFees: 13500,
      dueDate: "2026-05-25",
      fine: 0,
      attendancePercent: 88,
      performanceAverage: 75,
      performance: [
        { subject: "Math", score: 74 },
        { subject: "Science", score: 76 },
        { subject: "English", score: 75 },
      ],
      parentName: "Madhavi Kulkarni",
      parentPhone: "+91 9000000003",
      remarks: "Needs exam preparation support.",
      feeHistory: [
        {
          id: "fee-3",
          date: "2026-04-19",
          amount: 5000,
          type: "fee",
          note: "Partial fee payment",
        },
      ],
    },
  ],
  notices: [
    {
      id: "notice-1",
      title: "Unit Test Schedule",
      message: "Unit tests begin from 20 May for classes 1st to 10th.",
      date: todayReadable,
      audience: "All Classes",
      priority: "warning",
    },
  ],
  homework: [
    {
      id: "hw-1",
      className: "Class 7-A",
      teacherId: "SBHS-T001",
      title: "Algebra Practice",
      description: "Solve exercise 4 and 5 from the mathematics notebook.",
      date: todayReadable,
    },
  ],
  resources: [
    {
      id: "res-1",
      type: "notes",
      className: "Class 7-A",
      teacherId: "SBHS-T001",
      title: "Fractions Notes",
      description: "Revision notes for fractions and decimals.",
      date: todayReadable,
    },
  ],
  attendanceLogs: [],
  payments: [
    {
      id: "pay-1",
      studentId: "SBHS-S001",
      studentName: "Aarav Singh",
      className: "Class 7-A",
      amount: 14500,
      date: "2026-04-12",
      type: "Fee Payment",
      status: "received",
    },
    {
      id: "pay-2",
      studentId: "SBHS-S002",
      studentName: "Ananya Das",
      className: "Class 7-A",
      amount: 18000,
      date: "2026-04-08",
      type: "Fee Payment",
      status: "received",
    },
  ],
  activities: [
    {
      id: "activity-1",
      type: "salary",
      title: "Priya Sharma salary marked paid",
      subtitle: "Finance cleared the monthly salary record.",
      time: `${todayReadable}, 09:10`,
      tone: "success",
    },
    {
      id: "activity-2",
      type: "student",
      title: "New student added",
      subtitle: "Prasad Kulkarni account created for Class 10-A.",
      time: `${todayReadable}, 08:25`,
      tone: "info",
    },
    {
      id: "activity-3",
      type: "attendance",
      title: "2 teachers flagged for follow-up",
      subtitle: "Attendance is below ideal threshold today.",
      time: `${todayReadable}, 08:00`,
      tone: "warning",
    },
  ],
  events: [
    {
      id: "event-1",
      title: "Mathematics Unit Test",
      date: "2026-05-20",
      type: "Exam",
      audience: "Classes 7 to 10",
    },
    {
      id: "event-2",
      title: "Monthly Fee Deadline",
      date: "2026-05-25",
      type: "Finance",
      audience: "All Students",
    },
    {
      id: "event-3",
      title: "PTA Review Meeting",
      date: "2026-05-27",
      type: "Meeting",
      audience: "Parents and Admin",
    },
  ],
  settings: {
    schoolName: "Sahaj Blossom High School",
    accentColor: "indigo",
    darkMode: false,
    notificationsEmail: true,
    notificationsSms: false,
    autoFine: true,
    backupStatus: "Healthy",
    systemStatus: "Operational",
  },
});

const calculatePerformanceAverage = (performance = []) => calculateAverage(performance, (item) => item.score);

const normalizeTeacher = (teacher) => ({
  workload: 18,
  performanceIndex: Math.round(Number(teacher.attendancePercent || 0) * 0.94),
  leaveBalance: 4,
  phone: "",
  email: "",
  joiningDate: "",
  photoName: "",
  todayStatus: Number(teacher.attendancePercent || 0) >= 92 ? "present" : "late",
  salaryHistory: [],
  ...teacher,
  salary: Number(teacher.salary || 0),
  attendancePercent: Number(teacher.attendancePercent || 0),
  salaryPaid: Boolean(teacher.salaryPaid),
});

const normalizeClassroom = (classroom) => ({
  roomName: "",
  capacity: 50,
  classTeacherId: "",
  academicYear: "2026-27",
  ...classroom,
  id: classroom.id || createClassroomIdFromName(classroom.name),
  capacity: Number(classroom.capacity || 50),
});

const normalizeStudent = (student) => ({
  parentName: "",
  parentPhone: "",
  remarks: "",
  feeHistory: [],
  ...student,
  totalFees: Number(student.totalFees || 0),
  paidFees: Number(student.paidFees || 0),
  pendingFees: Number(student.pendingFees || 0),
  fine: Number(student.fine || 0),
  attendancePercent: Number(student.attendancePercent || 0),
  performanceAverage:
    student.performanceAverage ?? calculatePerformanceAverage(student.performance || []),
});

const buildClassroomCollection = ({ classrooms = [], students = [], teachers = [] }) => {
  const classroomMap = new Map();

  classrooms.forEach((classroom) => {
    if (!classroom?.name) return;
    classroomMap.set(classroom.name, normalizeClassroom(classroom));
  });

  students.forEach((student) => {
    if (!student?.className || classroomMap.has(student.className)) return;
    classroomMap.set(
      student.className,
      normalizeClassroom({
        name: student.className,
      })
    );
  });

  teachers.forEach((teacher) => {
    if (!teacher?.classTeacherOf) return;
    const existingClassroom = classroomMap.get(teacher.classTeacherOf);

    if (existingClassroom) {
      existingClassroom.classTeacherId = teacher.id;
      classroomMap.set(teacher.classTeacherOf, existingClassroom);
      return;
    }

    classroomMap.set(
      teacher.classTeacherOf,
      normalizeClassroom({
        name: teacher.classTeacherOf,
        classTeacherId: teacher.id,
      })
    );
  });

  return Array.from(classroomMap.values()).sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { numeric: true })
  );
};

const normalizeData = (data) => {
  const seed = createSeedData();
  const teachers = (data.teachers || seed.teachers).map(normalizeTeacher);
  const students = (data.students || seed.students).map(normalizeStudent);
  return {
    admins: data.admins || seed.admins,
    teachers,
    classrooms: buildClassroomCollection({
      classrooms: data.classrooms || seed.classrooms,
      students,
      teachers,
    }),
    students,
    notices: data.notices || seed.notices,
    homework: data.homework || seed.homework,
    resources: data.resources || seed.resources,
    attendanceLogs: data.attendanceLogs || seed.attendanceLogs,
    payments: data.payments || seed.payments,
    activities: data.activities || seed.activities,
    events: data.events || seed.events,
    settings: { ...seed.settings, ...(data.settings || {}) },
  };
};

export const getSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
};

export const getTheme = () => localStorage.getItem(THEME_KEY) || "dark";
export const saveTheme = (theme) => localStorage.setItem(THEME_KEY, theme);

export const loadERPData = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = normalizeData(createSeedData());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  const normalized = normalizeData(JSON.parse(raw));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

export const saveERPData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeData(data)));
};

export const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const createTeacherId = (teachers) => {
  const nextTeacherNumber =
    teachers.reduce(
      (max, teacher) => Math.max(max, Number(String(teacher.id).replace(/\D/g, "")) || 0),
      0
    ) + 1;
  return `SBHS-T${String(nextTeacherNumber).padStart(3, "0")}`;
};

export const createStudentId = (students) => {
  const nextStudentNumber =
    students.reduce(
      (max, student) => Math.max(max, Number(String(student.id).replace(/\D/g, "")) || 0),
      0
    ) + 1;
  return `SBHS-S${String(nextStudentNumber).padStart(3, "0")}`;
};

export const addActivity = (data, activity) => {
  data.activities = [
    {
      id: createId("activity"),
      time: `${todayReadable}, ${new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      ...activity,
    },
    ...(data.activities || []),
  ].slice(0, 18);
};

export const buildMonthlyFinanceSeries = (data) => {
  const paymentMap = new Map();
  const months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
  months.forEach((month) => {
    paymentMap.set(month, { month, revenue: 0, attendance: 0, growth: 0 });
  });

  (data.payments || []).forEach((payment) => {
    const month = String(payment.date || "").slice(0, 7);
    if (paymentMap.has(month)) {
      paymentMap.get(month).revenue += Number(payment.amount || 0);
    }
  });

  const monthValues = Array.from(paymentMap.values());
  monthValues.forEach((entry, index) => {
    entry.attendance = 88 + index * 2;
    entry.growth = 42 + index * 5;
  });
  return monthValues;
};

export const todayMeta = {
  currentMonth,
  todayIso,
  todayReadable,
};
