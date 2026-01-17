

# Peak Point – Backend (Hapi.js)

Peak Point is a full-stack web application built for the *Advanced Full Stack Development* course.  
This repository contains the **Hapi.js backend** and covers **Level 1–5** of the assignment.

The backend provides:
- REST API for the Svelte frontend
- server-rendered Handlebars views
- authentication + security features (JWT, OAuth, 2FA)
- MongoDB persistence and Cloudinary integration
- testing + CI/CD pipeline

---

## Live URLs

- Backend (Render):  
  `https://peak-point.onrender.com`

- Swagger / OpenAPI:  
  `https://peak-point.onrender.com/documentation`

---

## Tech Stack

- **Node.js (ES Modules)**
- **Hapi.js**
- **Handlebars** (views)
- **Joi** (validation)
- **MongoDB Atlas** + **Mongoose**
- **JWT auth**
- **Cloudinary** (image hosting)
- **bcryptjs** (password hashing)
- **@hapi/bell** (OAuth)
- **speakeasy** (2FA)
- **Mocha + Chai + Axios** (tests)
- **GitHub Actions** (CI/CD)
- **Render deploy hook** (deployment trigger)

---

## Levels Overview

### Level 1 (Core CRUD + auth)
- signup/login (cookie auth)
- peaks CRUD basics
- basic API + tests

### Level 2 (Mongo + admin + images)
- MongoDB persistence
- categories model
- admin panel
- Cloudinary images
- Swagger docs
- tests updated for Mongo

### Level 3 (security improvements)
- bcrypt hashing/salting
- CORS enabled
- user-specific endpoints
- authorisation rules (owner/admin delete)

### Level 4 (OAuth)
- OAuth login via GitHub + Google (Hapi Bell)
- SSR-compatible redirect back to frontend

### Level 5 (extras)
- Two Factor Authentication
- CI/CD pipeline for backend (GitHub Actions + Render deploy hook)

---

# Level 1 Features

## Accounts
- signup & login using cookie authentication
- session stored in cookie

## Peaks
- create/list peaks with:
  - name
  - description
  - latitude / longitude
- delete peaks

## API + Tests
- REST API for users and peaks
- core unit/integration tests

---

# Level 2 Features

## Data Storage
- migration from LowDB → MongoDB Atlas using Mongoose
- seed data for users, categories, peaks

## Peaks
- peaks extended with:
  - elevation
  - categories (many-to-many)
  - image URLs array
- full CRUD (create/update/delete)
- filter peaks by category

## Categories
- categories stored in MongoDB
- linked to peaks
- admin can create/remove categories

## Admin Panel
- server-rendered admin interface:
  - list/remove users
  - manage categories
- protected admin routes

## API + Swagger
- OpenAPI docs (Swagger UI)
- endpoints for users/peaks/categories

## Cloudinary Images (backend perspective)
- backend stores image metadata (URLs)
- image files are hosted externally on Cloudinary
- peaks store an array of image URLs

## Deployment
- MongoDB Atlas (DB)
- Render (backend)

---

# Level 3 Features

## Authentication + Security
- passwords hashed using `bcryptjs`
- seed passwords are hashed
- improved auth response fields

## API / CORS
- CORS enabled globally (frontend runs on different domain)

## Authorisation
- delete peak restricted:
  - only the peak owner or admin can delete
- endpoints provide user-specific data (`/api/peaks/user`)

---

# Level 4 Features – OAuth Login

OAuth login implemented using **Hapi Bell**.

- strategies for GitHub + Google (`github-oauth`, `google-oauth`)
- Bell handles OAuth handshake and profile fetching
- backend upserts user from OAuth provider profile
- backend generates JWT and redirects back to frontend callback (`OAUTH_REDIRECT_URL`)

This makes OAuth work both locally and in production with Netlify + Render.

---

# Level 5 Features

## Two Factor Authentication (2FA)
2FA is implemented using `speakeasy`.

Flow:
1) backend generates a secret for the user
2) frontend displays `otpauthUrl` as QR code
3) authenticator app generates time-based codes (TOTP)
4) backend verifies the code
5) recovery codes are generated for backup

## Backend CI/CD Pipeline
Backend CI/CD uses GitHub Actions:

### Checks job
- install dependencies
- create CI `.env` file with dummy secrets (`NODE_ENV=test`)
- start API server
- wait for `/health`
- run backend tests

### Deploy job
- only runs on push to `main`
- triggers Render deployment using deploy hook URL stored as GitHub secret

---

## Running locally

```bash
npm install --legacy-peer-deps
npm run dev
