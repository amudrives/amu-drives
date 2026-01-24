// Main site logic with Firebase Auth + Storage integration
import { auth, storage } from "./firebase-init.js";
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

/* ===================== DATA ===================== */

const allCourses = [
  "B.A. (Hons.)","B.Sc. (Hons.)","B.Tech.","B.Arch","BUMS","B.Sc. Nursing","BRTT","BBA",
  "B.Com. (Hons.)","B.A. LL.B.","B.Ed.","B.P.Ed","BVA","BFA","B.Voc."
];

let papers = [
  { id:1, course:"B.Tech.", subject:"Electrical Machines", year:2023, name:"Electrical_Machines_2023.pdf", url:"https://example.com/sample1.pdf"},
  { id:2, course:"B.Tech.", subject:"Control Systems", year:2022, name:"Control_Systems_2022.pdf", url:"https://example.com/sample2.pdf"},
  { id:3, course:"B.Sc. (Hons.)", subject:"Mathematics", year:2021, name:"Maths_2021.pdf", url:"https://example.com/sample3.pdf"}
];

const DEMO_ADMIN_EMAIL = "amudrives@gmail.com";

/* ===================== UI ELEMENTS ===================== */

const adminBtn = document.getElementById("adminBtn");
const loginBox = document.getElementById("loginBox");
const loginForm = document.getElementById("loginForm");
const cancelLogin = document.getElementById("cancelLogin");
const uploadForm = document.getElementById("uploadForm");
const galleryForm = document.getElementById("galleryForm");

let isAdmin = false;

/* ===================== SLIDER ===================== */

let current = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(i){
  slides.forEach(s => s.classList.remove("active"));
  if(slides[i]) slides[i].classList.add("active");
}

setInterval(() => {
  if(slides.length === 0) return;
  current = (current + 1) % slides.length;
  showSlide(current);
}, 3500);

/* ===================== PAGE INIT ===================== */

window.addEventListener("load", () => {
  document.getElementById("yearSpan").textContent = new Date().getFullYear();
});

/* ===================== COURSE BUTTONS ===================== */

const courseButtons = document.getElementById("courseButtons");

function renderCourseButtons(){
  courseButtons.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.textContent = "All Courses";
  allBtn.classList.add("active");
  allBtn.onclick = () => { setFilter(null); setActiveButton(allBtn); };
  courseButtons.appendChild(allBtn);

  allCourses.forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    b.onclick = () => { setFilter(c); setActiveButton(b); };
    courseButtons.appendChild(b);
  });
}

function setActiveButton(btn){
  document.querySelectorAll("#courseButtons button")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

let currentFilter = null;
function setFilter(course){
  currentFilter = course;
  renderPapers();
}

/* ===================== RENDER PAPERS ===================== */

const papersList = document.getElementById("papersList");

function renderPapers(){
  papersList.innerHTML = "";

  const filtered = currentFilter
    ? papers.filter(p => p.course === currentFilter)
    : papers;

  if(filtered.length === 0){
    const d = document.createElement("div");
    d.className = "muted";
    d.textContent = "No papers found for this course.";
    papersList.appendChild(d);
    return;
  }

  filtered.forEach(p => {
    const div = document.createElement("div");
    div.className = "paper";

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `
      <div class="title">${p.subject} — ${p.year}</div>
      <div class="small">Course: ${p.course}</div>
    `;

    const actions = document.createElement("div");
    actions.className = "actions";

    const a = document.createElement("a");
    a.href = p.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "Download";
    a.className = "btn alt";

    actions.appendChild(a);

    if(isAdmin){
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.className = "btn alt";
      del.style.color = "red";
      del.onclick = () => {
        if(!confirm("Delete this paper?")) return;
        papers = papers.filter(x => x.id !== p.id);
        renderPapers();
      };
      actions.appendChild(del);
    }

    div.appendChild(meta);
    div.appendChild(actions);
    papersList.appendChild(div);
  });
}

/* ===================== ADMIN LOGIN ===================== */

adminBtn.onclick = () => loginBox.classList.toggle("hidden");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const pass = document.getElementById("password").value;

  try{
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    if(userCredential.user.email.toLowerCase() !== DEMO_ADMIN_EMAIL){
      alert("Not allowed as admin");
      await signOut(auth);
      return;
    }

    isAdmin = true;
    loginBox.classList.add("hidden");
    document.getElementById("adminUpload").classList.remove("hidden");
    alert("Admin mode enabled");
  }catch(err){
    alert("Login failed: " + err.message);
  }
});

cancelLogin.onclick = () => loginBox.classList.add("hidden");

/* ===================== UPLOAD PAPER (PDF OR LINK) ===================== */

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if(!isAdmin) return alert("Only admins can upload.");

  const course = document.getElementById("courseSelect").value;
  const subject = document.getElementById("subject").value.trim();
  const year = parseInt(document.getElementById("year").value, 10);
  const file = document.getElementById("pdfFile").files[0];
  const link = document.getElementById("paperLink").value.trim();

  if(!course || !subject || !year){
    return alert("Please fill all required fields.");
  }

  if(!file && !link){
    return alert("Upload a PDF OR paste a link.");
  }

  let finalURL = "";
  let fileName = "External Link";

  try{
    if(link){
      finalURL = link;
    }else{
      const storageRef = ref(storage, `papers/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      finalURL = await getDownloadURL(snap.ref);
      fileName = file.name;
    }

    papers.unshift({
      id: Date.now(),
      course,
      subject,
      year,
      name: fileName,
      url: finalURL
    });

    uploadForm.reset();
    renderPapers();
    alert("Paper added successfully!");
  }catch(err){
    alert("Upload failed: " + err.message);
  }
});

/* ===================== GALLERY UPLOAD ===================== */

galleryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if(!isAdmin) return alert("Only admins can upload images.");

  const f = document.getElementById("galleryFile").files[0];
  if(!f) return alert("Select an image.");

  try{
    const storageRef = ref(storage, `gallery/${Date.now()}_${f.name}`);
    const snap = await uploadBytes(storageRef, f);
    const url = await getDownloadURL(snap.ref);

    const img = document.createElement("img");
    img.src = url;
    img.className = "slide";
    document.getElementById("slider").appendChild(img);

    alert("Gallery photo added!");
  }catch(err){
    alert("Upload failed: " + err.message);
  }
});

/* ===================== INIT ===================== */

document.getElementById("year").value = new Date().getFullYear();

const courseSelect = document.getElementById("courseSelect");
allCourses.forEach(c => {
  const o = document.createElement("option");
  o.value = c;
  o.textContent = c;
  courseSelect.appendChild(o);
});

renderCourseButtons();
renderPapers();
showSlide(0);
