
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBUUBAc-M6WA3Do_0NeSOY_lUzJk93vNfQ",
  authDomain: "ignewsoriginal.firebaseapp.com",
  projectId: "ignewsoriginal",
  storageBucket: "ignewsoriginal.appspot.com",
  messagingSenderId: "671324067337",
  appId: "1:671324067337:web:3099864ad0a4db2ae04ad8",
  measurementId: "G-0JDYFHQEL8"
};


export const app = initializeApp(firebaseConfig);

export const store = getFirestore(app)