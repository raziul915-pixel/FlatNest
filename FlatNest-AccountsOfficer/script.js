const STORAGE_KEYS = {
  users: "flatnest_accounts_users",
  activeUser: "flatnest_active_officer",
  database: "flatnest_accounts_db"
};

const PAYMENT_METHODS = [
  "Cash",
  "bKash",
  "Bank Transfer",
  "Nagad",
  "Cheque",
  "Card"
];

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

function daysBetween(startDate, endDate) {
  const startMs = new Date(startDate + "T00:00:00").getTime();
  const endMs = new Date(endDate + "T00:00:00").getTime();
  return Math.round((endMs - startMs) / 86400000);
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
      name: "Al Rahit",
      email: "al.rahit@flatnest.com",
      pass: "Rahit@123"
    }
  ];
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function getCurrentOfficer() {
  const activeEmail = localStorage.getItem(STORAGE_KEYS.activeUser);
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === activeEmail) {
      return users[i];
    }
  }
  return { name: "Al Rahit", email: "al.rahit@flatnest.com" };
}

function createPaymentRecord(db, bookingId, installmentId, type, amount, date, method, reference) {
  db.paymentCounter += 1;
  const officer = getCurrentOfficer();
  const payment = {
    id: "PAY-" + padNumber(db.paymentCounter, 3),
    receiptNo: "RCP-" + padNumber(db.paymentCounter, 4),
    bookingId: bookingId,
    installmentId: installmentId,
    type: type,
    amount: amount,
    date: date,
    method: method,
    reference: reference || "",
    receivedBy: officer.name
  };
  db.payments.push(payment);
  return payment;
}

