import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / (window.innerHeight * 0.72), 0.1, 1000);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight * 0.72);
container.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambient);

const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 200, 32);
const material = new THREE.MeshStandardMaterial({ color: 0x3dd7ff, metalness: 0.6, roughness: 0.15 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

let speed = 0.01;
function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.x += speed * 0.3;
  mesh.rotation.y += speed;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / (window.innerHeight * 0.72);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight * 0.72);
});

container.addEventListener('pointerdown', () => {
  speed = 0.08;
  setTimeout(() => (speed = 0.01), 800);
});

// Fetch skills and populate list
fetch('/api/skills').then(r => r.json()).then(data => {
  const ul = document.getElementById('skills-list');
  data.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `${s.name} — ${s.level}`;
    ul.appendChild(li);
  });
});

// Fetch projects
fetch('/api/projects').then(r => r.json()).then(data => {
  const div = document.getElementById('projects-list');
  data.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    const tech = p.tech ? `<p>Tech: ${p.tech.join(', ')}</p>` : '';
    const link = p.link ? `<a href="${p.link}" target="_blank" rel="noopener">View Project</a>` : '';
    card.innerHTML = `<h3>${p.title}</h3><p>${p.description}</p>${tech}${link}`;
    div.appendChild(card);
  });
});

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value
    };
    const respP = document.getElementById('contact-response');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const body = await res.json();
      if (res.ok) {
        respP.textContent = body.message || 'Message sent!';
        form.reset();
      } else {
        respP.textContent = body.error || 'Could not send message';
      }
    } catch (err) {
      respP.textContent = 'Network error — try again later.';
    }
  });
}
