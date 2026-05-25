import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlarmClock,
  BadgeIndianRupee,
  BellDot,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileBarChart2,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Megaphone,
  MoonStar,
  NotebookPen,
  Plus,
  Receipt,
  RefreshCcw,
  School,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatMonthLabel, formatShortDate } from "../lib/formatters";
import {
  ActivityFeed,
  AppCard,
  AvatarBlock,
  Badge,
  DataTable,
  EmptyState,
  GradientButton,
  IconButton,
  InputField,
  MetricCard,
  ProgressPill,
  QuickActionCard,
  RevenueHighlight,
  SearchField,
  SectionTitle,
  SelectField,
  SummaryStat,
  TextAreaField,
  pageTransition,
} from "./ui";

function deriveNextClassName(className) {
  const value = String(className || "");
  const numberMatch = value.match(/(\d+)/);
  if (!numberMatch) return "";
  const currentNumber = Number(numberMatch[1]);
  if (currentNumber >= 10) return "";
  const suffixMatch = value.match(/-([A-Za-z0-9]+)$/);
  const suffix = suffixMatch ? `-${suffixMatch[1]}` : "";
  return `Class ${currentNumber + 1}${suffix}`;
}

export const navigationGroups = [
  {
    title: "Workspace",
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "teachers", label: "Teachers", icon: UserCog },
      { id: "students", label: "Students", icon: Users },
      { id: "classrooms", label: "Classrooms", icon: School },
      { id: "finance", label: "Finance", icon: Landmark },
      { id: "attendance", label: "Attendance", icon: ClipboardCheck },
      { id: "academics", label: "Academics", icon: GraduationCap },
    ],
  },
  {
    title: "Operations",
    items: [
      { id: "notices", label: "Notices", icon: Megaphone },
      { id: "reports", label: "Reports", icon: FileBarChart2 },
      { id: "analytics", label: "Analytics", icon: TrendingUp },
      { id: "settings", label: "Settings", icon: Settings2 },
    ],
  },
];

export function OverviewSection({
  metrics,
  activities,
  monthlySeries,
  events,
  quickActions,
  onQuickAction,
}) {
  return (
    <motion.section {...pageTransition} className="space-y-6">
      <SectionTitle
        eyebrow="Operations Center"
        title="Live School Command Dashboard"
        description="A premium operational view of school revenue, attendance, growth, and events with fast admin actions."
      />

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <AppCard className="p-5">
          <SectionTitle
            eyebrow="Revenue and Attendance"
            title="Real-Time School Analytics"
            description="Track revenue, attendance, and student growth from one premium chart zone."
          />
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Monthly Revenue
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySeries}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="month" tickFormatter={formatMonthLabel} stroke="#64748b" />
                    <YAxis stroke="#64748b" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.92)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 20,
                      }}
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={formatMonthLabel}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2.5} fill="url(#revenueFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Attendance and Growth
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySeries}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="month" tickFormatter={formatMonthLabel} stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.92)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 20,
                      }}
                      labelFormatter={formatMonthLabel}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="attendance" stroke="#34d399" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="growth" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </AppCard>

        <div className="space-y-6">
          <AppCard className="p-5">
            <SectionTitle
              eyebrow="Activity Feed"
              title="Live Operational Stream"
              description="Recent salary, attendance, student, and finance events."
            />
            <div className="mt-5 max-h-[430px] overflow-auto pr-1">
              <ActivityFeed items={activities} />
            </div>
          </AppCard>

          <AppCard className="p-5">
            <SectionTitle
              eyebrow="Upcoming Events"
              title="School Calendar Radar"
              description="Exams, deadlines, meetings, and upcoming school events."
            />
            <div className="mt-5 space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/12 text-indigo-200">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{event.title}</p>
                      <p className="text-sm text-slate-400">
                        {event.type} • {event.audience}
                      </p>
                    </div>
                  </div>
                  <Badge tone="info">{formatShortDate(event.date)}</Badge>
                </div>
              ))}
            </div>
          </AppCard>
        </div>
      </div>

      <AppCard className="p-5">
        <SectionTitle
          eyebrow="Quick Actions"
          title="Action Center"
          description="Replace dead CRUD blocks with fast product actions for everyday school workflows."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {quickActions.map((action) => (
            <QuickActionCard key={action.id} {...action} onClick={() => onQuickAction(action.id)} tone="accent" />
          ))}
        </div>
      </AppCard>
    </motion.section>
  );
}

