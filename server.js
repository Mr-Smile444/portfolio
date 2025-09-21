const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'zaid-portfolio-secret-key-2025',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Serve static files
app.use(express.static(__dirname));

// Function to save user name to file
function saveUserName(name) {
    const timestamp = new Date().toLocaleString();
    const userData = `Name: ${name} | Time: ${timestamp}\n`;
    
    fs.appendFile('user_logins.txt', userData, (err) => {
        if (err) {
            console.error('Error saving user name:', err);
        } else {
            console.log('User name saved:', name);
        }
    });
}

// Authentication middleware
app.use((req, res, next) => {
    // Allow access to login page, authentication, and contact form
    if (req.path === '/login' || req.path === '/authenticate' || req.path === '/contact') {
        return next();
    }
    
    // Allow access to static files
    if (req.path.startsWith('/css/') || req.path.startsWith('/js/') || req.path.startsWith('/img/') || 
        req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.endsWith('.jpg') || 
        req.path.endsWith('.png') || req.path.endsWith('.ico')) {
        return next();
    }
    
    // Check if user is authenticated
    if (req.session && req.session.authenticated) {
        return next();
    }
    
    // Redirect to login if not authenticated
    res.redirect('/login');
});

// Login page
app.get('/login', (req, res) => {
    // If already authenticated, redirect to home
    if (req.session && req.session.authenticated) {
        return res.redirect('/');
    }
    
    const loginPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - Zaid's Portfolio</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Poppins', sans-serif;
            }
            body {
                background: #2C3E50;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .login-container {
                background: #ECF0F1;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 0 30px rgba(0,0,0,0.2);
                width: 90%;
                max-width: 400px;
                text-align: center;
            }
            .logo {
                font-size: 32px;
                font-weight: 700;
                color: #2C3E50;
                margin-bottom: 20px;
            }
            .logo span {
                color: #3498DB;
            }
            .login-container h2 {
                color: #2C3E50;
                margin-bottom: 25px;
                font-size: 24px;
            }
            .form-group {
                margin-bottom: 20px;
                text-align: left;
            }
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #2C3E50;
                font-weight: 500;
            }
            .form-control {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #BDC3C7;
                border-radius: 5px;
                font-size: 16px;
                transition: border-color 0.3s;
            }
            .form-control:focus {
                border-color: #3498DB;
                outline: none;
            }
            .submit-btn {
                background: #3498DB;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 30px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 500;
                transition: all 0.3s;
                width: 100%;
            }
            .submit-btn:hover {
                background: #2980B9;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .error {
                color: #E74C3C;
                margin-top: 15px;
                font-size: 14px;
            }
            .footer {
                margin-top: 25px;
                color: #7F8C8D;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="logo">Z<span>aid</span></div>
            <h2>Enter Your Name to Continue</h2>
            <form action="/authenticate" method="POST">
                <div class="form-group">
                    <label for="name">Your Name</label>
                    <input type="text" class="form-control" id="name" name="name" placeholder="Enter your name" required>
                </div>
                <button type="submit" class="submit-btn">Enter Portfolio</button>
            </form>
            ${req.query.error ? `<div class="error">${req.query.error}</div>` : ''}
            <div class="footer">
                <p>© 2025 Zaid. All Rights Reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.send(loginPage);
});

// Authentication endpoint - UPDATED TO SAVE USER NAME
app.post('/authenticate', (req, res) => {
    const { name } = req.body;
    
    if (name && name.trim() !== '') {
        const userName = name.trim();
        
        // Save the user name to file
        saveUserName(userName);
        
        req.session.authenticated = true;
        req.session.userName = userName;
        res.redirect('/');
    } else {
        res.redirect('/login?error=Please enter your name');
    }
});

// Serve main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Contact form endpoint
app.post('/contact', (req, res) => {
    console.log('Contact form submitted');
    console.log('Request body:', req.body);
    
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
        console.log('Missing required fields');
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }
    
    // Log the submission
    console.log('Contact form submission received:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Subject:', subject);
    console.log('Message:', message);
    
    // Save to a file
    const data = `
    New Contact Form Submission:
    Time: ${new Date().toLocaleString()}
    Name: ${name}
    Email: ${email}
    Subject: ${subject}
    Message: ${message}
    ----------------------------------------
    `;
    
    fs.appendFile('contact_submissions.txt', data, (err) => {
        if (err) {
            console.error('Error saving contact form data:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error saving your message. Please try again.' 
            });
        } else {
            console.log('Contact form data saved to contact_submissions.txt');
            res.json({ 
                success: true, 
                message: 'Message sent successfully! We will contact you soon.' 
            });
        }
    });
});

// Logout endpoint
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access your site at: http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/login`);
    console.log('User names will be saved to user_logins.txt');
});