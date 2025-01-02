const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());  // Add this line to parse incoming JSON data

// Path to the JSON file
const jsonFilePath = path.join(__dirname, 'contactList.json');

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

// Route to update data in the JSON file
app.post('/update', (req, res) => {
    const updatedData = req.body;

    // Check if the data is valid
    if (!updatedData) {
        return res.status(400).send('No data provided or invalid data format');
    }

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

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
