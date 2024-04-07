import { splitPDF } from './model.js';
import express from 'express';
import multer from 'multer';

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Multer middleware to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Route to handle file uploads
app.post('/upload', upload.single('pdf'), async (req, res) => {
    // Check if file was uploaded successfully
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Split the uploaded PDF file
        const result = await splitPDF(req.file.path, "uploads");
        // Respond with a success message
        res.status(200).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
