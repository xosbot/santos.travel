# IVA Cortex — Phase 2 Implementation Plan

**Prepared for:** santos.travel  
**Date:** June 2026  
**Scope:** Executable roadmap for extending IVA Cortex from quote-to-PDF automation into an end-to-end trip operations and partner distribution platform.

---

## 1. Executive Summary

IVA Cortex Phase 1 delivered a working quote-to-PDF pipeline for santos.travel. Phase 2 shifts focus from **"faster quoting"** to **"reliable trip operations and scalable distribution"** while preserving the boutique, high-touch service that attracts high-net-worth FIT travelers.

The plan is organized into three release streams:
- **Release A — Quick Wins:** Client experience and conversion improvements.
- **Release B — Core Platform:** Operational backbone (itinerary builder, supplier confirmation, payments, pricing controls).
- **Release C — Growth:** Partner distribution, analytics, and field operations.

**Target timeline:** 6 months from kickoff to a sellable, end-to-end operational platform.

---

## 2. Current State (Phase 1)

Already built and tested:

| Component | Location | Status |
|---|---|---|
| PostgreSQL schema (7 tables) | `db/schema.sql` | Built |
| Seed data | `db/seed.js` / scripts | Built |
| Express server + routes | `src/server.js` | Built |
| Deterministic quoting engine | `src/quoting/engine.js` | Built + tested |
| Quote builder | `src/quoting/builder.js` | Built |
| LLM extraction | `src/intake/extractor.js` | Built |
| LLM prose augmenter | `src/quoting/augmenter.js` | Built |
| PDF generator | `src/pdf/generator.js` | Built |
| Admin UI | `src/admin/index.html` | Built |
| Owner demo page | `src/admin/demo.html` | Built |
| Auth + API key management | `src/middleware/auth.js` | Built |
| Zod validation | `src/middleware/validate.js` | Built |
| Docker setup | `Dockerfile`, `docker-compose.yml` | Built |

**Architectural principle maintained throughout:** LLM handles text; deterministic code handles math and scheduling.

---

## 3. Phase 2 Objectives

1. Convert quotes into confirmed, operationally executable bookings.
2. Add supplier availability and confirmation workflows.
3. Automate payment milestones and invoicing.
4. Add dynamic seasonality and margin controls.
5. Enable B2B travel-agent distribution via a white-label portal.
6. Improve client communication (WhatsApp/email threading).
7. Build owner analytics dashboard for revenue and margin visibility.

---

## 4. Phase 2 Feature Roadmap

### Release A: Quick Wins — Client Experience & Conversion (Months 1–2)

| # | Feature | Description | Impact | Effort | Priority |
|---|---|---|---|---|---|
| A1 | **WhatsApp + Email Client Threading** | Auto-send quotes, payment reminders, and day-before-trip briefs via WhatsApp Business API / email; log replies against the trip record. | Reduces response lag; improves CX; frees ops. | Small | P1 |
| A2 | **Lead Scoring & CRM Workflows** | Tag inquiries by source, budget signals, group size, urgency; auto-prioritize hot leads and alert owner for high-value FITs. | Increases lead-to-quote conversion. | Small | P1 |
| A3 | **Post-Trip Review Engine** | Auto-request feedback 48h after trip end; capture ratings and testimonials for marketing. | Builds social proof. | Small | P2 |

### Release B: Core Platform — Operations & Revenue (Months 2–4)

| # | Feature | Description | Impact | Effort | Priority |
|---|---|---|---|---|---|
| B1 | **Intelligent Itinerary Builder** | Generate full multi-day itineraries from extracted inquiry data, respecting driving distances, region clusters, hotel check-in windows, and activity pacing. | Cuts itinerary drafting time from hours to minutes. | Large | **P0** |
| B2 | **Supplier Availability & Confirmation Workflow** | Hotel, houseboat, driver, guide availability checks with provisional hold → confirm → release status tracking and deadline alerts. | Reduces overbooking and last-minute substitutions. | Large | **P0** |
| B3 | **Payment Milestones & Invoice Automation** | Generate branded invoices linked to booking stages (deposit / balance / add-ons); track receivables and auto-remind clients. | Improves cash flow; reduces accounting errors. | Medium | **P0** |
| B4 | **Dynamic Seasonality & Margin Controls** | Apply seasonal rate multipliers, blackout dates, and configurable margin rules per service type; lock approved quote versions. | Protects profitability during peak season. | Medium | P1 |

### Release C: Growth — Partners & Scale (Months 4–6)

| # | Feature | Description | Impact | Effort | Priority |
|---|---|---|---|---|---|
| C1 | **B2B Travel Agent Portal** | White-label quote sharing for overseas agents: co-branded PDFs, commission tracking, real-time booking status. | Opens indirect distribution channel. | Large | P1 |
| C2 | **Owner Analytics Dashboard** | Visual pipeline (inquiries → quotes → bookings), revenue forecast, occupancy by supplier, margin analysis. | Enables data-driven decisions. | Medium | P2 |
| C3 | **Field Operations Mobile View** | Lightweight mobile view for drivers/guides showing daily run sheet, guest contacts, hotel vouchers, emergency updates. | Reduces day-of-trip friction. | Medium | P2 |

