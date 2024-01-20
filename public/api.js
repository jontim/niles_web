   
    const sendQuery = async (query, botName, assistantInstructions, fileIds) => {
        // Assuming /send-query is your endpoint for sending user queries
        const response = await fetch('/send-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, botName, assistantInstructions, fileIds })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return await response.json();  // Parse and return the response from the server
    };
    
    // api.js - User Input Handling and API Calls

const APIModule = (() => {
    // Initialize the variables that will be updated dynamically.
    let botName, assistantInstructions, fileIds;

    // Function to set the bot information.
    const setBotInfo = (name, instructions, ids) => {
        botName = name;
        assistantInstructions = instructions;
        fileIds = ids;
    };

    const init = () => {
        attachQueryInputListener();
        // Any other initialization code can go here if needed.
    };

    const attachQueryInputListener = () => {
        const inputField = document.getElementById('query-input');
        const askButton = document.getElementById('ask-button');

        if (askButton && inputField) {
            askButton.addEventListener('click', () => {
                const userInput = inputField.value.trim();
                if(userInput) {
                    console.log('User Input:', userInput);
                    handleQuery(userInput);
                }
            });

            inputField.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    askButton.click();
                }
            });
        } else {
            console.error('UI elements for asking not found');
        }
    };

    const handleQuery = async (userInput) => {
        const fileIds = ['file-sZ5Ia3ePaATq7CqbpzMDZwsL','file-ERVmhxquGOsqTJtUapQcahcb','file-fw32ED0uvdHP7GgIxRJ8ls46','file-BbGxkbeFa9pyW8OgmH9mDO43','file-t5unX2xHB67eTqtvmeFbZe28','file-1IFnTPcG2dQpW4qmjHDZgMkk','file-QKB8UH6rOm4td7KDhZwifVaD','file-8OaxLinFsLyEqGUywALAlOAP','file-PFDryUNSdtqOIcjFIlHq30Lp','file-19G2AQ7tkPGpCpQg5rVDzIZg','file-PYEuzGMjnylHMmtKA0kZPnH4','file-J4eKdSH3Gvbw2y0m6ZbUrVxe','file-29HcVyG0VGnCqP5S3ZP871OD'];
        // Now check if botName, assistantInstructions, and fileIds are set before proceeding.
        if (!userInput || !botName || !assistantInstructions || !firebase.auth().currentUser || (fileIds && !fileIds.length)) {
            console.error('Missing required fields for handling the query:', {
                userInput,
                botName,
                assistantInstructions,
                fileIds
            });
            return;
        }

        // Proceed with using these variables to make API calls.
        const responseBox = document.getElementById('response-box');
        try {
            // First API Call: Start Conversation
            let response = await fetch('http://localhost:3000/start-conversation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assistantInstructions: assistantInstructions,
                    fileIds: fileIds,
                    assistantId: botName
                })
            });
            
            if (!response.ok) throw new Error('Failed to start conversation.');
        
        
        
        
        responseBox.insertAdjacentHTML('afterbegin', `<div class="user-query">You: ${userInput}</div><div class="separator"></div>`);

        document.getElementById('processing').style.display = 'block';
        document.getElementById('query-input').value = '';
        
        // Here you would make your API calls with these variables.
        // We won't attempt to perform the fetch calls after the init function.
        // The fetch call code would go here, including interaction with '/start-conversation' and '/handle-query'.
    };

    return {
        init,
        handleQuery,
        setBotInfo,
    };
})();

export { APIModule };