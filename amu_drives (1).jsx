import React, { useEffect, useState, useRef } from "react";

export default function AMUDrivesApp() {
  const sampleImages = [
    "/images/amu1.png",
    "/images/amu2.png",
    "/images/amu3.png",
    "/images/amu4.png",
  ];

  const allCourses = [
    "B.A. (Hons.)",
    "B.Sc. (Hons.)",
    "B.Tech.",
    "B.Arch",
    "BUMS",
    "B.Sc. Nursing",
    "BRTT",
    "BBA",
    "B.Com. (Hons.)",
    "B.A. LL.B.",
    "B.Ed.",
    "B.P.Ed",
    "BVA",
    "BFA",
    "B.Voc.",
  ];

  const initialPapers = [
    { id: 1, course: "B.Tech.", subject: "Electrical Machines", year: 2023, name: "Electrical_Machines_2023.pdf", url: "https://example.com/sample1.pdf" },
    { id: 2, course: "B.Tech.", subject: "Control Systems", year: 2022, name: "Control_Systems_2022.pdf", url: "https://example.com/sample2.pdf" },
    { id: 3, course: "B.Sc. (Hons.)", subject: "Mathematics", year: 2021, name: "Maths_2021.pdf", url: "https://example.com/sample3.pdf" },
  ];

  const DEMO_ADMIN_EMAIL = "amudrives@gmail.com";
  const DEMO_ADMIN_PASSWORD = "Asif@123";

  const [images, setImages] = useState(sampleImages);
  const [currentImg, setCurrentImg] = useState(0);
  const [papers, setPapers] = useState(initialPapers);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentImg((c) => (c + 1) % images.length);
    }, 3500);
    return () => clearInterval(t);
  }, [images.length]);

  function handleShowLogin() {
    setShowLogin(true);
  }

  function handleLogout() {
    setIsAdmin(false);
    setLoginEmail("");
    setLoginPass("");
  }

  function handleLoginSubmit(e) {
    e.preventDefault();
    if (loginEmail.trim().toLowerCase() === DEMO_ADMIN_EMAIL && loginPass === DEMO_ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      alert("Admin mode enabled (demo).\nNote: This is only for testing and is not secure.");
    } else {
      alert("Invalid credentials");
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!isAdmin) return alert("Only admins can upload papers.");

    const form = e.target;
    const course = form.course.value;
    const subject = form.subject.value.trim();
    const year = parseInt(form.year.value, 10);
    const file = fileRef.current.files[0];

    if (!course || !subject || !year || !file) return alert("Please fill all fields.");

    setUploading(true);
    const objectUrl = URL.createObjectURL(file);
    const newPaper = { id: Date.now(), course, subject, year, name: file.name, url: objectUrl };
    setPapers((p) => [newPaper, ...p]);
    form.reset();
    setUploading(false);
  }

  function handleDeletePaper(id) {
    if (!isAdmin) return alert("Only admins can delete papers.");
    if (!confirm("Delete this paper?")) return;
    setPapers((p) => p.filter((x) => x.id !== id));
  }

  function handleGalleryUpload(e) {
    e.preventDefault();
    if (!isAdmin) return alert("Only admins can upload gallery images.");
    const file = galleryRef.current.files[0];
    if (!file) return alert("Please select an image.");

    const newImageURL = URL.createObjectURL(file);
    setImages((imgs) => [...imgs, newImageURL]);
    alert("Gallery photo added successfully!");
    e.target.reset();
  }

  const filteredPapers = selectedCourse ? papers.filter((p) => p.course === selectedCourse) : papers;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">AMU Drives</h1>
            <p className="text-sm text-gray-500">Previous Years' Question Papers — Student resource</p>
          </div>

          <div className="flex items-center gap-3">
            {!isAdmin ? (
              <button onClick={handleShowLogin} className="px-3 py-1 rounded-lg border border-gray-300 text-sm hover:bg-gray-100">Admin Login</button>
            ) : (
              <button onClick={handleLogout} className="px-3 py-1 rounded-lg border border-gray-300 text-sm hover:bg-gray-100">Logout Admin</button>
            )}
            <a href="#contact" className="text-sm underline text-gray-600 hover:text-gray-900">Contact</a>
          </div>
        </div>

        {showLogin && !isAdmin && (
          <div className="max-w-6xl mx-auto px-4 pb-4">
            <form onSubmit={handleLoginSubmit} className="bg-white p-3 rounded-lg shadow-sm flex gap-2 items-center">
              <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Admin email" className="border rounded px-2 py-1" />
              <input value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Password" type="password" className="border rounded px-2 py-1" />
              <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Login</button>
              <button type="button" onClick={() => setShowLogin(false)} className="px-3 py-1 border rounded">Cancel</button>
            </form>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden shadow">
            {images.map((src, i) => (
              <img key={i} src={src} alt={`AMU gallery ${i + 1}`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${i === currentImg ? "opacity-100" : "opacity-0"}`} />
            ))}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrentImg(i)} className={`w-3 h-3 rounded-full ${i === currentImg ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          </div>

          {isAdmin && (
            <form onSubmit={handleGalleryUpload} className="mt-3 flex flex-col sm:flex-row items-center gap-3">
              <input ref={galleryRef} type="file" accept="image/*" className="border rounded px-2 py-1" />
              <button className="px-4 py-1 bg-blue-600 text-white rounded">Add Gallery Photo</button>
            </form>
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold">Previous Years' Question Papers</h2>
          <p className="text-gray-600">Access and download past papers by choosing your course below.</p>
        </section>

        <section className="mb-6">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setSelectedCourse(null)} className={`px-4 py-2 rounded-lg border ${selectedCourse === null ? "bg-gray-200" : "bg-white"}`}>All Courses</button>
            {allCourses.map((c) => (
              <button key={c} onClick={() => setSelectedCourse(c)} className={`px-4 py-2 rounded-lg border ${selectedCourse === c ? "bg-gray-200" : "bg-white"}`}>{c}</button>
            ))}
          </div>
        </section>

        {isAdmin && (
          <section className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Admin — Upload Question Paper</h3>
            <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="sm:col-span-1">
                <label className="text-sm block mb-1">Course</label>
                <select name="course" className="w-full border rounded px-2 py-1">
                  {allCourses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-1">
                <label className="text-sm block mb-1">Subject</label>
                <input name="subject" placeholder="Subject name" className="w-full border rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-1">
                <label className="text-sm block mb-1">Year</label>
                <input name="year" type="number" defaultValue={new Date().getFullYear()} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-1">
                <label className="text-sm block mb-1">PDF File</label>
                <input ref={fileRef} type="file" accept="application/pdf" className="w-full" />
              </div>
              <div className="sm:col-span-4">
                <button disabled={uploading} className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg">{uploading ? "Uploading..." : "Upload Paper"}</button>
              </div>
            </form>
          </section>
        )}

        <section>
          <div className="grid gap-3">
            {filteredPapers.length === 0 && <div className="text-sm text-gray-500">No papers found for this course.</div>}
            {filteredPapers.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.subject} — {p.year}</div>
                  <div className="text-sm text-gray-600">Course: {p.course}</div>
                </div>
                <div className="flex items-center gap-3">
                  <a href={p.url} download={p.name} target="_blank" rel="noreferrer" className="px-3 py-1 border rounded hover:bg-gray-50">Download</a>
                  {isAdmin && <button onClick={() => handleDeletePaper(p.id)} className="px-3 py-1 border rounded text-red-600">Delete</button>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="mt-10 py-8 text-sm text-gray-600">
          <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-start">
            <div>
              <div className="font-semibold">Contact</div>
              <div>Admin: amudrives@example.com</div>
              <div className="mt-2">© {new Date().getFullYear()} AMU Drives — Developed for students by students.</div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="font-semibold">Notes</div>
              <div className="text-xs text-gray-500 max-w-sm">Only admins should upload papers. Before buying or exchanging big items, ask for ID proof. This is a frontend prototype — connect to a secure backend for real uploads and authentication.</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
