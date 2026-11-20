const STORAGE_KEYS = {
  users: "flatnest_admin_users",
  activeUser: "flatnest_active_admin",
  database: "flatnest_admin_db"
};

let toastTimer = null;

function formatDateISO(dateObj) {
  const localTime = dateObj.getTime() - dateObj.getTimezoneOffset() * 60000;
  return new Date(localTime).toISOString().slice(0, 10);
}

function getTodayDate() {
  return formatDateISO(new Date());
}

function addDays(dateString, days) {
  const dateObj = new Date(dateString + "T00:00:00");
  dateObj.setDate(dateObj.getDate() + days);
  return formatDateISO(dateObj);
}

function addMonths(dateString, months) {
  const dateObj = new Date(dateString + "T00:00:00");
  dateObj.setMonth(dateObj.getMonth() + months);
  return formatDateISO(dateObj);
}

function formatCurrency(amount) {
  return "\u09F3 " + Math.round(amount).toLocaleString("en-US");
}

function escapeHtml(value) {
  const text = String(value);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function padNumber(num, length) {
  return String(num).padStart(length, "0");
}

function showToast(message) {
  const toastEl = document.getElementById("toast");
  if (!toastEl) {
    return;
  }
  toastEl.textContent = message;
  toastEl.classList.add("show");
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(function () {
    toastEl.classList.remove("show");
  }, 3000);
}

function getUsers() {
  const stored = localStorage.getItem(STORAGE_KEYS.users);
  if (stored) {
    return JSON.parse(stored);
  }
  const defaultUsers = [
    {
      id: "USR-001",
      name: "Khandakar Raziul",
      email: "admin@flatnest.com",
      phone: "01711223344",
      role: "Admin",
      status: "Active",
      pass: "Admin@123"
    },
    {
      id: "USR-002",
      name: "Al Rahit",
      email: "al.rahit@flatnest.com",
      phone: "01711223345",
      role: "Accounts Officer",
      status: "Active",
      pass: "Rahit@123"
    },
    {
      id: "USR-003",
      name: "Maisha Tasnim",
      email: "maisha.agent@flatnest.com",
      phone: "01711223346",
      role: "Sales Agent",
      status: "Active",
      pass: "Maisha@123"
    },
    {
      id: "USR-004",
      name: "Samiya Sultana",
      email: "samiya.agent@flatnest.com",
      phone: "01711223347",
      role: "Sales Agent",
      status: "Active",
      pass: "Samiya@123"
    },
    {
      id: "USR-005",
      name: "Ayesha Rahman",
      email: "ayesha@example.com",
      phone: "01819001122",
      role: "Customer",
      status: "Active",
      pass: "Ayesha@123"
    },
    {
      id: "USR-006",
      name: "Tanvir Ahmed",
      email: "tanvir@example.com",
      phone: "01819001133",
      role: "Customer",
      status: "Active",
      pass: "Tanvir@123"
    },
    {
      id: "USR-007",
      name: "Nusrat Jahan",
      email: "nusrat@example.com",
      phone: "01819001144",
      role: "Customer",
      status: "Active",
      pass: "Nusrat@123"
    },
    {
      id: "USR-008",
      name: "Rafiq Hasan",
      email: "rafiq@example.com",
      phone: "01819001155",
      role: "Customer",
      status: "Inactive",
      pass: "Rafiq@123"
    }
  ];
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getCurrentAdmin() {
  const activeEmail = localStorage.getItem(STORAGE_KEYS.activeUser);
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === activeEmail) {
      return users[i];
    }
  }
  return { name: "Khandakar Raziul", email: "admin@flatnest.com", role: "Admin" };
}

function buildInitialDatabase() {
  const today = getTodayDate();
  getUsers();

  const db = {
    projects: [
      {
        id: "PRJ-001",
        name: "Green Valley",
        location: "Uttara, Dhaka",
        status: "Ready",
        description: "Modern residential apartments with rooftop garden and 24/7 security."
      },
      {
        id: "PRJ-002",
        name: "Lake View",
        location: "Dhanmondi, Dhaka",
        status: "Ongoing",
        description: "Scenic lakeside flats with wide balconies, gym, and basement parking."
      },
      {
        id: "PRJ-003",
        name: "Sunrise Heights",
        location: "Bashundhara R/A, Dhaka",
        status: "Ongoing",
        description: "Spacious family residences near leading schools and shopping hubs."
      }
    ],
    flats: [
      {
        id: "FLT-001",
        projectId: "PRJ-001",
        flatNo: "B-402",
        floor: 4,
        sizeSqft: 1350,
        bedrooms: 3,
        price: 5500000,
        status: "Booked",
        floorPlan: "plan-b402.png",
        image: "flat-b402.jpg",
        featured: true
      },
      {
        id: "FLT-002",
        projectId: "PRJ-001",
        flatNo: "A-1101",
        floor: 11,
        sizeSqft: 1550,
        bedrooms: 3,
        price: 6300000,
        status: "Sold",
        floorPlan: "plan-a1101.png",
        image: "flat-a1101.jpg",
        featured: false
      },
      {
        id: "FLT-003",
        projectId: "PRJ-001",
        flatNo: "C-604",
        floor: 6,
        sizeSqft: 1120,
        bedrooms: 2,
        price: 4200000,
        status: "Available",
        floorPlan: "plan-c604.png",
        image: "flat-c604.jpg",
        featured: true
      },
      {
        id: "FLT-004",
        projectId: "PRJ-002",
        flatNo: "A-701",
        floor: 7,
        sizeSqft: 1750,
        bedrooms: 4,
        price: 7200000,
        status: "Booked",
        floorPlan: "plan-a701.png",
        image: "flat-a701.jpg",
        featured: true
      },
      {
        id: "FLT-005",
        projectId: "PRJ-002",
        flatNo: "B-203",
        floor: 2,
        sizeSqft: 1280,
        bedrooms: 3,
        price: 5000000,
        status: "Available",
        floorPlan: "plan-b203.png",
        image: "flat-b203.jpg",
        featured: false
      },
      {
        id: "FLT-006",
        projectId: "PRJ-002",
        flatNo: "D-801",
        floor: 8,
        sizeSqft: 1480,
        bedrooms: 3,
        price: 6000000,
        status: "Available",
        floorPlan: "plan-d801.png",
        image: "flat-d801.jpg",
        featured: false
      },
      {
        id: "FLT-007",
        projectId: "PRJ-003",
        flatNo: "C-305",
        floor: 3,
        sizeSqft: 1200,
        bedrooms: 3,
        price: 4800000,
        status: "Sold",
        floorPlan: "plan-c305.png",
        image: "flat-c305.jpg",
        featured: false
      },
      {
        id: "FLT-008",
        projectId: "PRJ-003",
        flatNo: "A-902",
        floor: 9,
        sizeSqft: 1920,
        bedrooms: 4,
        price: 8000000,
        status: "Available",
        floorPlan: "plan-a902.png",
        image: "flat-a902.jpg",
        featured: true
      }
    ],
    leads: [
      {
        id: "INQ-001",
        customerName: "Farhana Akter",
        customerPhone: "01722334455",
        flatId: "FLT-005",
        message: "Looking for a 3-bedroom south-facing flat in Lake View.",
        createdAt: addDays(today, -2),
        agentEmail: "",
        status: "Unassigned"
      },
      {
        id: "INQ-002",
        customerName: "Imran Hossain",
        customerPhone: "01722334466",
        flatId: "FLT-008",
        message: "Please share installment plan details for flat A-902.",
        createdAt: addDays(today, -5),
        agentEmail: "",
        status: "Unassigned"
      },
      {
        id: "INQ-003",
        customerName: "Sabrina Karim",
        customerPhone: "01722334477",
        flatId: "FLT-003",
        message: "Would like to schedule a site visit this Friday morning.",
        createdAt: addDays(today, -12),
        agentEmail: "maisha.agent@flatnest.com",
        status: "Follow Up"
      },
      {
        id: "INQ-004",
        customerName: "Ayesha Rahman",
        customerPhone: "01819001122",
        flatId: "FLT-001",
        message: "Interested in booking B-402 with 10 monthly installments.",
        createdAt: addDays(today, -45),
        agentEmail: "maisha.agent@flatnest.com",
        status: "Closed"
      },
      {
        id: "INQ-005",
        customerName: "Tanvir Ahmed",
        customerPhone: "01819001133",
        flatId: "FLT-004",
        message: "Need floor plan and parking availability for A-701.",
        createdAt: addDays(today, -25),
        agentEmail: "samiya.agent@flatnest.com",
        status: "Assigned"
      }
    ],
    bookings: [
      {
        id: "BKG-001",
        customerName: "Ayesha Rahman",
        flatId: "FLT-001",
        agentEmail: "maisha.agent@flatnest.com",
        bookingDate: addDays(today, -140),
        bookingMoney: 500000,
        status: "Confirmed"
      },
      {
        id: "BKG-002",
        customerName: "Tanvir Ahmed",
        flatId: "FLT-004",
        agentEmail: "samiya.agent@flatnest.com",
        bookingDate: addDays(today, -105),
        bookingMoney: 1200000,
        status: "Confirmed"
      },
      {
        id: "BKG-003",
        customerName: "Nusrat Jahan",
        flatId: "FLT-007",
        agentEmail: "maisha.agent@flatnest.com",
        bookingDate: addDays(today, -75),
        bookingMoney: 800000,
        status: "Confirmed"
      },
      {
        id: "BKG-004",
        customerName: "Rafiq Hasan",
        flatId: "FLT-002",
        agentEmail: "samiya.agent@flatnest.com",
        bookingDate: addDays(today, -40),
        bookingMoney: 1300000,
        status: "Confirmed"
      },
      {
        id: "BKG-005",
        customerName: "Mahmud Alam",
        flatId: "FLT-006",
        agentEmail: "maisha.agent@flatnest.com",
        bookingDate: addDays(today, -4),
        bookingMoney: 1000000,
        status: "Pending"
      }
    ],
    banner: {
      headline: "Find Your Dream Flat",
      subtext: "Explore the best residential flats in your desired location. Easy booking, secure future.",
      ctaText: "Browse Available Flats"
    },
    announcements: [
      {
        id: "ANN-001",
        title: "Zero Registration Fee Offer",
        message: "Book any ready flat at Green Valley this month and enjoy zero registration processing fees.",
        date: addDays(today, -15),
        active: true
      },
      {
        id: "ANN-002",
        title: "Weekend Open House at Lake View",
        message: "Visit our Dhanmondi project site every Friday and Saturday from 10:00 AM to 5:00 PM.",
        date: addDays(today, -6),
        active: true
      }
    ],
    counters: {
      project: 3,
      flat: 8,
      user: 8,
      lead: 5,
      booking: 5,
      announcement: 2
    }
  };

  saveDatabase(db);
  return db;
}

