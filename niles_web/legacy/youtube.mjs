import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
    const assistant = await openai.beta.assistants.retrieve("asst_dEtG6a0ffQ8XS64tcHTXjUxr");
    const thread = await openai.beta.threads.create();

    const message = await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: "1 how do I keep my team engaged?"
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id
        // instructions: 
    });
    
    console.log(run);
    
    // Call the function to start checking the status of the run
    checkStatusAndPrintMessages(thread.id, run.id);
} 
let attempts = 0;
const maxAttempts = 20; // Maximum number of attempts to check the status

async function checkStatusAndPrintMessages(threadId, runId) {
    // Check the status of the run
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);

    // If the run is completed, print the messages
    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        for (let message of messages.data) {
            console.log(`${message.role}: ${JSON.stringify(message.content)}`);
        }
    } else if (run.status === 'failed' || attempts >= maxAttempts) {
        console.log('The run failed or did not complete within the maximum number of attempts');
    } else {
        // If the run is not completed, check again after 3 seconds
        attempts++;
        setTimeout(() => {
            checkStatusAndPrintMessages(threadId, runId);
        }, 3000); // wait for 3 seconds
    }
}

main();