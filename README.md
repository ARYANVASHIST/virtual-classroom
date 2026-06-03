# 🏫 Virtual Classroom - Faculty Dashboard

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A sleek, high-performance, responsive web application designed for modern educators. This Faculty Dashboard streamlines classroom administration, tracks real-time student analytics, and simplifies day-to-day teaching workflows through a clean, intuitive user interface.

Built using an optimized **Vanilla Tech Stack**—no heavy frameworks, no bloated dependencies. Just pure, blazing-fast web performance.

---

## ✨ Key Features

*   **📊 Live Analytics Grid:** High-visibility metric cards tracking critical KPIs like *Total Students Enrollment*, *Average Attendance Rates*, and *Pending Assignment Submissions*.
*   **🎯 SPA-style Section Switching:** Seamless, instant navigation between view panels (Overview, Attendance, Assignments, Notifications) driven by lightweight routing logic without full-page reloads.
*   **✅ Interactive Attendance Matrix:** Modern UI controls allowing instructors to quickly toggle student status, updating classroom states instantly.
*   **🔔 Real-Time Alert Engine:** Integrated notification center alerting faculty to recent student assignment uploads and immediate schedule modifications.
*   **📱 Universal Responsiveness:** Built using a mobile-first philosophy, adapting smoothly from massive 4K monitors down to compact smartphone screens.

---

## 🛠️ Architecture & Tech Stack

This project serves as a showcase of clean code standards, utilizing a modular file separation and semantic layouts.

### Frontend Engineering
*   **Semantic HTML5:** Structured for high accessibility (A11y standards) and optimized DOM parsing.
*   **Advanced CSS3 Design System:**
    *   **Layout Engines:** Leverages **CSS Grid** for macro-layouts (dashboard panes) and **Flexbox** for micro-components (navigation elements, status badges).
    *   **Design Tokens:** Driven completely by CSS Custom Properties (Variables) enabling centralized control over typography, spacing scale, and strict semantic states (`--color-success`, `--color-warning`, `--color-danger`).
*   **Vanilla JS (ES6+):** Highly decoupled, event-driven architecture managing state mutations, UI transitions, and modular component logic.

---

## 📁 Repository Structure

```text
├── index.html          # Main application entry point & semantic markup
├── css/
│   └── styles.css      # Core stylesheet containing global tokens, layouts, & UI components
└── js/
    └── main.js         # Core application logic, event delegation, & state handling