function saveDatabase(db) {
  localStorage.setItem(STORAGE_KEYS.database, JSON.stringify(db));
}

function loadDatabase() {
  const stored = localStorage.getItem(STORAGE_KEYS.database);
  if (stored) {
    return JSON.parse(stored);
  }
  return buildInitialDatabase();
}

function findProjectById(db, projectId) {
  for (let i = 0; i < db.projects.length; i++) {
    if (db.projects[i].id === projectId) {
      return db.projects[i];
    }
  }
  return null;
}

function findFlatById(db, flatId) {
  for (let i = 0; i < db.flats.length; i++) {
    if (db.flats[i].id === flatId) {
      return db.flats[i];
    }
  }
  return null;
}

function findUserByEmail(email) {
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      return users[i];
    }
  }
  return null;
}

function renderStatusBadge(status) {
  let cls = "badge-due";
  if (status === "Available" || status === "Confirmed" || status === "Active" || status === "Ready" || status === "Closed") {
    cls = "badge-paid";
  } else if (status === "Sold" || status === "Cancelled" || status === "Inactive" || status === "Unassigned") {
    cls = "badge-overdue";
  }
  return '<span class="badge ' + cls + '">' + escapeHtml(status) + "</span>";
}

function setupSidebar() {
  const admin = getCurrentAdmin();
  const adminNameEl = document.getElementById("adminName");
  if (adminNameEl) {
    adminNameEl.textContent = admin.name;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem(STORAGE_KEYS.activeUser);
      window.location.href = "login.html";
    });
  }
}

function setFieldError(inputId, errorId, message) {
  const inputEl = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
  }
  if (inputEl) {
    if (message) {
      inputEl.classList.add("input-error");
    } else {
      inputEl.classList.remove("input-error");
    }
  }
}

function initLoginPage() {
  getUsers();

  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("loginError");
  const toggleBtn = document.getElementById("togglePasswordBtn");

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", function () {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleBtn.textContent = "Hide";
      } else {
        passwordInput.type = "password";
        toggleBtn.textContent = "Show";
      }
    });
  }

  emailInput.addEventListener("input", function () {
    setFieldError("email", "emailError", "");
    loginError.textContent = "";
  });

  passwordInput.addEventListener("input", function () {
    setFieldError("password", "passwordError", "");
    loginError.textContent = "";
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;

    setFieldError("email", "emailError", "");
    setFieldError("password", "passwordError", "");
    loginError.textContent = "";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "") {
      setFieldError("email", "emailError", "Email address is required.");
      isValid = false;
    } else if (!emailPattern.test(email)) {
      setFieldError("email", "emailError", "Please enter a valid email address.");
      isValid = false;
    }

    if (password === "") {
      setFieldError("password", "passwordError", "Password is required.");
      isValid = false;
    } else if (password.length < 8) {
      setFieldError("password", "passwordError", "Password must be at least 8 characters.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const users = getUsers();
    let matchedUser = null;
    for (let i = 0; i < users.length; i++) {
      if (users[i].email === email && users[i].pass === password && users[i].role === "Admin") {
        matchedUser = users[i];
        break;
      }
    }

    if (!matchedUser) {
      loginError.textContent = "Invalid administrator credentials. Please try again.";
      return;
    }

    if (matchedUser.status !== "Active") {
      loginError.textContent = "This administrator account is deactivated.";
      return;
    }

    localStorage.setItem(STORAGE_KEYS.activeUser, matchedUser.email);
    window.location.href = "dashboard.html";
  });
}

