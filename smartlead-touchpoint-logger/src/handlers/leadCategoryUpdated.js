const { getCollection } = require("../db/mongo");
const { buildTouchpoint } = require("../utils/touchpoint");

async function handleLeadCategoryUpdated(lead) {
  const collection = await getCollection();
  const email = lead.lead_email || lead.to_email;
  if (!email) return { skipped: true, reason: "no email" };

  const now = new Date();
  const cooldownUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const newCategory = lead.lead_category?.new_name || lead.category || "";
  const oldCategory = lead.lead_category?.old_name || "";

  const touchpoint = buildTouchpoint(lead, {
    type: "category_updated",
    direction: "inbound",
    category: newCategory,
    previous_category: oldCategory
  });

  // Only update suppression if category indicates a positive reply
  const positiveCategories = ["Interested", "Meeting Booked", "Out of Office"];
  const isPositive = positiveCategories.includes(newCategory);

  const updateFields = {
    updated_at: now
  };

  if (isPositive) {
    updateFields.last_reply_date = new Date(lead.event_timestamp || now);
    updateFields.last_reply_type = "email";
    updateFields.last_contacted = new Date(lead.event_timestamp || now);
    updateFields.suppression_status = "activeConversation";
    updateFields.suppression_reason = "email_reply";
    updateFields.suppression_meta = {
      suppressed_at: now,
      cooldown_until: cooldownUntil,
      reason: "email_reply",
      reply_campaign: lead.campaign_name || ""
    };
    updateFields.last_suppression_update = now;
  }

  const result = await collection.updateOne(
    { email },
    {
      $push: { touchpoints: touchpoint },
      $set: updateFields
    }
  );

  return { matched: result.matchedCount, modified: result.modifiedCount };
}

module.exports = { handleLeadCategoryUpdated };
