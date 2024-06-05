const { initializeApp } = require('firebase/app');
const { getAuth: getClientAuth, signInWithEmailAndPassword, onIdTokenChanged } = require('firebase/auth');
const fs = require('fs');


const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBd8xSzguX3_p8aUC0Hg7nqsr6Rh6t2-SM",
  authDomain: "tpredesauth.firebaseapp.com",
  projectId: "tpredesauth",
  storageBucket: "tpredesauth.appspot.com",
  messagingSenderId: "125701032534",
  appId: "1:125701032534:web:c3b01aca1e503628a709f7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const clientAuth = getClientAuth(app);

const writeTokenToFile = (token, fileName) => {
  fs.writeFileSync(fileName, token, 'utf8');
};

const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
  
    const user = userCredential.user;
    
    const idToken = await user.getIdToken();

    console.log("Credentials obtained")

    writeTokenToFile(idToken, './idToken.txt');

    // Listen for token changes to keep the file updated
    onIdTokenChanged(clientAuth, async (user) => {
      if (user) {
        const newIdToken = await user.getIdToken();
        console.log('Token refreshed');
        writeTokenToFile(newIdToken, './idToken.txt');
      }
    });

    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Example usage
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

console.log('Email:', email);
console.log('Password:', password);

signInUser(email, password).then(async user => {
  console.log('ID Token obtained:');

  let currentToken = await user.getIdToken();
  while (1){
    const newToken = await user.getIdToken();

    if (currentToken != newToken){
      currentToken = newToken;
      console.log("Token has been refreshed");
      writeTokenToFile("./idToken.txt",currentToken);
    }
    
    await sleep(10 * 1000)
    
  }

}).catch(error => {
  console.error('Error:', error);
});