function initDashboardPage() {
  const db = loadDatabase();
  const users = getUsers();
  const admin = getCurrentAdmin();

  document.getElementById("welcomeName").textContent = admin.name;

  let availCount = 0;
  let bookedCount = 0;
  let soldCount = 0;

  for (let i = 0; i < db.flats.length; i++) {
    if (db.flats[i].status === "Available") {
      availCount += 1;
    } else if (db.flats[i].status === "Booked") {
      bookedCount += 1;
    } else if (db.flats[i].status === "Sold") {
      soldCount += 1;
    }
  }

  document.getElementById("statProjects").textContent = String(db.projects.length);
  document.getElementById("statFlats").textContent = String(db.flats.length);
  document.getElementById("statAvailableSub").textContent = availCount + " Available";
  document.getElementById("statBookings").textContent = String(db.bookings.length);
  document.getElementById("statUsers").textContent = String(users.length);

  const totalFlats = db.flats.length || 1;
  const availPercent = (availCount / totalFlats) * 100;
  const bookedEndPercent = availPercent + (bookedCount / totalFlats) * 100;

  const chartEl = document.getElementById("flatChart");
  chartEl.style.background =
    "conic-gradient(var(--green) 0% " +
    availPercent +
    "%, var(--amber) " +
    availPercent +
    "% " +
    bookedEndPercent +
    "%, var(--red) " +
    bookedEndPercent +
    "% 100%)";

  document.getElementById("availCount").textContent = String(availCount);
  document.getElementById("bookedCount").textContent = String(bookedCount);
  document.getElementById("soldCount").textContent = String(soldCount);

  const sortedBookings = db.bookings.slice().sort(function (a, b) {
    return b.bookingDate.localeCompare(a.bookingDate);
  });

  const bookingsBody = document.getElementById("latestBookingsBody");
  let bookingsHtml = "";
  const bookingLimit = Math.min(sortedBookings.length, 5);
  for (let i = 0; i < bookingLimit; i++) {
    const b = sortedBookings[i];
    const flat = findFlatById(db, b.flatId);
    const project = flat ? findProjectById(db, flat.projectId) : null;
    const flatLabel = flat ? (project ? project.name + " " : "") + flat.flatNo : b.flatId;
    const price = flat ? flat.price : 0;

    bookingsHtml +=
      "<tr>" +
      "<td>" + escapeHtml(b.customerName) + "</td>" +
      "<td>" + escapeHtml(flatLabel) + "</td>" +
      "<td>" + formatCurrency(price) + "</td>" +
      "<td>" + b.bookingDate + "</td>" +
      "<td>" + renderStatusBadge(b.status) + "</td>" +
      "</tr>";
  }
  bookingsBody.innerHTML = bookingsHtml || '<tr><td colspan="5" class="empty-cell">No bookings found.</td></tr>';

  const unassignedBody = document.getElementById("unassignedLeadsBody");
  let leadsHtml = "";
  for (let i = 0; i < db.leads.length; i++) {
    const lead = db.leads[i];
    if (!lead.agentEmail) {
      const flat = findFlatById(db, lead.flatId);
      const project = flat ? findProjectById(db, flat.projectId) : null;
      const flatLabel = flat ? (project ? project.name + " " : "") + flat.flatNo : "-";

      leadsHtml +=
        "<tr>" +
        "<td>" + lead.id + "</td>" +
        "<td>" + escapeHtml(lead.customerName) + "</td>" +
        "<td>" + escapeHtml(flatLabel) + "</td>" +
        "<td>" + escapeHtml(lead.message) + "</td>" +
        "<td>" + lead.createdAt + "</td>" +
        '<td><a class="btn-small" href="leads.html">Assign</a></td>' +
        "</tr>";
    }
  }
  unassignedBody.innerHTML = leadsHtml || '<tr><td colspan="6" class="empty-cell">All leads are assigned.</td></tr>';

  const projectBody = document.getElementById("projectSummaryBody");
  let projectHtml = "";
  for (let i = 0; i < db.projects.length; i++) {
    const proj = db.projects[i];
    let projFlats = 0;
    let projAvail = 0;
    for (let f = 0; f < db.flats.length; f++) {
      if (db.flats[f].projectId === proj.id) {
        projFlats += 1;
        if (db.flats[f].status === "Available") {
          projAvail += 1;
        }
      }
    }
    projectHtml +=
      "<tr>" +
      "<td>" + proj.id + "</td>" +
      "<td>" + escapeHtml(proj.name) + "</td>" +
      "<td>" + escapeHtml(proj.location) + "</td>" +
      "<td>" + projFlats + "</td>" +
      "<td>" + projAvail + "</td>" +
      "</tr>";
  }
  projectBody.innerHTML = projectHtml || '<tr><td colspan="5" class="empty-cell">No projects created yet.</td></tr>';
}

function initProjectsPage() {
  const db = loadDatabase();

  const projectForm = document.getElementById("projectForm");
  const formTitle = document.getElementById("projectFormTitle");
  const editIdInput = document.getElementById("editProjectId");
  const nameInput = document.getElementById("projectNameInput");
  const locationInput = document.getElementById("projectLocationInput");
  const statusSelect = document.getElementById("projectStatusSelect");
  const descInput = document.getElementById("projectDescInput");
  const saveBtn = document.getElementById("saveProjectBtn");
  const cancelEditBtn = document.getElementById("cancelProjectEditBtn");
  const searchInput = document.getElementById("projectSearch");
  const tableBody = document.getElementById("projectTableBody");

  function resetForm() {
    editIdInput.value = "";
    nameInput.value = "";
    locationInput.value = "";
    statusSelect.value = "Ongoing";
    descInput.value = "";
    formTitle.textContent = "Add New Project";
    saveBtn.textContent = "Add Project";
    cancelEditBtn.classList.add("hidden");
    setFieldError("projectNameInput", "projectNameError", "");
    setFieldError("projectLocationInput", "projectLocationError", "");
    setFieldError("projectDescInput", "projectDescError", "");
  }

  function renderProjects() {
    const keyword = searchInput.value.trim().toLowerCase();
    let rowsHtml = "";

    for (let i = 0; i < db.projects.length; i++) {
      const p = db.projects[i];
      const target = (p.name + " " + p.location + " " + p.id).toLowerCase();
      if (target.indexOf(keyword) === -1) {
        continue;
      }

      let flatCount = 0;
      for (let f = 0; f < db.flats.length; f++) {
        if (db.flats[f].projectId === p.id) {
          flatCount += 1;
        }
      }

      rowsHtml +=
        "<tr>" +
        "<td>" + p.id + "</td>" +
        "<td><strong>" + escapeHtml(p.name) + "</strong></td>" +
        "<td>" + escapeHtml(p.location) + "</td>" +
        "<td>" + renderStatusBadge(p.status) + "</td>" +
        "<td>" + flatCount + "</td>" +
        "<td>" + escapeHtml(p.description) + "</td>" +
        "<td>" +
        '<button type="button" class="btn-small edit-proj-btn" data-id="' + p.id + '">Edit</button>' +
        '<button type="button" class="btn-small del-proj-btn" data-id="' + p.id + '">Remove</button>' +
        "</td>" +
        "</tr>";
    }

    tableBody.innerHTML = rowsHtml || '<tr><td colspan="7" class="empty-cell">No matching projects found.</td></tr>';

    const editBtns = tableBody.querySelectorAll(".edit-proj-btn");
    for (let i = 0; i < editBtns.length; i++) {
      editBtns[i].addEventListener("click", function () {
        const proj = findProjectById(db, this.getAttribute("data-id"));
        if (!proj) {
          return;
        }
        editIdInput.value = proj.id;
        nameInput.value = proj.name;
        locationInput.value = proj.location;
        statusSelect.value = proj.status;
        descInput.value = proj.description;
        formTitle.textContent = "Edit Project (" + proj.id + ")";
        saveBtn.textContent = "Update Project";
        cancelEditBtn.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    const delBtns = tableBody.querySelectorAll(".del-proj-btn");
    for (let i = 0; i < delBtns.length; i++) {
      delBtns[i].addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        let hasFlats = false;
        for (let f = 0; f < db.flats.length; f++) {
          if (db.flats[f].projectId === id) {
            hasFlats = true;
            break;
          }
        }
        if (hasFlats) {
          showToast("Remove all flats under this project before deleting it.");
          return;
        }
        db.projects = db.projects.filter(function (item) {
          return item.id !== id;
        });
        saveDatabase(db);
        if (editIdInput.value === id) {
          resetForm();
        }
        showToast("Project removed.");
        renderProjects();
      });
    }
  }

  projectForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = nameInput.value.trim();
    const location = locationInput.value.trim();
    const status = statusSelect.value;
    const desc = descInput.value.trim();
    let isValid = true;

    setFieldError("projectNameInput", "projectNameError", "");
    setFieldError("projectLocationInput", "projectLocationError", "");
    setFieldError("projectDescInput", "projectDescError", "");

    if (!name) {
      setFieldError("projectNameInput", "projectNameError", "Project name is required.");
      isValid = false;
    }
    if (!location) {
      setFieldError("projectLocationInput", "projectLocationError", "Location is required.");
      isValid = false;
    }
    if (!desc) {
      setFieldError("projectDescInput", "projectDescError", "Description is required.");
      isValid = false;
    }
    if (!isValid) {
      return;
    }

    if (editIdInput.value) {
      const proj = findProjectById(db, editIdInput.value);
      if (proj) {
        proj.name = name;
        proj.location = location;
        proj.status = status;
        proj.description = desc;
        showToast("Project updated successfully.");
      }
    } else {
      db.counters.project += 1;
      db.projects.push({
        id: "PRJ-" + padNumber(db.counters.project, 3),
        name: name,
        location: location,
        status: status,
        description: desc
      });
      showToast("New project added.");
    }

    saveDatabase(db);
    resetForm();
    renderProjects();
  });

  cancelEditBtn.addEventListener("click", resetForm);
  searchInput.addEventListener("input", renderProjects);

  renderProjects();
}

