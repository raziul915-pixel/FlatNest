const STORAGE_KEYS = {
  users: "flatnest_agent_users",
  activeUser: "flatnest_active_agent",
  database: "flatnest_agent_db"
};

const FOLLOW_UP_OPTIONS = ["Pending", "Contacted", "Interested", "Not Interested"];
const STAGE_LABELS = ["No Activity", "Inquiry", "Visited", "Booking Requested", "Booking Confirmed"];

let toastTimer = null;

/* ---------- helpers ---------- */

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

function formatCurrency(amount) {
  return "\u09F3 " + Math.round(amount).toLocaleString("en-US");
}

function formatTime(time24) {
  const parts = time24.split(":");
  let hour = Number(parts[0]);
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) {
    hour = 12;
  }
  return hour + ":" + parts[1] + " " + suffix;
}

function escapeHtml(value) {
  return String(value)
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

function renderBadge(text) {
  let cls = "badge-due";
  if (text === "Confirmed" || text === "Completed" || text === "Replied" || text === "Available") {
    cls = "badge-paid";
  } else if (text === "Cancelled" || text === "Sold") {
    cls = "badge-overdue";
  } else if (text === "Accepted" || text === "Rescheduled" || text === "New") {
    cls = "badge-info";
  }
  return '<span class="badge ' + cls + '">' + text + "</span>";
}

function openModal(modalEl) {
  modalEl.classList.add("open");
}

function closeModalEl(modalEl) {
  modalEl.classList.remove("open");
}

function wireModalClose(modalEl, buttonIds, onClose) {
  for (let i = 0; i < buttonIds.length; i++) {
    document.getElementById(buttonIds[i]).addEventListener("click", onClose);
  }
  modalEl.addEventListener("click", function (event) {
    if (event.target === modalEl) {
      onClose();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modalEl.classList.contains("open")) {
      onClose();
    }
  });
}

/* ---------- users ---------- */

function getUsers() {
  const stored = localStorage.getItem(STORAGE_KEYS.users);
  if (stored) {
    return JSON.parse(stored);
  }
  const defaultUsers = [
    {
      name: "Samiya Sultana",
      email: "samiya.sultana@flatnest.com",
      pass: "Samiya@123"
    }
  ];
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function getCurrentAgent() {
  const activeEmail = localStorage.getItem(STORAGE_KEYS.activeUser);
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === activeEmail) {
      return users[i];
    }
  }
  return { name: "Samiya Sultana", email: "samiya.sultana@flatnest.com" };
}

/* ---------- database ---------- */

