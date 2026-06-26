import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const emailjsConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export async function sendEmail(payload) {
  if (!emailjsConfigured) {
    throw new Error("EmailJS is not configured. Add VITE_EMAILJS_* env vars.");
  }
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, payload, {
    publicKey: PUBLIC_KEY,
  });
}
