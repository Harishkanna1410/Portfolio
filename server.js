const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/skills', (req, res) => {
  res.json([
    { name: 'JavaScript', level: 'Advanced' },
    { name: 'Node.js', level: 'Advanced' },
    { name: 'Three.js', level: 'Intermediate' },
    { name: 'React', level: 'Intermediate' }
  ]);
});

app.get('/api/projects', (req, res) => {
  res.json([
    { title: '3D Portfolio', description: 'Interactive 3D resume/portfolio site', link: '#', tech: ['Three.js','Node.js'] },
    { title: 'Interactive Data Viz', description: 'Data visualization with D3/Three.js', link: '#', tech: ['D3','Three.js'] }
  ]);
});

// Contact form endpoint (no email service configured; logs to server)
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing name, email or message' });
  }

  // In a real app you'd send an email or persist this to a DB. For now we log it.
  console.log('Contact form submission:', { name, email, message });

  res.json({ status: 'ok', message: 'Thanks, your message was received.' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
