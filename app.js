const STORAGE_KEY = 'small-steps-tasks';
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const empty = document.querySelector('#empty-state');
const filters = document.querySelectorAll('.filter');
let filter = 'all';
let tasks = [];
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (Array.isArray(saved)) tasks = saved.filter(task => task && typeof task.text === 'string' && typeof task.done === 'boolean');
} catch (_) { /* Start fresh if stored data is unavailable or invalid. */ }

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (_) { /* The list still works for this session. */ }
}
function render() {
  list.replaceChildren();
  const visible = tasks.filter(task => filter === 'all' || (filter === 'completed' ? task.done : !task.done));
  visible.forEach(task => {
    const item = document.createElement('li');
    item.className = `task${task.done ? ' done' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Mark ${task.text} ${task.done ? 'not done' : 'done'}`);
    checkbox.addEventListener('change', () => { task.done = checkbox.checked; save(); render(); });
    const label = document.createElement('label');
    label.textContent = task.text;
    label.addEventListener('click', () => checkbox.click());
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Delete ${task.text}`);
    remove.addEventListener('click', () => { tasks = tasks.filter(t => t !== task); save(); render(); });
    item.append(checkbox, label, remove);
    list.append(item);
  });
  const completed = tasks.filter(task => task.done).length;
  document.querySelector('#total-count').textContent = tasks.length;
  document.querySelector('#filter-count').textContent = tasks.length;
  document.querySelector('#clear-completed').hidden = completed === 0;
  document.querySelector('#progress-text').textContent = tasks.length ? `${completed} of ${tasks.length} completed` : 'A fresh start awaits';
  empty.hidden = visible.length > 0;
  if (!visible.length) {
    empty.querySelector('p').textContent = tasks.length ? (filter === 'completed' ? 'No completed tasks yet.' : 'All caught up.') : 'Nothing on the list yet.';
    empty.querySelector('span').textContent = tasks.length ? (filter === 'completed' ? 'Little wins will show up here.' : 'Enjoy the breathing room.') : 'Start small. Add your first task above.';
  }
  filters.forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ text, done: false });
  input.value = '';
  filter = 'all';
  save();
  render();
  input.focus();
});
filters.forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; render(); }));
document.querySelector('#clear-completed').addEventListener('click', () => { tasks = tasks.filter(task => !task.done); save(); render(); });
document.querySelector('#today').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date());
render();
