const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

// Set up storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

