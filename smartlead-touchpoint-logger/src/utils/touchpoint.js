function buildTouchpoint(lead, overrides = {}) {
  return {
    channel: "email",
    campaign_id: String(lead.campaign_id || ""),
    campaign_name: lead.campaign_name || "",
    sequence_step: lead.sequence_number || lead.current_sequence || null,
    from_email: lead.from_email || "",
    to_email: lead.lead_email || lead.to_email || "",
    subject: lead.subject || lead.last_sent_subject || "",
    recorded_at: lead.event_timestamp ? new Date(lead.event_timestamp) : new Date(),
    created_at: new Date(),
    source: "smartlead_webhook",
    event_type: lead.event_type || "",
    ...overrides
  };
}

module.exports = { buildTouchpoint };
