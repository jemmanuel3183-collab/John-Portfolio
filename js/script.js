/* ============================================================
   JOHN EMMANUEL — STUDENT PORTFOLIO
   External JavaScript · DOM Manipulation · Event Handling
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 01 · Header scroll ---------- */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ---------- 02 · Mobile menu ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
    navMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navMenu.classList.remove('open'))
    );
  }

  /* ---------- 03 · Scroll reveal ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .project-card').forEach(el => revealObserver.observe(el));

  /* ---------- 04 · Terminal typing effect ---------- */
  const terminalBody = document.querySelector('.terminal-body');
  if (terminalBody) {
    const lines = terminalBody.querySelectorAll('.terminal-line, .terminal-text');
    lines.forEach((line, i) => {
      line.style.opacity = '0';
      setTimeout(() => { line.style.transition = 'opacity 0.3s'; line.style.opacity = '1'; }, 500 + i * 600);
    });
  }

  /* ---------- 05 · Animated stat counters ---------- */
  const statCards = document.querySelectorAll('.stat-card h3');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent;
      const match = text.match(/(\d+)/);
      if (!match) { statObserver.unobserve(el); return; }
      const target = parseInt(match[1]);
      const suffix = text.replace(/\d+/, '');
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  statCards.forEach(s => statObserver.observe(s));

  /* ---------- 06 · Back to top ---------- */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
  }

  /* ---------- 07 · Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  /* ---------- 08 · Academic Planner ---------- */
  const planner = document.querySelector('#planner');
  if (planner) {
    let tasks = [];
    let filter = 'all';
    const input = planner.querySelector('#taskInput');
    const addBtn = planner.querySelector('#taskAdd');
    const list = planner.querySelector('#taskList');
    const empty = planner.querySelector('#taskEmpty');
    const filterBtns = planner.querySelectorAll('.filter-btn');
    const statTotal = planner.querySelector('#statTotal');
    const statDone = planner.querySelector('#statDone');
    const statActive = planner.querySelector('#statActive');

    try {
      const saved = localStorage.getItem('je_tasks');
      if (saved) tasks = JSON.parse(saved);
    } catch(e) { tasks = []; }

    const save = () => { try { localStorage.setItem('je_tasks', JSON.stringify(tasks)); } catch(e) {} };

    const render = () => {
      let filtered = tasks;
      if (filter === 'active') filtered = tasks.filter(t => !t.done);
      if (filter === 'completed') filtered = tasks.filter(t => t.done);
      list.innerHTML = '';
      if (filtered.length === 0) {
        empty.style.display = 'block';
        empty.querySelector('.te-msg').textContent =
          filter === 'completed' ? 'No completed tasks yet.' :
          filter === 'active' ? 'No active tasks. Add one above!' :
          'No tasks yet. Add your first task above!';
      } else {
        empty.style.display = 'none';
        filtered.forEach(task => {
          const item = document.createElement('div');
          item.className = 'task-item' + (task.done ? ' completed' : '');
          const checkbox = document.createElement('div');
          checkbox.className = 'task-checkbox' + (task.done ? ' checked' : '');
          checkbox.addEventListener('click', () => toggleTask(task.id));
          const text = document.createElement('span');
          text.className = 'task-text';
          text.textContent = task.text;
          const del = document.createElement('button');
          del.className = 'task-delete';
          del.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';
          del.addEventListener('click', () => deleteTask(task.id));
          item.appendChild(checkbox);
          item.appendChild(text);
          item.appendChild(del);
          list.appendChild(item);
        });
      }
      if (statTotal) statTotal.textContent = tasks.length;
      if (statDone) statDone.textContent = tasks.filter(t => t.done).length;
      if (statActive) statActive.textContent = tasks.filter(t => !t.done).length;
    };

    const addTask = () => {
      const text = input.value.trim();
      if (!text) { input.style.borderColor = '#ff6b6b'; setTimeout(() => { input.style.borderColor = ''; }, 1500); return; }
      tasks.push({ id: Date.now(), text: text, done: false });
      input.value = '';
      save();
      render();
    };

    const toggleTask = (id) => { const task = tasks.find(t => t.id === id); if (task) { task.done = !task.done; save(); render(); } };
    const deleteTask = (id) => { tasks = tasks.filter(t => t.id !== id); save(); render(); };

    addBtn.addEventListener('click', addTask);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filter = btn.dataset.filter;
        render();
      });
    });
    render();
  }

  /* ---------- 09 · Contact form validation ---------- */
  const form = document.querySelector('#contactForm');
  if (form) {
    const showError = (fieldId, msg) => {
      const field = form.querySelector('#' + fieldId);
      const err = form.querySelector('#' + fieldId + 'Error');
      if (field) field.classList.add('error');
      if (err) { err.textContent = msg; err.classList.add('show'); }
    };
    const clearError = (fieldId) => {
      const field = form.querySelector('#' + fieldId);
      const err = form.querySelector('#' + fieldId + 'Error');
      if (field) field.classList.remove('error');
      if (err) err.classList.remove('show');
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const name = form.querySelector('#name').value.trim();
      if (!name) { showError('name', 'Please enter your name.'); valid = false; } else clearError('name');

      const email = form.querySelector('#email').value.trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) { showError('email', 'Please enter your email.'); valid = false; }
      else if (!emailRe.test(email)) { showError('email', 'Please enter a valid email address.'); valid = false; }
      else clearError('email');

      const phone = form.querySelector('#phone').value.trim();
      const phoneClean = phone.replace(/[\s\-+()]/g, '');
      if (!phone) { showError('phone', 'Please enter your phone number.'); valid = false; }
      else if (!/^\d+$/.test(phoneClean)) { showError('phone', 'Phone number must contain only digits.'); valid = false; }
      else clearError('phone');

      const message = form.querySelector('#message').value.trim();
      if (!message) { showError('message', 'Please enter a message.'); valid = false; } else clearError('message');

      if (valid) {
        const success = form.querySelector('#formSuccess');
        if (success) {
          success.classList.add('show');
          success.textContent = 'Thank you, ' + name + '! Your message has been noted.';
        }
        form.reset();
        setTimeout(() => { if (success) success.classList.remove('show'); }, 4000);
      }
    });

    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => clearError(field.id));
    });
  }

  /* ---------- 10 · Profile avatar localStorage ---------- */
  const avatarImg = document.getElementById('hero-profile-avatar');
  if (avatarImg) {
    const savedAvatar = localStorage.getItem('portfolio-profile-avatar');
    if (savedAvatar) avatarImg.src = savedAvatar;
  }

  /* ---------- 11 · Audio toggle ---------- */
  const audioToggle = document.getElementById('audioToggle');
  const bgAudio = document.getElementById('bgAudio');
  if (audioToggle && bgAudio) {
    audioToggle.addEventListener('click', () => {
      if (bgAudio.paused) {
        bgAudio.play().catch(() => {});
        audioToggle.classList.add('playing');
      } else {
        bgAudio.pause();
        audioToggle.classList.remove('playing');
      }
    });
  }

});