function buildInitialDatabase() {
  const today = getTodayDate();
  const agent = getCurrentAgent();

  const customerSeed = [
    ["Ayesha Rahman", "01711-100001", "ayesha.rahman@example.com"],
    ["Tanvir Ahmed", "01711-100002", "tanvir.ahmed@example.com"],
    ["Nusrat Jahan", "01711-100003", "nusrat.jahan@example.com"],
    ["Rafiq Hasan", "01711-100004", "rafiq.hasan@example.com"],
    ["Farhana Akter", "01711-100005", "farhana.akter@example.com"],
    ["Imran Hossain", "01711-100006", "imran.hossain@example.com"],
    ["Sabrina Karim", "01711-100007", "sabrina.karim@example.com"],
    ["Mahmud Alam", "01711-100008", "mahmud.alam@example.com"],
    ["Kamal Uddin", "01711-100009", "kamal.uddin@example.com"],
    ["Tasnia Islam", "01711-100010", "tasnia.islam@example.com"]
  ];

  const flatSeed = [
    ["Green Valley", "B-402", 5500000, "Sold"],
    ["Lake View", "A-701", 7200000, "Booked"],
    ["Sunrise Heights", "C-305", 4800000, "Booked"],
    ["Green Valley", "A-1101", 6300000, "Booked"],
    ["Lake View", "B-203", 5000000, "Booked"],
    ["Sunrise Heights", "A-902", 8000000, "Booked"],
    ["Green Valley", "C-604", 4200000, "Booked"],
    ["Lake View", "D-801", 6000000, "Available"],
    ["Green Valley", "A-501", 5900000, "Available"],
    ["Lake View", "C-402", 5400000, "Available"],
    ["Sunrise Heights", "B-1003", 6800000, "Available"]
  ];

  const db = {
    customers: [],
    flats: [],
    inquiries: [],
    visits: [],
    bookings: []
  };

  for (let i = 0; i < customerSeed.length; i++) {
    db.customers.push({
      id: "CUS-" + padNumber(i + 1, 3),
      name: customerSeed[i][0],
      phone: customerSeed[i][1],
      email: customerSeed[i][2],
      notes: []
    });
  }

  for (let i = 0; i < flatSeed.length; i++) {
    db.flats.push({
      id: "FLT-" + padNumber(i + 1, 3),
      projectName: flatSeed[i][0],
      flatNo: flatSeed[i][1],
      price: flatSeed[i][2],
      status: flatSeed[i][3]
    });
  }

  // [customerIndex, flatIndex, daysAgo, status]
  const bookingSeed = [
    [0, 0, 230, "Confirmed"],
    [1, 1, 200, "Confirmed"],
    [2, 2, 170, "Confirmed"],
    [3, 3, 140, "Confirmed"],
    [4, 4, 110, "Confirmed"],
    [5, 5, 80, "Confirmed"],
    [6, 6, 50, "Confirmed"],
    [7, 7, 4, "Pending"],
    [8, 8, 1, "Pending"],
    [9, 9, 0, "Pending"]
  ];

  for (let i = 0; i < bookingSeed.length; i++) {
    const s = bookingSeed[i];
    db.bookings.push({
      id: "BKG-" + padNumber(i + 1, 3),
      customerId: db.customers[s[0]].id,
      flatId: db.flats[s[1]].id,
      date: addDays(today, -s[2]),
      bookingMoney: Math.round(db.flats[s[1]].price * 0.15),
      status: s[3]
    });
  }

  // [customerIndex, flatIndex, daysAgo, message, status, followUp]
  const inquirySeed = [
    [8, 8, 1, "Is the price negotiable? Can I get a payment plan with 12 installments?", "New", "Pending"],
    [9, 9, 0, "Does this flat have a south-facing balcony?", "New", "Pending"],
    [7, 7, 6, "Please confirm that one parking space is included.", "Replied", "Interested"],
    [8, 10, 2, "I am also interested in this flat. What is the handover date?", "New", "Pending"],
    [9, 7, 3, "Is flat D-801 still available?", "Replied", "Contacted"]
  ];

  for (let i = 0; i < inquirySeed.length; i++) {
    const s = inquirySeed[i];
    const replies = [];
    if (s[4] === "Replied") {
      replies.push({
        text: "Thank you for your interest. We will share the details and arrange a call shortly.",
        date: addDays(today, -s[2] + 1),
        by: agent.name
      });
    }
    db.inquiries.push({
      id: "INQ-" + padNumber(i + 1, 3),
      customerId: db.customers[s[0]].id,
      flatId: db.flats[s[1]].id,
      date: addDays(today, -s[2]),
      message: s[3],
      status: s[4],
      followUp: s[5],
      replies: replies
    });
  }

  // [customerIndex, flatIndex, dayOffset, time, status]
  const visitSeed = [
    [8, 8, 2, "10:30", "Pending"],
    [9, 9, 3, "15:00", "Pending"],
    [7, 7, 1, "11:00", "Accepted"],
    [7, 7, -5, "16:00", "Completed"],
    [9, 7, 5, "12:00", "Accepted"],
    [8, 10, -1, "14:00", "Accepted"]
  ];

  for (let i = 0; i < visitSeed.length; i++) {
    const s = visitSeed[i];
    db.visits.push({
      id: "VST-" + padNumber(i + 1, 3),
      customerId: db.customers[s[0]].id,
      flatId: db.flats[s[1]].id,
      date: addDays(today, s[2]),
      time: s[3],
      status: s[4]
    });
  }

  db.customers[7].notes.push({ text: "Prefers ground-level parking. Wants to finalise this month.", date: addDays(today, -4) });
  db.customers[8].notes.push({ text: "Asked for a 12-month installment plan. Call back after the site visit.", date: addDays(today, -1) });

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

function findById(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return list[i];
    }
  }
  return null;
}

function flatLabel(flat) {
  return flat.projectName + " " + flat.flatNo;
}

