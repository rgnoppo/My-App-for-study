import { useState } from "react";
import { Sheet } from "./Sheet";
import { Field, TextInput, PrimaryButton } from "./Field";
import { signInWithPassword } from "../lib/auth";

export function LoginSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithPassword(email.trim(), password.trim());
      handleClose();
    } catch {
      setError("الإيميل أو كلمة السر غلط، جرب تاني.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <Sheet open={open} onClose={handleClose} title="تسجيل الدخول للمزامنة">
      <p className="text-[13px] text-ink-soft dark:text-ink-soft-d mb-4">
        سجل دخولك عشان تربط الجهاز ده بباقي أجهزتك وتزامن بياناتك.
      </p>

      <Field label="الإيميل">
        <TextInput
          autoFocus
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="you@example.com"
        />
      </Field>

      <Field label="كلمة السر">
        <TextInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="••••••••"
        />
      </Field>

      {error && <p className="text-[13px] text-clay mb-3">{error}</p>}

      <PrimaryButton
        onClick={handleLogin}
        disabled={!email.trim() || !password.trim() || loading}
      >
        {loading ? "جاري الدخول..." : "دخول"}
      </PrimaryButton>
    </Sheet>
  );
}
