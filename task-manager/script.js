const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task');
const prioritySelect = document.getElementById('priority-select');
const dateInput = document.getElementById('task-date');
const timeInput = document.getElementById('task-time');
const alertSound = document.getElementById('alert-sound');
const clearCompletedBtn = document.getElementById('clear-completed');
const sortSelect = document.getElementById('sort-select');
const darkModeBtn = document.getElementById('toggle-dark-mode');

let audioUnlocked = false;
let draggedItem = null;

// Unlock audio
document.body.addEventListener('click', () => {
  if (!audioUnlocked && alertSound) {
    alertSound.play().then(() => {
      alertSound.pause();
      alertSound.currentTime = 0;
      audioUnlocked = true;
    }).catch(()=>{});
  }
}, { once: true });

// Dark mode toggle
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});

// Add task
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

// Edit on double click
taskList.addEventListener('dblclick', (e) => {
  if(e.target.classList.contains('task-text')) {
    const li = e.target.closest('li');
    const newText = prompt('Edit task:', e.target.textContent);
    if(newText !== null) { e.target.textContent = newText; saveTasks(); }
  }
});

// Toggle complete
taskList.addEventListener('click', (e)=>{
  const li = e.target.closest('li');
  if(li && e.target.classList.contains('task-text')){
    li.classList.toggle('completed'); saveTasks();
  }
});

// Clear completed
clearCompletedBtn.addEventListener('click', () => {
  document.querySelectorAll('#task-list li.completed').forEach(li => li.remove());
  saveTasks();
});

// Sort tasks
sortSelect.addEventListener('change', () => {
  const arr = [...taskList.children];
  if(sortSelect.value==='date'){
    arr.sort((a,b)=> new Date(a.dataset.datetime)-new Date(b.dataset.datetime));
  } else if(sortSelect.value==='priority'){
    const pValue = el => el.dataset.priority==='high'?3:el.dataset.priority==='medium'?2:1;
    arr.sort((a,b)=> pValue(b)-pValue(a));
  }
  arr.forEach(li => taskList.appendChild(li));
  saveTasks();
});

// Create task element
function createTaskElement(text, priority='medium', datetime=''){
  const li = document.createElement('li');
  li.dataset.priority = priority;
  li.dataset.datetime = datetime;
  li.draggable = true;

  const topRow = document.createElement('div');
  topRow.classList.add('task-top');

  const taskText = document.createElement('span');
  taskText.textContent = text;
  taskText.classList.add('task-text');

  const badge = document.createElement('span');
  badge.className = `badge ${priority}`;
  badge.textContent = priority==='high'?'High':priority==='medium'?'Medium':'Low';

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent='🗑️';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.addEventListener('click', ()=>{ li.remove(); saveTasks(); });

  topRow.append(taskText, badge, deleteBtn);

  const countdownSpan = document.createElement('span');
  countdownSpan.classList.add('countdown');

  li.append(topRow, countdownSpan);

  li.addEventListener('dragstart', handleDragStart);
  li.addEventListener('dragover', handleDragOver);
  li.addEventListener('drop', handleDrop);
  li.addEventListener('dragend', handleDragEnd);
  li.addEventListener('dragenter', ()=> li.classList.add('drag-over'));
  li.addEventListener('dragleave', ()=> li.classList.remove('drag-over'));

  return li;
}

// Drag & drop
function handleDragStart(){ draggedItem=this; this.classList.add('dragging'); }
function handleDragOver(e){ e.preventDefault(); }
function handleDrop(e){
  e.preventDefault();
  if(this!==draggedItem){
    const list=this.parentNode;
    const draggedIndex=[...list.children].indexOf(draggedItem);
    const targetIndex=[...list.children].indexOf(this);
    if(draggedIndex<targetIndex) list.insertBefore(draggedItem,this.nextSibling);
    else list.insertBefore(draggedItem,this);
  }
}
function handleDragEnd(){ this.classList.remove('dragging'); saveTasks(); }

// Save/Load tasks
function saveTasks(){
  const tasks = [...taskList.children].map(li=>{
    const text = li.querySelector('.task-text').textContent;
    const priority = li.dataset.priority;
    const completed = li.classList.contains('completed');
    const datetime = li.dataset.datetime;
    return {text,priority,completed,datetime};
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks(){
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(t=>{
    const li = createTaskElement(t.text, t.priority, t.datetime);
    if(t.completed) li.classList.add('completed');
    taskList.appendChild(li);
  });
}

// Countdown & Notifications
function updateCountdowns(){
  const now = new Date();
  document.querySelectorAll('#task-list li').forEach(li=>{
    const datetime = li.dataset.datetime;
    const countdown = li.querySelector('.countdown');
    if(!datetime) return;
    const diff = new Date(datetime) - now;
    if(diff<=0){ countdown.textContent='⏰ Time’s up!'; return; }
    const days = Math.floor(diff/(1000*60*60*24));
    const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
    const minutes = Math.floor((diff%(1000*60*60))/(1000*60));
    const seconds = Math.floor((diff%(1000*60))/1000);
    countdown.textContent = days>0?`⏳ ${days}d ${hours}h ${minutes}m`:`⏳ ${hours}h ${minutes}m ${seconds}s`;
  });
}

function showNotification(taskText){
  if(Notification.permission==='granted'){
    new Notification('Task Reminder',{body:`It's time for: ${taskText}`,icon:'🕒'});
    if(audioUnlocked && alertSound) alertSound.play().catch(()=>{});
  }
}

function checkNotifications(){
  const now = new Date();
  document.querySelectorAll('#task-list li').forEach(li=>{
    const datetime = li.dataset.datetime;
    if(!datetime) return;
    const diff = new Date(datetime)-now;
    const taskText = li.querySelector('.task-text').textContent;
    if(diff<=0 && !li.classList.contains('notified')){
      showNotification(taskText);
      li.classList.add('notified');
    }
  });
}

if(Notification.permission!=='granted') Notification.requestPermission();

setInterval(updateCountdowns,1000);
setInterval(checkNotifications,30000);
window.addEventListener('load', loadTasks);
const todayBtn = document.getElementById('today-tasks');
const cancelBtn = document.getElementById('cancel-filter');

// Show today's tasks
todayBtn.addEventListener('click', () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // yyyy-mm-dd
  document.querySelectorAll('#task-list li').forEach(li => {
    li.style.display = li.dataset.datetime.startsWith(today) ? 'flex' : 'none';
  });
  todayBtn.style.display = 'none';
  cancelBtn.style.display = 'inline-block';
});

// Cancel filter and show all tasks
cancelBtn.addEventListener('click', () => {
  document.querySelectorAll('#task-list li').forEach(li => li.style.display = 'flex');
  todayBtn.style.display = 'inline-block';
  cancelBtn.style.display = 'none';
});
