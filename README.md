# Vyapar AI 🤖
### AI ops assistant for Indian small businesses

Built during the **OpenAI x Outskill AI Builders Hackathon 2026**

🔗 **Live Demo:** https://vyapar-ai-4bx.pages.dev

---

## What is Vyapar AI?

Every Indian small business owner manages 20-50 customers on paper or Google Sheets. They forget who owes what, lose ₹10,000-₹50,000 every month to delayed payments, and have no time to analyze their own data.

**Vyapar AI turns their business data into actionable AI insights — delivered on WhatsApp every Monday morning.**

---

## Features

| Screen | What it does |
|--------|-------------|
| 📅 Today Dashboard | Overdue payments, urgent follow-ups, today's collection targets |
| 👥 Customers | Full customer list with search, payment history, order details |
| ✨ Insights | AI Weekly Summary + Payment Behavior Analysis (powered by GPT-4o-mini) |
| ⚙️ Settings | Business profile, WhatsApp delivery config, AI settings |

### AI Features (Live — powered by GPT-4o-mini)
- **Weekly Business Summary** — AI reads your business data and writes a plain-English weekly performance report
- **Payment Behavior Insights** — Identifies most reliable and highest-risk customers with specific collection recommendations

---

## Tech Stack

- **Frontend:** HTML + CSS + Vanilla JavaScript (mobile-first)
- **Hosting:** Cloudflare Pages (auto-deploy from GitHub)
- **AI:** OpenAI GPT-4o-mini
- **Version Control:** GitHub

---

## Screenshots

### Today Dashboard
<img width="600" height="865" alt="today tab" src="https://github.com/user-attachments/assets/47b3d35e-a67f-42bc-a3f5-4d1cbaebc4c8" />

### Customers Screen  
<img width="602" height="865" alt="customer tab" src="https://github.com/user-attachments/assets/00defab0-c529-40cd-ab8a-f40fd102da5c" />

### AI Insights — Weekly Summary
<img width="616" height="872" alt="Screenshot 2026-05-28 091921" src="https://github.com/user-attachments/assets/d344e7a1-82dd-496c-be7d-558ece0aa719" />

---

## Architecture

Browser → Cloudflare Pages (frontend)
↓
User taps "Generate"
↓
Cloudflare Worker (API proxy, encrypted key)
↓
OpenAI GPT-4o-mini
↓
AI response displayed in app

---

## Demo Business

This app demos with **Mehta Traders** — a fictional lubricant distributor in Pune.
Inspired by a real lubricant business owner in Kolhapur whose payment reminder
app I built the week before this hackathon.

---

## Builder

**Apurva Potdar**
Built in 4 days · OpenAI x Outskill AI Builders Hackathon 2026
