# CineSphere

website-link : https://cinesphere-8ff1.onrender.com

CineSphere is a movie discovery and tracking web app. Browse and search movies, explore movie details, manage a personal watchlist, record films in a watch diary, write reviews, compare movies, and get curated recommendations through CineChat.

The project is organized as a React frontend and an Express/MongoDB backend.

## Features

- **Discover movies** with trending, genre, and Hindi-language movie browsing.
- **Search and explore** movie details, trailers, cast and crew, and similar movies.
- **Create an account and sign in** with email and password or Google sign-in.
- **Manage a personal watchlist** of movies you plan to watch.
- **Keep a watch diary** with watch dates, ratings, notes, and where you watched.
- **Write movie reviews** and view reviews submitted by other users.
- **Compare movies** using the Movie Battle page.
- **Get movie recommendations** and review summaries through CineChat.
- **Responsive interface** built with React, Tailwind CSS, and Framer Motion.

## Tech stack

### Frontend

- React 18
- Vite
- React Router
- TypeScript
- Tailwind CSS
- Axios
- Framer Motion
- Google OAuth

### Backend

- Node.js
- Express
- MongoDB and Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Google authentication library

### Movie data

Movie discovery and details are fetched from [The Movie Database (TMDB)](https://www.themoviedb.org/).

## Project structure

```text
cinesphere/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Shared UI and app components
│   │   ├── context/        # Authentication and watchlist state
│   │   ├── pages/          # App pages
│   │   ├── services/       # API and TMDB clients
│   │   └── App.jsx
│   └── package.json
└── server/                 # Express API
    ├── config/             # Database configuration
    ├── controllers/        # Route handlers
    ├── middleware/         # Authentication middleware
    ├── models/             # Mongoose models
    ├── routes/             # API routes
    ├── server.js
    └── package.json
```

## Prerequisites

Install or prepare the following before running the app:

- [Node.js](https://nodejs.org/) (a current LTS release is recommended)
- npm, included with Node.js
- A MongoDB database, such as a local MongoDB server or MongoDB Atlas
- A TMDB API key
- A Google OAuth client ID if you want to enable Google sign-in

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/Vicky-hue-ui/cinesphere.git
cd cinesphere
```

### 2. Configure the backend

Create a `.env` file inside `server/`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Replace the example values with your own credentials.

- `MONGO_URI` should point to the MongoDB database you want to use.
- `JWT_SECRET` should be a long, private random value. Do not commit it.
- `CLIENT_URL` should match the frontend’s address so the API can allow browser requests from it.
- `GOOGLE_CLIENT_ID` is needed for Google sign-in.

Install backend dependencies and start the API:

```bash
cd server
npm install
npm run dev
```

The API runs on `http://localhost:5000` by default. To run it without the development watcher, use `npm start`.

### 3. Configure the frontend

In a second terminal, from the repository root, create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

The frontend uses `VITE_API_BASE_URL` for requests to the backend and `VITE_TMDB_API_KEY` for movie data. Use the same Google OAuth client ID in the frontend and backend configuration.

Install frontend dependencies and start Vite:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

> Vite exposes variables prefixed with `VITE_` to browser code. Do not put private secrets, such as `JWT_SECRET` or database credentials, in the frontend environment file.

## Available scripts

### Frontend (`client/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run type-check` | Run the TypeScript compiler without emitting files |

### Backend (`server/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node.js |

## Application pages

| Route | Description |
| --- | --- |
| `/` | Home and movie discovery |
| `/movie/:id` | Movie details |
| `/search` | Search movies |
| `/watchlist` | Your saved movies |
| `/diary` | Your watched-movie diary |
| `/battle` | Compare movies |
| `/profile` | User profile |
| `/login` | Sign in |
| `/signup` | Create an account |
| `/forgot-password` | Password-related page |

## API overview

The backend is mounted under `/api`.

| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account | Public |
| `POST` | `/api/auth/login` | Sign in with email and password | Public |
| `POST` | `/api/auth/google` | Sign in or register with Google | Public |
| `GET` | `/api/auth/me` | Get the current user profile | Authenticated |
| `GET` | `/api/reviews/:movieId` | Get reviews for a movie | Public |
| `POST` | `/api/reviews` | Create a review | Authenticated |
| `PUT` | `/api/reviews/:id` | Update a review | Authenticated |
| `DELETE` | `/api/reviews/:id` | Delete a review | Authenticated |
| `GET` | `/api/watchlist` | Get the current user’s watchlist | Authenticated |
| `POST` | `/api/watchlist` | Add a movie to the watchlist | Authenticated |
| `DELETE` | `/api/watchlist/:movieId` | Remove a movie from the watchlist | Authenticated |
| `GET` | `/api/diary` | Get the current user’s diary entries | Authenticated |
| `POST` | `/api/diary` | Add a diary entry | Authenticated |
| `PUT` | `/api/diary/:id` | Update a diary entry | Authenticated |
| `DELETE` | `/api/diary/:id` | Delete a diary entry | Authenticated |
| `POST` | `/api/ai/chat` | Get CineChat recommendations | Public |
| `POST` | `/api/ai/synthesize` | Generate a movie review summary | Public |
| `GET` | `/` | Check that the API is running | Public |

Authenticated API requests must include the JWT returned from login or signup in the authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Environment variable reference

### Backend: `server/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `5000` |
| `CLIENT_URL` | Yes for local browser use | Frontend origin allowed by CORS, such as `http://localhost:5173` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign authentication tokens |
| `JWT_EXPIRES_IN` | No | Token expiration duration; defaults to `7d` for standard login |
| `GOOGLE_CLIENT_ID` | For Google sign-in | Google OAuth client ID |

### Frontend: `client/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Backend API base URL, such as `http://localhost:5000/api` |
| `VITE_TMDB_API_KEY` | Yes for movie data | TMDB API key |
| `VITE_GOOGLE_CLIENT_ID` | For Google sign-in | Google OAuth client ID |

Restart the relevant development server after changing environment variables.

## Troubleshooting

- **The frontend cannot reach the API:** Confirm the backend is running and `VITE_API_BASE_URL` ends in `/api`.
- **CORS errors:** Make sure `CLIENT_URL` exactly matches the frontend origin, including the protocol and port.
- **MongoDB connection errors:** Check `MONGO_URI`, database access permissions, and your network connection.
- **Movie data does not load:** Check that `VITE_TMDB_API_KEY` is present and valid, then restart the Vite server.
- **Google sign-in does not work:** Check that the Google client ID is configured for the frontend and backend, and that your OAuth settings allow the local development origin.
- **Changes to `.env` do not take effect:** Stop and restart the corresponding frontend or backend development server.

## Security notes

- Keep `.env` files and all private credentials out of version control.
- Use a unique, strong `JWT_SECRET` outside local development.
- Configure OAuth credentials and allowed origins for your deployment environment.
- Never expose database connection strings or server-only secrets in frontend variables.

## Contributing

Contributions, suggestions, and bug reports are welcome. Before opening a pull request, please describe the change and include steps to reproduce or verify it where appropriate.

## License

No license information is specified in this repository yet. Add a license before reusing or distributing the project.
