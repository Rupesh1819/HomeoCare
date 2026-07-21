"use server";

import { sendWhatsAppMessage, type WhatsAppTemplateName } from "@/lib/whatsapp/send";

export async function sendTestMessage(templateTitle: string) {
  let template: WhatsAppTemplateName = "appointment_confirmation";
  let parameters = ["Elena Rodriguez", "15 Jun 2026 at 10:30 AM", "Navgaon Clinic"];

  if (templateTitle.toLowerCase().includes("reminder") || templateTitle.toLowerCase().includes("follow-up")) {
    template = "appointment_reminder";
    parameters = ["Elena Rodriguez", "15 Jun 2026 at 10:30 AM"];
  } else if (templateTitle.toLowerCase().includes("prescription")) {
    template = "followup_notice";
    parameters = ["Elena Rodriguez", "Natrum Muriaticum 200C"];
  }

  const result = await sendWhatsAppMessage({
    to: "+919876543210", // Test number
    template,
    parameters,
  });

  return result;
}