function getCustomerStage(db, customerId) {
  let stage = 0;
  for (let i = 0; i < db.inquiries.length; i++) {
    if (db.inquiries[i].customerId === customerId && stage < 1) {
      stage = 1;
    }
  }
  for (let i = 0; i < db.visits.length; i++) {
    if (db.visits[i].customerId === customerId && db.visits[i].status === "Completed" && stage < 2) {
      stage = 2;
    }
  }
  for (let i = 0; i < db.bookings.length; i++) {
    const b = db.bookings[i];
    if (b.customerId !== customerId) {
      continue;
    }
    if (b.status === "Pending" && stage < 3) {
      stage = 3;
    }
    if (b.status === "Confirmed") {
      stage = 4;
    }
  }
  return stage;
}

function getCustomerFlats(db, customerId) {
  const names = [];
  function addFlat(flatId) {
    const flat = findById(db.flats, flatId);
    if (flat && names.indexOf(flat.flatNo) === -1) {
      names.push(flat.flatNo);
    }
  }
  for (let i = 0; i < db.inquiries.length; i++) {
    if (db.inquiries[i].customerId === customerId) {
      addFlat(db.inquiries[i].flatId);
    }
  }
  for (let i = 0; i < db.visits.length; i++) {
    if (db.visits[i].customerId === customerId) {
      addFlat(db.visits[i].flatId);
    }
  }
  for (let i = 0; i < db.bookings.length; i++) {
    if (db.bookings[i].customerId === customerId) {
      addFlat(db.bookings[i].flatId);
    }
  }
  return names.join(", ") || "-";
}

function setupSidebar() {
  const agent = getCurrentAgent();
  const agentNameEl = document.getElementById("agentName");
  if (agentNameEl) {
    agentNameEl.textContent = agent.name;
  }
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem(STORAGE_KEYS.activeUser);
      window.location.href = "login.html";
    });
  }
}

/* ---------- login ---------- */

function initLoginPage() {
  getUsers();

  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("loginError");
  const toggleBtn = document.getElementById("togglePasswordBtn");

  toggleBtn.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleBtn.textContent = "Hide";
    } else {
      passwordInput.type = "password";
      toggleBtn.textContent = "Show";
    }
  });

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
      if (users[i].email === email && users[i].pass === password) {
        matchedUser = users[i];
        break;
      }
    }

    if (!matchedUser) {
      loginError.textContent = "Incorrect email or password. Please try again.";
      return;
    }

    localStorage.setItem(STORAGE_KEYS.activeUser, matchedUser.email);
    window.location.href = "dashboard.html";
  });
}

/* ---------- shared actions ---------- */

function confirmBooking(db, bookingId) {
  const booking = findById(db.bookings, bookingId);
  const flat = findById(db.flats, booking.flatId);
  if (flat.status !== "Available") {
    showToast("Flat " + flat.flatNo + " is already " + flat.status.toLowerCase() + ". Cannot confirm.");
    return false;
  }
  booking.status = "Confirmed";
  flat.status = "Booked";
  saveDatabase(db);
  showToast("Booking confirmed. Flat " + flat.flatNo + " is now Booked.");
  return true;
}

function cancelBooking(db, bookingId) {
  const booking = findById(db.bookings, bookingId);
  const flat = findById(db.flats, booking.flatId);
  const wasConfirmed = booking.status === "Confirmed";
  booking.status = "Cancelled";
  if (wasConfirmed && flat.status === "Booked") {
    flat.status = "Available";
  }
  saveDatabase(db);
  showToast("Booking cancelled." + (wasConfirmed ? " Flat " + flat.flatNo + " is Available again." : ""));
}

function acceptVisit(db, visitId) {
  const visit = findById(db.visits, visitId);
  visit.status = "Accepted";
  saveDatabase(db);
  showToast("Site visit accepted.");
}

function completeVisit(db, visitId) {
  const visit = findById(db.visits, visitId);
  visit.status = "Completed";
  saveDatabase(db);
  showToast("Site visit marked as completed.");
}

/* ---------- dashboard ---------- */

