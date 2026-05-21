# Harish Kanna S Portfolio

A dark-themed portfolio website built with Node.js and Firebase-backed data storage. This app serves a public portfolio plus an admin console for managing skills, projects, and contact submissions.

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file from `.env.example` and add your Firebase service account credentials and other settings.

Example `.env`:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
ADMIN_SECRET=change-this-secret
```

Start the server:

```bash
npm start
```

Open the public portfolio:

```bash
http://localhost:3000
```

Open the admin console:

```bash
http://localhost:3000/admin.html
```

## Notes

- The admin page will use the `ADMIN_SECRET` value to access protected admin endpoints.
- Contact submissions are stored in Firestore collection `contacts` when Firebase is configured.
- Skills are stored in `skills` and projects are stored in `projects`.
