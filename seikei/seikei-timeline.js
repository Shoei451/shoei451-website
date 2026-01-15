// ===== Supabase Configuration =====
const SUPABASE_URL = 'https://gjuqsyaugrsshmjerhme.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXFzeWF1Z3Jzc2htamVyaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzA3NTYsImV4cCI6MjA4MjA0Njc1Nn0.V8q5ddz5tPy7wBaQ73aGtmCZyqzA6pPciPRwRIZjJcs';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== State Management =====
let allEvents = [];
let filteredEvents = [];
let currentCategory = 'all';
let searchQuery = '';
let editingEventId = null;

// ===== DOM Elements =====
const loadingIndicator = document.getElementById('loadingIndicator');
const timelineTable = document.getElementById('timelineTable');
const timelineBody = document.getElementById('timelineBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categoryTabs = document.querySelectorAll('.category-tab');
const addEventBtn = document.getElementById('addEventBtn');
const eventModal = document.getElementById('eventModal');
const eventForm = document.getElementById('eventForm');
const modalTitle = document.getElementById('modalTitle');

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  loadEvents();
  setupEventListeners();
});

// ===== Event Listeners =====
function setupEventListeners() {
  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    filterAndRenderEvents();
  });

  // Category tabs
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      filterAndRenderEvents();
    });
  });

  // Add event button
  addEventBtn.addEventListener('click', () => {
    openModal();
  });

  // Form submission
  eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEvent();
  });

  // Close modal on background click
  eventModal.addEventListener('click', (e) => {
    if (e.target === eventModal) {
      closeModal();
    }
  });
}

// ===== Load Events from Supabase =====
async function loadEvents() {
  try {
    loadingIndicator.style.display = 'block';
    timelineTable.style.display = 'none';
    emptyState.style.display = 'none';

    const { data, error } = await supabase
      .from('politics_economics_events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) throw error;

    allEvents = data || [];
    filterAndRenderEvents();

  } catch (error) {
    console.error('イベント読み込みエラー:', error);
    alert('データの読み込みに失敗しました: ' + error.message);
  } finally {
    loadingIndicator.style.display = 'none';
  }
}

// ===== Filter and Render Events =====
function filterAndRenderEvents() {
  // Filter by category
  filteredEvents = currentCategory === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.category === currentCategory);

  // Filter by search query
  if (searchQuery) {
    filteredEvents = filteredEvents.filter(event => 
      event.title.toLowerCase().includes(searchQuery) ||
      (event.description && event.description.toLowerCase().includes(searchQuery))
    );
  }

  renderEvents();
}

// ===== Render Events to Table =====
function renderEvents() {
  if (filteredEvents.length === 0) {
    timelineTable.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  timelineTable.style.display = 'table';
  emptyState.style.display = 'none';

  timelineBody.innerHTML = filteredEvents.map(event => `
    <tr>
      <td class="col-date">${formatDate(event.event_date)}</td>
      <td class="col-title">${escapeHtml(event.title)}</td>
      <td class="col-category">
        <span class="category-badge category-${event.category}">
          ${event.category}
        </span>
      </td>
      <td class="col-description">${escapeHtml(event.description || '')}</td>
      <td class="col-actions">
        <button class="action-btn btn-edit" onclick="editEvent('${event.id}')">
          編集
        </button>
        <button class="action-btn btn-delete" onclick="deleteEvent('${event.id}')">
          削除
        </button>
      </td>
    </tr>
  `).join('');
}

// ===== Modal Functions =====
function openModal(eventId = null) {
  editingEventId = eventId;

  if (eventId) {
    // Edit mode
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    modalTitle.textContent = 'イベントを編集';
    document.getElementById('eventDate').value = event.event_date;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventCategory').value = event.category;
    document.getElementById('eventDescription').value = event.description || '';
  } else {
    // Add mode
    modalTitle.textContent = 'イベントを追加';
    eventForm.reset();
  }

  eventModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  eventModal.classList.remove('show');
  document.body.style.overflow = '';
  eventForm.reset();
  editingEventId = null;
}

// ===== Save Event =====
async function saveEvent() {
  const eventData = {
    event_date: document.getElementById('eventDate').value,
    title: document.getElementById('eventTitle').value,
    category: document.getElementById('eventCategory').value,
    description: document.getElementById('eventDescription').value || null
  };

  try {
    if (editingEventId) {
      // Update existing event
      const { error } = await supabase
        .from('politics_economics_events')
        .update(eventData)
        .eq('id', editingEventId);

      if (error) throw error;
      
      alert('イベントを更新しました！');
    } else {
      // Create new event
      const { error } = await supabase
        .from('politics_economics_events')
        .insert([eventData]);

      if (error) throw error;
      
      alert('イベントを追加しました！');
    }

    closeModal();
    loadEvents();

  } catch (error) {
    console.error('保存エラー:', error);
    alert('保存に失敗しました: ' + error.message);
  }
}

// ===== Edit Event =====
function editEvent(eventId) {
  openModal(eventId);
}

// ===== Delete Event =====
async function deleteEvent(eventId) {
  const event = allEvents.find(e => e.id === eventId);
  if (!event) return;

  if (!confirm(`「${event.title}」を削除してもよろしいですか？`)) {
    return;
  }

  try {
    const { error } = await supabase
      .from('politics_economics_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;

    alert('イベントを削除しました');
    loadEvents();

  } catch (error) {
    console.error('削除エラー:', error);
    alert('削除に失敗しました: ' + error.message);
  }
}

// ===== Utility Functions =====
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e) => {
  // Escape key to close modal
  if (e.key === 'Escape' && eventModal.classList.contains('show')) {
    closeModal();
  }
});