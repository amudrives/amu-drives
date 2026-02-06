import { auth, storage, db } from "./firebase-init.js";
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ========================
// COURSES
// ========================
const allCourses = [
  "B.A. (Hons.)","B.Sc. (Hons.)","B.Tech.","B.Arch","BUMS",
  "B.Sc. Nursing","BRTT","BBA","B.Com. (Hons.)",
  "B.A. LL.B.","B.Ed.","B.P.Ed","BVA","BFA","B.Voc."
];

const papersCollection = collection(db, "papers");

let papers = [];
let currentFilter = null;
let isAdmin = false;
const DEMO_ADMIN_EMAIL = "amudrives@gmail.com";

// ========================
// ELEMENTS
// ========================
const uploadForm = document.getElementById('uploadForm');
const papersList = document.getElementById('papersList');
const courseButtons = document.getElementById("courseButtons");
const courseSelect = document.getElementById("courseSelect");

// ========================
// WELCOME FIX
// ========================
window.addEventListener("load", () => {
  const welcome = document.getElementById("welcome");
  if (welcome) {
    setTimeout(() => {
      welcome.style.opacity = "0";
      setTimeout(() => {
        welcome.style.display = "none";
      }, 500);
    }, 1000);
  }
});

// ========================
// ADMIN BUTTON
// ========================
const adminBtn = document.getElementById("adminBtn");
const loginBox = document.getElementById("loginBox");
const cancelLogin = document.getElementById("cancelLogin");

adminBtn?.addEventListener("click", () => {
  loginBox.classList.toggle("hidden");
});

cancelLogin?.addEventListener("click", () => {
  loginBox.classList.add("hidden");
});

// ========================
// COURSE BUTTONS
// ========================
function renderCourseButtons(){
  if(!courseButtons) return;

  courseButtons.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.textContent = "All Courses";
  allBtn.classList.add("active");
  allBtn.onclick = ()=>{ currentFilter = null; renderPapers(); setActive(allBtn); };
  courseButtons.appendChild(allBtn);

  allCourses.forEach(c=>{
    const btn = document.createElement("button");
    btn.textContent = c;
    btn.onclick = ()=>{
      currentFilter = c;
      renderPapers();
      setActive(btn);
    };
    courseButtons.appendChild(btn);
  });
}

function setActive(btn){
  document.querySelectorAll("#courseButtons button")
    .forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
}

// ========================
// LOAD PAPERS
// ========================
async function loadPapers(){
  try{
    papers = [];
    const snapshot = await getDocs(papersCollection);
    snapshot.forEach((docSnap)=>{
      papers.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderPapers();
  }catch(err){
    papersList.innerHTML = "<div class='muted'>Failed to load papers.</div>";
  }
}

// ========================
// RENDER PAPERS
// ========================
function renderPapers(){
  papersList.innerHTML = "";

  const filtered = currentFilter
    ? papers.filter(p=>p.course === currentFilter)
    : papers;

  if(filtered.length === 0){
    papersList.innerHTML = "<div class='muted'>No papers found.</div>";
    return;
  }

  filtered.forEach(p=>{
    const div = document.createElement("div");
    div.className = "paper";

    div.innerHTML = `
      <div class="meta">
        <div class="title">${p.subject} — ${p.year}</div>
        <div class="small">Course: ${p.course}</div>
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "actions";

    const a = document.createElement("a");
    a.href = p.url;
    a.target = "_blank";
    a.textContent = "Download";
    a.className = "btn alt";
    actions.appendChild(a);

    if(isAdmin){
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.className = "btn alt";
      del.style.color = "red";
      del.onclick = async ()=>{
        if(!confirm("Delete this paper?")) return;
        await deleteDoc(doc(db,"papers",p.id));
        loadPapers();
      };
      actions.appendChild(del);
    }

    div.appendChild(actions);
    papersList.appendChild(div);
  });
}

// ========================
// UPLOAD
// ========================
uploadForm?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  if(!isAdmin) return alert("Only admins can upload.");

  const course = document.getElementById("courseSelect").value;
  const subject = document.getElementById("subject").value.trim();
  const year = parseInt(document.getElementById("year").value,10);
  const file = document.getElementById("pdfFile").files[0];
  const link = document.getElementById("pdfLink").value.trim();

  if(!course || !subject || !year || (!file && !link)){
    return alert("Upload PDF OR paste link.");
  }

  try{
    let url = "";
    let name = "";

    if(file){
      const storageRef = ref(storage, `papers/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      url = await getDownloadURL(snap.ref);
      name = file.name;
    }else{
      url = link;
      name = "External Link";
    }

    await addDoc(papersCollection,{
      course, subject, year, name, url,
      createdAt: Date.now()
    });

    uploadForm.reset();
    loadPapers();
    alert("Uploaded successfully!");
  }catch(err){
    alert("Upload failed: " + err.message);
  }
});

// ========================
// LOGIN
// ========================
document.getElementById("loginForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const pass = document.getElementById("password").value;

  try{
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    if(userCredential.user.email.toLowerCase() !== DEMO_ADMIN_EMAIL){
      await signOut(auth);
      return alert("Not allowed.");
    }
    isAdmin = true;
    document.getElementById("adminUpload").classList.remove("hidden");
    alert("Admin mode enabled");
  }catch(err){
    alert("Login failed: " + err.message);
  }
});

// ========================
// INIT
// ========================
allCourses.forEach(c=>{
  const o = document.createElement("option");
  o.value = c;
  o.textContent = c;
  courseSelect?.appendChild(o);
});

renderCourseButtons();
loadPapers();
