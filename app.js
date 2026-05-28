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

// ===== AI INSIGHTS =====

const WORKER_URL = "https://vyapar-ai-worker.aspotdar1496.workers.dev";

async function callAI(prompt) {
  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.result;
  } catch (error) {
    throw new Error("AI request failed: " + error.message);
  }
}

async function generateWeeklySummary() {
  const btn = document.getElementById("btn-generate-summary");
  const output = document.getElementById("weekly-summary-output");

  // Show loading state
  btn.disabled = true;
  btn.textContent = "Generating...";
  output.innerHTML = '<div class="loading">Analysing Mehta Traders data...</div>';

  // Build prompt from real data
  const totalDue = CUSTOMERS.reduce((sum, c) => {
    const stats = getCustomerStats(c.id);
    return sum + stats.totalDue;
  }, 0);

  const totalBusiness = CUSTOMERS.reduce((sum, c) => {
    const stats = getCustomerStats(c.id);
    return sum + stats.totalBusiness;
  }, 0);

  const overdueCustomers = CUSTOMERS.filter(c => {
    const stats = getCustomerStats(c.id);
    return stats.totalDue > 0;
  }).map(c => c.name);

  const prompt = `
You are a business assistant for Mehta Traders, a lubricant distributor in Pune, India.

Here is this week's business data:
- Total business done: ₹${totalBusiness.toLocaleString("en-IN")}
- Total amount collected: ₹${(totalBusiness - totalDue).toLocaleString("en-IN")}
- Total pending/due: ₹${totalDue.toLocaleString("en-IN")}
- Customers with pending payments: ${overdueCustomers.join(", ")}
- Total active customers: ${CUSTOMERS.length}

Write a short weekly business summary (3 short paragraphs):
1. Overall performance this week
2. Payment collection status and which customers need follow-up
3. One specific action Mehta ji should take this week

Keep it friendly, practical, and under 180 words. Address the owner as "Mehta ji".
  `;

  try {
    const result = await callAI(prompt);
    output.innerHTML = result
      .split("\n")
      .filter(line => line.trim())
      .map(line => `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
      .join("");
  } catch (error) {
    output.innerHTML = `<div style="color:#c44545;">⚠️ ${error.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "✨ Generate";
  }
}

async function analyzePaymentBehavior() {
  const btn = document.getElementById("btn-payment-behavior");
  const output = document.getElementById("payment-behavior-output");

  // Show loading state
  btn.disabled = true;
  btn.textContent = "Analyzing...";
  output.innerHTML = '<div class="loading">Analyzing customer payment patterns...</div>';

  // Build customer payment data
  const customerData = CUSTOMERS.map(c => {
    const stats = getCustomerStats(c.id);
    const reliability = stats.totalDue === 0 ? "fully paid" :
      stats.totalDue > 10000 ? "high risk" : "moderate risk";
    return `${c.name}: Total business ₹${stats.totalBusiness.toLocaleString("en-IN")}, Paid ₹${stats.totalPaid.toLocaleString("en-IN")}, Due ₹${stats.totalDue.toLocaleString("en-IN")} (${reliability})`;
  }).join("\n");

  const prompt = `
You are a business analyst for Mehta Traders, a lubricant distributor in Pune, India.

Here is the payment data for all customers:
${customerData}

Analyze the payment behavior and provide:
1. Top 2 most reliable customers (pay on time)
2. Top 2 highest risk customers (large dues)
3. One practical collection strategy for Mehta ji

Keep it under 150 words. Be specific with customer names and amounts.
  `;

  try {
    const result = await callAI(prompt);
    output.innerHTML = result
      .split("\n")
      .filter(line => line.trim())
      .map(line => `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
      .join("");
  } catch (error) {
    output.innerHTML = `<div style="color:#c44545;">⚠️ ${error.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "✨ Analyze";
  }
}