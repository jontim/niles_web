require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs');
const readline = require('readline');
const session = require('express-session');
const bodyParser = require('body-parser');

// Database pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(cors()); // Enables CORS
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.static(path.join(__dirname, 'public'))); // Serves static files
app.use(bodyParser.json());

// OpenAI API initialization
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in a production environment using HTTPS
}));

// Handle user login
app.post('/login', async (req, res) => {
  console.log('Received request at /login with body:', req.body);
  const { userId, displayName, userEmail } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  const result = await pool.query('INSERT INTO users(user_id, display_name, email) VALUES($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET display_name = $2, email = $3',[userId, displayName, userEmail]);
  console.log('User information updated in database:', result);
  res.json({ success: true, message: "Conversation started successfully" });
});


// Start a conversation
app.post('/start-conversation', async (req, res) => {
  console.log('Received request at /start-conversation with body:', req.body);
  const { botName, assistantInstructions, fileIds } = req.body;  // Renamed variable to botName for clarity
  if (!assistantInstructions || !fileIds || !assistantId) {
    return res.status(400).json({ error: "Assistant instructions, file IDs, and assistant ID are required" });
  }
  const assistantName = path.basename(assistantInstructions, '.txt');
  if (!req.session.assistants) req.session.assistants = {};
  let assistant = req.session.assistants[assistantName];
  if (!assistant) {
    if (Object.keys(req.session.assistants).length >= 3) {
      return res.status(400).json({ error: "Maximum number of assistants reached" });
    }
    const instructions = await readFileContents(assistantInstructions);
    assistant = await openai.beta.assistants.create({
      name: assistantName,
      description: 'A helpful NLI coach, mentor and skill enhancer',
      model: 'gpt-4-1106-preview',
      tools: [{'type': 'retrieval'}],
      file_ids: fileIds,
      instructions: instructions
    });
    console.log(`Assistant created with ID: ${assistant.id}`); // Add this line
    req.session.assistants[assistantName] = assistant;
    // After creating the assistant
    req.session.assistantId = assistant.id;
    
  }
  if (!req.session.thread) {
    req.session.thread = await openai.beta.threads.create();
  }
  res.json({ message: "Conversation started successfully" });
});


// New endpoint to check if the assistant is ready
app.get('/assistant-ready', async (req, res) => {
  const assistantId = req.session.assistantId;
  const assistant = await getAssistantById(assistantId); // Replace with your actual code to get the assistant

  if (assistant) {
    res.json({ ready: true });
  } else {
    res.json({ ready: false });
  }
});
/// Handle user queries
app.post('/handle-query', async (req, res) => {
  console.log('Received request at /handle-query with body:', req.body);
  const { message, botName } = req.body;  // Renamed variable to botName
  if (!message || !assistantId) {
    return res.status(400).json({ error: "Message and assistant ID are required" });
  }

  try {
    if (!req.session.assistants || !req.session.assistants[assistantId]) {
      return res.status(400).json({ error: "Assistant not found or not initialized" });
    }

    let assistant = req.session.assistants[assistantId];
    console.log(`Assistant retrieved with ID: ${assistant.id}`); // Add this line
    if (!req.session.thread) {
      return res.status(400).json({ error: "No active conversation" });
    }

    await openai.beta.threads.messages.create(req.session.thread.id, { role: "user", content: message });
    console.log(`Making API call with assistant ID: ${assistant.id}`);
    const run = await openai.beta.threads.runs.create(req.session.thread.id, { assistant_id: assistant.id });
    await pool.query('INSERT INTO runs(run_id) VALUES($1)', [run.id]);
    await pool.query(
      'INSERT INTO threads(thread_id) VALUES($1) ON CONFLICT (thread_id) DO UPDATE SET thread_id = EXCLUDED.thread_id',
      [req.session.thread.id]
    );
    
    let messagesData = await pollRunCompletion(req.session.thread.id, run.id);
    for (let message of messagesData) {
      await pool.query('INSERT INTO messages(message_id, content, role) VALUES($1, $2, $3)', [message.id, message.content, message.role]);
    }
    res.json(messagesData);
  } catch (error) {
    console.error('Error in /handle-query:', error);
    res.status(500).json({ error: error.message });
  }
});
    
    // Error handling middleware
    app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).send({ error: 'Internal Server Error', details: err.message });
    });
    
    // Serve index.html for all other routes
    app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    });
    
    // Helper function to read file contents
    async function readFileContents(filePath) {
    return new Promise((resolve, reject) => {
    try {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    let content = '';
    rl.on('line', (line) => { content += line + '\n'; });
    rl.on('close', () => { resolve(content.trim()); });
    } catch (error) {
    reject(error);
    }
    });
    }
    
    // Function to poll for run completion
    async function pollRunCompletion(threadId, runId) {
    let attempts = 0;
    const maxAttempts = 50;
    while (attempts < maxAttempts) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (runStatus.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(threadId);
    return messages.data;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
    }
    throw new Error('Run did not complete in the expected time frame');
    }


// Perform necessary database operations here:
// pool.query('INSERT INTO users ...', [...]) // Example of user info insertion
// pool.query('INSERT INTO messages ...', [...]) // Example of message info insertion