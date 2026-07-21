/**
 * WhatsApp Cloud API Notification Utility
 * Sends template messages to patients for appointment updates and follow-up alerts.
 */

export type WhatsAppTemplateName =
  | "appointment_confirmation"
  | "appointment_reminder"
  | "followup_notice";

export type WhatsAppPayload = {
  to: string; // Recipient mobile number (e.g. +91XXXXXXXXXX)
  template: WhatsAppTemplateName;
  parameters: string[]; // Parameters for template variables
};

export async function sendWhatsAppMessage(payload: WhatsAppPayload) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const isDemo = !token || !phoneNumberId;

  if (isDemo) {
    console.log("[WhatsApp Demo Node] Sending message:", {
      to: payload.to,
      template: payload.template,
      parameters: payload.parameters,
    });
    return {
      success: true,
      demo: true,
      message: `[Demo Mode] WhatsApp message sent to ${payload.to} using template: ${payload.template}`,
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: payload.to,
          type: "template",
          template: {
            name: payload.template,
            language: {
              code: "en_US",
            },
            components: [
              {
                type: "body",
                parameters: payload.parameters.map((param) => ({
                  type: "text",
                  text: param,
                })),
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "WhatsApp API request failed");
    }

    return {
      success: true,
      demo: false,
      messageId: data.messages?.[0]?.id || null,
    };
  } catch (err: any) {
    console.error("WhatsApp dispatch failed:", err);
    return {
      success: false,
      error: err.message || "Unknown communication dispatch error",
    };
  }
}
