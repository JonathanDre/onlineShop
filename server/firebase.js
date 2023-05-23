const { initializeApp, applicationDefault, cert } = require ('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue }= require('firebase-admin/firestore');


const serviceAccount = require("./online-registry-firebase-adminsdk-x5shw-8bd22c117a.json")

initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()

module.exports = {db}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
*/
