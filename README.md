# E-sport Tournament Platform

This repository contains a full-stack tournament platform (React client + Express server) with Firebase used for authentication and Firestore for the primary data store. The server also uses the Firebase Admin SDK; if a service account is not provided the server falls back to an in-memory store for local testing.

**This README** documents: project overview, structure, how to run locally, and a complete step-by-step Firebase setup and database usage guide (client + server).

**Key links**
- Client Firebase config: [client/src/config/firebase.js](client/src/config/firebase.js#L1)
- Server Firebase Admin: [server/config/firebase-admin.js](server/config/firebase-admin.js#L1)
- Server entry: [server/server.js](server/server.js#L1)

**Features**
- User registration & login (email/password)
- Create, list, update, delete tournaments
- Join tournaments
- Generate matches for a tournament
- Submit match results and update user stats
- Admin endpoints for user/tournament management and exporting/resetting data

Tech stack
- Frontend: React (client/)
- Backend: Node.js + Express (server/)
- Auth & Database: Firebase Authentication + Firestore (via firebase & firebase-admin)

Repository structure (most relevant files)
- [client/](client)
	- [client/src/config/firebase.js](client/src/config/firebase.js#L1) — client Firebase initialization
	- [client/src/App.jsx](client/src/App.jsx#L1) — React app entry
- [server/](server)
	- [server/server.js](server/server.js#L1) — Express server and API routes (auth, tournaments, matches, admin)
	- [server/config/firebase-admin.js](server/config/firebase-admin.js#L1) — Admin SDK initializer (alternative: server reads service-account-key.json)
	- [server/config/service-account-key.json](server/config/service-account-key.json#L1) — place your service account here (gitignore recommended)

Quick start (local)

Prerequisites: Node.js (>=16) and npm

1) Clone

```bash
git clone <repo-url>
cd E-sport
```

2) Install dependencies

```bash
cd server
npm install
cd ../client
npm install
```

3) Configure Firebase (see detailed steps below)

4) Run server and client

Server (development):

```bash
cd server
npm run dev
```

Client (development):

```bash
cd client
npm start
```

The client runs on `http://localhost:3000` and the server on `http://localhost:5000` by default.

Detailed Firebase setup (full method)
-----------------------------------

This project uses two Firebase integrations:

- Client-side Firebase SDK (for Authentication, Firestore reads/writes and Storage): configured in `client/src/config/firebase.js`.
- Server-side Firebase Admin SDK (for secure server operations): configured in `server/config/firebase-admin.js` or by loading a service account JSON at `server/config/service-account-key.json`.

Step 1 — Create a Firebase project

1. Go to https://console.firebase.google.com and create a new project (or reuse an existing one).
2. In 'Build' enable **Authentication**, **Firestore Database** (choose Native mode), and **Storage** if you plan to upload images.

Step 2 — Add a Web App for the client

1. In Firebase console > Project settings > Your apps, click 'Add app' and choose Web.
2. Copy the firebase config snippet. It looks like:

```js
const firebaseConfig = {
	apiKey: "...",
	authDomain: "...",
	projectId: "...",
	storageBucket: "...",
	messagingSenderId: "...",
	appId: "..."
};
```

3. Replace `client/src/config/firebase.js` with your values (or use environment vars — recommended for production).

Environment variable alternative (recommended):

- Create a `.env.local` in `client/` with:

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

Then update `client/src/config/firebase.js` to read from `process.env.REACT_APP_...`.

Step 3 — Create a Firebase service account for the server (Admin SDK)

1. In the Firebase console go to Project Settings > Service accounts.
2. Click 'Generate new private key' and download the JSON file.
3. Save it to the server as `server/config/service-account-key.json` (gitignore it!).

Secure alternative (do not commit JSON): set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of the JSON, or store the JSON string in an environment variable and parse it at runtime.

Example: load from env var (Add to `server/server.js` before initialize):

```js
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
	const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
	initializeApp({ credential: cert(serviceAccount) });
} else {
	// fallback to file or in-memory
}
```

Step 4 — Firestore rules and indexes

Start with permissive rules while developing then tighten for production:

```
service cloud.firestore {
	match /databases/{database}/documents {
		match /{document=**} {
			allow read, write: if request.auth != null;
		}
	}
}
```

Database design (collections and example documents)
-------------------------------------------------

Collections used by the server:

- `users` document fields:
	- `uid` (string) — firebase auth uid
	- `username`, `email`, `password` (stored in DB for this demo — **do not** store plaintext in production)
	- `role` (string) — 'user' | 'admin'
	- `tournamentsJoined` (array of tournament IDs)
	- `wins`, `losses`, `totalMatches` (numbers)
	- `createdAt` (ISO string)

- `tournaments` document fields:
	- `title`, `game`, `description`, `prize`, `maxPlayers`, `imageUrl`
	- `players` (array of user `uid`s)
	- `status` ('upcoming'|'ongoing'|'completed')
	- `startDate` (timestamp)
	- `createdAt` (ISO string)

- `matches` document fields:
	- `tournamentId`, `player1`, `player2` (uid strings)
	- `winner` (uid or null)
	- `round`, `status`, `score` (object)
	- `createdAt`, `completedAt`

Server API (examples)
---------------------

Base URL: `http://localhost:5000`

Auth
- POST `/api/auth/register` — body: `{ username, email, password }`
- POST `/api/auth/login` — body: `{ email, password }`

Tournaments
- GET `/api/tournaments` — list tournaments
- GET `/api/tournaments/:id` — get single tournament
- POST `/api/tournaments/create` — create tournament (body: `{ title, game, description, prize, maxPlayers, startDate, imageUrl }`)
- POST `/api/tournaments/join/:id` — join tournament (body: `{ userId }`)
- PUT `/api/tournaments/:id` — update tournament
- DELETE `/api/tournaments/:id` — delete tournament

Matches
- GET `/api/matches` — list all matches (optional query `?tournamentId=...`)
- POST `/api/matches/generate` — body: `{ tournamentId, players: [uids] }` — generates bracket pairs
- PUT `/api/matches/:id/result` — body: `{ winnerId, score1, score2 }` — mark match result and update user stats

Admin
- GET `/api/admin/users` — list users
- PUT `/api/admin/users/:id/role` — set role
- PUT `/api/admin/users/:id/stats` — update stats
- POST `/api/admin/reset-all` — reset matches/tournaments/users
- POST `/api/admin/users/:id/boost-rank` — add wins

Example curl (create tournament):

```bash
curl -X POST http://localhost:5000/api/tournaments/create \
	-H "Content-Type: application/json" \
	-d '{"title":"Test Cup","game":"Valorant","description":"Test","maxPlayers":16}'
```

Client examples (fetch)

Register:

```js
await fetch('http://localhost:5000/api/auth/register', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ username: 'alice', email: 'a@a.com', password: 'secret' })
});
```

Join tournament:

```js
await fetch(`http://localhost:5000/api/tournaments/join/${tournamentId}`, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ userId: uid })
});
```

Security notes & production recommendations
------------------------------------------

- Do NOT store plaintext passwords in Firestore. Use Firebase Authentication for user credentials and store only the `uid` and profile metadata in Firestore.
- Remove `client/src/config/firebase.js` hard-coded keys and use environment variables for production.
- Do not commit `server/config/service-account-key.json` — add it to `.gitignore`.
- Enforce Firestore security rules in production and validate admin actions server-side.

Troubleshooting
---------------

- If the server logs "No service account found, using local fallback mode" it means `server/config/service-account-key.json` was not found — the server will use an in-memory store for quick testing.
- To enable Firestore, add the service account JSON or set `FIREBASE_SERVICE_ACCOUNT_JSON` env var with the JSON string.

Extras & next steps
-------------------

- Consider migrating password storage to Firebase Auth entirely and remove `password` fields from Firestore.
- Add pagination and indexes for tournaments/matches queries in Firestore.

If you want, I can:
- Run a quick scan of the repository and update `client/src/config/firebase.js` to read from environment variables.
- Add `.env.example` files for client and server.

--
README generated and added to repository.

