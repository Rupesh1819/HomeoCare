"use client";

import { AlertCircle, Bell, CalendarDays, Clock3, History, MessageCircleMore, Pencil, Pill, Plus, ReceiptText, Send, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminProfile } from "@/app/actions/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { MetricCard } from "@/components/ui/MetricCard";
import { sendTestMessage } from "@/app/actions/whatsapp";
import type { LucideIcon } from "lucide-react";

export default function WhatsAppPage() {
  const { notify } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    getAdminProfile().then(p => {
      if (p.role === "LAB_TECHNICIAN" || p.role === "PHARMACIST") {
        router.push("/");
      }
    });
  }, [router]);
  const templates: { title: string; description: string; icon: LucideIcon; color: string }[] = [
    { title: "Appointment confirmation", description: "Sent immediately after booking", icon: CalendarDays, color: "blue" },
    { title: "Follow-up reminder", description: "Sent 24 hours before due date", icon: History, color: "amber" },
    { title: "Prescription ready", description: "Secure prescription delivery", icon: Pill, color: "violet" },
    { title: "Payment receipt", description: "Invoice and receipt confirmation", icon: ReceiptText, color: "green" },
    { title: "Birthday greeting", description: "Personalized patient greeting", icon: Sparkles, color: "pink" },
    { title: "Clinic announcement", description: "Branch-wide broadcast template", icon: Bell, color: "blue" },
  ];

  return (
    <div className="page-stack">
      <PageHeader title="Patient communication" description="Manage approved templates, transactional updates, and fallback SMS delivery." action={<button className="button button-whatsapp" onClick={() => notify("New WhatsApp campaign created.")}><MessageCircleMore size={17} /> New campaign</button>} />
      <div className="whatsapp-status">
        <span className="whatsapp-logo"><MessageCircleMore size={23} /></span>
        <div><span className="kicker">WHATSAPP BUSINESS API</span><h3>HomeoCare Navgaon</h3><p>Connected · Last message delivered 1 minute ago</p></div>
        <span className="connected-pill"><i />Connected</span>
        <button className="button button-secondary">Manage connection</button>
      </div>
      <div className="metric-grid metric-grid-4">
        <MetricCard icon={Send} label="Sent this month" value="4,821" note="98.4% delivered" tone="green" />
        <MetricCard icon={MessageCircleMore} label="Read rate" value="91.6%" note="+3.2% vs last month" tone="blue" />
        <MetricCard icon={Clock3} label="Scheduled" value="126" note="Next 7 days" tone="violet" />
        <MetricCard icon={AlertCircle} label="SMS fallback" value="18" note="0.4% of messages" tone="amber" />
      </div>
      <Panel>
        <div className="panel-heading"><div><span className="panel-kicker">APPROVED TEMPLATES</span><h3>Message library</h3></div><button className="button button-secondary"><Plus size={16} /> Create template</button></div>
        <div className="template-grid">
          {templates.map((t) => { const Icon = t.icon; return (
            <article className="template-card" key={t.title}>
              <span className={`card-icon card-icon-${t.color}`}><Icon size={19} /></span>
              <div><h3>{t.title}</h3><p>{t.description}</p></div>
              <button className="icon-button"><Pencil size={16} /></button>
              <footer>
                <span>English · Hindi · Marathi</span>
                <button
                  className="text-button"
                  onClick={async () => {
                    notify(`Sending "${t.title}" test message...`);
                    try {
                      const res = await sendTestMessage(t.title);
                      if (res.success) {
                        notify(
                          res.demo
                            ? `[Demo Mode] WhatsApp message printed to console.`
                            : `WhatsApp template "${t.title}" dispatched.`
                        );
                      } else {
                        notify(`WhatsApp failed: ${res.error}`);
                      }
                    } catch (err: any) {
                      notify(`Error: ${err.message || err}`);
                    }
                  }}
                >
                  Send test <Send size={14} />
                </button>
              </footer>
            </article>
          ); })}
        </div>
      </Panel>
    </div>
  );
}

