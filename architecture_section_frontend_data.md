### How the Homepage is Data-Driven

The homepage fetches ALL content from the backend database. **Zero hardcoded business data.**

```
┌─────────────────────────────────────────────────────────────┐
│                    HOMEPAGE DATA FLOW                        │
│                                                              │
│  HeroSection                                                 │
│  ├── Fetches hero image from GET /api/settings               │
│  └── Falls back to brand gradient if no image uploaded       │
│                                                              │
│  AvailableToday (Products)                                   │
│  ├── Fetches from GET /api/products?availableToday=true      │
│  └── Shows real products from database with real prices      │
│                                                              │
│  FeaturedSections ("What are you looking for?")              │
│  ├── Fetches from GET /api/settings → featured_sections      │
│  ├── Admin manages: title, description, image per card       │
│  └── Falls back to default titles if admin hasn't configured │
│                                                              │
│  WhyChooseSection ("Why Choose Bamzy?")                      │
│  ├── Fetches from GET /api/settings → why_choose_bamzy       │
│  ├── Admin manages: title + description per benefit          │
│  └── Falls back to 5 default benefits if not configured      │
│                                                              │
│  ReviewsSection                                              │
│  ├── Fetches from GET /api/reviews (approved only)           │
│  ├── Shows REAL customer reviews from database               │
│  └── Empty state: "No reviews yet — be the first"           │
│                                                              │
│  NewsletterSection                                           │
│  ├── Submits via POST /api/newsletter/subscribe              │
│  └── Connected to Brevo email service                        │
│                                                              │
│  Events + Trainings sections                                 │
│  ├── Fetch from GET /api/settings and GET /api/trainings     │
│  └── Admin-configurable event types and training data        │
└─────────────────────────────────────────────────────────────┘
```

**Admin controls from Settings page:**
- Hero image
- Featured section cards (3 cards: title, description, image)
- Why Choose Bamzy benefits (add/remove/edit)
- Event types and images
- About page content (CEO photo, story, values, gallery)
- Delivery fees by zone
- FAQ categories and questions

**To add/modify homepage content:** Admin → Settings → edit → Save → instant reflection on customer site.

### How Admin Settings Flow to Customer Site

```
Admin Settings Page
  → PUT /api/settings (saves to business_settings table)
  → Customer pages call GET /api/settings on load
  → Settings render with admin-configured content
  → If admin hasn't configured → safe defaults shown
```

**Key principle:** The frontend NEVER invents business data. Every product, price, review, event type, training, and setting comes from the database. If there's no data, it shows an empty state — not fake data.

---

