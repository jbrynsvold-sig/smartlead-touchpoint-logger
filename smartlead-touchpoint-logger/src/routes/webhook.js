const express = require("express");
const router = express.Router();

const { handleEmailSent } = require("../handlers/emailSent");
const { handleEmailOpened } = require("../handlers/emailOpened");
const { handleEmailReplied } = require("../handlers/emailReplied");
const { handleEmailBounced } = require("../handlers/emailBounced");
const { handleLeadUnsubscribed } = require("../handlers/leadUnsubscribed");
const { handleLeadCategoryUpdated } = require("../handlers/leadCategoryUpdated");

router.post("/", async (req, res) => {
  try {
    const lead = req.body;

    // Verify secret key
    const secretKey = lead.secret_key;
    if (secretKey !== process.env.SMARTLEAD_SECRET_KEY) {
      console.warn("Invalid secret key:", secretKey);
      return res.status(401).json({ error: "Unauthorized" });
    }

    const eventType = lead.event_type;
    const email = lead.lead_email || lead.to_email;

    console.log(`[${eventType}] ${email} | Campaign: ${lead.campaign_name}`);

    // Skip if no email
    if (!email) {
      console.warn("No email in payload, skipping");
      return res.status(200).json({ skipped: true, reason: "no email" });
    }

    let result;

    switch (eventType) {
      case "EMAIL_SENT":
        result = await handleEmailSent(lead);
        break;
      case "EMAIL_OPENED":
        result = await handleEmailOpened(lead);
        break;
      case "EMAIL_REPLIED":
        result = await handleEmailReplied(lead);
        break;
      case "EMAIL_BOUNCED":
        result = await handleEmailBounced(lead);
        break;
      case "LEAD_UNSUBSCRIBED":
        result = await handleLeadUnsubscribed(lead);
        break;
      case "LEAD_CATEGORY_UPDATED":
        result = await handleLeadCategoryUpdated(lead);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
        result = { skipped: true, reason: `unhandled event type: ${eventType}` };
    }

    // Log if no record matched
    if (result.matched === 0) {
      console.warn(`No MongoDB record found for email: ${email}`);
    }

    return res.status(200).json({ ok: true, event: eventType, ...result });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