export function TeachersSection({
  teacherMetrics,
  teacherFilters,
  setTeacherFilters,
  teachers,
  teacherForm,
  setTeacherForm,
  onSaveTeacher,
  onEditTeacher,
  onDeleteTeacher,
  onMarkPaid,
  onMarkPending,
  onOpenTeacherProfile,
  onOpenTeacherHistory,
  onBulkMarkPaid,
  onExportSalaryPdf,
  onExportAttendanceCsv,
  onResetTeacherForm,
}) {
  return (
    <motion.section {...pageTransition} className="space-y-6">
      <SectionTitle
        eyebrow="Staff Operations"
        title="Teacher Salary and Attendance Command Center"
        description="Compact salary workflows, teacher performance signals, and premium staff operations controls."
        action={
          <div className="flex flex-wrap gap-3">
            <GradientButton onClick={onBulkMarkPaid}>
              <CheckCircle2 className="h-4 w-4" />
              Mark Filtered Paid
            </GradientButton>
            <GradientButton variant="secondary" onClick={onExportSalaryPdf}>
              <Download className="h-4 w-4" />
              Salary PDF
            </GradientButton>
            <GradientButton variant="secondary" onClick={onExportAttendanceCsv}>
              <FileSpreadsheet className="h-4 w-4" />
              Attendance CSV
            </GradientButton>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {teacherMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <AppCard className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <SectionTitle
              eyebrow="Teacher Records"
              title="Modern Staff Directory"
              description="Live search, compact rows, quick salary actions, and staff analytics."
            />
            <div className="flex flex-wrap gap-3">
              <SearchField
                value={teacherFilters.query}
                onChange={(event) => setTeacherFilters((prev) => ({ ...prev, query: event.target.value }))}
                placeholder="Search teacher, subject, or ID"
              />
              <SelectField
                value={teacherFilters.className}
                onChange={(event) => setTeacherFilters((prev) => ({ ...prev, className: event.target.value }))}
                options={[
                  { value: "all", label: "All Classes" },
                  ...teacherFilters.classOptions.map((item) => ({ value: item, label: item })),
                ]}
              />
              <SelectField
                value={teacherFilters.salaryStatus}
                onChange={(event) => setTeacherFilters((prev) => ({ ...prev, salaryStatus: event.target.value }))}
                options={[
                  { value: "all", label: "All Salary Status" },
                  { value: "paid", label: "Paid" },
                  { value: "pending", label: "Pending" },
                ]}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SummaryStat label="Pending Alerts" value={teacherFilters.pendingAlerts} helper="salary and attendance follow-up" icon={BellDot} tone="warning" />
            <SummaryStat label="Workload Average" value={`${teacherFilters.averageWorkload} hrs`} helper="weekly teaching load" icon={BookOpen} tone="info" />
            <SummaryStat label="Highest Attendance" value={teacherFilters.topTeacher} helper="leading staff performance" icon={TrendingUp} tone="success" />
          </div>

          <div className="mt-6">
            <DataTable
              columns={[
                { label: "Teacher", className: "col-span-4" },
                { label: "Salary", className: "col-span-2" },
                { label: "Attendance", className: "col-span-2" },
                { label: "Status", className: "col-span-2" },
                { label: "Actions", className: "col-span-2 text-right" },
              ]}
              rows={teachers}
              renderRow={(teacher) => (
                <div key={teacher.id} className="grid grid-cols-12 gap-4 px-5 py-4 transition hover:bg-white/5">
                  <div className="col-span-4">
                    <AvatarBlock
                      name={teacher.name}
                      subtitle={`${teacher.subject} • ${teacher.id}`}
                      meta={`${teacher.classTeacherOf || "Class teacher not assigned"} • ${teacher.email || "No email"}`}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <p className="font-semibold text-white">{formatCurrency(teacher.salary)}</p>
                    <p className="text-sm text-slate-400">{teacher.leaveBalance} leave days left</p>
                  </div>
                  <div className="col-span-2">
                    <ProgressPill
                      value={teacher.attendancePercent}
                      label={`${teacher.todayStatus} today`}
                      color={teacher.attendancePercent >= 95 ? "emerald" : teacher.attendancePercent >= 85 ? "amber" : "indigo"}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Badge tone={teacher.salaryPaid ? "success" : "warning"}>
                      {teacher.salaryPaid ? "Paid" : "Pending"}
                    </Badge>
                    <Badge tone={teacher.performanceIndex >= 90 ? "success" : teacher.performanceIndex >= 80 ? "info" : "warning"}>
                      Performance {teacher.performanceIndex}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <IconButton icon={Receipt} label="Mark Paid" onClick={() => onMarkPaid(teacher.id)} />
                    <IconButton icon={AlarmClock} label="Mark Pending" onClick={() => onMarkPending(teacher.id)} />
                    <IconButton icon={Users} label="Profile" onClick={() => onOpenTeacherProfile(teacher)} />
                    <IconButton icon={Activity} label="History" onClick={() => onOpenTeacherHistory(teacher)} />
                    <IconButton icon={Upload} label="Edit" onClick={() => onEditTeacher(teacher)} />
                    <IconButton icon={ShieldCheck} label="Delete" className="text-rose-200" onClick={() => onDeleteTeacher(teacher.id)} />
                  </div>
                </div>
              )}
              mobileCard={(teacher) => (
                <AppCard key={teacher.id} className="p-4">
                  <AvatarBlock
                    name={teacher.name}
                    subtitle={`${teacher.subject} • ${teacher.classTeacherOf || "No class teacher assignment"}`}
                    meta={teacher.id}
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <RevenueHighlight amount={teacher.salary} label="Salary" />
                    <ProgressPill value={teacher.attendancePercent} label="Attendance" color="emerald" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge tone={teacher.salaryPaid ? "success" : "warning"}>
                      {teacher.salaryPaid ? "Paid" : "Pending"}
                    </Badge>
                    <Badge tone={teacher.performanceIndex >= 90 ? "success" : "info"}>
                      Performance {teacher.performanceIndex}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <GradientButton variant="secondary" onClick={() => onOpenTeacherProfile(teacher)}>
                      Profile
                    </GradientButton>
                    <GradientButton variant="secondary" onClick={() => onOpenTeacherHistory(teacher)}>
                      History
                    </GradientButton>
                    <GradientButton onClick={() => onMarkPaid(teacher.id)}>Paid</GradientButton>
                  </div>
                </AppCard>
              )}
            />
          </div>
        </AppCard>

        <AppCard className="p-5">
          <SectionTitle
            eyebrow="Create or Update"
            title="Teacher Access and Salary Setup"
            description="Compact staff onboarding. Class teacher assignment is managed later from the classroom workspace."
            action={
              teacherForm.id ? (
                <GradientButton variant="secondary" onClick={onResetTeacherForm}>
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </GradientButton>
              ) : null
            }
          />

          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSaveTeacher}>
            <InputField
              label="Teacher Name"
              value={teacherForm.name}
              onChange={(event) => setTeacherForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Enter full name"
            />
            <InputField
              label="Subject"
              value={teacherForm.subject}
              onChange={(event) => setTeacherForm((prev) => ({ ...prev, subject: event.target.value }))}
              placeholder="Enter subject"
            />
            <InputField
              label="Monthly Salary"
              type="number"
              value={teacherForm.salary}
              onChange={(event) => setTeacherForm((prev) => ({ ...prev, salary: event.target.value }))}
              placeholder="28000"
            />
            <InputField
              label="Phone Number"
              value={teacherForm.phone}
              onChange={(event) => setTeacherForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="+91 9876543210"
            />
            <InputField
              label="Email"
              value={teacherForm.email}
              onChange={(event) => setTeacherForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="teacher@sbhs.edu"
            />
            <InputField
              label="Joining Date"
              type="date"
              value={teacherForm.joiningDate}
              onChange={(event) => setTeacherForm((prev) => ({ ...prev, joiningDate: event.target.value }))}
            />
            <InputField
              label="Password"
              value={teacherForm.password}
              onChange={(event) => setTeacherForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Create secure password"
            />
            <InputField
              label="Workload (hrs)"
              type="number"
              value={teacherForm.workload}
              onChange={(event) => setTeacherForm((prev) => ({ ...prev, workload: event.target.value }))}
              placeholder="24"
            />
            <InputField
              label="Leave Balance"
              type="number"
              value={teacherForm.leaveBalance}
              onChange={(event) => setTeacherForm((prev) => ({ ...prev, leaveBalance: event.target.value }))}
              placeholder="5"
            />
            <InputField
              label="Teacher Photo"
              type="file"
              onChange={(event) =>
                setTeacherForm((prev) => ({
                  ...prev,
                  photoName: event.target.files?.[0]?.name || prev.photoName,
                }))
              }
              className="md:col-span-2"
              helper={teacherForm.photoName ? `Selected: ${teacherForm.photoName}` : "Upload from local device"}
            />
            <div className="md:col-span-2 flex gap-3 pt-2">
              <GradientButton type="submit" className="flex-1">
                <Plus className="h-4 w-4" />
                {teacherForm.id ? "Update Teacher" : "Create Teacher"}
              </GradientButton>
            </div>
          </form>
        </AppCard>
      </div>
    </motion.section>
  );
}

export function StudentsSection({
  studentFilters,
  setStudentFilters,
  students,
  studentSummary,
  studentForm,
  setStudentForm,
  onSaveStudent,
  onOpenStudent,
  onSendBulkNotice,
  onExportStudents,
}) {
  const [query, setQuery] = useState(studentFilters.query);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStudentFilters((prev) => ({ ...prev, query }));
    }, 220);
    return () => clearTimeout(timeout);
  }, [query, setStudentFilters]);

  return (
    <motion.section {...pageTransition} className="space-y-6">
      <SectionTitle
        eyebrow="Student Operations Center"
        title="Profiles, performance, attendance, and fee visibility"
        description="A real operations view of students with profile modals, smart filters, warnings, and bulk actions."
        action={
          <div className="flex flex-wrap gap-3">
            <GradientButton variant="secondary" onClick={onSendBulkNotice}>
              <Send className="h-4 w-4" />
              Send Notice
            </GradientButton>
            <GradientButton variant="secondary" onClick={onExportStudents}>
              <Download className="h-4 w-4" />
              Export PDF
            </GradientButton>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryStat label="Top Performers" value={studentSummary.topPerformers} helper="above 85% average" icon={Sparkles} tone="success" />
        <SummaryStat label="Low Attendance" value={studentSummary.lowAttendance} helper="below 90% attendance" icon={AlarmClock} tone="warning" />
        <SummaryStat label="Fee Pending" value={studentSummary.pendingFees} helper="students with outstanding fees" icon={Wallet} tone="danger" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_0.82fr]">
        <AppCard className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <SectionTitle
              eyebrow="Student Directory"
              title="Smart Filters and Compact Table"
              description="Search by student name or roll number, then filter by class, attendance, or fee status."
            />
            <div className="flex flex-wrap gap-3">
              <SearchField value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student or roll no" />
              <SelectField
                value={studentFilters.className}
                onChange={(event) => setStudentFilters((prev) => ({ ...prev, className: event.target.value }))}
                options={[
                  { value: "all", label: "All Classes" },
                  ...studentFilters.classOptions.map((item) => ({ value: item, label: item })),
                ]}
              />
              <SelectField
                value={studentFilters.attendance}
                onChange={(event) => setStudentFilters((prev) => ({ ...prev, attendance: event.target.value }))}
                options={[
                  { value: "all", label: "All Attendance" },
                  { value: "healthy", label: "Healthy Attendance" },
                  { value: "warning", label: "Warning Attendance" },
                ]}
              />
              <SelectField
                value={studentFilters.feeStatus}
                onChange={(event) => setStudentFilters((prev) => ({ ...prev, feeStatus: event.target.value }))}
                options={[
                  { value: "all", label: "All Fee Status" },
                  { value: "paid", label: "Paid" },
                  { value: "pending", label: "Pending" },
                ]}
              />
            </div>
          </div>

          <div className="mt-5">
            <DataTable
              columns={[
                { label: "Student", className: "col-span-4" },
                { label: "Fees", className: "col-span-2" },
                { label: "Attendance", className: "col-span-2" },
                { label: "Performance", className: "col-span-2" },
                { label: "Action", className: "col-span-2 text-right" },
              ]}
              rows={students}
              renderRow={(student) => (
                <div key={student.id} className="grid grid-cols-12 gap-4 px-4 py-3 transition hover:bg-white/5">
                  <div className="col-span-4">
                    <AvatarBlock
                      name={student.name}
                      subtitle={`${student.className} • ${student.rollNo}`}
                      meta={`${student.parentName || "Parent not added"} • ${student.id}`}
                      accent={student.performanceAverage >= 85 ? "emerald" : "indigo"}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="font-semibold text-white">{formatCurrency(student.paidFees)}</p>
                    <p className="text-sm text-slate-400">Pending {formatCurrency(student.pendingFees)}</p>
                  </div>
                  <div className="col-span-2">
                    <ProgressPill value={student.attendancePercent} label="Attendance" color={student.attendancePercent >= 90 ? "emerald" : "amber"} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Badge tone={student.performanceAverage >= 85 ? "success" : student.performanceAverage >= 75 ? "info" : "warning"}>
                      {student.performanceAverage >= 85 ? "Top Performer" : student.performanceAverage >= 75 ? "Stable" : "Needs Support"}
                    </Badge>
                    <Badge tone={student.pendingFees > 0 ? "warning" : "success"}>
                      {student.pendingFees > 0 ? "Fee Pending" : "Fees Cleared"}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <GradientButton variant="secondary" onClick={() => onOpenStudent(student)}>
                      Open Profile
                    </GradientButton>
                  </div>
                </div>
              )}
              mobileCard={(student) => (
                <AppCard key={student.id} className="p-4">
                  <AvatarBlock name={student.name} subtitle={`${student.className} • ${student.rollNo}`} meta={student.id} />
                  <div className="mt-4 grid gap-3">
                    <ProgressPill value={student.attendancePercent} label="Attendance" color="emerald" />
                    <ProgressPill value={student.performanceAverage} label="Performance" color="indigo" />
                    <RevenueHighlight amount={student.pendingFees} label="Pending Fees" />
                  </div>
                  <div className="mt-4">
                    <GradientButton onClick={() => onOpenStudent(student)} className="w-full">
                      View Student
                    </GradientButton>
                  </div>
                </AppCard>
              )}
            />
          </div>
        </AppCard>

        <AppCard className="p-4">
          <SectionTitle
            eyebrow="Add Student"
            title="Compact Student Onboarding"
            description="Add student access, parent details, and fee basics without wasting vertical space."
          />
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSaveStudent}>
            <InputField label="Student Name" value={studentForm.name} onChange={(event) => setStudentForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Enter student name" />
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Class</span>
              <SelectField
                value={studentForm.className}
                onChange={(event) => setStudentForm((prev) => ({ ...prev, className: event.target.value }))}
                options={[
                  { value: "", label: "Select classroom" },
                  ...studentFilters.classOptions.map((item) => ({ value: item, label: item })),
                ]}
              />
            </label>
            <InputField label="Roll Number" value={studentForm.rollNo} onChange={(event) => setStudentForm((prev) => ({ ...prev, rollNo: event.target.value }))} placeholder="06A-21" />
            <InputField label="Password" value={studentForm.password} onChange={(event) => setStudentForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Create password" />
            <InputField label="Parent Name" value={studentForm.parentName} onChange={(event) => setStudentForm((prev) => ({ ...prev, parentName: event.target.value }))} placeholder="Parent name" />
            <InputField label="Parent Phone" value={studentForm.parentPhone} onChange={(event) => setStudentForm((prev) => ({ ...prev, parentPhone: event.target.value }))} placeholder="+91 9XXXXXXXXX" />
            <InputField label="Total Fees" type="number" value={studentForm.totalFees} onChange={(event) => setStudentForm((prev) => ({ ...prev, totalFees: event.target.value }))} placeholder="18000" />
            <InputField label="Due Date" type="date" value={studentForm.dueDate} onChange={(event) => setStudentForm((prev) => ({ ...prev, dueDate: event.target.value }))} />
            <TextAreaField className="md:col-span-2" label="Remarks" value={studentForm.remarks} onChange={(event) => setStudentForm((prev) => ({ ...prev, remarks: event.target.value }))} placeholder="Any admin remarks or support notes" />
            <div className="md:col-span-2">
              <GradientButton type="submit" className="w-full">
                <Plus className="h-4 w-4" />
                Add Student
              </GradientButton>
            </div>
          </form>
        </AppCard>
      </div>
    </motion.section>
  );
}

export function ClassroomsSection({
  classroomSummary,
  classroomForm,
  setClassroomForm,
  classroomManagerForm,
  setClassroomManagerForm,
  teacherOptions,
  onSaveClassroom,
  onEditClassroom,
  onDeleteClassroom,
  onDownloadClassPdf,
  onRenameClass,
  onPromoteClass,
}) {
  const totalSeats = classroomSummary.reduce((sum, item) => sum + item.capacity, 0);
  const totalStudents = classroomSummary.reduce((sum, item) => sum + item.students, 0);
  const unassignedCount = classroomSummary.filter((item) => !item.classTeacherId).length;
  const averageStrength = classroomSummary.length ? Math.round(totalStudents / classroomSummary.length) : 0;

  return (
    <motion.section {...pageTransition} className="space-y-5">
      <SectionTitle
        eyebrow="Classroom Workspace"
        title="Create classrooms, assign class teachers, and manage yearly promotion"
        description="Built for dense school data. Add classrooms first, assign class teachers later, and keep class operations compact."
      />

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryStat label="Total Classes" value={classroomSummary.length} helper="active classroom records" icon={School} tone="info" />
        <SummaryStat label="Student Strength" value={totalStudents} helper={`${averageStrength} avg per class`} icon={Users} tone="success" />
        <SummaryStat label="Total Capacity" value={totalSeats} helper="registered seat capacity" icon={Landmark} tone="neutral" />
        <SummaryStat label="Teacher Pending" value={unassignedCount} helper="classrooms without class teacher" icon={AlarmClock} tone="warning" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <AppCard className="p-4">
          <SectionTitle
            eyebrow="Create Classroom"
            title={classroomForm.id ? "Update classroom" : "Add new classroom"}
            description="Keep class setup small and structured so large schools can manage many sections without clutter."
          />
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onSaveClassroom}>
            <InputField
              label="Class Name"
              value={classroomForm.name}
              onChange={(event) => setClassroomForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Class 8-B"
            />
            <InputField
              label="Room Name"
              value={classroomForm.roomName}
              onChange={(event) => setClassroomForm((prev) => ({ ...prev, roomName: event.target.value }))}
              placeholder="Room 304"
            />
            <InputField
              label="Capacity"
              type="number"
              value={classroomForm.capacity}
              onChange={(event) => setClassroomForm((prev) => ({ ...prev, capacity: event.target.value }))}
              placeholder="50"
            />
            <InputField
              label="Academic Year"
              value={classroomForm.academicYear}
              onChange={(event) => setClassroomForm((prev) => ({ ...prev, academicYear: event.target.value }))}
              placeholder="2026-27"
            />
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Class Teacher</span>
              <SelectField
                value={classroomForm.classTeacherId}
                onChange={(event) => setClassroomForm((prev) => ({ ...prev, classTeacherId: event.target.value }))}
                options={teacherOptions}
              />
            </label>
            <div className="flex gap-3 md:col-span-2">
              <GradientButton type="submit" className="flex-1">
                <Plus className="h-4 w-4" />
                {classroomForm.id ? "Update Classroom" : "Create Classroom"}
              </GradientButton>
              {classroomForm.id ? (
                <GradientButton
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setClassroomForm({
                      id: "",
                      name: "",
                      roomName: "",
                      capacity: "50",
                      classTeacherId: "",
                      academicYear: "2026-27",
                    })
                  }
                >
                  Reset
                </GradientButton>
              ) : null}
            </div>
          </form>
        </AppCard>

        <AppCard className="p-4">
          <SectionTitle
            eyebrow="Classroom Registry"
            title="Dense class list for large schools"
            description="This layout is compressed so twenty or more classes still stay readable on one admin screen."
          />
          <div className="mt-4">
            <DataTable
              columns={[
                { label: "Classroom", className: "col-span-3" },
                { label: "Students", className: "col-span-1" },
                { label: "Capacity", className: "col-span-1" },
                { label: "Teacher", className: "col-span-3" },
                { label: "Health", className: "col-span-2" },
                { label: "Actions", className: "col-span-2 text-right" },
              ]}
              rows={classroomSummary}
              renderRow={(classroom) => (
                <div key={classroom.id} className="grid grid-cols-12 gap-4 px-4 py-3 transition hover:bg-white/5">
                  <div className="col-span-3">
                    <p className="font-medium text-white">{classroom.name}</p>
                    <p className="text-xs text-slate-500">{classroom.roomName || "Room not set"} • {classroom.academicYear}</p>
                  </div>
                  <div className="col-span-1 text-sm text-slate-200">{classroom.students}</div>
                  <div className="col-span-1 text-sm text-slate-200">{classroom.capacity}</div>
                  <div className="col-span-3">
                    <p className="truncate text-sm text-slate-200">{classroom.classTeacherName || "No class teacher assigned"}</p>
                    <p className="truncate text-xs text-slate-500">{classroom.classTeacherId || "Assign from this section"}</p>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-2">
                    <Badge tone={classroom.pendingFees > 0 ? "warning" : "success"}>
                      {classroom.pendingFees > 0 ? `${classroom.pendingFees} pending` : "fees clear"}
                    </Badge>
                    <Badge tone={classroom.attendance >= 90 ? "success" : "warning"}>
                      {classroom.attendance}% attendance
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <IconButton icon={RefreshCcw} label="Edit Classroom" onClick={() => onEditClassroom(classroom)} />
                    <IconButton icon={Download} label="Download PDF" onClick={() => onDownloadClassPdf(classroom.name)} />
                    <IconButton
                      icon={ShieldCheck}
                      label="Delete Classroom"
                      className="text-rose-200"
                      onClick={() => onDeleteClassroom(classroom.id)}
                    />
                  </div>
                </div>
              )}
              mobileCard={(classroom) => (
                <AppCard key={classroom.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{classroom.name}</p>
                      <p className="text-sm text-slate-400">{classroom.students} students • cap {classroom.capacity}</p>
                    </div>
                    <Badge tone={classroom.pendingFees > 0 ? "warning" : "success"}>
                      {classroom.pendingFees > 0 ? "pending" : "clear"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <GradientButton variant="secondary" onClick={() => onEditClassroom(classroom)}>
                      Edit
                    </GradientButton>
                    <GradientButton variant="secondary" onClick={() => onDownloadClassPdf(classroom.name)}>
                      PDF
                    </GradientButton>
                  </div>
                </AppCard>
              )}
            />
          </div>
        </AppCard>
      </div>

      <AppCard className="p-4">
        <SectionTitle
          eyebrow="Year Completion"
          title="Rename classes and promote students to the next class"
          description="Use this compact promotion center when one academic year ends and students move to the next class."
        />
        <form className="mt-4 grid gap-3 xl:grid-cols-[1.05fr_1fr_1fr_auto_auto]" onSubmit={onRenameClass}>
          <SelectField
            value={classroomManagerForm.selectedClass}
            onChange={(event) =>
              setClassroomManagerForm((prev) => ({
                ...prev,
                selectedClass: event.target.value,
                renamedClassName: event.target.value,
                nextClassName: deriveNextClassName(event.target.value),
              }))
            }
            options={classroomSummary.map((item) => ({
              value: item.name,
              label: `${item.name} • ${item.students} students`,
            }))}
          />
          <InputField
            label="Edit Class Name"
            value={classroomManagerForm.renamedClassName}
            onChange={(event) =>
              setClassroomManagerForm((prev) => ({
                ...prev,
                renamedClassName: event.target.value,
              }))
            }
            placeholder="Class 8-A"
          />
          <InputField
            label="Promote To"
            value={classroomManagerForm.nextClassName}
            onChange={(event) =>
              setClassroomManagerForm((prev) => ({
                ...prev,
                nextClassName: event.target.value,
              }))
            }
            placeholder="Class 9-A"
          />
          <div className="self-end">
            <GradientButton type="submit" className="w-full">
              Update Name
            </GradientButton>
          </div>
          <div className="self-end">
            <GradientButton type="button" variant="secondary" onClick={onPromoteClass} className="w-full">
              <GraduationCap className="h-4 w-4" />
              Promote
            </GradientButton>
          </div>
        </form>
      </AppCard>
    </motion.section>
  );
}

export function FinanceSection({
  monthlySeries,
  financeSummary,
  pendingStudents,
  paymentForm,
  setPaymentForm,
  onRecordPayment,
  onAutoFine,
  onSendReminders,
}) {
  return (
    <motion.section {...pageTransition} className="space-y-6">
      <SectionTitle
        eyebrow="Financial Control Center"
        title="Revenue analytics, pending fees, and payment operations"
        description="A premium finance surface for collections, reminders, fine management, and revenue forecast."
        action={
          <div className="flex flex-wrap gap-3">
            <GradientButton onClick={onSendReminders}>
              <BellDot className="h-4 w-4" />
              Fee Reminders
            </GradientButton>
            <GradientButton variant="secondary" onClick={onAutoFine}>
              <BadgeIndianRupee className="h-4 w-4" />
              Auto Fine Calculator
            </GradientButton>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {financeSummary.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <AppCard className="p-5">
          <SectionTitle
            eyebrow="Collections"
            title="Monthly Collection and Fee Forecast"
            description="Track revenue, pending fees, and payment movement month by month."
          />
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Collection Trend</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySeries}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="month" tickFormatter={formatMonthLabel} stroke="#64748b" />
                    <YAxis stroke="#64748b" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.92)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 20,
                      }}
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={formatMonthLabel}
                    />
                    <Bar dataKey="revenue" radius={[12, 12, 0, 0]} fill="#818cf8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pending Fee Progress</p>
              <div className="space-y-5">
                {pendingStudents.map((student) => (
                  <div key={student.id} className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{student.name}</p>
                        <p className="text-sm text-slate-400">
                          {student.className} • {student.rollNo}
                        </p>
                      </div>
                      <Badge tone="warning">{formatCurrency(student.pendingFees)}</Badge>
                    </div>
                    <div className="mt-4">
                      <ProgressPill
                        value={Math.round((student.paidFees / Math.max(student.totalFees, 1)) * 100)}
                        label="Fee Collection"
                        color="amber"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AppCard>

        <AppCard className="p-5">
          <SectionTitle
            eyebrow="Record Payment"
            title="Payment Timeline Controls"
            description="Capture collections, update pending amounts, and keep fee status live."
          />
          <form className="mt-5 grid gap-4" onSubmit={onRecordPayment}>
            <SelectField
              value={paymentForm.studentId}
              onChange={(event) => setPaymentForm((prev) => ({ ...prev, studentId: event.target.value }))}
              options={paymentForm.studentOptions}
            />
            <InputField
              label="Amount Received"
              type="number"
              value={paymentForm.amount}
              onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
              placeholder="5000"
            />
            <InputField
              label="Payment Date"
              type="date"
              value={paymentForm.date}
              onChange={(event) => setPaymentForm((prev) => ({ ...prev, date: event.target.value }))}
            />
            <TextAreaField
              label="Finance Note"
              value={paymentForm.note}
              onChange={(event) => setPaymentForm((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="Fee desk note or finance remark"
            />
            <GradientButton type="submit" className="w-full">
              <Receipt className="h-4 w-4" />
              Record Payment
            </GradientButton>
          </form>
        </AppCard>
      </div>
    </motion.section>
  );
}

export function AttendanceSection({ attendanceCards, classHeatmap }) {
  return (
    <motion.section {...pageTransition} className="space-y-6">
      <SectionTitle
        eyebrow="Attendance Intelligence"
        title="Heatmaps, warnings, and attendance trends"
        description="Prevent low attendance and keep teachers informed with compact data signals."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {attendanceCards.map((card) => (
          <SummaryStat key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <AppCard className="p-5">
          <SectionTitle
            eyebrow="Class Heatmap"
            title="Attendance by Class"
            description="Visual class attendance health for the week."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {classHeatmap.map((classItem) => (
              <div key={classItem.className} className="rounded-[26px] border border-white/10 bg-white/6 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{classItem.className}</p>
                    <p className="text-sm text-slate-400">{classItem.students} students</p>
                  </div>
                  <Badge tone={classItem.attendance >= 92 ? "success" : classItem.attendance >= 85 ? "warning" : "danger"}>
                    {classItem.attendance}%
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-2">
                  {classItem.week.map((value, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-2xl"
                      style={{
                        background:
                          value >= 92
                            ? "rgba(16,185,129,0.72)"
                            : value >= 85
                              ? "rgba(245,158,11,0.68)"
                              : "rgba(244,63,94,0.65)",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AppCard>

        <AppCard className="p-5">
          <SectionTitle
            eyebrow="Warnings"
            title="Absent and Low Attendance Alerts"
            description="Flag classes and students needing follow-up."
          />
          <div className="mt-6 space-y-3">
            {classHeatmap.map((classItem) => (
              <div key={classItem.className} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{classItem.className}</p>
                    <p className="text-sm text-slate-400">{classItem.alert}</p>
                  </div>
                  <GradientButton variant="secondary">Follow Up</GradientButton>
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      </div>
    </motion.section>
  );
}

export function AcademicsSection({ academicCards, events, academicForm, setAcademicForm, onAddEvent }) {
  return (
    <motion.section {...pageTransition} className="space-y-6">
      <SectionTitle
        eyebrow="Academic Operations Center"
        title="Exams, timetable, homework, and subject performance"
        description="Turn the academics page into a real operational space for exams, schedules, homework, and class performance."
      />

      <div className="grid gap-4 md:grid-cols-4">
        {academicCards.map((card) => (
          <SummaryStat key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.95fr]">
        <AppCard className="p-5">
          <SectionTitle
            eyebrow="Upcoming Academics"
            title="Exam and Academic Calendar"
            description="Maintain upcoming tests, result uploads, and academic deadlines."
          />
          <div className="mt-6 space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/12 text-indigo-200">
                    <NotebookPen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{event.title}</p>
                    <p className="text-sm text-slate-400">
                      {event.type} • {event.audience}
                    </p>
                  </div>
                </div>
                <Badge tone="info">{formatShortDate(event.date)}</Badge>
              </div>
            ))}
          </div>
        </AppCard>

        <AppCard className="p-5">
          <SectionTitle
            eyebrow="Create Event"
            title="Schedule Exams or Meetings"
            description="Fast academic event creation for exam schedules, PTMs, and school calendar entries."
          />
          <form className="mt-5 grid gap-4" onSubmit={onAddEvent}>
            <InputField label="Title" value={academicForm.title} onChange={(event) => setAcademicForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Exam or academic event title" />
            <SelectField
              value={academicForm.type}
              onChange={(event) => setAcademicForm((prev) => ({ ...prev, type: event.target.value }))}
              options={[
                { value: "Exam", label: "Exam" },
                { value: "Meeting", label: "Meeting" },
                { value: "Homework", label: "Homework" },
                { value: "Result", label: "Result Upload" },
              ]}
            />
            <InputField label="Date" type="date" value={academicForm.date} onChange={(event) => setAcademicForm((prev) => ({ ...prev, date: event.target.value }))} />
            <InputField label="Audience" value={academicForm.audience} onChange={(event) => setAcademicForm((prev) => ({ ...prev, audience: event.target.value }))} placeholder="Classes 6 to 10" />
            <GradientButton type="submit" className="w-full">
              <CalendarClock className="h-4 w-4" />
              Add Academic Event
            </GradientButton>
          </form>
        </AppCard>
      </div>
    </motion.section>
  );
}

export function NoticesSection({ notices, noticeForm, setNoticeForm, onPublishNotice }) {
  return (
    <motion.section {...pageTransition} className="space-y-6">
      <SectionTitle
        eyebrow="Notice Center"
        title="Publish school-wide notices with premium clarity"
        description="Manage announcements, priority levels, and audience targeting in one clean operational panel."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <AppCard className="p-5">
          <SectionTitle
            eyebrow="Published Notices"
            title="Recent Announcements"
            description="Priority-tagged notices visible to students and staff."
          />
          <div className="mt-5 space-y-3">
            {notices.map((notice) => (
              <div key={notice.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{notice.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{notice.message}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      {notice.audience} • {notice.date}
                    </p>
                  </div>
                  <Badge tone={notice.priority === "danger" ? "danger" : notice.priority === "warning" ? "warning" : "info"}>
                    {notice.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </AppCard>

        <AppCard className="p-5">
          <SectionTitle
            eyebrow="Publish Notice"
            title="Send a New Update"
            description="Fast notice publishing with audience and priority tagging."
          />
          <form className="mt-5 grid gap-4" onSubmit={onPublishNotice}>
            <InputField label="Title" value={noticeForm.title} onChange={(event) => setNoticeForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Notice title" />
            <InputField label="Audience" value={noticeForm.audience} onChange={(event) => setNoticeForm((prev) => ({ ...prev, audience: event.target.value }))} placeholder="All Classes" />
            <SelectField
              value={noticeForm.priority}
              onChange={(event) => setNoticeForm((prev) => ({ ...prev, priority: event.target.value }))}
              options={[
                { value: "info", label: "Info" },
                { value: "warning", label: "Warning" },
                { value: "danger", label: "Critical" },
              ]}
            />
            <TextAreaField label="Message" value={noticeForm.message} onChange={(event) => setNoticeForm((prev) => ({ ...prev, message: event.target.value }))} placeholder="Write the notice message" />
            <GradientButton type="submit" className="w-full">
              <Megaphone className="h-4 w-4" />
              Publish Notice
            </GradientButton>
          </form>
        </AppCard>
      </div>
    </motion.section>
  );
}

export function ReportsSection({ reportCards, onExportSalaryPdf, onExportAttendanceCsv, onExportStudents }) {
  return (
    <motion.section {...pageTransition} className="space-y-6">
      <SectionTitle
        eyebrow="Reports Center"
        title="Export-ready reporting for finance, attendance, and student records"
        description="Modern report surfaces with quick export actions and premium report cards."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {reportCards.map((card) => (
          <QuickActionCard key={card.id} {...card} onClick={card.id === "salary" ? onExportSalaryPdf : card.id === "attendance" ? onExportAttendanceCsv : onExportStudents} />
        ))}
      </div>
    </motion.section>
  );
}

export function AnalyticsSection({ monthlySeries, classDistribution }) {
  return (
    <motion.section {...pageTransition} className="space-y-6">
      <SectionTitle
        eyebrow="Advanced Analytics"
        title="Growth, fee mix, and operational analytics"
        description="A premium analytics surface for revenue, attendance, and class distribution."
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <AppCard className="p-5">
          <SectionTitle eyebrow="Growth Curve" title="School Growth Performance" description="Student growth, attendance trend, and revenue together." />
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySeries}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="month" tickFormatter={formatMonthLabel} stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.92)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 20,
                  }}
                  labelFormatter={formatMonthLabel}
                />
                <Legend />
                <Line type="monotone" dataKey="growth" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="attendance" stroke="#34d399" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AppCard>
        <AppCard className="p-5">
          <SectionTitle eyebrow="Class Mix" title="Student Distribution" description="Current distribution of students by class." />
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={classDistribution} dataKey="students" nameKey="className" innerRadius={72} outerRadius={110} paddingAngle={4}>
                  {classDistribution.map((entry, index) => (
                    <Cell
                      key={entry.className}
                      fill={["#818cf8", "#38bdf8", "#34d399", "#f59e0b", "#f43f5e"][index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.92)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 20,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AppCard>
      </div>
    </motion.section>
  );
}

export function SettingsSection({ settingsForm, setSettingsForm, onSaveSettings, onBackup }) {
  return (
    <motion.section {...pageTransition} className="space-y-6">
      <SectionTitle
        eyebrow="System Control Center"
        title="Profile, notifications, security, and system health"
        description="Modern settings with live toggles, backups, and operational system controls."
        action={
          <GradientButton variant="secondary" onClick={onBackup}>
            <Upload className="h-4 w-4" />
            Backup and Restore
          </GradientButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryStat label="School Status" value={settingsForm.systemStatus} helper="live service health" icon={School} tone="success" />
        <SummaryStat label="Backup Status" value={settingsForm.backupStatus} helper="daily backup monitor" icon={ShieldCheck} tone="info" />
        <SummaryStat label="Theme Mode" value={settingsForm.darkMode ? "Dark" : "Light"} helper="admin workspace theme" icon={MoonStar} tone="neutral" />
        <SummaryStat label="Accent" value={settingsForm.accentColor} helper="brand color preset" icon={Sparkles} tone="warning" />
      </div>

      <AppCard className="p-5">
        <SectionTitle eyebrow="ERP Settings" title="School Profile and Notifications" description="Manage school profile, accent system, and communication preferences." />
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSaveSettings}>
          <InputField label="School Name" value={settingsForm.schoolName} onChange={(event) => setSettingsForm((prev) => ({ ...prev, schoolName: event.target.value }))} />
          <SelectField
            value={settingsForm.accentColor}
            onChange={(event) => setSettingsForm((prev) => ({ ...prev, accentColor: event.target.value }))}
            options={[
              { value: "indigo", label: "Indigo" },
              { value: "emerald", label: "Emerald" },
              { value: "amber", label: "Amber" },
            ]}
          />
          <SelectField
            value={settingsForm.notificationsEmail ? "enabled" : "disabled"}
            onChange={(event) => setSettingsForm((prev) => ({ ...prev, notificationsEmail: event.target.value === "enabled" }))}
            options={[
              { value: "enabled", label: "Email Notifications Enabled" },
              { value: "disabled", label: "Email Notifications Disabled" },
            ]}
          />
          <SelectField
            value={settingsForm.notificationsSms ? "enabled" : "disabled"}
            onChange={(event) => setSettingsForm((prev) => ({ ...prev, notificationsSms: event.target.value === "enabled" }))}
            options={[
              { value: "enabled", label: "SMS Notifications Enabled" },
              { value: "disabled", label: "SMS Notifications Disabled" },
            ]}
          />
          <SelectField
            value={settingsForm.autoFine ? "enabled" : "disabled"}
            onChange={(event) => setSettingsForm((prev) => ({ ...prev, autoFine: event.target.value === "enabled" }))}
            options={[
              { value: "enabled", label: "Auto Fine Enabled" },
              { value: "disabled", label: "Auto Fine Disabled" },
            ]}
          />
          <InputField label="System Status" value={settingsForm.systemStatus} onChange={(event) => setSettingsForm((prev) => ({ ...prev, systemStatus: event.target.value }))} />
          <div className="md:col-span-2">
            <GradientButton type="submit" className="w-full">
              <Settings2 className="h-4 w-4" />
              Save Settings
            </GradientButton>
          </div>
        </form>
      </AppCard>
    </motion.section>
  );
}
