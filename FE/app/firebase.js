// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'; // Pastikan ini diimpor


const firebaseConfig = {
  apiKey: "AIzaSyA0Dp3E0VxlUOJnKv-yzgLShV0JkBEEWZA",
  authDomain: "inovtek2024.firebaseapp.com",
  projectId: "inovtek2024",
  storageBucket: "inovtek2024.firebasestorage.app",
  messagingSenderId: "176122098542",
  appId: "1:176122098542:web:62bb5304ec220c4d3cc77f",
  measurementId: "G-FB44H1LK04"
};

// Inisialisasi aplikasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firestore
const firestore = getFirestore(app);

export { firestore };
