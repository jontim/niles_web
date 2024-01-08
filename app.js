require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
app.use(cors()); // This enables CORS
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const axios = require('axios');

app.post('/handle-query', async (req, res) => {
    const { message, assistantId } = req.body; // Extract message and assistantId from the request body
    console.log('Received user input:', message); // Log the user input
    if (!message) {
        return res.status(400).json({ error: "User input is required" });
    }

    try {
        const thread = await openai.beta.threads.create();
        console.log('Created thread:', thread); // Log the created thread
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: message
        });

        // Use the assistantId passed from the frontend
        const assistant = await openai.beta.assistants.retrieve(assistantId);
        console.log('Retrieved assistant:', assistant); // Log the retrieved assistant
        const run = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistant.id });
        console.log('Created run:', run); // Log the created run

        // Polling for run completion and fetching messages
        let attempts = 0;
        const maxAttempts = 50;
        let completed = false;
        let messagesData = [];

        while (!completed && attempts < maxAttempts) {
            const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            console.log('Run status:', runStatus); // Log the run status
        
            if (runStatus.status === 'completed') {
                completed = true;
                const messages = await openai.beta.threads.messages.list(thread.id);
                messagesData = messages.data; // Store the messages data
                console.log('Run status:', runStatus); // Log the run status
            } else {
                // Wait for 1 second before the next polling attempt
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            attempts++;
        }
        console.log('Messages Data:', messagesData); // Log the messages data
       // Send the messages data back to the client
        res.json(messagesData);
    } catch (error) {
        console.error('Error:', error);
        // Send the error back to the client
        res.status(500).json({ error: error.toString() });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack trace
    next(err); // Pass the error to the next middleware
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});