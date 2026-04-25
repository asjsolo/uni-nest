# Postman Tests — Profile, Platform Reviews, Trust Score, Lending/Borrowing History

This folder contains Postman files for the endpoints owned in this branch.

## Files

| File | Purpose |
| --- | --- |
| `UniNest-MyScope.postman_collection.json` | All requests + assertion scripts |
| `UniNest-MyScope.postman_environment.json` | Variables (baseUrl, tokens, ids) |

## Setup

1. Start MongoDB and the backend: `cd backend && npm start`. The collection assumes `http://localhost:5000`.
2. Open Postman → **Import** → drop both files in.
3. Top-right environment dropdown → select **"UniNest — My Scope"**.

## Run order

Run folders top-to-bottom. The tests chain via env vars (`tokenA`, `tokenB`, `userIdA`, `userIdB`, `platformReviewId`).

1. **👤 User Profile** — registers + logs in two users. Populates tokens and user ids. Includes negative tests (wrong password, missing token, invalid id).
2. **⭐ Platform Reviews** — submit / list / update / delete a platform review. Verifies User B cannot edit User A's review (403) and that re-deleting returns 404.
3. **🏆 Trust Score** — `/me` and public `/:userId`. Validates payload shape, score range, tier-to-label mapping.
4. **📊 Lending & Borrowing History** — lender bookings, borrower bookings, public summary. Asserts `totalCompleted == completedAsLender + completedAsBorrower`.

To run everything at once: **Collection Runner** → select the collection → select the environment → **Run**.

## Endpoint scope

| Group | Method | Endpoint | Auth |
| --- | --- | --- | --- |
| Profile | POST | `/api/auth/register` | – |
| Profile | POST | `/api/auth/login` | – |
| Profile | GET  | `/api/auth/profile` | ✅ |
| Profile | GET  | `/api/auth/user/:userId` | – |
| Platform Reviews | GET    | `/api/platform-reviews` | – |
| Platform Reviews | POST   | `/api/platform-reviews` | ✅ |
| Platform Reviews | PUT    | `/api/platform-reviews/:reviewId` | ✅ own |
| Platform Reviews | DELETE | `/api/platform-reviews/:reviewId` | ✅ own |
| Trust Score | GET | `/api/item-reviews/trust-score/me` | ✅ |
| Trust Score | GET | `/api/item-reviews/trust-score/:userId` | – |
| History | GET | `/api/bookings/lender-bookings` | ✅ |
| History | GET | `/api/bookings/my-requests` | ✅ |
| History | GET | `/api/bookings/summary/:userId` | – |

## Running from the CLI (Newman)

Install once: `npm i -g newman`

Then from the project root:

```bash
newman run testing/postman/UniNest-MyScope.postman_collection.json \
  -e testing/postman/UniNest-MyScope.postman_environment.json
```

Newman exits non-zero if any assertion fails — useful in CI.

## Test users

The collection registers/logs in two fixed users:

| Role | Email | Password |
| --- | --- | --- |
| User A (lender side) | `IT11111111@my.sliit.lk` | `pass1234` |
| User B (borrower side) | `IT22222222@my.sliit.lk` | `pass1234` |

If they already exist, register requests return 400 — the tests skip the create assertions and login picks up from there.

## Tips

- Need to reset state? Drop the test users from MongoDB and re-run from the top.
- The history requests return `[]` until real bookings exist. Create some via the booking endpoints (or the frontend) to see populated rows.
- Trust score will be `0 / new` until item reviews + completed bookings exist for User A.
