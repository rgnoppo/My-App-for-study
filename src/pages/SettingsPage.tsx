import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { useTheme } from "../lib/theme";
import { exportBackup, importBackup, resetAllData } from "../db/backup";
import { useSyncContext } from "../lib/SyncContext";
import { signOut } from "../lib/auth";
import { LoginSheet } from "../components/LoginSheet";
import type { SyncStatus } from "../types";

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-ink-soft dark:text-ink-soft-d" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function Row({
  label,
  description,
  onClick,
  right,
  danger,
}: {
  label: string;
  description?: string;
  onClick?: () => void;
  right?: ReactNode;
  danger?: boolean;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-right ${
        onClick ? "active:bg-paper-dim dark:active:bg-paper-dim-d" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-medium ${danger ? "text-clay" : ""}`}>{label}</p>
        {description && (
          <p className="text-[12px] text-ink-soft dark:text-ink-soft-d mt-0.5">
            {description}
          </p>
        )}
      </div>
      {right ?? (onClick && <ChevronLeft />)}
    </Comp>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={`w-11 rounded-full relative transition-colors shrink-0 ${
        on ? "bg-accent" : "bg-line dark:bg-line-d"
      }`}
      style={{ height: 26 }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
        style={{ right: on ? 2 : 22 }}
      />
    </button>
  );
}

const SYNC_STATUS_LABEL: Record<SyncStatus, string> = {
  offline: "غير متصل",
  synced: "متزامن ✓",
  syncing: "بيتزامن...",
  error: "حصل خطأ في المزامنة",
};

const SYNC_STATUS_COLOR: Record<SyncStatus, string> = {
  offline: "text-ink-soft dark:text-ink-soft-d",
  synced: "text-accent",
  syncing: "text-amber",
  error: "text-clay",
};

export function SettingsPage() {
  const { dark, toggle } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const sync = useSyncContext();

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importBackup(file);
      setStatus("تم استيراد النسخة الاحتياطية بنجاح");
    } catch {
      setStatus("حصل خطأ، تأكد إن الملف نسخة احتياطية صحيحة");
    } finally {
      e.target.value = "";
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleReset = async () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      setTimeout(() => setConfirmingReset(false), 4000);
      return;
    }
    await resetAllData(sync.userId);
    setConfirmingReset(false);
    setStatus("تم مسح كل البيانات");
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    setStatus("تم تسجيل الخروج");
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <PageHeader title="الإعدادات" />

      <div className="px-4 pt-4 space-y-5">
        {status && (
          <div className="rounded-xl bg-accent-soft dark:bg-accent/10 text-accent text-[13px] font-medium px-3.5 py-2.5 text-center">
            {status}
          </div>
        )}

        <Card>
          <Row label="الوضع الداكن" right={<Toggle on={dark} onClick={toggle} />} />
        </Card>

        <div>
            <p className="text-[12px] font-medium text-ink-soft dark:text-ink-soft-d mb-2 px-1">
              المزامنة بين الأجهزة
            </p>
            <Card className="divide-y divide-line dark:divide-line-d">
              {sync.isLoggedIn ? (
                <>
                  <Row
                    label={sync.email ?? "مسجل الدخول"}
                    description={SYNC_STATUS_LABEL[sync.status]}
                    right={
                      <span className={`text-[12px] font-semibold ${SYNC_STATUS_COLOR[sync.status]}`}>
                        {sync.status === "syncing" ? "..." : ""}
                      </span>
                    }
                  />
                  <Row label="مزامنة الآن" onClick={sync.triggerSync} />
                  <Row label="تسجيل الخروج" onClick={handleSignOut} danger />
                </>
              ) : (
                <Row
                  label="تسجيل الدخول للمزامنة"
                  description="اربط الجهاز ده بباقي أجهزتك عشان بياناتك متفضلش موجودة حتى لو مسحت المتصفح"
                  onClick={() => setLoginOpen(true)}
                />
              )}
            </Card>
          </div>

        <div>
          <p className="text-[12px] font-medium text-ink-soft dark:text-ink-soft-d mb-2 px-1">
            البيانات
          </p>
          <Card className="divide-y divide-line dark:divide-line-d">
            <Row
              label="تصدير نسخة احتياطية"
              description="يحفظ كل بياناتك في ملف JSON على جهازك"
              onClick={() => exportBackup()}
            />
            <Row
              label="استيراد نسخة احتياطية"
              description="سيتم استبدال كل البيانات الحالية"
              onClick={handleImportClick}
            />
          </Card>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div>
          <p className="text-[12px] font-medium text-ink-soft dark:text-ink-soft-d mb-2 px-1">
            منطقة الخطر
          </p>
          <Card>
            <Row
              label={confirmingReset ? "دوس تاني للتأكيد" : "إعادة ضبط البيانات"}
              description={
                confirmingReset
                  ? "هيتم مسح كل حاجة نهائيًا، مفيش رجوع"
                  : "يمسح كل المواد والدروس والواجبات والأخطاء"
              }
              onClick={handleReset}
              danger
            />
          </Card>
        </div>

        <p className="text-center text-[12px] text-ink-soft/60 dark:text-ink-soft-d/60 pt-4">
          Study OS Plus Quantum Edition
          <br />
          ركز على التعلم... واترك التنظيم للتطبيق
        </p>
      </div>

      <LoginSheet open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
