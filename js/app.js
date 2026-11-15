/* StudyFlow task manager: JavaScript demonstrates DOM manipulation,
 * events, form validation, filtering, dates, statistics and localStorage.
 * No personal data is sent to a server. */
(() => {
  const STORAGE_KEY = 'studyflow_tasks_v1';
  const form = document.querySelector('#task-form');
  if (!form) return; // The task manager only runs on the dashboard.

  const list = document.querySelector('#task-list');
  const search = document.querySelector('#task-search');
  const filters = document.querySelectorAll('[data-filter]');
  const titleInput = document.querySelector('#task-title');
  const categoryInput = document.querySelector('#task-category');
  const dateInput = document.querySelector('#task-date');
  const toast = document.querySelector('#toast');
  const tipText = document.querySelector('#study-tip');
  const tips = [
    'Break big assignments into smaller tasks. Start with the first step.',
    'Try 25 minutes of focused study, followed by a short break.',
    'Review new material on the same day to help it stick.',
    'Put the most important task first while your mind is fresh.',
    'A tidy workspace can make it easier to begin.'
  ];
  let tipIndex = 0;
  let activeFilter = 'all';
  let toastTimeout;

  function dateAsISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function relativeDate(days) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return dateAsISO(date);
  }

  function exampleTasks() {
    return [
      { id: 'demo-1', title: 'Submit web development lab', category: 'Assignment', due: relativeDate(2), completed: false },
      { id: 'demo-2', title: 'Review JavaScript functions', category: 'Revision', due: relativeDate(3), completed: false },
      { id: 'demo-3', title: 'Organise project files', category: 'Project', due: relativeDate(1), completed: true },
      { id: 'demo-4', title: 'Read notes for next class', category: 'Personal', due: relativeDate(5), completed: false }
    ];
  }

  function readTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return exampleTasks();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return exampleTasks();
      return parsed.filter((task) => task && typeof task.id === 'string' && typeof task.title === 'string' && typeof task.due === 'string' && typeof task.completed === 'boolean' && ['Assignment', 'Revision', 'Project', 'Personal'].includes(task.category));
    } catch { return exampleTasks(); }
  }

  let tasks = readTasks();

  function saveTasks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch { announce('Storage is unavailable. Changes may not remain after you close the page.'); }
  }

  function announce(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  function formatDueDate(value) {
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function updateStats() {
    const total = tasks.length;
    const done = tasks.filter((task) => task.completed).length;
    const open = total - done;
    const percent = total ? Math.round(done / total * 100) : 0;

    document.querySelector('#stat-total').textContent = total;
    document.querySelector('#stat-done').textContent = done;
    document.querySelector('#stat-open').textContent = open;
    document.querySelector('#all-count').textContent = total;
    document.querySelector('#progress-percent').textContent = `${percent}%`;

    const ring = document.querySelector('#progress-ring');
    ring.style.setProperty('--progress', percent);
    ring.setAttribute('aria-label', `${percent} percent of tasks complete`);
    document.querySelector('#progress-caption').textContent = total === 0
      ? 'Add your first task to begin.'
      : open === 0 ? 'Amazing work - everything is complete!'
      : `${open} task${open === 1 ? '' : 's'} left. You can do this!`;
  }

  function makeTaskElement(task) {
    const row = document.createElement('div');
    row.className = `task-item${task.completed ? ' is-complete' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.title} as ${task.completed ? 'not completed' : 'completed'}`);
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      render();
      announce(task.completed ? 'Nice work! Task completed.' : 'Task moved back to your to-do list.');
    });

    const detail = document.createElement('div');
    detail.className = 'task-detail';
    const name = document.createElement('span');
    name.className = 'task-name';
    name.textContent = task.title; // textContent prevents HTML injection.

    const meta = document.createElement('div');
    meta.className = 'task-meta';
    const tag = document.createElement('span');
    tag.className = `task-tag ${task.category.toLowerCase()}`;
    tag.textContent = task.category;
    const due = document.createElement('span');
    const overdue = !task.completed && task.due < dateAsISO(new Date());
    due.className = overdue ? 'due-late' : '';
    due.textContent = `${overdue ? 'Overdue · ' : 'Due · '}${formatDueDate(task.due)}`;
    meta.append(tag, due);
    detail.append(name, meta);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-task';
    remove.textContent = '×';
    remove.title = 'Delete task';
    remove.setAttribute('aria-label', `Delete ${task.title}`);
    remove.addEventListener('click', () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      render();
      announce('Task removed.');
    });

    row.append(checkbox, detail, remove);
    return row;
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const visibleTasks = tasks
      .filter((task) => activeFilter === 'all' || (activeFilter === 'completed' ? task.completed : !task.completed))
      .filter((task) => `${task.title} ${task.category}`.toLowerCase().includes(query))
      .sort((a, b) => Number(a.completed) - Number(b.completed) || a.due.localeCompare(b.due));

    list.replaceChildren();
    if (visibleTasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const symbol = document.createElement('span');
      symbol.className = 'empty-symbol';
      symbol.textContent = '✳';
      const title = document.createElement('strong');
      title.textContent = tasks.length ? 'Nothing matches just yet.' : 'Your planner is ready.';
      const message = document.createElement('p');
      message.textContent = tasks.length ? 'Try a different filter or search.' : 'Add a task above to start planning.';
      empty.append(symbol, title, message);
      list.append(empty);
    } else {
      visibleTasks.forEach((task) => list.append(makeTaskElement(task)));
    }
    updateStats();
  }

  // Form submission: validate input, create a task object, save and update DOM.
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    if (title.length < 3 || title.length > 90) {
      titleInput.setCustomValidity('Enter a task title between 3 and 90 characters.');
      titleInput.reportValidity();
      return;
    }
    if (!dateInput.value) { dateInput.reportValidity(); return; }
    const id = globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    tasks.unshift({ id, title, category: categoryInput.value, due: dateInput.value, completed: false });
    saveTasks();
    form.reset();
    dateInput.value = relativeDate(1);
    activeFilter = 'all';
    filters.forEach((button) => {
      const selected = button.dataset.filter === 'all';
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    search.value = '';
    render();
    announce('Your task has been added.');
    titleInput.focus();
  });

  titleInput.addEventListener('input', () => titleInput.setCustomValidity(''));
  filters.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filters.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    render();
  }));
  search.addEventListener('input', render);

  document.querySelector('#reset-demo').addEventListener('click', () => {
    if (!window.confirm('Replace your current tasks with the four example tasks?')) return;
    tasks = exampleTasks();
    activeFilter = 'all';
    search.value = '';
    filters.forEach((button) => {
      const selected = button.dataset.filter === 'all';
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    saveTasks();
    render();
    announce('Example tasks restored.');
  });

  document.querySelector('#new-tip').addEventListener('click', () => {
    tipIndex = (tipIndex + 1) % tips.length;
    tipText.textContent = tips[tipIndex];
  });

  document.querySelector('#today-label').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  dateInput.value = relativeDate(1);
  render();
})();
