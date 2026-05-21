require('dotenv').config();
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const app = express();
const port = process.env.PORT || 3000;

let db = null;
let adminEnabled = false;

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;
const firebaseDatabaseUrl = process.env.FIREBASE_DATABASE_URL || (firebaseProjectId ? `https://${firebaseProjectId}.firebaseio.com` : undefined);

if (firebaseProjectId && firebaseClientEmail && firebasePrivateKey && firebaseDatabaseUrl) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseProjectId,
        clientEmail: firebaseClientEmail,
        privateKey: firebasePrivateKey.replace(/\\n/g, '\n')
      }),
      databaseURL: firebaseDatabaseUrl
    });
    db = admin.firestore();
    adminEnabled = true;
    console.log('Firebase initialized successfully.');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase environment variables not configured. Using local fallback data.');
}

const staticSkills = [
  { name: 'JavaScript', level: 'Advanced' },
  { name: 'Node.js', level: 'Advanced' },
  { name: 'Firebase', level: 'Intermediate' },
  { name: 'Express', level: 'Intermediate' }
];

const staticProjects = [
  { title: 'Portfolio Redesign', description: 'Dark-theme portfolio with admin controls and Firebase data.', link: '#', tech: ['Node.js', 'Firebase'] },
  { title: 'Brand Interface', description: 'High-contrast web interface with custom interaction layout.', link: '#', tech: ['HTML', 'CSS'] }
];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function requireAdmin(req, res, next) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return next();
  const token = req.headers['x-admin-secret'] || req.query.auth;
  if (token !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

async function getCollectionData(collectionName, fallbackData) {
  if (!adminEnabled) return fallbackData;
  const snapshot = await db.collection(collectionName).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

app.get('/api/skills', async (req, res) => {
  try {
    const skills = await getCollectionData('skills', staticSkills);
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Could not load skills.' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await getCollectionData('projects', staticProjects);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Could not load projects.' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing name, email or message' });
  }

  const payload = {
    name,
    email,
    message,
    createdAt: adminEnabled ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
  };

  if (adminEnabled) {
    try {
      await db.collection('contacts').add(payload);
    } catch (error) {
      console.error('Failed to save contact:', error);
      return res.status(500).json({ error: 'Could not save contact.' });
    }
  } else {
    console.log('Contact form submission:', payload);
  }

  res.json({ status: 'ok', message: 'Thanks, your message was received.' });
});

app.get('/api/admin/contacts', requireAdmin, async (req, res) => {
  try {
    const contacts = await getCollectionData('contacts', []);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Could not load contacts.' });
  }
});

app.post('/api/admin/skill', requireAdmin, async (req, res) => {
  const { name, level } = req.body || {};
  if (!name || !level) return res.status(400).json({ error: 'Missing name or level' });
  const payload = { name, level, createdAt: adminEnabled ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString() };
  if (adminEnabled) {
    await db.collection('skills').add(payload);
    return res.json({ status: 'ok' });
  }
  staticSkills.unshift(payload);
  res.json({ status: 'ok' });
});

app.post('/api/admin/project', requireAdmin, async (req, res) => {
  const { title, description, link, tech } = req.body || {};
  if (!title || !description) return res.status(400).json({ error: 'Missing title or description' });
  const payload = {
    title,
    description,
    link: link || '#',
    tech: Array.isArray(tech) ? tech : tech ? tech.split(',').map(tag => tag.trim()) : [],
    createdAt: adminEnabled ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
  };
  if (adminEnabled) {
    await db.collection('projects').add(payload);
    return res.json({ status: 'ok' });
  }
  staticProjects.unshift(payload);
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