function initDashboardPage() {
  const db = loadDatabase();
  const today = getTodayDate();
  const agent = getCurrentAgent();

  document.getElementById("welcomeName").textContent = agent.name;

  function render() {
    const newInquiries = [];
    for (let i = 0; i < db.inquiries.length; i++) {
      if (db.inquiries[i].status === "New") {
        newInquiries.push(db.inquiries[i]);
      }
    }

    const pendingVisits = [];
    const upcomingVisits = [];
    for (let i = 0; i < db.visits.length; i++) {
      const v = db.visits[i];
      if (v.status === "Pending") {
        pendingVisits.push(v);
      }
      if (v.status !== "Completed" && v.date >= today) {
        upcomingVisits.push(v);
      }
    }
    upcomingVisits.sort(function (a, b) {
      return (a.date + a.time).localeCompare(b.date + b.time);
    });

    const pendingBookings = [];
    for (let i = 0; i < db.bookings.length; i++) {
      if (db.bookings[i].status === "Pending") {
        pendingBookings.push(db.bookings[i]);
      }
    }

    document.getElementById("statNewInquiries").textContent = String(newInquiries.length);
    document.getElementById("statPendingVisits").textContent = String(pendingVisits.length);
    document.getElementById("statPendingBookings").textContent = String(pendingBookings.length);
    document.getElementById("statCustomers").textContent = String(db.customers.length);

    let visitsHtml = "";
    const visitLimit = Math.min(upcomingVisits.length, 5);
    for (let i = 0; i < visitLimit; i++) {
      const v = upcomingVisits[i];
      const customer = findById(db.customers, v.customerId);
      const flat = findById(db.flats, v.flatId);
      visitsHtml +=
        "<tr>" +
        "<td>" + escapeHtml(customer.name) + "</td>" +
        "<td>" + escapeHtml(flatLabel(flat)) + "</td>" +
        "<td>" + v.date + "</td>" +
        "<td>" + formatTime(v.time) + "</td>" +
        "<td>" + renderBadge(v.status) + "</td>" +
        "</tr>";
    }
    document.getElementById("upcomingVisitsBody").innerHTML =
      visitsHtml || '<tr><td colspan="5" class="empty-cell">No upcoming site visits.</td></tr>';

    let inquiryHtml = "";
    const inquiryLimit = Math.min(newInquiries.length, 5);
    for (let i = 0; i < inquiryLimit; i++) {
      const q = newInquiries[i];
      const customer = findById(db.customers, q.customerId);
      const flat = findById(db.flats, q.flatId);
      inquiryHtml +=
        "<tr>" +
        "<td>" + escapeHtml(customer.name) + "</td>" +
        "<td>" + escapeHtml(flat.flatNo) + "</td>" +
        '<td class="msg-cell">' + escapeHtml(q.message) + "</td>" +
        "<td>" + q.date + "</td>" +
        '<td><a class="btn-small" href="inquiries.html?reply=' + q.id + '">Reply</a></td>' +
        "</tr>";
    }
    document.getElementById("newInquiriesBody").innerHTML =
      inquiryHtml || '<tr><td colspan="5" class="empty-cell">No new inquiries.</td></tr>';

    let bookingHtml = "";
    for (let i = 0; i < pendingBookings.length; i++) {
      const b = pendingBookings[i];
      const customer = findById(db.customers, b.customerId);
      const flat = findById(db.flats, b.flatId);
      bookingHtml +=
        "<tr>" +
        "<td>" + escapeHtml(customer.name) + "</td>" +
        "<td>" + escapeHtml(flatLabel(flat)) + "</td>" +
        "<td>" + formatCurrency(flat.price) + "</td>" +
        "<td>" + b.date + "</td>" +
        '<td><a class="btn-small" href="bookings.html">Review</a></td>' +
        "</tr>";
    }
    document.getElementById("pendingBookingsBody").innerHTML =
      bookingHtml || '<tr><td colspan="5" class="empty-cell">No pending booking requests.</td></tr>';

    let available = 0;
    let booked = 0;
    let sold = 0;
    for (let i = 0; i < db.flats.length; i++) {
      if (db.flats[i].status === "Available") {
        available += 1;
      } else if (db.flats[i].status === "Booked") {
        booked += 1;
      } else {
        sold += 1;
      }
    }
    const total = db.flats.length || 1;
    const availEnd = (available / total) * 100;
    const bookedEnd = availEnd + (booked / total) * 100;
    document.getElementById("flatChart").style.background =
      "conic-gradient(var(--green) 0% " + availEnd + "%, var(--amber) " + availEnd + "% " + bookedEnd +
      "%, var(--red) " + bookedEnd + "% 100%)";
    document.getElementById("availCount").textContent = String(available);
    document.getElementById("bookedCount").textContent = String(booked);
    document.getElementById("soldCount").textContent = String(sold);
  }

  render();
}

/* ---------- inquiries ---------- */