function initFlatsPage() {
  const db = loadDatabase();

  const flatForm = document.getElementById("flatForm");
  const formTitle = document.getElementById("flatFormTitle");
  const editFlatId = document.getElementById("editFlatId");
  const projectSelect = document.getElementById("flatProjectSelect");
  const numberInput = document.getElementById("flatNumberInput");
  const floorInput = document.getElementById("flatFloorInput");
  const sizeInput = document.getElementById("flatSizeInput");
  const bedroomsInput = document.getElementById("flatBedroomsInput");
  const priceInput = document.getElementById("flatPriceInput");
  const statusSelect = document.getElementById("flatStatusSelect");
  const floorPlanInput = document.getElementById("flatFloorPlanInput");
  const imageInput = document.getElementById("flatImageInput");
  const saveBtn = document.getElementById("saveFlatBtn");
  const cancelBtn = document.getElementById("cancelFlatEditBtn");

  const projectFilter = document.getElementById("flatProjectFilter");
  const statusFilter = document.getElementById("flatStatusFilter");
  const searchInput = document.getElementById("flatSearch");
  const tableBody = document.getElementById("flatTableBody");

  function populateProjectDropdowns() {
    let formOpts = "";
    let filterOpts = '<option value="All">All Projects</option>';
    for (let i = 0; i < db.projects.length; i++) {
      const p = db.projects[i];
      formOpts += '<option value="' + p.id + '">' + escapeHtml(p.name) + "</option>";
      filterOpts += '<option value="' + p.id + '">' + escapeHtml(p.name) + "</option>";
    }
    projectSelect.innerHTML = formOpts;
    projectFilter.innerHTML = filterOpts;
  }

  function resetForm() {
    editFlatId.value = "";
    numberInput.value = "";
    floorInput.value = "";
    sizeInput.value = "";
    bedroomsInput.value = "";
    priceInput.value = "";
    statusSelect.value = "Available";
    floorPlanInput.value = "";
    imageInput.value = "";
    formTitle.textContent = "Add New Flat";
    saveBtn.textContent = "Add Flat";
    cancelBtn.classList.add("hidden");
    setFieldError("flatProjectSelect", "flatProjectError", "");
    setFieldError("flatNumberInput", "flatNumberError", "");
    setFieldError("flatFloorInput", "flatFloorError", "");
    setFieldError("flatSizeInput", "flatSizeError", "");
    setFieldError("flatBedroomsInput", "flatBedroomsError", "");
    setFieldError("flatPriceInput", "flatPriceError", "");
  }

  function renderFlats() {
    const selectedProj = projectFilter.value;
    const selectedStatus = statusFilter.value;
    const keyword = searchInput.value.trim().toLowerCase();
    let rowsHtml = "";

    for (let i = 0; i < db.flats.length; i++) {
      const f = db.flats[i];
      if (selectedProj !== "All" && f.projectId !== selectedProj) {
        continue;
      }
      if (selectedStatus !== "All" && f.status !== selectedStatus) {
        continue;
      }
      const proj = findProjectById(db, f.projectId);
      const projName = proj ? proj.name : "Unknown";
      const target = (f.flatNo + " " + projName + " " + f.id).toLowerCase();
      if (target.indexOf(keyword) === -1) {
        continue;
      }

      const mediaText = (f.floorPlan ? "Plan" : "-") + " / " + (f.image ? "Img" : "-");

      rowsHtml +=
        "<tr>" +
        "<td>" + f.id + "</td>" +
        "<td>" + escapeHtml(projName) + "</td>" +
        "<td><strong>" + escapeHtml(f.flatNo) + "</strong></td>" +
        "<td>" + f.floor + "</td>" +
        "<td>" + f.sizeSqft + " sqft</td>" +
        "<td>" + f.bedrooms + "</td>" +
        "<td>" + formatCurrency(f.price) + "</td>" +
        "<td>" + mediaText + "</td>" +
        "<td>" + renderStatusBadge(f.status) + "</td>" +
        "<td>" +
        '<button type="button" class="btn-small edit-flat-btn" data-id="' + f.id + '">Edit</button>' +
        '<button type="button" class="btn-small del-flat-btn" data-id="' + f.id + '">Remove</button>' +
        "</td>" +
        "</tr>";
    }

    tableBody.innerHTML = rowsHtml || '<tr><td colspan="10" class="empty-cell">No flats match your filter.</td></tr>';

    const editBtns = tableBody.querySelectorAll(".edit-flat-btn");
    for (let i = 0; i < editBtns.length; i++) {
      editBtns[i].addEventListener("click", function () {
        const flat = findFlatById(db, this.getAttribute("data-id"));
        if (!flat) {
          return;
        }
        editFlatId.value = flat.id;
        projectSelect.value = flat.projectId;
        numberInput.value = flat.flatNo;
        floorInput.value = flat.floor;
        sizeInput.value = flat.sizeSqft;
        bedroomsInput.value = flat.bedrooms;
        priceInput.value = flat.price;
        statusSelect.value = flat.status;
        floorPlanInput.value = flat.floorPlan || "";
        imageInput.value = flat.image || "";
        formTitle.textContent = "Edit Flat (" + flat.id + ")";
        saveBtn.textContent = "Update Flat";
        cancelBtn.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    const delBtns = tableBody.querySelectorAll(".del-flat-btn");
    for (let i = 0; i < delBtns.length; i++) {
      delBtns[i].addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        db.flats = db.flats.filter(function (item) {
          return item.id !== id;
        });
        saveDatabase(db);
        if (editFlatId.value === id) {
          resetForm();
        }
        showToast("Flat removed from inventory.");
        renderFlats();
      });
    }
  }

  flatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const projectId = projectSelect.value;
    const flatNo = numberInput.value.trim();
    const floor = Number(floorInput.value);
    const sizeSqft = Number(sizeInput.value);
    const bedrooms = Number(bedroomsInput.value);
    const price = Number(priceInput.value);
    const status = statusSelect.value;
    const floorPlan = floorPlanInput.value.trim();
    const image = imageInput.value.trim();

    let isValid = true;
    setFieldError("flatProjectSelect", "flatProjectError", "");
    setFieldError("flatNumberInput", "flatNumberError", "");
    setFieldError("flatFloorInput", "flatFloorError", "");
    setFieldError("flatSizeInput", "flatSizeError", "");
    setFieldError("flatBedroomsInput", "flatBedroomsError", "");
    setFieldError("flatPriceInput", "flatPriceError", "");

    if (!projectId) {
      setFieldError("flatProjectSelect", "flatProjectError", "Select a project.");
      isValid = false;
    }
    if (!flatNo) {
      setFieldError("flatNumberInput", "flatNumberError", "Flat number is required.");
      isValid = false;
    }
    if (!floor || floor < 1) {
      setFieldError("flatFloorInput", "flatFloorError", "Enter a valid floor.");
      isValid = false;
    }
    if (!sizeSqft || sizeSqft < 200) {
      setFieldError("flatSizeInput", "flatSizeError", "Enter valid size in sqft.");
      isValid = false;
    }
    if (!bedrooms || bedrooms < 1) {
      setFieldError("flatBedroomsInput", "flatBedroomsError", "Enter bedroom count.");
      isValid = false;
    }
    if (!price || price < 100000) {
      setFieldError("flatPriceInput", "flatPriceError", "Enter valid price in BDT.");
      isValid = false;
    }
    if (!isValid) {
      return;
    }

    if (editFlatId.value) {
      const flat = findFlatById(db, editFlatId.value);
      if (flat) {
        flat.projectId = projectId;
        flat.flatNo = flatNo;
        flat.floor = floor;
        flat.sizeSqft = sizeSqft;
        flat.bedrooms = bedrooms;
        flat.price = price;
        flat.status = status;
        flat.floorPlan = floorPlan;
        flat.image = image;
        showToast("Flat details updated.");
      }
    } else {
      db.counters.flat += 1;
      db.flats.push({
        id: "FLT-" + padNumber(db.counters.flat, 3),
        projectId: projectId,
        flatNo: flatNo,
        floor: floor,
        sizeSqft: sizeSqft,
        bedrooms: bedrooms,
        price: price,
        status: status,
        floorPlan: floorPlan,
        image: image,
        featured: false
      });
      showToast("New flat added.");
    }

    saveDatabase(db);
    resetForm();
    renderFlats();
  });

  cancelBtn.addEventListener("click", resetForm);
  projectFilter.addEventListener("change", renderFlats);
  statusFilter.addEventListener("change", renderFlats);
  searchInput.addEventListener("input", renderFlats);

  populateProjectDropdowns();
  renderFlats();
}

