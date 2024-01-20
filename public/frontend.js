// Firebase Configuration and Initialization
const firebaseConfig = {
    apiKey: "AIzaSyAynmQqe48qCKh5HhyCQ96hnUA2b-Mz2FU",
    authDomain: "niles-8df14.firebaseapp.com",
    projectId: "niles-8df14",
    storageBucket: "niles-8df14.appspot.com",
    messagingSenderId: "728013158555",
    appId: "1:728013158555:web:ac787693ac988a87d76e3e",
};
const app = firebase.initializeApp(firebaseConfig);
const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', googleLogin);
    }
// Google Login Functionality
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ hd: "neuroleadership.com" });
    firebase.auth().signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            document.getElementById('loginStatus').textContent = user && user.email.endsWith("@neuroleadership.com") 
                ? `Welcome, ${user.displayName}` 
                : "Access restricted to neuroleadership.com domain.";
            toggleContentVisibility(user);
            if (user && !user.email.endsWith("@neuroleadership.com")) {
                firebase.auth().signOut();
            } else {
                // User is logged in, update their information in the database
                fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: user.uid,
                        displayName: user.displayName,
                        userEmail: user.email
                    })
                });
            }
        })
        .catch(error => {
            console.error('Login Error:', error);
            document.getElementById('loginStatus').textContent = "Error during login: " + error.message;
        });
}

function toggleContentVisibility(user) {
    const publicContent = document.getElementById('publicContent');
    const privateContent = document.getElementById('privateContent');
    publicContent.style.display = user && user.email.endsWith("@neuroleadership.com") ? 'none' : 'block';
    privateContent.style.display = user && user.email.endsWith("@neuroleadership.com") ? 'block' : 'none';
}



firebase.auth().onAuthStateChanged(user => toggleContentVisibility(user));
let uid, displayName, email;
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      uid = user.uid;
      displayName = user.displayName;
      email = user.email;
      // ...
    } else {
      // No user is signed in.
      // ...
    }
  });

document.addEventListener('DOMContentLoaded', () => {
// Assign unique IDs to each button

const inputField = document.getElementById('query-input');
const askButton = document.getElementById('ask-button');


if (askButton) {
    askButton.addEventListener('click', function() {
        const userInput = inputField.value;
        console.log('User Input:', userInput); // Log the user input
        handleQuery(userInput); // Call handleQuery with userInput
    });
} else {
    console.error('ask-button not found');
}

inputField.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission on enter key
        askButton.click(); // Trigger the Ask button click
    }
});
});
// Add click event listeners to each button
let botName;
let assistantInstructions;
const card = document.querySelector('.card');
let lastButtonClicked = null;
const coachButton = document.getElementById('coachingButton');
const infoButton = document.getElementById('questionButton');
const scenarioButton = document.getElementById('practiceButton');

