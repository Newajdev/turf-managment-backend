# Sports Turf Booking System --- Backend PRD

## Project Overview

Sports Turf Booking System is a RESTful backend API that allows players
to book sports turfs online. The platform enables players to browse
turfs, select available time slots, and book them.

Turf owners manage their turfs, slot availability, and pricing, while
system administrators manage platform-wide configurations such as sport
types, turf owners, and master slots.

The system uses Role-Based Access Control (RBAC) and secure
authentication.

------------------------------------------------------------------------

## Technology Stack

  Layer            Technology
  ---------------- -------------------
  Runtime          Node.js
  Framework        Express.js
  Language         TypeScript
  ORM              Prisma ORM
  Database         PostgreSQL
  Authentication   Better Auth + JWT
  Validation       Zod
  Email Service    Nodemailer

Architecture Pattern: Controller → Service → Repository

------------------------------------------------------------------------

## User Roles

### SYSTEM_ADMIN

-   Create turf owners
-   Manage platform users
-   Create sport types
-   Create master slots
-   Monitor system analytics

### TURF_OWNER

-   Login to system
-   Create and manage turfs
-   Select available slots
-   Set slot pricing
-   Manage bookings

### PLAYER

-   Register account
-   Browse turfs
-   Select slot
-   Book turf slots
-   Receive booking confirmations

------------------------------------------------------------------------
## Turf_owner Creation Steps

-   System Admin create turf_owner using email, and password
-   after successfull creation send a mail with the email and password to the turf_owners mail
-   then turf owner can login but on first login the turf owner must need to change the password.

------------------------------------------------------------------------

## Authentication System

Authentication uses Better Auth with JWT.

Tokens: - Access Token - Refresh Token

Security Features: - Secure login - Password hashing - Role-based
authorization - Email verification - Token expiration

------------------------------------------------------------------------

## Registration Rules

### System Admin

-   Cannot self-register
-   Created via seed script

### Turf Owner

-   Created only by System Admin
-   Cannot self-register

### Player

-   Can self-register
-   Email verification required

------------------------------------------------------------------------

## Turf Management

Only Turf Owners can create turfs.

Fields: - id - name - sportTypeId - location - address - description -
image - ownerId - createdAt - updatedAt

------------------------------------------------------------------------

## Sport Type Management

Managed by System Admin.

Examples: - Cricket - Football - Futsal - Badminton

Fields: - id - title - description - createdAt

------------------------------------------------------------------------

## Slot Management

Step 1 --- System Admin creates MASTER SLOTS

Examples: 06:00 -- 07:00\
07:00 -- 08:00\
08:00 -- 09:00

Fields: - id - startTime - endTime - duration

Step 2 --- Turf Owners select slots from master slots for their turfs.

------------------------------------------------------------------------

## Slot Pricing

Turf owners define price per slot.

Example: 06:00--07:00 → 500 BDT\
07:00--08:00 → 700 BDT\
08:00--09:00 → 900 BDT

Fields: - turfId - slotId - price - isActive

------------------------------------------------------------------------

## Booking System

Booking Flow:

Player → Select Turf → Select Date → Select Slot → Payment → Booking
Confirmed

Rules: - Slot must be available - Double booking prevented - Booking
record created - Payment completed - Slot becomes booked

------------------------------------------------------------------------

## Booking Status

-   PENDING
-   CONFIRMED
-   REJECTED
-   CANCELLED
-   COMPLETED

------------------------------------------------------------------------

## Online Payment Integration

Payment is required before booking confirmation.

Payment Flow:

Player → Select Slot → Create Booking (PENDING) → Payment Gateway →
Success → Booking CONFIRMED

Payment Fields: - id - bookingId - amount - currency - paymentMethod -
paymentStatus - transactionId - paidAt - createdAt

Payment Status: - PENDING - SUCCESS - FAILED - REFUNDED

Possible Payment Methods: - SSLCommerz - bKash - Nagad - Card

------------------------------------------------------------------------

## Turf Reviews & Ratings

Players can review a turf after completing a booking.

Rules: - Only players with completed bookings can review - One review
per booking

Fields: - id - userId - turfId - bookingId - rating - comment -
createdAt

Rating Range: 1--5 stars

------------------------------------------------------------------------

## Admin Analytics Dashboard

Admins can view platform analytics.

Metrics: - Total Users - Total Players - Total Turf Owners - Total
Turfs - Total Bookings - Total Revenue - Most Booked Turf - Monthly
Booking Growth

Example Data: - totalUsers - totalBookings - totalRevenue -
monthlyBookings - topTurfs

------------------------------------------------------------------------

## Booking History

Players and turf owners can view booking history.

Player History: - Past bookings - Upcoming bookings - Cancelled
bookings - Completed bookings

Owner History: - All bookings for their turfs - Daily booking records -
Revenue from bookings

Fields: - id - userId - turfId - slotId - date - status -
paymentStatus - createdAt

------------------------------------------------------------------------

## Database Entities

-   User
-   SportType
-   Turf
-   MasterSlot
-   TurfSlot
-   Booking
-   Payment
-   Review
-   Notification

------------------------------------------------------------------------

## Business Rules

-   Turf owners cannot self-register
-   Only turf owner can create turfs
-   System admin creates master slots
-   Turf owners select slots
-   Turf owners set slot prices
-   Double booking is not allowed
-   Booking can be cancelled before 24 hours
-   Turf owners can reject bookings
-   Email notifications must be sent

------------------------------------------------------------------------

## Backend Modules

-   auth
-   user
-   sportType
-   turf
-   masterSlot
-   turfSlot
-   booking
-   payment
-   review
-   notification
-   analytics

------------------------------------------------------------------------

## Suggested Folder Structure

src ├── modules │ ├── auth │ ├── user │ ├── turf │ ├── sportType │ ├──
slot │ ├── booking │ ├── payment │ ├── review │ └── analytics │ ├──
middleware ├── utils ├── config └── server.ts

