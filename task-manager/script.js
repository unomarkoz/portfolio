const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task');
const prioritySelect = document.getElementById('priority-select');
const dateInput = document.getElementById('task-date');
const timeInput = document.getElementById('task-time');
const alertSound = document.getElementById('alert-sound');

let audioUnlocked = false;

document.body.addEventListener('click', () => {
  if (!audioUnlocked && alertSound) {
    alertSound.play().then(() => {
      alertSound.pause();
      alertSound.currentTime = 0;
      audioUnlocked = true;
    }).catch(() => {});
  }
}, { once: true });

addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const date = dateInput.value;
  const time = timeInput.value;

  if (!text || !date || !time) return;

  const datetime = `${date}T${time}`;
  const li = createTaskElement(text, priority, datetime);
  taskList.appendChild(li);
  taskInput.value = '';
  dateInput.value = '';
  timeInput.value = '';
  saveTasks();
});

taskList.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    e.target.classList.toggle('completed');
    saveTasks();
  }
});

function createTaskElement(text, priority = 'medium', datetime = '') {
  const li = document.createElement('li');
  li.classList.add(priority);
  li.draggable = true;
  li.dataset.datetime = datetime;

  const starSpan = document.createElement('span');
  starSpan.textContent = priority === 'high' ? '⭐️⭐️⭐️' :
                         priority === 'medium' ? '⭐️⭐️' : '⭐️';

  const taskText = document.createElement('span');
  taskText.textContent = text;

  const dateTimeSpan = document.createElement('span');
  if (datetime) {
    const dt = new Date(datetime);
    dateTimeSpan.textContent = ` ⏰ ${dt.toLocaleString()}`;
  }

  const countdownSpan = document.createElement('span');
  countdownSpan.classList.add('countdown');

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️';
  deleteBtn.addEventListener('click', () => {
    li.remove();
    saveTasks();
  });

  li.append(starSpan, taskText, dateTimeSpan, countdownSpan, deleteBtn);

  li.addEventListener('dragstart', handleDragStart);
  li.addEventListener('dragover', handleDragOver);
  li.addEventListener('drop', handleDrop);
  li.addEventListener('dragend', handleDragEnd);
  li.addEventListener('dragenter', () => li.classList.add('drag-over'));
  li.addEventListener('dragleave', () => li.classList.remove('drag-over'));

  return li;
}

let draggedItem = null;

function handleDragStart() {
  draggedItem = this;
  this.classList.add('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  if (this !== draggedItem) {
    const list = this.parentNode;
    const draggedIndex = [...list.children].indexOf(draggedItem);
    const targetIndex = [...list.children].indexOf(this);

    if (draggedIndex < targetIndex) {
      list.insertBefore(draggedItem, this.nextSibling);
    } else {
      list.insertBefore(draggedItem, this);
    }
  }
}

function handleDragEnd() {
  this.classList.remove('dragging');
  saveTasks();
}

function saveTasks() {
  const tasks = [...document.querySelectorAll('#task-list li')].map(li => {
    const text = li.querySelector('span:nth-child(2)').textContent;
    const priority = li.classList.contains('high') ? 'high' :
                     li.classList.contains('low') ? 'low' : 'medium';
    const completed = li.classList.contains('completed');
    const datetime = li.dataset.datetime || '';
    return { text, priority, completed, datetime };
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(task => {
    const li = createTaskElement(task.text, task.priority, task.datetime);
    if (task.completed) li.classList.add('completed');
    taskList.appendChild(li);
  });
}

function showNotification(taskText) {
  if (Notification.permission === 'granted') {
    new Notification('Task Reminder', {
      body: `It's time for: ${taskText}`,
      icon: '🕒'
    });

    if (audioUnlocked && alertSound) {
      alertSound.play().catch(err => {
        console.warn('Sound playback failed:', err);
      });
    }
  }
}

function checkNotifications() {
  const now = new Date();
  document.querySelectorAll('#task-list li').forEach(li => {
    const datetime = li.dataset.datetime;
    if (!datetime) return;

    const taskTime = new Date(datetime);
    const diff = taskTime - now;
    const taskText = li.querySelector('span:nth-child(2)').textContent;

    if (diff <= 0 && !li.classList.contains('notified')) {
      showNotification(taskText);
      li.classList.add('notified');
      li.querySelector('.countdown').textContent = '⏰ Time’s up!';
      li.style.backgroundColor = '#ffdddd';
      setTimeout(() => {
        li.style.backgroundColor = '';
      }, 2000);
    }
  });
}

function updateCountdowns() {
  const now = new Date();
  document.querySelectorAll('#task-list li').forEach(li => {
    const datetime = li.dataset.datetime;
    const countdownSpan = li.querySelector('.countdown');
    if (!datetime || !countdownSpan) return;

    const taskTime = new Date(datetime);
    const diff = taskTime - now;

    if (diff <= 0) {
      countdownSpan.textContent = '⏰ Time’s up!';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdownSpan.textContent = days > 0
      ? `⏳ ${days}d ${hours}h ${minutes}m`
      : `⏳ ${hours}h ${minutes}m ${seconds}s`;
  });
}

if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

setInterval(updateCountdowns, 1000);
setInterval(checkNotifications, 30000);
window.addEventListener('load', loadTasks);
