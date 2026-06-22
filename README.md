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
| Slider | Swiper.js |
| Icons | Lucide React |

---

## Project Structure

```
vision_deshobrd-main/
│
├── index.html                        # Vite HTML entry
├── package.json                      # Scripts + dependencies
├── vite.config.js                    # Vite config (React plugin)
├── tailwind.config.js                # Tailwind CSS config + custom colors
├── postcss.config.js                 # PostCSS config
├── .env                              # Environment variables (not committed)
├── .env.example                      # Example env vars
├── .gitignore
│
├── public/                           # Static assets (served as-is by Vite)
│   ├── vision-logo.jpeg              # Site logo (fallback)
│   ├── .htaccess                     # Apache redirect rules (SPA routing)
│   ├── _redirects                    # Netlify redirect rules (SPA routing)
│   │
│   ├── hero/                         # Banner/slider images (local fallback)
│   │   ├── non-forst-english-1920x550.jpg
│   │   ├── side-by-side.jpg
│   │   ├── single-door.jpg
│   │   ├── verticle-freezer.jpg
│   │   ├── canvas-v1.jpg
│   │   └── ...                       # More hero images
│   │
│   ├── products/                     # Product images (local fallback)
│   │   ├── air-conditioner-photo.jpg
│   │   ├── refrigerator-silver.jpg
│   │   ├── tv-w55s3bg.jpg
│   │   ├── electric-kettle-glass.jpg
│   │   ├── washing-machine-white-front.jpg
│   │   ├── deep-freezer-white.jpg
│   │   └── ...                       # More product images
│   │
│   └── manufacturing/                # Factory/highlight images + videos
│       ├── ac-compressor-gree.jpeg
│       ├── appliance-washer-front.jpeg
│       ├── factory-video-assembly-1.mp4
│       ├── factory-video-assembly-2.mp4
│       ├── factory-video-assembly-3.mp4
│       └── ...                       # More manufacturing media
│
├── src/                              # Frontend source (React + Vite)
│   ├── main.jsx                      # React entry — mounts App to DOM
│   ├── App.jsx                       # Routes (React Router) + PixelInjector
│   ├── index.css                     # Global CSS + Tailwind directives
│   │
│   ├── pages/                        # Route-level page components
│   │   ├── Home.jsx                  # Homepage (Hero + categories + products + showcase)
│   │   ├── Products.jsx              # All products (category + price filter, dynamic ranges)
│   │   ├── ProductDetails.jsx        # Single product detail page
│   │   ├── CategoryPage.jsx          # Products filtered by category
│   │   ├── SubcategoryPage.jsx       # Products filtered by subcategory
│   │   ├── Cart.jsx                  # Cart + coupon code + checkout form
│   │   ├── ThankYou.jsx              # Order confirmation page
│   │   ├── About.jsx                 # Static about page
│   │   ├── Contact.jsx               # Contact page
│   │   ├── Support.jsx               # Support/FAQ page
│   │   ├── StaticPage.jsx            # Dynamic CMS pages (from DB by slug)
│   │   ├── Language.jsx              # Language selector page
│   │   ├── Login.jsx                 # Admin login (JWT)
│   │   └── Dashboard.jsx             # Admin panel — all management sections
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── Header.jsx                # Site header + navigation + cart icon
│   │   ├── Footer.jsx                # Site footer + links
│   │   ├── Hero.jsx                  # Banner slider (Swiper, loads from Cloudinary/DB)
│   │   ├── ProductCard.jsx           # Product card (image, name, price, colors)
│   │   ├── ProductVisual.jsx         # Product image renderer (Cloudinary URL or local)
│   │   ├── ManufacturingShowcase.jsx # Factory highlights + videos (from DB)
│   │   ├── ScrollToTop.jsx           # Scroll to top on route change
│   │   ├── BannerManager.jsx         # Admin: banner CRUD + image upload to Cloudinary
│   │   ├── CouponManager.jsx         # Admin: coupon CRUD
│   │   ├── FlashSaleManager.jsx      # Admin: flash sale + real-time countdown
│   │   └── SiteSettings.jsx          # Admin: site-wide settings (SEO, footer, etc.)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useCategories.js          # Fetch categories (DB → fallback to static data)
│   │   └── useCatalogProducts.js     # Fetch products (DB → fallback to static data)
│   │
│   ├── services/                     # API call helpers
│   │   ├── api.js                    # Banners, pages, settings, pixel, content helpers
│   │   ├── dashboardApi.js           # Dashboard stats, orders, users
│   │   ├── productsApi.js            # Product CRUD API calls
│   │   └── stockApi.js               # Stock management API calls
│   │
│   ├── data/
│   │   └── data.js                   # Static fallback data (products, categories) + assetPath()
│   │
│   └── utils/
│       └── cart.js                   # Cart state management (localStorage)
│
└── server/                           # Backend source (Express.js)
    ├── index.js                      # Main server entry:
    │                                 #   - MongoDB connection
    │                                 #   - Cloudinary config
    │                                 #   - multer memory storage
    │                                 #   - Auth middleware (JWT)
    │                                 #   - All product routes (inline)
    │                                 #   - Order routes (inline)
    │                                 #   - CMS page routes (inline)
    │                                 #   - Admin user routes (inline)
    │                                 #   - POST /api/admin/seed-products (demo import)
    │                                 #   - All route files mounted
    │
    ├── config/
    │   └── database.js               # Mongoose connect() helper
    │
    ├── models/                       # Mongoose schemas
    │   ├── Admin.js                  # Admin user (username, password hash, role)
    │   ├── Banner.js                 # Hero banner (image URL, title, alt, link, sortOrder)
    │   ├── Blog.js                   # Blog post / review schema
    │   ├── Category.js               # Category + subcategories array
    │   ├── Coupon.js                 # Discount coupon (code, type, value, expiry)
    │   ├── FlashSale.js              # Flash sale (product, discount, start/end time)
    │   ├── Order.js                  # Order (items, customer, status, courierTrackingId)
    │   ├── Page.js                   # CMS page (name, slug, title, content, isActive)
    │   ├── Product.js                # Product (name, price, category, images, priceOptions)
    │   ├── Review.js                 # Customer review (rating, text, product ref)
    │   ├── Settings.js               # Key-value settings store (key, value)
    │   └── StockTransaction.js       # Stock change log (product, qty, type, note)
    │
    ├── routes/                       # Express route files
    │   ├── banner.js                 # GET/POST/PUT/DELETE /api/banners
    │   ├── categories.js             # GET/POST/PUT/DELETE /api/categories
    │   ├── content.js                # Blogs + reviews /api/content
    │   ├── coupons.js                # Coupon CRUD /api/coupons
    │   ├── dashboard.js              # Stats, orders list, user list /api/dashboard
    │   ├── flashsales.js             # Flash sale CRUD /api/flashsales
    │   ├── settings.js               # Key-value settings /api/settings
    │   └── stock.js                  # Stock management /api/stock
    │
    ├── seed-demo.js                  # Demo data seeder (run via npm run db:seed)
    └── seed-categories.js            # Category seeder script
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Admin login → returns JWT token |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | — | Get all active products |
| GET | `/api/products/:id` | — | Get single product by ID |
| POST | `/api/products` | JWT | Create product (image to Cloudinary) |
| PUT | `/api/products/:id` | JWT | Update product |
| DELETE | `/api/products/:id` | JWT | Delete product |
| POST | `/api/admin/seed-products` | JWT | Import all demo products from static data → Cloudinary + MongoDB |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | — | Get all categories |
| GET | `/api/categories/all` | JWT | Get all categories (admin) |
| POST | `/api/categories` | JWT | Create category |
| PUT | `/api/categories/:id` | JWT | Update category |
| DELETE | `/api/categories/:id` | JWT | Delete category |

### Banners
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/banners` | — | Get active banners (public) |
| GET | `/api/banners/all` | JWT | Get all banners (admin) |
| POST | `/api/banners` | JWT | Upload banner (image to Cloudinary) |
| PUT | `/api/banners/:id` | JWT | Update banner |
| DELETE | `/api/banners/:id` | JWT | Delete banner |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | — | Place new order |
| GET | `/api/orders` | JWT | Get all orders (admin) |
| PUT | `/api/orders/:id/status` | JWT | Update order status |
| POST | `/api/orders/:id/steadfast` | JWT | Send order to Steadfast courier API |

