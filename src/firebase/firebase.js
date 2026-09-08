import { initializeApp } from 'firebase/app';
import { getFirestore} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAKGgYSCq6QRgYD8RX_DnIB3HDFTeohkSg",
  authDomain: "awsnfs-nuxt.firebaseapp.com",
  projectId: "awsnfs-nuxt",
  storageBucket: "awsnfs-nuxt.appspot.com",
  messagingSenderId: "599471083495",
  appId: "1:599471083495:web:0a56dd48e1b473b852f742"
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp)

export { firebaseApp, firestore, storage, auth };
