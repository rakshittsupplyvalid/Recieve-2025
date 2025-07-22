import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA-Bf8aK7YO-rEKIoD8eZ-26uv4vZjL5HIo",
    authDomain: "myapp.firebaseapp.com",
    projectId: "myapp",
    storageBucket: "myapp.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdefghijklm12345",
    measurementId: "G-XYZ12345"
  };
  

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  export { auth };