---

## 5. Technical Implementation Details

### 5.1 Data Model Additions

New or extended tables:

```sql
-- Supplier availability and confirmation
CREATE TABLE supplier_availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  service_date DATE NOT NULL,
  status TEXT CHECK (status IN ('available','hold','confirmed','released','blackout')),
  held_until TIMESTAMP,
  confirmed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment milestones
CREATE TABLE payment_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  label TEXT NOT NULL, -- 'Deposit', 'Balance', 'Add-on'
  due_date DATE,
  amount_inr NUMERIC(12,2) NOT NULL,
  status TEXT CHECK (status IN ('pending','sent','paid','overdue','waived')),
  invoice_number TEXT UNIQUE,
  sent_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Itinerary day plans
CREATE TABLE itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id),
  day_number INT NOT NULL,
  date DATE,
  region TEXT,
  route_distance_km NUMERIC(6,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Communications log (WhatsApp/email)
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id),
  channel TEXT CHECK (channel IN ('whatsapp','email')),
  direction TEXT CHECK (direction IN ('inbound','outbound')),
  message_type TEXT, -- 'quote', 'reminder', 'brief', 'general'
  content TEXT,
  status TEXT,
  external_id TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- B2B agents
CREATE TABLE b2b_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT UNIQUE NOT NULL,
  commission_percent NUMERIC(5,2),
  api_key_hash TEXT,
  branding JSONB, -- logo, colors
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seasonality / pricing rules
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service_type TEXT, -- 'hotel','transport','guide','activity'
  start_date DATE,
  end_date DATE,
  multiplier NUMERIC(4,2) DEFAULT 1.00,
  fixed_amount NUMERIC(12,2),
  margin_percent NUMERIC(5,2),
  priority INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
```

### 5.2 New API Endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/itineraries/:tripId/generate` | Generate day-by-day itinerary from trip data |
| `GET /api/itineraries/:tripId` | Fetch generated itinerary |
| `POST /api/suppliers/:id/availability` | Set or check availability |
| `POST /api/bookings/:id/hold` | Place provisional holds on suppliers |
| `POST /api/bookings/:id/confirm` | Confirm supplier bookings |
| `POST /api/bookings/:id/release` | Release holds |
| `POST /api/bookings/:id/invoices` | Generate invoice for milestone |
| `POST /api/payments/remind` | Send payment reminder |
| `POST /api/webhooks/whatsapp` | Receive WhatsApp inbound messages |
| `POST /api/webhooks/email` | Receive email replies |
| `POST /api/b2b/quotes` | B2B agent creates quote under their brand |
| `GET /api/b2b/bookings` | B2B agent views their bookings |
| `GET /api/analytics/dashboard` | Owner dashboard metrics |

### 5.3 Module Structure Additions

```
src/
├── itineraries/        # Itinerary generation and routing logic
│   ├── builder.js
│   ├── routing.js      # Driving distances, region clusters
│   └── validator.js
├── suppliers/          # Availability and confirmation workflows
│   ├── repository.js
│   └── workflow.js
├── payments/           # Invoices, milestones, reminders
│   ├── engine.js
│   ├── repository.js
│   └── generator.js
├── communications/     # WhatsApp/email threading
│   ├── whatsapp.js
│   ├── email.js
│   └── repository.js
├── b2b/                # Partner portal backend
│   ├── portal.js
│   ├── repository.js
│   └── branding.js
├── analytics/          # Dashboard aggregations
│   └── dashboard.js
└── pricing/            # Seasonality and margin rules
    ├── rules.js
    └── repository.js
```

### 5.4 Key Technical Decisions

1. **Itinerary builder stays deterministic.** Route distances, region clusters, hotel check-in windows, and activity pacing are computed by code. LLM only writes the narrative prose for each day.
2. **Supplier confirmation workflow is manual-first.** Start with hold → confirm → release statuses and deadline alerts. Live supplier integrations (hotel APIs) come later.
3. **Invoices are immutable once issued.** Each invoice is a snapshot linked to a locked quote version.
4. **B2B portal uses the same quoting engine** but applies agent-specific branding and commission rules.
5. **WhatsApp Business API** is preferred over unofficial solutions for reliability and scale.
6. **Analytics are read-only aggregations** on existing transactional tables to avoid dual-write complexity.

### 5.5 UI / Admin Additions

- **Itinerary editor page** in `src/admin/` to review and adjust AI-generated day plans.
- **Supplier calendar view** showing holds, confirmations, and blackouts.
- **Booking detail page** with payment milestone tracker and invoice buttons.
- **Communications thread view** per trip (WhatsApp + email history).
- **B2B partner management page** to add agents, set commissions, and rotate API keys.
- **Owner analytics dashboard** with charts: inquiry funnel, revenue forecast, supplier occupancy, margin by trip.
- **Mobile field-ops view** (lightweight, no auth complexity beyond trip-specific token links).