function buildInitialDatabase() {
  const today = getTodayDate();
  const initialBookings = [
    {
      customerName: "Ayesha Rahman",
      projectName: "Green Valley",
      flatNo: "B-402",
      daysAgo: 230,
      totalPrice: 5500000,
      bookingMoney: 500000,
      totalInstallments: 10,
      overdueTarget: 0
    },
    {
      customerName: "Tanvir Ahmed",
      projectName: "Lake View",
      flatNo: "A-701",
      daysAgo: 200,
      totalPrice: 7200000,
      bookingMoney: 1200000,
      totalInstallments: 12,
      overdueTarget: 1
    },
    {
      customerName: "Nusrat Jahan",
      projectName: "Sunrise Heights",
      flatNo: "C-305",
      daysAgo: 170,
      totalPrice: 4800000,
      bookingMoney: 800000,
      totalInstallments: 8,
      overdueTarget: 0
    },
    {
      customerName: "Rafiq Hasan",
      projectName: "Green Valley",
      flatNo: "A-1101",
      daysAgo: 140,
      totalPrice: 6300000,
      bookingMoney: 1300000,
      totalInstallments: 10,
      overdueTarget: 2
    },
    {
      customerName: "Farhana Akter",
      projectName: "Lake View",
      flatNo: "B-203",
      daysAgo: 110,
      totalPrice: 5000000,
      bookingMoney: 1000000,
      totalInstallments: 8,
      overdueTarget: 0
    },
    {
      customerName: "Imran Hossain",
      projectName: "Sunrise Heights",
      flatNo: "A-902",
      daysAgo: 80,
      totalPrice: 8000000,
      bookingMoney: 1000000,
      totalInstallments: 10,
      overdueTarget: 1
    },
    {
      customerName: "Sabrina Karim",
      projectName: "Green Valley",
      flatNo: "C-604",
      daysAgo: 50,
      totalPrice: 4200000,
      bookingMoney: 600000,
      totalInstallments: 12,
      overdueTarget: 0
    },
    {
      customerName: "Mahmud Alam",
      projectName: "Lake View",
      flatNo: "D-801",
      daysAgo: 4,
      totalPrice: 6000000,
      bookingMoney: 1000000,
      totalInstallments: 10,
      overdueTarget: 0
    }
  ];

  const db = {
    bookings: [],
    installments: [],
    payments: [],
    reminders: [],
    paymentCounter: 0
  };

  let installmentCounter = 0;

  for (let bIndex = 0; bIndex < initialBookings.length; bIndex++) {
    const item = initialBookings[bIndex];
    const bookingId = "BKG-" + padNumber(bIndex + 1, 3);
    const bookingDate = addDays(today, -item.daysAgo);
    const bookingPaid = item.daysAgo > 10;
    const installmentAmount = (item.totalPrice - item.bookingMoney) / item.totalInstallments;

    db.bookings.push({
      id: bookingId,
      customerName: item.customerName,
      projectName: item.projectName,
      flatNo: item.flatNo,
      bookingDate: bookingDate,
      totalPrice: item.totalPrice,
      bookingMoney: item.bookingMoney,
      bookingPaid: bookingPaid
    });

    if (bookingPaid) {
      const method = PAYMENT_METHODS[db.paymentCounter % PAYMENT_METHODS.length];
      const ref = method === "Cash" ? "" : "TXN" + (4000 + db.paymentCounter);
      createPaymentRecord(
        db,
        bookingId,
        null,
        "Booking Money",
        item.bookingMoney,
        bookingDate,
        method,
        ref
      );
    }

    const dueDates = [];
    for (let n = 1; n <= item.totalInstallments; n++) {
      dueDates.push(addMonths(bookingDate, n));
    }

    let pastDueCount = 0;
    for (let dIndex = 0; dIndex < dueDates.length; dIndex++) {
      if (dueDates[dIndex] < today) {
        pastDueCount += 1;
      }
    }

    const paidCount = Math.max(pastDueCount - item.overdueTarget, 0);

    for (let idx = 0; idx < dueDates.length; idx++) {
      installmentCounter += 1;
      const isPaid = idx < paidCount;
      const installment = {
        id: "INS-" + padNumber(installmentCounter, 3),
        bookingId: bookingId,
        installmentNo: idx + 1,
        totalInstallments: item.totalInstallments,
        dueDate: dueDates[idx],
        amount: installmentAmount,
        paid: isPaid,
        paidDate: isPaid ? dueDates[idx] : null
      };
      db.installments.push(installment);

      if (isPaid) {
        const method = PAYMENT_METHODS[db.paymentCounter % PAYMENT_METHODS.length];
        const ref = method === "Cash" ? "" : "TXN" + (4000 + db.paymentCounter);
        createPaymentRecord(
          db,
          bookingId,
          installment.id,
          "Installment",
          installmentAmount,
          dueDates[idx],
          method,
          ref
        );
      }
    }
  }

  db.payments.sort(function (a, b) {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.id.localeCompare(b.id);
  });

  for (let pIndex = 0; pIndex < db.payments.length; pIndex++) {
    db.payments[pIndex].id = "PAY-" + padNumber(pIndex + 1, 3);
    db.payments[pIndex].receiptNo = "RCP-" + padNumber(pIndex + 1, 4);
  }
  db.paymentCounter = db.payments.length;

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

function findBookingById(db, bookingId) {
  for (let i = 0; i < db.bookings.length; i++) {
    if (db.bookings[i].id === bookingId) {
      return db.bookings[i];
    }
  }
  return null;
}

function findInstallmentById(db, installmentId) {
  for (let i = 0; i < db.installments.length; i++) {
    if (db.installments[i].id === installmentId) {
      return db.installments[i];
    }
  }
  return null;
}

function getInstallmentStatus(installment) {
  if (installment.paid) {
    return "Paid";
  }
  if (installment.dueDate < getTodayDate()) {
    return "Overdue";
  }
  return "Due";
}

function renderStatusBadge(status) {
  let cls = "badge-due";
  if (status === "Paid") {
    cls = "badge-paid";
  } else if (status === "Overdue") {
    cls = "badge-overdue";
  }
  return '<span class="badge ' + cls + '">' + status + "</span>";
}

function setupSidebar() {
  const officer = getCurrentOfficer();
  const officerNameEl = document.getElementById("officerName");
  if (officerNameEl) {
    officerNameEl.textContent = officer.name;
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

function initDashboardPage() {
  const db = loadDatabase();
  const today = getTodayDate();
  const officer = getCurrentOfficer();

  document.getElementById("welcomeName").textContent = officer.name;

  let totalCollected = 0;
  for (let i = 0; i < db.payments.length; i++) {
    totalCollected += db.payments[i].amount;
  }

  const unpaidInstallments = [];
  const overdueInstallments = [];
  let paidInstallmentsCount = 0;
  let pendingAmount = 0;
  let overdueAmount = 0;

  for (let i = 0; i < db.installments.length; i++) {
    const inst = db.installments[i];
    if (inst.paid) {
      paidInstallmentsCount += 1;
    } else {
      unpaidInstallments.push(inst);
      pendingAmount += inst.amount;
      if (inst.dueDate < today) {
        overdueInstallments.push(inst);
        overdueAmount += inst.amount;
      }
    }
  }

  const awaitingBookings = [];
  for (let i = 0; i < db.bookings.length; i++) {
    if (!db.bookings[i].bookingPaid) {
      awaitingBookings.push(db.bookings[i]);
      pendingAmount += db.bookings[i].bookingMoney;
    }
  }

  document.getElementById("statCollected").textContent = formatCurrency(totalCollected);
  document.getElementById("statPending").textContent = formatCurrency(pendingAmount);
  document.getElementById("statOverdueCount").textContent = String(overdueInstallments.length);
  document.getElementById("statOverdueAmount").textContent = formatCurrency(overdueAmount);
  document.getElementById("statBookings").textContent = String(db.bookings.length);

  const recentPayments = db.payments.slice().sort(function (a, b) {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.id.localeCompare(a.id);
  });

  const recentBody = document.getElementById("recentPaymentsBody");
  let recentHtml = "";
  const recentLimit = Math.min(recentPayments.length, 5);
  for (let i = 0; i < recentLimit; i++) {
    const payment = recentPayments[i];
    const booking = findBookingById(db, payment.bookingId);
    recentHtml +=
      "<tr>" +
      "<td>" + escapeHtml(booking.customerName) + "</td>" +
      "<td>" + payment.bookingId + "</td>" +
      "<td>" + formatCurrency(payment.amount) + "</td>" +
      "<td>" + payment.date + "</td>" +
      "</tr>";
  }
  recentBody.innerHTML = recentHtml || '<tr><td colspan="4" class="empty-cell">No payments recorded yet.</td></tr>';

  const dueCount = unpaidInstallments.length - overdueInstallments.length;
  const totalInst = db.installments.length || 1;
  const paidPercent = (paidInstallmentsCount / totalInst) * 100;
  const dueEndPercent = paidPercent + (dueCount / totalInst) * 100;

  const chartEl = document.getElementById("installmentChart");
  chartEl.style.background =
    "conic-gradient(var(--green) 0% " +
    paidPercent +
    "%, var(--amber) " +
    paidPercent +
    "% " +
    dueEndPercent +
    "%, var(--red) " +
    dueEndPercent +
    "% 100%)";

  document.getElementById("paidCount").textContent = String(paidInstallmentsCount);
  document.getElementById("dueCount").textContent = String(dueCount);
  document.getElementById("overdueCount").textContent = String(overdueInstallments.length);

  overdueInstallments.sort(function (a, b) {
    return a.dueDate.localeCompare(b.dueDate);
  });

  const overdueBody = document.getElementById("overdueTableBody");
  let overdueHtml = "";
  const overdueLimit = Math.min(overdueInstallments.length, 5);
  for (let i = 0; i < overdueLimit; i++) {
    const inst = overdueInstallments[i];
    const booking = findBookingById(db, inst.bookingId);
    const lateDays = daysBetween(inst.dueDate, today);
    overdueHtml +=
      "<tr>" +
      "<td>" + escapeHtml(booking.customerName) + "</td>" +
      "<td>" + escapeHtml(booking.flatNo) + "</td>" +
      "<td>#" + inst.installmentNo + "</td>" +
      "<td>" + lateDays + " days</td>" +
      "<td>" + formatCurrency(inst.amount) + "</td>" +
      '<td><a class="btn-small" href="payments.html?booking=' +
      booking.id +
      "&installment=" +
      inst.id +
      '">Record</a></td>' +
      "</tr>";
  }
  overdueBody.innerHTML = overdueHtml || '<tr><td colspan="6" class="empty-cell">No overdue installments.</td></tr>';

  const awaitingBody = document.getElementById("awaitingTableBody");
  let awaitingHtml = "";
  for (let i = 0; i < awaitingBookings.length; i++) {
    const booking = awaitingBookings[i];
    awaitingHtml +=
      "<tr>" +
      "<td>" + escapeHtml(booking.customerName) + "</td>" +
      "<td>" + booking.id + "</td>" +
      "<td>" + escapeHtml(booking.projectName + " " + booking.flatNo) + "</td>" +
      "<td>" + formatCurrency(booking.bookingMoney) + "</td>" +
      '<td><a class="btn-small" href="payments.html?booking=' + booking.id + '">Record</a></td>' +
      "</tr>";
  }
  awaitingBody.innerHTML = awaitingHtml || '<tr><td colspan="5" class="empty-cell">All booking monies have been collected.</td></tr>';
}

function initPaymentsPage() {
  const db = loadDatabase();
  const params = new URLSearchParams(window.location.search);

  const bookingSelect = document.getElementById("bookingSelect");
  const itemSelect = document.getElementById("itemSelect");
  const amountInput = document.getElementById("amountInput");
  const dateInput = document.getElementById("paymentDateInput");
  const methodSelect = document.getElementById("methodSelect");
  const referenceInput = document.getElementById("referenceInput");
  const paymentForm = document.getElementById("paymentForm");
  const successLink = document.getElementById("paymentSuccessLink");
  const searchInput = document.getElementById("paymentSearch");
  const typeFilter = document.getElementById("paymentTypeFilter");

  const today = getTodayDate();
  dateInput.max = today;
  dateInput.value = today;

  let bookingOptions = "";
  for (let i = 0; i < db.bookings.length; i++) {
    const b = db.bookings[i];
    bookingOptions +=
      '<option value="' +
      b.id +
      '">' +
      b.id +
      " - " +
      escapeHtml(b.customerName) +
      " (" +
      escapeHtml(b.flatNo) +
      ")</option>";
  }
  bookingSelect.innerHTML = bookingOptions;

  if (params.get("booking")) {
    bookingSelect.value = params.get("booking");
  }

  function updateReferenceState() {
    if (methodSelect.value === "Cash") {
      referenceInput.value = "";
      referenceInput.disabled = true;
      referenceInput.placeholder = "Not required for Cash";
      setFieldError("referenceInput", "referenceError", "");
    } else {
      referenceInput.disabled = false;
      referenceInput.placeholder = "Required for non-cash payments";
    }
  }

  function updateAmountField() {
    const booking = findBookingById(db, bookingSelect.value);
    const selectedItem = itemSelect.value;
    if (!selectedItem || !booking) {
      amountInput.value = "";
      return;
    }
    if (selectedItem === "BOOKING_MONEY") {
      amountInput.value = String(Math.round(booking.bookingMoney));
      return;
    }
    const inst = findInstallmentById(db, selectedItem);
    if (inst) {
      amountInput.value = String(Math.round(inst.amount));
    }
  }

  function populatePayableItems(preselectedInstallmentId) {
    const booking = findBookingById(db, bookingSelect.value);
    let optionsHtml = "";

    if (booking && !booking.bookingPaid) {
      optionsHtml += '<option value="BOOKING_MONEY">Booking Money</option>';
    }

    for (let i = 0; i < db.installments.length; i++) {
      const inst = db.installments[i];
      if (inst.bookingId === bookingSelect.value && !inst.paid) {
        const status = getInstallmentStatus(inst);
        optionsHtml +=
          '<option value="' +
          inst.id +
          '">Installment #' +
          inst.installmentNo +
          " - due " +
          inst.dueDate +
          " (" +
          status +
          ")</option>";
      }
    }

    if (optionsHtml === "") {
      optionsHtml = '<option value="">No pending payments</option>';
    }

    itemSelect.innerHTML = optionsHtml;
    if (preselectedInstallmentId) {
      itemSelect.value = preselectedInstallmentId;
    }
    setFieldError("itemSelect", "itemError", "");
    updateAmountField();
  }

  function renderPaymentHistory() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;
    const historyBody = document.getElementById("paymentHistoryBody");

    let rowsHtml = "";
    for (let i = db.payments.length - 1; i >= 0; i--) {
      const payment = db.payments[i];
      const booking = findBookingById(db, payment.bookingId);
      const matchesType = selectedType === "" || payment.type === selectedType;
      const searchTarget = (booking.customerName + " " + payment.receiptNo + " " + payment.bookingId).toLowerCase();
      const matchesKeyword = searchTarget.indexOf(keyword) !== -1;

      if (matchesType && matchesKeyword) {
        rowsHtml +=
          "<tr>" +
          '<td><a class="text-link" href="receipts.html?receipt=' +
          payment.receiptNo +
          '">' +
          payment.receiptNo +
          "</a></td>" +
          "<td>" + payment.date + "</td>" +
          "<td>" + escapeHtml(booking.customerName) + "</td>" +
          "<td>" + payment.bookingId + "</td>" +
          "<td>" + payment.type + "</td>" +
          "<td>" + payment.method + "</td>" +
          "<td>" + formatCurrency(payment.amount) + "</td>" +
          "</tr>";
      }
    }

    historyBody.innerHTML = rowsHtml || '<tr><td colspan="7" class="empty-cell">No matching payment records found.</td></tr>';
  }

  bookingSelect.addEventListener("change", function () {
    populatePayableItems(null);
  });

  itemSelect.addEventListener("change", function () {
    setFieldError("itemSelect", "itemError", "");
    updateAmountField();
  });

  dateInput.addEventListener("change", function () {
    setFieldError("paymentDateInput", "dateError", "");
  });

  methodSelect.addEventListener("change", function () {
    setFieldError("methodSelect", "methodError", "");
    updateReferenceState();
  });

  referenceInput.addEventListener("input", function () {
    setFieldError("referenceInput", "referenceError", "");
  });

  searchInput.addEventListener("input", renderPaymentHistory);
  typeFilter.addEventListener("change", renderPaymentHistory);

  paymentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const selectedItem = itemSelect.value;
    const paymentDate = dateInput.value;
    const method = methodSelect.value;
    const reference = referenceInput.value.trim();
    const currentToday = getTodayDate();

    let isValid = true;
    setFieldError("itemSelect", "itemError", "");
    setFieldError("paymentDateInput", "dateError", "");
    setFieldError("methodSelect", "methodError", "");
    setFieldError("referenceInput", "referenceError", "");

    if (!selectedItem) {
      setFieldError("itemSelect", "itemError", "No pending item left for this booking.");
      isValid = false;
    }

    if (!paymentDate || paymentDate > currentToday) {
      setFieldError("paymentDateInput", "dateError", "Select a valid date up to today.");
      isValid = false;
    }

    if (!method) {
      setFieldError("methodSelect", "methodError", "Please select a payment method.");
      isValid = false;
    }

    const refPattern = /^[A-Za-z0-9-]{4,30}$/;
    if (method && method !== "Cash" && !refPattern.test(reference)) {
      setFieldError("referenceInput", "referenceError", "Enter 4 to 30 letters, digits, or hyphens.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const booking = findBookingById(db, bookingSelect.value);
    const installment = selectedItem === "BOOKING_MONEY" ? null : findInstallmentById(db, selectedItem);
    const paymentType = installment ? "Installment" : "Booking Money";
    const amount = Number(amountInput.value);

    const newPayment = createPaymentRecord(
      db,
      booking.id,
      installment ? installment.id : null,
      paymentType,
      amount,
      paymentDate,
      method,
      reference
    );

    if (installment) {
      installment.paid = true;
      installment.paidDate = paymentDate;
    } else {
      booking.bookingPaid = true;
    }

    saveDatabase(db);
    showToast("Payment recorded successfully.");
    successLink.innerHTML =
      '<a href="receipts.html?receipt=' +
      newPayment.receiptNo +
      '">View &amp; Print Receipt ' +
      newPayment.receiptNo +
      "</a>";

    methodSelect.value = "";
    referenceInput.value = "";
    updateReferenceState();
    populatePayableItems(null);
    renderPaymentHistory();
  });

  populatePayableItems(params.get("installment"));
  updateReferenceState();
  renderPaymentHistory();
}

function initInstallmentsPage() {
  const db = loadDatabase();
  const params = new URLSearchParams(window.location.search);
  const today = getTodayDate();

  const statusFilter = document.getElementById("statusFilter");
  const searchInput = document.getElementById("installmentSearch");
  const remindAllBtn = document.getElementById("remindAllBtn");
  const tableBody = document.getElementById("installmentTableBody");

  const modal = document.getElementById("reminderModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalSubtitle = document.getElementById("modalSubtitle");
  const messageGroup = document.getElementById("modalMessageGroup");
  const messageInput = document.getElementById("reminderMessage");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelReminderBtn");
  const sendBtn = document.getElementById("sendReminderBtn");

  let activeMode = null;
  let selectedInstallmentId = null;
  let bulkOverdueList = [];

  if (params.get("status")) {
    statusFilter.value = params.get("status");
  }

  function closeModal() {
    modal.classList.remove("open");
    activeMode = null;
    selectedInstallmentId = null;
    bulkOverdueList = [];
    setFieldError("reminderMessage", "reminderError", "");
  }

  function openSingleReminderModal(installmentId) {
    const inst = findInstallmentById(db, installmentId);
    if (!inst) {
      return;
    }
    const booking = findBookingById(db, inst.bookingId);
    const duePhrase = inst.dueDate < today ? "was due" : "is due";

    activeMode = "single";
    selectedInstallmentId = inst.id;
    modalTitle.textContent = "Send Payment Reminder";
    modalSubtitle.textContent =
      booking.customerName + " - " + booking.projectName + " " + booking.flatNo + " (Installment #" + inst.installmentNo + ")";
    messageGroup.classList.remove("hidden");
    messageInput.value =
      "Dear " +
      booking.customerName +
      ", your installment #" +
      inst.installmentNo +
      " of " +
      formatCurrency(inst.amount) +
      " for flat " +
      booking.flatNo +
      " (" +
      booking.projectName +
      ") " +
      duePhrase +
      " on " +
      inst.dueDate +
      ". Please arrange payment at your earliest convenience. - FlatNest Accounts";
    sendBtn.textContent = "Send Reminder";
    setFieldError("reminderMessage", "reminderError", "");
    modal.classList.add("open");
  }

  function openBulkReminderModal() {
    bulkOverdueList = [];
    for (let i = 0; i < db.installments.length; i++) {
      const inst = db.installments[i];
      if (!inst.paid && inst.dueDate < today) {
        let alreadyRemindedToday = false;
        for (let r = 0; r < db.reminders.length; r++) {
          if (db.reminders[r].installmentId === inst.id && db.reminders[r].date === today) {
            alreadyRemindedToday = true;
            break;
          }
        }
        if (!alreadyRemindedToday) {
          bulkOverdueList.push(inst);
        }
      }
    }

    if (bulkOverdueList.length === 0) {
      showToast("All overdue installments have already been reminded today.");
      return;
    }

    activeMode = "bulk";
    modalTitle.textContent = "Remind All Overdue Accounts";
    modalSubtitle.textContent =
      "Send overdue payment reminders to " + bulkOverdueList.length + " pending installment(s)?";
    messageGroup.classList.add("hidden");
    sendBtn.textContent = "Send " + bulkOverdueList.length + " Reminders";
    modal.classList.add("open");
  }

  function renderInstallments() {
    const selectedStatus = statusFilter.value;
    const keyword = searchInput.value.trim().toLowerCase();

    let rowsHtml = "";
    for (let i = 0; i < db.installments.length; i++) {
      const inst = db.installments[i];
      const status = getInstallmentStatus(inst);
      if (selectedStatus !== "All" && status !== selectedStatus) {
        continue;
      }

      const booking = findBookingById(db, inst.bookingId);
      const searchTarget = (booking.customerName + " " + booking.projectName + " " + booking.flatNo).toLowerCase();
      if (searchTarget.indexOf(keyword) === -1) {
        continue;
      }

      const instReminders = [];
      for (let r = 0; r < db.reminders.length; r++) {
        if (db.reminders[r].installmentId === inst.id) {
          instReminders.push(db.reminders[r]);
        }
      }

      let reminderSummary = "-";
      if (instReminders.length > 0) {
        const lastReminder = instReminders[instReminders.length - 1];
        reminderSummary = instReminders.length + "x (last " + lastReminder.date + ")";
      }

      let statusCell = renderStatusBadge(status);
      if (status === "Overdue") {
        statusCell += '<span class="late-note">' + daysBetween(inst.dueDate, today) + "d</span>";
      }

      let actionCell = "";
      if (status !== "Paid") {
        actionCell =
          '<a class="btn-small" href="payments.html?booking=' +
          booking.id +
          "&installment=" +
          inst.id +
          '">Pay</a>' +
          '<button type="button" class="btn-small remind-btn" data-id="' +
          inst.id +
          '">Remind</button>';
      }

      rowsHtml +=
        "<tr>" +
        "<td>" + inst.id + "</td>" +
        "<td>" + escapeHtml(booking.customerName) + "</td>" +
        "<td>" + escapeHtml(booking.projectName + " " + booking.flatNo) + "</td>" +
        "<td>#" + inst.installmentNo + "/" + inst.totalInstallments + "</td>" +
        "<td>" + inst.dueDate + "</td>" +
        "<td>" + formatCurrency(inst.amount) + "</td>" +
        "<td>" + statusCell + "</td>" +
        "<td>" + reminderSummary + "</td>" +
        "<td>" + actionCell + "</td>" +
        "</tr>";
    }

    tableBody.innerHTML = rowsHtml || '<tr><td colspan="9" class="empty-cell">No installments match your filter.</td></tr>';

    const buttons = tableBody.querySelectorAll(".remind-btn");
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        openSingleReminderModal(this.getAttribute("data-id"));
      });
    }
  }

  sendBtn.addEventListener("click", function () {
    if (activeMode === "single") {
      const text = messageInput.value.trim();
      if (text === "") {
        setFieldError("reminderMessage", "reminderError", "Please enter a reminder message.");
        return;
      }
      const inst = findInstallmentById(db, selectedInstallmentId);
      const booking = findBookingById(db, inst.bookingId);
      db.reminders.push({
        installmentId: inst.id,
        date: today,
        message: text
      });
      saveDatabase(db);
      closeModal();
      showToast("Reminder logged for " + booking.customerName + ".");
      renderInstallments();
    } else if (activeMode === "bulk") {
      const count = bulkOverdueList.length;
      for (let i = 0; i < count; i++) {
        db.reminders.push({
          installmentId: bulkOverdueList[i].id,
          date: today,
          message: "Overdue installment payment reminder"
        });
      }
      saveDatabase(db);
      closeModal();
      showToast(count + " overdue reminder(s) logged.");
      renderInstallments();
    }
  });

  closeModalBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  statusFilter.addEventListener("change", renderInstallments);
  searchInput.addEventListener("input", renderInstallments);
  remindAllBtn.addEventListener("click", openBulkReminderModal);

  renderInstallments();
}

