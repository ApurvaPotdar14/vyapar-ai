// Vyapar AI — Today screen logic

// ===== HELPERS =====

function formatINR(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function todayDate() {
  // Hardcoded "today" for the demo so reminder states show correctly
  // In production this would be: return new Date();
  return new Date("2026-05-26");
}

function daysBetween(date1, date2) {
  const ms = date2 - date1;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function classifyOrder(order) {
  if (order.paid >= order.amount) return "paid";
  const due = new Date(order.dueDate);
  const today = todayDate();
  const diff = daysBetween(today, due);
  if (diff < 0) return "overdue";       // past due
  if (diff === 0) return "today";        // due today
  if (diff === 1) return "urgent";       // due tomorrow
  if (diff <= 3) return "upcoming";      // within 3 days
  return "later";                        // more than 3 days away
}

function getCustomer(customerId) {
  return CUSTOMERS.find(c => c.id === customerId);
}

function getDaysOverdue(order) {
  const due = new Date(order.dueDate);
  const today = todayDate();
  return Math.abs(daysBetween(today, due));
}

// ===== UI BUILDERS =====

function buildOrderCard(order, type) {
  const customer = getCustomer(order.customerId);
  const due = order.amount - order.paid;

  let statusText = "";
  let cardClass = "order-card";

  if (type === "overdue") {
    cardClass += " card-overdue";
    statusText = `⚠️ ${getDaysOverdue(order)} day(s) overdue · Was due ${formatShortDate(order.dueDate)}`;
  } else if (type === "today") {
    cardClass += " card-today";
    statusText = `🔴 Call today · Payment due now`;
  } else if (type === "urgent") {
    cardClass += " card-urgent";
    statusText = `🟠 Urgent · Due tomorrow, ${formatShortDate(order.dueDate)}`;
  } else if (type === "upcoming") {
    cardClass += "";
    const days = daysBetween(todayDate(), new Date(order.dueDate));
    statusText = `📅 Due in ${days} days · ${formatShortDate(order.dueDate)}`;
  }

  const actionLabel = type === "overdue" ? "Send Overdue Reminder"
                    : type === "today" ? "Call Now"
                    : type === "urgent" ? "Send Urgent Reminder"
                    : "Send Reminder";

  return `
    <div class="${cardClass}">
      <div class="order-top">
        <div class="order-customer">${customer.name}</div>
        <div class="order-amount">${formatINR(due)}<small>of ${formatINR(order.amount)}</small></div>
      </div>
      <div class="order-product">${order.product}</div>
      <div class="order-meta">
        <span>📞 ${customer.phone}</span>
        <span>📍 ${customer.location}</span>
      </div>
      <div class="order-status">${statusText}</div>
      <div class="order-actions">
        <button class="btn btn-primary" onclick="sendReminder(${order.id})">${actionLabel}</button>
        <button class="btn btn-success" onclick="markPaid(${order.id})">✓ Mark Paid</button>
      </div>
    </div>
  `;
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// ===== RENDERING =====

function renderTodayScreen() {
  // Header
  document.getElementById("business-name").textContent = BUSINESS.name;
  document.getElementById("business-category").textContent = `${BUSINESS.category} · ${BUSINESS.city}`;

  // Greeting (based on time of day)
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  document.getElementById("greeting-text").textContent = `${greeting}, ${BUSINESS.owner}`;

  // Classify all unpaid orders
  const overdue = [];
  const today = [];
  const urgent = [];
  const upcoming = [];

  ORDERS.forEach(order => {
    const type = classifyOrder(order);
    if (type === "overdue") overdue.push(order);
    else if (type === "today") today.push(order);
    else if (type === "urgent") urgent.push(order);
    else if (type === "upcoming") upcoming.push(order);
  });

  // Urgent banner — show overdue OR today's calls
  const urgentTotal = overdue.length + today.length;
  document.getElementById("urgent-count").textContent =
    urgentTotal > 0
      ? `${urgentTotal} customer${urgentTotal > 1 ? "s" : ""} need${urgentTotal > 1 ? "" : "s"} immediate follow-up`
      : "All caught up — no urgent actions today";

  // Stats — Total Due
  const pendingOrders = ORDERS.filter(o => o.paid < o.amount);
  const totalDue = pendingOrders.reduce((sum, o) => sum + (o.amount - o.paid), 0);
  document.getElementById("total-due").textContent = formatINR(totalDue);
  document.getElementById("pending-count").textContent = `${pendingOrders.length} pending orders`;

  // Stats — Collected this month
  const paidOrders = ORDERS.filter(o => o.paid >= o.amount);
  const collected = paidOrders.reduce((sum, o) => sum + o.paid, 0);
  document.getElementById("total-collected").textContent = formatINR(collected);
  document.getElementById("settled-count").textContent = `${paidOrders.length} orders settled`;

  // Today list
  document.getElementById("today-badge").textContent = today.length;
  document.getElementById("today-list").innerHTML =
    today.length > 0
      ? today.map(o => buildOrderCard(o, "today")).join("")
      : '<div class="empty-state">No calls needed today ✓</div>';

  // Overdue list
  document.getElementById("overdue-badge").textContent = overdue.length;
  document.getElementById("overdue-list").innerHTML =
    overdue.length > 0
      ? overdue.map(o => buildOrderCard(o, "overdue")).join("")
      : '<div class="empty-state">No overdue payments ✓</div>';

  // Urgent (tomorrow) list
  document.getElementById("urgent-badge").textContent = urgent.length;
  document.getElementById("urgent-list").innerHTML =
    urgent.length > 0
      ? urgent.map(o => buildOrderCard(o, "urgent")).join("")
      : '<div class="empty-state">No urgent reminders for tomorrow</div>';

  // Upcoming list
  document.getElementById("upcoming-list").innerHTML =
    upcoming.length > 0
      ? upcoming.map(o => buildOrderCard(o, "upcoming")).join("")
      : '<div class="empty-state">No upcoming reminders in next 3 days</div>';
}

// ===== ACTIONS (demo mode — no real WhatsApp/calls fire) =====

function sendReminder(orderId) {
  const order = ORDERS.find(o => o.id === orderId);
  const customer = getCustomer(order.customerId);
  alert(`[DEMO MODE] Reminder would be sent via WhatsApp to:\n\n${customer.name}\n${customer.phone}\n\nOrder: ${order.product}\nDue: ${formatINR(order.amount - order.paid)}`);
}

function markPaid(orderId) {
  const order = ORDERS.find(o => o.id === orderId);
  const customer = getCustomer(order.customerId);
  if (confirm(`Mark order as paid?\n\n${customer.name}\n${order.product}\n${formatINR(order.amount - order.paid)}`)) {
    order.paid = order.amount;
    renderTodayScreen();
  }
}

// ===== INIT =====

// ===== SCREEN SWITCHING =====

function showScreen(screenName) {
  // Hide all screens
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));

  // Show selected screen
  const screen = document.getElementById(`screen-${screenName}`);
  if (screen) screen.classList.add("active");

  // Update nav buttons
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.nav-btn[data-screen="${screenName}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  // Render screen content when shown
  if (screenName === "customers") renderCustomersScreen();
  if (screenName === "today") renderTodayScreen();

  // Scroll to top
  window.scrollTo(0, 0);
}

// ===== CUSTOMERS SCREEN =====

function getCustomerStats(customerId) {
  const customerOrders = ORDERS.filter(o => o.customerId === customerId);
  const totalBusiness = customerOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalPaid = customerOrders.reduce((sum, o) => sum + o.paid, 0);
  const totalDue = totalBusiness - totalPaid;
  const pendingCount = customerOrders.filter(o => o.paid < o.amount).length;
  return { totalBusiness, totalPaid, totalDue, pendingCount, orderCount: customerOrders.length };
}

function renderCustomersScreen() {
  document.getElementById("customer-count").textContent = CUSTOMERS.length;

  let withDues = 0;
  let fullyPaid = 0;

  CUSTOMERS.forEach(c => {
    const stats = getCustomerStats(c.id);
    if (stats.totalDue > 0) withDues++;
    else fullyPaid++;
  });

  document.getElementById("customers-with-dues").textContent = withDues;
  document.getElementById("customers-fully-paid").textContent = fullyPaid;

  renderCustomerList(CUSTOMERS);
}

function renderCustomerList(customers) {
  const html = customers.map(customer => {
    const stats = getCustomerStats(customer.id);
    const hasDues = stats.totalDue > 0;

    const initials = customer.name
      .split(" ")
      .slice(0, 2)
      .map(w => w[0])
      .join("")
      .toUpperCase();

    return `
      <div class="customer-card ${hasDues ? "has-dues" : "paid-up"}" onclick="openCustomerDetail(${customer.id})">
        <div class="customer-avatar">${initials}</div>
        <div class="customer-info">
          <div class="customer-name">${customer.name}</div>
          <div class="customer-sub">
            <span>📞 ${customer.phone.slice(-5)}</span>
            <span>📦 ${stats.orderCount} order${stats.orderCount > 1 ? "s" : ""}</span>
          </div>
        </div>
        <div class="customer-amount">
          ${hasDues
            ? `<div class="amount-due">${formatINR(stats.totalDue)}</div><small>Due</small>`
            : `<div class="amount-paid">✓ Paid</div><small>Up to date</small>`
          }
        </div>
      </div>
    `;
  }).join("");

  document.getElementById("customer-list").innerHTML =
    html || '<div class="empty-state">No customers found</div>';
}

// ===== CUSTOMER SEARCH =====

function setupCustomerSearch() {
  const searchInput = document.getElementById("customer-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      renderCustomerList(CUSTOMERS);
      return;
    }
    const filtered = CUSTOMERS.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.location.toLowerCase().includes(query)
    );
    renderCustomerList(filtered);
  });
}

