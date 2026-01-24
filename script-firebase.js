import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword, signOut } from
  "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

/* WELCOME FIX */
window.addEventListener("load", () => {
  const w = document.getElementById("welcome");
  setTimeout(() => {
    w.classList.add("hide");
    setTimeout(() => w.remove(), 900);
  }, 1200);
});

/* DATA */
const ADMIN_EMAIL = "amudrives@gmail.com";
const allCourses = [
  "B.A. (Hons.)","B.Sc. (Hons.)","B.Tech.","B.Arch","BUMS",
  "B.Sc. Nursing","BRTT","BBA","B.Com. (Hons.)","B.A. LL.B."
];

let papers = [];
let isAdmin = false;

/* ELEMENTS */
const adminBtn = document.getElementById("adminBtn");
const loginBox = document.getElementById("loginBox");
const loginForm = document.getElementById("loginForm");
const cancelLogin = document.getElementById("cancelLogin");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const courseSelect = document.getElementById("courseSelect");
const subjectInput = document.getElementById("subject");
const yearInput = document.getElementById("year");
const pdfFile = document.getElementById("pdfFile");
const paperLink = document.getElementById("paperLink");

const papersList = document.getElementById("papersList");
const courseButtons = document.getElementById("courseButtons");

/* LOGIN */
adminBtn.onclick = () => loginBox.classList.toggle("hidden");
cancelLogin.onclick = () => loginBox.classList.add("hidden");

loginForm.onsubmit = async e => {
  e.preventDefault();
  try{
    const res = await signInWithEmailAndPassword(
      auth, emailInput.value, passwordInput.value
    );
    if(res.user.email !== ADMIN_EMAIL){
      await signOut(auth);
      return alert("Not admin");
    }
    isAdmin = true;
    loginBox.classList.add("hidden");
    document.getElementById("adminUpload").classList.remove("hidden");
    alert("Admin mode ON");
  }catch(err){ alert(err.message); }
};

/* COURSES */
allCourses.forEach(c=>{
  const o=document.createElement("option");
  o.value=c; o.textContent=c;
  courseSelect.appendChild(o);

  const b=document.createElement("button");
  b.textContent=c;
  b.onclick=()=>renderPapers(c);
  courseButtons.appendChild(b);
});

/* UPLOAD */
uploadForm.onsubmit = e=>{
  e.preventDefault();
  const url = paperLink.value || URL.createObjectURL(pdfFile.files[0]);
  papers.unshift({
    subject: subjectInput.value,
    year: yearInput.value,
    course: courseSelect.value,
    url
  });
  renderPapers();
};

/* RENDER */
function renderPapers(filter=null){
  papersList.innerHTML="";
  papers
    .filter(p=>!filter||p.course===filter)
    .forEach(p=>{
      papersList.innerHTML+=`
        <div class="paper">
          <div>${p.subject} (${p.year})</div>
          <a href="${p.url}" target="_blank">Open</a>
        </div>`;
    });
}

document.getElementById("yearSpan").textContent=new Date().getFullYear();
