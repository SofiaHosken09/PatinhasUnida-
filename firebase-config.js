// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔧 Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAzOVYSc1x9pADmXmTwvXhUhOFwCeAFa3A",
  authDomain: "patinhas-unidas-9bd96.firebaseapp.com",
  projectId: "patinhas-unidas-9bd96",
  storageBucket: "patinhas-unidas-9bd96.appspot.com",
  messagingSenderId: "1007242481875",
  appId: "1:1007242481875:web:SEU_APP_ID" // substitua pelo appId real completo se ainda não estiver certo
};

// 🚀 Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 📦 Exporta para uso nos outros arquivos
export { app, auth, db };
