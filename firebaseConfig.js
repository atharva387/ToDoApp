import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDh3YJAaHCcOr4bp29wcfw-umaOjzFkG6U",
    authDomain: "todoapprn-435d8.firebaseapp.com",
    projectId: "todoapprn-435d8",
    storageBucket: "todoapprn-435d8.appspot.com",
    messagingSenderId: "1021067893301",
    appId: "1:1021067893301:web:231896f745a02500c92f7c",
    measurementId: "G-JP7D4S002B"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
