
// Data (converted from the React demo)
const sampleImages = [
  "images/amu1.jpg",
  "images/amu2.jpg",
  "images/amu3.jpg",
  "images/amu4.jpg",
];

const allCourses = [
  "B.A. (Hons.)","B.Sc. (Hons.)","B.Tech.","B.Arch","BUMS","B.Sc. Nursing","BRTT","BBA",
  "B.Com. (Hons.)","B.A. LL.B.","B.Ed.","B.P.Ed","BVA","BFA","B.Voc."
];

let papers = [
  { id:1, course:"B.Tech.", subject:"Electrical Machines", year:2023, name:"Electrical_Machines_2023.pdf", url:"https://example.com/sample1.pdf"},
  { id:2, course:"B.Tech.", subject:"Control Systems", year:2022, name:"Control_Systems_2022.pdf", url:"https://example.com/sample2.pdf"},
  { id:3, course:"B.Sc. (Hons.)", subject:"Mathematics", year:2021, name:"Maths_2021.pdf", url:"https://example.com/sample3.pdf"}
];

// Demo admin creds
const DEMO_ADMIN_EMAIL = "amudrives@gmail.com";
const DEMO_ADMIN_PASSWORD = "Asif@123";

// slider
let current = 0;
const slides = document.querySelectorAll('.slide');
function showSlide(i){
  slides.forEach(s=>s.classList.remove('active'));
  slides[i].classList.add('active');
}
setInterval(()=>{ current=(current+1)%slides.length; showSlide(current); },3500);

// welcome fade
window.addEventListener('load', ()=> {
  document.getElementById('yearSpan').textContent = new Date().getFullYear();
  setTimeout(()=> {
    const w = document.getElementById('welcome');
    w.style.opacity = '0';
    setTimeout(()=> w.style.display='none',700);
  },1100);
});

// course buttons
const courseButtons = document.getElementById('courseButtons');
function renderCourseButtons(){
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All Courses';
  allBtn.classList.add('active');
  allBtn.addEventListener('click', ()=>{ setFilter(null); setActiveButton(allBtn); });
  courseButtons.appendChild(allBtn);
  allCourses.forEach(c=>{
    const b = document.createElement('button');
    b.textContent = c;
    b.addEventListener('click', ()=>{ setFilter(c); setActiveButton(b); });
    courseButtons.appendChild(b);
  });
}
function setActiveButton(btn){
  document.querySelectorAll('#courseButtons button').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
}
let currentFilter = null;
function setFilter(course){
  currentFilter = course;
  renderPapers();
}

// render papers
const papersList = document.getElementById('papersList');
function renderPapers(){
  papersList.innerHTML = '';
  const filtered = currentFilter ? papers.filter(p=>p.course===currentFilter) : papers;
  if(filtered.length===0){
    const d = document.createElement('div'); d.className='muted'; d.textContent='No papers found for this course.'; papersList.appendChild(d); return;
  }
  filtered.forEach(p=>{
    const div = document.createElement('div'); div.className='paper';
    const meta = document.createElement('div'); meta.className='meta';
    meta.innerHTML = `<div class="title">${p.subject} — ${p.year}</div><div class="small">Course: ${p.course}</div>`;
    const actions = document.createElement('div'); actions.className='actions';
    const a = document.createElement('a'); a.href = p.url; a.target='_blank'; a.textContent='Download'; a.className='btn alt';
    a.style.background='transparent'; a.style.border='1px solid #ddd'; a.style.padding='6px 10px'; a.style.borderRadius='8px';
    actions.appendChild(a);
    const del = document.createElement('button'); del.textContent='Delete'; del.style.color='red'; del.className='btn alt';
    del.addEventListener('click', ()=>{ if(!isAdmin) return alert('Only admins can delete papers.'); if(!confirm('Delete this paper?')) return; papers = papers.filter(x=>x.id!==p.id); renderPapers(); });
    if(true) actions.appendChild(del);
    div.appendChild(meta); div.appendChild(actions);
    papersList.appendChild(div);
  });
}

// admin login UI
const adminBtn = document.getElementById('adminBtn');
const loginBox = document.getElementById('loginBox');
const loginForm = document.getElementById('loginForm');
const cancelLogin = document.getElementById('cancelLogin');
let isAdmin = false;

adminBtn.addEventListener('click', ()=>{ loginBox.classList.toggle('hidden'); });

loginForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const pass = document.getElementById('password').value;
  if(email===DEMO_ADMIN_EMAIL && pass===DEMO_ADMIN_PASSWORD){
    isAdmin = true;
    loginBox.classList.add('hidden');
    document.getElementById('adminUpload').classList.remove('hidden');
    alert('Admin mode enabled (demo). Note: This is only for testing and is not secure.');
  } else { alert('Invalid credentials'); }
});

cancelLogin.addEventListener('click', ()=>{ loginBox.classList.add('hidden'); });

// admin upload (client-side demo)
document.getElementById('year').value = new Date().getFullYear();
const courseSelect = document.getElementById('courseSelect');
allCourses.forEach(c=>{ const o = document.createElement('option'); o.value=c; o.textContent=c; courseSelect.appendChild(o); });

const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  if(!isAdmin) return alert('Only admins can upload papers.');
  const course = courseSelect.value;
  const subject = document.getElementById('subject').value.trim();
  const year = parseInt(document.getElementById('year').value,10);
  const file = document.getElementById('pdfFile').files[0];
  if(!course||!subject||!year||!file) return alert('Please fill all fields.');
  const url = URL.createObjectURL(file);
  const newPaper = { id:Date.now(), course, subject, year, name:file.name, url };
  papers.unshift(newPaper);
  uploadForm.reset();
  renderPapers();
});

// gallery upload (client-side)
const galleryForm = document.getElementById('galleryForm');
galleryForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  if(!isAdmin) return alert('Only admins can upload gallery images.');
  const f = document.getElementById('galleryFile').files[0];
  if(!f) return alert('Please select an image.');
  const url = URL.createObjectURL(f);
  const img = document.createElement('img'); img.src = url; img.className='slide';
  document.getElementById('slider').appendChild(img);
  alert('Gallery photo added successfully!');
});

// initialization
renderCourseButtons();
renderPapers();
showSlide(0);
