# Peak Point

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

## Running the App

```bash
npm install
npm run start
