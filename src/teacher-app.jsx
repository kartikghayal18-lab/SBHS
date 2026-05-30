import { useMemo, useState, useEffect, startTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BellDot,
  BookOpen,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  FileImage,
  FileText,
  GraduationCap,
  Home,
  ImageUp,
  Layers3,
  LogOut,
  MessageCircleMore,
  NotebookPen,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
import {
  AppCard,
  AvatarBlock,
  Badge,
  GradientButton,
  IconButton,
  InputField,
  Modal,
  ProgressPill,
  SearchField,
  SectionTitle,
  SelectField,
  TextAreaField,
  ActivityFeed,
  SummaryStat,
  pageTransition,
} from "./components/ui";
import {
  addActivity,
  createId,
  getSession,
  loadERPData,
  loadERPDataAsync,
  saveERPData,
  subscribeERPData,
  todayMeta,
} from "./lib/erp-store";
import { uploadPortalFile } from "./lib/remote-erp";
import {
  calculateAverage,
  clamp,
  formatCurrency,
  formatShortDate,
  initialsFromName,
} from "./lib/formatters";

const tabs = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "students", label: "Students", icon: Users },
  { id: "homework", label: "Homework", icon: BookOpen },
  { id: "notes", label: "Notes", icon: NotebookPen },
  { id: "uploads", label: "Uploads", icon: Upload },
  { id: "performance", label: "Performance", icon: TrendingUp },
];

const attendanceOptions = ["present", "absent"];

const initialHomeworkForm = {
  className: "",
  title: "",
  dueDate: todayMeta.todayIso,
  description: "",
  attachmentName: "",
  attachmentUrl: "",
  attachmentPublicId: "",
  attachmentFile: null,
};

const initialResourceForm = {
  className: "",
  type: "notes",
  title: "",
  description: "",
  attachmentName: "",
  attachmentUrl: "",
  attachmentPublicId: "",
  attachmentFile: null,
};

function attendanceTone(value) {
  if (value >= 95) return "success";
  if (value >= 85) return "warning";
  return "danger";
}

function performanceTone(value) {
  if (value >= 85) return "success";
  if (value >= 75) return "info";
  return "warning";
}

function compactTimeSeries(students) {
  const avg = calculateAverage(students, (student) => student.attendancePercent);
  return Array.from({ length: 7 }, (_, index) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
    attendance: clamp(avg - 4 + index, 70, 100),
    submissions: clamp(3 + index * 2, 2, 20),
  }));
}

function teacherQuickToast(message, tone = "info") {
  return { id: createId("toast"), message, tone };
}

function attendanceScore(status) {
  if (status === "present") return 1;
  if (status === "absent") return -1;
  return 0;
}

