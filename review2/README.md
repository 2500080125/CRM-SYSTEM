# PEL CRM — Project Review 2

A frontend-only CRM built with **React + Vite**. It intentionally uses no backend, database, or cloud service.

## Faculty requirements covered

- **React + Vite:** Vite build tooling with React components in `src/`.
- **Module identification:** Separate Admin and User portals. Admin sees all browser-local records; a User sees only records assigned to their account.
- **Login and signup:** New accounts, session state, and CRM records are stored in browser `localStorage` / `sessionStorage`.
- **Vercel ready:** `npm run build` produces the deployable `dist/` directory.

## Local run

```bash
npm install
npm run dev
```

Open the Local URL shown by Vite, normally `http://localhost:5173`.

## Review demonstration flow

1. Sign up an **Administrator portal** account.
2. Add a customer, opportunity, and task; use the assignment control to assign them to a user after that user signs up.
3. Sign out and sign up a **User portal** account.
4. Show that the User sees only their own assigned records, while the Administrator sees all records on the Users page.
5. Open the Vercel deployment link.

## Vercel deployment

1. Push this `review2` folder to a GitHub repository.
2. Import that repository in Vercel.
3. Set the root directory to `review2` if the repository includes the parent CRM files.
4. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
5. Deploy and copy the deployed URL for the review.

## Important limitation

This is a review-ready frontend prototype. `localStorage` is per browser/device, and client-side roles are not secure authentication. That is intentional because the project scope is frontend only.
