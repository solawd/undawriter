# Product Requirements Document (PRD): Project "UndaWriter" (v1.2)

## 1. Project Summary
**Objective:** Build a full-stack insurance self-service ecosystem (Backend API, Web Frontend, and Mobile Frontend) for the Ghanaian market. 
**Core Value:** Automate the end-to-end process of quoting, payment, and regulatory compliance for **Motor, Home, and Travel** insurance, including a digital claims management workflow.

## 2. Target Personas
* **Customer:** Individuals buying policies and filing claims via Web/Mobile.
* **Claims Adjuster:** Internal staff using the "Staff Portal" to review and settle claims.
* **System Admin:** Managing product rates and system health.

## 3. System Architecture & Tech Stack
* **Backend:** RESTful API (Node.js/TypeScript or Python/FastAPI).
* **Frontends:**
    * **Web (Customer & Staff):** React/Next.js (Tailwind CSS).
    * **Mobile (Customer):** React Native or Flutter (with Camera/GPS access).
* **Database:** PostgreSQL (Relational integrity for financial & regulatory data).
* **Integrations:**
    * **Paystack:** For GHS collections (MoMo & Card).
    * **NIC MID:** National Insurance Commission API for Motor sticker generation.
    * **Notifications:** Arkesel/Hubtel (SMS) and SMTP (Email).

## 4. Enhanced Data Model (Relational Schema)

### 4.1 Core Tables
* **Users:** `id`, `email`, `password_hash`, `full_name`, `ghana_card_id` (Required), `phone_number`.
* **Policies:** `id`, `user_id`, `product_type` (MOTOR, HOME, TRAVEL), `status` (PENDING, ACTIVE, EXPIRED), `start_date`, `end_date`, `premium_net`, `total_paid`, `nic_sticker_id`, `policy_document_url`.
* **Claims:** `id`, `policy_id`, `status` (SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED), `payout_type` (CASH_IN_LIEU, SERVICE_PROVIDER), `evidence_urls[]`, `adjuster_notes`.

### 4.2 Product-Specific Risk Profiles
* **Motor_Details:** `reg_number`, `chassis_number`, `make_model`, `year`, `body_type`, `seating_capacity`, `sum_insured`, `usage` (Private/Commercial), `coverage_type` (Third Party/Comprehensive).
* **Home_Details:** `ghana_post_gps`, `property_type`, `wall_material`, `roof_material`, `occupancy`, `sum_insured_building`, `sum_insured_contents`.
* **Travel_Details:** `passport_number`, `country_of_issue`, `destination_region` (Schengen/Worldwide/Africa), `trip_purpose`, `next_of_kin_contact`, `pre_existing_conditions` (Boolean).

## 5. Functional Requirements

### 5.1 Dynamic Quoting Engine
The system must fetch the active **Rating Logic JSON** to calculate premiums.
* **Motor Formula:** `(Base Rate * Sum Insured) + NIC Levy + Sticker Fee`.
* **Home Formula:** `(Building Value + Content Value) * Base Rate * Modifiers`.
* **Travel Formula:** `(Daily Rate * Days) * Region Multiplier * Age Factor`.

### 5.2 Payment & NIC Sync (The "Golden Path")
1.  Frontend initializes Paystack.
2.  Backend listens for `charge.success` webhook.
3.  **Critical:** For Motor policies, the backend MUST call the **NIC MID API** immediately after payment to generate the digital sticker.
4.  If NIC is down, the system MUST queue the task for automatic retries.

### 5.3 Claims Workflow
* **Submission:** Customer uploads photo evidence + selects payout method.
* **Staff Portal:** Adjuster views evidence and policy history to Approve/Reject.

## 6. API & Integration Specs
* `POST /api/v1/quotes/calculate`: Generates a price before payment.
* `POST /api/v1/payments/initialize`: Returns Paystack access code.
* `POST /api/v1/claims/file`: Multi-part form-data for image uploads.

## 7. Instructions for AI Development Agent
1.  **Strict Validation:** Do not allow Motor policy issuance without a valid 17-character Chassis Number and Ghana Card ID.
2.  **Statutory Compliance:** Ensure the 1.5% NIC Levy is added to all Motor premiums.
3.  **Idempotency:** Ensure the Paystack webhook does not trigger double policy issuance if received twice.
