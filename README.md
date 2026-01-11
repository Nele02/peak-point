# Peak Point – Backend

Peak Point is a full-stack web application built as part of the *Full-Stack Development* course.  
It lets users sign up, log in and manage peaks (mountain summits) as points of interest.

---

## Level 1 Features

**Accounts**
- Signup & login with cookie-based authentication

**Peaks**
- Create and list peaks with `name`, `description`, `latitude`, `longitude`
- Delete peaks from the dashboard

**API & Tests**
- REST API for users and peaks
- Basic CRUD operations
- Core API and model tests using Mocha, Chai and Axios

**Tech**
- Hapi.js, Handlebars, Joi, LowDB (JSON store)
- Node.js ES Modules

---

## Level 2 Features

**Data Storage**
- Migration from LowDB to MongoDB using Mongoose
- Database hosted on MongoDB Atlas
- Seed data for users, categories and peaks

**Peaks**
- Peaks extended with `elevation`
- Peaks can be edited and updated (`name`, `description`, `latitude`, `longitude`, `elevation`, `categories`)
- Peaks can belong to one or multiple categories
- Images can be uploaded and stored on Cloudinary
- Image URLs are persisted as an array on peak documents

**Categories**
- Categories stored in MongoDB and linked to peaks
- Peaks can be filtered by category
- Admin interface to add and remove categories

**Users**
- Users stored in MongoDB with hashed and salted passwords
- Admin role determined based on environment configuration
- Admin access required to delete all users, peaks and categories

**Admin Panel**
- Management interface for users and categories
- Protected access restricted to admin users

**API**
- Extended REST API for users, peaks and categories
- Endpoints to create, retrieve, update and delete peaks
- Endpoints to retrieve and manage categories
- Authentication supported via JWT

**Images**
- Cloudinary integration for image uploads
- Frontend and API store only URLs, image files are hosted externally

**Deployment**
- Backend deployed on Render
- Database hosted on MongoDB Atlas
- Images hosted on Cloudinary

**Testing**
- Updated model and API tests for MongoDB-based storage
- Automatic seeding in non-test environments

---

## Level 3 Features

**Authentication & Security**
- Bcrypt-based password hashing/validation (dependency: `bcryptjs`)
- Seed user passwords are hashed
- Auth response extended with `id` and `name`

**API & CORS**
- CORS enabled globally
- User-specific peaks endpoint available (e.g., `/api/peaks/user`)
- Filter user peaks via query parameter `categoryIds`

**Peaks & Images**
- Image URLs can be set and edited via the API
- Image URLs are stored as an array on peak documents
- Seed data includes example image URLs

**Authorization**
- Only admins and the peak owner are allowed to delete peaks

---

## Level 4 Features

Level 4 adds **OAuth login** and improves production setup for deployment.

### OAuth (GitHub + Google)

- OAuth login via **GitHub** and **Google**
- Implemented with **Hapi Bell** (`@hapi/bell`)
- Backend creates/updates users from OAuth profiles
- After OAuth login, backend generates a JWT and redirects back to the frontend callback

- Backend deployed on Render:
    - `https://peak-point.onrender.com`

---

## Running the App

```bash
npm install
npm run start
