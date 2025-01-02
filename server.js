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

app.get('/stock.json', (req, res) => {
    fs.readFile(path.join(__dirname, 'stock.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        res.json(JSON.parse(data));
    });
});

// Route to update user data
app.post('/updateUserData', (req, res) => {
    const updatedUserData = req.body;

    // Read the current stock data from the JSON file
    fs.readFile(path.join(__dirname, 'stock.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        const stockData = JSON.parse(data);
        const userIndex = stockData.findIndex(user => user.userIPN === updatedUserData.userIPN);

        if (userIndex !== -1) {
            // Update the existing user data
            stockData[userIndex] = updatedUserData;

            // Write the updated data back to the file
            fs.writeFile(path.join(__dirname, 'stock.json'), JSON.stringify(stockData, null, 2), 'utf8', (err) => {
                if (err) {
                    return res.status(500).send('Error writing file');
                }
                res.json({ message: 'User data updated successfully' });
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
