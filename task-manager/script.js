const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task');
const prioritySelect = document.getElementById('priority-select');
const dateInput = document.getElementById('task-date');
const timeInput = document.getElementById('task-time');
const clearCompletedBtn = document.getElementById('clear-completed');
const sortSelect = document.getElementById('sort-select');
const darkModeBtn = document.getElementById('toggle-dark-mode');
const todayBtn = document.getElementById('today-tasks');
const cancelBtn = document.getElementById('cancel-filter');

let draggedItem = null;

// Dark mode toggle
darkModeBtn.addEventListener('click', ()=>{
  document.body.classList.toggle('light-mode');
  darkModeBtn.textContent = document.body.classList.contains('light-mode') ? '🌙':'☀️';
});

// Add task
addTaskBtn.addEventListener('click', ()=>{
  const text=taskInput.value.trim();
  const priority=prioritySelect.value;
  const date=dateInput.value;
  const time=timeInput.value;
  if(!text||!date||!time) return;
  const datetime=`${date}T${time}`;
  const li=createTaskElement(text,priority,datetime);
  taskList.appendChild(li);
  taskInput.value='';
  dateInput.value='';
  timeInput.value='';
  prioritySelect.value = ""; // <-- Reset to "Priority"
  saveTasks();
});

// Toggle complete state for a task
function toggleTaskCompleted(li) {
  li.classList.toggle('completed');
  saveTasks();
}

// Edit task on double-click
taskList.addEventListener('dblclick',(e)=>{
  if(e.target.classList.contains('task-text')){
    const li=e.target.closest('li');
    const newText=prompt('Edit task:',e.target.textContent);
    if(newText!==null){ e.target.textContent=newText; saveTasks(); }
  }
});

// Clear completed
clearCompletedBtn.addEventListener('click', ()=>{
  document.querySelectorAll('#task-list li.completed').forEach(li=>li.remove());
  saveTasks();
});

// Sort tasks
sortSelect.addEventListener('change',()=>{
  const arr=[...taskList.children];
  if(sortSelect.value==='date'){ arr.sort((a,b)=> new Date(a.dataset.datetime)-new Date(b.dataset.datetime)); }
  else if(sortSelect.value==='priority'){
    const pVal=el=>el.dataset.priority==='high'?3:el.dataset.priority==='medium'?2:1;
    arr.sort((a,b)=> pVal(b)-pVal(a));
  }
  arr.forEach(li=>taskList.appendChild(li)); saveTasks();
});

// Today filter
todayBtn.addEventListener('click',()=>{
  const today=new Date().toISOString().split('T')[0];
  document.querySelectorAll('#task-list li').forEach(li=>{
    li.style.display = li.dataset.datetime.startsWith(today)?'flex':'none';
  });
  todayBtn.style.display='none'; cancelBtn.style.display='inline-block';
});

// Cancel filter
cancelBtn.addEventListener('click',()=>{
  document.querySelectorAll('#task-list li').forEach(li=>li.style.display='flex');
  todayBtn.style.display='inline-block'; cancelBtn.style.display='none';
});

