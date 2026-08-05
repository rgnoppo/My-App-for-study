import { useState } from "react";
import { Sheet } from "./Sheet";
import { Field, TextInput, PrimaryButton, SecondaryButton } from "./Field";
import { sendLoginCode, verifyLoginCode } from "../lib/auth";

export function LoginSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep("email");
    setEmail("");
    setCode("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSendCode = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await sendLoginCode(email.trim());
      setStep("code");
    } catch {
      setError("محصلش نبعت الكود. تأكد إن الإيميل ده متسجل في Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await verifyLoginCode(email.trim(), code.trim());
      handleClose();
    } catch {
      setError("الكود غلط أو منتهي، جرب تاني.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onClose={handleClose} title="تسجيل الدخول للمزامنة">
      {step === "email" && (
        <>
          <p className="text-[13px] text-ink-soft dark:text-ink-soft-d mb-4">
            هيوصلك كود على الإيميل عشان تربط الجهاز ده بباقي أجهزتك.
          </p>
          <Field label="الإيميل">
            <TextInput
              autoFocus
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          {error && <p className="text-[13px] text-clay mb-3">{error}</p>}
          <PrimaryButton onClick={handleSendCode} disabled={!email.trim() || loading}>
            {loading ? "جاري الإرسال..." : "إرسال الكود"}
          </PrimaryButton>
        </>
      )}

      {step === "code" && (
        <>
          <p className="text-[13px] text-ink-soft dark:text-ink-soft-d mb-4">
            بعتنا كود على {email}. اكتبه هنا.
          </p>
          <Field label="الكود">
            <TextInput
              autoFocus
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
          </Field>
          {error && <p className="text-[13px] text-clay mb-3">{error}</p>}
          <div className="space-y-2">
            <PrimaryButton onClick={handleVerify} disabled={!code.trim() || loading}>
              {loading ? "جاري التأكيد..." : "تأكيد ودخول"}
            </PrimaryButton>
            <SecondaryButton onClick={() => setStep("email")}>رجوع</SecondaryButton>
          </div>
        </>
      )}
    </Sheet>
  );
}
