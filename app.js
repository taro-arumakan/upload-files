const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Set up storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Preserve the original file name
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 } // limit file size to 10MB
}).single('myFile');

// Public folder
app.use(express.static('./public'));

// Home route
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

// File upload route
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.send(`Error: ${err}`);
        } else {
            if (req.file == undefined) {
                res.send('Error: No File Selected!');
            } else {
                res.send(`File Uploaded: ${req.file.filename}`);
            }
        }
    });
});

// Route to manage uploaded files
app.get('/files', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan files');
        }

        let fileLinks = files.map(file => {
            return `
                <li>
                    <a href="/uploads/${file}" download="${file}">${file}</a> 
                    - <a href="/delete/${file}">Delete</a>
                </li>`;
        }).join('');

        res.send(`
            <h2>Uploaded Files</h2>
            <ul>
                ${fileLinks}
            </ul>
            <a href="/">Go Back to Upload Page</a>
        `);
    });
});

// Serve files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to delete a file
app.get('/delete/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).send('Unable to delete file');
        }

        res.redirect('/files');
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