// Create task element
function createTaskElement(text,priority='medium',datetime=''){
  const li=document.createElement('li');
  li.dataset.priority=priority; li.dataset.datetime=datetime; li.draggable=true;

  const topRow=document.createElement('div'); topRow.classList.add('task-top');
  const taskText=document.createElement('span'); taskText.textContent=text; taskText.classList.add('task-text');
  const badge=document.createElement('span'); badge.className=`badge ${priority}`;
  badge.textContent=priority==='high'?'High':priority==='medium'?'Medium':'Low';
  const deleteBtn=document.createElement('button'); deleteBtn.textContent='🗑️'; deleteBtn.classList.add('delete-btn');
  deleteBtn.addEventListener('click',()=>{ li.remove(); saveTasks(); });
  topRow.append(taskText,badge,deleteBtn);

  const bottomRow=document.createElement('div'); bottomRow.classList.add('task-bottom');
  const countdownSpan=document.createElement('span'); countdownSpan.classList.add('countdown');
  const dateTimeSpan=document.createElement('span'); dateTimeSpan.classList.add('task-datetime');
  dateTimeSpan.textContent=datetime?`⏰ ${new Date(datetime).toLocaleString()}`:'';
  bottomRow.append(countdownSpan,dateTimeSpan);

  li.append(topRow,bottomRow);

  li.addEventListener('dragstart',handleDragStart);
  li.addEventListener('dragover',handleDragOver);
  li.addEventListener('drop',handleDrop);
  li.addEventListener('dragend',handleDragEnd);
  li.addEventListener('dragenter',()=>li.classList.add('drag-over'));
  li.addEventListener('dragleave',()=>li.classList.remove('drag-over'));

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

// Save/load
function saveTasks(){
  const tasks=[...taskList.children].map(li=>{
    return {
      text: li.querySelector('.task-text').textContent,
      priority: li.dataset.priority,
      completed: li.classList.contains('completed'),
      datetime: li.dataset.datetime
    };
  });
  localStorage.setItem('tasks',JSON.stringify(tasks));
}

function loadTasks(){
  const tasks=JSON.parse(localStorage.getItem('tasks'))||[];
  tasks.forEach(t=>{
    const li=createTaskElement(t.text,t.priority,t.datetime);
    if(t.completed) li.classList.add('completed');
    taskList.appendChild(li);
  });
}

// Countdown & notifications
function updateCountdowns(){
  const now=new Date();
  document.querySelectorAll('#task-list li').forEach(li=>{
    const datetime=li.dataset.datetime;
    const countdown=li.querySelector('.countdown');
    if(!datetime) return;
    const diff=new Date(datetime)-now;
    if(diff<=0){ countdown.textContent='⏰ Time’s up!'; return; }
    const days=Math.floor(diff/(1000*60*60*24));
    const hours=Math.floor((diff%(1000*60*60*24))/(1000*60*60));
    const minutes=Math.floor((diff%(1000*60*60))/(1000*60));
    const seconds=Math.floor((diff%(1000*60))/1000);
    countdown.textContent=days>0?`⏳ ${days}d ${hours}h ${minutes}m`:`⏳ ${hours}h ${minutes}m ${seconds}s`;
  });
}

function showNotification(taskText){
  if(Notification.permission==='granted'){
    new Notification('Task Reminder',{body:`It's time for: ${taskText}`,icon:'🕒'});
  }
}

function checkNotifications(){
  const now=new Date();
  document.querySelectorAll('#task-list li').forEach(li=>{
    const datetime=li.dataset.datetime;
    if(!datetime) return;
    const diff=new Date(datetime)-now;
    const taskText=li.querySelector('.task-text').textContent;
    if(diff<=0 && !li.classList.contains('notified')){
      showNotification(taskText);
      li.classList.add('notified');
      // Only toggle if not already completed
      if (!li.classList.contains('completed')) {
        toggleTaskCompleted(li);
      }
    }
  });
}

if(Notification.permission!=='granted') Notification.requestPermission();
setInterval(updateCountdowns,1000);
setInterval(checkNotifications,1000);
window.addEventListener('load', loadTasks);
document.getElementById('back-btn').addEventListener('click', () => {
  window.close();
});

function isDateInputSupported() {
  var input = document.createElement('input');
  input.setAttribute('type', 'date');
  var notADateValue = 'not-a-date';
  input.setAttribute('value', notADateValue);
  return (input.value !== notADateValue);
}
function isTimeInputSupported() {
  var input = document.createElement('input');
  input.setAttribute('type', 'time');
  var notATimeValue = 'not-a-time';
  input.setAttribute('value', notATimeValue);
  return (input.value !== notATimeValue);
}
if (!isDateInputSupported() || !isTimeInputSupported()) {
  alert('Your browser does not support date/time pickers. Please enter date and time in the correct format.');
}

window.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('task-date');
  const timeInput = document.getElementById('task-time');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  if (timeInput) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    timeInput.value = `${hh}:${mm}`;
  }
});