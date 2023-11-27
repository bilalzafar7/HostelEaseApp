import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';



const firebaseConfig = {
  apiKey: "AIzaSyCBAF5b-pHfpDbLsOxCA9lKlwEyQYr6iew",
  authDomain: "hostelease-41759.firebaseapp.com",
  projectId: "hostelease-41759",
  storageBucket: "hostelease-41759.appspot.com",
  messagingSenderId: "603853185486",
  appId: "1:603853185486:web:ccf3e8d7ef13efb8bf0b9f"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app); 
const db = getFirestore();

export {auth,db};