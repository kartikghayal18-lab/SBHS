import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Search,
  Sparkles,
} from "lucide-react";
import { formatCurrency, initialsFromName } from "../lib/formatters";

export const cn = (...parts) => parts.filter(Boolean).join(" ");

export const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.18, ease: "easeIn" } },
};

export const toneClasses = {
  success: "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20",
  warning: "bg-amber-500/12 text-amber-300 ring-1 ring-amber-400/20",
  danger: "bg-rose-500/12 text-rose-300 ring-1 ring-rose-400/20",
  info: "bg-indigo-500/12 text-indigo-300 ring-1 ring-indigo-400/20",
  neutral: "bg-white/8 text-slate-200 ring-1 ring-white/10",
};

export function AppCard({ className = "", children, accent = false }) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-white/8 bg-white/6 shadow-[0_10px_28px_rgba(15,23,42,0.16)] backdrop-blur-xl",
        accent && "bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-indigo-900/30",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? (
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-500/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-200 ring-1 ring-indigo-400/20">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-white xl:text-2xl">{title}</h2>
        {description ? <p className="mt-1.5 max-w-3xl text-sm text-slate-300/80">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({ tone = "neutral", children }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold", toneClasses[tone])}>
      {children}
    </span>
  );
}

export function GradientButton({ className = "", variant = "primary", children, ...props }) {
  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 text-slate-950 shadow-[0_14px_30px_rgba(79,70,229,0.35)] hover:-translate-y-0.5",
    secondary:
      "border border-white/12 bg-white/8 text-slate-100 backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white/12",
    danger:
      "border border-rose-400/20 bg-rose-500/10 text-rose-200 hover:-translate-y-0.5 hover:bg-rose-500/14",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, label, className = "", ...props }) {
  return (
    <button
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/8 text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/12",
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  tone = "info",
  sparkline,
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[22px] border border-white/8 bg-gradient-to-br from-slate-900/85 via-slate-900/65 to-white/8 p-3.5 shadow-[0_12px_28px_rgba(15,23,42,0.18)]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-white ring-1 ring-white/10">
          <Icon className="h-5 w-5" />
        </div>
        <Badge tone={tone}>{trend}</Badge>
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <div className="mt-1.5 flex items-end justify-between gap-4">
        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white xl:text-3xl">{value}</h3>
        <div className="flex items-end gap-1">
          {sparkline.map((bar, index) => (
            <span
              key={index}
              className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-sky-300 opacity-80"
              style={{ height: `${bar}px` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function SearchField({ value, onChange, placeholder = "Search" }) {
  return (
    <label className="flex min-w-[220px] flex-1 items-center gap-3 rounded-xl border border-white/8 bg-white/8 px-3.5 py-2.5 text-sm text-slate-200">
      <Search className="h-4 w-4 text-slate-400" />
      <input
        className="w-full bg-transparent outline-none placeholder:text-slate-500"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}

export function SelectField({ value, onChange, options, className = "" }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={cn(
        "min-h-11 rounded-xl border border-white/8 bg-white/8 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400/40",
        className
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-slate-950 text-slate-100">
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function InputField({ label, icon: Icon, helper, className = "", ...props }) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</span>
      <div className="flex min-h-11 items-center gap-3 rounded-xl border border-white/8 bg-slate-950/50 px-3.5">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        <input
          className="w-full bg-transparent py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          {...props}
        />
      </div>
      {helper ? <span className="text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}

export function TextAreaField({ label, className = "", ...props }) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</span>
      <textarea
        className="min-h-24 rounded-xl border border-white/8 bg-slate-950/50 px-3.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500"
        {...props}
      />
    </label>
  );
}

export function Modal({ open, onClose, title, subtitle, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0 bg-slate-950/72 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="relative z-10 w-full max-w-4xl rounded-[32px] border border-white/10 bg-slate-950/92 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.4)]"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">{subtitle}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{title}</h3>
              </div>
              <GradientButton variant="secondary" onClick={onClose}>
                Close
              </GradientButton>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/12 bg-white/4 px-5 py-10 text-center">
      <h4 className="text-base font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

export function ActivityFeed({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
          <div className={cn("mt-1 h-3 w-3 rounded-full", item.tone === "success" ? "bg-emerald-400" : item.tone === "warning" ? "bg-amber-400" : item.tone === "danger" ? "bg-rose-400" : "bg-indigo-400")} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-100">{item.title}</p>
            <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
          </div>
          <span className="shrink-0 text-xs text-slate-500">{item.time}</span>
        </div>
      ))}
    </div>
  );
}

export function QuickActionCard({ icon: Icon, title, description, onClick, tone = "default" }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group rounded-[22px] border border-white/8 bg-white/6 p-3.5 text-left transition duration-200 hover:-translate-y-1 hover:bg-white/8",
        tone === "accent" && "bg-gradient-to-br from-indigo-500/14 to-sky-400/10"
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-slate-50 ring-1 ring-white/10">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="mt-4 text-base font-semibold text-white">{title}</h4>
      <p className="mt-1.5 text-sm text-slate-400">{description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-200">
        Open action
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

export function TableShell({ children, className = "" }) {
  return (
    <div className={cn("overflow-hidden rounded-[22px] border border-white/8 bg-slate-950/30", className)}>
      {children}
    </div>
  );
}

export function DataTable({ columns, rows, renderRow, mobileCard }) {
  return (
    <>
      <div className="hidden lg:block">
        <TableShell>
          <div className="grid grid-cols-12 gap-4 border-b border-white/8 bg-white/6 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            {columns.map((column) => (
              <div key={column.label} className={column.className}>
                {column.label}
              </div>
            ))}
          </div>
          <div className="divide-y divide-white/8">{rows.map(renderRow)}</div>
        </TableShell>
      </div>
      <div className="grid gap-3 lg:hidden">{rows.map(mobileCard)}</div>
    </>
  );
}

export function AvatarBlock({ name, subtitle, meta, accent = "indigo" }) {
  const accentClass =
    accent === "emerald"
      ? "from-emerald-400/20 to-emerald-200/10"
      : accent === "amber"
        ? "from-amber-400/20 to-amber-200/10"
        : "from-indigo-400/20 to-sky-300/10";

  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-semibold text-white ring-1 ring-white/10", accentClass)}>
        {initialsFromName(name)}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-white">{name}</p>
        <p className="truncate text-sm text-slate-400">{subtitle}</p>
        {meta ? <p className="truncate text-xs text-slate-500">{meta}</p> : null}
      </div>
    </div>
  );
}

export function ProgressPill({ value, label, color = "indigo" }) {
  const progressClass =
    color === "emerald"
      ? "from-emerald-400 to-emerald-300"
      : color === "amber"
        ? "from-amber-400 to-orange-300"
        : "from-indigo-400 to-sky-300";
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/8">
        <div
          className={cn("h-2 rounded-full bg-gradient-to-r", progressClass)}
          style={{ width: `${Math.min(100, Number(value || 0))}%` }}
        />
      </div>
    </div>
  );
}

export function NotificationBell({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-100 transition hover:bg-white/12"
    >
      <Bell className="h-5 w-5" />
      {count ? (
        <span className="absolute right-2 top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function SummaryStat({ label, value, helper, icon: Icon, tone = "neutral" }) {
  return (
      <div className="rounded-[20px] border border-white/8 bg-white/5 p-3.5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</span>
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
      </div>
      <p className="mt-3 text-xl font-semibold text-white xl:text-2xl">{value}</p>
      <Badge tone={tone}>{helper}</Badge>
    </div>
  );
}

export function RevenueHighlight({ amount, label }) {
  return (
    <div className="rounded-[22px] border border-emerald-400/18 bg-gradient-to-br from-emerald-500/16 to-slate-900/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/70">{label}</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{formatCurrency(amount)}</h3>
    </div>
  );
}
