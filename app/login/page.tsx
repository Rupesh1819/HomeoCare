"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ChevronRight,
  HeartPulse,
  HelpCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setIsPending(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await login(formData);
      if (result?.error) {
        setErrorMsg(result.error);
        setIsPending(false);
      } else {
        router.refresh(); // Force Next.js to re-fetch Server Components with new cookies
        router.push("/");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
      setIsPending(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-brand-panel">
        <div className="brand-lockup brand-lockup-light">
          <span className="brand-mark" style={{ background: 'transparent', padding: 0 }}>
            <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          </span>
          <div>
            <strong>HomeoCare Pro</strong>
            <small>Enterprise</small>
          </div>
        </div>
        <div className="login-hero">
          <span className="eyebrow-light">CLINICAL PRECISION, SIMPLIFIED</span>
          <h1>Better care begins with a complete patient story.</h1>
          <p>
            One secure workspace for consultations, appointments, prescriptions,
            reports, billing, and meaningful follow-up.
          </p>
          <div className="trust-row">
            <span>
              <ShieldCheck size={18} /> Role-based security
            </span>
            <span>
              <Activity size={18} /> Live practice insights
            </span>
          </div>
        </div>
        <div className="login-quote">
          <div className="doctor-avatar">MT</div>
          <div>
            <p>&ldquo;Every detail is exactly where the care team needs it.&rdquo;</p>
            <span>Dr. Madhukar Takpire, Clinical Director</span>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="mobile-login-brand">
          <span className="brand-mark" style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}>
            <img src="/logo.png" alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </span>
          <strong>HomeoCare Pro</strong>
        </div>
        <form className="login-card" onSubmit={handleSubmit}>
          <span className="kicker">SECURE CLINIC ACCESS</span>
          <h2>Welcome back, Doctor</h2>
          <p>
            Sign in to access your clinical dashboard and patient records.
          </p>

          {errorMsg && (
            <div className="security-note" style={{ color: "#ef4444", backgroundColor: "#fef2f2", borderColor: "#fca5a5" }}>
              <ShieldCheck size={16} /> {errorMsg}
            </div>
          )}

          <label className="field-label" htmlFor="email">
            Email address
          </label>
          <div className="input-with-icon">
            <Mail size={17} />
            <input
              id="email"
              name="email"
              type="email"
              defaultValue="doctor@homeocare.in"
              required
            />
          </div>

          <label className="field-label" htmlFor="password">
            Password
          </label>
          <div className="input-with-icon">
            <LockKeyhole size={17} />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              defaultValue="homeocare"
              required
            />
            <button
              className="icon-button inline-icon"
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <X size={16} /> : <Sparkles size={16} />}
            </button>
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <button type="button">Forgot password?</button>
          </div>

          <button className="button button-primary button-full" type="submit" disabled={isPending}>
            {isPending ? "Securing session..." : "Login to HomeoCare"}
            {!isPending && <ChevronRight size={17} />}
          </button>

          <div className="login-support">
            <HelpCircle size={16} />
            Technical difficulty?{" "}
            <a href="mailto:support@homeocare.in">Contact IT support</a>
          </div>
          <div className="security-note">
            <ShieldCheck size={16} /> Encrypted healthcare workspace
          </div>
        </form>
      </section>
    </div>
  );
}
