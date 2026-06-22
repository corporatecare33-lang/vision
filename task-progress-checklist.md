# Vision Admin Dashboard - Complete Overhaul Checklist

## Core Setup
- [x] Analyze codebase and understand structure
- [ ] Fix admin seeding - remove seed button, auto-seed on startup
- [ ] Ensure superadmin login works (superadmin/admin123)

## Dashboard (Real Data)
- [ ] Replace all fake stats with real MongoDB data
- [ ] Fix sales analytics chart with real data
- [ ] Fix inventory alerts with real data from DB
- [ ] Fix top selling products with real data
- [ ] Fix recent orders with real data
- [ ] Fix quick actions to navigate properly
- [ ] Dashboard persistence on reload (remember active page)

## Category Management
- [ ] Fix category CRUD to work with backend API
- [ ] Fix subcategory management
- [ ] Connect frontend to MongoDB via API

## Product Management & Price Edit
- [ ] Fix product CRUD operations
- [ ] Fix price edit inline save
- [ ] Cloudinary image upload fix
- [ ] Stock display and edit

## Stock Management
- [ ] Fix stock products list - real data from DB
- [ ] Fix stock adjust functionality
- [ ] Fix stock alerts
- [ ] Fix stock transactions

## Marketing Section
- [ ] Complete marketing UI with real stats
- [ ] Coupon management (already connected)
- [ ] Banner management with image upload to Cloudinary
- [ ] Flash sale management

## Banner Management
- [ ] Fix banner upload to show on frontend slider
- [ ] Cloudinary upload integration
- [ ] Active/inactive toggle

## Flash Sale
- [ ] Complete flash sale UI
- [ ] Connect to DB
- [ ] Show on frontend

## Order Management
- [ ] Real orders from MongoDB
- [ ] Status update functionality
- [ ] Search and filter
- [ ] Pagination

## Shipping Charge
- [ ] Settings from MongoDB
- [ ] Edit from dashboard
- [ ] Show on frontend

## Courier API
- [ ] Integration settings UI
- [ ] Save to DB

## bKash Payment
- [ ] Integration settings UI
- [ ] Save to DB

## Payment Settings
- [ ] Fix active/inactive toggle
- [ ] Connect to DB
- [ ] Frontend update on status change

## Tracking Pixel
- [ ] Make dynamic - save/load from DB
- [ ] Facebook Pixel settings
- [ ] Google Analytics settings

## SMTP Email
- [ ] Gateway settings from DB
- [ ] Save/load from dashboard

## General Settings
- [ ] Branding settings save/load from DB
- [ ] Contact info save/load from DB
- [ ] Social media links save/load from DB
- [ ] Logo upload to Cloudinary
- [ ] SEO settings save/load from DB

## User Management
- [ ] Fix registered users list (real data)
- [ ] Fix customer list
- [ ] Fix admin/manager list
- [ ] Fix add new user functionality
- [ ] Fix edit/delete user
- [ ] Fix active/inactive toggle
- [ ] Match button colors with website theme

## Page Management
- [ ] Fix pages CRUD with real data
- [ ] Active/inactive toggle
- [ ] Frontend page display

## Content Sections
- [ ] Blog management
- [ ] Review management
- [ ] Video gallery
- [ ] Factory Gallery
- [ ] Manufacturing Highlights (editable)

## Sidebar
- [ ] Add missing menu items (blog, reviews, video gallery, etc.)
- [ ] Dashboard menu item that shows on any page click

## UI/UX Polish
- [ ] Modern dashboard design
- [ ] Super admin badge styling
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Error handling

## Announcement Bar
- [ ] Settings from DB
- [ ] Frontend display