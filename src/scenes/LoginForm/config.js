// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyA6NyFxVF9vz6y7aGc2M7HXKM436H5UQMs",
  authDomain: "shopeasy-webapp.firebaseapp.com",
  projectId: "shopeasy-webapp",
  storageBucket: "shopeasy-webapp.appspot.com",
  messagingSenderId: "582373018375",
  appId: "1:582373018375:web:dac1b8bc7164d4dd0b13a2",
  measurementId: "G-5ZXL3D79V2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
//const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);
const db = getFirestore(app);

export {app,auth,db};
