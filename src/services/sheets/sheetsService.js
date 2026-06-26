export const sheetsConfigured = () => Boolean(import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL);

/**
 * Sends inquiry details to Google Sheets via a Google Apps Script Web App webhook.
 * @param {Object} inquiryData 
 */
export async function saveToGoogleSheets(inquiryData) {
  const url = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
  console.log("[Google Sheets] Target Webhook URL:", url);
  if (!url) {
    console.warn("Google Sheets Webhook URL is not configured. Add VITE_GOOGLE_SHEETS_WEBHOOK_URL to your .env file.");
    return;
  }

  try {
    const payloadData = {
      ...inquiryData,
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    console.log("[Google Sheets] Sending payload:", payloadData);

    // Create a temporary hidden iframe to receive the response
    const iframe = document.createElement("iframe");
    iframe.name = "sheets_submit_iframe";
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Create a temporary form
    const form = document.createElement("form");
    form.action = url;
    form.method = "POST";
    form.target = "sheets_submit_iframe";

    // Add the payload as a form parameter
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify(payloadData);
    form.appendChild(input);

    document.body.appendChild(form);
    
    // Submit the form programmatically
    form.submit();

    // Clean up elements after submission
    setTimeout(() => {
      document.body.removeChild(form);
      document.body.removeChild(iframe);
    }, 2000);

    return { success: true };
  } catch (error) {
    console.error("Error saving to Google Sheets:", error);
    throw error;
  }
}
