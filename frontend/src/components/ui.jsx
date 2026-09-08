import React from 'react';

const TONE = {
  teal: 'bg-teal-500/10 text-teal-300 border-teal-400/20',
  cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/20',
  purple: 'bg-violet-500/10 text-violet-300 border-violet-400/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-400/20',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-400/20',
  slate: 'bg-white/5 text-slate-300 border-white/10',
};

const ICON_TONE = {
  teal: 'bg-teal-500/10 text-teal-300',
  cyan: 'bg-cyan-500/10 text-cyan-300',
  purple: 'bg-violet-500/10 text-violet-300',
  emerald: 'bg-emerald-500/10 text-emerald-300',
  amber: 'bg-amber-500/10 text-amber-300',
  rose: 'bg-rose-500/10 text-rose-300',
};

export function PageHeader({ eyebrow, title, description, accent = 'teal', action }) {
  const accents = {
    teal: 'text-teal-300',
    purple: 'text-violet-300',
    emerald: 'text-emerald-300',
    amber: 'text-amber-300',
    cyan: 'text-cyan-300',
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl space-y-2">
        {eyebrow && (
          <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${accents[accent] || accents.teal}`}>
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">{title}</h2>
        {description && <p className="text-sm leading-relaxed text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '', hover = false }) {
  return (
    <div className={`ui-card ${hover ? 'transition hover:border-white/20' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ icon: Icon, title, subtitle, action, tone = 'teal' }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${ICON_TONE[tone] || ICON_TONE.teal}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="text-[15px] font-semibold text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const variants = {
    primary:
      'bg-teal-400 text-slate-950 hover:bg-teal-300 shadow-sm shadow-teal-500/10',
    secondary:
      'bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10',
    ghost: 'text-slate-300 hover:bg-white/5 hover:text-white',
    purple:
      'bg-violet-500 text-white hover:bg-violet-400 shadow-sm shadow-violet-500/15',
    emerald:
      'bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-sm shadow-emerald-500/10',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'slate', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${TONE[tone] || TONE.slate} ${className}`}>
      {children}
    </span>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      {label && <label className="ui-label">{label}</label>}
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'teal' }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
        {Icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${ICON_TONE[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b101a]/60 px-6 py-12 text-center">
      {Icon && <Icon className="mx-auto mb-3 h-8 w-8 text-slate-600" />}
      <p className="text-sm font-medium text-slate-200">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">{description}</p>}
    </div>
  );
}

export function AlertBanner({ tone = 'teal', icon: Icon, children, trailing }) {
  return (
    <div className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3.5 text-sm ${TONE[tone]}`}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0" />}
        <div className="leading-relaxed">{children}</div>
      </div>
      {trailing}
    </div>
  );
}

export function TableWrap({ children }) {
  return <div className="overflow-x-auto">{children}</div>;
}
