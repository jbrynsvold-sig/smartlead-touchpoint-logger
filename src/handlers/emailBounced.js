const { getCollection } = require("../db/mongo");
const { buildTouchpoint } = require("../utils/touchpoint");

// SmartLead EMAIL_BOUNCED is a hard bounce — permanent suppression
// Soft bounces are tracked via soft_bounce_count from campaign stats
async function handleEmailBounced(lead) {
  const collection = await getCollection();
  const email = lead.lead_email || lead.to_email;
  if (!email) return { skipped: true, reason: "no email" };

  const now = new Date();

  const touchpoint = buildTouchpoint(lead, {
    type: "email_bounced",
    direction: "outbound",
    bounce_type: "hard"
  });

  const result = await collection.updateOne(
    { email },
    {
      $push: { touchpoints: touchpoint },
      $inc: { soft_bounce_count: 1 },
      $set: {
        suppression_status: "hardBounce",
        suppression_reason: "bounce",
        do_not_contact: true,
        suppression_meta: {
          suppressed_at: now,
          reason: "bounce",
          reply_campaign: lead.campaign_name || ""
        },
        last_suppression_update: now,
        updated_at: now
      }
    }
  );

  return { matched: result.matchedCount, modified: result.modifiedCount };
}

module.exports = { handleEmailBounced };