function initInquiriesPage() {
  const db = loadDatabase();
  const params = new URLSearchParams(window.location.search);

  const searchInput = document.getElementById("inquirySearch");
  const statusFilter = document.getElementById("inquiryStatusFilter");
  const tableBody = document.getElementById("inquiryTableBody");

  const modal = document.getElementById("replyModal");
  const subtitle = document.getElementById("replySubtitle");
  const customerMsg = document.getElementById("replyCustomerMsg");
  const historyEl = document.getElementById("replyHistory");
  const replyInput = document.getElementById("replyMessage");
  const sendBtn = document.getElementById("sendReplyBtn");

  let activeInquiryId = null;

  function closeModal() {
    closeModalEl(modal);
    activeInquiryId = null;
    setFieldError("replyMessage", "replyError", "");
  }

  function openReplyModal(inquiryId) {
    const inquiry = findById(db.inquiries, inquiryId);
    if (!inquiry) {
      return;
    }
    const customer = findById(db.customers, inquiry.customerId);
    const flat = findById(db.flats, inquiry.flatId);

    activeInquiryId = inquiry.id;
    subtitle.textContent = customer.name + " - " + flatLabel(flat);
    customerMsg.textContent = inquiry.message;

    let historyHtml = "";
    for (let i = 0; i < inquiry.replies.length; i++) {
      const r = inquiry.replies[i];
      historyHtml +=
        '<div class="note-item">' + escapeHtml(r.text) + "<small>" + escapeHtml(r.by) + " - " + r.date + "</small></div>";
    }
    historyEl.innerHTML = historyHtml || '<span class="note-empty">No replies sent yet.</span>';

    replyInput.value = "";
    setFieldError("replyMessage", "replyError", "");
    openModal(modal);
  }

  function renderInquiries() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    let rowsHtml = "";

    for (let i = db.inquiries.length - 1; i >= 0; i--) {
      const q = db.inquiries[i];
      const customer = findById(db.customers, q.customerId);
      const flat = findById(db.flats, q.flatId);

      if (selectedStatus !== "All" && q.status !== selectedStatus) {
        continue;
      }
      const searchTarget = (customer.name + " " + flat.flatNo + " " + flat.projectName).toLowerCase();
      if (searchTarget.indexOf(keyword) === -1) {
        continue;
      }

      let options = "";
      for (let f = 0; f < FOLLOW_UP_OPTIONS.length; f++) {
        const selected = FOLLOW_UP_OPTIONS[f] === q.followUp ? " selected" : "";
        options += '<option value="' + FOLLOW_UP_OPTIONS[f] + '"' + selected + ">" + FOLLOW_UP_OPTIONS[f] + "</option>";
      }

      rowsHtml +=
        "<tr>" +
        "<td>" + q.id + "</td>" +
        "<td>" + escapeHtml(customer.name) + "</td>" +
        "<td>" + escapeHtml(flatLabel(flat)) + "</td>" +
        '<td class="msg-cell" title="' + escapeHtml(q.message) + '">' + escapeHtml(q.message) + "</td>" +
        "<td>" + q.date + "</td>" +
        "<td>" + renderBadge(q.status) + "</td>" +
        '<td><select class="followup-select" data-id="' + q.id + '">' + options + "</select></td>" +
        '<td><button type="button" class="btn-small reply-btn" data-id="' + q.id + '">' +
        (q.status === "New" ? "Reply" : "Reply Again") + "</button></td>" +
        "</tr>";
    }

    tableBody.innerHTML = rowsHtml || '<tr><td colspan="8" class="empty-cell">No inquiries found.</td></tr>';

    const replyButtons = tableBody.querySelectorAll(".reply-btn");
    for (let i = 0; i < replyButtons.length; i++) {
      replyButtons[i].addEventListener("click", function () {
        openReplyModal(this.getAttribute("data-id"));
      });
    }

    const selects = tableBody.querySelectorAll(".followup-select");
    for (let i = 0; i < selects.length; i++) {
      selects[i].addEventListener("change", function () {
        const inquiry = findById(db.inquiries, this.getAttribute("data-id"));
        inquiry.followUp = this.value;
        saveDatabase(db);
        showToast("Follow-up marked as " + this.value + ".");
      });
    }
  }

  sendBtn.addEventListener("click", function () {
    const text = replyInput.value.trim();
    if (text.length < 5) {
      setFieldError("replyMessage", "replyError", "Please write a reply of at least 5 characters.");
      return;
    }
    const inquiry = findById(db.inquiries, activeInquiryId);
    inquiry.replies.push({ text: text, date: getTodayDate(), by: getCurrentAgent().name });
    inquiry.status = "Replied";
    if (inquiry.followUp === "Pending") {
      inquiry.followUp = "Contacted";
    }
    saveDatabase(db);
    closeModal();
    showToast("Reply sent to " + findById(db.customers, inquiry.customerId).name + ".");
    renderInquiries();
  });

  wireModalClose(modal, ["closeReplyBtn", "cancelReplyBtn"], closeModal);
  replyInput.addEventListener("input", function () {
    setFieldError("replyMessage", "replyError", "");
  });
  searchInput.addEventListener("input", renderInquiries);
  statusFilter.addEventListener("change", renderInquiries);

  renderInquiries();

  if (params.get("reply")) {
    openReplyModal(params.get("reply"));
  }
}