### Coupons
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/coupons` | — | Get all active coupons |
| POST | `/api/coupons/validate` | — | Validate coupon code + return discount |
| POST | `/api/coupons` | JWT | Create coupon |
| PUT | `/api/coupons/:id` | JWT | Update coupon |
| DELETE | `/api/coupons/:id` | JWT | Delete coupon |

### Flash Sales
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/flashsales` | — | Get active flash sales |
| POST | `/api/flashsales` | JWT | Create flash sale |
| PUT | `/api/flashsales/:id` | JWT | Update flash sale |
| DELETE | `/api/flashsales/:id` | JWT | Delete flash sale |

### Settings (Key-Value Store)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/settings/:key` | — | Get a setting by key |
| PUT | `/api/settings/:key` | JWT | Save a setting by key |
| POST | `/api/settings/upload` | JWT | Upload image to Cloudinary, return URL |
| POST | `/api/settings/smtp/test` | JWT | Send test SMTP email |

### Dashboard / Stats
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/stats` | JWT | Revenue, orders, users counts |
| GET | `/api/dashboard/sales-report` | JWT | Monthly sales data |
| GET | `/api/dashboard/users` | JWT | Admin user list |
| POST | `/api/dashboard/users` | JWT | Create admin user |

### Stock
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stock/products` | JWT | Products with stock levels |
| GET | `/api/stock/alerts` | JWT | Low-stock product alerts |
| POST | `/api/stock/adjust` | JWT | Adjust stock for a product |
| GET | `/api/stock/transactions` | JWT | Stock transaction history |

