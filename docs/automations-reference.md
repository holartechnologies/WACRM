# Automations Reference

Current trigger + step configs for all automations and flows in the account (`d4a79322-5623-4c07-88da-14e2de9ba08b`), pulled live from Supabase.

**Trigger key**

- `first_inbound_message` — fires on a contact's very first message.
- `interactive_reply` — fires when someone taps a button/list row whose `id` is in `reply_ids`.
- `keyword_match` — fires when an inbound text matches the configured keywords.
- `tag_added` — fires when a conversation gets a specific tag.
- `time_based` — fires on a schedule (cron or `HH:mm`).

**Flow vs automation:** the Flow **"Sales Enquiry - First Contact"** owns the first-contact conversation (welcome → menu → qualification). When a Flow consumes an inbound tap, the matching `interactive_reply` automations below are skipped for that tap — so they're currently shadowed for first-contact threads but still active and reusable elsewhere.

## Flow: Sales Enquiry - First Contact
- **ID:** `4bccf087-bcd0-485d-9ed1-6279887efab3`
- **Status:** active · **Trigger:** `first_inbound_message` (`{}`) · **Entry:** `start` · 24 nodes
- **Path:**
  1. `start` → `welcome` (send_message: 👋 welcome + 8 numbered services)
  2. `menu` (send_list): `service_sales` → services list · `service_support` → support · `service_human`/`service_other` → human
  3. `services_list` (send_list): 8 services — `svc_web_design`, `svc_redesign`, `svc_ecommerce`, `svc_seo`, `svc_ai`, `svc_custom`, `svc_marketing`, `svc_human` — each row → its own tailored message
  4. Qualification (`collect_input` × 6): `name` → `company` → `requirement` → `existing` → `timeline` → `budget`
  5. `qualify_tag` (set_tag `qualified`) → `sales_handoff` (handoff, assigned to `fd645531-49bf-469b-98be-891b7e57c51a`) with note: `Name / Company / Requirement / Existing platform / Timeline / Budget`
  6. `support_msg` → `support_handoff` · `human_msg` → `human_handoff`

## Untitled automation
- **ID:** `dd480f1f-5af5-439a-bdcc-275a0aebcee0`
- **Trigger:** `keyword_match` — contains: `hello`
- **Steps:**
  1. `send_message`: "Hi! Thanks for reaching out."

## First Contact Welcome
- **ID:** `02879abd-07f0-4fe9-8ada-e43a51bb8cd8`
- **Trigger:** `first_inbound_message` (`{}`)
- **Steps:**
  1. `send_message`: "👋 Hello! Welcome to Holar Technologies.\n\nWe build digital platforms and solutions that help businesses and organisations attract customers, improve operations and grow.\n\nHow can we help you today?\n\n1️⃣ Build a new website\n2️⃣ Redesign my existing website\n3️⃣ E-commerce / online store\n4️⃣ SEO & Google Business Profile\n5️⃣ Business automation / AI\n6️⃣ Custom digital platform\n7️⃣ Digital marketing & branding\n8️⃣ Speak with a team member"
  2. `send_list`: "How can I help you today?" / header "Holar Technologies" / footer "Tap an option to get started" / button "Choose an option"
     - Section **Services**:
       - `service_sales` — Buy / Pricing (Plans, quotes & orders)
       - `service_support` — Support (Help with an issue)
       - `service_human` — Talk to a human (Live agent now)
       - `service_other` — Something else (Anything else)

## Sales Qualification
- **ID:** `2d18a553-6228-4b9d-bb9a-91a5776ffb3a`
- **Trigger:** `interactive_reply` — ids: `service_sales`
- **Steps:**
  1. `send_message`: "Great choice! 🚀 To point you to the right solution, a couple of quick questions."
  2. `send_buttons`: "What's your timeline for making a decision?" / header "Qualification"
     - `q_buy_now` — Ready to buy
     - `q_soon` — Within 3 months
     - `q_exploring` — Just exploring

## Hot Lead → Agent
- **ID:** `1d22439e-e16d-4a66-9920-f78cd8a48254`
- **Trigger:** `interactive_reply` — ids: `q_buy_now`
- **Steps:**
  1. `add_tag`: `hot` (`232f310a-0ea2-4278-b514-ddb1b53d1868`)
  2. `send_message`: "Awesome! 🎉 An expert will reach out to you right away."
  3. `assign_conversation`: round-robin

## Warm Lead → Agent
- **ID:** `cc702a19-8e08-49c0-ade6-55f078c32e3b`
- **Trigger:** `interactive_reply` — ids: `q_soon`
- **Steps:**
  1. `add_tag`: `warm` (`9fb5b1c4-5ecd-444a-b099-ead8a36addc7`)
  2. `send_message`: "Perfect! 🗓️ I'll pass you to an expert for a follow-up shortly."
  3. `assign_conversation`: round-robin

## Nurture Follow-up
- **ID:** `5e4bdbf4-e3bc-4131-9c04-9a35e523b703`
- **Trigger:** `interactive_reply` — ids: `q_exploring`
- **Steps:**
  1. `add_tag`: `nurture` (`27730a67-413c-413d-98b2-aef7ed7357a2`)
  2. `send_message`: "No pressure at all! 😊 Here's a quick intro to what Holar Technologies can do for you — feel free to ask anything."
  3. `wait`: 1 day
  4. `send_message`: "Hi! Following up on our chat — would you like to know more about how we can help?"

## Support Handoff
- **ID:** `fb71baee-54cc-401d-be17-69803e25519c`
- **Trigger:** `interactive_reply` — ids: `service_support`
- **Steps:**
  1. `send_message`: "Happy to help! 🤝 Briefly, what are you running into? Our team will take it from here."

## Human Request → Agent
- **ID:** `01255009-e9b8-4cdf-8409-aed08c6cebc8`
- **Trigger:** `interactive_reply` — ids: `service_human`, `service_other`
- **Steps:**
  1. `send_message`: "No problem — connecting you with a live agent now. They'll be with you shortly. 👍"
  2. `assign_conversation`: specific agent `fd645531-49bf-469b-98be-891b7e57c51a`

## Tags
| Name | Color | ID |
|---|---|---|
| hot | #ef4444 | `232f310a-0ea2-4278-b514-ddb1b53d1868` |
| warm | #f59e0b | `9fb5b1c4-5ecd-444a-b099-ead8a36addc7` |
| nurture | #3b82f6 | `27730a67-413c-413d-98b2-aef7ed7357a2` |
| qualified | #22c55e | `3dc5f9da-94a5-46cc-9515-f4784f1bad45` |
