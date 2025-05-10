// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzOVYSc1x9pADmXmTwvXhUhOFwCeAFa3A",
  authDomain: "patinhas-unidas-9bd96.firebaseapp.com",
  projectId: "patinhas-unidas-9bd96",
  storageBucket: "patinhas-unidas-9bd96.appspot.com",
  messagingSenderId: "1007242481875",
  appId: "1:1007242481875:web:SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);

export { app };
