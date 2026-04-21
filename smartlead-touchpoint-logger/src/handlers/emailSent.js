const { getCollection } = require("../db/mongo");
const { buildTouchpoint } = require("../utils/touchpoint");

async function handleEmailSent(lead) {
  const collection = await getCollection();
  const email = lead.lead_email || lead.to_email;
  if (!email) return { skipped: true, reason: "no email" };

  const touchpoint = buildTouchpoint(lead, {
    type: "email_sent",
    direction: "outbound"
  });

  const result = await collection.updateOne(
    { email },
    {
      $push: { touchpoints: touchpoint },
      $set: {
        last_emailed: new Date(lead.event_timestamp || Date.now()),
        updated_at: new Date()
      }
    }
  );

  return { matched: result.matchedCount, modified: result.modifiedCount };
}

module.exports = { handleEmailSent };
