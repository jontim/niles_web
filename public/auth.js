// auth.js - Authentication Module
export const AuthModule = {
const AuthModule = (() => {
    const firebaseConfig = { 
        apiKey: "AIzaSyAynmQqe48qCKh5HhyCQ96hnUA2b-Mz2FU",
        authDomain: "niles-8df14.firebaseapp.com",
        projectId: "niles-8df14",
        storageBucket: "niles-8df14.appspot.com",
        messagingSenderId: "728013158555",
        appId: "1:728013158555:web:ac787693ac988a87d76e3e",
    }; 
    let app;
  
    const init = () => {
        app = firebase.initializeApp(firebaseConfig);
        firebase.auth().onAuthStateChanged(user => toggleContentVisibility(user));
        attachSignInListener();
    };
  
    const attachSignInListener = () => {
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            loginButton.addEventListener('click', googleLogin);
        }
    };
  
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
    return {
        init,
        // Expose other public methods if necessary...
    };
})();
}