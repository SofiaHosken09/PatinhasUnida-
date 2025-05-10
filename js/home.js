// home.js
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app, db, auth } from '../firebase-config.js'; // <-- tudo certo aqui


import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const cardsContainer = document.querySelector('.cards-container');

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      userPhoto.src = userData.fotoURL || 'default-profile.png';
      userName.textContent = userData.nome || 'Usuário';

      const petsRef = query(
        collection(db, "animais"),
        where("idDoador", "==", user.uid)
      );
      const querySnapshot = await getDocs(petsRef);

      cardsContainer.innerHTML = '';

      querySnapshot.forEach((docSnap) => {
        const pet = docSnap.data();
        const petId = docSnap.id;

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${pet.foto}" alt="${pet.nome}" />
          <div class="card-info">
            <h3>${pet.nome}</h3>
            <p><strong>Descrição:</strong> ${pet.descricao}</p>
            <p><strong>Idade:</strong> ${pet.idade} anos</p>
            <p><strong>Pelagem:</strong> ${pet.pelagem}</p>
            <p><strong>Cor:</strong> ${pet.cor}</p>
            <p><strong>Telefone:</strong> ${userData.telefone}</p>
            <button class="btn-adotar" data-id="${petId}" ${pet.foiAdotado ? 'disabled' : ''}>
              ${pet.foiAdotado ? 'Já adotado' : 'Confirmar Adoção'}
            </button>
          </div>
        `;
        cardsContainer.appendChild(card);
      });

      document.querySelectorAll('.btn-adotar').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const petId = btn.dataset.id;
          const petRef = doc(db, "animais", petId);
          await updateDoc(petRef, { foiAdotado: true });
          alert("Pet marcado como adotado!");
          btn.textContent = "Já adotado";
          btn.disabled = true;
        });
      });
    }
  } else {
    window.location.href = '../html/login.html';
  }
});
