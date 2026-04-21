const { getCollection } = require("../db/mongo");
const { buildTouchpoint } = require("../utils/touchpoint");

async function handleEmailOpened(lead) {
  const collection = await getCollection();
  const email = lead.lead_email || lead.to_email;
  if (!email) return { skipped: true, reason: "no email" };

  const touchpoint = buildTouchpoint(lead, {
    type: "email_opened",
    direction: "outbound"
  });

  const result = await collection.updateOne(
    { email },
    {
      $push: { touchpoints: touchpoint },
      $set: { updated_at: new Date() }
    }
  );

  return { matched: result.matchedCount, modified: result.modifiedCount };
}

module.exports = { handleEmailOpened };
