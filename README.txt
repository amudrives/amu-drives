AMU Drives — Firebase-ready template (Auth + Storage only)

HOW IT WORKS
- This package provides a static website (index.html, style.css, script-firebase.js)
  that is already wired to use Firebase Authentication (signInWithEmailAndPassword)
  and Firebase Storage for file uploads.

WHAT YOU MUST DO (3 quick steps, no terminal)
1) Create a Firebase Web App in your project:
   - Go to https://console.firebase.google.com
   - Select your project -> click the web icon (</>) to add a web app
   - Choose "Use a <script> tag" (CDN modules) and copy the config snippet.

2) Open firebase-config.js and paste your firebaseConfig values between the braces.
   Example:
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:...:web:..."
   };
   Save the file.

3) (Important) Enable Email/Password sign-in:
   - In Firebase Console -> Authentication -> Sign-in method -> enable "Email/Password".
   - Add an admin user in Authentication -> Users -> Add user
     (email: amudrives@gmail.com, password: choose a secure one)

UPLOAD TO GITHUB PAGES (no terminal)
- Create repo named amu-drives under your account.
- Upload all files from this folder to the repo (ensure index.html is at repo root).
- Settings -> Pages -> Source: main branch -> / (root) -> Save.
- Site will be available at https://yourusername.github.io/amu-drives

SECURITY NOTES
- firebase-config contains public API keys (safe for client use). Do NOT share server-side credentials.
- This template only uses Storage and Auth. For a full backend with Firestore, ask and I can provide a Firestore-ready version.
