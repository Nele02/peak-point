# Peak Point

Peak Point is a full-stack web app built as part of the *Full-Stack Development* course.  
It lets users sign up, log in and manage peaks (mountain summits) as points of interest.

## Level 1 Features

**Accounts**
- Signup & Login with cookie-based authentication

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

## Running the App

```bash
npm install
npm run start
