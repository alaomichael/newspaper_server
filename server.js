require('dotenv').config();
const express = require('express');
const pool = require('./db');
const app = express();
const port = process.env.PORT// || 3000;

app.use(express.json());

// GET all articles
app.get('/api/articles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET a single article by ID
app.get('/api/articles/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Article not found');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST a new article
app.post('/api/articles', async (req, res) => {
    const { title, content, author } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO articles (title, content, author) VALUES ($1, $2, $3) RETURNING *',
            [title, content, author]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// PUT update an existing article
app.put('/api/articles/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { title, content, author } = req.body;
    try {
        const result = await pool.query(
            'UPDATE articles SET title = $1, content = $2, author = $3 WHERE id = $4 RETURNING *',
            [title, content, author, id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Article not found');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// DELETE an article
app.delete('/api/articles/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const result = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Article not found');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
