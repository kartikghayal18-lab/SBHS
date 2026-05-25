const SBHSApp = (() => {
  const STORAGE_KEY = "sbhs-portal-data-v1";
  const SESSION_KEY = "sbhs-portal-session-v1";

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

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
      },
    ],
    notices: [
      {
        id: "notice-1",
        title: "Unit Test Schedule",
        message: "Unit tests begin from 20 May for classes 1st to 10th.",
        date: today,
      },
    ],
    homework: [
      {
        id: "hw-1",
        className: "Class 7-A",
        teacherId: "SBHS-T001",
        title: "Algebra Practice",
        description: "Solve exercise 4 and 5 from the mathematics notebook.",
        date: today,
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
        date: today,
      },
    ],
    attendanceLogs: [],
  });

  const getData = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = normalizeData(createSeedData());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    const normalized = normalizeData(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  };

  const saveData = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const normalizeData = (rawData) => {
    const data = {
      admins: rawData.admins || [],
      teachers: (rawData.teachers || []).map((teacher, index) => {
        const salary = Number(teacher.salary || 0);
        const attendancePercent = Number(teacher.attendancePercent || 0);
        const salaryHistory = Array.isArray(teacher.salaryHistory)
          ? teacher.salaryHistory
          : teacher.salaryPaid
            ? [
                {
                  id: `sal-${teacher.id || index}-seed`,
                  month: currentMonth,
                  amount: salary,
                  status: "paid",
                  date: todayIso,
                  note: "Initial salary record",
                },
              ]
            : [];
        return {
          ...teacher,
          salary,
          attendancePercent,
          salaryPaid: Boolean(teacher.salaryPaid),
          phone: teacher.phone || "",
          email: teacher.email || "",
          joiningDate: teacher.joiningDate || "",
          photoName: teacher.photoName || "",
          todayStatus:
            teacher.todayStatus || (attendancePercent >= 92 ? "present" : attendancePercent >= 85 ? "late" : "absent"),
          salaryHistory,
        };
      }),
      students: (rawData.students || []).map((student) => ({
        ...student,
        performanceAverage:
          student.performanceAverage ?? calculatePerformanceAverage(student.performance || []),
      })),
      notices: rawData.notices || [],
      homework: rawData.homework || [],
      resources: rawData.resources || [],
      attendanceLogs: rawData.attendanceLogs || [],
    };
    return data;
  };
  const getSession = () => JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  const saveSession = (session) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  const clearSession = () => sessionStorage.removeItem(SESSION_KEY);
  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const todayIso = new Date().toISOString().slice(0, 10);
  const adminFilters = {
    teacherQuery: "",
    teacherClass: "all",
    teacherSalaryStatus: "all",
    teacherAttendance: "all",
    teacherSort: "name",
    student: "",
    financeStudent: "",
  };
  const initials = (name) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  const calculatePerformanceAverage = (performance = []) => {
    if (!performance.length) return 0;
    const total = performance.reduce((sum, subject) => sum + Number(subject.score || 0), 0);
    return Math.round(total / performance.length);
  };
  const salaryStatusLabel = (teacher) => (teacher.salaryPaid ? "Paid" : "Pending");
  const matchesSearch = (value, query) =>
    String(value || "").toLowerCase().includes(String(query || "").trim().toLowerCase());
  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const teacherPerformanceMeta = (teacher) => {
    const attendance = Number(teacher.attendancePercent || 0);
    if (attendance >= 97) return { label: "High Performer", tone: "success" };
    if (attendance >= 90) return { label: "Steady", tone: "info" };
    if (attendance >= 85) return { label: "Watch", tone: "warning" };
    return { label: "Critical", tone: "danger" };
  };
  const teacherAttendanceMeta = (teacher) => {
    const attendance = Number(teacher.attendancePercent || 0);
    if (attendance >= 95) return { label: "On Track", tone: "success" };
    if (attendance >= 85) return { label: "Needs Follow-up", tone: "warning" };
    return { label: "Late Warning", tone: "danger" };
  };
  const teacherActionIcon = (type) => {
    const icons = {
      paid:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M17 6.5c0-1.9-2.2-3.5-5-3.5S7 4.6 7 6.5 9.2 10 12 10s5 1.6 5 3.5S14.8 17 12 17s-5-1.6-5-3.5"/></svg>',
      pending:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v5l3 3"/><circle cx="12" cy="12" r="9"/></svg>',
      edit:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
      profile:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></svg>',
      history:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/><path d="M12 7v5l4 2"/></svg>',
      delete:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
      more:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>',
    };
    return icons[type] || "";
  };

  const setMessage = (id, text, success = true) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = `feedback-message ${success ? "success-text" : "error-text"}`;
  };

  const requireRole = (role) => {
    const session = getSession();
    if (!session || session.role !== role) {
      window.location.href = `./login.html?role=${role}`;
      return null;
    }
    return session;
  };

  const navigateByRole = (role) => {
    const routes = {
      admin: "./admin.html",
      teacher: "./teacher.html",
      student: "./student.html",
    };
    window.location.href = routes[role] || "./index.html";
  };

  const bindLogout = (buttonId) => {
    const button = document.getElementById(buttonId);
    if (!button) return;
    button.addEventListener("click", () => {
      clearSession();
      window.location.href = "./login.html";
    });
  };

  const initAdminSectionTabs = () => {
    const tabs = Array.from(document.querySelectorAll("[data-admin-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-admin-section]"));
    if (!tabs.length || !panels.length) return;

    const activateTab = (tabName) => {
      tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.adminTab === tabName);
      });
      panels.forEach((panel) => {
        const names = String(panel.dataset.adminSection || "").split(/\s+/).filter(Boolean);
        panel.classList.toggle("is-hidden", !names.includes(tabName));
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activateTab(tab.dataset.adminTab));
    });

    activateTab("overview");
  };

  const initTeacherSectionTabs = () => {
    const tabs = Array.from(document.querySelectorAll("[data-teacher-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-teacher-section]"));
    if (!tabs.length || !panels.length) return;

    const activateTab = (tabName) => {
      tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.teacherTab === tabName);
      });
      panels.forEach((panel) => {
        panel.classList.toggle("is-hidden", panel.dataset.teacherSection !== tabName);
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activateTab(tab.dataset.teacherTab));
    });

    activateTab("overview");
  };

  const initStudentSectionTabs = () => {
    const tabs = Array.from(document.querySelectorAll("[data-student-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-student-section]"));
    if (!tabs.length || !panels.length) return;

    const activateTab = (tabName) => {
      tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.studentTab === tabName);
      });
      panels.forEach((panel) => {
        panel.classList.toggle("is-hidden", panel.dataset.studentSection !== tabName);
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activateTab(tab.dataset.studentTab));
    });

    activateTab("overview");
  };

  const getRoleFromUrl = () =>
    new URLSearchParams(window.location.search).get("role") || "admin";

  const initLoginPage = () => {
    getData();
    const roleSelect = document.getElementById("role");
    const loginForm = document.getElementById("login-form");
    if (!roleSelect || !loginForm) return;

    roleSelect.value = getRoleFromUrl();
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = getData();
      const formData = new FormData(loginForm);
      const role = formData.get("role");
      const loginId = String(formData.get("loginId")).trim();
      const password = String(formData.get("password")).trim();

      const buckets = {
        admin: data.admins,
        teacher: data.teachers,
        student: data.students,
      };
      const user = buckets[role].find(
        (entry) => entry.id === loginId && entry.password === password
      );

      if (!user) {
        setMessage("login-message", "Invalid login ID or password.", false);
        return;
      }

      saveSession({ role, id: user.id, name: user.name });
      navigateByRole(role);
    });
  };

  const renderAdminStats = (data) => {
    document.getElementById("admin-total-students").textContent = data.students.length;
    document.getElementById("admin-total-teachers").textContent = data.teachers.length;
    document.getElementById("admin-total-notices").textContent = data.notices.length;
    const pendingTotal = data.students.reduce(
      (sum, student) => sum + Number(student.pendingFees || 0),
      0
    );
    document.getElementById("admin-pending-fees").textContent = formatCurrency(pendingTotal);
  };

  const getFilteredTeachers = (data) => {
    const filteredTeachers = data.teachers.filter((teacher) => {
      const queryMatch =
        !adminFilters.teacherQuery ||
        matchesSearch(teacher.name, adminFilters.teacherQuery) ||
        matchesSearch(teacher.id, adminFilters.teacherQuery);
      const classMatch =
        adminFilters.teacherClass === "all" ||
        teacher.classTeacherOf === adminFilters.teacherClass;
      const salaryMatch =
        adminFilters.teacherSalaryStatus === "all" ||
        (adminFilters.teacherSalaryStatus === "paid" && teacher.salaryPaid) ||
        (adminFilters.teacherSalaryStatus === "pending" && !teacher.salaryPaid);
      const attendance = Number(teacher.attendancePercent || 0);
      const attendanceMatch =
        adminFilters.teacherAttendance === "all" ||
        (adminFilters.teacherAttendance === "high" && attendance >= 95) ||
        (adminFilters.teacherAttendance === "medium" && attendance >= 85 && attendance < 95) ||
        (adminFilters.teacherAttendance === "low" && attendance < 85);
      return queryMatch && classMatch && salaryMatch && attendanceMatch;
    });

    filteredTeachers.sort((a, b) => {
      if (adminFilters.teacherSort === "salaryHigh") return Number(b.salary || 0) - Number(a.salary || 0);
      if (adminFilters.teacherSort === "salaryLow") return Number(a.salary || 0) - Number(b.salary || 0);
      if (adminFilters.teacherSort === "attendanceHigh") {
        return Number(b.attendancePercent || 0) - Number(a.attendancePercent || 0);
      }
      if (adminFilters.teacherSort === "attendanceLow") {
        return Number(a.attendancePercent || 0) - Number(b.attendancePercent || 0);
      }
      return String(a.name || "").localeCompare(String(b.name || ""));
    });

    return filteredTeachers;
  };

  const renderTeacherFilterOptions = (data) => {
    const classFilter = document.getElementById("teacher-class-filter");
    if (!classFilter) return;
    const classes = Array.from(new Set(data.teachers.map((teacher) => teacher.classTeacherOf))).filter(Boolean);
    classFilter.innerHTML = [
      '<option value="all">All Classes</option>',
      ...classes.map(
        (className) =>
          `<option value="${escapeHtml(className)}" ${
            adminFilters.teacherClass === className ? "selected" : ""
          }>${escapeHtml(className)}</option>`
      ),
    ].join("");
    document.getElementById("teacher-salary-filter").value = adminFilters.teacherSalaryStatus;
    document.getElementById("teacher-attendance-filter").value = adminFilters.teacherAttendance;
    document.getElementById("teacher-sort-filter").value = adminFilters.teacherSort;
    document.getElementById("teacher-search-input").value = adminFilters.teacherQuery;
  };

  const renderTeacherMetrics = (data) => {
    const total = data.teachers.length;
    const paidTeachers = data.teachers.filter((teacher) => teacher.salaryPaid);
    const unpaidTeachers = data.teachers.filter((teacher) => !teacher.salaryPaid);
    const paid = paidTeachers.length;
    const avgAttendance = total
      ? Math.round(
          data.teachers.reduce((sum, teacher) => sum + Number(teacher.attendancePercent || 0), 0) / total
        )
      : 0;
    const totalExpense = data.teachers.reduce((sum, teacher) => sum + Number(teacher.salary || 0), 0);
    const pendingAmount = unpaidTeachers.reduce((sum, teacher) => sum + Number(teacher.salary || 0), 0);
    const absentToday = data.teachers.filter((teacher) => teacher.todayStatus !== "present").length;
    const highestTeacher = data.teachers
      .slice()
      .sort((a, b) => Number(b.attendancePercent || 0) - Number(a.attendancePercent || 0))[0];
    const highAttendanceCount = data.teachers.filter(
      (teacher) => Number(teacher.attendancePercent || 0) >= 95
    ).length;

    document.getElementById("teacher-total-metric").textContent = total;
    document.getElementById("teacher-paid-metric").textContent = paid;
    document.getElementById("teacher-unpaid-metric").textContent = total - paid;
    document.getElementById("teacher-attendance-metric").textContent = `${avgAttendance}%`;
    document.getElementById("teacher-expense-metric").textContent = formatCurrency(totalExpense);
    document.getElementById("teacher-absent-metric").textContent = absentToday;
    document.getElementById("teacher-pending-amount-metric").textContent = formatCurrency(pendingAmount);
    document.getElementById("teacher-top-attendance-metric").textContent = highestTeacher
      ? `${highestTeacher.attendancePercent}%`
      : "0%";

    document.getElementById("teacher-total-trend").textContent = `${paid}/${Math.max(total, 1)} salary cycles clear`;
    document.getElementById("teacher-paid-trend").textContent = `${total ? Math.round((paid / total) * 100) : 0}% cleared this month`;
    document.getElementById("teacher-unpaid-trend").textContent = unpaidTeachers.length
      ? `${unpaidTeachers.length} teacher(s) waiting for payout`
      : "No pending salaries";
    document.getElementById("teacher-attendance-trend").textContent = `${highAttendanceCount} teacher(s) above 95%`;
    document.getElementById("teacher-expense-trend").textContent = `${formatCurrency(Math.round(totalExpense / Math.max(total, 1)))} average per teacher`;
    document.getElementById("teacher-absent-trend").textContent = absentToday
      ? `${absentToday} teacher(s) need follow-up`
      : "No follow-up needed today";
    document.getElementById("teacher-pending-amount-trend").textContent = unpaidTeachers.length
      ? `${formatCurrency(Math.round(pendingAmount / unpaidTeachers.length))} average pending`
      : "Amount awaiting payout";
    document.getElementById("teacher-top-attendance-trend").textContent = highestTeacher
      ? `${highestTeacher.name} leads this month`
      : "No teacher selected";
    document.getElementById("teacher-top-teacher-name").textContent = highestTeacher
      ? highestTeacher.name
      : "No teacher yet";
    document.getElementById("teacher-top-teacher-text").textContent = highestTeacher
      ? `${highestTeacher.subject} | ${highestTeacher.attendancePercent}% attendance`
      : "Attendance leaderboard updates live.";
    document.getElementById("teacher-due-reminder-title").textContent = unpaidTeachers.length
      ? `${unpaidTeachers.length} salary payout pending`
      : "All salaries are updated";
    document.getElementById("teacher-due-reminder-text").textContent = unpaidTeachers.length
      ? `${formatCurrency(pendingAmount)} needs release before month close.`
      : "No pending teacher salary amount right now.";
  };

  const renderTeacherTable = (data) => {
    const holder = document.getElementById("teacher-table-body");
    const filteredTeachers = getFilteredTeachers(data);
    holder.innerHTML = filteredTeachers.length
      ? filteredTeachers
          .map((teacher) => {
            const performance = teacherPerformanceMeta(teacher);
            const attendanceMeta = teacherAttendanceMeta(teacher);
            return `
              <article class="teacher-record-row">
                <div class="teacher-record-main">
                  <div class="teacher-record-avatar">${escapeHtml(initials(teacher.name))}</div>
                  <div class="teacher-record-copy">
                    <strong>${escapeHtml(teacher.name)}</strong>
                    <p>${escapeHtml(teacher.subject)}</p>
                    <div class="teacher-record-meta">
                      <span>${escapeHtml(teacher.id)}</span>
                      <span>${escapeHtml(teacher.classTeacherOf)}</span>
                    </div>
                  </div>
                </div>
                <div class="teacher-record-stat">
                  <span class="teacher-record-label">Salary</span>
                  <strong>${formatCurrency(teacher.salary)}</strong>
                </div>
                <div class="teacher-record-stat">
                  <span class="teacher-record-label">Attendance</span>
                  <strong>${teacher.attendancePercent}%</strong>
                  <span class="teacher-inline-badge ${attendanceMeta.tone}">${attendanceMeta.label}</span>
                </div>
                <div class="teacher-record-stat">
                  <span class="teacher-record-label">Status</span>
                  <span class="tag ${teacher.salaryPaid ? "success" : "warning"}">${salaryStatusLabel(teacher)}</span>
                  <span class="teacher-inline-badge ${performance.tone}">${performance.label}</span>
                </div>
                <div class="teacher-record-actions">
                  <div class="teacher-actions-desktop">
                    <button class="teacher-icon-action ${teacher.salaryPaid ? "success" : ""}" type="button" data-action="teacher-mark-paid" data-id="${escapeHtml(
                      teacher.id
                    )}" title="Mark Paid">
                      ${teacherActionIcon("paid")}
                    </button>
                    <button class="teacher-icon-action warning" type="button" data-action="teacher-mark-pending" data-id="${escapeHtml(
                      teacher.id
                    )}" title="Mark Pending">
                      ${teacherActionIcon("pending")}
                    </button>
                    <button class="teacher-icon-action" type="button" data-action="teacher-edit" data-id="${escapeHtml(
                      teacher.id
                    )}" title="Edit Teacher">
                      ${teacherActionIcon("edit")}
                    </button>
                    <button class="teacher-icon-action" type="button" data-action="teacher-profile" data-id="${escapeHtml(
                      teacher.id
                    )}" title="View Profile">
                      ${teacherActionIcon("profile")}
                    </button>
                    <button class="teacher-icon-action" type="button" data-action="teacher-history" data-id="${escapeHtml(
                      teacher.id
                    )}" title="Attendance and Salary History">
                      ${teacherActionIcon("history")}
                    </button>
                    <button class="teacher-icon-action danger" type="button" data-action="teacher-delete" data-id="${escapeHtml(
                      teacher.id
                    )}" title="Delete Teacher">
                      ${teacherActionIcon("delete")}
                    </button>
                  </div>
                  <details class="teacher-actions-mobile">
                    <summary class="teacher-actions-mobile-trigger" title="More Actions">
                      ${teacherActionIcon("more")}
                    </summary>
                    <div class="teacher-actions-mobile-menu">
                      <button class="teacher-mobile-action" type="button" data-action="teacher-mark-paid" data-id="${escapeHtml(
                        teacher.id
                      )}">Mark Paid</button>
                      <button class="teacher-mobile-action" type="button" data-action="teacher-mark-pending" data-id="${escapeHtml(
                        teacher.id
                      )}">Mark Pending</button>
                      <button class="teacher-mobile-action" type="button" data-action="teacher-edit" data-id="${escapeHtml(
                        teacher.id
                      )}">Edit Teacher</button>
                      <button class="teacher-mobile-action" type="button" data-action="teacher-profile" data-id="${escapeHtml(
                        teacher.id
                      )}">View Profile</button>
                      <button class="teacher-mobile-action" type="button" data-action="teacher-history" data-id="${escapeHtml(
                        teacher.id
                      )}">Attendance History</button>
                      <button class="teacher-mobile-action danger" type="button" data-action="teacher-delete" data-id="${escapeHtml(
                        teacher.id
                      )}">Delete Teacher</button>
                    </div>
                  </details>
                </div>
              </article>
            `;
          })
          .join("")
      : '<div class="teacher-empty-state">No teachers found for the current filters.</div>';
  };

  const renderTeacherAnalytics = (data) => {
    const chart = document.getElementById("teacher-attendance-chart");
    const insights = document.getElementById("teacher-attendance-insights");
    const opsList = document.getElementById("teacher-ops-list");
    if (!chart || !insights || !opsList) return;
    const teachers = data.teachers
      .slice()
      .sort((a, b) => Number(b.attendancePercent || 0) - Number(a.attendancePercent || 0));
    chart.innerHTML = teachers.length
      ? teachers
          .map(
            (teacher) => `
              <div class="teacher-bar-wrap">
                <div class="teacher-bar" style="height:${Math.max(18, Number(teacher.attendancePercent || 0))}%">
                  <span>${teacher.attendancePercent}%</span>
                </div>
                <label>${escapeHtml(initials(teacher.name))}</label>
              </div>
            `
          )
          .join("")
      : '<p class="muted small">No teacher attendance records available.</p>';

    const lowAttendanceTeachers = teachers.filter((teacher) => Number(teacher.attendancePercent || 0) < 90);
    const unpaidTeachers = teachers.filter((teacher) => !teacher.salaryPaid);
    insights.innerHTML = `
      <article class="list-card compact-list-card">
        <strong>Attendance Coverage</strong>
        <p class="muted small">${teachers.length} teacher records tracked in this dashboard.</p>
      </article>
      <article class="list-card compact-list-card">
        <strong>Late Attendance Warning</strong>
        <p class="muted small">${
          lowAttendanceTeachers.length
            ? `${lowAttendanceTeachers.map((teacher) => teacher.name).join(", ")} need follow-up.`
            : "No low attendance warning right now."
        }</p>
      </article>
      <article class="list-card compact-list-card">
        <strong>Pending Salary Queue</strong>
        <p class="muted small">${
          unpaidTeachers.length
            ? `${unpaidTeachers.length} teacher(s) are still pending payout.`
            : "All teacher salaries are marked paid."
        }</p>
      </article>
    `;

    opsList.innerHTML = `
      <article class="list-card compact-list-card">
        <strong>Bulk Salary Action</strong>
        <p class="muted small">Mark the currently filtered teacher list paid in one click.</p>
      </article>
      <article class="list-card compact-list-card">
        <strong>Report Exports</strong>
        <p class="muted small">Generate salary PDF and teacher attendance CSV for accounts and audit handoff.</p>
      </article>
      <article class="list-card compact-list-card">
        <strong>Teacher Performance</strong>
        <p class="muted small">${
          teachers[0] ? `${teachers[0].name} leads with ${teachers[0].attendancePercent}% attendance.` : "Teacher performance will appear here."
        }</p>
      </article>
      <article class="list-card compact-list-card">
        <strong>Upcoming Due Reminder</strong>
        <p class="muted small">${
          unpaidTeachers.length
            ? `${formatCurrency(unpaidTeachers.reduce((sum, teacher) => sum + Number(teacher.salary || 0), 0))} pending before month close.`
            : "No salary due reminder pending."
        }</p>
      </article>
    `;
  };

  const renderStudentListTable = (data) => {
    const tbody = document.getElementById("student-list-table-body");
    const filteredStudents = data.students.filter((student) => {
      if (!adminFilters.student) return true;
      return (
        matchesSearch(student.name, adminFilters.student) ||
        matchesSearch(student.rollNo, adminFilters.student)
      );
    });
    tbody.innerHTML = filteredStudents
      .map(
        (student) => `
          <tr>
            <td>${student.name}</td>
            <td>${student.id}</td>
            <td>${student.className}</td>
            <td>${student.rollNo}</td>
            <td>${formatCurrency(student.paidFees)}</td>
            <td>${formatCurrency(student.pendingFees)}</td>
          </tr>
        `
      )
      .join("");
  };

  const renderStudentTable = (data) => {
    const tbody = document.getElementById("student-table-body");
    const filteredStudents = data.students.filter((student) => {
      if (!adminFilters.financeStudent) return true;
      return (
        matchesSearch(student.name, adminFilters.financeStudent) ||
        matchesSearch(student.rollNo, adminFilters.financeStudent)
      );
    });
    tbody.innerHTML = filteredStudents
      .map(
        (student) => `
          <tr>
            <td>${student.name}<div class="small muted">${student.id}</div></td>
            <td>${student.className}</td>
            <td>${formatCurrency(student.paidFees)}</td>
            <td>${formatCurrency(student.pendingFees)}</td>
            <td>${student.dueDate || "-"}</td>
            <td>${formatCurrency(student.fine || 0)}</td>
            <td>${student.attendancePercent}%</td>
          </tr>
        `
      )
      .join("");
  };

  const renderFeeSummary = (data) => {
    const totalPaid = data.students.reduce((sum, student) => sum + Number(student.paidFees || 0), 0);
    const totalPending = data.students.reduce(
      (sum, student) => sum + Number(student.pendingFees || 0),
      0
    );
    const totalFine = data.students.reduce((sum, student) => sum + Number(student.fine || 0), 0);
    const dueCount = data.students.filter((student) => (student.dueDate || "").startsWith(currentMonth)).length;
    document.getElementById("fees-paid-total").textContent = formatCurrency(totalPaid);
    document.getElementById("fees-pending-total").textContent = formatCurrency(totalPending);
    document.getElementById("fees-fine-total").textContent = formatCurrency(totalFine);
    document.getElementById("fees-due-count").textContent = dueCount;
  };

  const renderStudentOptions = (data) => {
    const select = document.getElementById("update-student-id");
    select.innerHTML = data.students
      .map(
        (student) => `
          <option value="${student.id}">${student.name} - ${student.className}</option>
        `
      )
      .join("");
  };

  const populateStudentUpdateForm = (data, studentId) => {
    const student = data.students.find((entry) => entry.id === studentId);
    if (!student) return;
    const form = document.getElementById("student-update-form");
    form.elements.namedItem("className").value = student.className;
    form.elements.namedItem("totalFees").value = student.totalFees;
    form.elements.namedItem("paidFees").value = student.paidFees;
    form.elements.namedItem("pendingFees").value = student.pendingFees;
    form.elements.namedItem("dueDate").value = student.dueDate || "";
    form.elements.namedItem("fine").value = student.fine || 0;
  };

  const renderNoticeList = (data, targetId) => {
    const holder = document.getElementById(targetId);
    holder.innerHTML = data.notices
      .slice()
      .reverse()
      .map(
        (notice) => `
          <article class="list-card">
            <strong>${notice.title}</strong>
            <p class="muted small">${notice.message}</p>
            <p class="small muted">${notice.date}</p>
          </article>
        `
      )
      .join("");
  };

  const openTeacherModal = ({ label, title, body }) => {
    const modal = document.getElementById("teacher-admin-modal");
    if (!modal) return;
    document.getElementById("teacher-modal-label").textContent = label;
    document.getElementById("teacher-modal-title").textContent = title;
    document.getElementById("teacher-modal-body").innerHTML = body;
    modal.classList.remove("is-hidden");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeTeacherModal = () => {
    const modal = document.getElementById("teacher-admin-modal");
    if (!modal) return;
    modal.classList.add("is-hidden");
    modal.setAttribute("aria-hidden", "true");
  };

  const createSalaryHistoryEntry = (teacher, status, note = "") => ({
    id: `sal-${Date.now()}-${teacher.id}`,
    month: currentMonth,
    amount: Number(teacher.salary || 0),
    status,
    date: todayIso,
    note,
  });

  const setTeacherSalaryStatus = (teacher, isPaid, note = "") => {
    teacher.salaryPaid = isPaid;
    teacher.salaryHistory = teacher.salaryHistory || [];
    teacher.salaryHistory.unshift(
      createSalaryHistoryEntry(teacher, isPaid ? "paid" : "pending", note || (isPaid ? "Marked paid from admin panel." : "Marked pending from admin panel."))
    );
  };

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportTeacherAttendanceCsv = (data) => {
    const lines = [
      ["Teacher Name", "Teacher ID", "Subject", "Assigned Class", "Salary", "Salary Status", "Attendance %", "Phone", "Email"].join(","),
      ...data.teachers.map((teacher) =>
        [
          `"${String(teacher.name || "").replace(/"/g, '""')}"`,
          teacher.id,
          `"${String(teacher.subject || "").replace(/"/g, '""')}"`,
          `"${String(teacher.classTeacherOf || "").replace(/"/g, '""')}"`,
          Number(teacher.salary || 0),
          salaryStatusLabel(teacher),
          Number(teacher.attendancePercent || 0),
          `"${String(teacher.phone || "").replace(/"/g, '""')}"`,
          `"${String(teacher.email || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ];
    downloadFile(lines.join("\n"), `sbhs-teacher-attendance-${todayIso}.csv`, "text/csv;charset=utf-8");
  };

  const exportTeacherSalaryPdf = (data) => {
    const rows = data.teachers
      .map(
        (teacher) => `
          <tr>
            <td>${escapeHtml(teacher.name)}</td>
            <td>${escapeHtml(teacher.id)}</td>
            <td>${escapeHtml(teacher.classTeacherOf)}</td>
            <td>${escapeHtml(teacher.subject)}</td>
            <td>${formatCurrency(teacher.salary)}</td>
            <td>${salaryStatusLabel(teacher)}</td>
            <td>${teacher.attendancePercent}%</td>
          </tr>
        `
      )
      .join("");
    const report = window.open("", "_blank", "width=960,height=720");
    if (!report) return;
    report.document.write(`
      <html>
        <head>
          <title>SBHS Teacher Salary Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 8px; }
            p { margin: 0 0 18px; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px 12px; border-bottom: 1px solid #d1d5db; text-align: left; font-size: 14px; }
            th { background: #f3f4f6; text-transform: uppercase; letter-spacing: 0.06em; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>SBHS Teacher Salary Report</h1>
          <p>Generated on ${today}</p>
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>ID</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    report.document.close();
    report.focus();
    report.print();
  };

  const openTeacherProfileModal = (teacher) => {
    const performance = teacherPerformanceMeta(teacher);
    openTeacherModal({
      label: "Teacher Profile",
      title: teacher.name,
      body: `
        <div class="modal-profile-grid">
          <div class="modal-profile-card">
            <span class="teacher-record-avatar large">${escapeHtml(initials(teacher.name))}</span>
            <strong>${escapeHtml(teacher.subject)}</strong>
            <p class="muted small">${escapeHtml(teacher.id)} | ${escapeHtml(teacher.classTeacherOf)}</p>
          </div>
          <div class="modal-profile-card">
            <strong>Salary</strong>
            <p class="muted small">${formatCurrency(teacher.salary)} | ${salaryStatusLabel(teacher)}</p>
            <strong>Attendance</strong>
            <p class="muted small">${teacher.attendancePercent}% | ${performance.label}</p>
          </div>
          <div class="modal-profile-card">
            <strong>Contact</strong>
            <p class="muted small">${escapeHtml(teacher.phone || "Not added")}</p>
            <p class="muted small">${escapeHtml(teacher.email || "Not added")}</p>
          </div>
          <div class="modal-profile-card">
            <strong>Joining Date</strong>
            <p class="muted small">${escapeHtml(teacher.joiningDate || "Not added")}</p>
            <strong>Photo</strong>
            <p class="muted small">${escapeHtml(teacher.photoName || "No local file selected")}</p>
          </div>
        </div>
      `,
    });
  };

  const openTeacherHistoryModal = (teacher) => {
    const history = (teacher.salaryHistory || []).length
      ? teacher.salaryHistory
          .map(
            (entry) => `
              <article class="modal-history-row">
                <div>
                  <strong>${entry.status === "paid" ? "Salary Paid" : "Marked Pending"}</strong>
                  <p class="muted small">${escapeHtml(entry.month)} | ${escapeHtml(entry.date)}</p>
                </div>
                <div class="modal-history-amount">
                  <strong>${formatCurrency(entry.amount)}</strong>
                  <p class="muted small">${escapeHtml(entry.note || "No note")}</p>
                </div>
              </article>
            `
          )
          .join("")
      : '<p class="muted small">No salary payment history recorded yet.</p>';
    openTeacherModal({
      label: "Salary Payment History",
      title: `${teacher.name} History`,
      body: `
        <div class="modal-summary-bar">
          <span class="tag ${teacher.salaryPaid ? "success" : "warning"}">${salaryStatusLabel(teacher)}</span>
          <span class="teacher-inline-badge ${teacherAttendanceMeta(teacher).tone}">${teacher.attendancePercent}% attendance</span>
        </div>
        <div class="modal-history-list">${history}</div>
      `,
    });
  };

  const openTeacherAnalyticsModal = (data) => {
    const teachers = data.teachers
      .slice()
      .sort((a, b) => Number(b.attendancePercent || 0) - Number(a.attendancePercent || 0));
    const rows = teachers
      .map(
        (teacher) => `
          <article class="modal-history-row">
            <div>
              <strong>${escapeHtml(teacher.name)}</strong>
              <p class="muted small">${escapeHtml(teacher.subject)} | ${escapeHtml(teacher.classTeacherOf)}</p>
            </div>
            <div class="modal-history-amount">
              <strong>${teacher.attendancePercent}%</strong>
              <p class="muted small">${teacherAttendanceMeta(teacher).label}</p>
            </div>
          </article>
        `
      )
      .join("");
    openTeacherModal({
      label: "Attendance Analytics",
      title: "Teacher Attendance Leaderboard",
      body: `<div class="modal-history-list">${rows}</div>`,
    });
  };

  const openTeacherHistorySummaryModal = (data) => {
    const summaryEntries = data.teachers
      .flatMap((teacher) =>
        (teacher.salaryHistory || []).map((entry) => ({
          ...entry,
          teacherName: teacher.name,
          teacherId: teacher.id,
        }))
      )
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const body = summaryEntries.length
      ? summaryEntries
          .map(
            (entry) => `
              <article class="modal-history-row">
                <div>
                  <strong>${escapeHtml(entry.teacherName)}</strong>
                  <p class="muted small">${escapeHtml(entry.teacherId)} | ${escapeHtml(entry.month)}</p>
                </div>
                <div class="modal-history-amount">
                  <strong>${formatCurrency(entry.amount)}</strong>
                  <p class="muted small">${entry.status === "paid" ? "Paid" : "Pending"} | ${escapeHtml(
                    entry.date
                  )}</p>
                </div>
              </article>
            `
          )
          .join("")
      : '<p class="muted small">No salary history available yet.</p>';
    openTeacherModal({
      label: "Salary Payment History",
      title: "All Teacher Salary Records",
      body: `<div class="modal-history-list">${body}</div>`,
    });
  };

  const adminRerender = () => {
    const data = getData();
    renderTeacherFilterOptions(data);
    renderAdminStats(data);
    renderTeacherMetrics(data);
    renderTeacherTable(data);
    renderTeacherAnalytics(data);
    renderStudentListTable(data);
    renderStudentTable(data);
    renderFeeSummary(data);
    renderStudentOptions(data);
    renderNoticeList(data, "notice-list");
    const currentId = document.getElementById("update-student-id").value || data.students[0]?.id;
    if (currentId) {
      document.getElementById("update-student-id").value = currentId;
      populateStudentUpdateForm(data, currentId);
    }
  };

  const initAdminPage = () => {
    const session = requireRole("admin");
    if (!session) return;
    bindLogout("logout-admin");
    initAdminSectionTabs();
    adminRerender();

    const teacherForm = document.getElementById("teacher-form");
    const teacherSubmitButton = document.getElementById("teacher-submit-button");
    const teacherPasswordInput = document.getElementById("teacher-password-input");
    const teacherPasswordToggle = document.getElementById("teacher-password-toggle");
    const teacherCancelEdit = document.getElementById("teacher-cancel-edit");

    if (teacherPasswordToggle && teacherPasswordInput) {
      teacherPasswordToggle.addEventListener("click", () => {
        const showPassword = teacherPasswordInput.type === "password";
        teacherPasswordInput.type = showPassword ? "text" : "password";
        teacherPasswordToggle.textContent = showPassword ? "Hide" : "Show";
      });
    }

    if (teacherCancelEdit) {
      teacherCancelEdit.addEventListener("click", () => {
        teacherForm.reset();
        teacherForm.elements.namedItem("teacherId").value = "";
        teacherSubmitButton.textContent = "Create Teacher";
        teacherCancelEdit.classList.add("is-hidden");
        setMessage("teacher-form-message", "");
      });
    }

    teacherForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const data = getData();
      const teacherId = String(formData.get("teacherId") || "").trim();
      const photoFile = formData.get("photo");
      teacherSubmitButton.textContent = teacherId ? "Updating..." : "Creating...";
      teacherSubmitButton.disabled = true;

      if (teacherId) {
        const teacher = data.teachers.find((entry) => entry.id === teacherId);
        if (!teacher) {
          teacherSubmitButton.textContent = "Create Teacher";
          teacherSubmitButton.disabled = false;
          return;
        }
        teacher.password = String(formData.get("password")).trim();
        teacher.name = String(formData.get("name")).trim();
        teacher.subject = String(formData.get("subject")).trim();
        teacher.classTeacherOf = String(formData.get("classTeacherOf")).trim();
        teacher.salary = Number(formData.get("salary"));
        teacher.phone = String(formData.get("phone") || "").trim();
        teacher.email = String(formData.get("email") || "").trim();
        teacher.joiningDate = String(formData.get("joiningDate") || "").trim();
        if (photoFile && typeof photoFile === "object" && photoFile.name) {
          teacher.photoName = photoFile.name;
        }
      } else {
        const nextTeacherNumber =
          data.teachers.reduce((max, entry) => Math.max(max, Number(String(entry.id).replace(/\D/g, "")) || 0), 0) + 1;
        const nextId = `SBHS-T${String(nextTeacherNumber).padStart(3, "0")}`;
        data.teachers.push({
          id: nextId,
          password: String(formData.get("password")).trim(),
          name: String(formData.get("name")).trim(),
          subject: String(formData.get("subject")).trim(),
          classTeacherOf: String(formData.get("classTeacherOf")).trim(),
          salary: Number(formData.get("salary")),
          attendancePercent: 90,
          salaryPaid: false,
          phone: String(formData.get("phone") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          joiningDate: String(formData.get("joiningDate") || "").trim(),
          photoName:
            photoFile && typeof photoFile === "object" && photoFile.name ? photoFile.name : "",
          todayStatus: "present",
          salaryHistory: [],
        });
        setMessage("teacher-form-message", `Teacher created successfully. Login ID: ${nextId}`);
      }
      saveData(data);
      form.reset();
      form.elements.namedItem("teacherId").value = "";
      teacherSubmitButton.textContent = "Create Teacher";
      teacherSubmitButton.disabled = false;
      teacherCancelEdit.classList.add("is-hidden");
      teacherPasswordInput.type = "password";
      teacherPasswordToggle.textContent = "Show";
      if (teacherId) {
        setMessage("teacher-form-message", "Teacher record updated successfully.");
      }
      adminRerender();
    });

    document.getElementById("student-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const data = getData();
      const totalFees = Number(formData.get("totalFees"));
      const nextId = `SBHS-S${String(data.students.length + 1).padStart(3, "0")}`;
      data.students.push({
        id: nextId,
        password: String(formData.get("password")).trim(),
        name: String(formData.get("name")).trim(),
        className: String(formData.get("className")).trim(),
        rollNo: String(formData.get("rollNo")).trim(),
        totalFees,
        paidFees: 0,
        pendingFees: totalFees,
        dueDate: `${currentMonth}-20`,
        fine: 0,
        attendancePercent: 88,
        performanceAverage: 75,
        performance: [
          { subject: "Math", score: 74 },
          { subject: "Science", score: 76 },
          { subject: "English", score: 75 },
        ],
      });
      saveData(data);
      form.reset();
      setMessage("student-form-message", `Student created successfully. Login ID: ${nextId}`);
      adminRerender();
    });

    document.getElementById("notice-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const data = getData();
      data.notices.push({
        id: `notice-${Date.now()}`,
        title: String(formData.get("title")).trim(),
        message: String(formData.get("message")).trim(),
        date: today,
      });
      saveData(data);
      form.reset();
      setMessage("notice-form-message", "Notice published successfully.");
      adminRerender();
    });

    document.getElementById("update-student-id").addEventListener("change", (event) => {
      populateStudentUpdateForm(getData(), event.target.value);
    });

    const bindSearchButton = (inputId, buttonId, filterKey) => {
      const input = document.getElementById(inputId);
      const button = document.getElementById(buttonId);
      if (!input || !button) return;
      const runSearch = () => {
        adminFilters[filterKey] = input.value.trim();
        adminRerender();
      };
      button.addEventListener("click", runSearch);
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          runSearch();
        }
      });
    };

    bindSearchButton("student-search-input", "student-search-button", "student");
    bindSearchButton(
      "finance-student-search-input",
      "finance-student-search-button",
      "financeStudent"
    );

    document
      .getElementById("student-update-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = getData();
        const student = data.students.find((entry) => entry.id === formData.get("studentId"));
        if (!student) return;
        student.className = String(formData.get("className")).trim();
        student.totalFees = Number(formData.get("totalFees"));
        student.paidFees = Number(formData.get("paidFees"));
        student.pendingFees = Number(formData.get("pendingFees"));
        student.dueDate = String(formData.get("dueDate")).trim();
        student.fine = Number(formData.get("fine"));
        saveData(data);
        setMessage("student-update-message", "Student class and fee record updated.");
        adminRerender();
      });

    const teacherSearchInput = document.getElementById("teacher-search-input");
    const teacherClassFilter = document.getElementById("teacher-class-filter");
    const teacherSalaryFilter = document.getElementById("teacher-salary-filter");
    const teacherAttendanceFilter = document.getElementById("teacher-attendance-filter");
    const teacherSortFilter = document.getElementById("teacher-sort-filter");
    const teacherBulkPaidButton = document.getElementById("teacher-bulk-paid-button");
    const teacherExportPdfButton = document.getElementById("teacher-export-pdf-button");
    const teacherExportCsvButton = document.getElementById("teacher-export-csv-button");
    const teacherHistorySummaryButton = document.getElementById("teacher-history-summary-button");
    const teacherAnalyticsModalButton = document.getElementById("teacher-analytics-modal-button");
    const teacherModalClose = document.getElementById("teacher-modal-close");

    if (teacherSearchInput) {
      teacherSearchInput.addEventListener("input", (event) => {
        adminFilters.teacherQuery = event.target.value.trim();
        adminRerender();
      });
    }
    if (teacherClassFilter) {
      teacherClassFilter.addEventListener("change", (event) => {
        adminFilters.teacherClass = event.target.value;
        adminRerender();
      });
    }
    if (teacherSalaryFilter) {
      teacherSalaryFilter.addEventListener("change", (event) => {
        adminFilters.teacherSalaryStatus = event.target.value;
        adminRerender();
      });
    }
    if (teacherAttendanceFilter) {
      teacherAttendanceFilter.addEventListener("change", (event) => {
        adminFilters.teacherAttendance = event.target.value;
        adminRerender();
      });
    }
    if (teacherSortFilter) {
      teacherSortFilter.addEventListener("change", (event) => {
        adminFilters.teacherSort = event.target.value;
        adminRerender();
      });
    }
    if (teacherBulkPaidButton) {
      teacherBulkPaidButton.addEventListener("click", () => {
        const data = getData();
        const filteredTeachers = getFilteredTeachers(data);
        filteredTeachers.forEach((teacher) => {
          if (!teacher.salaryPaid) {
            setTeacherSalaryStatus(teacher, true, "Bulk salary payment from admin dashboard.");
          }
        });
        saveData(data);
        setMessage("teacher-form-message", `${filteredTeachers.length} filtered teacher(s) reviewed for salary payment.`);
        adminRerender();
      });
    }
    teacherExportPdfButton?.addEventListener("click", () => exportTeacherSalaryPdf(getData()));
    teacherExportCsvButton?.addEventListener("click", () => exportTeacherAttendanceCsv(getData()));
    teacherHistorySummaryButton?.addEventListener("click", () => openTeacherHistorySummaryModal(getData()));
    teacherAnalyticsModalButton?.addEventListener("click", () => openTeacherAnalyticsModal(getData()));
    teacherModalClose?.addEventListener("click", closeTeacherModal);

    document.body.addEventListener("click", (event) => {
      if (event.target.matches("[data-modal-close]")) {
        closeTeacherModal();
        return;
      }
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      const id = button.dataset.id;
      const data = getData();
      const teacher = data.teachers.find((entry) => entry.id === id);

      if (action.startsWith("teacher-") && !teacher) return;

      if (action === "teacher-mark-paid") {
        setTeacherSalaryStatus(teacher, true, "Marked paid from quick action.");
        teacher.todayStatus = teacher.attendancePercent >= 92 ? "present" : teacher.todayStatus;
      }
      if (action === "teacher-mark-pending") {
        setTeacherSalaryStatus(teacher, false, "Marked pending from quick action.");
      }
      if (action === "teacher-edit") {
        teacherForm.elements.namedItem("teacherId").value = teacher.id;
        teacherForm.elements.namedItem("name").value = teacher.name;
        teacherForm.elements.namedItem("subject").value = teacher.subject;
        teacherForm.elements.namedItem("classTeacherOf").value = teacher.classTeacherOf;
        teacherForm.elements.namedItem("salary").value = teacher.salary;
        teacherForm.elements.namedItem("phone").value = teacher.phone || "";
        teacherForm.elements.namedItem("email").value = teacher.email || "";
        teacherForm.elements.namedItem("joiningDate").value = teacher.joiningDate || "";
        teacherForm.elements.namedItem("password").value = teacher.password;
        teacherSubmitButton.textContent = "Update Teacher";
        teacherCancelEdit.classList.remove("is-hidden");
        setMessage("teacher-form-message", `Editing ${teacher.name}. Update and save the form.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (action === "teacher-profile") {
        openTeacherProfileModal(teacher);
        return;
      }
      if (action === "teacher-history") {
        openTeacherHistoryModal(teacher);
        return;
      }
      if (action === "teacher-delete") {
        if (!window.confirm(`Delete ${teacher.name} from the teacher dashboard?`)) return;
        data.teachers = data.teachers.filter((entry) => entry.id !== id);
      }

      saveData(data);
      adminRerender();
    });
  };

  const renderTeacherPage = () => {
    const session = requireRole("teacher");
    if (!session) return;
    const data = getData();
    const teacher = data.teachers.find((entry) => entry.id === session.id);
    const availableClasses = Array.from(
      new Set([teacher.classTeacherOf, ...data.students.map((student) => student.className)])
    ).filter(Boolean);
    const selectedClass =
      document.getElementById("teacher-attendance-class")?.value || teacher.classTeacherOf;
    const detailsSelectedClass =
      document.getElementById("teacher-details-class")?.value || teacher.classTeacherOf;
    const uploadHomeworkClass =
      document.getElementById("teacher-homework-class")?.value || teacher.classTeacherOf;
    const uploadResourceClass =
      document.getElementById("teacher-resource-class")?.value || teacher.classTeacherOf;
    const detailsSearchQuery = String(
      document.getElementById("teacher-details-search")?.value || ""
    )
      .trim()
      .toLowerCase();
    const classStudents = data.students.filter((student) => student.className === teacher.classTeacherOf);
    const attendanceStudents = data.students.filter((student) => student.className === selectedClass);
    const detailsStudents = data.students.filter(
      (student) =>
        student.className === detailsSelectedClass &&
        (!detailsSearchQuery || student.name.toLowerCase().includes(detailsSearchQuery))
    );

    document.getElementById("teacher-name").textContent = teacher.name;
    document.getElementById("teacher-meta").textContent = `${teacher.subject} | ${teacher.id}`;
    document.getElementById("teacher-avatar").textContent = initials(teacher.name);
    document.getElementById("teacher-class-title").textContent = teacher.classTeacherOf;
    document.getElementById("teacher-class-summary").textContent =
      `${classStudents.length} students connected to this class dashboard.`;
    document.getElementById("teacher-attendance-rate").textContent =
      `${teacher.attendancePercent}%`;
    document.getElementById("teacher-student-count").textContent = classStudents.length;
    document.getElementById("teacher-overview-list").innerHTML = `
      <article class="list-card compact-list-card">
        <strong>Current Class Strength</strong>
        <p class="muted small">${classStudents.length} students connected to ${teacher.classTeacherOf}.</p>
      </article>
      <article class="list-card compact-list-card">
        <strong>Attendance Ready</strong>
        <p class="muted small">Teacher attendance is ${teacher.attendancePercent}% and student attendance can be marked below.</p>
      </article>
      <article class="list-card compact-list-card">
        <strong>Uploads Ready</strong>
        <p class="muted small">Homework, notes, and test papers can be posted from one compact section.</p>
      </article>
    `;

    const classSelect = document.getElementById("teacher-attendance-class");
    if (classSelect) {
      classSelect.innerHTML = availableClasses
        .map(
          (className) => `
            <option value="${className}" ${className === selectedClass ? "selected" : ""}>${className}</option>
          `
        )
        .join("");
    }
    const detailsSelect = document.getElementById("teacher-details-class");
    if (detailsSelect) {
      detailsSelect.innerHTML = availableClasses
        .map(
          (className) => `
            <option value="${className}" ${className === detailsSelectedClass ? "selected" : ""}>${className}</option>
          `
        )
        .join("");
    }
    const homeworkClassSelect = document.getElementById("teacher-homework-class");
    if (homeworkClassSelect) {
      homeworkClassSelect.innerHTML = availableClasses
        .map(
          (className) => `
            <option value="${className}" ${className === uploadHomeworkClass ? "selected" : ""}>${className}</option>
          `
        )
        .join("");
    }
    const resourceClassSelect = document.getElementById("teacher-resource-class");
    if (resourceClassSelect) {
      resourceClassSelect.innerHTML = availableClasses
        .map(
          (className) => `
            <option value="${className}" ${className === uploadResourceClass ? "selected" : ""}>${className}</option>
          `
        )
        .join("");
    }
    const dateField = document.getElementById("teacher-attendance-date");
    if (dateField && !dateField.value) {
      dateField.value = todayIso;
    }
    document.getElementById("teacher-roll-hint").textContent = attendanceStudents.length
      ? `Available roll numbers: ${attendanceStudents.map((student) => student.rollNo).join(", ")}`
      : "No students found in this class.";

    document.getElementById("teacher-student-details-list").innerHTML = detailsStudents
      .map(
        (student) => `
          <div class="teacher-student-row teacher-student-row-inline">
            <div class="teacher-student-main">
              <strong>${student.name}</strong>
            </div>
            <a class="teacher-action-link" href="./student.html?preview=${encodeURIComponent(student.id)}">Open Dashboard</a>
          </div>
        `
      )
      .join("");

    const resources = data.resources
      .filter((item) => item.teacherId === teacher.id && item.className === uploadResourceClass)
      .slice()
      .reverse();
    const homework = data.homework
      .filter((item) => item.teacherId === teacher.id && item.className === uploadHomeworkClass)
      .slice()
      .reverse();
    const merged = [
      ...homework.map((item) => ({ ...item, type: "homework" })),
      ...resources,
    ].sort((a, b) => b.id.localeCompare(a.id));

    document.getElementById("teacher-resource-list").innerHTML = merged
      .map(
        (item) => `
          <article class="list-card compact-list-card">
            <strong>${item.title}</strong>
            <p class="muted small">${item.type.toUpperCase()} | ${item.className}</p>
            <p class="muted small">${item.description}</p>
            ${
              item.attachmentName
                ? `<p class="muted small">Attachment: ${item.attachmentName}</p>`
                : ""
            }
          </article>
        `
      )
      .join("");
  };

  const initTeacherPage = () => {
    const session = requireRole("teacher");
    if (!session) return;
    bindLogout("logout-teacher");
    initTeacherSectionTabs();
    renderTeacherPage();

    document.getElementById("teacher-student-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const data = getData();
      const teacher = data.teachers.find((entry) => entry.id === session.id);
      const totalFees = Number(formData.get("totalFees"));
      const nextId = `SBHS-S${String(data.students.length + 1).padStart(3, "0")}`;
      const performance = [
        { subject: "Math", score: 0 },
        { subject: "Science", score: 0 },
        { subject: "English", score: 0 },
      ];
      data.students.push({
        id: nextId,
        password: String(formData.get("password")).trim(),
        name: String(formData.get("name")).trim(),
        className: teacher.classTeacherOf,
        rollNo: String(formData.get("rollNo")).trim(),
        totalFees,
        paidFees: 0,
        pendingFees: totalFees,
        dueDate: `${currentMonth}-20`,
        fine: 0,
        attendancePercent: 0,
        performanceAverage: calculatePerformanceAverage(performance),
        performance,
      });
      saveData(data);
      form.reset();
      setMessage("teacher-student-message", `Student added successfully. Login ID: ${nextId}`);
      renderTeacherPage();
    });

    document
      .getElementById("teacher-attendance-class")
      .addEventListener("change", () => renderTeacherPage());
    document
      .getElementById("teacher-details-class")
      .addEventListener("change", () => renderTeacherPage());
    const detailsSearchInput = document.getElementById("teacher-details-search");
    const detailsSearchButton = document.getElementById("teacher-details-search-button");
    if (detailsSearchInput && detailsSearchButton) {
      detailsSearchButton.addEventListener("click", () => renderTeacherPage());
      detailsSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          renderTeacherPage();
        }
      });
    }
    document
      .getElementById("teacher-homework-class")
      .addEventListener("change", () => renderTeacherPage());
    document
      .getElementById("teacher-resource-class")
      .addEventListener("change", () => renderTeacherPage());

    document.getElementById("teacher-attendance-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const data = getData();
      const selectedClass = String(formData.get("className")).trim();
      const rollNumbers = String(formData.get("rollNumbers") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const attendanceDate = String(formData.get("attendanceDate") || todayIso).trim();
      const status = String(formData.get("status") || "present").trim();
      const notes = String(formData.get("notes") || "").trim();
      const targetStudents = data.students.filter(
        (student) =>
          student.className === selectedClass &&
          rollNumbers.some((roll) => student.rollNo.toLowerCase() === roll.toLowerCase())
      );

      if (!targetStudents.length) {
        setMessage(
          "teacher-attendance-message",
          "No matching roll numbers found for the selected class.",
          false
        );
        return;
      }

      targetStudents.forEach((student) => {
        if (status === "present") {
          student.attendancePercent = Math.min(100, student.attendancePercent + 1);
        } else if (status === "absent") {
          student.attendancePercent = Math.max(0, student.attendancePercent - 1);
        } else {
          student.attendancePercent = Math.min(100, student.attendancePercent + 0.5);
        }
        data.attendanceLogs = data.attendanceLogs || [];
        data.attendanceLogs.push({
          id: `att-${Date.now()}-${student.id}`,
          teacherId: session.id,
          studentId: student.id,
          className: selectedClass,
          rollNo: student.rollNo,
          status,
          attendanceDate,
          notes,
        });
      });
      saveData(data);
      form.reset();
      document.getElementById("teacher-attendance-class").value = selectedClass;
      document.getElementById("teacher-attendance-date").value = attendanceDate;
      setMessage(
        "teacher-attendance-message",
        `Attendance saved for ${selectedClass}: ${targetStudents.length} student(s) marked ${status}.`
      );
      renderTeacherPage();
    });

    document.getElementById("homework-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const data = getData();
      const teacher = data.teachers.find((entry) => entry.id === session.id);
      const selectedClass = String(formData.get("className") || teacher.classTeacherOf).trim();
      const attachmentFile = formData.get("attachmentFile");
      data.homework.push({
        id: `hw-${Date.now()}`,
        className: selectedClass,
        teacherId: teacher.id,
        title: String(formData.get("title")).trim(),
        description: String(formData.get("description")).trim(),
        attachmentName:
          attachmentFile && typeof attachmentFile === "object" && attachmentFile.name
            ? attachmentFile.name
            : "",
        attachmentType:
          attachmentFile && typeof attachmentFile === "object" && attachmentFile.type
            ? attachmentFile.type
            : "",
        date: today,
      });
      saveData(data);
      form.reset();
      setMessage("homework-message", "Homework uploaded successfully.");
      renderTeacherPage();
    });

    document.getElementById("resource-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const data = getData();
      const teacher = data.teachers.find((entry) => entry.id === session.id);
      const selectedClass = String(formData.get("className") || teacher.classTeacherOf).trim();
      const attachmentFile = formData.get("attachmentFile");
      data.resources.push({
        id: `res-${Date.now()}`,
        type: String(formData.get("type")),
        className: selectedClass,
        teacherId: teacher.id,
        title: String(formData.get("title")).trim(),
        description: String(formData.get("description")).trim(),
        attachmentName:
          attachmentFile && typeof attachmentFile === "object" && attachmentFile.name
            ? attachmentFile.name
            : "",
        attachmentType:
          attachmentFile && typeof attachmentFile === "object" && attachmentFile.type
            ? attachmentFile.type
            : "",
        date: today,
      });
      saveData(data);
      form.reset();
      setMessage("resource-message", "Resource uploaded successfully.");
      renderTeacherPage();
    });

  };

  const renderStudentPage = () => {
    const previewStudentId = new URLSearchParams(window.location.search).get("preview");
    const session = getSession();
    if (!previewStudentId) {
      if (!requireRole("student")) return;
    } else if (!session || (session.role !== "teacher" && session.role !== "admin")) {
      window.location.href = "./login.html?role=teacher";
      return;
    }
    const data = getData();
    const student = data.students.find((entry) => entry.id === (previewStudentId || session.id));
    if (!student) return;
    const homework = data.homework.filter((item) => item.className === student.className).slice().reverse();
    const resources = data.resources.filter((item) => item.className === student.className).slice().reverse();
    const bestSubject = student.performance
      .slice()
      .sort((left, right) => Number(right.score || 0) - Number(left.score || 0))[0];
    const focusSubject = student.performance
      .slice()
      .sort((left, right) => Number(left.score || 0) - Number(right.score || 0))[0];
    const nearestHomework = homework[0];
    const feeMessage =
      Number(student.pendingFees || 0) > 0
        ? `Pending ${formatCurrency(student.pendingFees)} before ${student.dueDate || "the due date"}.`
        : "All fees are paid. No payment pending right now.";
    const reminderCards = [
      nearestHomework
        ? {
            title: "Complete homework",
            text: `${nearestHomework.title} is available for ${student.className}.`,
          }
        : {
            title: "Homework clear",
            text: "No homework is pending right now.",
          },
      {
        title: "Fee reminder",
        text: feeMessage,
      },
      {
        title: "Attendance goal",
        text:
          Number(student.attendancePercent || 0) >= 90
            ? "Attendance is in a safe range. Keep it up."
            : "Attendance needs attention. Stay regular in class.",
      },
    ];

    document.getElementById("student-name").textContent = student.name;
    document.getElementById("student-meta").textContent = `${student.className} | ${student.id}`;
    document.getElementById("student-avatar").textContent = initials(student.name);
    document.getElementById("student-class-title").textContent = student.className;
    document.getElementById("student-summary").textContent =
      `${homework.length} homework items and ${data.notices.length} notices available.`;
    document.getElementById("student-attendance").textContent = `${student.attendancePercent}%`;
    document.getElementById("student-pending-fees").textContent = formatCurrency(student.pendingFees);
    document.getElementById("student-performance-average").textContent =
      `Average: ${student.performanceAverage}%`;
    document.getElementById("student-homework-summary").textContent = nearestHomework
      ? nearestHomework.title
      : "No homework pending";
    document.getElementById("student-notice-summary").textContent =
      data.notices.length ? `${data.notices.length} active school notices` : "No new notices";
    document.getElementById("student-best-subject").textContent = bestSubject
      ? `${bestSubject.subject} ${bestSubject.score}%`
      : "No marks yet";
    document.getElementById("student-focus-subject").textContent = focusSubject
      ? `${focusSubject.subject} ${focusSubject.score}%`
      : "No marks yet";
    document.getElementById("student-reminder-list").innerHTML = reminderCards
      .map(
        (item) => `
          <article class="list-card compact-list-card">
            <strong>${item.title}</strong>
            <p class="muted small">${item.text}</p>
          </article>
        `
      )
      .join("");

    document.getElementById("student-homework-list").innerHTML = homework.length
      ? homework
          .map(
            (item) => `
              <article class="list-card">
                <strong>${item.title}</strong>
                <p class="muted small">${item.description}</p>
                ${item.attachmentName ? `<p class="muted small">Attachment: ${item.attachmentName}</p>` : ""}
                <p class="small muted">${item.date}</p>
              </article>
            `
          )
          .join("")
      : `<p class="muted small">No homework uploaded yet.</p>`;

    document.getElementById("student-performance-list").innerHTML = student.performance
      .map(
        (item) => `
          <article class="list-card inline-between">
            <strong>${item.subject}</strong>
            <span>${item.score}%</span>
          </article>
        `
      )
      .join("");

    document.getElementById("student-resources-list").innerHTML = resources.length
      ? resources
          .map(
            (item) => `
              <article class="list-card">
                <strong>${item.title}</strong>
                <p class="muted small">${item.type.toUpperCase()}</p>
                <p class="muted small">${item.description}</p>
                ${item.attachmentName ? `<p class="muted small">Attachment: ${item.attachmentName}</p>` : ""}
              </article>
            `
          )
          .join("")
      : `<p class="muted small">No notes or test papers yet.</p>`;

    renderNoticeList(data, "student-notices-list");

    document.getElementById("student-fee-status").innerHTML = `
      <article class="list-card">
        <strong>Total Fees</strong>
        <p class="muted small">${formatCurrency(student.totalFees)}</p>
      </article>
      <article class="list-card">
        <strong>Paid Fees</strong>
        <p class="muted small">${formatCurrency(student.paidFees)}</p>
      </article>
      <article class="list-card">
        <strong>Pending Fees</strong>
        <p class="muted small">${formatCurrency(student.pendingFees)}</p>
      </article>
      <article class="list-card">
        <strong>Due Date</strong>
        <p class="muted small">${student.dueDate || "-"}</p>
      </article>
      <article class="list-card">
        <strong>Fine</strong>
        <p class="muted small">${formatCurrency(student.fine || 0)}</p>
      </article>
    `;
  };

  const initStudentPage = () => {
    const previewStudentId = new URLSearchParams(window.location.search).get("preview");
    if (!previewStudentId) {
      const session = requireRole("student");
      if (!session) return;
    }
    bindLogout("logout-student");
    initStudentSectionTabs();
    renderStudentPage();
  };

  return {
    initLoginPage,
    initAdminPage,
    initTeacherPage,
    initStudentPage,
  };
})();

window.SBHSApp = SBHSApp;
