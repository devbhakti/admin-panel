# DevBhakti Phase 2: Complete Flow & Implementation Guide

This document outlines the end-to-end flow for the **Phase 2** modules of the DevBhakti platform. Integrating these features into the existing project will elevate it into a comprehensive Spiritual SaaS and Devotee Management ecosystem.

---

## 1. Website Templates (3-4 Options)
**Purpose:** Allow Temples, Ashrams, and Mandals to quickly launch their own branded mini-websites on the DevBhakti platform (e.g., `temple.devbhakti.com`).

**User Flow:**
1. **Explore:** Organization admin logs in and clicks "Create Website".
2. **Select:** User previews 3-4 distinct templates (e.g., *Traditional/Classic*, *Modern/Minimal*, *Festive/Mandal*).
3. **Customize:** User fills in basic details (Logo, Hero Image, About Us text, Theme Colors).
4. **Publish:** System generates the mini-website instantly using the selected React/Next.js template and a unique subdomain or route.

> [!TIP]
> Under the hood, these templates will just be different UI layouts built with Tailwind CSS that pull data from the same centralized backend database.

---

## 2. Bulk Upload (CSV Based)
**Purpose:** Save time for Admins and Mandals by allowing them to upload large amounts of data at once (e.g., Devotee lists, past Donation records, or Inventory).

**User Flow:**
1. **Download:** Admin navigates to the "Import" section and downloads a sample CSV file.
2. **Populate:** Admin fills the CSV offline with devotee names, phone numbers, and emails.
3. **Upload & Validate:** Admin uploads the file. The system parses the CSV and highlights any errors (e.g., invalid email formats) before saving.
4. **Process:** Once validated, the system performs a bulk database insert and shows a success summary (e.g., "500 Devotees Imported Successfully").

---

## 3. Panchang Integration
**Purpose:** Provide daily astrological and calendar details (Tithi, Nakshatra, Rahu Kaal, Shubh Muhurat) to devotees.

**User Flow:**
1. **View:** Devotee opens the "Panchang" tab on the app/website.
2. **Localize:** System auto-detects or asks for the user's location (City) and the desired date.
3. **Display:** Real-time data is fetched (likely via a third-party Astrology/Panchang API) and displayed in an easy-to-read, visually appealing dashboard.
4. **Notifications (Optional):** Devotees can opt-in to receive morning push notifications for today's Tithi and special festivals.

---

## 4. Mandal / Pandal Module
**Purpose:** A dedicated management tool for local Mandals (e.g., Ganesh Utsav, Navratri Pandals) to manage their operations during festivals.

**User Flow:**
1. **Onboarding:** Mandal committee registers on DevBhakti.
2. **Dashboard Management:** They get access to a dashboard to manage:
   - **Members & Roles:** Assign President, Treasurer, Volunteers.
   - **Chanda (Donations):** Record offline/online collections.
   - **Expenses:** Track daily expenditures during the festival.
3. **Public Page:** A public profile is generated where devotees can read about the Mandal, view past gallery images, and donate digitally.

---

## 5. Darshan Ticket Booking (QR Based)
**Purpose:** Manage crowd control and offer VIP/Time-slotted darshan for popular temples and major Pandals.

**User Flow:**
1. **Discovery:** Devotee selects a Temple/Mandal and clicks "Book Darshan".
2. **Slot Selection:** Devotee chooses an available Date and Time Slot (e.g., 10:00 AM - 11:00 AM).
3. **Details & Payment:** Enters visitor details. If it's a paid/VIP pass, they complete the payment via a gateway.
4. **Ticket Generation:** A unique QR Code ticket is generated and sent via WhatsApp/Email.
5. **Entry Validation:** At the temple gates, a volunteer uses the DevBhakti Admin App to scan the QR code, instantly validating the ticket and preventing duplicate entries.

---

## 6. Subscription Module (Recurring Revenue)
**Purpose:** Create a steady revenue stream for both the platform and the Temples through recurring payments.

**User Flow (Two Angles):**
1. **B2B (For Mandals/Temples):** Temples pay a monthly/yearly SaaS subscription fee to DevBhakti to use advanced features (like the Website Templates or CRM).
   - *Flow:* Go to Billing -> Select "Pro Plan" -> Add Card/UPI AutoPay -> Unlock Features.
2. **B2C (For Devotees):** Devotees subscribe to recurring digital services (e.g., "Monthly Prasad Delivery", "Daily Sankalp Pooja").
   - *Flow:* Select Service -> Setup e-Mandate (Stripe/Razorpay) -> Amount is auto-deducted on the 1st of every month.

> [!IMPORTANT]
> To implement this, you will need a Payment Gateway that supports e-Mandates/Recurring payments, such as Razorpay, Cashfree, or Stripe.

---

## Conclusion & Next Steps
All of these features naturally extend the core mission of your project. They should absolutely be built into the **existing DevBhakti project**, structuring it as a multi-tenant platform (where different temples/mandals act as separate tenants sharing the same infrastructure).
