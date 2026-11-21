# 🎓 Lovely Professional University (LPU)
## CSE 326: Internet Programming — Continuous Assessment (CA) Project
### **Project Title:** Student Identity Card (ID) Replacement and Reissue System

---

## 📌 1. Project Overview
This frontend web application provides a responsive, interactive, and resilient system for managing student identity card replacements and duplicate reissues at Lovely Professional University.

Developed strictly in accordance with the **LPU CSE 326 syllabus (Units 1 to 4)**, the portal covers:
1. **Student Identification & Reissue Application Form:** Captures Roll / Registration Number, Full Name, Academic Branch, Blood Group, and Reissue Reason (*Lost*, *Damaged*, or *Defaced*).
2. **Mandatory Document Checklist Simulator:** Dynamically adapts based on the reason (Police Lost Report / NCR acknowledgment for *Lost*, physical card surrender & photograph for *Damaged/Defaced*) with drag-and-drop file upload and animated security scan.
3. **Reissue Fee Calculator & Payment Gateway Simulator:** Supports **Standard Batch Reissue (₹300)** vs **Urgent 24-Hour Express Processing (₹600)** plus optional campus accessories, with real-time bill calculation and payment simulator (UPI / Cards / UMS Account).
4. **Real-Time LPU Campus Dispatch & Pickup Tracker:** Stage-by-stage intra-campus tracking from *UMS submission* to *Security Office (Block 29)* to *Printing (Block 30)* to *Pickup Counter (Block 32 / Uni-Mall)*, along with an interactive 3D digital ID card preview.

---

## 📚 2. CSE 326 Syllabus Compliance Matrix (Units 1 - 4)

| Unit | Syllabus Topics Covered | Implementation in Code |
| :--- | :--- | :--- |
| **Unit 1: HTML5 Architecture & Forms** | Semantic layout tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`), HTML5 Form elements (`input[type="text|email|tel|radio|checkbox|file"]`, `<select>`, `<button>`), form constraints (`required`, `maxlength`, `placeholder`, `novalidate`). | [index.html](file:///C:/Users/pratyush/.gemini/antigravity/scratch/lpu-id-card-reissue/index.html) |
| **Unit 2: CSS3 Styling & Layouts** | CSS3 custom variables (`:root`), Flexbox (`display: flex`), CSS Grid (`display: grid`), box model, gradients, transitions, `@keyframes` pulse & scan animation, media queries (`@media (max-width: 900px)`), print styles (`@media print`), dark/light theme mode. | [style.css](file:///C:/Users/pratyush/.gemini/antigravity/scratch/lpu-id-card-reissue/style.css) |
| **Unit 3: JavaScript Core Fundamentals** | ES6+ variables (`let`, `const`), arrow functions, object models, array methods (`forEach`, `filter`), conditional logic (`if/else`, ternary operators), event listener bindings (`addEventListener`). | [script.js](file:///C:/Users/pratyush/.gemini/antigravity/scratch/lpu-id-card-reissue/script.js) |
| **Unit 4: Advanced JS, DOM/BOM & Validation** | Client-side Regex validation (`/^\d{8}$/` for 8-digit Reg No, `/^[6-9]\d{9}$/` for mobile, email regex), DOM tree manipulation (`querySelector`, `classList`, dynamic checklist creation), BOM (`localStorage` persistence, `window.print()`), timer functions (`setInterval`, `setTimeout`). | [script.js](file:///C:/Users/pratyush/.gemini/antigravity/scratch/lpu-id-card-reissue/script.js) |

---

## 🚀 3. How to Open and Run the Webpage

No external dependencies, build tools, or npm installations are needed. The project is built using pure **HTML5, CSS3, and Vanilla JavaScript**.

### Method 1: Direct Browser Launch
1. Navigate to:
   `C:\Users\pratyush\.gemini\antigravity\scratch\lpu-id-card-reissue`
2. Double-click [index.html](file:///C:/Users/pratyush/.gemini/antigravity/scratch/lpu-id-card-reissue/index.html) to open it in Google Chrome, Microsoft Edge, or Mozilla Firefox.

### Method 2: Local HTTP Server (Optional)
If running a simple Python web server:
```bash
cd C:\Users\pratyush\.gemini\antigravity\scratch\lpu-id-card-reissue
python -m http.server 3000
```
Then visit `http://localhost:3000` in your web browser.

---

## 🎯 4. Key Interactive Features for Demonstration / Viva

1. **Auto-Fill Demo Button (`🪄 Auto-Fill Demo`):**
   - Click this button in the top right header to populate the entire form with verified test data and jump straight to document verification and scanning!
2. **Dynamic Document Checklist:**
   - Switching between *Lost*, *Damaged*, and *Defaced* automatically adjusts the required document list and guidelines.
3. **Simulated Document Scan & Authenticity Check:**
   - Drop any file (PDF/JPG/PNG < 2MB) into the upload box to trigger an automated scanning progress bar.
4. **Reissue Fee Calculator:**
   - Toggle between *Standard Processing (₹300)* and *Urgent 24-Hour Processing (₹600)* and see the bill summary update in real-time. Add optional accessories (+ ₹50 lanyard holder, + ₹40 emergency slip).
5. **Simulated Payment Gateway:**
   - Pay using UPI, Debit Card, or LPU UMS Account balance. Generates a unique `TXN-LPU-XXXXXX` transaction ID.
6. **Campus Lifecycle Tracker:**
   - Click `Simulate Next Campus Stage` to advance the card through LPU blocks:
     - *Online UMS Portal* $\to$ *Block 29 (Security)* $\to$ *Block 30 (Central Printing)* $\to$ *Transit* $\to$ *Block 32 (DSW Counter 4)*.
7. **Digital Student ID Card Preview:**
   - Shows the generated replacement card with student photo, barcode, chip, blood group, and registration number.
8. **Print Official Fee Receipt:**
   - Click `Print Official LPU Fee Receipt` to trigger a clean printable layout using CSS `@media print`.
9. **Dark Mode Toggle (`🌙 / ☀️`):**
   - Seamlessly switches themes and persists preference across browser sessions using `localStorage`.

---

## 💬 5. Quick Viva Questions & Answers for CSE 326 Evaluators

- **Q1: Which Regular Expression is used to validate the LPU Registration Number?**
  - **Ans:** `/^\d{8}$/`. It ensures the input consists of exactly 8 numeric digits without letters or special characters.
- **Q2: How does the application store user state across reloads?**
  - **Ans:** Through HTML5 Web Storage API (`localStorage.setItem('lpu_reissue_state', JSON.stringify(...))`), part of Unit 4 Browser Object Model (BOM).
- **Q3: How are dynamic documents rendered when switching reasons?**
  - **Ans:** Through DOM manipulation using JavaScript objects (`CHECKLIST_DATA`), `document.createElement('div')`, and `appendChild()`.
- **Q4: How does the fee calculator update without refreshing the page?**
  - **Ans:** Using JavaScript event listeners (`change` and `click`) that re-calculate totals and update `textContent` inside DOM elements immediately.