/* ---------- site visits ---------- */

function initVisitsPage() {
  const db = loadDatabase();
  const today = getTodayDate();

  const searchInput = document.getElementById("visitSearch");
  const statusFilter = document.getElementById("visitStatusFilter");
  const tableBody = document.getElementById("visitTableBody");

  const modal = document.getElementById("rescheduleModal");
  const subtitle = document.getElementById("rescheduleSubtitle");
  const dateInput = document.getElementById("rescheduleDate");
  const timeInput = document.getElementById("rescheduleTime");
  const saveBtn = document.getElementById("saveRescheduleBtn");

  let activeVisitId = null;

  function closeModal() {
    closeModalEl(modal);
    activeVisitId = null;
    setFieldError("rescheduleDate", "rescheduleDateError", "");
    setFieldError("rescheduleTime", "rescheduleTimeError", "");
  }

  function openRescheduleModal(visitId) {
    const visit = findById(db.visits, visitId);
    const customer = findById(db.customers, visit.customerId);
    const flat = findById(db.flats, visit.flatId);

    activeVisitId = visit.id;
    subtitle.textContent = customer.name + " - " + flatLabel(flat) + " (currently " + visit.date + " " + formatTime(visit.time) + ")";
    dateInput.min = today;
    dateInput.value = visit.date >= today ? visit.date : today;
    timeInput.value = visit.time;
    setFieldError("rescheduleDate", "rescheduleDateError", "");
    setFieldError("rescheduleTime", "rescheduleTimeError", "");
    openModal(modal);
  }

  function renderVisits() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    const sorted = db.visits.slice().sort(function (a, b) {
      return (b.date + b.time).localeCompare(a.date + a.time);
    });

    let rowsHtml = "";
    for (let i = 0; i < sorted.length; i++) {
      const v = sorted[i];
      const customer = findById(db.customers, v.customerId);
      const flat = findById(db.flats, v.flatId);

      if (selectedStatus !== "All" && v.status !== selectedStatus) {
        continue;
      }
      const searchTarget = (customer.name + " " + flat.flatNo + " " + flat.projectName).toLowerCase();
      if (searchTarget.indexOf(keyword) === -1) {
        continue;
      }

      let actions = "";
      if (v.status === "Pending") {
        actions += '<button type="button" class="btn-small accept-btn" data-id="' + v.id + '">Accept</button>';
      }
      if (v.status !== "Completed") {
        actions += '<button type="button" class="btn-small resched-btn" data-id="' + v.id + '">Reschedule</button>';
      }
      if (v.status === "Accepted" || v.status === "Rescheduled") {
        actions += '<button type="button" class="btn-small complete-btn" data-id="' + v.id + '">Complete</button>';
      }

      rowsHtml +=
        "<tr>" +
        "<td>" + v.id + "</td>" +
        "<td>" + escapeHtml(customer.name) + "</td>" +
        "<td>" + escapeHtml(flatLabel(flat)) + "</td>" +
        "<td>" + v.date + "</td>" +
        "<td>" + formatTime(v.time) + "</td>" +
        "<td>" + renderBadge(v.status) + "</td>" +
        "<td>" + (actions || "-") + "</td>" +
        "</tr>";
    }

    tableBody.innerHTML = rowsHtml || '<tr><td colspan="7" class="empty-cell">No site visits found.</td></tr>';

    const acceptBtns = tableBody.querySelectorAll(".accept-btn");
    for (let i = 0; i < acceptBtns.length; i++) {
      acceptBtns[i].addEventListener("click", function () {
        acceptVisit(db, this.getAttribute("data-id"));
        renderVisits();
      });
    }
    const reschedBtns = tableBody.querySelectorAll(".resched-btn");
    for (let i = 0; i < reschedBtns.length; i++) {
      reschedBtns[i].addEventListener("click", function () {
        openRescheduleModal(this.getAttribute("data-id"));
      });
    }
    const completeBtns = tableBody.querySelectorAll(".complete-btn");
    for (let i = 0; i < completeBtns.length; i++) {
      completeBtns[i].addEventListener("click", function () {
        completeVisit(db, this.getAttribute("data-id"));
        renderVisits();
      });
    }
  }

  saveBtn.addEventListener("click", function () {
    const newDate = dateInput.value;
    const newTime = timeInput.value;
    let isValid = true;

    setFieldError("rescheduleDate", "rescheduleDateError", "");
    setFieldError("rescheduleTime", "rescheduleTimeError", "");

    if (!newDate || newDate < today) {
      setFieldError("rescheduleDate", "rescheduleDateError", "Select today or a future date.");
      isValid = false;
    }
    if (!newTime) {
      setFieldError("rescheduleTime", "rescheduleTimeError", "Select a time.");
      isValid = false;
    }
    if (!isValid) {
      return;
    }

    const visit = findById(db.visits, activeVisitId);
    visit.date = newDate;
    visit.time = newTime;
    visit.status = "Rescheduled";
    saveDatabase(db);
    closeModal();
    showToast("Visit rescheduled to " + newDate + " at " + formatTime(newTime) + ".");
    renderVisits();
  });

  wireModalClose(modal, ["closeRescheduleBtn", "cancelRescheduleBtn"], closeModal);
  searchInput.addEventListener("input", renderVisits);
  statusFilter.addEventListener("change", renderVisits);

  renderVisits();
}