### Pages (CMS)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/pages` | JWT | Get all pages (admin) |
| GET | `/api/pages/slug/:slug` | — | Get page by slug (public) |
| POST | `/api/pages` | JWT | Create page |
| PUT | `/api/pages/:id` | JWT | Update page |
| DELETE | `/api/pages/:id` | JWT | Delete page |

### Content (Blogs / Reviews)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/content/blogs` | — | Get all blogs |
| GET | `/api/content/reviews` | — | Get all reviews |
| POST | `/api/content/blogs` | JWT | Create blog |
| POST | `/api/content/reviews` | JWT | Create review |

---

## Settings Keys

The `/api/settings/:key` endpoint stores any JSON value. Keys in use:

| Key | Description |
|-----|-------------|
| `general` | Site name, logo URL, favicon URL, phone, email, address, social links |
| `bkash` | bKash merchant number, API key, secret |
| `payment-settings` | Enable/disable COD, bKash, Nagad, Rocket |
| `pixel` | Facebook Pixel ID, GA4 measurement ID, GTM container ID |
| `smtp` | SMTP host, port, user, pass, from address, notification toggles |
| `steadfast` | Steadfast courier API key + secret key |
| `highlights` | Manufacturing highlight images (array of {image, title, description}) |
| `videos` | Factory videos (array of {src, poster, title, type}) |
| `filter-ranges` | Price filter ranges for Products page (array of {id, label, min?, max?}) |
| `shipping-charge` | Inside Dhaka + outside Dhaka shipping rates |

---

## Admin Dashboard Sections

