import express from "express";
import axios from "axios";
import ejs from "ejs";
import pg from "pg";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/isbn";

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

app.get("/", async (req, res) => {
    const { sort } = req.query;
    let orderBy = "id ASC";

    if (sort === "rating") {
        orderBy = "rating DESC";
    }
    else if (sort === "recency") {
        orderBy = "date_read DESC";
    }
    else if (sort === "title") {
        orderBy = "title ASC";
    }

    try {
        const result = await db.query(`SELECT * FROM books ORDER BY ${orderBy}`);
        res.render("index.ejs", { books: result.rows });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong while loading your books.");
    }
});

app.get("/books/new", (req, res) => {
    try {
        res.render("new.ejs");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong while loading the form.");
    }
});

app.post("/books", async (req, res) => {
    const {title, author, isbn, rating, date_read, notes} = req.body;

    if (!title || !author) {
        return res.status(400).send("Title and author are required.");
    }

    if (rating && (rating < 1 || rating > 5))
    {
        return res.status(400).send("Rating must be between 1 and 5.");
    }

    try {
        await db.query("INSERT INTO books (title, author, isbn, rating, date_read, notes) VALUES ($1, $2, $3, $4, $5, $6)", [title, author, isbn, rating, date_read, notes]);
        res.redirect("/");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong while adding your book.");
    }
});

app.get("/books/:id/edit", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).send("Book not found.");
        }
        res.render("edit.ejs", { book: result.rows[0] });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong while loading this book.");
    }
});

app.post("/books/:id/edit", async (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, rating, date_read, notes } = req.body;

    if (!title || !author) {
        return res.status(400).send("Title and author are required.");
    }

    if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).send("Rating must be between 1 and 5.");
    }

    try {
        await db.query("UPDATE books SET title = $1, author = $2, isbn = $3, rating = $4, date_read = $5, notes = $6 WHERE id = $7", [title, author, isbn, rating, date_read, notes, id]);
        res.redirect("/");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong while updating your book.");
    }
});

app.post("/books/:id/delete", async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.query("DELETE FROM books WHERE id = $1", [id]);
        res.redirect("/");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong while deleting this book.");
    }
});

app.get("/api/cover/:isbn", async (req, res) => {
    const { isbn } = req.params;
    const coverURL = `${API_URL}/${isbn}-M.jpg`;

    try {
        await axios.head(coverURL);
        res.json({ exists: true, url: coverURL });
    }
    catch (err) {
        res.json({ exists: false, url: null });
    }
});

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}/`);
});