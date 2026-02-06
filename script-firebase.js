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

const papersCollection = collection(db, "papers");

let papers = [];
let isAdmin = false;
const DEMO_ADMIN_EMAIL = "amudrives@gmail.com";

const uploadForm = document.getElementById('uploadForm');
const papersList = document.getElementById('papersList');

// ========================
// LOAD PAPERS FROM FIRESTORE
// ========================
async function loadPapers(){
  papers = [];
  const snapshot = await getDocs(papersCollection);
  snapshot.forEach((docSnap)=>{
    papers.push({ id: docSnap.id, ...docSnap.data() });
  });
  renderPapers();
}

// ========================
// RENDER
// ========================
function renderPapers(){
  papersList.innerHTML = '';
  papers.forEach(p=>{
    const div = document.createElement('div');
    div.className='paper';

    div.innerHTML = `
      <div class="meta">
        <div class="title">${p.subject} — ${p.year}</div>
        <div class="small">Course: ${p.course}</div>
      </div>
    `;

    const actions = document.createElement('div');
    actions.className='actions';

    const a = document.createElement('a');
    a.href = p.url;
    a.target='_blank';
    a.textContent='Download';
    a.className='btn alt';
    actions.appendChild(a);

    if(isAdmin){
      const del = document.createElement('button');
      del.textContent='Delete';
      del.style.color='red';
      del.className='btn alt';
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
// UPLOAD (PDF OR LINK)
// ========================
uploadForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(!isAdmin) return alert('Only admins can upload.');

  const course = document.getElementById('courseSelect').value;
  const subject = document.getElementById('subject').value.trim();
  const year = parseInt(document.getElementById('year').value,10);
  const file = document.getElementById('pdfFile').files[0];
  const link = document.getElementById('pdfLink').value.trim();

  if(!course || !subject || !year || (!file && !link)){
    return alert('Upload PDF OR paste link.');
  }

  try{
    let url = '';
    let name = '';

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
      course,
      subject,
      year,
      name,
      url,
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
document.getElementById('loginForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const pass = document.getElementById('password').value;

  try{
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    if(userCredential.user.email.toLowerCase() !== DEMO_ADMIN_EMAIL){
      alert("Not allowed.");
      await signOut(auth);
      return;
    }
    isAdmin = true;
    document.getElementById('adminUpload').classList.remove('hidden');
    alert("Admin mode enabled");
  }catch(err){
    alert("Login failed: " + err.message);
  }
});

// ========================
loadPapers();
