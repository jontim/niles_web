const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(cors()); // This enables CORS
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/handle-query', async (req, res) => {
    const { userInput, assistantId } = req.body; // Extract assistantId from the request body
    console.log('Received user input:', userInput); // Log the user input
    if (!userInput) {
        return res.status(400).json({ error: "User input is required" });
    }

    try {
        const thread = await openai.beta.threads.create();
        console.log('Created thread:', thread); // Log the created thread
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: userInput
        });

        const assistant = await openai.beta.assistants.retrieve(assistantId); // Use the received assistantId
        console.log('Retrieved assistant:', assistant); // Log the retrieved assistant
        const run = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistant.id });
        console.log('Created run:', run); // Log the created run

        // Polling for run completion and fetching messages
        let attempts = 0;
        const maxAttempts = 20;
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
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            attempts++;
        }

        // Send the messages data back to the client
        res.json(messagesData);
    } catch (error) {
        console.error('Error:', error);
        // Send the error back to the client
        res.status(500).json({ error: error.toString() });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});