# Book Notes

A personal book-tracking web app inspired by Derek Sivers' book notes page. Keep a record of every non-fiction (or fiction) book you've read, rate it, jot down notes, and browse your collection sorted by rating, recency, or title — complete with cover art pulled from the Open Library Covers API.

## Features

- Add, edit, and delete book entries (full CRUD)
- Persistent storage with PostgreSQL
- Book covers fetched dynamically from the Open Library Covers API using ISBN
- Sort your collection by rating, recency, or title
- Star rating display (supports half-star ratings)
- A bullet-point note editor on the add/edit forms — press Enter to start a new point
- Notes are displayed on the homepage as quote-style blocks, one per point
- Server-side input validation and error handling
- Clean, styled UI built with EJS templates and custom CSS

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL (via `pg`)
- **Templating:** EJS
- **HTTP client:** Axios (for Open Library API requests)
- **Frontend:** HTML, CSS

## Prerequisites

Make sure you have the following installed before setting up the project:

- [Node.js](https://nodejs.org/en/download/) (v16 or later recommended)
- [PostgreSQL](https://www.postgresql.org/download/)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/gandharvk422/book-notes.git
cd book-notes
```

### 2. Install dependencies

```bash
npm i
```

### 3. Create the database

Open `psql` or pgAdmin and create a new database:

```sql
CREATE DATABASE book_notes;
```

### 4. Create the `books` table

Run the following SQL against your `book_notes` database:

```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50),
    rating NUMERIC(2,1),
    date_read DATE,
    notes TEXT
);
```

### 5. Configure environment variables

Create a `.env` file in the project root with your local PostgreSQL credentials:

```dotenv
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=book_notes
DB_PASSWORD=your_postgres_password
DB_PORT=5432
```

> **Note:** `.env` is included in `.gitignore` and should never be committed — it contains your database credentials.

### 6. Start the server

```bash
node index.js
```

Or, for auto-restarting on file changes during development:

```bash
nodemon index.js
```

### 7. Open the app

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
book-notes/
├── index.js              # Express server, routes, DB queries
├── public/
│   └── css/
│       └── style.css     # App styling
├── views/
│   ├── index.ejs          # Homepage — book grid with sorting
│   ├── new.ejs             # Add a new book form
│   └── edit.ejs             # Edit an existing book form
├── .env                  # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

## How It Works

- The homepage (`/`) queries all books from PostgreSQL and renders them as cards, each showing the cover, title, author, star rating, date read, and notes.
- Adding a book (`/books/new` → `POST /books`) inserts a new row into the `books` table.
- Editing a book (`/books/:id/edit` → `POST /books/:id/edit`) updates the corresponding row.
- Deleting a book (`POST /books/:id/delete`) removes the row.
- Notes are written in a `contenteditable` bullet-point editor on the add/edit forms — each point becomes its own list item, and pressing Enter starts a new one. Behind the scenes, the points are joined with newline characters (`\n`) and stored as a single text value in the `notes` column.
- On the homepage, notes are split back out by newline and rendered as individual quote-style blocks rather than a single paragraph.
- Book covers are loaded directly from `https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg` using each book's ISBN.
- A dedicated endpoint, `GET /api/cover/:isbn`, uses Axios to verify whether a cover exists for a given ISBN on Open Library, returning `{ exists, url }` as JSON.
- Sorting is handled via a query parameter: `/?sort=rating`, `/?sort=recency`, or `/?sort=title`.

## Notes

- Make sure the `isbn` stored for each book is a real ISBN (10 or 13 digits) — Open Library's cover lookup is keyed on valid ISBNs, not internal cover IDs.
- Rating accepts half-star values (e.g. 3.5, 4.5) since the database column is `NUMERIC(2,1)`.