function initReceiptsPage() {
  const db = loadDatabase();
  const params = new URLSearchParams(window.location.search);

  const searchInput = document.getElementById("receiptSearch");
  const listBody = document.getElementById("receiptListBody");
  const receiptCard = document.getElementById("receiptCard");
  const printBtn = document.getElementById("printReceiptBtn");

  function displayReceipt(receiptNo) {
    let payment = null;
    for (let i = 0; i < db.payments.length; i++) {
      if (db.payments[i].receiptNo === receiptNo) {
        payment = db.payments[i];
        break;
      }
    }
    if (!payment) {
      return;
    }

    const booking = findBookingById(db, payment.bookingId);

    let paidToDate = 0;
    for (let i = 0; i < db.payments.length; i++) {
      const p = db.payments[i];
      if (p.bookingId === payment.bookingId) {
        if (p.date < payment.date || (p.date === payment.date && p.id <= payment.id)) {
          paidToDate += p.amount;
        }
      }
    }

    let paymentForLabel = payment.type;
    if (payment.installmentId) {
      const inst = findInstallmentById(db, payment.installmentId);
      if (inst) {
        paymentForLabel = "Installment #" + inst.installmentNo;
      }
    }

    document.getElementById("rcpNumber").textContent = payment.receiptNo;
    document.getElementById("rcpDate").textContent = payment.date;
    document.getElementById("rcpCustomer").textContent = booking.customerName;
    document.getElementById("rcpBookingDetails").textContent =
      "Booking " + booking.id + " - " + booking.projectName + ", Flat " + booking.flatNo;

    document.getElementById("rcpTableBody").innerHTML =
      "<tr>" +
      "<td>" + escapeHtml(paymentForLabel) + "</td>" +
      "<td>" + escapeHtml(payment.method) + "</td>" +
      "<td>" + escapeHtml(payment.reference || "-") + "</td>" +
      "<td>" + formatCurrency(payment.amount) + "</td>" +
      "</tr>";

    document.getElementById("rcpFlatPrice").textContent = formatCurrency(booking.totalPrice);
    document.getElementById("rcpPaidToDate").textContent = formatCurrency(paidToDate);
    document.getElementById("rcpBalance").textContent = formatCurrency(booking.totalPrice - paidToDate);
    document.getElementById("rcpOfficer").textContent = payment.receivedBy;

    receiptCard.classList.remove("hidden");
    receiptCard.scrollIntoView({ behavior: "smooth" });
  }

  function renderReceiptList() {
    const keyword = searchInput.value.trim().toLowerCase();
    let rowsHtml = "";

    for (let i = db.payments.length - 1; i >= 0; i--) {
      const payment = db.payments[i];
      const booking = findBookingById(db, payment.bookingId);
      const searchTarget = (booking.customerName + " " + payment.receiptNo).toLowerCase();
      if (searchTarget.indexOf(keyword) === -1) {
        continue;
      }

      rowsHtml +=
        "<tr>" +
        "<td><strong>" + payment.receiptNo + "</strong></td>" +
        "<td>" + payment.date + "</td>" +
        "<td>" + escapeHtml(booking.customerName) + "</td>" +
        "<td>" + formatCurrency(payment.amount) + "</td>" +
        "<td>" + payment.method + "</td>" +
        '<td><button type="button" class="btn-small view-receipt-btn" data-receipt="' +
        payment.receiptNo +
        '">View</button></td>' +
        "</tr>";
    }

    listBody.innerHTML = rowsHtml || '<tr><td colspan="6" class="empty-cell">No receipts found.</td></tr>';

    const viewButtons = listBody.querySelectorAll(".view-receipt-btn");
    for (let i = 0; i < viewButtons.length; i++) {
      viewButtons[i].addEventListener("click", function () {
        displayReceipt(this.getAttribute("data-receipt"));
      });
    }
  }

  printBtn.addEventListener("click", function () {
    document.body.classList.add("printing-receipt");
    window.print();
    document.body.classList.remove("printing-receipt");
  });

  searchInput.addEventListener("input", renderReceiptList);
  renderReceiptList();

  const initialReceipt = params.get("receipt");
  if (initialReceipt) {
    displayReceipt(initialReceipt);
  }
}

