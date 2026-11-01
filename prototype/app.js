(() => {
  'use strict';

  const KEY = 'pel-crm-state-v1';
  const UI_KEY = 'pel-crm-ui-v1';
  const AUTH_KEY = 'pel-crm-authenticated';
  const AUTH_ROLE_KEY = 'pel-crm-access-role';
  const ACCOUNT_KEY = 'pel-crm-account-id';
  const userPages = new Set(['user-portal.html', 'user-profile.html', 'user-tasks.html', 'user-opportunities.html', 'user-customers.html']);
  const PREVIEW_RUN_KEY = 'pel-crm-preview-run';
  const stages = ['New lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const page = location.pathname.split('/').pop() || 'index.html';
  const defaults = { authenticated: false, customers: [], tasks: [], opportunities: [], users: [], settings: { displayName: 'Eswar Charan', workspace: 'PEL CRM', role: 'Administrator', email: '', phone: '', department: '', timezone: 'Asia/Kolkata (IST)', reminders: 'on', emailUpdates: true, weeklySummary: true, avatarInitials: 'SC', accent: '#9A563B' } };
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { stored = {}; }
  const state = { ...defaults, ...stored, settings: { ...defaults.settings, ...stored.settings } };
  // Authentication is intentionally session-only: closing the browser ends the local preview session.
  state.authenticated = sessionStorage.getItem(AUTH_KEY) === '1';
  let ui = {};
  try { ui = JSON.parse(localStorage.getItem(UI_KEY) || '{}') || {}; } catch { ui = {}; }
  ui = { theme: 'light', sidebarCollapsed: false, tourSeen: false, ...ui };
  const translatedTextNodes = new Set();
  const translatedOriginals = new WeakMap();
  for (const collection of ['customers', 'tasks', 'opportunities']) {
    if (!Array.isArray(state[collection])) state[collection] = [];
    state[collection].forEach(item => { if (item && !item.ownerId) item.ownerId = 'eswar'; });
  }
  if (!Array.isArray(state.users)) state.users = [];
  // Remove only sample content earlier versions generated. Real records are preserved.
  const sampleUserIds = new Set(['eswar', 'nisha', 'arjun', 'meera']);
  let removedSamples = false;
  const beforeUsers = state.users.length;
  state.users = state.users.filter(user => !sampleUserIds.has(user?.id));
  removedSamples ||= state.users.length !== beforeUsers;
  for (const collection of ['customers', 'tasks', 'opportunities']) {
    const before = state[collection].length;
    state[collection] = state[collection].filter(item => !String(item?.id || '').startsWith('demo-') && !/^QA\s/i.test(String(item?.name || item?.title || '')));
    removedSamples ||= state[collection].length !== before;
  }

  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  if (removedSamples) save();
  const saveUI = () => localStorage.setItem(UI_KEY, JSON.stringify(ui));
  const updateUI = changes => { ui = { ...ui, ...changes }; saveUI(); };
  const accessRole = () => sessionStorage.getItem(AUTH_ROLE_KEY) || '';
  const activeAccountId = () => sessionStorage.getItem(ACCOUNT_KEY) || '';
  const accountById = accountId => state.users.find(user => user.id === accountId) || null;
  const activeProfile = () => {
    if (accessRole() !== 'user') return state.settings;
    const account = accountById(activeAccountId());
    return account ? { ...state.settings, displayName:account.name, email:account.email, phone:account.phone, department:account.department, avatarInitials:account.initials, accent:account.accent, role:'User' } : { ...state.settings, displayName:'User', role:'User' };
  };
  const activeLocale = () => ui.language === 'Hindi' ? 'hi-IN' : ui.language === 'Telugu' ? 'te-IN' : 'en-IN';
  const text = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const visible = items => items.filter(item => item && typeof item === 'object' && String(item.name || item.title || '').trim());
  const money = value => {
    if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, value) : 0;
    const raw = String(value || '').replace(/[₹,\s]/g, '');
    const match = raw.match(/^([\d.]+)(Cr|L|K)?$/i);
    if (!match) return 0;
    const factor = { cr: 10000000, l: 100000, k: 1000 }[(match[2] || '').toLowerCase()] || 1;
    return Number(match[1]) * factor || 0;
  };
  const rupees = value => '₹' + Math.round(value).toLocaleString('en-IN');
  const dateLabel = value => value ? new Date(value + 'T00:00:00').toLocaleDateString(activeLocale(), { day: 'numeric', month: 'short', year: 'numeric' }) : (ui.language === 'Hindi' ? 'कोई तिथि नहीं' : ui.language === 'Telugu' ? 'తేదీ లేదు' : 'No due date');
  const dueStatus = value => { const copy = ui.language === 'Hindi' ? {none:'कोई तिथि नहीं',late:'अतिदेय',today:'आज देय',tomorrow:'कल देय',left:'दिन शेष'} : ui.language === 'Telugu' ? {none:'తేదీ లేదు',late:'గడువు దాటింది',today:'ఈరోజు గడువు',tomorrow:'రేపు గడువు',left:'రోజులు మిగిలి ఉన్నాయి'} : {none:'No date',late:'Overdue',today:'Due today',tomorrow:'Due tomorrow',left:'days left'}; if (!value) return copy.none; const delta = Math.ceil((new Date(value + 'T00:00:00') - new Date(new Date().toDateString())) / 86400000); return delta < 0 ? copy.late : delta === 0 ? copy.today : delta === 1 ? copy.tomorrow : delta + ' ' + copy.left; };
  const priorityLabel = value => ({ Hindi:{High:'उच्च',Medium:'मध्यम',Low:'कम'}, Telugu:{High:'అధిక',Medium:'మధ్యస్థ',Low:'తక్కువ'} }[ui.language] || {})[value] || value;
  const stageLabel = value => ({ Hindi:{'New lead':'नई लीड',Qualified:'योग्य',Proposal:'प्रस्ताव',Negotiation:'बातचीत',Won:'जीता',Lost:'हारा'}, Telugu:{'New lead':'కొత్త లీడ్',Qualified:'అర్హత పొందిన',Proposal:'ప్రతిపాదన',Negotiation:'చర్చలు',Won:'గెలిచిన',Lost:'కోల్పోయిన'} }[ui.language] || {})[value] || value;
  const stamp = value => value ? new Date(value).toLocaleDateString(activeLocale(), { day: 'numeric', month: 'short', year: 'numeric' }) : (ui.language === 'Hindi' ? 'पहले सहेजा गया' : ui.language === 'Telugu' ? 'ఇప్పటికే సేవ్ చేయబడింది' : 'Saved previously');
  const id = () => crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
  const customers = () => visible(state.customers);
  const opportunities = () => visible(state.opportunities);
  const tasks = () => visible(state.tasks);
  const openDeals = () => opportunities().filter(item => !['Won', 'Lost'].includes(item.stage));
  const openTasks = () => tasks().filter(item => !item.done);
  const ownedCustomers = accountId => customers().filter(item => item.ownerId === accountId);
  const ownedDeals = accountId => openDeals().filter(item => item.ownerId === accountId);
  const ownedTasks = accountId => openTasks().filter(item => item.ownerId === accountId);
  const setHTML = (selector, html) => { const el = document.querySelector(selector); if (el) el.innerHTML = html; };
  const empty = message => '<p class="empty-state">' + text(message) + '</p>';
  const metric = (label, value, note = '') => '<article class="metric"><span>' + text(label) + '</span><strong>' + text(value) + '</strong><small>' + text(note) + '</small></article>';
  const notify = (message, tone = 'success') => {
    let el = document.querySelector('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.textContent = message; el.dataset.tone = tone; el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2300);
  };
  const attachmentHTML = item => item?.attachment ? '<div class="attachment-preview">' + (item.attachmentUrl ? '<img src="' + text(item.attachmentUrl) + '" alt="Attachment preview">' : '<span class="attachment-file">FILE</span>') + '<span><strong>' + text(item.attachment) + '</strong><small>' + (item.attachmentUrl ? 'Image saved in this browser' : 'File name saved in this browser') + '</small></span></div>' : '';
  const saveAttachment = file => new Promise(resolve => {
    if (!file) return resolve({ name:'', url:'' });
    if (!file.type.startsWith('image/') || file.size > 750000) return resolve({ name:file.name, url:'' });
    const reader = new FileReader(); reader.onload = () => resolve({ name:file.name, url:String(reader.result) }); reader.onerror = () => resolve({ name:file.name, url:'' }); reader.readAsDataURL(file);
  });

  async function syncPreviewRun() {
    try {
      const response = await fetch(location.href, { method:'HEAD', cache:'no-store' });
      const runId = response.headers.get('X-PEL-Preview-Run');
      if (!runId) return;
      const previousRun = sessionStorage.getItem(PREVIEW_RUN_KEY);
      if (previousRun && previousRun !== runId) sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.setItem(PREVIEW_RUN_KEY, runId);
    } catch { /* The page's normal access check remains the safe fallback. */ }
  }

  function renderShell() {
    const profile = activeProfile();
    document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = profile.displayName; });
    document.querySelectorAll('[data-short-name]').forEach(el => { el.textContent = profile.displayName.split(' ')[0] || 'Account'; });
    document.querySelectorAll('.avatar').forEach(el => { el.textContent = profile.avatarInitials || profile.displayName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(); el.style.background = profile.accent || '#DDEAF5'; });
    document.querySelectorAll('.user-copy small, #profile-menu > small:first-of-type').forEach(el => { el.textContent = profile.role || 'Administrator'; });
    const sidebarBottom = document.querySelector('.sidebar-bottom');
    if (sidebarBottom && !userPages.has(page) && !sidebarBottom.querySelector('a[href="users.html"]')) {
      const usersLink = document.createElement('a');
      usersLink.className = 'nav-item'; usersLink.href = 'users.html'; usersLink.innerHTML = '<span>◉</span>Users';
      const settingsLink = sidebarBottom.querySelector('a[href="settings.html"]');
      if (settingsLink) settingsLink.before(usersLink); else sidebarBottom.prepend(usersLink);
    }
    sidebarBottom?.querySelector('a[href="users.html"]')?.classList.toggle('active', page === 'users.html');
    const profileMenu = document.querySelector('#profile-menu');
    if (profileMenu && !userPages.has(page)) {
      let workspace = profileMenu.querySelector('[data-workspace-name]');
      if (!workspace) {
        workspace = document.createElement('p');
        workspace.className = 'profile-workspace';
        workspace.dataset.workspaceName = '';
        const profileLink = profileMenu.querySelector('a[href="settings.html"]');
        profileLink?.before(workspace);
      }
      profileMenu.querySelector('a[href="settings.html#profile-details"]')?.remove();
      workspace.textContent = (ui.language === 'Hindi' ? 'कार्यस्थान: ' : ui.language === 'Telugu' ? 'కార్యస్థలం: ' : 'Workspace: ') + (state.settings.workspace || 'PEL CRM');
      let contact = profileMenu.querySelector('[data-profile-email]');
      if (!contact) { contact = document.createElement('small'); contact.className = 'profile-contact'; contact.dataset.profileEmail = ''; workspace.after(contact); }
      contact.hidden = !(profile.email || profile.phone);
      contact.textContent = profile.email || profile.phone || '';
    }
    const today = document.querySelector('#today-label');
    if (today) today.textContent = new Date().toLocaleDateString(activeLocale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    if (page === 'index.html') { const greeting = document.querySelector('.topbar h1'); const hour = new Date().getHours(); const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'; const labels = { English:{morning:'Good morning',afternoon:'Good afternoon',evening:'Good evening'}, Hindi:{morning:'सुप्रभात',afternoon:'शुभ दोपहर',evening:'शुभ संध्या'}, Telugu:{morning:'శుభోదయం',afternoon:'శుభ మధ్యాహ్నం',evening:'శుభ సాయంత్రం'} }; const adminLabel = { English:'Admin portal', Hindi:'प्रशासक पोर्टल', Telugu:'నిర్వాహక పోర్టల్' }; if (greeting) greeting.textContent = (labels[ui.language || 'English'] || labels.English)[period] + ', ' + (state.settings.displayName.split(' ')[0] || 'there') + ' · ' + (adminLabel[ui.language || 'English'] || adminLabel.English); }
    document.querySelectorAll('[data-task-badge]').forEach(el => { const count = openTasks().length; el.textContent = count; el.hidden = !count; });
  }

  function renderCustomers() {
    const query = (document.querySelector('#customer-search')?.value || '').trim().toLowerCase();
    const status = document.querySelector('#customer-status')?.value || 'all';
    const matches = customers().filter(item => (status === 'all' || (item.status || 'Active') === status) && [item.name, item.company, item.email].join(' ').toLowerCase().includes(query));
    const sort = ui.customerSort || 'name';
    matches.sort((a, b) => sort === 'date' ? String(b.createdAt || '').localeCompare(String(a.createdAt || '')) : String(a.name).localeCompare(String(b.name)));
    const perPage = 6, pages = Math.max(1, Math.ceil(matches.length / perPage));
    const currentPage = Math.min(Math.max(1, ui.customerPage || 1), pages); const pageItems = matches.slice((currentPage - 1) * perPage, currentPage * perPage);
    setHTML('#customer-rows', pageItems.length ? pageItems.map(item => '<tr><td><strong>' + text(item.name) + '</strong>' + (item.tags ? '<small class="tag-list">' + item.tags.split(',').filter(Boolean).map(tag => '<span>' + text(tag.trim()) + '</span>').join('') + '</small>' : '') + '</td><td>' + text(item.company || '—') + '</td><td><span class="status ' + ((item.status || 'Active') === 'Prospect' ? 'amber' : 'green') + '">' + text(item.status || 'Active') + '</span></td><td>' + text(item.email || '—') + '</td><td>' + text(stamp(item.createdAt)) + '</td><td><button class="row-menu-button" type="button" data-customer-edit="' + text(item.id) + '" aria-label="Modify ' + text(item.name) + '">⋯</button></td></tr>').join('') : '<tr><td colspan="6">' + empty(query ? 'No customers match your search.' : 'No customers yet. Add your first customer above.') + '</td></tr>');
    setHTML('#customer-pagination', '<span>' + matches.length + ' customer' + (matches.length === 1 ? '' : 's') + '</span><button type="button" class="secondary" data-customer-page="' + (currentPage - 1) + '"' + (currentPage === 1 ? ' disabled' : '') + '>Previous</button><span>Page ' + currentPage + ' of ' + pages + '</span><button type="button" class="secondary" data-customer-page="' + (currentPage + 1) + '"' + (currentPage === pages ? ' disabled' : '') + '>Next</button>');
  }

  function renderPipeline() {
    const cards = stages.map(stage => {
      const matches = opportunities().filter(item => (item.stage || 'New lead') === stage);
      return '<section class="kanban-col" data-drop-stage="' + text(stage) + '"><h3>' + text(stage.toUpperCase()) + ' <span>' + matches.length + '</span></h3>' +
        (matches.length ? matches.map(item => {
          const itemId = String(item.id || opportunities().indexOf(item));
          return '<article class="deal" draggable="true" data-opportunity-card="' + text(itemId) + '"><div class="deal-top"><strong>' + text(item.name) + '</strong><button class="row-menu-button" type="button" data-opportunity-menu="' + text(itemId) + '" aria-label="Options for ' + text(item.name) + '">⋯</button></div><small>' + text(item.company || 'No company') + '</small><b>' + (money(item.value) ? rupees(money(item.value)) : 'Value not set') + '</b>' + (item.label ? '<span class="deal-label" style="--label:' + text(item.label) + '">' + text(item.label) + '</span>' : '') + '<div class="inline-menu" data-opportunity-menu-id="' + text(itemId) + '" hidden><button type="button" data-opportunity-edit="' + text(itemId) + '">Modify</button><button type="button" class="delete-action" data-opportunity-delete="' + text(itemId) + '">Delete</button></div><label class="stage-label">Stage<select data-deal-id="' + text(itemId) + '">' + stages.map(option => '<option' + (option === stage ? ' selected' : '') + '>' + text(option) + '</option>').join('') + '</select></label></article>';
        }).join('') : empty('No opportunities')) + '</section>';
    });
    setHTML('#pipeline-board', cards.join(''));
  }

  function renderTasks() {
    setHTML('#task-list', tasks().length ? tasks().map((item, index) => {
      const itemId = String(item.id || index);
      return '<div class="task ' + (item.done ? 'completed' : '') + '"><input type="checkbox" data-task-id="' + text(itemId) + '"' + (item.done ? ' checked' : '') + '><span><strong>' + text(item.title) + '</strong><small>' + text(dateLabel(item.due)) + ' · ' + text(priorityLabel(item.priority || 'Medium')) + '</small></span><span class="due-chip ' + dueStatus(item.due).replace(/\s+/g, '-').toLowerCase() + '">' + text(dueStatus(item.due)) + '</span><span class="status ' + (item.done ? 'green' : 'blue') + '">' + (item.done ? 'Done' : 'Open') + '</span><button class="task-open" type="button" data-task-edit="' + text(itemId) + '">View / modify</button></div>';
    }).join('') : empty('No tasks yet. Add your first follow-up above.'));
    const calendar = document.querySelector('#task-calendar');
    if (calendar) {
      const dated = tasks().filter(item => item.due).sort((a, b) => String(a.due).localeCompare(String(b.due)));
      setHTML('#task-calendar', dated.length ? dated.map(item => '<article class="calendar-item"><time>' + text(dateLabel(item.due)) + '</time><div><strong>' + text(item.title) + '</strong><small>' + text(item.priority || 'Medium') + ' priority</small></div></article>').join('') : empty('Add due dates to see tasks in the calendar view.'));
    }
  }

  function stageSummary() {
    const counts = stages.map(stage => ({ stage, count: opportunities().filter(item => (item.stage || 'New lead') === stage).length }));
    const maximum = Math.max(1, ...counts.map(item => item.count));
    return '<div class="bar-chart" role="img" aria-label="Opportunity stages chart">' + counts.map(item => {
      const percent = Math.round(item.count / maximum * 100);
      const tone = item.stage === 'Won' ? ' success' : item.stage === 'Lost' ? ' danger' : '';
      return '<div class="bar-row"><div class="bar-label"><span>' + text(item.stage) + '</span><strong>' + item.count + '</strong></div><div class="bar-track"><span class="bar-fill' + tone + '" style="width:' + percent + '%"></span></div></div>';
    }).join('') + '</div>';
  }

  function taskProgressChart() {
    const total = tasks().length;
    const done = tasks().filter(item => item.done).length;
    const open = Math.max(0, total - done);
    const maximum = Math.max(1, total);
    return '<div class="bar-chart compact-chart" role="img" aria-label="Task completion chart">' +
      '<div class="bar-row"><div class="bar-label"><span>Completed</span><strong>' + done + '</strong></div><div class="bar-track"><span class="bar-fill success" style="width:' + Math.round(done / maximum * 100) + '%"></span></div></div>' +
      '<div class="bar-row"><div class="bar-label"><span>Open</span><strong>' + open + '</strong></div><div class="bar-track"><span class="bar-fill amber" style="width:' + Math.round(open / maximum * 100) + '%"></span></div></div>' +
      '</div>';
  }

  function revenueChart() {
    const today = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
      return { year: date.getFullYear(), month: date.getMonth(), label: date.toLocaleDateString(activeLocale(), { month: 'short' }), value: 0 };
    });
    opportunities().forEach(item => {
      const created = item.createdAt ? new Date(item.createdAt) : null;
      const bucket = created && months.find(entry => entry.year === created.getFullYear() && entry.month === created.getMonth());
      if (bucket) bucket.value += money(item.value);
    });
    const maximum = Math.max(1, ...months.map(entry => entry.value));
    return '<div class="revenue-chart" role="img" aria-label="Revenue performance by month">' + months.map(entry => {
      const height = entry.value ? Math.max(12, Math.round(entry.value / maximum * 100)) : 4;
      return '<div class="revenue-column"><span class="revenue-value">' + (entry.value ? rupees(entry.value) : '—') + '</span><div class="revenue-bar-wrap"><span class="revenue-bar" style="height:' + height + '%"></span></div><small>' + entry.label + '</small></div>';
    }).join('') + '</div>' + (opportunities().length ? '' : '<p class="chart-empty-note">Add opportunities with a deal value to build your revenue chart.</p>');
  }
  function revenueLineChart() {
    const today = new Date(); const months = Array.from({ length:6 }, (_, index) => ({ date:new Date(today.getFullYear(), today.getMonth() - (5 - index), 1), value:0 }));
    opportunities().forEach(item => { const d = item.createdAt && new Date(item.createdAt); const bucket = d && months.find(entry => entry.date.getFullYear() === d.getFullYear() && entry.date.getMonth() === d.getMonth()); if (bucket) bucket.value += money(item.value); });
    const max = Math.max(1, ...months.map(item => item.value));
    const points = months.map((item,index) => (12 + index * 72) + ',' + (125 - Math.round(item.value / max * 96))).join(' ');
    return '<div class="line-chart" role="img" aria-label="Revenue line chart"><svg viewBox="0 0 384 145" preserveAspectRatio="none"><path class="line-chart-grid" d="M12 30H372M12 77H372M12 125H372"/><polyline class="line-chart-path" points="' + points + '"/>' + months.map((item,index) => '<circle class="line-chart-point" cx="' + (12 + index * 72) + '" cy="' + (125 - Math.round(item.value / max * 96)) + '" r="4"/><text x="' + (12 + index * 72) + '" y="142">' + text(item.date.toLocaleDateString(activeLocale(),{month:'short'})) + '</text>').join('') + '</svg></div>';
  }

  function priorityFollowUps() {
    const priorityScore = { High: 0, Medium: 1, Low: 2 };
    const sorted = openTasks().slice().sort((a, b) => (priorityScore[a.priority] ?? 1) - (priorityScore[b.priority] ?? 1) || String(a.due || '9999').localeCompare(String(b.due || '9999'))).slice(0, 4);
    return sorted.length ? sorted.map(item => {
      const priority = item.priority || 'Medium';
      return '<div class="priority-item"><span class="priority-dot ' + priority.toLowerCase() + '"></span><div><strong>' + text(item.title) + '</strong><small>' + text(dateLabel(item.due)) + '</small></div><b class="priority-tag ' + priority.toLowerCase() + '">' + text(priority) + '</b></div>';
    }).join('') : empty('No follow-ups yet. Add a task and set its priority.');
  }

  function renderOverview() {
    const closed = opportunities().filter(item => ['Won', 'Lost'].includes(item.stage));
    const won = closed.filter(item => item.stage === 'Won');
    const rate = closed.length ? Math.round(won.length / closed.length * 100) + '%' : '—';
    setHTML('#overview-metrics', [
      metric('CUSTOMERS', customers().length, 'Saved customer records'),
      metric('OPEN PIPELINE', rupees(openDeals().reduce((total, item) => total + money(item.value), 0)), openDeals().length + ' ' + (ui.language === 'Hindi' ? 'खुले अवसर' : ui.language === 'Telugu' ? 'తెరిచిన అవకాశాలు' : 'open opportunities')),
      metric('OPEN TASKS', openTasks().length, 'Tasks waiting for completion'),
      metric('WIN RATE', rate, closed.length ? won.length + ' won / ' + closed.length + ' closed' : 'No closed deals yet')
    ].join(''));
    setHTML('#overview-stages', stageSummary() + (opportunities().length ? '' : '<p class="chart-empty-note">Add opportunities from Pipeline to fill these bars.</p>'));
    setHTML('#overview-revenue', revenueChart());
    setHTML('#overview-priorities', priorityFollowUps());
    const recent = [
      ...customers().map(item => ({ label: (ui.language === 'Hindi' ? 'ग्राहक जोड़ा गया: ' : ui.language === 'Telugu' ? 'కస్టమర్ జోడించబడింది: ' : 'Customer added: ') + item.name, at: item.createdAt })),
      ...opportunities().map(item => ({ label: (ui.language === 'Hindi' ? 'अवसर जोड़ा गया: ' : ui.language === 'Telugu' ? 'అవకాశం జోడించబడింది: ' : 'Opportunity added: ') + item.name, at: item.createdAt })),
      ...tasks().map(item => ({ label: (ui.language === 'Hindi' ? 'कार्य जोड़ा गया: ' : ui.language === 'Telugu' ? 'పని జోడించబడింది: ' : 'Task added: ') + item.title, at: item.createdAt }))
    ].filter(item => item.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 5);
    setHTML('#recent-activity', recent.length ? recent.map(item => '<div class="activity-line"><strong>' + text(item.label) + '</strong><small>' + text(stamp(item.at)) + '</small></div>').join('') : empty('No activity yet. Add your first record.'));
    setHTML('#overview-opportunities', openDeals().length ? openDeals().slice(0, 5).map(item => '<div class="summary-line"><strong>' + text(item.name) + '</strong><span>' + text(item.stage || 'New lead') + '</span><b>' + (money(item.value) ? rupees(money(item.value)) : '—') + '</b></div>').join('') : empty('No open opportunities.'));
    const priorityScore = { High: 0, Medium: 1, Low: 2 };
    const taskList = openTasks().slice().sort((a, b) => (priorityScore[a.priority] ?? 1) - (priorityScore[b.priority] ?? 1));
    setHTML('#overview-tasks', taskList.length ? taskList.slice(0, 5).map(item => '<div class="summary-line"><strong>' + text(item.title) + '</strong><span>' + text(dateLabel(item.due)) + ' · ' + text(priorityLabel(item.priority || 'Medium')) + '</span></div>').join('') : empty('No open tasks.'));
  }

  function renderUserPortal() {
    const profile = activeProfile();
    const displayName = profile.displayName || 'User';
    const accountId = activeAccountId();
    const activeDeals = ownedDeals(accountId);
    const pendingTasks = ownedTasks(accountId);
    const personalCustomers = ownedCustomers(accountId);
    setHTML('#user-portal-metrics', [
      metric('MY CUSTOMERS', personalCustomers.length, 'Saved in this browser'),
      metric('ACTIVE DEALS', activeDeals.length, 'Open opportunities'),
      metric('PENDING TASKS', pendingTasks.length, 'Follow-ups to complete'),
      metric('WORKSPACE', state.settings.workspace || 'PEL CRM', profile.role || 'User')
    ].join(''));
    const profileNote = profile.email || profile.phone || (ui.language === 'Hindi' ? 'आपका व्यक्तिगत CRM कार्यक्षेत्र' : ui.language === 'Telugu' ? 'మీ వ్యక్తిగత CRM కార్యస్థలం' : 'Your personal CRM workspace');
    setHTML('#user-portal-profile', '<div class="portal-profile-card"><span class="profile-avatar">' + text(profile.avatarInitials || displayName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()) + '</span><div><p class="section-kicker">' + text(ui.language === 'Hindi' ? 'मेरी प्रोफ़ाइल' : ui.language === 'Telugu' ? 'నా ప్రొఫైల్' : 'MY PROFILE') + '</p><h3>' + text(displayName) + '</h3><p class="muted">' + text(profileNote) + '</p></div></div>');
    setHTML('#user-portal-tasks', pendingTasks.length ? pendingTasks.slice(0, 4).map(item => '<div class="summary-line"><strong>' + text(item.title) + '</strong><span>' + text(dateLabel(item.due)) + ' · ' + text(priorityLabel(item.priority || 'Medium')) + '</span></div>').join('') : empty('No open tasks. Add a follow-up when you need one.'));
    setHTML('#user-portal-opportunities', activeDeals.length ? activeDeals.slice(0, 4).map(item => '<div class="summary-line"><strong>' + text(item.name) + '</strong><span>' + text(stageLabel(item.stage || 'New lead')) + ' · ' + (money(item.value) ? rupees(money(item.value)) : 'Value not set') + '</span></div>').join('') : empty('No open opportunities. Create one from Pipeline.'));
    setHTML('#user-portal-customers', personalCustomers.length ? personalCustomers.slice(0, 4).map(item => '<div class="summary-line"><strong>' + text(item.name) + '</strong><span>' + text(item.company || 'No company') + '</span></div>').join('') : empty('No customer records assigned to you.'));
  }

  function renderUserProfile() {
    const profile = activeProfile();
    setHTML('#user-profile-details', '<div class="portal-profile-card"><span class="profile-avatar">' + text(profile.avatarInitials || 'SC') + '</span><div><p class="section-kicker">MY PROFILE</p><h3>' + text(profile.displayName || 'User') + '</h3><p class="muted">' + text(profile.role) + '</p></div></div><dl class="profile-details"><div><dt>Email</dt><dd>' + text(profile.email || 'Not added') + '</dd></div><div><dt>Phone</dt><dd>' + text(profile.phone || 'Not added') + '</dd></div><div><dt>Department</dt><dd>' + text(profile.department || 'Not added') + '</dd></div><div><dt>Timezone</dt><dd>' + text(profile.timezone || 'Asia/Kolkata (IST)') + '</dd></div></dl>');
  }

  function renderUserTasks() {
    const items = ownedTasks(activeAccountId());
    setHTML('#user-tasks-list', items.length ? items.map(item => '<div class="summary-line"><strong>' + text(item.title) + '</strong><span>' + text(dateLabel(item.due)) + ' · ' + text(priorityLabel(item.priority || 'Medium')) + '</span></div>').join('') : empty('No pending tasks assigned to you.'));
  }

  function renderUserOpportunities() {
    const items = ownedDeals(activeAccountId());
    setHTML('#user-opportunities-list', items.length ? items.map(item => '<div class="summary-line"><strong>' + text(item.name) + '</strong><span>' + text(stageLabel(item.stage || 'New lead')) + ' · ' + (money(item.value) ? rupees(money(item.value)) : 'Value not set') + '</span></div>').join('') : empty('No active opportunities assigned to you.'));
  }

  function renderUserCustomers() {
    const items = ownedCustomers(activeAccountId());
    setHTML('#user-customers-list', items.length ? items.map(item => '<div class="summary-line"><strong>' + text(item.name) + '</strong><span>' + text(item.company || 'No company') + ' · ' + text(item.status || 'Active') + '</span></div>').join('') : empty('No customer records assigned to you.'));
  }

  function renderUsers() {
    const cards = state.users.map(user => {
      const userTasks = ownedTasks(user.id);
      const userDeals = ownedDeals(user.id);
      const userCustomers = ownedCustomers(user.id);
      const dealValue = userDeals.reduce((sum, item) => sum + money(item.value), 0);
      const statusClass = String(user.status || 'Offline').toLowerCase();
      return '<article class="user-admin-card"><div class="user-admin-head"><span class="profile-avatar" style="background:' + text(user.accent || '#2f5d8a') + '">' + text(user.initials || user.name.slice(0,2).toUpperCase()) + '</span><div><h3>' + text(user.name) + '</h3><p>' + text(user.department) + '</p></div><span class="user-status ' + statusClass + '">' + text(user.status || 'Offline') + '</span></div><dl class="user-admin-details"><div><dt>Email</dt><dd>' + text(user.email) + '</dd></div><div><dt>Phone</dt><dd>' + text(user.phone || 'Not provided') + '</dd></div><div><dt>Last active</dt><dd>' + text(user.lastActive) + '</dd></div><div><dt>Joined</dt><dd>' + text(user.joined) + '</dd></div></dl><div class="user-admin-metrics"><span><b>' + userCustomers.length + '</b> customers</span><span><b>' + userDeals.length + '</b> active deals</span><span><b>' + userTasks.length + '</b> pending tasks</span><span><b>' + rupees(dealValue) + '</b> pipeline</span></div></article>';
    }).join('');
    setHTML('#admin-user-metrics', [metric('TOTAL USERS', state.users.length, 'Registered users'), metric('ACTIVE NOW', state.users.filter(user => user.status === 'Active').length, 'Currently active users'), metric('AWAY / OFFLINE', state.users.filter(user => user.status !== 'Active').length, 'Needs follow-up'), metric('OPEN WORK', openTasks().length, 'Pending tasks across users')].join(''));
    setHTML('#admin-user-list', cards || empty('No users available.'));
  }

  function renderAnalytics() {
    const closed = opportunities().filter(item => ['Won', 'Lost'].includes(item.stage));
    const won = closed.filter(item => item.stage === 'Won');
    const complete = tasks().filter(item => item.done);
    setHTML('#analytics-metrics', [
      metric('CUSTOMERS', customers().length, 'Saved contacts'),
      metric('OPPORTUNITIES', opportunities().length, 'All stages'),
      metric('WIN RATE', closed.length ? Math.round(won.length / closed.length * 100) + '%' : '—', closed.length ? won.length + ' won / ' + closed.length + ' closed' : 'No closed deals'),
      metric('TASKS COMPLETED', tasks().length ? Math.round(complete.length / tasks().length * 100) + '%' : '—', complete.length + ' of ' + tasks().length + ' tasks')
    ].join(''));
    setHTML('#analytics-stages', stageSummary());
    setHTML('#analytics-task-progress', taskProgressChart());
    const totalValue = opportunities().reduce((sum, item) => sum + money(item.value), 0);
    setHTML('#analytics-revenue-line', revenueLineChart());
    setHTML('#analytics-outcome-donut', '<div class="donut-chart" style="--won:' + (closed.length ? Math.round(won.length / closed.length * 100) : 0) + '%"><strong>' + (closed.length ? Math.round(won.length / closed.length * 100) : 0) + '%</strong><small>won</small></div><p class="muted">' + rupees(totalValue) + ' recorded across ' + opportunities().length + ' opportunities.</p>');
    const explanation = document.querySelector('#analytics-explanation');
    if (explanation) explanation.textContent = 'Win rate counts Won opportunities divided by all Won and Lost opportunities. Task completion counts checked tasks divided by all tasks. Pipeline value sums open deal values.';
  }

  function renderNotifications() {
    const now = new Date();
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    const due = openTasks().filter(item => item.due && item.due <= today);
    setHTML('#notification-results', state.settings.reminders === 'off' ? empty('Task reminders are hidden in Settings.') : due.length ? due.map(item => '<p>' + text(item.title) + ' · ' + text(dateLabel(item.due)) + '</p>').join('') : empty('No task reminders due.'));
  }

  function render() {
    renderShell();
    if (page === 'customers.html') renderCustomers();
    if (page === 'pipeline.html') renderPipeline();
    if (page === 'tasks.html') renderTasks();
    if (page === 'index.html') renderOverview();
    if (page === 'analytics.html') renderAnalytics();
    if (page === 'users.html') renderUsers();
    if (page === 'user-portal.html') renderUserPortal();
    if (page === 'user-profile.html') renderUserProfile();
    if (page === 'user-tasks.html') renderUserTasks();
    if (page === 'user-opportunities.html') renderUserOpportunities();
    if (page === 'user-customers.html') renderUserCustomers();
    renderNotifications();
    applyTranslation(ui.language || 'English');
  }

  function bindLogin() {
    const form = document.querySelector('#login-form');
    if (!form) return;
    const signIn = (role, email = '', fullName = '') => {
      const destination = role === 'user' ? 'user-portal.html' : 'index.html';
      sessionStorage.setItem(AUTH_KEY, '1');
      sessionStorage.setItem(AUTH_ROLE_KEY, role);
      if (role === 'user') {
        let account = state.users.find(user => user.email.toLowerCase() === email.toLowerCase());
        if (!account) {
          const name = fullName || email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
          const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'US';
          account = { id: 'user-' + id(), name, email, department:'Not provided', phone:'', status:'Active', lastActive:'Online now', joined:stamp(new Date().toISOString()), initials, accent:'#2f5d8a' };
          state.users.push(account); save();
        } else {
          account.status = 'Active'; account.lastActive = 'Online now'; save();
        }
        sessionStorage.setItem(ACCOUNT_KEY, account.id);
      } else sessionStorage.removeItem(ACCOUNT_KEY);
      location.assign(destination);
    };
    form.addEventListener('submit', event => {
      event.preventDefault();
      const email = form.elements.namedItem('loginId').value.trim().toLowerCase();
      const fullName = form.elements.namedItem('fullName').value.trim();
      const password = form.elements.namedItem('accessKey').value;
      const selectedRole = form.elements.namedItem('portalRole').value;
      const error = document.querySelector('#login-error');
      if (!email || !password) {
        error.textContent = 'Enter your email and password, then choose a portal.';
        return;
      }
      error.textContent = '';
      signIn(selectedRole, email, fullName);
    });
  }

  function initLoginEnhancements() {
    const password = document.querySelector('#login-password'); if (!password) return;
    password.insertAdjacentHTML('afterend', '<div class="password-tools"><button type="button" id="toggle-password">Show password</button><span id="password-strength">Password strength: —</span></div>');
    document.querySelector('#toggle-password').addEventListener('click', () => { password.type = password.type === 'password' ? 'text' : 'password'; document.querySelector('#toggle-password').textContent = password.type === 'password' ? 'Show password' : 'Hide password'; });
    password.addEventListener('input', () => { const n = password.value.length; document.querySelector('#password-strength').textContent = 'Password strength: ' + (n < 6 ? 'Low' : n < 10 ? 'Medium' : 'Strong'); });
  }

  function bindShell() {
    const togglePanel = selector => {
      const panel = document.querySelector(selector);
      const shouldOpen = panel && !panel.classList.contains('open');
      document.querySelectorAll('#profile-menu, #search-popover, #notification-popover').forEach(item => item.classList.remove('open'));
      if (shouldOpen) panel.classList.add('open');
    };
    document.querySelectorAll('#profile-button, #sidebar-profile').forEach(button => button.addEventListener('click', () => togglePanel('#profile-menu')));
    document.querySelector('#logout')?.addEventListener('click', () => { sessionStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(AUTH_ROLE_KEY); sessionStorage.removeItem(ACCOUNT_KEY); location.assign('login.html'); });
    document.querySelector('#global-search-button')?.addEventListener('click', () => { togglePanel('#search-popover'); if (document.querySelector('#search-popover')?.classList.contains('open')) document.querySelector('#global-search')?.focus(); });
    document.querySelector('#notification-button')?.addEventListener('click', () => { renderNotifications(); togglePanel('#notification-popover'); });
    document.querySelector('#close-notifications')?.addEventListener('click', () => document.querySelector('#notification-popover')?.classList.remove('open'));
    document.querySelector('#global-search')?.addEventListener('input', event => {
      const query = event.target.value.trim().toLowerCase();
      const rows = [
        ...customers().map(item => ({ label: item.name, detail: item.company || 'Customer', href: 'customers.html' })),
        ...opportunities().map(item => ({ label: item.name, detail: item.company || 'Opportunity', href: 'pipeline.html' })),
        ...tasks().map(item => ({ label: item.title, detail: 'Task', href: 'tasks.html' }))
      ].filter(item => [item.label, item.detail].join(' ').toLowerCase().includes(query));
      setHTML('#global-results', query ? (rows.length ? rows.slice(0, 8).map(item => '<a class="search-result" href="' + item.href + '"><strong>' + text(item.label) + '</strong><small>' + text(item.detail) + '</small></a>').join('') : empty('No matching records.')) : empty('Type to search your records.'));
    });
  }

  function bindCustomers() {
    document.querySelector('#customer-search')?.addEventListener('input', renderCustomers);
    document.querySelector('#customer-status')?.addEventListener('change', renderCustomers);
    document.querySelector('#add-customer')?.addEventListener('click', () => {
      document.querySelector('#customer-modal')?.remove();
      const overlay = document.createElement('div');
      overlay.className = 'modal-backdrop'; overlay.id = 'customer-modal';
      overlay.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title"><button class="modal-close" type="button" aria-label="Close">×</button><p class="section-kicker">NEW RELATIONSHIP</p><h3 id="customer-modal-title">Add customer</h3><form id="customer-form"><label for="new-customer-name">Customer name</label><input id="new-customer-name" name="name" required><label for="new-customer-company">Company</label><input id="new-customer-company" name="company"><label for="new-customer-email">Email</label><input id="new-customer-email" name="email" type="email"><label for="new-customer-tags">Tags</label><input id="new-customer-tags" name="tags" placeholder="Example: enterprise, warm lead"><label for="new-customer-status">Status</label><select id="new-customer-status" name="status"><option>Active</option><option>Prospect</option></select><label for="new-customer-notes">Notes</label><textarea id="new-customer-notes" name="notes" rows="3" placeholder="Customer context or follow-up notes"></textarea><label for="new-customer-file">Attachment preview</label><input id="new-customer-file" name="attachment" type="file"><div class="form-actions"><button type="button" class="secondary" id="cancel-customer">Cancel</button><button class="primary" type="submit">Save customer</button></div></form></div>';
      document.body.append(overlay);
      const close = () => overlay.remove();
      overlay.querySelector('.modal-close').addEventListener('click', close);
      overlay.querySelector('#cancel-customer').addEventListener('click', close);
      overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
      overlay.querySelector('#customer-form').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const file = await saveAttachment(form.elements.namedItem('attachment').files[0]);
        state.customers.push({ id: id(), name: form.elements.namedItem('name').value.trim(), company: form.elements.namedItem('company').value.trim(), email: form.elements.namedItem('email').value.trim(), tags: form.elements.namedItem('tags').value.trim(), notes: form.elements.namedItem('notes').value.trim(), attachment: file.name, attachmentUrl:file.url, timeline:[{ text:'Customer profile created', at:new Date().toISOString() }], status: form.elements.namedItem('status').value, ownerId:'eswar', createdAt: new Date().toISOString() });
        save(); close(); render(); notify('Customer saved');
      });
      overlay.querySelector('#new-customer-name').focus();
    });
  }

  function findRecord(collection, recordId) {
    return state[collection].find((item, index) => String(item.id || index) === String(recordId));
  }

  function openRecordEditor(type, recordId) {
    const collection = type === 'customer' ? 'customers' : type === 'opportunity' ? 'opportunities' : 'tasks';
    const item = findRecord(collection, recordId);
    if (!item) return;
    document.querySelector('#record-editor')?.remove();
    const fields = type === 'customer'
      ? '<div class="customer-profile-card"><span class="profile-avatar">' + text(item.name.split(' ').map(part => part[0]).join('').slice(0,2).toUpperCase()) + '</span><div><strong>' + text(item.name) + '</strong><small>' + text(item.company || 'Customer profile') + '</small></div></div><label>Customer name<input name="name" required value="' + text(item.name) + '"></label><label>Company<input name="company" value="' + text(item.company || '') + '"></label><label>Email<input name="email" type="email" value="' + text(item.email || '') + '"></label><label>Tags<input name="tags" value="' + text(item.tags || '') + '" placeholder="enterprise, warm lead"></label><label>Notes<textarea name="notes" rows="3">' + text(item.notes || '') + '</textarea></label><label>Attachment preview<input name="attachment" type="file" accept="image/*,.pdf,.doc,.docx"></label>' + attachmentHTML(item) + '<label>Status<select name="status"><option' + ((item.status || 'Active') === 'Active' ? ' selected' : '') + '>Active</option><option' + (item.status === 'Prospect' ? ' selected' : '') + '>Prospect</option></select></label><div class="contact-timeline"><strong>Contact timeline</strong>' + (item.timeline || [{text:'Customer saved',at:item.createdAt}]).map(entry => '<small>' + text(stamp(entry.at)) + ' · ' + text(entry.text) + '</small>').join('') + '<label>Add activity<input name="timelineEntry" placeholder="Example: Follow-up call completed"></label></div>'
      : type === 'opportunity'
        ? '<label>Opportunity name<input name="name" required value="' + text(item.name) + '"></label><label>Company<input name="company" value="' + text(item.company || '') + '"></label><label>Deal value (₹)<input name="value" type="number" min="0" value="' + text(item.value || 0) + '"></label><label>Stage<select name="stage">' + stages.map(stage => '<option' + (item.stage === stage ? ' selected' : '') + '>' + text(stage) + '</option>').join('') + '</select></label><label>Opportunity label<select name="label"><option value="">No label</option>' + ['Urgent','Warm','Strategic'].map(label => '<option' + (item.label === label ? ' selected' : '') + '>' + label + '</option>').join('') + '</select></label><label>Notes<textarea name="notes" rows="3">' + text(item.notes || '') + '</textarea></label><label>Attachment preview<input name="attachment" type="file" accept="image/*,.pdf,.doc,.docx"></label>' + attachmentHTML(item)
        : '<label>Task title<input name="title" required value="' + text(item.title) + '"></label><label>Due date<input name="due" type="date" value="' + text(item.due || '') + '"></label><label>Priority<select name="priority">' + ['High', 'Medium', 'Low'].map(priority => '<option' + ((item.priority || 'Medium') === priority ? ' selected' : '') + '>' + priority + '</option>').join('') + '</select></label><label>Notes<textarea name="notes" rows="4">' + text(item.notes || '') + '</textarea></label><label>Attachment preview<input name="attachment" type="file" accept="image/*,.pdf,.doc,.docx"></label>' + attachmentHTML(item);
    const label = type === 'customer' ? 'Customer' : type === 'opportunity' ? 'Opportunity' : 'Task';
    const overlay = document.createElement('div'); overlay.className = 'modal-backdrop'; overlay.id = 'record-editor';
    overlay.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="editor-title"><button class="modal-close" type="button" aria-label="Close">×</button><p class="section-kicker">EDIT ' + label.toUpperCase() + '</p><h3 id="editor-title">Modify ' + label.toLowerCase() + '</h3><form id="record-editor-form">' + fields + '<div class="form-actions record-actions"><button class="secondary delete-action" type="button" id="delete-record">Delete</button><button class="primary" type="submit">Save changes</button></div></form></div>';
    document.body.append(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('.modal-close').addEventListener('click', close);
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    overlay.querySelector('#record-editor-form').addEventListener('submit', async event => {
      event.preventDefault(); const form = event.currentTarget; const selected = await saveAttachment(form.elements.attachment.files[0]); const attachment = selected.name || item.attachment || ''; const attachmentUrl = selected.url || item.attachmentUrl || '';
      if (type === 'customer') { Object.assign(item, { name: form.elements.name.value.trim(), company: form.elements.company.value.trim(), email: form.elements.email.value.trim(), tags: form.elements.tags.value.trim(), notes: form.elements.notes.value.trim(), attachment, attachmentUrl, status: form.elements.status.value }); const entry = form.elements.timelineEntry.value.trim(); if (entry) item.timeline = [...(item.timeline || []), { text:entry, at:new Date().toISOString() }]; }
      if (type === 'opportunity') Object.assign(item, { name: form.elements.name.value.trim(), company: form.elements.company.value.trim(), value: Number(form.elements.value.value) || 0, stage: form.elements.stage.value, label: form.elements.label.value, notes: form.elements.notes.value.trim(), attachment, attachmentUrl });
      if (type === 'task') Object.assign(item, { title: form.elements.title.value.trim(), due: form.elements.due.value, priority: form.elements.priority.value, notes: form.elements.notes.value.trim(), attachment, attachmentUrl });
      save(); close(); render(); notify(label + ' updated');
    });
    overlay.querySelector('#delete-record').addEventListener('click', () => confirmDelete(label, collection, item, close));
  }

  function confirmDelete(label, collection, item, closeEditor) {
    const confirm = document.createElement('div'); confirm.className = 'modal-backdrop';
    confirm.innerHTML = '<div class="modal confirm-modal" role="dialog" aria-modal="true"><p class="section-kicker">CONFIRM DELETE</p><h3>Delete ' + text(label.toLowerCase()) + '?</h3><p>This record will be removed from this browser. You can undo it immediately.</p><div class="form-actions"><button class="secondary" type="button" data-cancel>Cancel</button><button class="primary delete-action" type="button" data-confirm>Delete</button></div></div>';
    document.body.append(confirm); confirm.querySelector('[data-cancel]').addEventListener('click', () => confirm.remove());
    confirm.querySelector('[data-confirm]').addEventListener('click', () => { const index = state[collection].indexOf(item); if (index >= 0) state[collection].splice(index, 1); save(); confirm.remove(); closeEditor(); render(); undoDelete(label, collection, item, index); });
  }
  function undoDelete(label, collection, item, index) {
    let toast = document.querySelector('#undo-toast'); if (!toast) { toast = document.createElement('div'); toast.id = 'undo-toast'; toast.className = 'undo-toast'; document.body.append(toast); }
    toast.innerHTML = text(label) + ' deleted. <button type="button">Undo</button>'; toast.classList.add('show');
    const timeout = setTimeout(() => toast.classList.remove('show'), 5000);
    toast.querySelector('button').onclick = () => { state[collection].splice(Math.max(0, index), 0, item); save(); render(); clearTimeout(timeout); toast.classList.remove('show'); notify(label + ' restored'); };
  }

  function bindRecordManagement() {
    document.querySelector('#customer-rows')?.addEventListener('click', event => {
      const button = event.target.closest('[data-customer-edit]'); if (button) openRecordEditor('customer', button.dataset.customerEdit);
    });
    document.querySelector('#pipeline-board')?.addEventListener('click', event => {
      const menu = event.target.closest('[data-opportunity-menu]');
      if (menu) { const target = document.querySelector('[data-opportunity-menu-id="' + menu.dataset.opportunityMenu + '"]'); if (target) target.hidden = !target.hidden; return; }
      const edit = event.target.closest('[data-opportunity-edit]'); if (edit) openRecordEditor('opportunity', edit.dataset.opportunityEdit);
      const remove = event.target.closest('[data-opportunity-delete]'); if (remove) openRecordEditor('opportunity', remove.dataset.opportunityDelete);
    });
    const board = document.querySelector('#pipeline-board');
    board?.addEventListener('dragstart', event => { const card = event.target.closest('[data-opportunity-card]'); if (card) { event.dataTransfer.setData('text/plain', card.dataset.opportunityCard); card.classList.add('dragging'); } });
    board?.addEventListener('dragend', event => event.target.closest('[data-opportunity-card]')?.classList.remove('dragging'));
    board?.addEventListener('dragover', event => { if (event.target.closest('[data-drop-stage]')) event.preventDefault(); });
    board?.addEventListener('drop', event => { const column = event.target.closest('[data-drop-stage]'); if (!column) return; event.preventDefault(); const item = findRecord('opportunities', event.dataTransfer.getData('text/plain')); if (item) { item.stage = column.dataset.dropStage; save(); render(); notify('Opportunity moved to ' + item.stage); } });
    document.querySelector('#task-list')?.addEventListener('click', event => {
      const button = event.target.closest('[data-task-edit]'); if (button) openRecordEditor('task', button.dataset.taskEdit);
    });
  }

  function bindTaskForm() {
    document.querySelector('#task-form')?.addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const file = await saveAttachment(form.elements.namedItem('attachment').files[0]);
      state.tasks.push({ id: id(), title: form.elements.namedItem('title').value.trim(), due: form.elements.namedItem('due').value, priority: form.elements.namedItem('priority').value, notes: form.elements.namedItem('notes').value.trim(), attachment:file.name, attachmentUrl:file.url, done: false, ownerId:'eswar', createdAt: new Date().toISOString() });
      save(); location.assign('tasks.html');
    });
    document.querySelector('#task-list')?.addEventListener('change', event => {
      const checkbox = event.target.closest('[data-task-id]');
      if (!checkbox) return;
      const item = tasks().find((task, index) => String(task.id || index) === checkbox.dataset.taskId);
      if (item) { item.done = checkbox.checked; save(); render(); }
    });
  }

  function bindOpportunityForm() {
    document.querySelector('#opportunity-form')?.addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const file = await saveAttachment(form.elements.namedItem('attachment').files[0]);
      state.opportunities.push({ id: id(), name: form.elements.namedItem('name').value.trim(), company: form.elements.namedItem('company').value.trim(), value: Number(form.elements.namedItem('value').value) || 0, stage: form.elements.namedItem('stage').value, label: form.elements.namedItem('label').value, notes: form.elements.namedItem('notes').value.trim(), attachment:file.name, attachmentUrl:file.url, ownerId:'eswar', createdAt: new Date().toISOString() });
      save(); location.assign('pipeline.html');
    });
    document.querySelector('#pipeline-board')?.addEventListener('change', event => {
      const select = event.target.closest('[data-deal-id]');
      if (!select) return;
      const item = opportunities().find((deal, index) => String(deal.id || index) === select.dataset.dealId);
      if (item && stages.includes(select.value)) { item.stage = select.value; save(); render(); notify('Stage updated'); }
    });
  }

  function bindSettings() {
    const form = document.querySelector('#settings-form');
    if (!form) return;
    form.elements.namedItem('displayName').value = state.settings.displayName;
    form.elements.namedItem('workspace').value = state.settings.workspace;
    form.elements.namedItem('role').value = state.settings.role;
    form.elements.namedItem('email').value = state.settings.email;
    form.elements.namedItem('phone').value = state.settings.phone;
    form.elements.namedItem('department').value = state.settings.department;
    form.elements.namedItem('timezone').value = state.settings.timezone;
    form.elements.namedItem('reminders').value = state.settings.reminders;
    form.elements.namedItem('emailUpdates').checked = Boolean(state.settings.emailUpdates);
    form.elements.namedItem('weeklySummary').checked = Boolean(state.settings.weeklySummary);
    if (form.elements.namedItem('avatarInitials')) form.elements.namedItem('avatarInitials').value = state.settings.avatarInitials;
    if (form.elements.namedItem('accent')) form.elements.namedItem('accent').value = state.settings.accent;
    form.addEventListener('submit', event => {
      event.preventDefault();
      state.settings.displayName = form.elements.namedItem('displayName').value.trim();
      state.settings.workspace = form.elements.namedItem('workspace').value.trim();
      state.settings.role = form.elements.namedItem('role').value.trim();
      state.settings.email = form.elements.namedItem('email').value.trim();
      state.settings.phone = form.elements.namedItem('phone').value.trim();
      state.settings.department = form.elements.namedItem('department').value.trim();
      state.settings.timezone = form.elements.namedItem('timezone').value;
      state.settings.reminders = form.elements.namedItem('reminders').value;
      state.settings.emailUpdates = form.elements.namedItem('emailUpdates').checked;
      state.settings.weeklySummary = form.elements.namedItem('weeklySummary').checked;
      if (form.elements.namedItem('avatarInitials')) state.settings.avatarInitials = form.elements.namedItem('avatarInitials').value.trim().slice(0, 3).toUpperCase();
      if (form.elements.namedItem('accent')) state.settings.accent = form.elements.namedItem('accent').value;
      save(); render(); notify('Settings saved');
    });
  }

  function initFrontendEnhancements() {
    // This project has one approved visual identity: the bright Monsoon theme.
    if (ui.themePreset !== 'monsoon') updateUI({ themePreset:'monsoon' });
    document.body.classList.toggle('dark-theme', ui.theme === 'dark');
    applyThemePreset('monsoon');
    document.body.classList.toggle('sidebar-collapsed', ui.sidebarCollapsed);
    const actions = document.querySelector('.top-actions');
    const userPortal = userPages.has(page);
    if (actions && !userPortal && !document.querySelector('#command-toggle')) {
      actions.insertAdjacentHTML('afterbegin', '<button class="icon-button" id="theme-toggle" type="button" title="Toggle dark mode" aria-label="Toggle dark mode">◐</button><button class="icon-button" id="command-toggle" type="button" title="Quick actions" aria-label="Quick actions">⌘</button>');
      const accountControl = actions.querySelector('#profile-button');
      (accountControl || actions).insertAdjacentHTML(accountControl ? 'beforebegin' : 'beforeend', '<button class="icon-button" id="help-toggle" type="button" title="Help and shortcuts" aria-label="Help and shortcuts">?</button>');
    }
    if (!userPortal && !document.querySelector('#command-palette')) document.body.insertAdjacentHTML('beforeend', '<div id="command-palette" class="command-palette" hidden><div class="command-dialog" role="dialog" aria-modal="true" aria-label="Quick actions"><button class="modal-close" type="button" data-close-command aria-label="Close">×</button><p class="section-kicker">QUICK ACTIONS</p><h3>Navigate quickly</h3><a href="customers.html">Customers</a><a href="pipeline.html">Pipeline</a><a href="tasks.html">Tasks</a><a href="analytics.html">Analytics</a><a href="users.html">Users</a><a href="settings.html">Settings</a><p class="shortcut-hint">Shortcut: Ctrl + K</p></div></div>');
    if (!userPortal && !document.querySelector('#help-panel')) document.body.insertAdjacentHTML('beforeend', '<div id="help-panel" class="command-palette" hidden><div class="command-dialog" role="dialog" aria-label="Help"><button class="modal-close" type="button" data-close-help aria-label="Close">×</button><p class="section-kicker">FRONTEND GUIDE</p><h3>Using PEL</h3><p>Use Add Customer, New Opportunity, and Add Task to create records. Use three-dot menus to modify or delete records. Drag opportunity cards to move them across pipeline stages.</p><p><strong>Shortcuts:</strong> Ctrl + K opens quick actions. T switches light and dark mode.</p></div></div>');
    document.querySelector('#theme-toggle')?.addEventListener('click', () => { ui.theme = ui.theme === 'dark' ? 'light' : 'dark'; saveUI(); document.body.classList.toggle('dark-theme', ui.theme === 'dark'); });
    document.querySelector('#command-toggle')?.addEventListener('click', () => { document.querySelector('#command-palette').hidden = false; });
    document.querySelector('#help-toggle')?.addEventListener('click', () => { document.querySelector('#help-panel').hidden = false; });
    document.querySelector('[data-close-command]')?.addEventListener('click', () => { document.querySelector('#command-palette').hidden = true; });
    document.querySelector('[data-close-help]')?.addEventListener('click', () => { document.querySelector('#help-panel').hidden = true; });
    document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && document.querySelector('#command-palette')) { event.preventDefault(); document.querySelector('#command-palette').hidden = false; } if (!event.ctrlKey && !event.metaKey && event.key.toLowerCase() === 't' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) document.querySelector('#theme-toggle')?.click(); if (event.key === 'Escape') document.querySelectorAll('.command-palette').forEach(el => el.hidden = true); });
    setupExperienceExtras();
    if (page === 'customers.html') setupCustomerTools();
    if (page === 'tasks.html') setupTaskTools();
    setTimeout(() => document.body.classList.remove('page-loading'), 250);
  }

  function setupDashboardTools() {
    const hero = document.querySelector('.hero-row');
    if (!hero || document.querySelector('#dashboard-layout')) return;
    hero.insertAdjacentHTML('beforeend', '<div class="dashboard-tools"><label for="dashboard-layout">Dashboard layout</label><select id="dashboard-layout"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select><button type="button" class="secondary" id="dashboard-customize">Customize widgets</button></div>');
    const apply = value => { document.body.classList.toggle('compact-dashboard', value === 'compact'); updateUI({ dashboardLayout: value }); };
    document.querySelector('#dashboard-layout').value = ui.dashboardLayout || 'comfortable'; apply(ui.dashboardLayout || 'comfortable');
    document.querySelector('#dashboard-layout').addEventListener('change', event => apply(event.target.value));
    document.querySelector('#dashboard-customize').addEventListener('click', () => { document.querySelectorAll('#overview-metrics .metric').forEach((card, index) => { card.draggable = true; card.dataset.widget = index; card.classList.toggle('widget-editing'); }); notify('Drag dashboard metric widgets to reorder them'); });
    const metrics = document.querySelector('#overview-metrics');
    metrics?.addEventListener('dragstart', event => { const card = event.target.closest('[draggable="true"].metric'); if (card) event.dataTransfer.setData('text/widget', card.dataset.widget); });
    metrics?.addEventListener('dragover', event => event.preventDefault());
    metrics?.addEventListener('drop', event => { event.preventDefault(); const source = metrics.querySelector('[data-widget="' + event.dataTransfer.getData('text/widget') + '"]'); const target = event.target.closest('.metric'); if (source && target && source !== target) { metrics.insertBefore(source, target); notify('Dashboard widgets reordered'); } });
  }

  function setupCustomerTools() {
    const toolbar = document.querySelector('.toolbar'); if (!toolbar || document.querySelector('#customer-tools')) return;
    document.querySelector('.table-scroll')?.insertAdjacentHTML('afterend', '<div class="pagination" id="customer-pagination"></div>');
    toolbar.insertAdjacentHTML('beforeend', '<span id="customer-tools" class="customer-tools"><select id="customer-sort" aria-label="Sort customers"><option value="name">Sort: name</option><option value="date">Sort: newest</option></select><button type="button" class="secondary" id="save-customer-filter">Save filter</button><button type="button" class="secondary" id="apply-customer-filter">Apply saved</button><button type="button" class="secondary" id="customer-columns">Columns</button><button type="button" class="secondary" id="customer-export">Export preview</button></span><div id="column-menu" class="mini-menu" hidden><label><input type="checkbox" checked data-column="company"> Company</label><label><input type="checkbox" checked data-column="status"> Status</label><label><input type="checkbox" checked data-column="email"> Email</label></div>');
    document.querySelector('#customer-sort').value = ui.customerSort || 'name';
    document.querySelector('#customer-sort').addEventListener('change', event => { updateUI({ customerSort:event.target.value, customerPage:1 }); renderCustomers(); });
    document.querySelector('#save-customer-filter').addEventListener('click', () => { updateUI({ savedCustomerFilter: document.querySelector('#customer-search').value }); notify('Current customer filter saved'); });
    document.querySelector('#apply-customer-filter').addEventListener('click', () => { document.querySelector('#customer-search').value = ui.savedCustomerFilter || ''; updateUI({ customerPage:1 }); renderCustomers(); notify(ui.savedCustomerFilter ? 'Saved filter applied' : 'No saved filter yet'); });
    document.querySelector('#customer-columns').addEventListener('click', () => { const menu = document.querySelector('#column-menu'); menu.hidden = !menu.hidden; });
    document.querySelectorAll('#column-menu input').forEach(input => input.addEventListener('change', event => document.querySelectorAll('table th:nth-child(' + ({ company:2, status:3, email:4 }[event.target.dataset.column]) + '), table td:nth-child(' + ({ company:2, status:3, email:4 }[event.target.dataset.column]) + ')').forEach(cell => cell.hidden = !event.target.checked)));
    document.querySelector('#customer-export').addEventListener('click', () => showExportPreview('Customer table'));
    document.querySelector('#customer-pagination')?.addEventListener('click', event => { const button = event.target.closest('[data-customer-page]'); if (button) { updateUI({ customerPage:Number(button.dataset.customerPage) }); renderCustomers(); } });
  }

  function setupTaskTools() {
    const hero = document.querySelector('.hero-row'); if (!hero || document.querySelector('#task-tools')) return;
    const addTask = hero.querySelector('a.primary');
    const actionArea = document.createElement('div'); actionArea.className = 'task-page-actions';
    if (addTask) { addTask.replaceWith(actionArea); actionArea.append(addTask); }
    actionArea.insertAdjacentHTML('afterbegin', '<div id="task-tools" class="task-tools"><label for="task-sort">Sort</label><select id="task-sort"><option value="priority">Priority</option><option value="date">Due date</option><option value="name">Name</option></select><button type="button" class="secondary" id="task-export">Export preview</button></div>');
    document.querySelector('#task-sort').addEventListener('change', event => { const list = [...tasks()]; const mode = event.target.value; list.sort((a,b) => mode === 'name' ? a.title.localeCompare(b.title) : mode === 'date' ? String(a.due || '9999').localeCompare(String(b.due || '9999')) : ({High:0,Medium:1,Low:2}[a.priority] ?? 1) - ({High:0,Medium:1,Low:2}[b.priority] ?? 1)); state.tasks = list; save(); render(); notify('Task order updated'); });
    document.querySelector('#task-export').addEventListener('click', () => showExportPreview('Task list'));
  }

  function showExportPreview(title) {
    document.querySelector('#export-preview')?.remove();
    const el = document.createElement('div'); el.id = 'export-preview'; el.className = 'command-palette'; el.innerHTML = '<div class="command-dialog" role="dialog" aria-modal="true" aria-label="Export preview"><button class="modal-close" type="button" aria-label="Close">×</button><p class="section-kicker">EXPORT PREVIEW</p><h3>' + text(title) + '</h3><p>Download the records currently saved in this browser as CSV, or use the print view to save a PDF locally.</p><div class="export-actions"><button class="primary" type="button" data-export-csv>Download CSV</button><button class="secondary" type="button" data-export-print>Print / Save PDF</button></div></div>'; document.body.append(el); el.querySelector('.modal-close').addEventListener('click', () => el.remove());
    el.querySelector('[data-export-csv]').addEventListener('click', () => downloadCSV(title));
    el.querySelector('[data-export-print]').addEventListener('click', () => printRecords(title));
  }

  function printRecords(title) {
    document.querySelector('#print-records')?.remove();
    const isCustomers = title.includes('Customer');
    const headings = isCustomers
      ? ['Customer', 'Company', 'Email', 'Status', 'Tags', 'Added']
      : ['Task', 'Due date', 'Priority', 'Status', 'Notes'];
    const records = isCustomers
      ? customers().map(item => [item.name, item.company || '—', item.email || '—', item.status || 'Active', item.tags || '—', stamp(item.createdAt)])
      : tasks().map(item => [item.title, dateLabel(item.due), priorityLabel(item.priority || 'Medium'), item.done ? 'Done' : 'Open', item.notes || '—']);
    const printable = document.createElement('section');
    printable.id = 'print-records';
    printable.innerHTML = '<header><p>PEL CRM</p><h1>' + text(title) + '</h1><small>Saved browser records · ' + text(new Date().toLocaleDateString(activeLocale(), { day: 'numeric', month: 'long', year: 'numeric' })) + '</small></header>' +
      (records.length ? '<table><thead><tr>' + headings.map(heading => '<th>' + text(heading) + '</th>').join('') + '</tr></thead><tbody>' + records.map(row => '<tr>' + row.map(value => '<td>' + text(value) + '</td>').join('') + '</tr>').join('') + '</tbody></table>' : '<p class="print-empty">No saved records to print.</p>');
    document.body.append(printable);
    const modal = document.querySelector('#export-preview');
    modal?.setAttribute('hidden', '');
    document.body.classList.add('printing-records');
    const cleanUp = () => {
      printable.remove();
      modal?.removeAttribute('hidden');
      document.body.classList.remove('printing-records');
    };
    window.addEventListener('afterprint', cleanUp, { once:true });
    window.print();
  }

  function downloadCSV(title) {
    const rows = title.includes('Customer')
      ? [['Name','Company','Email','Status','Tags'], ...customers().map(item => [item.name,item.company,item.email,item.status,item.tags])]
      : [['Task','Due date','Priority','Status','Notes'], ...tasks().map(item => [item.title,item.due,item.priority,item.done ? 'Done' : 'Open',item.notes])];
    const csv = rows.map(row => row.map(value => '"' + String(value || '').replace(/"/g, '""') + '"').join(',')).join('\n');
    const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' })); anchor.download = title.toLowerCase().replace(/\s+/g, '-') + '.csv'; anchor.click(); URL.revokeObjectURL(anchor.href); notify('CSV downloaded from this browser');
  }

  function setupExperienceExtras() {
    const actions = document.querySelector('.top-actions');
    const profileButton = actions?.querySelector('#profile-button');
    if (actions && !document.querySelector('#language-control')) (profileButton || actions).insertAdjacentHTML(profileButton ? 'beforebegin' : 'beforeend', '<label class="language-control" for="language-control">Language<select id="language-control" aria-label="Interface language"><option value="English">EN</option><option value="Hindi">हि</option><option value="Telugu">తె</option></select></label>');
    document.querySelector('.theme-preset')?.remove();
    document.querySelector('#language-control')?.addEventListener('change', event => { updateUI({ language:event.target.value }); render(); notify(event.target.value === 'Hindi' ? 'भाषा सहेज दी गई' : event.target.value === 'Telugu' ? 'భాష సేవ్ చేయబడింది' : 'Language preference saved for this browser'); });
    if (document.querySelector('#language-control')) document.querySelector('#language-control').value = ui.language || 'English';
    document.querySelector('#help-panel')?.insertAdjacentHTML('beforeend', '<button type="button" class="primary" id="start-tour">Start quick tour</button>');
    document.querySelector('#start-tour')?.addEventListener('click', startTour);
    document.addEventListener('change', event => { const file = event.target.closest('input[type="file"]'); if (file && file.files[0]) { let hint = file.parentElement.querySelector('.file-preview'); if (!hint) { hint = document.createElement('small'); hint.className = 'file-preview'; file.after(hint); } hint.textContent = 'Ready to attach: ' + file.files[0].name; } });
    document.querySelectorAll('input[required]').forEach(input => input.setAttribute('aria-required','true'));
    setupFormMessages(); setupAdvancedSearch(); applyTranslation(ui.language || 'English');
  }

  function applyThemePreset(name) { document.body.dataset.themePreset = name; }
  function setupFormMessages() {
    document.querySelectorAll('form').forEach(form => { form.noValidate = true; form.addEventListener('submit', event => { const invalid = [...form.querySelectorAll('[required]')].find(field => !field.value.trim()); const email = form.querySelector('input[type="email"]'); const badEmail = email?.value && !email.validity.valid; form.querySelectorAll('.field-error').forEach(el => el.remove()); if (invalid || badEmail) { event.preventDefault(); event.stopImmediatePropagation(); const field = invalid || email; field.setAttribute('aria-invalid','true'); const error = document.createElement('small'); error.className = 'field-error'; error.textContent = invalid ? 'Please complete this required field.' : 'Enter a valid email address.'; field.after(error); field.focus(); notify('Please correct the highlighted field', 'error'); } }, true); });
  }
  function setupAdvancedSearch() {
    const popover = document.querySelector('#search-popover'); const input = document.querySelector('#global-search'); if (!popover || !input || popover.querySelector('#search-type')) return;
    input.insertAdjacentHTML('afterend', '<div class="advanced-search"><select id="search-type" aria-label="Record type"><option value="all">All records</option><option value="customer">Customers</option><option value="opportunity">Opportunities</option><option value="task">Tasks</option></select><select id="search-priority" aria-label="Priority or status"><option value="all">Any priority/status</option><option value="High">High priority</option><option value="Active">Active customers</option><option value="Prospect">Prospects</option></select></div>');
    const draw = () => { const query = input.value.trim().toLowerCase(); const type = document.querySelector('#search-type').value; const filter = document.querySelector('#search-priority').value; const rows = [...customers().map(item => ({type:'customer',label:item.name,detail:item.company || 'Customer',filter:item.status || 'Active',href:'customers.html'})),...opportunities().map(item => ({type:'opportunity',label:item.name,detail:item.company || 'Opportunity',filter:item.label || '',href:'pipeline.html'})),...tasks().map(item => ({type:'task',label:item.title,detail:(item.priority || 'Medium') + ' priority',filter:item.priority || 'Medium',href:'tasks.html'}))].filter(item => (type === 'all' || item.type === type) && (filter === 'all' || item.filter === filter) && (!query || [item.label,item.detail].join(' ').toLowerCase().includes(query))); setHTML('#global-results', rows.length ? rows.slice(0,8).map(item => '<a class="search-result" href="' + item.href + '"><strong>' + text(item.label) + '</strong><small>' + text(item.detail) + '</small></a>').join('') : empty('No records match these filters.')); };
    input.addEventListener('input', draw); popover.querySelectorAll('select').forEach(select => select.addEventListener('change', draw)); draw();
  }
  function applyTranslation(language) {
    translatedTextNodes.forEach(node => { if (node.isConnected) node.nodeValue = translatedOriginals.get(node); });
    translatedTextNodes.clear();
    document.documentElement.lang = language === 'Hindi' ? 'hi' : language === 'Telugu' ? 'te' : 'en';
    if (language === 'English') return;
    const dictionaries = {
      Hindi:{
        'CRM PLATFORM':'सीआरएम मंच',WORKSPACE:'कार्यस्थान','MY WORKSPACE':'मेरा कार्यस्थान','ADMIN PORTAL':'प्रशासक पोर्टल','USER PORTAL':'उपयोगकर्ता पोर्टल',OVERVIEW:'अवलोकन',RELATIONSHIPS:'संबंध',PERFORMANCE:'प्रदर्शन','SALES PIPELINE':'बिक्री पाइपलाइन','FOLLOW-UPS':'फॉलो-अप',Overview:'अवलोकन',Customers:'ग्राहक',Pipeline:'पाइपलाइन',Tasks:'कार्य',Analytics:'विश्लेषण',Settings:'सेटिंग्स',User:'उपयोगकर्ता','Administrator workspace':'प्रशासक कार्यस्थान','Admin overview':'प्रशासक अवलोकन','Live information from the records you manage.':'आपके प्रबंधित रिकॉर्ड की लाइव जानकारी।','Customer relationships':'ग्राहक संबंध','Sales pipeline':'बिक्री पाइपलाइन','Your follow-ups':'आपकी फॉलो-अप सूची','Performance overview':'प्रदर्शन अवलोकन','Workspace settings':'कार्यस्थान सेटिंग्स',
        'Add customer':'ग्राहक जोड़ें','Add task':'कार्य जोड़ें','New opportunity':'नया अवसर','My profile':'मेरी प्रोफ़ाइल',Administrator:'प्रशासक',Language:'भाषा',Theme:'थीम',Monsoon:'मानसून',Ocean:'महासागर',Orchid:'ऑर्किड',Search:'खोज',Notifications:'सूचनाएं','Quick actions':'त्वरित क्रियाएं','Help and shortcuts':'सहायता और शॉर्टकट','Toggle theme':'थीम बदलें',
        'Live information from the records you add.':'आपके जोड़े गए रिकॉर्ड की लाइव जानकारी।','CUSTOMERS':'ग्राहक','OPEN PIPELINE':'खुली पाइपलाइन','OPEN TASKS':'खुले कार्य','WIN RATE':'जीत दर','Saved customer records':'सहेजे गए ग्राहक रिकॉर्ड','open opportunities':'खुले अवसर','Tasks waiting for completion':'पूर्ण होने की प्रतीक्षा वाले कार्य','No closed deals yet':'अभी कोई बंद डील नहीं','Revenue performance':'राजस्व प्रदर्शन','Deal value recorded over the last six months':'पिछले छह महीनों में दर्ज डील मूल्य','Priority follow-ups':'प्राथमिकता फॉलो-अप','High-priority work comes first':'उच्च-प्राथमिकता कार्य पहले आते हैं','View tasks →':'कार्य देखें →','Pipeline by stage':'चरण अनुसार पाइपलाइन','Actual opportunities in your workspace':'आपके कार्यस्थान के वास्तविक अवसर','View pipeline →':'पाइपलाइन देखें →','Recent activity':'हाल की गतिविधि','Changes made in this browser':'इस ब्राउज़र में किए गए बदलाव','Open opportunities':'खुले अवसर','Your active deals':'आपकी सक्रिय डील','Upcoming follow-ups':'आगामी फॉलो-अप','Tasks that need attention':'ध्यान देने वाले कार्य',
        'New lead':'नई लीड',Qualified:'योग्य',Proposal:'प्रस्ताव',Negotiation:'बातचीत',Won:'जीता',Lost:'हारा',High:'उच्च','High priority':'उच्च प्राथमिकता',Medium:'मध्यम',Low:'कम','No due date':'कोई तिथि नहीं','Due today':'आज देय','Due tomorrow':'कल देय','Save task':'कार्य सहेजें','Save opportunity':'अवसर सहेजें','Save customer':'ग्राहक सहेजें','Save settings':'सेटिंग्स सहेजें',Cancel:'रद्द करें',Modify:'संशोधित करें',Delete:'हटाएं','Log out':'लॉग आउट','Task title':'कार्य शीर्षक','Due date':'देय तिथि',Priority:'प्राथमिकता',Notes:'नोट्स','Opportunity name':'अवसर नाम',Company:'कंपनी','Deal value (₹)':'डील मूल्य (₹)',Stage:'चरण','Display name':'प्रदर्शित नाम','Workspace name':'कार्यस्थान नाम','Task reminders':'कार्य अनुस्मारक','User portal':'उपयोगकर्ता पोर्टल','My portal':'मेरा पोर्टल','My workspace':'मेरा कार्यस्थान','My profile':'मेरी प्रोफ़ाइल','My tasks':'मेरे कार्य','My opportunities':'मेरे अवसर','My customers':'मेरे ग्राहक','MY PROFILE':'मेरी प्रोफ़ाइल',Email:'ईमेल',Phone:'फोन',Department:'विभाग',Timezone:'समय क्षेत्र',EMAIL:'ईमेल',PHONE:'फोन',DEPARTMENT:'विभाग',TIMEZONE:'समय क्षेत्र','Not added':'नहीं जोड़ा गया','Your personal workspace details.':'आपके व्यक्तिगत कार्यस्थान का विवरण।','Follow-ups that are still pending.':'अभी लंबित फॉलो-अप।','Pending follow-ups':'लंबित फॉलो-अप','Read-only task view':'केवल देखने के लिए कार्य दृश्य','Current opportunities and their progress.':'वर्तमान अवसर और उनकी प्रगति।','Active opportunities':'सक्रिय अवसर','Read-only opportunity view':'केवल देखने के लिए अवसर दृश्य','Contacts saved in this workspace.':'इस कार्यस्थान में सहेजे गए संपर्क।','Customer records':'ग्राहक रिकॉर्ड','Read-only customer view':'केवल देखने के लिए ग्राहक दृश्य','Your saved CRM records and follow-ups in one place.':'आपके सहेजे गए CRM रिकॉर्ड और फॉलो-अप एक ही जगह।','Edit my profile':'मेरी प्रोफ़ाइल संपादित करें','MY CUSTOMERS':'मेरे ग्राहक','ACTIVE DEALS':'सक्रिय डील','PENDING TASKS':'लंबित कार्य','Saved in this browser':'इस ब्राउज़र में सहेजा गया','Open opportunities':'खुले अवसर','Follow-ups to complete':'पूरे होने वाले फॉलो-अप','My pending tasks':'मेरे लंबित कार्य','Tasks that still need attention':'ऐसे कार्य जिन पर ध्यान चाहिए','Manage tasks →':'कार्य प्रबंधित करें →','My active opportunities':'मेरे सक्रिय अवसर','Current deals in progress':'प्रगति में वर्तमान डील','Open pipeline →':'पाइपलाइन खोलें →','Manage customers →':'ग्राहक प्रबंधित करें →','No open tasks. Add a follow-up when you need one.':'कोई खुला कार्य नहीं है। जरूरत होने पर फॉलो-अप जोड़ें।','No open opportunities. Create one from Pipeline.':'कोई खुला अवसर नहीं है। पाइपलाइन से एक बनाएं।','No customers yet. Add your first customer.':'अभी कोई ग्राहक नहीं है। अपना पहला ग्राहक जोड़ें।','Add contact details in My profile':'मेरी प्रोफ़ाइल में संपर्क विवरण जोड़ें'
      },
      Telugu:{
        'CRM PLATFORM':'సిఆర్ఎమ్ వేదిక',WORKSPACE:'కార్యస్థలం','MY WORKSPACE':'నా కార్యస్థలం','ADMIN PORTAL':'నిర్వాహక పోర్టల్','USER PORTAL':'యూజర్ పోర్టల్',OVERVIEW:'అవలోకనం',RELATIONSHIPS:'సంబంధాలు',PERFORMANCE:'పనితీరు','SALES PIPELINE':'అమ్మకాల పైప్‌లైన్','FOLLOW-UPS':'ఫాలో-అప్‌లు',Overview:'అవలోకనం',Customers:'కస్టమర్లు',Pipeline:'పైప్‌లైన్',Tasks:'పనులు',Analytics:'విశ్లేషణలు',Settings:'సెట్టింగ్స్',User:'యూజర్','Administrator workspace':'నిర్వాహక కార్యస్థలం','Admin overview':'నిర్వాహక అవలోకనం','Live information from the records you manage.':'మీరు నిర్వహించే రికార్డుల ప్రత్యక్ష సమాచారం.','Customer relationships':'కస్టమర్ సంబంధాలు','Sales pipeline':'అమ్మకాల పైప్‌లైన్','Your follow-ups':'మీ ఫాలో-అప్‌లు','Performance overview':'పనితీరు అవలోకనం','Workspace settings':'కార్యస్థల సెట్టింగ్స్',
        'Add customer':'కస్టమర్ జోడించండి','Add task':'పని జోడించండి','New opportunity':'కొత్త అవకాశం','My profile':'నా ప్రొఫైల్',Administrator:'నిర్వాహకుడు',Language:'భాష',Theme:'థీమ్',Monsoon:'వర్షాకాలం',Ocean:'సముద్రం',Orchid:'ఆర్కిడ్',Search:'శోధన',Notifications:'నోటిఫికేషన్లు','Quick actions':'త్వరిత చర్యలు','Help and shortcuts':'సహాయం మరియు షార్ట్‌కట్‌లు','Toggle theme':'థీమ్ మార్చు',
        'Live information from the records you add.':'మీరు జోడించిన రికార్డుల ప్రత్యక్ష సమాచారం.','CUSTOMERS':'కస్టమర్లు','OPEN PIPELINE':'తెరిచిన పైప్‌లైన్','OPEN TASKS':'తెరిచిన పనులు','WIN RATE':'గెలుపు రేటు','Saved customer records':'సేవ్ చేసిన కస్టమర్ రికార్డులు','open opportunities':'తెరిచిన అవకాశాలు','Tasks waiting for completion':'పూర్తి కావాల్సిన పనులు','No closed deals yet':'ఇంకా ముగిసిన డీల్స్ లేవు','Revenue performance':'ఆదాయ పనితీరు','Deal value recorded over the last six months':'గత ఆరు నెలల్లో నమోదు చేసిన డీల్ విలువ','Priority follow-ups':'ప్రాధాన్యత ఫాలో-అప్‌లు','High-priority work comes first':'అధిక ప్రాధాన్యత పనులు ముందుగా ఉంటాయి','View tasks →':'పనులు చూడండి →','Pipeline by stage':'దశల వారీ పైప్‌లైన్','Actual opportunities in your workspace':'మీ కార్యస్థలంలోని వాస్తవ అవకాశాలు','View pipeline →':'పైప్‌లైన్ చూడండి →','Recent activity':'ఇటీవలి కార్యాచరణ','Changes made in this browser':'ఈ బ్రౌజర్‌లో చేసిన మార్పులు','Open opportunities':'తెరిచిన అవకాశాలు','Your active deals':'మీ సక్రియ డీల్స్','Upcoming follow-ups':'రాబోయే ఫాలో-అప్‌లు','Tasks that need attention':'శ్రద్ధ అవసరమైన పనులు',
        'New lead':'కొత్త లీడ్',Qualified:'అర్హత పొందిన',Proposal:'ప్రతిపాదన',Negotiation:'చర్చలు',Won:'గెలిచిన',Lost:'కోల్పోయిన',High:'అధిక','High priority':'అధిక ప్రాధాన్యత',Medium:'మధ్యస్థ',Low:'తక్కువ','No due date':'తేదీ లేదు','Due today':'ఈరోజు గడువు','Due tomorrow':'రేపు గడువు','Save task':'పని సేవ్ చేయండి','Save opportunity':'అవకాశం సేవ్ చేయండి','Save customer':'కస్టమర్ సేవ్ చేయండి','Save settings':'సెట్టింగ్స్ సేవ్ చేయండి',Cancel:'రద్దు చేయండి',Modify:'సవరించండి',Delete:'తొలగించండి','Log out':'లాగ్ అవుట్','Task title':'పని శీర్షిక','Due date':'గడువు తేదీ',Priority:'ప్రాధాన్యత',Notes:'గమనికలు','Opportunity name':'అవకాశం పేరు',Company:'కంపెనీ','Deal value (₹)':'డీల్ విలువ (₹)',Stage:'దశ','Display name':'ప్రదర్శన పేరు','Workspace name':'కార్యస్థల పేరు','Task reminders':'పని రిమైండర్లు','User portal':'యూజర్ పోర్టల్','My portal':'నా పోర్టల్','My workspace':'నా కార్యస్థలం','Your saved CRM records and follow-ups in one place.':'మీ సేవ్ చేసిన CRM రికార్డులు మరియు ఫాలో-అప్‌లు ఒకే చోట.','Edit my profile':'నా ప్రొఫైల్‌ను సవరించండి','MY CUSTOMERS':'నా కస్టమర్లు','ACTIVE DEALS':'సక్రియ డీల్స్','PENDING TASKS':'పెండింగ్ పనులు','Saved in this browser':'ఈ బ్రౌజర్‌లో సేవ్ చేయబడింది','Open opportunities':'తెరిచిన అవకాశాలు','Follow-ups to complete':'పూర్తి చేయాల్సిన ఫాలో-అప్‌లు','My pending tasks':'నా పెండింగ్ పనులు','Tasks that still need attention':'ఇంకా శ్రద్ధ అవసరమైన పనులు','Manage tasks →':'పనులను నిర్వహించండి →','My active opportunities':'నా సక్రియ అవకాశాలు','Current deals in progress':'ప్రస్తుతం కొనసాగుతున్న డీల్స్','Open pipeline →':'పైప్‌లైన్ తెరవండి →','My customers':'నా కస్టమర్లు','Manage customers →':'కస్టమర్లను నిర్వహించండి →','No open tasks. Add a follow-up when you need one.':'తెరిచిన పనులు లేవు. అవసరమైనప్పుడు ఫాలో-అప్ జోడించండి.','No open opportunities. Create one from Pipeline.':'తెరిచిన అవకాశాలు లేవు. పైప్‌లైన్ నుండి ఒకటి సృష్టించండి.','No customers yet. Add your first customer.':'ఇంకా కస్టమర్లు లేరు. మీ మొదటి కస్టమర్‌ను జోడించండి.','Add contact details in My profile':'నా ప్రొఫైల్‌లో సంప్రదింపు వివరాలను జోడించండి'
      }
    };
    const dict = dictionaries[language] || {};
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = []; let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(textNode => {
      const original = textNode.nodeValue; const key = original.trim();
      if (!key || !dict[key] || textNode.parentElement?.closest('script,style')) return;
      translatedOriginals.set(textNode, original); translatedTextNodes.add(textNode);
      textNode.nodeValue = original.replace(key, dict[key]);
    });
  }

  function startTour() {
    document.querySelector('#help-panel')?.setAttribute('hidden','');
    const steps = [
      ['Your workspace','Use the sidebar to move between customers, pipeline, tasks and analytics.'],
      ['Create records','Use Add customer, New opportunity, and Add task to add your own browser-local records.'],
      ['Manage records','Open a customer or task to modify it. Use the three-dot menu on a deal to modify or delete it.'],
      ['Stay organised','Use search, notifications, dashboard widgets, sorting and export tools to work faster.']
    ];
    let step = 0; const tour = document.createElement('div'); tour.className = 'command-palette'; tour.id = 'product-tour'; document.body.append(tour);
    const draw = () => { const current = steps[step]; tour.innerHTML = '<div class="command-dialog tour-dialog" role="dialog" aria-modal="true"><p class="section-kicker">QUICK TOUR · ' + (step + 1) + ' / ' + steps.length + '</p><h3>' + current[0] + '</h3><p>' + current[1] + '</p><div class="form-actions"><button type="button" class="secondary" data-tour-close>Skip</button><button type="button" class="primary" data-tour-next>' + (step === steps.length - 1 ? 'Finish' : 'Next') + '</button></div></div>'; tour.querySelector('[data-tour-close]').onclick = () => tour.remove(); tour.querySelector('[data-tour-next]').onclick = () => { if (step === steps.length - 1) { tour.remove(); updateUI({ tourSeen:true }); notify('Tour completed'); } else { step += 1; draw(); } }; }; draw();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (page === 'login.html') { bindLogin(); initLoginEnhancements(); return; }
    syncPreviewRun().finally(() => {
      state.authenticated = sessionStorage.getItem(AUTH_KEY) === '1';
      if (!state.authenticated) { location.replace('login.html'); return; }
      const expectedRole = userPages.has(page) ? 'user' : 'admin';
      if (accessRole() !== expectedRole) { sessionStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(AUTH_ROLE_KEY); sessionStorage.removeItem(ACCOUNT_KEY); location.replace('login.html'); return; }
      bindShell(); bindCustomers(); bindTaskForm(); bindOpportunityForm(); bindRecordManagement(); bindSettings(); initFrontendEnhancements(); render();
    });
  });
})();
