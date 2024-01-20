const express = require('express');
const OpenAI = require('openai');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(morgan('dev')); // Add this line
app.use(cors()); 


const openai = new OpenAI(process.env.OPENAI_API_KEY);

app.post('/process-query', async (req, res) => {
    const { query, assistantId } = req.body;
    try {
        // Assuming 'processQuery' involves creating a thread and getting a response
        const thread = await openai.beta.threads.create();
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: query
        });
        const run = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistantId });
        // Additional logic to handle the run status and get the response
        // ...
        res.json({ message: 'Response from the assistant' });
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ error: 'Error processing query' });
    }
});

app.post('/create-thread', async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ error: "Content field is required" });
    }
    try {
        const thread = await openai.beta.threads.create();
        // Add logic to store thread ID if necessary
        res.json({ threadId: thread.id });
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).send('Error creating thread');
    }
});

app.post('/add-message', async (req, res) => {
    const { threadId, inputValue } = req.body;
    try {
        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: inputValue
        });
        res.json({ message: 'Message added successfully' });
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).send('Error adding message');
    }
});

app.post('/startrun', async (req, res) => {
    const { threadId, assistantId } = req.body;
    try {
        const run = await openai.beta.threads.runs.create(threadId, { assistant_id: assistantId });
        res.json({ runId: run.id });
    } catch (error) {
        console.error('Error starting assistant run:', error);
        res.status(500).send('Error starting assistant run');
    }
});

app.get('/runstatus/:threadId/:runId', async (req, res) => {
    const { threadId, runId } = req.params;
    try {
        const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
        res.json({ status: runStatus.status });
    } catch (error) {
        console.error('Error getting run status:', error);
        res.status(500).send('Error getting run status');
    }
});

app.get('/displayresponses/:threadId', async (req, res) => {
    const { threadId } = req.params;
    try {
        const messages = await openai.beta.threads.messages.list(threadId);
        res.json(messages);
    } catch (error) {
        console.error('Error displaying responses:', error);
        res.status(500).send('Error displaying responses');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});