function initReportsPage() {
  const db = loadDatabase();
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

  function renderReports() {
    const fromDate = fromInput.value;
    const toDate = toInput.value;

    if (!fromDate || !toDate || fromDate > toDate) {
      showToast("Please select a valid date range.");
      return;
    }

    const rangePayments = [];
    let rangeTotal = 0;
    for (let i = 0; i < db.payments.length; i++) {
      const p = db.payments[i];
      if (p.date >= fromDate && p.date <= toDate) {
        rangePayments.push(p);
        rangeTotal += p.amount;
      }
    }

    let outstandingTotal = 0;
    let overdueTotal = 0;
    const unpaidInstallments = [];

    for (let i = 0; i < db.installments.length; i++) {
      const inst = db.installments[i];
      if (!inst.paid) {
        unpaidInstallments.push(inst);
        outstandingTotal += inst.amount;
        if (inst.dueDate < today) {
          overdueTotal += inst.amount;
        }
      }
    }

    for (let i = 0; i < db.bookings.length; i++) {
      if (!db.bookings[i].bookingPaid) {
        outstandingTotal += db.bookings[i].bookingMoney;
      }
    }

    document.getElementById("repCollected").textContent = formatCurrency(rangeTotal);
    document.getElementById("repPaymentsCount").textContent = String(rangePayments.length);
    document.getElementById("repOutstanding").textContent = formatCurrency(outstandingTotal);
    document.getElementById("repOverdue").textContent = formatCurrency(overdueTotal);

    const monthlyMap = {};
    const monthKeys = [];
    let currentMonth = fromDate.slice(0, 7);
    const endMonth = toDate.slice(0, 7);

    while (currentMonth <= endMonth) {
      monthKeys.push(currentMonth);
      monthlyMap[currentMonth] = { count: 0, bookingMoney: 0, installments: 0 };
      currentMonth = addMonths(currentMonth + "-01", 1).slice(0, 7);
    }

    for (let i = 0; i < rangePayments.length; i++) {
      const p = rangePayments[i];
      const key = p.date.slice(0, 7);
      if (monthlyMap[key]) {
        monthlyMap[key].count += 1;
        if (p.installmentId) {
          monthlyMap[key].installments += p.amount;
        } else {
          monthlyMap[key].bookingMoney += p.amount;
        }
      }
    }

    let maxMonthAmount = 1;
    for (let i = 0; i < monthKeys.length; i++) {
      const m = monthlyMap[monthKeys[i]];
      const total = m.bookingMoney + m.installments;
      if (total > maxMonthAmount) {
        maxMonthAmount = total;
      }
    }

    let monthlyHtml = "";
    for (let i = 0; i < monthKeys.length; i++) {
      const key = monthKeys[i];
      const m = monthlyMap[key];
      const total = m.bookingMoney + m.installments;
      const barWidth = Math.round((total / maxMonthAmount) * 100);
      monthlyHtml +=
        "<tr>" +
        "<td>" + key + "</td>" +
        "<td>" + m.count + "</td>" +
        "<td>" + formatCurrency(m.bookingMoney) + "</td>" +
        "<td>" + formatCurrency(m.installments) + "</td>" +
        "<td><strong>" + formatCurrency(total) + "</strong></td>" +
        '<td><div class="bar-track"><div class="bar-fill" style="width:' + barWidth + '%"></div></div></td>' +
        "</tr>";
    }
    document.getElementById("monthlyReportBody").innerHTML = monthlyHtml;

    const projectNames = [];
    for (let i = 0; i < db.bookings.length; i++) {
      const proj = db.bookings[i].projectName;
      if (projectNames.indexOf(proj) === -1) {
        projectNames.push(proj);
      }
    }

    let projectHtml = "";
    for (let i = 0; i < projectNames.length; i++) {
      const projectName = projectNames[i];
      const projectBookingIds = [];
      let salesValue = 0;

      for (let b = 0; b < db.bookings.length; b++) {
        if (db.bookings[b].projectName === projectName) {
          projectBookingIds.push(db.bookings[b].id);
          salesValue += db.bookings[b].totalPrice;
        }
      }

      let collectedTotal = 0;
      for (let p = 0; p < db.payments.length; p++) {
        if (projectBookingIds.indexOf(db.payments[p].bookingId) !== -1) {
          collectedTotal += db.payments[p].amount;
        }
      }

      let collectedRange = 0;
      for (let p = 0; p < rangePayments.length; p++) {
        if (projectBookingIds.indexOf(rangePayments[p].bookingId) !== -1) {
          collectedRange += rangePayments[p].amount;
        }
      }

      const percent = ((collectedTotal / salesValue) * 100).toFixed(1) + "%";
      projectHtml +=
        "<tr>" +
        "<td>" + escapeHtml(projectName) + "</td>" +
        "<td>" + projectBookingIds.length + "</td>" +
        "<td>" + formatCurrency(salesValue) + "</td>" +
        "<td>" + formatCurrency(collectedRange) + "</td>" +
        "<td>" + formatCurrency(collectedTotal) + "</td>" +
        "<td>" + formatCurrency(salesValue - collectedTotal) + "</td>" +
        "<td>" + percent + "</td>" +
        "</tr>";
    }
    document.getElementById("projectReportBody").innerHTML = projectHtml;

    let bookingHtml = "";
    for (let i = 0; i < db.bookings.length; i++) {
      const b = db.bookings[i];

      let paidByBooking = 0;
      for (let p = 0; p < db.payments.length; p++) {
        if (db.payments[p].bookingId === b.id) {
          paidByBooking += db.payments[p].amount;
        }
      }

      let overdueByBooking = 0;
      let nextDue = "-";
      for (let u = 0; u < unpaidInstallments.length; u++) {
        const inst = unpaidInstallments[u];
        if (inst.bookingId === b.id) {
          if (inst.dueDate < today) {
            overdueByBooking += inst.amount;
          }
          if (nextDue === "-" || inst.dueDate < nextDue) {
            nextDue = inst.dueDate;
          }
        }
      }

      bookingHtml +=
        "<tr>" +
        "<td>" + b.id + "</td>" +
        "<td>" + escapeHtml(b.customerName) + "</td>" +
        "<td>" + escapeHtml(b.flatNo) + "</td>" +
        "<td>" + formatCurrency(b.totalPrice) + "</td>" +
        "<td>" + formatCurrency(paidByBooking) + "</td>" +
        "<td>" + formatCurrency(b.totalPrice - paidByBooking) + "</td>" +
        "<td>" + formatCurrency(overdueByBooking) + "</td>" +
        "<td>" + nextDue + "</td>" +
        "</tr>";
    }
    document.getElementById("bookingReportBody").innerHTML = bookingHtml;
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
    downloadLink.download = "flatnest-financial-report.csv";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast("CSV report downloaded.");
  }

  applyBtn.addEventListener("click", renderReports);
  printBtn.addEventListener("click", function () {
    window.print();
  });
  exportBtn.addEventListener("click", exportReportToCsv);

  renderReports();
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
    case "payments":
      initPaymentsPage();
      break;
    case "installments":
      initInstallmentsPage();
      break;
    case "receipts":
      initReceiptsPage();
      break;
    case "reports":
      initReportsPage();
      break;
    default:
      break;
  }
});
