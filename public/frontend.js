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


});

// Video Handling Logic
const videos = [
    'MEDIA/Niles joke 2.webm',
    'MEDIA/Niles joke 3.webm',
    'MEDIA/Niles joke 4.webm',
    'MEDIA/Niles joke 5.webm',
    'MEDIA/Niles joke 6.webm',
    'MEDIA/Niles joke 7.webm',
    'MEDIA/Niles joke 8.webm',
    'MEDIA/Niles joke 9.webm',
    'MEDIA/Niles joke 10.webm',
    'MEDIA/Niles joke 11.webm',
    'MEDIA/Niles joke 12.webm',

];
const specificVideo = 'MEDIA/Niles joke 1_1.webm';
let clickCount = 0;



document.getElementById('ask-button').addEventListener('click', async () => {
    const selectedValue = document.querySelector('input[name="intent"]:checked').value;
    let userInput1 = document.getElementById('query-input').value.trim();
    let finalInput = userInput1;
    if (userInput1) {
        // Update to match new API structure
        if (selectedValue === '1' || selectedValue === '2') {
            finalInput = selectedValue + ' ' + userInput1;
        }

        // Video Logic
        clickCount++;
        const heroVideo = document.getElementById('hero-video');
        if (clickCount <= 2) {
            heroVideo.src = videos[Math.floor(Math.random() * videos.length)];
            heroVideo.style.display = 'block';
            heroVideo.play();
        } else if (clickCount === 3) {
            heroVideo.src = specificVideo;
            heroVideo.style.display = 'block';
            heroVideo.play();
        } else {
            heroVideo.style.display = 'none';
        }

        // API Logic
        document.getElementById('response-box').innerHTML =  document.getElementById('response-box').innerHTML;
        document.getElementById('query-input').value = '';

        try {
            const assistantId = (selectedValue === '1' || selectedValue === '2') ? 'asst_dEtG6a0ffQ8XS64tcHTXjUxr' : 'asst_1hFKjYV5WjzaoVPIsCwfuPMK';
            
            await handleQuery(finalInput, assistantId, userInput1);  // Pass userInput1 as the second argument
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

    async function handleQuery(finalInput, assistantId, userInput1) {
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
        }).catch(error => console.error('Fetch Error:', error));
        
        console.log(response); // Log the response before parsing it as JSON
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json(); // Parse the response data as JSON
        console.log(data); // Log the data before filtering it
        
        // Filter out the assistant's messages
        const assistantMessages = data.filter(message => message.role === 'assistant');
        console.log(assistantMessages);       // Process and display the messages from OpenAI
// Process and display th messages from OpenAI
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