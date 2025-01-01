const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer'); // Import multer

const app = express();
app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Set up multer for file upload
const upload = multer({
    dest: './contact_attachments/', // Folder where the files will be stored
    fileFilter: (req, file, cb) => {
        const fileTypes = /pdf|jpg|jpeg|png|gif|docx/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb("Error: Only PDF, Images, and Word files are allowed!");
        }
    }
});

// Path to the JSON file
const jsonFilePath = path.join(__dirname, 'contact.json');

// Route to fetch data from the JSON file
app.get('/data', (req, res) => {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading the file.');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Route to update data in the JSON files
app.post('/update', (req, res) => {
    const updatedData = req.body;

    // Write the updated data back to the file
    fs.writeFile(jsonFilePath, JSON.stringify(updatedData, null, 4), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error writing to the file.');
        } else {
            res.send('Data updated successfully.');
        }
    });
});

// Route to handle file upload
app.post('/upload', upload.single('attachment'), (req, res) => {
    // Check if the file is uploaded successfully
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Generate file path URL (relative path from server root)
    const filePath = `/contact_attachments/${req.file.filename}`;
    
    // Send the file URL back to the client
    res.json({ filePath });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

