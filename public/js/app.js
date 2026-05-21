const skillContainer = document.getElementById('skills-list');
const projectContainer = document.getElementById('projects-list');
const contactForm = document.getElementById('contact-form');

function renderSkills(skills) {
  if (!skillContainer) return;
  skills.forEach(skill => {
    const chip = document.createElement('span');
    chip.className = 'skill-chip';
    chip.textContent = `${skill.name}`;
    skillContainer.appendChild(chip);
  });
}

function renderProjects(projects) {
  if (!projectContainer) return;
  projects.forEach(project => {
    const card = document.createElement('article');
    card.className = 'project-card';
    const techTags = project.tech ? project.tech.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
    const actionLink = project.link ? `<a href="${project.link}" target="_blank" rel="noopener">View project</a>` : '';
    card.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="project-meta">${techTags}</div>
      ${actionLink}
    `;
    projectContainer.appendChild(card);
  });
}

async function loadData() {
  try {
    const [skillsRes, projectsRes] = await Promise.all([
      fetch('/api/skills'),
      fetch('/api/projects')
    ]);
    const skills = await skillsRes.json();
    const projects = await projectsRes.json();
    renderSkills(skills);
    renderProjects(projects);
  } catch (error) {
    console.error('Unable to load portfolio data:', error);
  }
}

loadData();

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const responseMessage = document.getElementById('contact-response');
    responseMessage.textContent = '';

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };

    if (!payload.name || !payload.email || !payload.message) {
      responseMessage.textContent = 'Please complete all fields before sending.';
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      responseMessage.textContent = res.ok ? body.message || 'Message sent successfully!' : body.error || 'Unable to send message.';
      if (res.ok) form.reset();
    } catch (err) {
      responseMessage.textContent = 'Network error. Try again in a moment.';
    }
  });
}
