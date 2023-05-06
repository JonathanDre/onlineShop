const { initializeApp, applicationDefault, cert } = require ('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue }= require('firebase-admin/firestore');


const serviceAccount = require("./online-registry-firebase-adminsdk-x5shw-8bd22c117a.json")

initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()

module.exports = {db}


/*import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACpaOPnWR4d_ECO27BxkxIs09LArJmHVM",
  authDomain: "online-registry.firebaseapp.com",
  projectId: "online-registry",
  storageBucket: "online-registry.appspot.com",
  messagingSenderId: "421020583569",
  appId: "1:421020583569:web:fcd03524e4871c35676130"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
*/