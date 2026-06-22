# Vision E-Commerce Dashboard

React + Express + MongoDB full-stack e-commerce admin panel with Cloudinary image hosting.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Express.js (Node.js) |
| Database | MongoDB + Mongoose |
| Images | Cloudinary |
| Auth | JWT (jsonwebtoken) |

---

## Project Structure

```
vision_deshobrd-main/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
│
├── src/                          # Frontend (React)
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Routes + PixelInjector
│   ├── index.css                 # Global styles
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx         # Admin panel (all sections)
│   │   ├── Login.jsx             # Admin login
│   │   ├── Home.jsx              # Homepage
│   │   ├── Products.jsx          # All products (dynamic price filter)
│   │   ├── ProductDetails.jsx    # Single product page
│   │   ├── CategoryPage.jsx      # Category listing
│   │   ├── SubcategoryPage.jsx   # Subcategory listing
│   │   ├── Cart.jsx              # Cart + checkout + coupon
│   │   ├── ThankYou.jsx          # Order confirmation
│   │   ├── About.jsx             # About page
│   │   ├── Contact.jsx           # Contact page
│   │   ├── Support.jsx           # Support page
│   │   ├── StaticPage.jsx        # Dynamic CMS pages (DB)
│   │   └── Language.jsx          # Language selector
│   │
│   ├── components/
│   │   ├── Header.jsx            # Site header + nav
│   │   ├── Footer.jsx            # Site footer
│   │   ├── Hero.jsx              # Banner slider (Cloudinary)
│   │   ├── ProductCard.jsx       # Product card UI
│   │   ├── ProductVisual.jsx     # Product visual renderer
│   │   ├── ManufacturingShowcase.jsx  # Factory images/videos (DB)
│   │   ├── BannerManager.jsx     # Admin: banner upload
│   │   ├── CouponManager.jsx     # Admin: coupon CRUD
│   │   ├── FlashSaleManager.jsx  # Admin: flash sale + countdown
│   │   ├── SiteSettings.jsx      # Admin: site-wide settings
│   │   └── ScrollToTop.jsx       # Scroll restoration
│   │
│   ├── hooks/
│   │   ├── useCategories.js      # Fetch categories (DB + fallback)
│   │   └── useCatalogProducts.js # Fetch products (DB + fallback)
│   │
│   ├── services/
│   │   ├── api.js                # All API helpers (banners, pages, etc.)
│   │   ├── dashboardApi.js       # Dashboard stats + orders
│   │   ├── productsApi.js        # Product CRUD API calls
│   │   └── stockApi.js           # Stock management API calls
│   │
│   ├── data/
│   │   └── data.js               # Static fallback data + assetPath()
│   │
│   └── utils/
│       └── cart.js               # Cart state (localStorage)
│
└── server/                       # Backend (Express)
    ├── index.js                  # Main server + product/order/pages routes
    │
    ├── config/
    │   └── database.js           # MongoDB connection
    │
    ├── models/
    │   ├── Admin.js              # Admin user schema
    │   ├── Banner.js             # Hero banner schema
    │   ├── Blog.js               # Blog/review schema
    │   ├── Category.js           # Category + subcategory schema
    │   ├── Coupon.js             # Discount coupon schema
    │   ├── FlashSale.js          # Flash sale schema
    │   ├── Order.js              # Order schema (+ courierTrackingId)
    │   ├── Page.js               # CMS static page schema
    │   ├── Product.js            # Product schema (+ priceOptions)
    │   ├── Review.js             # Customer review schema
    │   ├── Settings.js           # Key-value settings store
    │   └── StockTransaction.js   # Stock change log
    │
    ├── routes/
    │   ├── banner.js             # GET/POST/PUT/DELETE /api/banners
    │   ├── categories.js         # GET/POST/PUT/DELETE /api/categories
    │   ├── content.js            # Blogs + reviews /api/content
    │   ├── coupons.js            # Coupon CRUD /api/coupons
    │   ├── dashboard.js          # Stats, orders, users /api/dashboard
    │   ├── flashsales.js         # Flash sale CRUD /api/flashsales
    │   ├── settings.js           # Key-value settings /api/settings
    │   └── stock.js              # Stock management /api/stock
    │
    ├── seed-demo.js              # Demo data seeder
    └── seed-categories.js        # Category seeder
```