/* ---------- bookings ---------- */

function initBookingsPage() {
  const db = loadDatabase();

  const searchInput = document.getElementById("bookingSearch");
  const statusFilter = document.getElementById("bookingStatusFilter");
  const tableBody = document.getElementById("bookingTableBody");

  function renderBookings() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    let rowsHtml = "";

    for (let i = db.bookings.length - 1; i >= 0; i--) {
      const b = db.bookings[i];
      const customer = findById(db.customers, b.customerId);
      const flat = findById(db.flats, b.flatId);

      if (selectedStatus !== "All" && b.status !== selectedStatus) {
        continue;
      }
      const searchTarget = (customer.name + " " + flat.flatNo + " " + flat.projectName + " " + b.id).toLowerCase();
      if (searchTarget.indexOf(keyword) === -1) {
        continue;
      }

      let actions = "";
      if (b.status === "Pending") {
        actions += '<button type="button" class="btn-small confirm-btn" data-id="' + b.id + '">Confirm</button>';
      }
      if (b.status !== "Cancelled") {
        actions += '<button type="button" class="btn-small cancel-btn" data-id="' + b.id + '">Cancel</button>';
      }

      rowsHtml +=
        "<tr>" +
        "<td>" + b.id + "</td>" +
        "<td>" + escapeHtml(customer.name) + "</td>" +
        "<td>" + escapeHtml(flatLabel(flat)) + "</td>" +
        "<td>" + formatCurrency(flat.price) + "</td>" +
        "<td>" + b.date + "</td>" +
        "<td>" + renderBadge(b.status) + "</td>" +
        "<td>" + renderBadge(flat.status) + "</td>" +
        "<td>" + (actions || "-") + "</td>" +
        "</tr>";
    }

    tableBody.innerHTML = rowsHtml || '<tr><td colspan="8" class="empty-cell">No booking requests found.</td></tr>';

    const confirmBtns = tableBody.querySelectorAll(".confirm-btn");
    for (let i = 0; i < confirmBtns.length; i++) {
      confirmBtns[i].addEventListener("click", function () {
        confirmBooking(db, this.getAttribute("data-id"));
        renderBookings();
      });
    }
    const cancelBtns = tableBody.querySelectorAll(".cancel-btn");
    for (let i = 0; i < cancelBtns.length; i++) {
      cancelBtns[i].addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        if (window.confirm("Cancel booking " + id + "? This cannot be undone.")) {
          cancelBooking(db, id);
          renderBookings();
        }
      });
    }
  }

  searchInput.addEventListener("input", renderBookings);
  statusFilter.addEventListener("change", renderBookings);

  renderBookings();
}

