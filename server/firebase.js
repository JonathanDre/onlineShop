const { initializeApp, cert } = require ('firebase-admin/app');
const { getFirestore}= require('firebase-admin/firestore');
const  { getStorage } = require("firebase-admin/storage");

const serviceAccount = require("./key.json")

const app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'online-registry.appspot.com/'
})

const db = getFirestore(app)
const storage = getStorage();
module.exports = {db, storage}


