const { getCollection } = require("../db/mongo");
const { buildTouchpoint } = require("../utils/touchpoint");

async function handleEmailReplied(lead) {
  const collection = await getCollection();
  const email = lead.lead_email || lead.to_email;
  if (!email) return { skipped: true, reason: "no email" };

  const now = new Date();
  const cooldownUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const touchpoint = buildTouchpoint(lead, {
    type: "reply",
    direction: "inbound",
    reply_type: lead.reply_category || "unknown",
    category: lead.lead_category?.new_name || lead.category || "",
    previous_category: lead.lead_category?.old_name || ""
  });

  const result = await collection.updateOne(
    { email },
    {
      $push: { touchpoints: touchpoint },
      $set: {
        last_reply_date: new Date(lead.event_timestamp || now),
        last_reply_type: "email",
        last_contacted: new Date(lead.event_timestamp || now),
        suppression_status: "activeConversation",
        suppression_reason: "email_reply",
        suppression_meta: {
          suppressed_at: now,
          cooldown_until: cooldownUntil,
          reason: "email_reply",
          reply_campaign: lead.campaign_name || ""
        },
        last_suppression_update: now,
        updated_at: now
      }
    }
  );

  return { matched: result.matchedCount, modified: result.modifiedCount };
}

module.exports = { handleEmailReplied };
