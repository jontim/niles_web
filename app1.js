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

    const askButton = document.getElementById('ask-button');
    askButton?.addEventListener('click', handleAskButtonClick);
});

// Video Handling Logic
const videos = [
    'MEDIA/Niles joke 2.webm',
    'MEDIA/Niles joke 3.webm',
    'MEDIA/Niles joke 4.webm',
    'MEDIA/Niles joke 5.webm',
    'MEDIA/Niles joke 6.webm'
];
const specificVideo = 'MEDIA/Niles joke 1_1.webm';
let clickCount = 0;

// Handle Ask Button Click
async function handleAskButtonClick() {
    const selectedValue = document.querySelector('input[name="intent"]:checked').value;
    let userInput = document.getElementById('query-input').value.trim();

    if (userInput) {
        // Update to match new API structure
        if (selectedValue === '1' || selectedValue === '2') {
            userInput = selectedValue + ' ' + userInput;
        }

        // Video Logic
        clickCount++;
        const heroVideo = document.getElementById('hero-video');
        heroVideo.src = (clickCount <= 2) ? videos[Math.floor(Math.random() * videos.length)] : specificVideo;
        heroVideo.style.display = 'block';
        heroVideo.play();

        // API Logic
        document.getElementById('response-box').innerHTML = `Your query: ${userInput}<br><i id="processing">processing...</i>`;
        document.getElementById('query-input').value = '';
        try {
            const assistantId = (selectedValue === '1' || selectedValue === '2') ? 'asst_dEtG6a0ffQ8XS64tcHTXjUxr' : 'asst_1hFKjYV5WjzaoVPIsCwfuPMK';
            
            // Create a new thread
            const thread = await createThread();
            const threadId = thread.id;

            // Add the user's message to the thread
            await addMessageToThread(threadId, userInput);

            // Start the assistant run
            const run = await startAssistantRun(threadId, assistantId);
            const runId = run.id;

            // Poll for run completion and display the assistant's responses
            pollForRunCompletion(threadId, runId);
        } catch (error) {
            console.error('Error handling AskButtonClick:', error);
            // Handle error appropriately
        }
    }
}
// API Functions






