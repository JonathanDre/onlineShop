import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getStorage} from "firebase/storage";
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
export const storage = getStorage(app)