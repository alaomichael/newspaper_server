require('dotenv').config();
const express = require('express');
const pool = require('./db');
const app = express();
const port = process.env.PORT || 3000;

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
    const id = req.params.id; // Treat the ID as a string
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
    const id = req.params.id;
    const { title, content, author } = req.body;

    try {
        // Check if any field is provided
        if (title === undefined && content === undefined && author === undefined) {
            return res.status(400).send('At least one field (title, content, author) is required to update');
        }

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        if (title !== undefined) {
            updateFields.push(`title = $${paramIndex++}`);
            values.push(title);
        }

        if (content !== undefined) {
            updateFields.push(`content = $${paramIndex++}`);
            values.push(content);
        }

        if (author !== undefined) {
            updateFields.push(`author = $${paramIndex++}`);
            values.push(author);
        }

        // Add updated_at
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

        // Construct the final query
        const updateQuery = `
            UPDATE articles 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramIndex} 
            RETURNING *
        `;

        // Execute the query with values
        const result = await pool.query(updateQuery, [...values, id]);

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
    const id = req.params.id;
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
