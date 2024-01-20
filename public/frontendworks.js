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

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    loginButton?.addEventListener('click', googleLogin);
    let botName;
    let assistantInstructions;
    const card = document.querySelector('.card');
    let lastButtonClicked = null;
    const coachButton = document.getElementById('coachingButton');
    const infoButton = document.getElementById('questionButton');
    const scenarioButton = document.getElementById('practiceButton');
    const audio = document.getElementById('buttonSound');
    [coachButton, infoButton, scenarioButton].forEach(button => {
        button.addEventListener('click', function() {
            audio.play();
            const selectedValue = this.getAttribute('data-value');
            console.log('Button clicked:', this.id); // Debugging log
    
            // Flip the card to the front if it is showing the back
            if (!card.classList.contains('flipped')) {
                card.classList.add('flipped');
            }
    
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
        });
        document.getElementById('ask-button').addEventListener('click', async () => {
            if (!lastButtonClicked) {
                console.log('No button was clicked');
                return;
            }
        
            const selectedValue = lastButtonClicked.getAttribute('data-value');
            let userInput1 = document.getElementById('query-input').value.trim();
        
            if (userInput1) {
                try {
                    const assistantId = (selectedValue === '1' || selectedValue === '2') ? 'asst_dEtG6a0ffQ8XS64tcHTXjUxr' : 'asst_1hFKjYV5WjzaoVPIsCwfuPMK';
                    await handleQuery(userInput1, assistantId, selectedValue);
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });
        
        document.getElementById('query-input').addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                document.getElementById('ask-button').click();
            }
        });

//ui logic


        // API Logic
        document.getElementById('response-box').innerHTML =  document.getElementById('response-box').innerHTML;
        document.getElementById('query-input').value = '';

});

async function handleQuery(finalInput, assistantId, ) {
    try {
        const responseBox = document.getElementById('response-box');
        const userQuery = userInput1 ? `You: ${userInput1}<br><div class="separator"></div>` : '';
        responseBox.innerHTML += userQuery + `<span class="processing"><i id="processing">processing...</i></span><br>`;

        const response = await fetch('https://niles-nli-coachbot-39e5da7274f2.herokuapp.com/handle-query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: finalInput, assistantId: assistantId })
        });

        console.log(response); // Log the response before parsing it as JSON

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse the response data as JSON
        console.log(data); // Log the data before filtering it

        // Filter out the assistant's messages
        const assistantMessages = data.filter(message => message.role === 'assistant');
        console.log(assistantMessages); // Process and display the messages from OpenAI

        // Process and display the messages from OpenAI
        const messages = assistantMessages.map(message => {
            // Split the text into lines based on periods, question marks, exclamation marks, colons, and dashes
            const lines = message.content && message.content[0].text.value 
            ? message.content[0].text.value.split(/(?<!\d)[\.?!:]\s+(?![A-Z]\b)|(?<=\s)-\s/)
            : [];
            // Join the lines with line breaks to format the text
            const formattedText = lines.join('<br>');
            return `NILES: ${formattedText}<br><div class="separator"></div>`;
        }).join('');
        console.log(messages)    

        // Remove the "processing..." message
        document.getElementById('processing').remove();

        // Add the messages to the response box
        responseBox.innerHTML += messages;
    } catch (error) {
        console.error('Error:', error);
    }
}
});