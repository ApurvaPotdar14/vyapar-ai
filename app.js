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

document.addEventListener("DOMContentLoaded", renderTodayScreen);