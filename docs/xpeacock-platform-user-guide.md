# xpeacock Platform Guide

**Confidential client handover** · Version 1.1 · July 2026

Operator manual for the xpeacock streaming platform: browse & watch, accounts, subscriptions, creator studio, and admin / superadmin controls.

---

## 1. Roles at a glance

| Role | Access | Typical tasks |
|------|--------|----------------|
| **Guest** | Public site | Browse, search, watch free titles, sign up |
| **Viewer** | Signed-in user | Like, continue watching, subscribe, report, support tickets |
| **Creator** | `/dashboard` | Upload videos, manage channel, request payouts |
| **Admin** | Trust & safety tools | Moderation, support inbox, verification, users |
| **Superadmin** | Full ops | Plans, promos, payouts, UPI, payment audits, stats |

Local demo stack used for screenshots: frontend `localhost:3000` · API `localhost:5141`.

---

## 2. First visit

Users must confirm **18+** age, then accept cookies. Preferences are stored in the browser.

![Age gate](assets/guide/01-age-gate.png)

![Cookie consent](assets/guide/02-cookie-consent.png)

**Theme:** sun/moon control in the header (and dashboard header) switches dark ↔ light.

---

## 3. Browse & discover

Home shows a featured hero, filter chips (Trending, Newest, Premium, categories), and the video grid. Premium titles carry a gold **PREMIUM** badge. Sidebar Discover links and category counts mirror the same catalogue.

![Home catalogue](assets/guide/03-home.png)

| Surface | Route | Purpose |
|---------|-------|---------|
| Categories | `/categories` | Directory of all categories |
| Search | `/search?q=` | Videos, creators, categories |
| Channel | `/channel/[id]` | Public creator page |

![Categories](assets/guide/04-categories.png)

![Search](assets/guide/05-search.png)

![Creator channel](assets/guide/06-channel.png)

**Mobile:** bottom nav + compact header for primary browse actions.

![Mobile home](assets/guide/14-mobile.png)

---

## 4. Watch

**Free public titles** play on `/watch/[id]` with metadata, comments, Up Next, and related videos.

![Free watch](assets/guide/07-watch-free.png)

**Paid / rent titles** show a soft paywall (sign in / subscribe) until the viewer has entitlement. Metadata and related content may still appear.

![Premium paywall](assets/guide/08-watch-paywall.png)

**Signed-in actions:** like, dislike, comment, share, and **Report** (opens a modal to flag content for moderation).

| Topic | Notes |
|-------|--------|
| Geo restriction | Blocked region → unavailable state instead of stream |
| DRM | Paid titles may use DRM-backed delivery after unlock |
| Device sessions | Concurrent logins may be capped — clear older sessions if login is refused |

---

## 5. Accounts

| Action | Route |
|--------|-------|
| Sign in | `/login` |
| Sign up (viewer) | `/signup` |
| Sign up (creator) | `/signup?role=creator` |
| Password reset | `/forgot-password` |

![Login](assets/guide/10-login.png)

![Creator signup](assets/guide/11-signup.png)

Sign out from the header avatar menu.

---

## 6. Viewer library & profile

| Feature | Route |
|---------|-------|
| Liked videos | `/liked` |
| Profile & preferences | `/profile` |
| Continue watching | Home shelf (when history exists) |
| Support tickets | `/support` (signed in) |

![Liked](assets/guide/15-liked.png)

![Profile](assets/guide/16-profile.png)

---

## 7. Subscriptions & payments

`/subscriptions` lists plans for guests and signed-in checkout.

![Plans (guest)](assets/guide/09-subscriptions.png)

![Checkout (signed in)](assets/guide/17-subscribe-checkout.png)

**Payment paths**

1. **Razorpay** — card / wallet checkout via the configured public key; success activates entitlement.
2. **Manual UPI** — pay to a listed UPI account, submit UTR; Superadmin approves under Payment Audits.

Promo codes apply on the subscribe form when configured.

---

## 8. Creator studio

Creators work in `/dashboard`.

| Area | Route | What to do |
|------|-------|------------|
| Overview | `/dashboard` | Stats, charts, recent uploads |
| Videos | `/dashboard/videos` | List, upload wizard, edit, public/private visibility |
| Channels | `/dashboard/channels` | Channel profile + verification docs |
| Payouts | `/dashboard/payouts` | Request payout, track status |
| Settings | `/dashboard/settings` | Profile, security, payout UPI |

![Creator dashboard](assets/guide/19-creator-dashboard.png)

![Videos](assets/guide/20-creator-videos.png)

![Upload wizard](assets/guide/21-upload-wizard.png)

![Channels](assets/guide/22-creator-channels.png)

![Payouts](assets/guide/23-creator-payouts.png)

![Settings](assets/guide/24-creator-settings.png)

---

## 9. Admin (trust & safety)

Available to `admin` and `superadmin`.

| Tool | Route |
|------|-------|
| Moderation | `/dashboard/admin/moderation` — reports, resolve, deactivate |
| Support inbox | `/dashboard/admin/support` |
| Verification | `/dashboard/admin/verification` — approve/reject creator docs |
| Users | `/dashboard/users` |

![Moderation](assets/guide/25-moderation.png)

![Support inbox](assets/guide/26-admin-support.png)

![Verification](assets/guide/27-verification.png)

![Users](assets/guide/28-users.png)

---

## 10. Superadmin (monetization)

| Tool | Route / tab |
|------|-------------|
| Creator payouts | `/dashboard/admin/payouts` — settle / reject |
| Plans | Subscriptions → **Plans** — CRUD + enable/disable |
| Promos | → **Promo Codes** |
| Subscribers | → **Subscribers** — list + manual grant |
| Statistics | → **Statistics** — revenue & counts |
| UPI accounts | → **UPI Accounts** — shown on manual pay |
| Payment audits | → **Payment Audits** — approve UTRs |
| Payment reports | → **Payment Reports** |

![Admin payouts](assets/guide/29-admin-payouts.png)

![Plans](assets/guide/30-plans.png)

![Promos](assets/guide/31-promos.png)

![Statistics](assets/guide/32-stats.png)

![Payment audits](assets/guide/33-payment-audits.png)

---

## 11. Legal & support

Footer links: Terms (`/terms`), Privacy, Cookies, FAQ, DMCA, 2257. Support center: `/support`.

![Support](assets/guide/12-support.png)

![Legal (Terms)](assets/guide/13-legal.png)

Other legal pages use the same layout; open them from the footer.

---

## 12. Demo accounts (non-production)

| Role | Email | Password |
|------|-------|----------|
| Creator | creator@knightkings.com | Creator#2026 |
| Admin | admin@knightkings.com | Admin#2026 |
| Superadmin | superadmin@knightkings.com | SuperAdmin#2026 |

---

## 13. Troubleshooting

| Issue | Fix |
|-------|-----|
| Empty / endless skeletons | Open the app as `http://localhost:3000` (not `127.0.0.1`) when the API URL uses `localhost`. Confirm API on `:5141`. |
| Login device limit | Sign out other devices or clear that user’s `loginsessions`. |
| Premium won’t play | Active subscription required (or Superadmin grant). |
| UTR not activating | Superadmin → Payment Audits → approve. |
| Upload fails | Creator session + Bunny/TUS server config. |

### Regenerate this document

```bash
node docs/scripts/capture-user-guide.cjs
node docs/scripts/build-guide-pdf.cjs
```

© 2026 xpeacock · Screenshots from live product UI
