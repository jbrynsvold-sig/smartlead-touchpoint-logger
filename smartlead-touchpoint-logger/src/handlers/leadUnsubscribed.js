const { getCollection } = require("../db/mongo");
const { buildTouchpoint } = require("../utils/touchpoint");

async function handleLeadUnsubscribed(lead) {
  const collection = await getCollection();
  const email = lead.lead_email || lead.to_email;
  if (!email) return { skipped: true, reason: "no email" };

  const now = new Date();

  const touchpoint = buildTouchpoint(lead, {
    type: "unsubscribed",
    direction: "inbound"
  });

  const result = await collection.updateOne(
    { email },
    {
      $push: { touchpoints: touchpoint },
      $set: {
        unsubscribed: true,
        do_not_contact: true,
        suppression_status: "unsubscribed",
        suppression_reason: "email_unsubscribe",
        "channel_suppression.email": "unsubscribed",
        suppression_meta: {
          suppressed_at: now,
          reason: "email_unsubscribe",
          reply_campaign: lead.campaign_name || ""
        },
        last_suppression_update: now,
        updated_at: now
      }
    }
  );

  return { matched: result.matchedCount, modified: result.modifiedCount };
}

module.exports = { handleLeadUnsubscribed };
