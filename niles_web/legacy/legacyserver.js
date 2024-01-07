const express = require('express');
const { Configuration, OpenAIApi } = require("openai");
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

const allowedOrigins = ['http://127.0.0.1:5500'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
};
app.use(cors(corsOptions));

// Initialize OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Proxy endpoint for creating threads
app.post('/create-thread', async (req, res) => {
    try {
        console.log('Request received for creating a thread');
        const response = await openai.createChatCompletion(req.body.model, {
            messages: req.body.messages || []
        });
        console.log('Thread created:', response.data);
        res.send(response.data);
    } catch (error) {
        console.error('Error in /create-thread:', error);
        res.status(500).send('An error occurred');
    }
});

// Endpoint for adding a message to a thread
app.post('/add-message', async (req, res) => {
    try {
        console.log('Request received for adding a message:', req.body);
        const response = await openai.createChatCompletion(req.body.model, {
            messages: req.body.messages || []
        });
        console.log('Message added:', response.data);
        res.send(response.data);
    } catch (error) {
        console.error('Error in /add-message:', error);
        res.status(500).send('An error occurred');
    }
});
// Start Assistant Run
app.post('/start-assistant-run', async (req, res) => {
    try {
        console.log('Request received for starting an assistant run:', req.body);
        // Assuming you're sending a message to be processed by the assistant
        const response = await openai.createChatCompletion(req.body.model, {
            messages: req.body.messages || []
        });
        console.log('Assistant run started:', response.data);
        res.send(response.data);
    } catch (error) {
        console.error('Error in /start-assistant-run:', error);
        res.status(500).send('An error occurred');
    }
});

// Get Run Status - Assuming this is to fetch the status of a specific message or task
app.get('/runstatus/:threadId/:runId', async (req, res) => {
    const { threadId, runId } = req.params;
    try {
        console.log(`Request received for run status: Thread ID ${threadId}, Run ID ${runId}`);
        // Fetch the specific message/run status here
        // Note: Replace this with the appropriate method to fetch the status if available in OpenAI client library
        const response = await openai.retrieveCompletion(runId);
        console.log('Run status:', response.data);
        res.send(response.data);
    } catch (error) {
        console.error('Error in /runstatus:', error);
        res.status(500).send('An error occurred');
    }
});

// Display Responses - Fetching messages from a thread
app.get('/displayresponses/:threadId', async (req, res) => {
    const { threadId } = req.params;
    try {
        console.log(`Request received for displaying responses in Thread ID ${threadId}`);
        // Fetch messages from the specified thread
        // Note: Implement the method to retrieve messages from a thread if available in OpenAI client library
        // The following is a placeholder and should be replaced with the actual implementation
        const response = await openai.listMessages(threadId);
        console.log('Thread responses:', response.data);
        res.send(response.data);
    } catch (error) {
        console.error('Error in /displayresponses:', error);
        res.status(500).send('An error occurred');
    }
});

app.post('/process-query', async (req, res) => {
    const { query, assistantId } = req.body;

    try {
        const runId = await createRun(assistantId);
        if (runId) {
            await sendMessage(runId, assistantId, query);
            setTimeout(async () => {
                const response = await pollForResponse(runId, assistantId);
                res.send({ response: response });
            }, 5000); // Polling after 5 seconds
        }
    } catch (error) {
        console.error("Error processing query:", error);
        res.status(500).send("Error processing query");
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});