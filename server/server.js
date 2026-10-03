require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'student_app_secret_key_2026';

// Middleware
app.use(cors());
// Increased payload limit to accommodate Base64 image uploads from camera
// Add or update these lines in your backend server.js
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize SQLite Database
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create tables and seed default user
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            course TEXT,
            year_level TEXT,
            about_me TEXT,
            skills TEXT,
            profile_picture TEXT
        )
    `, async (err) => {
        if (err) {
            console.error('Table creation error:', err.message);
            return;
        }

        // Check if default user exists, if not, seed it
        db.get('SELECT * FROM students WHERE student_id = ?', ['2026-0001'], async (err, row) => {
            if (err) return console.error(err.message);
            if (!row) {
                const hashedPassword = await bcrypt.hash('password123', 10);
                db.run(
                    `INSERT INTO students (student_id, password_hash, full_name, course, year_level, about_me, skills, profile_picture)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        '2026-0001',
                        hashedPassword,
                        'Dwayne Delos Santos',
                        'BS Information Technology',
                        '3rd Year',
                        'IT student passionate about web and mobile app development.',
                        'JavaScript, Node.js, Express, SQLite, Cordova',
                        ''
                    ],
                    (err) => {
                        if (err) console.error('Error seeding default user:', err.message);
                        else console.log('Default user created (ID: 2026-0001 / Pass: password123)');
                    }
                );
            }
        });
    });
});

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
}

// --- API ENDPOINTS ---

// 1. User Login
app.post('/api/login', (req, res) => {
    const { student_id, password } = req.body;

    if (!student_id || !password) {
        return res.status(400).json({ success: false, message: 'Student ID and password are required.' });
    }

    db.get('SELECT * FROM students WHERE student_id = ?', [student_id], async (err, student) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        if (!student) {
            return res.status(401).json({ success: false, message: 'Invalid Student ID or password.' });
        }

        const validPassword = await bcrypt.compare(password, student.password_hash);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Invalid Student ID or password.' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: student.id, student_id: student.student_id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful.',
            token,
            student: {
                student_id: student.student_id,
                full_name: student.full_name,
                course: student.course,
                year_level: student.year_level,
                about_me: student.about_me,
                skills: student.skills,
                profile_picture: student.profile_picture
            }
        });
    });
});

// 2. Fetch Profile (Protected)
app.get('/api/profile', authenticateToken, (req, res) => {
    db.get('SELECT student_id, full_name, course, year_level, about_me, skills, profile_picture FROM students WHERE id = ?', [req.user.id], (err, student) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        res.json({ success: true, student });
    });
});

// 3. Update Profile (Protected)
app.put('/api/profile', authenticateToken, (req, res) => {
    const { full_name, course, year_level, about_me, skills, profile_picture } = req.body;

    db.run(
        `UPDATE students 
         SET full_name = ?, course = ?, year_level = ?, about_me = ?, skills = ?, profile_picture = COALESCE(?, profile_picture)
         WHERE id = ?`,
        [full_name, course, year_level, about_me, skills, profile_picture, req.user.id],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to update profile.' });
            }
            res.json({ success: true, message: 'Profile updated successfully.' });
        }
    );
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});