// ===== CUSTOMER DETAIL SCREEN =====

function openCustomerDetail(customerId) {
  const customer = getCustomer(customerId);
  const stats = getCustomerStats(customerId);
  const customerOrders = ORDERS.filter(o => o.customerId === customerId);

  const initials = customer.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  const ordersHtml = customerOrders.map(order => {
    const due = order.amount - order.paid;
    let statusClass = "pending";
    let statusText = "Pending";
    let cardClass = "";

    if (order.paid >= order.amount) {
      statusClass = "paid";
      statusText = "Paid";
      cardClass = "paid";
    } else {
      const type = classifyOrder(order);
      if (type === "overdue") {
        statusClass = "overdue";
        statusText = "Overdue";
        cardClass = "overdue";
      }
    }

    return `
      <div class="order-history-card ${cardClass}">
        <div class="order-history-top">
          <div class="order-history-product">${order.product}</div>
          <div class="order-history-status status-${statusClass}">${statusText}</div>
        </div>
        <div class="order-history-meta">
          Bill ${order.billNo} · Due ${formatShortDate(order.dueDate)}
        </div>
        <div class="order-history-amount">
          <span>Total: <strong>${formatINR(order.amount)}</strong></span>
          <span>Paid: <strong>${formatINR(order.paid)}</strong></span>
          ${due > 0 ? `<span>Due: <strong style="color:#c44545;">${formatINR(due)}</strong></span>` : ""}
        </div>
      </div>
    `;
  }).join("");

  document.getElementById("customer-detail-content").innerHTML = `
    <div class="detail-header">
      <div class="tag">Lubricant Customer · ${customer.location}</div>
      <h2>${customer.name}</h2>
      <div class="detail-stats">
        <div class="detail-stat">
          <div class="label">Business</div>
          <div class="value">${formatINR(stats.totalBusiness)}</div>
        </div>
        <div class="detail-stat">
          <div class="label">Collected</div>
          <div class="value paid">${formatINR(stats.totalPaid)}</div>
        </div>
        <div class="detail-stat">
          <div class="label">Pending</div>
          <div class="value due">${formatINR(stats.totalDue)}</div>
        </div>
      </div>
    </div>

    <div class="contact-row">
      <div class="icon">📞</div>
      <div class="text">${customer.phone}</div>
      <button class="call-btn" onclick="alert('[DEMO] Would call ${customer.phone}')">Call</button>
    </div>

    <div class="contact-row">
      <div class="icon">📍</div>
      <div class="text">${customer.location}</div>
    </div>

    <h3 class="section-title" style="margin-top:24px;">Order History (${customerOrders.length})</h3>
    <div class="list">${ordersHtml}</div>
  `;

  showScreen("customer-detail");
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
  renderTodayScreen();
  setupCustomerSearch();
});