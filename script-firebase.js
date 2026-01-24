/* ===================== FIREBASE IMPORTS ===================== */
import { auth, storage } from "./firebase-init.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

/* ===================== DATA ===================== */

const allCourses = [
  "B.A. (Hons.)","B.Sc. (Hons.)","B.Tech.","B.Arch","BUMS","B.Sc. Nursing",
  "BRTT","BBA","B.Com. (Hons.)","B.A. LL.B.","B.Ed.","B.P.Ed","BVA","BFA","B.Voc."
];

let papers = []; // start empty (real data admin add karega)

const ADMIN_EMAIL = "amudrives@gmail.com";

/* ===================== ELEMENTS ===================== */

const adminBtn     = document.getElementById("adminBtn");
const loginBox     = document.getElementById("loginBox");
const loginForm    = document.getElementById("loginForm");
const cancelLogin  = document.getElementById("cancelLogin");
const uploadForm  = document.getElementById("uploadForm");

const papersList   = document.getElementById("papersList");
const courseButtons= document.getElementById("courseButtons");

let isAdmin = false;
let currentFilter = null;

/* ===================== SLIDER ===================== */

let current = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(i){
  slides.forEach(s => s.classList.remove("active"));
  slides[i]?.classList.add("active");
}

setInterval(() => {
  if (!slides.length) return;
  current = (current + 1) % slides.length;
  showSlide(current);
}, 3500);

/* ===================== COURSE BUTTONS ===================== */

function renderCourseButtons(){
  courseButtons.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.textContent = "All Courses";
  allBtn.classList.add("active");
  allBtn.onclick = () => {
    currentFilter = null;
    setActive(allBtn);
    renderPapers();
  };
  courseButtons.appendChild(allBtn);

  allCourses.forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    b.onclick = () => {
      currentFilter = c;
      setActive(b);
      renderPapers();
    };
    courseButtons.appendChild(b);
  });
}

function setActive(btn){
  document
    .querySelectorAll("#courseButtons button")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

/* ===================== RENDER PAPERS ===================== */

function renderPapers(){
  papersList.innerHTML = "";

  const list = currentFilter
    ? papers.filter(p => p.course === currentFilter)
    : papers;

  if (!list.length){
    papersList.innerHTML = `<div class="muted">No papers available.</div>`;
    return;
  }

  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "paper";

    div.innerHTML = `
      <div class="meta">
        <div class="title">${p.subject} — ${p.year}</div>
        <div class="small">Course: ${p.course}</div>
      </div>
      <div class="actions"></div>
    `;

    const actions = div.querySelector(".actions");

    const openBtn = document.createElement("a");
    openBtn.href = p.url;
    openBtn.target = "_blank";
    openBtn.className = "btn alt";
    openBtn.textContent = "Open";
    actions.appendChild(openBtn);

    if (isAdmin){
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.className = "btn alt";
      del.style.color = "red";
      del.onclick = () => {
        if (confirm("Delete this paper?")){
          papers = papers.filter(x => x.id !== p.id);
          renderPapers();
        }
      };
      actions.appendChild(del);
    }

    papersList.appendChild(div);
  });
}

/* ===================== ADMIN LOGIN ===================== */

adminBtn.onclick = () => loginBox.classList.toggle("hidden");

loginForm.addEventListener("submit", async e => {
  e.preventDefault();

  const email = emailInput.value.trim().toLowerCase();
  const pass  = passwordInput.value;

  try{
    const res = await signInWithEmailAndPassword(auth, email, pass);

    if (res.user.email.toLowerCase() !== ADMIN_EMAIL){
      await signOut(auth);
      return alert("Not allowed as admin");
    }

    isAdmin = true;
    loginBox.classList.add("hidden");
    document.getElementById("adminUpload").classList.remove("hidden");
    alert("Admin mode ON");

  }catch(err){
    alert(err.message);
  }
});

cancelLogin.onclick = () => loginBox.classList.add("hidden");

/* ===================== UPLOAD (PDF OR LINK) ===================== */

uploadForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!isAdmin) return;

  const course  = courseSelect.value;
  const subject = subjectInput.value.trim();
  const year    = yearInput.value;
  const file    = pdfFile.files[0];
  const link    = paperLink.value.trim();

  if (!course || !subject || !year)
    return alert("Fill all fields");

  if (!file && !link)
    return alert("Upload PDF or paste link");

  let finalURL = "";

  try{
    if (link){
      finalURL = link;
    } else {
      const refPath = ref(storage, `papers/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(refPath, file);
      finalURL = await getDownloadURL(snap.ref);
    }

    papers.unshift({
      id: Date.now(),
      course,
      subject,
      year,
      url: finalURL
    });

    uploadForm.reset();
    renderPapers();
    alert("Paper added!");

  }catch(err){
    alert(err.message);
  }
});

/* ===================== INIT ===================== */

document.getElementById("yearSpan").textContent =
  new Date().getFullYear();

allCourses.forEach(c => {
  const o = document.createElement("option");
  o.value = c;
  o.textContent = c;
  courseSelect.appendChild(o);
});

renderCourseButtons();
renderPapers();
showSlide(0);
