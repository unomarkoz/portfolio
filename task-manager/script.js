const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task');

addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  const priority = document.getElementById('priority-select').value;
  const date = document.getElementById('task-date').value;
  const time = document.getElementById('task-time').value;

  if (!text) return;

  const datetime = date && time ? `${date}T${time}` : '';
  const li = createTaskElement(text, priority, datetime);
  taskList.appendChild(li);
  taskInput.value = '';
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

  // Priority stars
  const starSpan = document.createElement('span');
  starSpan.textContent = priority === 'high' ? '⭐️⭐️⭐️' :
                         priority === 'medium' ? '⭐️⭐️' : '⭐️';

  // Task text
  const taskText = document.createElement('span');
  taskText.textContent = text;

  // Date/time display
  const dateTimeSpan = document.createElement('span');
  if (datetime) {
    const dt = new Date(datetime);
    dateTimeSpan.textContent = ` ⏰ ${dt.toLocaleString()}`;
  }

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️';
  deleteBtn.addEventListener('click', () => {
    li.remove();
    saveTasks();
  });

  // Assemble
  li.appendChild(starSpan);
  li.appendChild(taskText);
  li.appendChild(dateTimeSpan);
  // Countdown display
const countdownSpan = document.createElement('span');
countdownSpan.classList.add('countdown');
li.appendChild(countdownSpan);

  li.appendChild(deleteBtn);

  // Drag events
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
    const draggedIndex = Array.from(list.children).indexOf(draggedItem);
    const targetIndex = Array.from(list.children).indexOf(this);

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
  const tasks = [];
  document.querySelectorAll('#task-list li').forEach(li => {
    const text = li.querySelector('span:nth-child(2)').textContent;
    const priority = li.classList.contains('high') ? 'high' :
                     li.classList.contains('low') ? 'low' : 'medium';
    const completed = li.classList.contains('completed');
    const datetime = li.dataset.datetime || '';
    tasks.push({ text, priority, completed, datetime });
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

    // Play sound
    const sound = document.getElementById('alert-sound');
    if (sound) {
      sound.play().catch(err => {
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


if (Notification.permission !== 'granted') {
  Notification.requestPermission();
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

    if (days > 0) {
      countdownSpan.textContent = `⏳ ${days}d ${hours}h ${minutes}m`;
    } else {
      countdownSpan.textContent = `⏳ ${hours}h ${minutes}m ${seconds}s`;
    }
  });
}

setInterval(updateCountdowns, 1000);


//setInterval(checkNotifications, 30000); // Check every 30 seconds
window.addEventListener('load', loadTasks);
