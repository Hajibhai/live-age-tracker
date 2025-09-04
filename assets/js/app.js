// =======================
// CONFIG
// =======================
const API_ENDPOINT = "https://script.google.com/macros/s/AKfycbyqIsflhD1fBfRzpMHOMl_EGiXDBHampb0WWUL46_MzWOyX5NVA0hZyA2IYvLR67C-yhA/exec"; // <- Replace with your Apps Script Web App URL

// =======================
// API HELPER FUNCTION
// =======================
async function apiRequest(action, payload = {}) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ action, ...payload }),
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (err) {
    console.error("API Error:", err);
    alert("Backend error, check console.");
  }
}

// =======================
// REGISTER USER
// =======================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value;

    const res = await apiRequest("registerUser", { name, email, password, phone });
    if (res.success) {
      alert("Registration successful! Please login.");
      window.location.href = "login.html";
    } else {
      alert(res.message || "Registration failed.");
    }
  });
}

// =======================
// LOGIN USER
// =======================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await apiRequest("loginUser", { email, password });
    if (res.success) {
      localStorage.setItem("loggedInUser", JSON.stringify(res.user));
      alert("Login successful!");
      if (res.user.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "user.html";
      }
    } else {
      alert(res.message || "Login failed.");
    }
  });
}

// =======================
// ADD PERSON (User Portal)
// =======================
const addPersonForm = document.getElementById("addPersonForm");
if (addPersonForm) {
  addPersonForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const profileName = document.getElementById("profileName").value;
    const category = document.getElementById("category").value;
    const dob = document.getElementById("dob").value;
    const description = document.getElementById("description").value;
    const imageUrl = document.getElementById("imageUrl").value;

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const res = await apiRequest("addPerson", {
      profileName,
      category,
      dob,
      description,
      imageUrl,
      addedBy: loggedInUser.name,
    });

    if (res.success) {
      alert("Person added successfully!");
      displayPeople();
      addPersonForm.reset();
    } else {
      alert(res.message || "Failed to add person.");
    }
  });
}

// =======================
// DISPLAY PEOPLE (User Portal)
// =======================
async function displayPeople() {
  const container = document.getElementById("listContainer");
  if (!container) return;

  const res = await apiRequest("getPeople");
  container.innerHTML = "";
  if (res.success) {
    res.people.forEach((p) => {
      const age = calculateAge(new Date(p.dateOfBirthISO));
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.imageUrl || 'assets/images/default.jpg'}" alt="${p.profileName}">
        <h4>${p.profileName}</h4>
        <p>Category: ${p.category}</p>
        <p>Age: ${age} years</p>
        <p>${p.description}</p>
        <small>Added by ${p.addedBy}</small>
      `;
      container.appendChild(card);
    });
  }
}
displayPeople();

// =======================
// ADMIN: DISPLAY USERS
// =======================
async function displayUsers() {
  const container = document.getElementById("usersList");
  if (!container) return;

  const res = await apiRequest("getUsers");
  container.innerHTML = "";
  if (res.success) {
    res.users.forEach((u) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h4>${u.name}</h4>
        <p>Email: ${u.email}</p>
        <p>Role: ${u.role}</p>
        <button onclick="deleteUser('${u.userId}')">Delete</button>
      `;
      container.appendChild(card);
    });
  }
}
displayUsers();

// =======================
// ADMIN: DISPLAY PEOPLE
// =======================
async function displayAdminPeople() {
  const container = document.getElementById("adminPeopleList");
  if (!container) return;

  const res = await apiRequest("getPeople");
  container.innerHTML = "";
  if (res.success) {
    res.people.forEach((p) => {
      const age = calculateAge(new Date(p.dateOfBirthISO));
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h4>${p.profileName}</h4>
        <p>Category: ${p.category}</p>
        <p>Age: ${age} years</p>
        <button onclick="deletePerson('${p.personId}')">Delete</button>
      `;
      container.appendChild(card);
    });
  }
}
displayAdminPeople();

// =======================
// ADMIN: DELETE USER
// =======================
async function deleteUser(id) {
  const res = await apiRequest("deleteUser", { userId: id });
  if (res.success) {
    alert("User deleted.");
    displayUsers();
  } else {
    alert(res.message || "Failed to delete user.");
  }
}

// =======================
// ADMIN: DELETE PERSON
// =======================
async function deletePerson(id) {
  const res = await apiRequest("deletePerson", { personId: id });
  if (res.success) {
    alert("Person deleted.");
    displayAdminPeople();
  } else {
    alert(res.message || "Failed to delete person.");
  }
}

// =======================
// HELPERS
// =======================
function calculateAge(dob) {
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
// =======================
// REAL-TIME AGE CALCULATION
// =======================
function calculateAgeRealTime(dob) {
  const now = new Date();
  const birth = new Date(dob);
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// =======================
// DISPLAY PEOPLE (USER PORTAL)
// =======================
async function displayPeople() {
  const container = document.getElementById("listContainer");
  if (!container) return;

  const res = await apiRequest("getPeople");
  container.innerHTML = "";

  if (res.success) {
    res.people.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.imageUrl || 'assets/images/default.jpg'}" alt="${p.profileName}">
        <h4>${p.profileName}</h4>
        <p>Category: ${p.category}</p>
        <p>Age: <span class="age" data-dob="${p.dateOfBirthISO}"></span> years</p>
        <p>${p.description}</p>
        <small>Added by ${p.addedBy}</small>
      `;
      container.appendChild(card);
    });

    // Start real-time age update
    setInterval(updateAges, 1000);
  }
}

// =======================
// DISPLAY PEOPLE (ADMIN PORTAL)
// =======================
async function displayAdminPeople() {
  const container = document.getElementById("adminPeopleList");
  if (!container) return;

  const res = await apiRequest("getPeople");
  container.innerHTML = "";

  if (res.success) {
    res.people.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h4>${p.profileName}</h4>
        <p>Category: ${p.category}</p>
        <p>Age: <span class="age" data-dob="${p.dateOfBirthISO}"></span> years</p>
        <button onclick="deletePerson('${p.personId}')">Delete</button>
      `;
      container.appendChild(card);
    });

    // Start real-time age update
    setInterval(updateAges, 1000);
  }
}

// =======================
// UPDATE AGE EVERY SECOND
// =======================
function updateAges() {
  const ageElements = document.querySelectorAll(".age");
  ageElements.forEach((el) => {
    const dob = el.getAttribute("data-dob");
    el.textContent = calculateAgeRealTime(dob);
  });
}

// Call once at page load
updateAges();
