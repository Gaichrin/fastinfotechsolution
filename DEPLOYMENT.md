# Deployment: GitHub Pages + Hostinger PHP + Hostinger MySQL

Target flow:

```text
React frontend (GitHub Pages)
  -> PHP API backend (Hostinger)
  -> MySQL database (Hostinger)
```

## 1. Hostinger Backend

1. In Hostinger hPanel, create a MySQL database and user.
2. Give the user access to the database.
3. Use PHP 8.1 or newer.
4. Upload the `api/` folder to the Hostinger backend domain or subdomain.
   - Current backend base URL: `https://forestgreen-fish-476599.hostingersite.com/FITS/index.php`
   - The frontend will call `https://forestgreen-fish-476599.hostingersite.com/FITS/index.php/api/availability`.
5. Create an `.env` file inside the uploaded `api/` folder using `.env.hostinger.example` as the template.
6. Set `SITE_URL` to the backend base URL, without a trailing slash.
7. Set `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` to your GitHub Pages URL.

Example backend `.env` values:

```env
FRONTEND_URL=https://gaichrin.github.io/fastinfotechsolution
CORS_ALLOWED_ORIGINS=https://gaichrin.github.io
SITE_URL=https://forestgreen-fish-476599.hostingersite.com/FITS/index.php

APPOINTMENT_DB_HOST=localhost
APPOINTMENT_DB_PORT=3306
APPOINTMENT_DB_NAME=u123456789_fits_appointments
APPOINTMENT_DB_USER=u123456789_fits_app
APPOINTMENT_DB_PASSWORD=replace-with-hostinger-db-password
```

The backend creates or updates the `appointments` table automatically on first API use.

Check the backend after upload:

```text
https://forestgreen-fish-476599.hostingersite.com/FITS/index.php/api/health
```

You should see JSON with `ok: true`, `appointmentProvider: "mysql"`, and `emailConfigured`.

## 2. GitHub Pages Frontend

In the GitHub repository, go to **Settings -> Secrets and variables -> Actions**.

Add this repository variable:

```text
VITE_API_BASE_URL=https://forestgreen-fish-476599.hostingersite.com/FITS/index.php
```

Add this repository variable:

```text
VITE_BASE_PATH=/fastinfotechsolution/
```

Use `/fastinfotechsolution/` for this project page:

```text
https://gaichrin.github.io/fastinfotechsolution/
```

Use `/` only if the site is published at the root:

```text
https://your-github-user.github.io/
```

Then go to **Settings -> Pages** and set **Source** to **GitHub Actions**.

The workflow in `.github/workflows/deploy-github-pages.yml` builds `dist/` and publishes it to GitHub Pages on each push to `main`.

## 3. Local Testing Against The Backend

To test the frontend locally against the current XAMPP API copy:

```bash
VITE_API_BASE_URL=http://localhost/FITS npm run dev
```

The XAMPP API URL should respond here:

```text
http://localhost/FITS/api/health
```

## 4. Important Notes

- Do not commit `.env`; it is ignored by git.
- Keep `VITE_API_BASE_URL` as the backend base URL only. Do not include `/api`.
- Keep `SITE_URL` as the backend base URL only. Do not include `/api`.
- If the browser blocks requests, check `CORS_ALLOWED_ORIGINS` and make sure it matches the GitHub Pages origin exactly.
- If `/api/health` returns 404 on Hostinger, confirm `api/.htaccess` was uploaded.