function initUsersPage() {
  const db = loadDatabase();
  const userForm = document.getElementById("userForm");
  const nameInput = document.getElementById("userNameInput");
  const emailInput = document.getElementById("userEmailInput");
  const phoneInput = document.getElementById("userPhoneInput");
  const roleSelect = document.getElementById("userRoleSelect");
  const passInput = document.getElementById("userPassInput");
  const roleFilter = document.getElementById("userRoleFilter");
  const searchInput = document.getElementById("userSearch");
  const tableBody = document.getElementById("userTableBody");

  function renderUsers() {
    const users = getUsers();
    const selectedRole = roleFilter.value;
    const keyword = searchInput.value.trim().toLowerCase();
    const currentAdmin = getCurrentAdmin();
    let rowsHtml = "";

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      if (selectedRole !== "All" && u.role !== selectedRole) {
        continue;
      }
      const target = (u.name + " " + u.email + " " + u.phone + " " + u.id).toLowerCase();
      if (target.indexOf(keyword) === -1) {
        continue;
      }

      const roles = ["Admin", "Sales Agent", "Accounts Officer", "Customer"];
      let roleOpts = "";
      for (let r = 0; r < roles.length; r++) {
        const sel = roles[r] === u.role ? " selected" : "";
        roleOpts += '<option value="' + roles[r] + '"' + sel + ">" + roles[r] + "</option>";
      }

      const toggleLabel = u.status === "Active" ? "Deactivate" : "Activate";
      const isSelf = u.email === currentAdmin.email;

      rowsHtml +=
        "<tr>" +
        "<td>" + u.id + "</td>" +
        "<td><strong>" + escapeHtml(u.name) + "</strong></td>" +
        "<td>" + escapeHtml(u.email) + "</td>" +
        "<td>" + escapeHtml(u.phone) + "</td>" +
        '<td><select class="role-change-select" data-id="' + u.id + '"' + (isSelf ? " disabled" : "") + ">" + roleOpts + "</select></td>" +
        "<td>" + renderStatusBadge(u.status) + "</td>" +
        "<td>" +
        (isSelf
          ? '<span class="subtitle">Current User</span>'
          : '<button type="button" class="btn-small toggle-user-btn" data-id="' + u.id + '">' + toggleLabel + "</button>") +
        "</td>" +
        "</tr>";
    }

    tableBody.innerHTML = rowsHtml || '<tr><td colspan="7" class="empty-cell">No matching users found.</td></tr>';

    const roleSelects = tableBody.querySelectorAll(".role-change-select");
    for (let i = 0; i < roleSelects.length; i++) {
      roleSelects[i].addEventListener("change", function () {
        const allUsers = getUsers();
        const uid = this.getAttribute("data-id");
        for (let j = 0; j < allUsers.length; j++) {
          if (allUsers[j].id === uid) {
            allUsers[j].role = this.value;
            break;
          }
        }
        saveUsers(allUsers);
        showToast("User role updated.");
      });
    }

    const toggleBtns = tableBody.querySelectorAll(".toggle-user-btn");
    for (let i = 0; i < toggleBtns.length; i++) {
      toggleBtns[i].addEventListener("click", function () {
        const allUsers = getUsers();
        const uid = this.getAttribute("data-id");
        for (let j = 0; j < allUsers.length; j++) {
          if (allUsers[j].id === uid) {
            allUsers[j].status = allUsers[j].status === "Active" ? "Inactive" : "Active";
            break;
          }
        }
        saveUsers(allUsers);
        showToast("User account status updated.");
        renderUsers();
      });
    }
  }

  userForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();
    const role = roleSelect.value;
    const pass = passInput.value.trim();
    const users = getUsers();

    let isValid = true;
    setFieldError("userNameInput", "userNameError", "");
    setFieldError("userEmailInput", "userEmailError", "");
    setFieldError("userPhoneInput", "userPhoneError", "");
    setFieldError("userPassInput", "userPassError", "");

    if (!name) {
      setFieldError("userNameInput", "userNameError", "Full name is required.");
      isValid = false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      setFieldError("userEmailInput", "userEmailError", "Enter a valid email address.");
      isValid = false;
    } else if (findUserByEmail(email)) {
      setFieldError("userEmailInput", "userEmailError", "This email is already registered.");
      isValid = false;
    }
    if (!phone || phone.length < 7) {
      setFieldError("userPhoneInput", "userPhoneError", "Enter a valid phone number.");
      isValid = false;
    }
    if (!pass || pass.length < 8) {
      setFieldError("userPassInput", "userPassError", "Password must be at least 8 characters.");
      isValid = false;
    }
    if (!isValid) {
      return;
    }

    db.counters.user += 1;
    users.push({
      id: "USR-" + padNumber(db.counters.user, 3),
      name: name,
      email: email,
      phone: phone,
      role: role,
      status: "Active",
      pass: pass
    });

    saveUsers(users);
    saveDatabase(db);
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
    passInput.value = "";
    showToast("User account created successfully.");
    renderUsers();
  });

  roleFilter.addEventListener("change", renderUsers);
  searchInput.addEventListener("input", renderUsers);

  renderUsers();
}

