# PEL CRM System

This repository contains the project progression used for academic reviews.

## Project Team

- S. Eswar Charan - 2500080125
- S. Lakshmi Charan - 2500080176
- Ponesh - 2500080223

## Review 1

`prototype/` contains the original frontend CRM prototype built with HTML, CSS, and JavaScript.

## Review 2

`review2/` contains the upgraded React + Vite CRM application.

- Separate User and Admin portals
- User-only signup and Local Storage login
- Admin route: `/admin`
- Admin team-performance and record-management views
- Browser-local customer, pipeline, and task records
- Search, saved views, CSV import/export, and dashboard personalization
- Drag-and-drop pipeline, task calendar, analytics, activity timeline, and responsive UI feedback

## Implementation Reference

| Area | Used in PEL CRM | Why it is used |
| --- | --- | --- |
| HTML through JSX | Login and sign-up forms, navigation, dashboard cards, tables, modals, calendar, and accessible controls | Gives every screen a clear, semantic structure. |
| CSS | `styles.css`, `tools.css`, and `admin.css` | Delivers the fixed Monsoon design, responsive layouts, dark/light mode, portal-specific styling, animations, and interaction states. |
| JavaScript | Validation, CRUD actions, filters, CSV import/export, analytics, keyboard shortcuts, and drag-and-drop | Makes the CRM interactive in the browser without a backend. |
| React | Reusable portal pages and UI components in `review2/src/App.jsx` | Keeps the interface state-driven and lets the same record data update dashboards, pages, and counters. |
| Vite | Development server and production build tooling | Provides a fast React workflow and creates the deployable `dist` output. |
| Local Storage | Accounts, CRM records, settings, saved views, activity, and preferences | Persists the frontend demo data in the same browser after a refresh or restart. |
| Session Storage | Current login session | Keeps user and administrator sessions separate until logout or browser-session end. |

### Main React components and functions

- **Portal components:** Auth, Dashboard, AdminDashboard, Customers, Pipeline, Tasks, My Profile, Settings, and Users.
- **Supporting components:** RecordTools, SavedViews, TaskCalendar, AnalyticsPanel, ActivityTimeline, ToolbarPanel, ConfirmDelete, Toast, and PageSkeleton.
- **Core functions:** `authenticate`, `logout`, `saveRecord`, `updateRecord`, `removeRecord`, `completeTask`, `saveSettings`, `saveView`, `importRecords`, `moveDeal`, `navigate`, `downloadCsv`, and `parseCsv`.
- **Theme:** a fixed **Monsoon** visual system with a light/dark display toggle. Users cannot select another theme pack.

## Run the Review 2 application

```bash
cd review2
npm install
npm run dev
```

For Vercel, set the project Root Directory to `review2`.

## Review Deliverables

The latest presentation, report PDF, and editable project documentation are generated in `output/final-review/`.
