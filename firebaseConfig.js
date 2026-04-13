import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// 1. Import thêm dịch vụ Realtime Database
import { getDatabase } from "firebase/database";
// Import Firestore
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCv0ikSGpGfhpvYwxuEbNnm2yzVjIEgfNk",
  authDomain: "chuong5-25fd5.firebaseapp.com",
  databaseURL: "https://chuong5-25fd5-default-rtdb.firebaseio.com/",
  projectId: "chuong5-25fd5",
  storageBucket: "chuong5-25fd5.firebasestorage.app",
  messagingSenderId: "359948541552",
  appId: "1:359948541552:web:282fc4bf9a479005d3deb5",
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// 2. Khởi tạo dịch vụ Auth
export const auth = getAuth(app);

// 3. Khởi tạo Firestore
export const firestore = getFirestore(app);

// 4. Khởi tạo và export Realtime Database để sử dụng trong app/home.tsx
export const db = getDatabase(app);