function initLeadsPage() {
  const db = loadDatabase();
  const statusFilter = document.getElementById("leadStatusFilter");
  const searchInput = document.getElementById("leadSearch");
  const tableBody = document.getElementById("leadTableBody");

  const modal = document.getElementById("assignLeadModal");
  const modalSubtitle = document.getElementById("leadModalSubtitle");
  const agentSelect = document.getElementById("agentAssignSelect");
  const closeModalBtn = document.getElementById("closeLeadModalBtn");
  const cancelModalBtn = document.getElementById("cancelLeadModalBtn");
  const confirmBtn = document.getElementById("confirmAssignBtn");

  let selectedLeadId = null;

  function closeModal() {
    modal.classList.remove("open");
    selectedLeadId = null;
    setFieldError("agentAssignSelect", "agentAssignError", "");
  }

  function openAssignModal(leadId) {
    let lead = null;
    for (let i = 0; i < db.leads.length; i++) {
      if (db.leads[i].id === leadId) {
        lead = db.leads[i];
        break;
      }
    }
    if (!lead) {
      return;
    }

    const users = getUsers();
    let opts = '<option value="">Choose a Sales Agent</option>';
    for (let i = 0; i < users.length; i++) {
      if (users[i].role === "Sales Agent" && users[i].status === "Active") {
        const sel = users[i].email === lead.agentEmail ? " selected" : "";
        opts += '<option value="' + users[i].email + '"' + sel + ">" + escapeHtml(users[i].name) + "</option>";
      }
    }
    agentSelect.innerHTML = opts;

    selectedLeadId = lead.id;
    modalSubtitle.textContent = lead.id + " - " + lead.customerName + " (" + lead.customerPhone + ")";
    setFieldError("agentAssignSelect", "agentAssignError", "");
    modal.classList.add("open");
  }

  function renderLeads() {
    const selectedStatus = statusFilter.value;
    const keyword = searchInput.value.trim().toLowerCase();
    let rowsHtml = "";

    for (let i = 0; i < db.leads.length; i++) {
      const lead = db.leads[i];
      if (selectedStatus !== "All" && lead.status !== selectedStatus) {
        continue;
      }

      const flat = findFlatById(db, lead.flatId);
      const proj = flat ? findProjectById(db, flat.projectId) : null;
      const flatLabel = flat ? (proj ? proj.name + " " : "") + flat.flatNo : "-";
      const agent = lead.agentEmail ? findUserByEmail(lead.agentEmail) : null;
      const agentName = agent ? agent.name : "Unassigned";

      const target = (lead.customerName + " " + flatLabel + " " + agentName + " " + lead.id).toLowerCase();
      if (target.indexOf(keyword) === -1) {
        continue;
      }

      rowsHtml +=
        "<tr>" +
        "<td>" + lead.id + "</td>" +
        "<td><strong>" + escapeHtml(lead.customerName) + "</strong><br><span class=\"subtitle\">" + escapeHtml(lead.customerPhone) + "</span></td>" +
        "<td>" + escapeHtml(flatLabel) + "</td>" +
        "<td>" + escapeHtml(lead.message) + "</td>" +
        "<td>" + lead.createdAt + "</td>" +
        "<td>" + escapeHtml(agentName) + "</td>" +
        "<td>" + renderStatusBadge(lead.status) + "</td>" +
        '<td><button type="button" class="btn-small assign-lead-btn" data-id="' + lead.id + '">' + (lead.agentEmail ? "Reassign" : "Assign") + "</button></td>" +
        "</tr>";
    }

    tableBody.innerHTML = rowsHtml || '<tr><td colspan="8" class="empty-cell">No leads match your filter.</td></tr>';

    const assignBtns = tableBody.querySelectorAll(".assign-lead-btn");
    for (let i = 0; i < assignBtns.length; i++) {
      assignBtns[i].addEventListener("click", function () {
        openAssignModal(this.getAttribute("data-id"));
      });
    }
  }

  confirmBtn.addEventListener("click", function () {
    const agentEmail = agentSelect.value;
    if (!agentEmail) {
      setFieldError("agentAssignSelect", "agentAssignError", "Please select a sales agent.");
      return;
    }

    for (let i = 0; i < db.leads.length; i++) {
      if (db.leads[i].id === selectedLeadId) {
        db.leads[i].agentEmail = agentEmail;
        if (db.leads[i].status === "Unassigned") {
          db.leads[i].status = "Assigned";
        }
        break;
      }
    }

    saveDatabase(db);
    closeModal();
    showToast("Lead assigned to sales agent.");
    renderLeads();
  });

  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  statusFilter.addEventListener("change", renderLeads);
  searchInput.addEventListener("input", renderLeads);

  renderLeads();
}

function initBookingsPage() {
  const db = loadDatabase();
  const statusFilter = document.getElementById("bookingStatusFilter");
  const searchInput = document.getElementById("bookingSearch");
  const tableBody = document.getElementById("bookingTableBody");

  function renderBookings() {
    const selectedStatus = statusFilter.value;
    const keyword = searchInput.value.trim().toLowerCase();
    let rowsHtml = "";

    for (let i = 0; i < db.bookings.length; i++) {
      const b = db.bookings[i];
      if (selectedStatus !== "All" && b.status !== selectedStatus) {
        continue;
      }

      const flat = findFlatById(db, b.flatId);
      const proj = flat ? findProjectById(db, flat.projectId) : null;
      const flatLabel = flat ? (proj ? proj.name + " " : "") + flat.flatNo : b.flatId;
      const price = flat ? flat.price : 0;
      const agent = findUserByEmail(b.agentEmail);
      const agentName = agent ? agent.name : b.agentEmail;

      const target = (b.id + " " + b.customerName + " " + flatLabel).toLowerCase();
      if (target.indexOf(keyword) === -1) {
        continue;
      }

      let actionBtns = "";
      if (b.status === "Pending") {
        actionBtns =
          '<button type="button" class="btn-small confirm-bkg-btn" data-id="' + b.id + '">Confirm</button>' +
          '<button type="button" class="btn-small cancel-bkg-btn" data-id="' + b.id + '">Cancel</button>';
      } else if (b.status === "Confirmed") {
        actionBtns = '<button type="button" class="btn-small cancel-bkg-btn" data-id="' + b.id + '">Cancel</button>';
      } else {
        actionBtns = "-";
      }

      rowsHtml +=
        "<tr>" +
        "<td><strong>" + b.id + "</strong></td>" +
        "<td>" + escapeHtml(b.customerName) + "</td>" +
        "<td>" + escapeHtml(flatLabel) + "</td>" +
        "<td>" + escapeHtml(agentName) + "</td>" +
        "<td>" + b.bookingDate + "</td>" +
        "<td>" + formatCurrency(b.bookingMoney) + "</td>" +
        "<td>" + formatCurrency(price) + "</td>" +
        "<td>" + renderStatusBadge(b.status) + "</td>" +
        "<td>" + actionBtns + "</td>" +
        "</tr>";
    }

    tableBody.innerHTML = rowsHtml || '<tr><td colspan="9" class="empty-cell">No bookings match your filter.</td></tr>';

    const confirmBtns = tableBody.querySelectorAll(".confirm-bkg-btn");
    for (let i = 0; i < confirmBtns.length; i++) {
      confirmBtns[i].addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        for (let j = 0; j < db.bookings.length; j++) {
          if (db.bookings[j].id === id) {
            db.bookings[j].status = "Confirmed";
            const flat = findFlatById(db, db.bookings[j].flatId);
            if (flat) {
              flat.status = "Booked";
            }
            break;
          }
        }
        saveDatabase(db);
        showToast("Booking confirmed.");
        renderBookings();
      });
    }

    const cancelBtns = tableBody.querySelectorAll(".cancel-bkg-btn");
    for (let i = 0; i < cancelBtns.length; i++) {
      cancelBtns[i].addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        for (let j = 0; j < db.bookings.length; j++) {
          if (db.bookings[j].id === id) {
            db.bookings[j].status = "Cancelled";
            const flat = findFlatById(db, db.bookings[j].flatId);
            if (flat && flat.status === "Booked") {
              flat.status = "Available";
            }
            break;
          }
        }
        saveDatabase(db);
        showToast("Booking cancelled and flat status updated.");
        renderBookings();
      });
    }
  }

  statusFilter.addEventListener("change", renderBookings);
  searchInput.addEventListener("input", renderBookings);

  renderBookings();
}

