
// Import necessary modules
const axios = require('axios');
const { OPENAI_API_KEY } = require('./config');

// OpenAI API configuration
const apiBaseUrl = 'https://api.openai.com/v1';
const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
};

// Function to create an assistant
async function createAssistant(model, tools, instructions) {
    try {
        const response = await axios.post(`${apiBaseUrl}/assistants`, {
            model: model,
            tools: tools,
            instructions: instructions
        }, { headers: headers });
        return response.data;
    } catch (error) {
        console.error('Error creating assistant:', error);
        return null;
    }
}

// Function to create a thread
async function createThread(assistantId) {
    try {
        const response = await axios.post(`${apiBaseUrl}/assistants/${assistantId}/threads`, {}, { headers: headers });
        return response.data;
    } catch (error) {
        console.error('Error creating thread:', error);
        return null;
    }
}

// Function to send a message to a thread
async function sendMessage(assistantId, threadId, message) {
    try {
        const response = await axios.post(`${apiBaseUrl}/assistants/${assistantId}/threads/${threadId}/messages`, {
            message: message
        }, { headers: headers });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        return null;
    }
}

// Function for polling run status
async function pollRunStatus(assistantId, runId) {
    try {
        let runStatus = null;
        do {
            const response = await axios.get(`${apiBaseUrl}/assistants/${assistantId}/runs/${runId}`, { headers: headers });
            runStatus = response.data.status;
            if (runStatus === 'pending') {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before polling again
            }
        } while (runStatus === 'pending');
        return runStatus;
    } catch (error) {
        console.error('Error polling run status:', error);
        return null;
    }
}

module.exports = {
    createAssistant,
    createThread,
    sendMessage,
    pollRunStatus
};
