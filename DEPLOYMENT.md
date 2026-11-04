# Deploy Eventraa to Render and Vercel

This repository uses an Express API in `server/` and Create React App in
`client/` (not Vite).

## 1. Push the deployment configuration

Commit and push the changes to the GitHub branch you plan to deploy. For
example, from PowerShell:

```powershell
git add render.yaml client/package.json client/package-lock.json client/vercel.json DEPLOYMENT.md
git commit -m "Add Render and Vercel deployment config"
git push origin main
```

## 2. Deploy the API to Render

In Render, create a **Blueprint** from this repository and select `render.yaml`,
or create a Web Service manually with:

- Root Directory: `server`
- Runtime: Node
- Build Command: `npm ci --omit=dev`
- Start Command: `npm start`

Render supplies `PORT` automatically; do not set it yourself.

Set these Render environment variables:

| Variable | Value |
| --- | --- |
| `MONGO_URI` | MongoDB connection string (required) |
| `JWT_SECRET` | A long, random signing secret (required) |
| `CLIENT_URL` | Exact Vercel production origin, e.g. `https://eventraa.vercel.app` |
| `FRONTEND_URL` | Same Vercel production origin; used for payment redirects |
| `RAZORPAY_KEY_ID` | Razorpay key ID (needed for payments) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret (needed for payments; keep private) |
| `OPENROUTER_API_KEY` | OpenRouter key (needed for chat) |

`CLIENT_URL` and `FRONTEND_URL` can be filled in after Vercel is deployed.
Never put private keys in the frontend or commit them to the repository.

For MongoDB Atlas, create a database user with a strong password and grant only
the required database access. Atlas must allow connections from Render; Render
does not provide a fixed outbound IP for every service, so an IP allow-list may
need `0.0.0.0/0`. Use this only with strong database credentials and least
privilege.

After Render deploys, verify the API at `https://<render-service>.onrender.com/`.
It should respond with `Eventra API running`.

## 3. Deploy the frontend to Vercel

Import the same GitHub repository into Vercel and set:

- Root Directory: `client`
- Framework Preset: Create React App
- Build Command: `npm run build`
- Output Directory: `build`

Add this Vercel environment variable for Production:

| Variable | Value |
| --- | --- |
| `REACT_APP_API_URL` | `https://<render-service>.onrender.com/api` |

Use the Render URL followed by `/api`, with no trailing slash. The app reads
this value at build time. `client/vercel.json` proxies `/api/*` requests to
Render and rewrites other paths to `index.html`, so client-side routes such as
`/login` continue to work when opened or refreshed directly.

## 4. Connect and verify both services

Copy the Vercel production origin (scheme and hostname only) into Render's
`CLIENT_URL` and `FRONTEND_URL`, then save the Render environment variables.
Redeploy if Render does not automatically deploy the change. Redeploy the
frontend after changing its environment variables.

Open the frontend and test a direct page refresh, sign-in, and any configured
database, chat, or payment flows. If browser requests fail with a CORS error,
make sure `CLIENT_URL` exactly matches the Vercel origin, including `https://`
and excluding a path or trailing slash.
