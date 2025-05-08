// Evite declarar 2 vezes
const firebaseConfig = {
  apiKey: "AIzaSyAzOVYSc1x9pADmXmTwvXhUhOFwCeAFa3A",
  authDomain: "patinhas-unidas-9bd96.firebaseapp.com",
  projectId: "patinhas-unidas-9bd96",
  storageBucket: "patinhas-unidas-9bd96.appspot.com",
  messagingSenderId: "1007242481875",
  appId: "1:1007242481875:web:SEU_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