---

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all active products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (image to Cloudinary) |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Banners
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/banners` | Get active banners (public) |
| GET | `/api/banners/all` | Get all banners (admin) |
| POST | `/api/banners` | Upload banner (image to Cloudinary) |
| PUT | `/api/banners/:id` | Update banner |
| DELETE | `/api/banners/:id` | Delete banner |

### Settings (Key-Value Store)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/:key` | Get a setting |
| PUT | `/api/settings/:key` | Save a setting |
| POST | `/api/settings/upload` | Upload image to Cloudinary |
| POST | `/api/settings/smtp/test` | Send test SMTP email |

**Setting keys used:**
- `general` — site name, logo, contact info, social links
- `bkash` — bKash merchant config
- `payment-settings` — COD/bKash/Nagad active state
- `pixel` — Facebook Pixel, GA4, GTM config
- `smtp` — SMTP email config + notification toggles
- `steadfast` — Steadfast courier API config
- `highlights` — Manufacturing highlights (images)
- `videos` — Factory videos (YouTube/local)
- `filter-ranges` — Price filter ranges for Products page

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place new order |
| POST | `/api/orders/:id/steadfast` | Send order to Steadfast courier |

### Pages (CMS)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pages/slug/:slug` | Get page by slug (public) |

---

## Admin Dashboard Sections

| Section | Description |
|---------|-------------|
| পণ্য ম্যানেজমেন্ট | Add/edit/delete products, image to Cloudinary |
| ক্যাটাগরি | Category + subcategory management |
| ব্যানার | Hero slider banners, image to Cloudinary |
| ফ্ল্যাশ সেল | Flash sale with real-time countdown |
| অর্ডার | Order list + status update + Steadfast courier |
| শিপিং চার্জ | Inside/outside Dhaka shipping rates |
| কুরিয়ার API | Steadfast courier API key config |
| বিকাশ পেমেন্ট | bKash merchant API config |
| পেমেন্ট সেটিংস | Enable/disable COD, bKash, Nagad, Rocket |
| কুপন | Discount coupon CRUD |
| পেজ ম্যানেজ | CMS static pages (privacy, terms, etc.) |
| ফ্রন্টএন্ড কন্টেন্ট | Manufacturing highlights + factory videos |
| ফিল্টার সেটিংস | Product page price range filter config |
| ট্র্যাকিং পিক্সেল | Facebook Pixel + GA4 + GTM |
| SMTP ইমেইল | Email server config + test send |
| জেনারেল সেটিংস | Site name, logo, favicon, social links |
| সাইট সেটিংস | SEO, footer, global config |
| স্টক ম্যানেজমেন্ট | Real-time stock alerts + adjustment |
| ইউজার ম্যানেজমেন্ট | Admin user management |

---

## Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/vision

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

---

## Running the Project

```bash
# Install dependencies
npm install

# Run backend only
npm run server

# Run frontend only
npm run dev

# Run both (concurrently)
npm run dev:full

# Seed demo data
npm run db:seed

# Build for production
npm run build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Admin panel: http://localhost:5173/admin

---

## Image Upload Flow

1. Admin selects image in any form
2. Frontend sends `multipart/form-data` to backend
3. Backend receives via `multer` (memory storage)
4. Backend streams file buffer to Cloudinary
5. Cloudinary returns `secure_url`
6. URL saved to MongoDB
7. Frontend displays Cloudinary URL

All product images, banner images, category images, logo, favicon, and content images go through this flow.
