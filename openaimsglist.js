const axios = require('axios');

async function getThreadMessages(threadId) {
  const response = await axios.get(`https://api.openai.com/v1/beta/threads/${threadId}/messages`, {
    headers: {
      'Authorization': `Bearer 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`
    }
  });

  console.log('Messages in thread:', response.data);
}

getThreadMessages('thread_vFAmx08v3vrSmFYkTJ2FivkP');