async function handleQuery(userInput) {
    console.log(lastButtonClicked);
    if (!botName || !assistantInstructions || !fileIds) {
        console.error('Error: botName, assistantInstructions, and fileIds must be defined before calling handleQuery');
        return;
    }

    const responseBox = document.getElementById('response-box');
    const userQuery = userInput ? `You: ${userInput}<br><div class="separator"></div>` : '';
    document.getElementById('processing').style.display = 'block';
    document.getElementById('query-input').value = '';

    responseBox.insertAdjacentHTML('afterbegin', `<div class="user-query">You: ${userInput}</div><div class="separator"></div>`);

    if (!userInput || !botName || !assistantInstructions || !firebase.auth().currentUser || !fileIds.length) {
        console.error('Missing required fields');
        return;
    }
    try {
        console.log("Sending request with body:", JSON.stringify({
            message: userInput,
            assistantId: botName,
            assistantInstructions: assistantInstructions,
            fileIds: fileIds,
        }));


[coachButton, infoButton, scenarioButton].forEach(button => {
    button.addEventListener('click', function() {
        console.log('Button clicked:', this.id); // Debugging log

        // Flip the card to the front if it is showing the back
        if (!card.classList.contains('flipped')) {
            card.classList.add('flipped');
        }
    }),

        // If a different button is clicked, reset the card
        if (lastButtonClicked && lastButtonClicked !== this) {
            card.classList.remove('flipped');
            setTimeout(() => card.classList.add('flipped'), 800); // delay should match the CSS transition time
        }

        // Update the active button styling
        if (lastButtonClicked) {
            lastButtonClicked.classList.remove('active');
        }
        this.classList.add('active');
        lastButtonClicked = this;

        switch(this.id) {
            case 'coachingButton':
                botName = 'coachbot';
                assistantInstructions = 'coachbot.txt';
                break;
            case 'questionButton':
                botName = 'infobot';
                assistantInstructions = 'infobot.txt';
                break;
            case 'practiceButton':
                botName = 'scenariobot';
                assistantInstructions = 'scenariobot.txt';
                break;
            default:
                console.log('Invalid bot');
                return; // Exit the function if the intent is invalid
        }
const fileIds = ['file-sZ5Ia3ePaATq7CqbpzMDZwsL','file-ERVmhxquGOsqTJtUapQcahcb','file-fw32ED0uvdHP7GgIxRJ8ls46','file-BbGxkbeFa9pyW8OgmH9mDO43','file-t5unX2xHB67eTqtvmeFbZe28','file-1IFnTPcG2dQpW4qmjHDZgMkk','file-QKB8UH6rOm4td7KDhZwifVaD','file-8OaxLinFsLyEqGUywALAlOAP','file-PFDryUNSdtqOIcjFIlHq30Lp','file-19G2AQ7tkPGpCpQg5rVDzIZg','file-PYEuzGMjnylHMmtKA0kZPnH4','file-J4eKdSH3Gvbw2y0m6ZbUrVxe','file-29HcVyG0VGnCqP5S3ZP871OD'];
        fetch('http://localhost:3000/start-conversation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    assistantInstructions: assistantInstructions,
    fileIds: fileIds,
    assistantId: botName
  })
}).then(response => response.json())
  .then(data => {
    const assistantId = data.assistantId;
    // Start polling the /assistant-ready endpoint here
    const intervalId = setInterval(() => {
        fetch('/assistant-ready')
            .then(response => response.json())
            .then(data => {
                if (data.ready) {
                    clearInterval(intervalId);
                    // Make the request to /handle-query here
                }
            });
    }, 2000);
  });
                
  
  fetchQuery().then(() => {
    console.log('Query fetched successfully');
}).catch((error) => {
    console.error('Error fetching query:', error);
});
async function executeFetch() {
    const response = await fetch('http://localhost:3000/handle-query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: userInput,
            assistantId: botName,
            assistantInstructions: assistantInstructions,
            fileIds: fileIds,
        })
    });

    // handle response here...
}

executeFetch().catch(error => console.error('Error:', error));
    });
    // handle response here
    async function checkResponse(response) {
        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Error response from server:", errorResponse);
            const message = `An error has occurred: ${response.status} - ${errorResponse.error}`;
            responseBox.insertAdjacentHTML('afterbegin', `<div class="error-message">Error: ${message}</div><div class="separator"></div>`);
            throw new Error(message);
        }
        // handle successful response...
    }
    async function processResponse(response) {
        const message = await response.json(); // Parse the JSON response from the server
        console.log(message.content);
        const formattedText = message.content && message.content[0].text && message.content[0].text.value
            ? message.content[0].text.value : '';
        responseBox.insertAdjacentHTML('afterbegin', `<div class="niles-response">NILES: ${formattedText}</div><div class="separator"></div>`);
    
        // Removing the processing message
        let processingElement = document.getElementById('processing');
        if (processingElement) {
            processingElement.remove();
        }
    }
    
    // Call the function with the response
    processResponse(response).catch(error => console.error('Error:', error));
}
