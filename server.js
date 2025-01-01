const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer'); // Import multer
const { Octokit } = require('@octokit/rest'); // Import Octokit for GitHub API

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Set up multer for file upload
const upload = multer({
    dest: './contact_attachments/', // Folder where the files will be stored temporarily
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

// GitHub authentication and setup
const octokit = new Octokit({ auth: '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' }); // Replace with your personal access token
const owner = 'AzuryCyril'; // Replace with your GitHub username
const repo = 'RenaultSupport'; // Your repository name

// Path to the JSON file
const jsonFilePath = path.join(__dirname, 'contact.json');

// Function to upload file to GitHub
async function uploadFileToGitHub(filePath) {
    const fileContent = fs.readFileSync(filePath, { encoding: 'base64' });
    const fileName = path.basename(filePath);

    try {
        const response = await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: `contact_attachments/${fileName}`, // Path where the file will be stored in the repo
            message: `Add ${fileName}`,
            content: fileContent,
            committer: {
                name: 'Cyril', // Change this to your name
                email: 'cyrilpasseleur@gmail.com' // Change this to your email
            }
        });
        console.log('File uploaded to GitHub:', response.data.content.download_url);
        return response.data.content.download_url; // Return the file URL on GitHub
    } catch (error) {
        console.error('Error uploading file to GitHub:', error);
        throw error;
    }
}

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
app.post('/upload', upload.single('attachment'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(__dirname, 'contact_attachments', req.file.filename);

    try {
        // Upload the file to GitHub
        const fileUrl = await uploadFileToGitHub(filePath);

        // Send the file URL back to the client
        res.json({ filePath: fileUrl });
    } catch (error) {
        res.status(500).send('Error uploading file to GitHub.');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
