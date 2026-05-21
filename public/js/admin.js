const secretInput = document.getElementById('admin-secret');
const connectButton = document.getElementById('connect-admin');
const contactList = document.getElementById('contact-list');
const skillStatus = document.getElementById('skill-status');
const projectStatus = document.getElementById('project-status');

let adminSecret = '';

function createCard(content) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.innerHTML = content;
  return card;
}

async function fetchAdmin(endpoint, options = {}) {
  if (!adminSecret) {
    alert('Enter admin secret first');
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Admin-Secret': adminSecret
  };
  const res = await fetch(endpoint, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Admin request failed');
  }
  return res.json();
}

async function loadContacts() {
  try {
    const contacts = await fetchAdmin('/api/admin/contacts');
    contactList.innerHTML = '';
    if (!contacts || contacts.length === 0) {
      contactList.appendChild(createCard('<h3>No messages yet</h3><p>Connected to admin endpoint.</p>'));
      return;
    }
    contacts.forEach(contact => {
      const date = contact.createdAt?.seconds ? new Date(contact.createdAt.seconds * 1000).toLocaleString() : contact.createdAt;
      const content = `
        <h3>${contact.name}</h3>
        <p>${contact.message}</p>
        <div class="project-meta"><span class="tag">${contact.email}</span><span class="tag">${date || 'no date'}</span></div>
      `;
      contactList.appendChild(createCard(content));
    });
  } catch (error) {
    contactList.innerHTML = '';
    contactList.appendChild(createCard(`<h3>Error</h3><p>${error.message}</p>`));
  }
}

connectButton.addEventListener('click', async () => {
  adminSecret = secretInput.value.trim();
  if (!adminSecret) {
    alert('Enter a valid admin secret.');
    return;
  }
  await loadContacts();
});

const addSkillButton = document.getElementById('add-skill');
addSkillButton.addEventListener('click', async () => {
  const name = document.getElementById('skill-name').value.trim();
  const level = document.getElementById('skill-level').value.trim();
  if (!name || !level) {
    skillStatus.textContent = 'Please enter both a name and level.';
    return;
  }
  try {
    await fetchAdmin('/api/admin/skill', {
      method: 'POST',
      body: JSON.stringify({ name, level })
    });
    skillStatus.textContent = 'Skill saved successfully.';
    document.getElementById('skill-name').value = '';
    document.getElementById('skill-level').value = '';
  } catch (error) {
    skillStatus.textContent = error.message;
  }
});

const addProjectButton = document.getElementById('add-project');
addProjectButton.addEventListener('click', async () => {
  const title = document.getElementById('project-title').value.trim();
  const description = document.getElementById('project-description').value.trim();
  const link = document.getElementById('project-link').value.trim();
  const tech = document.getElementById('project-tech').value.trim();
  if (!title || !description) {
    projectStatus.textContent = 'Enter title and description for the project.';
    return;
  }
  try {
    await fetchAdmin('/api/admin/project', {
      method: 'POST',
      body: JSON.stringify({ title, description, link, tech })
    });
    projectStatus.textContent = 'Project saved successfully.';
    document.getElementById('project-title').value = '';
    document.getElementById('project-description').value = '';
    document.getElementById('project-link').value = '';
    document.getElementById('project-tech').value = '';
  } catch (error) {
    projectStatus.textContent = error.message;
  }
});