/* ---------- customers ---------- */

function initCustomersPage() {
  const db = loadDatabase();

  const searchInput = document.getElementById("customerSearch");
  const stageFilter = document.getElementById("customerStageFilter");
  const tableBody = document.getElementById("customerTableBody");

  const modal = document.getElementById("notesModal");
  const subtitle = document.getElementById("notesSubtitle");
  const notesList = document.getElementById("notesList");
  const noteInput = document.getElementById("noteInput");
  const addBtn = document.getElementById("addNoteBtn");

  let activeCustomerId = null;

  function closeModal() {
    closeModalEl(modal);
    activeCustomerId = null;
    setFieldError("noteInput", "noteError", "");
  }

  function renderNotes() {
    const customer = findById(db.customers, activeCustomerId);
    let html = "";
    for (let i = customer.notes.length - 1; i >= 0; i--) {
      html += '<div class="note-item">' + escapeHtml(customer.notes[i].text) + "<small>" + customer.notes[i].date + "</small></div>";
    }
    notesList.innerHTML = html || '<span class="note-empty">No notes yet.</span>';
  }

  function openNotesModal(customerId) {
    const customer = findById(db.customers, customerId);
    activeCustomerId = customerId;
    subtitle.textContent = customer.name + " - notes are private to you.";
    noteInput.value = "";
    setFieldError("noteInput", "noteError", "");
    renderNotes();
    openModal(modal);
  }

  function renderCustomers() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedStage = stageFilter.value;
    let rowsHtml = "";

    for (let i = 0; i < db.customers.length; i++) {
      const c = db.customers[i];
      const stage = getCustomerStage(db, c.id);

      if (selectedStage !== "All" && String(stage) !== selectedStage) {
        continue;
      }
      const searchTarget = (c.name + " " + c.phone + " " + c.email).toLowerCase();
      if (searchTarget.indexOf(keyword) === -1) {
        continue;
      }

      const percent = (stage / 4) * 100;
      rowsHtml +=
        "<tr>" +
        "<td>" + c.id + "</td>" +
        "<td>" + escapeHtml(c.name) + "</td>" +
        "<td>" + escapeHtml(c.phone) + "<br /><small>" + escapeHtml(c.email) + "</small></td>" +
        "<td>" + escapeHtml(getCustomerFlats(db, c.id)) + "</td>" +
        '<td><div class="progress-wrap"><div class="bar-track"><div class="bar-fill" style="width:' + percent +
        '%"></div></div><span class="progress-label">' + STAGE_LABELS[stage] + "</span></div></td>" +
        "<td>" + c.notes.length + "</td>" +
        '<td><button type="button" class="btn-small notes-btn" data-id="' + c.id + '">Notes</button></td>' +
        "</tr>";
    }

    tableBody.innerHTML = rowsHtml || '<tr><td colspan="7" class="empty-cell">No customers found.</td></tr>';

    const noteButtons = tableBody.querySelectorAll(".notes-btn");
    for (let i = 0; i < noteButtons.length; i++) {
      noteButtons[i].addEventListener("click", function () {
        openNotesModal(this.getAttribute("data-id"));
      });
    }
  }

  addBtn.addEventListener("click", function () {
    const text = noteInput.value.trim();
    if (text.length < 3) {
      setFieldError("noteInput", "noteError", "Please write a note of at least 3 characters.");
      return;
    }
    const customer = findById(db.customers, activeCustomerId);
    customer.notes.push({ text: text, date: getTodayDate() });
    saveDatabase(db);
    noteInput.value = "";
    setFieldError("noteInput", "noteError", "");
    renderNotes();
    renderCustomers();
    showToast("Note added.");
  });

  noteInput.addEventListener("input", function () {
    setFieldError("noteInput", "noteError", "");
  });

  wireModalClose(modal, ["closeNotesBtn", "cancelNotesBtn"], closeModal);
  searchInput.addEventListener("input", renderCustomers);
  stageFilter.addEventListener("change", renderCustomers);

  renderCustomers();
}

/* ---------- bootstrap ---------- */

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
    case "inquiries":
      initInquiriesPage();
      break;
    case "visits":
      initVisitsPage();
      break;
    case "bookings":
      initBookingsPage();
      break;
    case "customers":
      initCustomersPage();
      break;
    default:
      break;
  }
});
