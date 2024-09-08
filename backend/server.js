const express = require('express');
const cors = require('cors');
// const fetch = require('node-fetch'); // Add this to enable fetch in Node.js
const app = express();
const router = express.Router();
const port = 8000;

app.use(cors()); // Enable CORS

// Your API function
const api = async (req, res) => {
    try {
        const response = await fetch('https://cdn.drcode.ai/interview-materials/products.json');
        const data = await response.json(); // Parse the response to JSON
        
        // console.log(data); // Log the fetched data
        res.status(200).json(data); // Send data as JSON response to the client
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong!' }); // Handle the error
    }
};

// Use the router for the '/product' endpoint
router.get('/product', api);

// Mount the router to the app
app.use('/api', router); // Mounts the router to '/api' path

// Optionally, this endpoint can remain if needed
app.get('/your-api-endpoint', (req, res) => {
    res.json({ message: 'CORS enabled!' });
});

// Start the server
app.listen(port, (err) => {
    if (err) {
        console.log("Issue", err);
    }
    console.log(`Server running on port ${port}`);
});