function labelizeAttendance(status) {
  if (!status) return "-";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function normalizeRollValue(value) {
  return String(value || "").trim().toLowerCase();
}

function numericRollValue(value) {
  const match = String(value || "").match(/(\d+)$/);
  return match ? String(Number(match[1])) : "";
}

function startOfWeekFromIso(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function endOfWeekFromIso(isoDate) {
  const start = new Date(`${startOfWeekFromIso(isoDate)}T00:00:00`);
  start.setDate(start.getDate() + 6);
  return start.toISOString().slice(0, 10);
}

function quarterMonths(monthValue) {
  const [yearText, monthText] = String(monthValue || "").split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!year || !month) return [];

  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date(year, month - 1 - index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
}

export default function TeacherApp() {
  const [data, setData] = useState(() => loadERPData());
  const [activeTab, setActiveTab] = useState("overview");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(todayMeta.todayIso);
  const [attendancePeriod, setAttendancePeriod] = useState("monthly");
  const [attendanceFilterMonth, setAttendanceFilterMonth] = useState(todayMeta.currentMonth);
  const [attendanceFilterDate, setAttendanceFilterDate] = useState(todayMeta.todayIso);
  const [attendanceRollInput, setAttendanceRollInput] = useState("");
  const [attendanceListedMode, setAttendanceListedMode] = useState("absent");
  const [homeworkForm, setHomeworkForm] = useState(initialHomeworkForm);
  const [resourceForm, setResourceForm] = useState(initialResourceForm);
  const [toasts, setToasts] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [studentModal, setStudentModal] = useState(null);

  const session = useMemo(() => getSession(), []);

  useEffect(() => {
    if (!session || session.role !== "teacher") {
      window.location.href = "./login.html?role=teacher";
    }
  }, [session]);

  useEffect(() => {
    let active = true;
    loadERPDataAsync().then((remoteData) => {
      if (active) setData(remoteData);
    });
    const unsubscribe = subscribeERPData((nextData) => {
      if (active) setData(nextData);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!toasts.length) return undefined;
    const timer = setTimeout(() => setToasts((current) => current.slice(1)), 2600);
    return () => clearTimeout(timer);
  }, [toasts]);

  const queueToast = (message, tone = "info") => {
    setToasts((current) => [...current, teacherQuickToast(message, tone)].slice(-3));
  };

  const updateStore = (mutator, message, tone = "info") => {
    setData((current) => {
      const next = structuredClone(current);
      mutator(next);
      saveERPData(next);
      return next;
    });
    if (message) queueToast(message, tone);
  };

  const teacher = data.teachers.find((item) => item.id === session?.id) || data.teachers[0];
  const teacherClasses = Array.from(new Set([teacher?.classTeacherOf, ...data.students.map((student) => student.className)])).filter(Boolean);
  const activeClass = selectedClass || teacher?.classTeacherOf || teacherClasses[0] || "";
  const classStudents = data.students.filter((student) => student.className === activeClass);

  useEffect(() => {
    if (!selectedClass && teacher?.classTeacherOf) {
      setSelectedClass(teacher.classTeacherOf);
      setHomeworkForm((current) => ({ ...current, className: teacher.classTeacherOf }));
      setResourceForm((current) => ({ ...current, className: teacher.classTeacherOf }));
    }
  }, [selectedClass, teacher]);

  const filteredStudents = classStudents.filter((student) => {
    if (!studentSearch.trim()) return true;
    const query = studentSearch.toLowerCase();
    return [student.name, student.rollNo, student.id].some((value) => String(value).toLowerCase().includes(query));
  });

  const homeworkItems = data.homework
    .filter((item) => item.teacherId === teacher?.id)
    .slice()
    .reverse();
  const noteItems = data.resources
    .filter((item) => item.teacherId === teacher?.id && item.type === "notes")
    .slice()
    .reverse();
  const uploadItems = [
    ...homeworkItems.map((item) => ({ ...item, category: "Homework" })),
    ...data.resources
      .filter((item) => item.teacherId === teacher?.id)
      .map((item) => ({ ...item, category: item.type === "test" ? "Test Paper" : "Notes" })),
  ]
    .sort((a, b) => String(b.id).localeCompare(String(a.id)))
    .slice(0, 6);

  const classSeries = compactTimeSeries(classStudents);
  const attendanceToday = calculateAverage(classStudents, (student) => student.attendancePercent);
  const streak = Math.max(3, Math.round((teacher?.attendancePercent || 92) / 12));
  const pendingUploads = uploadItems.filter((item) => String(item.date).includes(new Date().getFullYear())).length;
  const notificationItems = data.activities.filter((item) => ["teacher", "attendance", "notice", "academic"].includes(item.type)).slice(0, 5);
  const studentNameMap = useMemo(
    () =>
      data.students.reduce((map, student) => {
        map[student.id] = student.name;
        return map;
      }, {}),
    [data.students]
  );
  const attendanceHistory = useMemo(
    () =>
      data.attendanceLogs
        .filter((item) => item.teacherId === teacher?.id && item.className === activeClass)
        .slice()
        .sort((left, right) => {
          const dateDiff = String(right.attendanceDate || "").localeCompare(String(left.attendanceDate || ""));
          if (dateDiff !== 0) return dateDiff;
          return String(right.id).localeCompare(String(left.id));
        }),
    [activeClass, data.attendanceLogs, teacher?.id]
  );
  const filteredAttendanceHistory = useMemo(() => {
    if (attendancePeriod === "all") return attendanceHistory;
    if (attendancePeriod === "weekly") {
      const start = startOfWeekFromIso(attendanceFilterDate);
      const end = endOfWeekFromIso(attendanceFilterDate);
      return attendanceHistory.filter(
        (entry) => entry.attendanceDate >= start && entry.attendanceDate <= end
      );
    }
    if (attendancePeriod === "monthly") {
      return attendanceHistory.filter((entry) =>
        String(entry.attendanceDate || "").startsWith(attendanceFilterMonth)
      );
    }
    if (attendancePeriod === "quarterly") {
      const months = quarterMonths(attendanceFilterMonth);
      return attendanceHistory.filter((entry) =>
        months.some((monthValue) => String(entry.attendanceDate || "").startsWith(monthValue))
      );
    }
    return attendanceHistory;
  }, [attendanceFilterDate, attendanceFilterMonth, attendanceHistory, attendancePeriod]);

  const metrics = [
    { label: "Students", value: classStudents.length, helper: "in live class", icon: Users, tone: "info" },
    { label: "Attendance", value: `${attendanceToday}%`, helper: "today's class average", icon: ClipboardCheck, tone: "success" },
    { label: "Uploads", value: pendingUploads, helper: "recent teacher uploads", icon: Upload, tone: "warning" },
    { label: "Homework", value: homeworkItems.length, helper: "published tasks", icon: BookOpen, tone: "neutral" },
  ];

  const performanceLeaders = classStudents
    .slice()
    .sort((a, b) => b.performanceAverage - a.performanceAverage)
    .slice(0, 5);

  const attendanceTokens = useMemo(
    () =>
      attendanceRollInput
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean),
    [attendanceRollInput]
  );
  const attendanceResolved = useMemo(() => {
    const exactMap = new Map();
    const numericMap = new Map();

    classStudents.forEach((student) => {
      exactMap.set(normalizeRollValue(student.rollNo), student);
      const numericValue = numericRollValue(student.rollNo);
      if (numericValue) {
        numericMap.set(numericValue, student);
      }
    });

    const matchedStudents = [];
    const matchedIds = new Set();
    const unmatchedTokens = [];

    attendanceTokens.forEach((token) => {
      const normalizedToken = normalizeRollValue(token);
      const numericToken = numericRollValue(token) || normalizedToken.replace(/^0+/, "") || normalizedToken;
      const student = exactMap.get(normalizedToken) || numericMap.get(numericToken);
      if (student) {
        if (!matchedIds.has(student.id)) {
          matchedIds.add(student.id);
          matchedStudents.push(student);
        }
      } else {
        unmatchedTokens.push(token);
      }
    });

    const defaultStatus = attendanceListedMode === "absent" ? "present" : "absent";
    const statusMap = {};
    classStudents.forEach((student) => {
      statusMap[student.id] = matchedIds.has(student.id) ? attendanceListedMode : defaultStatus;
    });

    return {
      matchedStudents,
      unmatchedTokens,
      statusMap,
      defaultStatus,
    };
  }, [attendanceListedMode, attendanceTokens, classStudents]);

  const openStudentDashboard = (studentId) => {
    window.open(`./student.html?preview=${encodeURIComponent(studentId)}`, "_blank");
  };

  const saveAttendance = () => {
    if (!attendanceTokens.length) {
      queueToast("Type roll numbers first, like 1,2,4,8.", "warning");
      return;
    }
    if (!attendanceResolved.matchedStudents.length) {
      queueToast("No roll numbers matched this class.", "warning");
      return;
    }

    updateStore((next) => {
      const nextStudents = next.students.filter((student) => student.className === activeClass);
      nextStudents.forEach((student) => {
        const selectedStatus = attendanceResolved.statusMap[student.id] || attendanceResolved.defaultStatus;
        const existingIndex = next.attendanceLogs.findIndex(
          (entry) =>
            entry.teacherId === teacher.id &&
            entry.studentId === student.id &&
            entry.className === activeClass &&
            entry.attendanceDate === attendanceDate
        );
        const previousStatus = existingIndex >= 0 ? next.attendanceLogs[existingIndex].status : null;
        const adjustedValue =
          Number(student.attendancePercent || 0) - attendanceScore(previousStatus) + attendanceScore(selectedStatus);
        student.attendancePercent = clamp(adjustedValue, 0, 100);

        const nextEntry = {
          id: existingIndex >= 0 ? next.attendanceLogs[existingIndex].id : createId("attendance"),
          teacherId: teacher.id,
          studentId: student.id,
          className: activeClass,
          rollNo: student.rollNo,
          status: selectedStatus,
          attendanceDate,
          notes: "Recorded from teacher bulk attendance workspace",
        };

        if (existingIndex >= 0) {
          next.attendanceLogs[existingIndex] = nextEntry;
        } else {
          next.attendanceLogs.push(nextEntry);
        }
      });
      addActivity(next, {
        type: "attendance",
        title: `${activeClass} attendance saved`,
        subtitle: `${nextStudents.length} student records saved for ${formatShortDate(attendanceDate)}.`,
        tone: "success",
      });
    }, `Attendance saved for ${activeClass} on ${formatShortDate(attendanceDate)}.`, "success");
    setAttendanceRollInput("");
  };

  const deleteAttendanceRecord = (recordId) => {
    updateStore((next) => {
      const recordIndex = next.attendanceLogs.findIndex((entry) => entry.id === recordId);
      if (recordIndex < 0) return;
      const record = next.attendanceLogs[recordIndex];
      const student = next.students.find((item) => item.id === record.studentId);
      if (student) {
        student.attendancePercent = clamp(
          Number(student.attendancePercent || 0) - attendanceScore(record.status),
          0,
          100
        );
      }
      next.attendanceLogs.splice(recordIndex, 1);
      addActivity(next, {
        type: "attendance",
        title: `${record.className} attendance entry deleted`,
        subtitle: `Roll No ${record.rollNo} record removed for ${formatShortDate(record.attendanceDate)}.`,
        tone: "warning",
      });
    }, "Attendance entry deleted.", "warning");
  };

  const downloadAttendancePdf = () => {
    const periodLabel =
      attendancePeriod === "weekly"
        ? `Weekly record (${formatShortDate(startOfWeekFromIso(attendanceFilterDate))} - ${formatShortDate(
            endOfWeekFromIso(attendanceFilterDate)
          )})`
        : attendancePeriod === "monthly"
          ? `Monthly record (${attendanceFilterMonth})`
          : attendancePeriod === "quarterly"
            ? `3-Month record ending ${attendanceFilterMonth}`
            : "All records";

    const reportWindow = window.open("", "_blank", "width=1040,height=760");
    if (!reportWindow) {
      queueToast("Allow popups to download attendance PDF.", "warning");
      return;
    }

    reportWindow.document.write(`
      <html>
        <head>
          <title>SBHS Teacher Attendance Report</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; padding: 28px; color: #0f172a; }
            h1 { margin: 0 0 6px; }
            p { margin: 0 0 12px; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 14px; }
            th { background: #f8fafc; text-transform: uppercase; font-size: 12px; letter-spacing: 0.08em; }
            .meta { margin-top: 12px; display: flex; gap: 18px; flex-wrap: wrap; }
            .chip { background: #eef2ff; color: #3730a3; border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>SBHS Teacher Attendance Report</h1>
          <p>${teacher?.name || "Teacher"} • ${activeClass}</p>
          <div class="meta">
            <span class="chip">${periodLabel}</span>
            <span class="chip">Entries ${filteredAttendanceHistory.length}</span>
            <span class="chip">Generated ${todayMeta.todayReadable}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Class</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredAttendanceHistory.length
                  ? filteredAttendanceHistory
                      .map(
                        (entry) => `
                          <tr>
                            <td>${studentNameMap[entry.studentId] || "Student"}</td>
                            <td>${entry.rollNo}</td>
                            <td>${entry.className}</td>
                            <td>${formatShortDate(entry.attendanceDate)}</td>
                            <td>${labelizeAttendance(entry.status)}</td>
                          </tr>
                        `
                      )
                      .join("")
                  : `<tr><td colspan="5">No attendance records found for the selected period.</td></tr>`
              }
            </tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.print();
    queueToast("Attendance PDF opened for download/print.", "success");
  };

  const bulkPresent = () => {
    updateStore((next) => {
      const nextStudents = next.students.filter((student) => student.className === activeClass);
      nextStudents.forEach((student) => {
        const existingIndex = next.attendanceLogs.findIndex(
          (entry) =>
            entry.teacherId === teacher.id &&
            entry.studentId === student.id &&
            entry.className === activeClass &&
            entry.attendanceDate === attendanceDate
        );
        const previousStatus = existingIndex >= 0 ? next.attendanceLogs[existingIndex].status : null;
        student.attendancePercent = clamp(
          Number(student.attendancePercent || 0) - attendanceScore(previousStatus) + attendanceScore("present"),
          0,
          100
        );
        const nextEntry = {
          id: existingIndex >= 0 ? next.attendanceLogs[existingIndex].id : createId("attendance"),
          teacherId: teacher.id,
          studentId: student.id,
          className: activeClass,
          rollNo: student.rollNo,
          status: "present",
          attendanceDate,
          notes: "Recorded from teacher bulk attendance workspace",
        };
        if (existingIndex >= 0) {
          next.attendanceLogs[existingIndex] = nextEntry;
        } else {
          next.attendanceLogs.push(nextEntry);
        }
      });
      addActivity(next, {
        type: "attendance",
        title: `${activeClass} all-present attendance saved`,
        subtitle: `${nextStudents.length} students marked present for ${formatShortDate(attendanceDate)}.`,
        tone: "success",
      });
    }, `All students marked present for ${activeClass}.`, "success");
    setAttendanceRollInput("");
  };

  const teacherHeader = (
    <AppCard className="overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-500/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-200 ring-1 ring-indigo-400/20">
            <Sparkles className="h-3.5 w-3.5" />
            Teacher workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">{teacher?.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="info">{teacher?.subject}</Badge>
            <Badge tone="neutral">{teacher?.classTeacherOf}</Badge>
            <Badge tone="success">Online now</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton icon={BellDot} label="Notifications" onClick={() => setNotificationOpen((value) => !value)} />
          <IconButton
            icon={LogOut}
            label="Logout"
            onClick={() => {
              sessionStorage.removeItem("sbhs-portal-session-v1");
              window.location.href = "./login.html?role=teacher";
            }}
          />
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {metrics.map((metric) => (
          <SummaryStat key={metric.label} {...metric} />
        ))}
      </div>
    </AppCard>
  );

  const overviewView = (
    <motion.section {...pageTransition} className="space-y-5">
      <AppCard className="overflow-hidden p-5">
        <SectionTitle
          eyebrow="Live Class Control Center"
          title={activeClass}
          description="Attendance, homework, performance, and student status in one fast teacher workspace."
        />
        <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-indigo-500/14 to-slate-950/30 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Today's class summary</p>
                <h3 className="mt-3 text-3xl font-semibold text-white">{attendanceToday}%</h3>
                <p className="mt-2 text-sm text-slate-400">{classStudents.length} active students connected.</p>
              </div>
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-slate-950/40">
                <div
                  className="absolute inset-2 rounded-full border-[8px] border-indigo-400/20"
                  style={{
                    borderTopColor: "#818cf8",
                    transform: `rotate(${Math.round((attendanceToday / 100) * 360)}deg)`,
                  }}
                />
                <span className="text-xl font-semibold text-white">{attendanceToday}%</span>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Attendance streak</p>
                <p className="mt-2 text-2xl font-semibold text-white">{streak} days</p>
              </div>
              <div className="rounded-[24px] bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending homework</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {homeworkItems.filter((item) => item.className === activeClass).length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Attendance and submissions</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={classSeries}>
                  <defs>
                    <linearGradient id="teacherAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.92)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 20,
                    }}
                  />
                  <Area type="monotone" dataKey="attendance" stroke="#34d399" strokeWidth={2.4} fill="url(#teacherAttendance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </AppCard>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <AppCard className="p-5">
          <SectionTitle eyebrow="Activity Feed" title="Today's classroom updates" description="Fast access to attendance, notices, academic reminders, and uploads." />
          <div className="mt-5">
            <ActivityFeed items={notificationItems.length ? notificationItems : data.activities.slice(0, 5)} />
          </div>
        </AppCard>
        <AppCard className="p-5">
          <SectionTitle eyebrow="Timetable and reminders" title="Teacher daily radar" description="High-value classroom reminders optimized for phone usage." />
          <div className="mt-5 space-y-3">
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
              <div className="flex items-center gap-3">
                <CalendarClock className="h-5 w-5 text-indigo-300" />
                <div>
                  <p className="font-medium text-white">Next exam block</p>
                  <p className="text-sm text-slate-400">{data.events.find((event) => event.type === "Exam")?.title || "No exam scheduled"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="font-medium text-white">Attendance ready</p>
                  <p className="text-sm text-slate-400">{classStudents.length} students available for quick marking.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
              <div className="flex items-center gap-3">
                <MessageCircleMore className="h-5 w-5 text-amber-300" />
                <div>
                  <p className="font-medium text-white">Parent communication</p>
                  <p className="text-sm text-slate-400">Tap any student to message parent or open the student dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </motion.section>
  );

  const attendanceView = (
    <motion.section {...pageTransition} className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <AppCard className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionTitle
              eyebrow="Bulk Attendance Interface"
              title="Mark attendance by class"
              description="Type roll numbers like 1,2,4,8, choose if those listed rolls are present or absent, and the rest of the class is auto-marked opposite."
            />
            <GradientButton variant="secondary" onClick={bulkPresent}>
              <Check className="h-4 w-4" />
              Mark All Present
            </GradientButton>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <SelectField
              value={activeClass}
              onChange={(event) => setSelectedClass(event.target.value)}
              options={teacherClasses.map((className) => ({ value: className, label: className }))}
            />
            <InputField
              label="Attendance Date"
              type="date"
              value={attendanceDate}
              onChange={(event) => setAttendanceDate(event.target.value)}
            />
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Roll Numbers"
                  value={attendanceRollInput}
                  onChange={(event) => setAttendanceRollInput(event.target.value)}
                  placeholder="1,2,4,8 or 07A-12,07A-14"
                  helper="Comma separated roll numbers"
                />
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Listed Roll Numbers Are
                  </span>
                  <SelectField
                    value={attendanceListedMode}
                    onChange={(event) => setAttendanceListedMode(event.target.value)}
                    options={attendanceOptions.map((status) => ({
                      value: status,
                      label: labelizeAttendance(status),
                    }))}
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="info">Typed: {attendanceTokens.length || 0}</Badge>
                <Badge tone="success">Matched: {attendanceResolved.matchedStudents.length}</Badge>
                <Badge tone={attendanceResolved.defaultStatus === "present" ? "success" : "danger"}>
                  Others: {labelizeAttendance(attendanceResolved.defaultStatus)}
                </Badge>
                {attendanceResolved.unmatchedTokens.length ? (
                  <Badge tone="warning">Unmatched: {attendanceResolved.unmatchedTokens.join(", ")}</Badge>
                ) : null}
              </div>
              <div className="mt-4 rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Quick Logic</p>
                <p className="mt-2 text-sm text-slate-300">
                  If you type roll numbers and choose <strong>{labelizeAttendance(attendanceListedMode)}</strong>,
                  those typed students get <strong>{labelizeAttendance(attendanceListedMode)}</strong> and all other
                  students get <strong>{labelizeAttendance(attendanceResolved.defaultStatus)}</strong>.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Class Roll Directory</p>
              <div className="mt-4 space-y-3">
                {classStudents.map((student) => {
                  const matched = attendanceResolved.matchedStudents.some((item) => item.id === student.id);
                  const computedStatus = attendanceResolved.statusMap[student.id] || attendanceResolved.defaultStatus;
                  return (
                    <div key={student.id} className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-slate-950/30 px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{student.name}</p>
                        <p className="text-sm text-slate-400">Roll No {student.rollNo}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {matched ? <Badge tone="info">Typed</Badge> : null}
                        <Badge tone={computedStatus === "present" ? "success" : "danger"}>
                          {labelizeAttendance(computedStatus)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-5">
            <GradientButton
              onClick={saveAttendance}
              className="w-full py-4 text-base shadow-[0_20px_50px_rgba(79,70,229,0.35)]"
            >
              <Check className="h-4 w-4" />
              Save Attendance
            </GradientButton>
          </div>
        </AppCard>

        <AppCard className="p-5">
          <SectionTitle
            eyebrow="Attendance By Period"
            title="Saved attendance records"
            description="Keep weekly, monthly, and 3-month attendance records ready for download or deletion."
          />
          <div className="mt-5 grid gap-4">
            <SelectField
              value={attendancePeriod}
              onChange={(event) => setAttendancePeriod(event.target.value)}
              options={[
                { value: "weekly", label: "Weekly Record" },
                { value: "monthly", label: "Monthly Record" },
                { value: "quarterly", label: "3-Month Record" },
                { value: "all", label: "All Records" },
              ]}
            />
            {attendancePeriod === "weekly" ? (
              <InputField
                label="Week Reference Date"
                type="date"
                value={attendanceFilterDate}
                onChange={(event) => setAttendanceFilterDate(event.target.value)}
              />
            ) : attendancePeriod !== "all" ? (
              <InputField
                label="Month"
                type="month"
                value={attendanceFilterMonth}
                onChange={(event) => setAttendanceFilterMonth(event.target.value)}
              />
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <GradientButton onClick={downloadAttendancePdf}>
                <Download className="h-4 w-4" />
                Download PDF
              </GradientButton>
              <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-300">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Attendance Entries</p>
                <p className="mt-2 text-2xl font-semibold text-white">{filteredAttendanceHistory.length}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 max-h-[620px] space-y-3 overflow-auto pr-1">
            {filteredAttendanceHistory.length ? (
              filteredAttendanceHistory.map((entry) => (
                <div key={entry.id} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-white">{studentNameMap[entry.studentId] || entry.rollNo}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {entry.className} • Roll No {entry.rollNo}
                        </p>
                      </div>
                      <IconButton
                        icon={Trash2}
                        label="Delete attendance"
                        className="text-rose-200"
                        onClick={() => {
                          if (!window.confirm("Delete this attendance record?")) return;
                          deleteAttendanceRecord(entry.id);
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={entry.status === "present" ? "success" : "danger"}>
                        {labelizeAttendance(entry.status)}
                      </Badge>
                      <Badge tone="neutral">{formatShortDate(entry.attendanceDate)}</Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No attendance records found for the selected period.</p>
            )}
          </div>
        </AppCard>
      </div>
    </motion.section>
  );

  const studentsView = (
    <motion.section {...pageTransition} className="space-y-5">
      <AppCard className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionTitle eyebrow="Student Directory" title="Compact student operations" description="Searchable, touch-friendly, and ready for classroom actions." />
          <div className="flex flex-wrap gap-3">
            <SelectField value={activeClass} onChange={(event) => setSelectedClass(event.target.value)} options={teacherClasses.map((className) => ({ value: className, label: className }))} />
            <SearchField value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search student or roll no" />
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="rounded-[28px] border border-white/10 bg-white/6 p-4">
              <div className="flex items-start justify-between gap-4">
                <AvatarBlock
                  name={student.name}
                  subtitle={`${student.rollNo} • ${student.className}`}
                  meta={`${student.parentName || "Parent pending"} • ${student.id}`}
                />
                <div className="flex flex-wrap justify-end gap-2">
                  <Badge tone={attendanceTone(student.attendancePercent)}>Attendance {student.attendancePercent}%</Badge>
                  <Badge tone={performanceTone(student.performanceAverage)}>Performance {student.performanceAverage}%</Badge>
                  <Badge tone={student.pendingFees > 0 ? "warning" : "success"}>
                    {student.pendingFees > 0 ? `Pending ${formatCurrency(student.pendingFees)}` : "Fees clear"}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                <GradientButton variant="secondary" onClick={() => setStudentModal(student)}>
                  <UserRound className="h-4 w-4" />
                  View
                </GradientButton>
                <GradientButton variant="secondary" onClick={() => queueToast(`Parent message draft ready for ${student.parentName || student.name}.`, "info")}>
                  <MessageCircleMore className="h-4 w-4" />
                  Message
                </GradientButton>
                <GradientButton variant="secondary" onClick={() => startTransition(() => setActiveTab("attendance"))}>
                  <ClipboardCheck className="h-4 w-4" />
                  Attendance
                </GradientButton>
                <GradientButton onClick={() => openStudentDashboard(student.id)}>
                  <ChevronRight className="h-4 w-4" />
                  Open Dashboard
                </GradientButton>
              </div>
            </div>
          ))}
        </div>
      </AppCard>
    </motion.section>
  );

  const homeworkView = (
    <motion.section {...pageTransition} className="space-y-5">
      <AppCard className="p-5">
        <SectionTitle eyebrow="Homework Hub" title="Publish classroom homework" description="Built for quick mobile entry with local file upload support." />
        <form
          className="mt-5 grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!homeworkForm.title || !homeworkForm.description) {
              queueToast("Add homework title and description first.", "warning");
              return;
            }
            let uploadedFile = null;
            try {
              uploadedFile = await uploadPortalFile(homeworkForm.attachmentFile, "sbhs-portal/homework");
            } catch {
              queueToast("File upload was skipped. Homework will still be saved.", "warning");
            }
            updateStore((next) => {
              next.homework.unshift({
                id: createId("homework"),
                className: homeworkForm.className || activeClass,
                teacherId: teacher.id,
                title: homeworkForm.title,
                description: homeworkForm.description,
                dueDate: homeworkForm.dueDate,
                attachmentName: uploadedFile?.originalName || homeworkForm.attachmentName,
                attachmentUrl: uploadedFile?.url || homeworkForm.attachmentUrl,
                attachmentPublicId: uploadedFile?.publicId || homeworkForm.attachmentPublicId,
                date: todayMeta.todayReadable,
              });
              addActivity(next, {
                type: "teacher",
                title: `${homeworkForm.title} homework published`,
                subtitle: `${homeworkForm.className || activeClass} students can now view the task.`,
                tone: "success",
              });
            }, "Homework uploaded successfully.", "success");
            setHomeworkForm((current) => ({ ...initialHomeworkForm, className: current.className || activeClass }));
          }}
        >
          <SelectField value={homeworkForm.className || activeClass} onChange={(event) => setHomeworkForm((current) => ({ ...current, className: event.target.value }))} options={teacherClasses.map((className) => ({ value: className, label: className }))} />
          <InputField label="Homework Title" value={homeworkForm.title} onChange={(event) => setHomeworkForm((current) => ({ ...current, title: event.target.value }))} placeholder="Fractions worksheet" />
          <InputField label="Due Date" type="date" value={homeworkForm.dueDate} onChange={(event) => setHomeworkForm((current) => ({ ...current, dueDate: event.target.value }))} />
          <TextAreaField label="Homework Details" value={homeworkForm.description} onChange={(event) => setHomeworkForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the work for students" />
          <InputField
            label="Upload PDF or image"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setHomeworkForm((current) => ({
                ...current,
                attachmentName: file?.name || "",
                attachmentFile: file,
              }));
            }}
            helper={homeworkForm.attachmentName ? `Selected: ${homeworkForm.attachmentName}` : "Teachers can upload from local device"}
          />
          <GradientButton type="submit" className="w-full">
            <Send className="h-4 w-4" />
            Publish Homework
          </GradientButton>
        </form>
      </AppCard>

      <AppCard className="p-5">
        <SectionTitle eyebrow="Recent Homework" title="Live homework tracking" description="Monitor due dates and published tasks." />
        <div className="mt-5 space-y-3">
          {homeworkItems.length ? (
            homeworkItems.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                  </div>
                  <Badge tone="info">{item.className}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="neutral">Due {item.dueDate ? formatShortDate(item.dueDate) : item.date}</Badge>
                  <Badge tone="warning">{classStudents.length} students</Badge>
                  {item.attachmentName ? <Badge tone="success">{item.attachmentName}</Badge> : null}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No homework published yet.</p>
          )}
        </div>
      </AppCard>
    </motion.section>
  );

  const notesView = (
    <motion.section {...pageTransition} className="space-y-5">
      <AppCard className="p-5">
        <SectionTitle eyebrow="Notes and Test Papers" title="Content manager for class resources" description="Upload notes, revision sheets, and test papers to the selected class." />
        <form
          className="mt-5 grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!resourceForm.title || !resourceForm.description) {
              queueToast("Add title and details for the resource.", "warning");
              return;
            }
            let uploadedFile = null;
            try {
              uploadedFile = await uploadPortalFile(resourceForm.attachmentFile, "sbhs-portal/resources");
            } catch {
              queueToast("File upload was skipped. Resource will still be saved.", "warning");
            }
            updateStore((next) => {
              next.resources.unshift({
                id: createId("resource"),
                type: resourceForm.type,
                className: resourceForm.className || activeClass,
                teacherId: teacher.id,
                title: resourceForm.title,
                description: resourceForm.description,
                attachmentName: uploadedFile?.originalName || resourceForm.attachmentName,
                attachmentUrl: uploadedFile?.url || resourceForm.attachmentUrl,
                attachmentPublicId: uploadedFile?.publicId || resourceForm.attachmentPublicId,
                date: todayMeta.todayReadable,
              });
              addActivity(next, {
                type: "teacher",
                title: `${resourceForm.type === "test" ? "Test paper" : "Notes"} uploaded`,
                subtitle: `${resourceForm.className || activeClass} students received ${resourceForm.title}.`,
                tone: "info",
              });
            }, "Resource uploaded successfully.", "success");
            setResourceForm((current) => ({ ...initialResourceForm, className: current.className || activeClass }));
          }}
        >
          <SelectField value={resourceForm.className || activeClass} onChange={(event) => setResourceForm((current) => ({ ...current, className: event.target.value }))} options={teacherClasses.map((className) => ({ value: className, label: className }))} />
          <SelectField
            value={resourceForm.type}
            onChange={(event) => setResourceForm((current) => ({ ...current, type: event.target.value }))}
            options={[
              { value: "notes", label: "Notes" },
              { value: "test", label: "Test Paper" },
            ]}
          />
          <InputField label="Title" value={resourceForm.title} onChange={(event) => setResourceForm((current) => ({ ...current, title: event.target.value }))} placeholder="Chapter notes or test title" />
          <TextAreaField label="Details" value={resourceForm.description} onChange={(event) => setResourceForm((current) => ({ ...current, description: event.target.value }))} placeholder="Explain the uploaded material" />
          <InputField
            label="Upload PDF or image"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setResourceForm((current) => ({
                ...current,
                attachmentName: file?.name || "",
                attachmentFile: file,
              }));
            }}
            helper={resourceForm.attachmentName ? `Selected: ${resourceForm.attachmentName}` : "Local device uploads supported"}
          />
          <GradientButton type="submit" className="w-full">
            <ImageUp className="h-4 w-4" />
            Upload Resource
          </GradientButton>
        </form>
      </AppCard>

      <AppCard className="p-5">
        <SectionTitle eyebrow="Recent Notes" title="Last resource uploads" description="Quick review of notes and test papers sent to classes." />
        <div className="mt-5 space-y-3">
          {noteItems.length ? (
            noteItems.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                  </div>
                  <Badge tone="info">{item.className}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="neutral">{item.type === "test" ? "Test Paper" : "Notes"}</Badge>
                  {item.attachmentName ? <Badge tone="success">{item.attachmentName}</Badge> : null}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No notes uploaded yet.</p>
          )}
        </div>
      </AppCard>
    </motion.section>
  );

  const uploadsView = (
    <motion.section {...pageTransition} className="space-y-5">
      <AppCard className="p-5">
        <SectionTitle eyebrow="Content Management Hub" title="Uploads, previews, and recent activity" description="A premium mobile-first view of your recent classroom content." />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {uploadItems.map((item) => (
            <div key={item.id} className="rounded-[28px] border border-white/10 bg-white/6 p-4">
              <div className="flex items-center justify-between gap-3">
                <Badge tone={item.category === "Homework" ? "warning" : "info"}>{item.category}</Badge>
                <Badge tone="neutral">{item.className}</Badge>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-white">{item.title}</h4>
              <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.attachmentName ? (
                  <Badge tone="success">
                    {item.attachmentName.endsWith(".pdf") ? <FileText className="h-3.5 w-3.5" /> : <FileImage className="h-3.5 w-3.5" />}
                    {item.attachmentName}
                  </Badge>
                ) : (
                  <Badge tone="neutral">No attachment</Badge>
                )}
                <Badge tone="neutral">{item.date}</Badge>
              </div>
            </div>
          ))}
        </div>
      </AppCard>
    </motion.section>
  );

  const performanceView = (
    <motion.section {...pageTransition} className="space-y-5">
      <AppCard className="p-5">
        <SectionTitle eyebrow="Performance Analytics" title="Class performance and student trends" description="Quick classroom performance charts that work on both phones and desktop." />
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classStudents.map((student) => ({ name: student.name.split(" ")[0], performance: student.performanceAverage, attendance: student.attendancePercent }))}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.92)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 20,
                    }}
                  />
                  <Bar dataKey="performance" fill="#818cf8" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="attendance" fill="#34d399" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-3">
            {performanceLeaders.map((student, index) => (
              <div key={student.id} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <div className="flex items-center justify-between gap-3">
                  <AvatarBlock name={student.name} subtitle={`${student.performanceAverage}% performance`} meta={`${student.attendancePercent}% attendance`} accent={index === 0 ? "emerald" : "indigo"} />
                  <Badge tone={index === 0 ? "success" : "info"}>Rank {index + 1}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppCard>
    </motion.section>
  );

  const sectionMap = {
    overview: overviewView,
    attendance: attendanceView,
    students: studentsView,
    homework: homeworkView,
    notes: notesView,
    uploads: uploadsView,
    performance: performanceView,
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_42%,_#0f172a_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-28 pt-4 md:px-6 md:pb-10">
        {teacherHeader}

        <AnimatePresence>
          {notificationOpen ? (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <AppCard className="p-4">
                <ActivityFeed items={notificationItems.length ? notificationItems : data.activities.slice(0, 5)} />
              </AppCard>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-5 overflow-x-auto">
          <div className="flex min-w-max gap-2 pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-indigo-500/18 text-white ring-1 ring-indigo-400/20"
                      : "bg-white/6 text-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex-1">{sectionMap[activeTab]}</div>

        <div className="fixed inset-x-4 bottom-4 z-30 md:hidden">
          <AppCard className="border-white/10 bg-slate-950/78 px-2 py-2">
            <div className="grid grid-cols-4 gap-2">
              {tabs.slice(0, 4).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition ${
                      active ? "bg-indigo-500/18 text-white" : "text-slate-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </AppCard>
        </div>

        <button
          onClick={() => setActiveTab("homework")}
          className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 text-slate-950 shadow-[0_20px_50px_rgba(79,70,229,0.38)] md:hidden"
          aria-label="Quick upload"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <Modal
        open={Boolean(studentModal)}
        onClose={() => setStudentModal(null)}
        title={studentModal?.name || "Student Profile"}
        subtitle="Teacher student quick view"
      >
        {studentModal ? (
          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                <AvatarBlock
                  name={studentModal.name}
                  subtitle={`${studentModal.className} • ${studentModal.rollNo}`}
                  meta={`${studentModal.parentName || "Parent not added"} • ${studentModal.id}`}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone={attendanceTone(studentModal.attendancePercent)}>Attendance {studentModal.attendancePercent}%</Badge>
                  <Badge tone={performanceTone(studentModal.performanceAverage)}>Performance {studentModal.performanceAverage}%</Badge>
                  <Badge tone={studentModal.pendingFees > 0 ? "warning" : "success"}>
                    {studentModal.pendingFees > 0 ? `Pending ${formatCurrency(studentModal.pendingFees)}` : "Fees clear"}
                  </Badge>
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 text-sm text-slate-300">
                <p>Parent: {studentModal.parentName || "Not added"}</p>
                <p className="mt-2">Phone: {studentModal.parentPhone || "Not added"}</p>
                <p className="mt-2">Remarks: {studentModal.remarks || "No remarks added."}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Subject performance</h4>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {studentModal.performance.map((item) => (
                    <div key={item.subject} className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                      <p className="text-sm text-slate-400">{item.subject}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{item.score}%</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <GradientButton onClick={() => openStudentDashboard(studentModal.id)}>
                  <ChevronRight className="h-4 w-4" />
                  Open Dashboard
                </GradientButton>
                <GradientButton variant="secondary" onClick={() => queueToast(`Parent communication ready for ${studentModal.name}.`, "info")}>
                  <MessageCircleMore className="h-4 w-4" />
                  Message Parent
                </GradientButton>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[320px] flex-col gap-3">
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
