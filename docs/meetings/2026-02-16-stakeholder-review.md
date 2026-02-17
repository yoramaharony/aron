# Stakeholder Review — February 16, 2026

**Attendees:** Yehuda Gurwitz, Mendel, Shay Chervinsky, Yoram Aharony

---

## TL;DR

The team decided to simplify the donor interface by removing manual processes and progress bars, implementing AI-driven automation for meetings and due diligence, while shifting complex form-based workflows to the organization side.

---

## Discussion Topics

### 1. App Demo Walkthrough

- Yoram demonstrated the donor flow from login through opportunity review, info requests, meeting scheduling, and pledge confirmation
- Demo credentials and quick links are available for testing the happy path
- Current implementation shows opportunities matching donor impact preferences and budget ranges
- Engagement timeline tracks all donor actions chronologically with visual progress indicators

### 2. Donor Psychology and Engagement Strategy

- **Mendel's perspective:** Donors are not actively seeking to give money away or chase organizations; they want impact and efficiency, not complex processes
- **Yehuda's counter:** The app organizes incoming requests that donors already receive via email and calls, filtering them into a centralized system
- **Key insight:** Donors vary widely (30–500 opportunities per year depending on engagement level)
- **Agreement:** Donor interface should be primarily reactive, not requiring active search behavior

### 3. Manual Work vs. Automation

- **Mendel raised concern:** Too much manual work (meeting notes, due diligence checkboxes) may complicate donor experience rather than simplify it
- **Shay suggested:** AI bot could join scheduled meetings, take notes automatically, and capture outcomes without donor input
- **Yehuda noted:** Some donors are meticulous while others want simplicity — design should accommodate both with optional depth
- **Team agreed** to leverage AI for meeting capture, note-taking, and automatic status updates

### 4. Progress Bars and UI Simplification

- **Yehuda's position:** Progress bars and stepper UI are more relevant for organizations tracking their submission status, not donors
- Donors should see simple timeline views and engagement history, but hidden as secondary information
- **Primary donor interface should focus on three simple actions:** Pass, See More, or Pledge
- Detailed information should be accessible for curious donors but not front and center

### 5. CRM Value vs. Impact Features

- **Mendel's question:** What is the core product value — elegant CRM for donors or impact amplification through pooled giving?
- **Yehuda's response:** Phase 1 solves immediate pain points (CRM, organization, due diligence); Phase 2 adds impact features (pooled funding, matching, opportunities donors are passionate about)
- Impact features like crowdfunding and collaborative giving require critical mass of donors and curated opportunities — takes time to build
- **Current focus:** Streamline the request process and make donor lives easier today

### 6. Concierge vs. Form-Based Interface

- Yoram proposed converting form-based flows into AI concierge interactions for more natural donor experience
- Form-based approach better suited for organizations submitting detailed information
- Donor side should minimize typing and manual entry — quick selections, voice notes, or AI capture preferred
- Voting mechanism (like/don't like) discussed as potential simplified engagement model

### 7. Due Diligence and Trust Features

- App-facilitated due diligence adds value to organizations by ensuring documentation is complete
- Donors benefit from confidence that background checks (financial audit, site visits, references, rabbinical approval) can be tracked
- Due diligence can be automated through the platform rather than requiring donor manual entry
- Creates value for both sides while protecting donor time

### 8. Organization Submission Links

- Each organization receives unique submission code/link to submit opportunities directly to specific donors
- This replaces email/call solicitations with structured app submissions
- Creates centralized tracking of all incoming requests for each donor
- Organizations see their own interface for submission and tracking

---

## Action Items

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Reverse the UI flow — remove progress bars and steppers from donor view and implement them on organization side instead | Yoram Aharony | Pending |
| 2 | Simplify donor interface to three primary actions: Pass, See More, and Pledge/Commit | Yoram Aharony | Pending |
| 3 | Implement AI meeting bot to automatically join scheduled meetings, capture notes, and update opportunity status | Shay Chervinsky | Pending |
| 4 | Restore next/forward navigation buttons for easier opportunity browsing | Yoram Aharony | Pending |
| 5 | Create detailed organization view for next meeting demonstration | Yoram Aharony | Pending |
| 6 | Define what due diligence information is valuable enough for donors to pay for | Yehuda Gurwitz | Pending |
| 7 | Populate demo with varied opportunities across different budgets and impact categories | Yoram Aharony | Pending |
| 8 | Minimize manual donor inputs — leverage AI for all possible automation | Yoram Aharony | Pending |

---

## Key Decisions

1. **Donor UI should be simplified** — remove stepper/progress bars, focus on Pass / See More / Pledge
2. **Steppers move to org side** — organizations track their submission progress, not donors
3. **AI-first approach** — meeting notes, due diligence, and status updates should be automated
4. **Phase 1 = CRM + streamline** — impact features (pooling, matching) come in Phase 2