| Nav Key | Section | Description |
|---------|---------|-------------|
| `overview` | ড্যাশবোর্ড | Revenue + orders + users stats, sales chart |
| `products` | পণ্য ম্যানেজমেন্ট | Add/edit/delete products, image upload to Cloudinary, demo import |
| `categories` | ক্যাটাগরি | Category + subcategory management with accent color |
| `orders` | অর্ডার | Order list, status update, Steadfast courier dispatch |
| `banners` | ব্যানার | Hero slider banners, image upload to Cloudinary |
| `flash-sale` | ফ্ল্যাশ সেল | Flash sale with real-time countdown |
| `stock` | স্টক ম্যানেজমেন্ট | Real-time stock levels, alerts, adjustment log |
| `coupons` | কুপন | Discount coupon CRUD (percentage + fixed) |
| `page-management` | পেজ ম্যানেজ | CMS static pages (privacy, terms, about, etc.) |
| `frontend-content` | ফ্রন্টএন্ড কন্টেন্ট | Manufacturing highlights + factory videos |
| `filter-settings` | ফিল্টার সেটিংস | Product page price range filter config |
| `shipping-charge` | শিপিং চার্জ | Inside/outside Dhaka shipping rates |
| `courier-api` | কুরিয়ার API | Steadfast courier API key config |
| `bkash` | বিকাশ পেমেন্ট | bKash merchant API config |
| `payment-settings` | পেমেন্ট সেটিংস | Enable/disable COD, bKash, Nagad, Rocket |
| `facebook-pixel` | ট্র্যাকিং পিক্সেল | Facebook Pixel + GA4 + GTM config |
| `smtp-email` | SMTP ইমেইল | Email server config + test send |
| `general-settings` | জেনারেল সেটিংস | Site name, logo, favicon, phone, social links |
| `site-settings` | সাইট সেটিংস | SEO, footer, global config |
| `users` | ইউজার ম্যানেজমেন্ট | Admin user list + create admin |

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

# Run backend only (port 5000)
npm run server

# Run frontend only (port 5173)
npm run dev

# Run both simultaneously
npm run dev:full

# Seed demo products + categories to MongoDB (with Cloudinary images)
npm run db:seed

# Build for production
npm run build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Admin panel: `http://localhost:5173/admin`
- Default admin login: see `.env` / seeded via `seed-demo.js`

---

## Image Upload Flow

All images (products, banners, logo, favicon, category images, content highlights) follow this flow:

```
1. Admin selects file in browser
2. Frontend sends multipart/form-data POST to backend
3. Backend receives via multer (memoryStorage — no disk write)
4. Backend pipes file buffer into Cloudinary via upload_stream
5. Cloudinary returns secure_url
6. secure_url saved to MongoDB document
7. Frontend renders Cloudinary URL directly
```

### Fallback Logic
- If server is offline, `useCatalogProducts` and `useCategories` hooks fall back to static data in `src/data/data.js`
- Local product images resolve via `assetPath()` in `data.js` which prepends `/products/` or `/hero/`

---

## Frontend Routing

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home.jsx` | Homepage |
| `/products` | `Products.jsx` | All products with filters |
| `/products/:id` | `ProductDetails.jsx` | Product detail |
| `/category/:id` | `CategoryPage.jsx` | Products by category |
| `/category/:catId/:subId` | `SubcategoryPage.jsx` | Products by subcategory |
| `/cart` | `Cart.jsx` | Shopping cart + checkout |
| `/thank-you` | `ThankYou.jsx` | Order confirmation |
| `/about` | `About.jsx` | About page |
| `/contact` | `Contact.jsx` | Contact page |
| `/support` | `Support.jsx` | Support/FAQ |
| `/page/:slug` | `StaticPage.jsx` | CMS page by slug |
| `/language` | `Language.jsx` | Language selector |
| `/admin` | `Login.jsx` | Admin login |
| `/admin/dashboard` | `Dashboard.jsx` | Admin panel |

---

## Key Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.22.3",
  "express": "^5.2.1",
  "mongoose": "^9.7.1",
  "cloudinary": "^2.10.0",
  "multer": "^2.2.0",
  "jsonwebtoken": "^9.0.3",
  "bcrypt": "^6.0.0",
  "swiper": "^11.0.7",
  "lucide-react": "^0.363.0",
  "tailwindcss": "^3.4.1",
  "vite": "^5.2.2",
  "concurrently": "^10.0.3",
  "nodemon": "^3.1.14"
}
```
