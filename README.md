# E-Commerce-App

This E-Commerce-App is written in TypeScript from end-to-end using NextJs at the Frontend and a seperate API in NodeJs at the Backend. The App uses JWT-Authentication, Redis Caching, PrismaORM to access the PostgreSQL Database as well as more features.

---

## Features

### Frontend

#### Admin Mangement

* **Dashboard:** Protected Admin Dashboard Route through Server Actions to check authentication and authorization which shows the Admin Store Analytics
* **Inventory:** Allows the Admin to Create, Read, Update and Delete Products as well as their Categories
* **Orders:** Shows the Admin all the Customer Orders and more in depth Details about these

#### Authenticated User Functionality

* **Routes:** Protected User Routes through Server Actions to check authentication, shows the user their Shopping Cart, Orders, Favorized Products and Product Reviews as well as extensive CRUD functionality to update these and sort, filter, paginate.
* **Account Management:** Allows the User to change Account Settings.
* **Checkout:** Allows the User to create a Stripe checkout Session to buy the Products which locks them as reserved for 15 minutes, on cancellation or after 15 minutes the Session ends and the Products get released.

#### General

* **Signup:** User signup through Google or Email based
* **Products:** User is able to search and filter for Products
* **SEO:** Good SEO and SSR through NextJs Server Side rendering, Static Site Generation and Incremental Site Regeneration

#### Tech-Stack

* **Nextjs**
* **Tanstack Query**
* **Zustand**
* **Tailwind**
* **ShadCN**
* **Lucide Icons**
* **React Hook Form**
* **TypeScript**
* **server only**
* **Zod**

### Backend

#### Security & Authentication

* **JWT Logic:** Implements a secure authentication flow using rotating **Refresh Tokens** stored in the database and short-lived **Access Tokens** handled in-memory as well as authorization for admin.
* **Multi Device Support** suppports multiple Devices Signed in Status through storing the DeviceId in the Database.
* **Social OAuth 2.0:** Integrated **Google** authentication using **Passport.js** strategies.
* **CSRF Protection:** extended Security via **HTTP-Only Cookies** and CSRF token validation to prevent cross-site request forgery.
* **Rate Limiting:** Protects API endpoints from Brute Force attempts and DDoS attacks using `express-rate-limit` with a **Redis-backed** store for persistence.
* **Secure Hashing:** All user passwords are encrypted using **Bcrypt**.
* **Schema Validation:** All incoming data is validated against schemas using **Zod** to maintain data integrity.
* * **Bot Protection (Turnstile):** Uses **Cloudflare Turnstile** to protect against Bots on publicly accessible Form inputs.

#### E-Commerce & Payments

* **Stripe Integration:** Full payment management, including secure checkout sessions and webhook synchronization.
* **IP Mapping:** Uses **MaxMind** for geolocation tracking, allowing for localized currency based on user IP.
* **Multiple Currency Support:** Supports multiple Currencies through 3rd Party Api Exchange Rates and automatically detecting as well as exchanging at runtime through IP Mapping.

#### Infrastructure & Performance

* **Redis Caching:** High-speed distributed caching to increase performance.
* **Prisma ORM & PostgreSQL:** Type-safe database queries and migrations for a relational **PostgreSQL** database.
* **System Integrity:** Extensive **process error handling** and **logging** are implemented to ensure stability, quick debugging, and observability.

#### Background Tasks & Utilities

* **Automated Cron Jobs:** Scheduled background tasks like database cleanup and cache refreshing handled by **Node-Cron**.
* **Transactional Emails:** Integration with **Mailjet** for sending order confirmations, welcome emails, and password reset links.
* **Cloud Asset Management:** Multi-part image uploads handled by **Multer** and optimized/stored in the cloud via **Cloudinary**.
* **Validation:** Request bodies are validated at runtime using **Zod**.

#### Tech-Stack

* **NodeJS**
* **TypeScript**
* **Express**
* **Zod**
* **Cloudinary**
* **Redis**
* **Prisma**
* **Stripe**
* **node-cron**
* **multer**
* **passport**

### General

* **Architecture:** This Project was build as a Monorepo using npm workspaces
* **Shared Packages:** The Projects share end-to-end TypeScript types, Zod Schemas and constants

---

## Repository

[Repository](https://github.com/FaridMo99/E-Commerce-App)
