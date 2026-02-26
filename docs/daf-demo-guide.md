# DAF Demo Guide (Investor Flow)

This runbook validates the end-to-end DAF lifecycle in Aron:

`Request -> Concierge progression -> Donor DAF recommendation -> Simulated submission/receipt -> Fulfilled pledge`

## 1) Preflight

1. Start the app: `npm run dev`
2. Ensure demo data exists: open `POST /api/admin/demo-seed`
3. Demo credentials:
   - Donor: `demo-donor@aron.local / AronDemo1!`
   - Org: `demo-org@aron.local / AronDemo1!`

## 2) Donor DAF Setup

1. Login as donor.
2. Open ` /donor/profile `.
3. In **Funding preferences (DAF)**:
   - Add a sponsor (for example, Fidelity Charitable)
   - Optional nickname
   - Mark as default

Expected:
- Sponsor preference is saved and visible.

## 3) Create/Advance Opportunity

1. Login as org.
2. Create a request in ` /requestor ` (AI Fill is fine for demo speed).
3. Ensure request appears in ` /requestor/requests `.
4. Login as donor and open ` /donor/opportunities `.
5. Let concierge review process run; complete info/meeting progression as needed.

Expected:
- Opportunity appears in donor discover flow with evolving chips/status.

## 4) Donor Funding via DAF

1. In donor opportunity detail, click **Pledge**.
2. Select **Fund via DAF** in the funding method modal.
3. Confirm sponsor, amount, designation.
4. Click **Generate DAF Grant Packet**.

Expected:
- DAF grant card appears.
- Packet download works.
- Timeline includes `daf_packet_generated`.

## 5) Simulate Sponsor Submission (Demo-Only AI)

1. In the donor DAF grant card, click **AI Simulate Submission**.

Expected:
- DAF status becomes `submitted`.
- Timeline includes `daf_submitted`.
- Requestor view reflects submission-related task/document state.

## 6) Simulate Funds Received (Demo-Only AI)

1. In the donor DAF grant card, click **AI Simulate Funds Received**.

Expected:
- DAF status becomes `received`.
- Timeline includes `daf_received`.
- Existing funded mechanics are triggered (`funded` event/state/status).

## 7) Final Proof in Pledges

1. Open donor pledges page: ` /donor/pledges `.

Expected:
- The opportunity now appears as a fulfilled funded pledge.
- This confirms DAF lifecycle handoff into existing pledges pipeline.

---

## Fast 90-Second Demo Path

1. Donor profile has default DAF sponsor.
2. Donor opens target opportunity.
3. `Pledge -> Fund via DAF -> Generate Packet`
4. `AI Simulate Submission`
5. `AI Simulate Funds Received`
6. Open ` /donor/pledges ` and show fulfilled pledge.