---

## 6. Implementation Sequence

### Month 1–2: Release A + Foundation
- [ ] Set up `communications` table and WhatsApp Business API sandbox.
- [ ] Build outbound message templates for quotes, reminders, and pre-trip briefs.
- [ ] Implement lead scoring in `src/intake/extractor.js`.
- [ ] Add CRM workflow alerts (high-value FIT → owner notification).
- [ ] Begin data model additions for itinerary days and supplier availability.

### Month 2–3: Release B — Core Platform
- [ ] Build `itineraries/builder.js` with deterministic day planning.
- [ ] Add route/distance logic in `itineraries/routing.js` (initially static lookup table).
- [ ] Build supplier availability and confirmation workflow.
- [ ] Implement payment milestones and invoice generation.
- [ ] Add dynamic pricing rules engine.
- [ ] Lock quote versions on invoice issuance.

### Month 3–4: Integration & Hardening
- [ ] Wire itinerary builder into quote PDF output.
- [ ] Connect payment reminders to WhatsApp/email threading.
- [ ] Add post-trip review request automation (Release A3).
- [ ] Load historical seasonality data into `pricing_rules`.
- [ ] Internal testing with real sample trips.

### Month 4–5: Release C — B2B Portal
- [ ] Build `b2b_agents` table and API key model.
- [ ] Create co-branded PDF template variant.
- [ ] Build B2B agent self-service portal (subset of admin UI).
- [ ] Implement commission tracking and booking visibility.

### Month 5–6: Analytics & Field Ops
- [ ] Build owner analytics dashboard.
- [ ] Create mobile field-ops view for drivers/guides.
- [ ] Performance optimization and security hardening.
- [ ] Document SOPs and train the santos.travel team.

---

## 7. Risks & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| AI hallucination in itineraries | Wrong schedules, guest complaints | Keep scheduling logic deterministic; LLM writes prose only. |
| Supplier data quality issues | Overbooking, last-minute changes | Manual confirmation workflow first; live APIs later. |
| Boutique service feels robotic | HNW guests expect white-glove care | Automate operational noise; reserve human touch for customization and crises. |
| Team adoption resistance | Staff revert to spreadsheets | Train in cohorts; tie workflows to daily tasks; measure weekly active usage. |
| B2B channel conflict | Agents bypass or demand high commissions | Clear commission tiers, territories, and rate transparency rules. |
| Cash flow disruption from auto-invoicing | Incorrect invoices damage trust | Manual review for first 20 invoices; immutable quote versions. |
| WhatsApp API approval delays | Blocks client communication rollout | Start with email-only templates; add WhatsApp once approved. |

---

## 8. Success Metrics

### Operational Efficiency
- **Quote turnaround time:** median < 4 hours (target: < 30 minutes).
- **Itinerary build time:** first-draft multi-day itinerary < 15 minutes.
- **Manual data entry per booking:** measurable reduction.

### Revenue & Conversion
- **Inquiry-to-quote conversion rate**
- **Quote-to-booking conversion rate**
- **Average trip value and gross margin per booking**
- **Revenue from B2B partner channel** (% of total by quarter)

### Customer Experience
- **Net Promoter Score (NPS)** post-trip
- **Guest complaint rate** (especially itinerary errors)
- **Pre-trip communication response rate**

### Platform Health
- **Weekly active users** (owner, ops, B2B partners)
- **Supplier confirmation SLA adherence**
- **Invoice/payment reconciliation accuracy**

---

## 9. Resource Estimate

| Resource | Estimate | Notes |
|---|---|---|
| Engineering | 1 senior backend engineer + 1 frontend/UI engineer for 6 months | Full-time equivalent |
| LLM usage | Moderate increase | More prose generation for itineraries and communications |
| WhatsApp Business API | Per-conversation fees | Budget based on ~100 active trips/month |
| Hosting / DB | Existing VPS/DB can scale | Add read replica if analytics becomes heavy |
| Design / UX | 2–3 weeks | Admin UI and B2B portal polish |
| Owner/team training | 1 week | SOPs and onboarding |

---

## 10. Recommended Immediate Next Actions

1. **Validate baseline metrics** with the owner: current quote time, conversion rate, revision count, and pricing error rate.
2. **Prioritize Release B features** because faster quoting without confirmed availability and payment tracking does not reliably convert to revenue.
3. **Identify 2–3 potential B2B agent partners** before building the portal to ensure product-market fit.
4. **Apply for WhatsApp Business API** early to avoid communication rollout delays.
5. **Begin collecting route-distance data** for Kerala/South India destinations to feed the itinerary builder.

---

*Implementation plan derived from market research, competitive analysis, and the existing IVA Cortex Phase 1 architecture.*