function initReportsPage() {
  const db = loadDatabase();
  const users = getUsers();
  const today = getTodayDate();

  const startObj = new Date();
  startObj.setDate(1);
  startObj.setMonth(startObj.getMonth() - 5);

  const fromInput = document.getElementById("reportFrom");
  const toInput = document.getElementById("reportTo");
  const applyBtn = document.getElementById("applyReportBtn");
  const printBtn = document.getElementById("printReportBtn");
  const exportBtn = document.getElementById("exportCsvBtn");

  fromInput.value = formatDateISO(startObj);
  toInput.value = today;

  function renderAnalytics() {
    const fromDate = fromInput.value;
    const toDate = toInput.value;

    if (!fromDate || !toDate || fromDate > toDate) {
      showToast("Please select a valid date range.");
      return;
    }

    let totalRevenue = 0;
    let flatsSoldOrBooked = 0;
    let availableValue = 0;

    for (let i = 0; i < db.flats.length; i++) {
      const f = db.flats[i];
      if (f.status === "Sold" || f.status === "Booked") {
        flatsSoldOrBooked += 1;
        totalRevenue += f.price;
      } else {
        availableValue += f.price;
      }
    }

    let closedLeads = 0;
    for (let i = 0; i < db.leads.length; i++) {
      if (db.leads[i].status === "Closed") {
        closedLeads += 1;
      }
    }
    const conversionRate = db.leads.length > 0 ? Math.round((closedLeads / db.leads.length) * 100) : 0;

    document.getElementById("repRevenue").textContent = formatCurrency(totalRevenue);
    document.getElementById("repFlatsSold").textContent = String(flatsSoldOrBooked);
    document.getElementById("repAvailableValue").textContent = formatCurrency(availableValue);
    document.getElementById("repConversion").textContent = conversionRate + "%";

    const monthlyMap = {};
    const monthKeys = [];
    let currentMonth = fromDate.slice(0, 7);
    const endMonth = toDate.slice(0, 7);

    while (currentMonth <= endMonth) {
      monthKeys.push(currentMonth);
      monthlyMap[currentMonth] = { bookings: 0, revenue: 0, bookingMoney: 0 };
      currentMonth = addMonths(currentMonth + "-01", 1).slice(0, 7);
    }

    for (let i = 0; i < db.bookings.length; i++) {
      const b = db.bookings[i];
      if (b.status !== "Cancelled" && b.bookingDate >= fromDate && b.bookingDate <= toDate) {
        const key = b.bookingDate.slice(0, 7);
        if (monthlyMap[key]) {
          const flat = findFlatById(db, b.flatId);
          monthlyMap[key].bookings += 1;
          monthlyMap[key].revenue += flat ? flat.price : 0;
          monthlyMap[key].bookingMoney += b.bookingMoney;
        }
      }
    }

    let maxRevenue = 1;
    for (let i = 0; i < monthKeys.length; i++) {
      if (monthlyMap[monthKeys[i]].revenue > maxRevenue) {
        maxRevenue = monthlyMap[monthKeys[i]].revenue;
      }
    }

    let monthlyHtml = "";
    for (let i = 0; i < monthKeys.length; i++) {
      const key = monthKeys[i];
      const m = monthlyMap[key];
      const barWidth = Math.round((m.revenue / maxRevenue) * 100);
      monthlyHtml +=
        "<tr>" +
        "<td>" + key + "</td>" +
        "<td>" + m.bookings + "</td>" +
        "<td><strong>" + formatCurrency(m.revenue) + "</strong></td>" +
        "<td>" + formatCurrency(m.bookingMoney) + "</td>" +
        '<td><div class="bar-track"><div class="bar-fill" style="width:' + barWidth + '%"></div></div></td>' +
        "</tr>";
    }
    document.getElementById("monthlySalesBody").innerHTML = monthlyHtml;

    let projectHtml = "";
    for (let i = 0; i < db.projects.length; i++) {
      const proj = db.projects[i];
      let totalFlats = 0;
      let avail = 0;
      let occupied = 0;
      let revenue = 0;

      for (let f = 0; f < db.flats.length; f++) {
        const flat = db.flats[f];
        if (flat.projectId === proj.id) {
          totalFlats += 1;
          if (flat.status === "Available") {
            avail += 1;
          } else {
            occupied += 1;
            revenue += flat.price;
          }
        }
      }

      const occPercent = totalFlats > 0 ? ((occupied / totalFlats) * 100).toFixed(1) + "%" : "0.0%";
      projectHtml +=
        "<tr>" +
        "<td>" + escapeHtml(proj.name) + "</td>" +
        "<td>" + totalFlats + "</td>" +
        "<td>" + avail + "</td>" +
        "<td>" + occupied + "</td>" +
        "<td>" + formatCurrency(revenue) + "</td>" +
        "<td>" + occPercent + "</td>" +
        "</tr>";
    }
    document.getElementById("projectAnalyticsBody").innerHTML = projectHtml;

    let agentHtml = "";
    for (let i = 0; i < users.length; i++) {
      if (users[i].role !== "Sales Agent") {
        continue;
      }
      const agent = users[i];
      let leadCount = 0;
      let bkgCount = 0;
      let salesVal = 0;

      for (let l = 0; l < db.leads.length; l++) {
        if (db.leads[l].agentEmail === agent.email) {
          leadCount += 1;
        }
      }
      for (let b = 0; b < db.bookings.length; b++) {
        if (db.bookings[b].agentEmail === agent.email && db.bookings[b].status !== "Cancelled") {
          bkgCount += 1;
          const flat = findFlatById(db, db.bookings[b].flatId);
          salesVal += flat ? flat.price : 0;
        }
      }

      agentHtml +=
        "<tr>" +
        "<td>" + escapeHtml(agent.name) + "</td>" +
        "<td>" + leadCount + "</td>" +
        "<td>" + bkgCount + "</td>" +
        "<td>" + formatCurrency(salesVal) + "</td>" +
        "</tr>";
    }
    document.getElementById("agentAnalyticsBody").innerHTML = agentHtml;
  }

  function exportReportToCsv() {
    const tables = document.querySelectorAll(".content table");
    const lines = [];

    for (let t = 0; t < tables.length; t++) {
      const rows = tables[t].rows;
      for (let r = 0; r < rows.length; r++) {
        const cells = rows[r].cells;
        const rowValues = [];
        for (let c = 0; c < cells.length; c++) {
          const text = cells[c].innerText.trim().replace(/"/g, '""');
          rowValues.push('"' + text + '"');
        }
        lines.push(rowValues.join(","));
      }
      lines.push("");
    }

    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "flatnest-sales-analytics.csv";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast("CSV analytics report downloaded.");
  }

  applyBtn.addEventListener("click", renderAnalytics);
  printBtn.addEventListener("click", function () {
    window.print();
  });
  exportBtn.addEventListener("click", exportReportToCsv);

  renderAnalytics();
}

function initContentPage() {
  const db = loadDatabase();

  const bannerForm = document.getElementById("bannerForm");
  const headlineInput = document.getElementById("bannerHeadlineInput");
  const subtextInput = document.getElementById("bannerSubtextInput");
  const ctaInput = document.getElementById("bannerCtaInput");

  const featuredBody = document.getElementById("featuredFlatsBody");

  const annForm = document.getElementById("announcementForm");
  const annTitleInput = document.getElementById("annTitleInput");
  const annDateInput = document.getElementById("annDateInput");
  const annMessageInput = document.getElementById("annMessageInput");
  const annTableBody = document.getElementById("announcementTableBody");

  headlineInput.value = db.banner.headline;
  subtextInput.value = db.banner.subtext;
  ctaInput.value = db.banner.ctaText;
  annDateInput.value = getTodayDate();

  bannerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const headline = headlineInput.value.trim();
    const subtext = subtextInput.value.trim();
    const cta = ctaInput.value.trim();

    let isValid = true;
    setFieldError("bannerHeadlineInput", "bannerHeadlineError", "");
    setFieldError("bannerSubtextInput", "bannerSubtextError", "");
    setFieldError("bannerCtaInput", "bannerCtaError", "");

    if (!headline) {
      setFieldError("bannerHeadlineInput", "bannerHeadlineError", "Headline is required.");
      isValid = false;
    }
    if (!subtext) {
      setFieldError("bannerSubtextInput", "bannerSubtextError", "Subtitle is required.");
      isValid = false;
    }
    if (!cta) {
      setFieldError("bannerCtaInput", "bannerCtaError", "Button text is required.");
      isValid = false;
    }
    if (!isValid) {
      return;
    }

    db.banner.headline = headline;
    db.banner.subtext = subtext;
    db.banner.ctaText = cta;
    saveDatabase(db);
    showToast("Home page banner updated.");
  });

  function renderFeaturedFlats() {
    let rowsHtml = "";
    for (let i = 0; i < db.flats.length; i++) {
      const f = db.flats[i];
      const proj = findProjectById(db, f.projectId);
      const projName = proj ? proj.name : "-";
      const featLabel = f.featured ? "Yes" : "No";
      const btnText = f.featured ? "Unfeature" : "Feature";

      rowsHtml +=
        "<tr>" +
        "<td>" + f.id + "</td>" +
        "<td>" + escapeHtml(projName) + "</td>" +
        "<td><strong>" + escapeHtml(f.flatNo) + "</strong></td>" +
        "<td>" + formatCurrency(f.price) + "</td>" +
        "<td>" + renderStatusBadge(f.status) + "</td>" +
        "<td>" + featLabel + "</td>" +
        '<td><button type="button" class="btn-small toggle-feat-btn" data-id="' + f.id + '">' + btnText + "</button></td>" +
        "</tr>";
    }
    featuredBody.innerHTML = rowsHtml || '<tr><td colspan="7" class="empty-cell">No flats available.</td></tr>';

    const btns = featuredBody.querySelectorAll(".toggle-feat-btn");
    for (let i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        const flat = findFlatById(db, this.getAttribute("data-id"));
        if (flat) {
          flat.featured = !flat.featured;
          saveDatabase(db);
          showToast(flat.featured ? "Flat added to featured list." : "Flat removed from featured list.");
          renderFeaturedFlats();
        }
      });
    }
  }

  function renderAnnouncements() {
    let rowsHtml = "";
    for (let i = 0; i < db.announcements.length; i++) {
      const a = db.announcements[i];
      const statusText = a.active ? "Active" : "Inactive";
      const toggleText = a.active ? "Hide" : "Show";

      rowsHtml +=
        "<tr>" +
        "<td>" + a.id + "</td>" +
        "<td><strong>" + escapeHtml(a.title) + "</strong></td>" +
        "<td>" + escapeHtml(a.message) + "</td>" +
        "<td>" + a.date + "</td>" +
        "<td>" + renderStatusBadge(statusText) + "</td>" +
        "<td>" +
        '<button type="button" class="btn-small toggle-ann-btn" data-id="' + a.id + '">' + toggleText + "</button>" +
        '<button type="button" class="btn-small del-ann-btn" data-id="' + a.id + '">Delete</button>' +
        "</td>" +
        "</tr>";
    }
    annTableBody.innerHTML = rowsHtml || '<tr><td colspan="6" class="empty-cell">No announcements published yet.</td></tr>';

    const toggleBtns = annTableBody.querySelectorAll(".toggle-ann-btn");
    for (let i = 0; i < toggleBtns.length; i++) {
      toggleBtns[i].addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        for (let j = 0; j < db.announcements.length; j++) {
          if (db.announcements[j].id === id) {
            db.announcements[j].active = !db.announcements[j].active;
            break;
          }
        }
        saveDatabase(db);
        showToast("Announcement visibility updated.");
        renderAnnouncements();
      });
    }

    const delBtns = annTableBody.querySelectorAll(".del-ann-btn");
    for (let i = 0; i < delBtns.length; i++) {
      delBtns[i].addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        db.announcements = db.announcements.filter(function (item) {
          return item.id !== id;
        });
        saveDatabase(db);
        showToast("Announcement deleted.");
        renderAnnouncements();
      });
    }
  }

  annForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const title = annTitleInput.value.trim();
    const date = annDateInput.value;
    const message = annMessageInput.value.trim();

    let isValid = true;
    setFieldError("annTitleInput", "annTitleError", "");
    setFieldError("annDateInput", "annDateError", "");
    setFieldError("annMessageInput", "annMessageError", "");

    if (!title) {
      setFieldError("annTitleInput", "annTitleError", "Title is required.");
      isValid = false;
    }
    if (!date) {
      setFieldError("annDateInput", "annDateError", "Publish date is required.");
      isValid = false;
    }
    if (!message) {
      setFieldError("annMessageInput", "annMessageError", "Announcement message is required.");
      isValid = false;
    }
    if (!isValid) {
      return;
    }

    db.counters.announcement += 1;
    db.announcements.unshift({
      id: "ANN-" + padNumber(db.counters.announcement, 3),
      title: title,
      message: message,
      date: date,
      active: true
    });

    saveDatabase(db);
    annTitleInput.value = "";
    annMessageInput.value = "";
    showToast("Announcement published.");
    renderAnnouncements();
  });

  renderFeaturedFlats();
  renderAnnouncements();
}

document.addEventListener("DOMContentLoaded", function () {
  const page = document.body.getAttribute("data-page");

  if (page === "login") {
    initLoginPage();
    return;
  }

  if (!localStorage.getItem(STORAGE_KEYS.activeUser)) {
    window.location.href = "login.html";
    return;
  }

  setupSidebar();

  switch (page) {
    case "dashboard":
      initDashboardPage();
      break;
    case "projects":
      initProjectsPage();
      break;
    case "flats":
      initFlatsPage();
      break;
    case "users":
      initUsersPage();
      break;
    case "leads":
      initLeadsPage();
      break;
    case "bookings":
      initBookingsPage();
      break;
    case "reports":
      initReportsPage();
      break;
    case "content":
      initContentPage();
      break;
    default:
      break;
  }
});
