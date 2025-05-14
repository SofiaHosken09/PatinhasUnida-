import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { app } from '../firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dzfmswqki/image/upload';
const UPLOAD_PRESET = 'patinhas_upload';

// Elementos DOM
const userPhotoEl = document.getElementById('user-photo');
const userNameEl = document.getElementById('user-name');
const userTelefoneEl = document.getElementById('user-telefone');
const logoutBtn = document.getElementById('logout-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-profile-form');
const animaisParaAdocaoContainer = document.getElementById('animais-para-adocao');
const animaisAdotadosContainer = document.getElementById('animais-adotados');
const doacoesAbertasContainer = document.getElementById('doacoes-abertas');
const doacoesFechadasContainer = document.getElementById('doacoes-fechadas');

let currentUserUID = null;

// Logout
window.logout = async function () {
  try {
    await signOut(auth);
    window.location.href = '../index.html';
  } catch (err) {
    console.error('Erro ao fazer logout:', err);
    alert('Não foi possível sair. Tente novamente.');
  }
};

// Modais
window.openEditModal = () => editModal.classList.remove('hidden');
window.closeEditModal = () => editModal.classList.add('hidden');

// Máscara de telefone
window.mascaraTelefone = function (campo) {
  let valor = campo.value.replace(/\D/g, '');
  if (valor.length > 11) valor = valor.slice(0, 11);
  if (valor.length > 10) {
    campo.value = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (valor.length > 6) {
    campo.value = valor.replace(/^(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
  } else if (valor.length > 2) {
    campo.value = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  } else {
    campo.value = valor.replace(/^(\d*)/, '($1');
  }
};

// Abas de doações
document.getElementById('aba-abertas').addEventListener('click', () => trocarAbaDoacao(true));
document.getElementById('aba-fechadas').addEventListener('click', () => trocarAbaDoacao(false));

function trocarAbaDoacao(mostrarAbertas) {
  document.getElementById('aba-abertas').classList.toggle('active', mostrarAbertas);
  document.getElementById('aba-fechadas').classList.toggle('active', !mostrarAbertas);
  doacoesAbertasContainer.classList.toggle('hidden', !mostrarAbertas);
  doacoesFechadasContainer.classList.toggle('hidden', mostrarAbertas);
}

// Ao autenticar
onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  if (logoutBtn) logoutBtn.classList.remove('hidden');
  currentUserUID = user.uid;

  // Carregar perfil
  const userDocRef = doc(db, 'usuarios', currentUserUID);
  const userSnap = await getDoc(userDocRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    userPhotoEl.src = data.fotoURL || 'default-profile.png';
    userNameEl.textContent = data.nome;
    userTelefoneEl.textContent = data.telefone;
    document.getElementById('edit-nome').value = data.nome;
    document.getElementById('edit-telefone').value = data.telefone;
  }

  await carregarAnimais(false);
  await carregarAnimais(true);
  await carregarDoacoes(); // <-- Adicionado aqui!
});

// Carregar animais
async function carregarAnimais(adotados) {
  const col = collection(db, 'animais');
  const q = query(col, where('idDoador', '==', currentUserUID), where('foiAdotado', '==', adotados));
  const snapshot = await getDocs(q);
  const container = adotados ? animaisAdotadosContainer : animaisParaAdocaoContainer;
  container.innerHTML = '';

  snapshot.forEach(docSnap => {
    const pet = docSnap.data();
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${pet.foto}" alt="${pet.nome}" />
      <div class="card-info">
        <h4>${pet.nome}</h4>
        <p>${pet.descricao}</p>
        <p><strong>Idade:</strong> ${pet.idade} anos</p>
        <p><strong>Pelagem:</strong> ${pet.pelagem}</p>
        <p><strong>Cor:</strong> ${pet.cor}</p>
        ${!adotados ? `<button class="btn-adotar" data-id="${docSnap.id}">Marcar como adotado</button>` : ''}
      </div>
    `;
    container.appendChild(card);
  });

  if (!adotados) {
    container.querySelectorAll('.btn-adotar').forEach(btn => {
      btn.addEventListener('click', async () => {
        const petId = btn.dataset.id;
        const petRef = doc(db, 'animais', petId);
        await updateDoc(petRef, { foiAdotado: true });
        await carregarAnimais(false);
        await carregarAnimais(true);
      });
    });
  }
}

// Carregar doações
async function carregarDoacoes() {
  const col = collection(db, 'ajuda_animais');
  const q = query(col, where('idDoador', '==', currentUserUID));
  const snapshot = await getDocs(q);

  doacoesAbertasContainer.innerHTML = '';
  doacoesFechadasContainer.innerHTML = '';

  snapshot.forEach(docSnap => {
    const doacao = docSnap.data();
    const docID = docSnap.id;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${doacao.foto}" alt="${doacao.nomeAnimal}">
      <h4>${doacao.nomeAnimal}</h4>
      <p>${doacao.descricao}</p>
      <p><strong>Meta:</strong> R$${doacao.valorMeta}</p>
      <p><strong>Arrecadado:</strong> R$${doacao.valorArrecadado}</p>
      <button class="btn-toggle" data-id="${docID}" data-status="${doacao.status}">
        ${doacao.status === 'ativo' ? 'Fechar Doação' : 'Reabrir Doação'}
      </button>
    `;

    if (doacao.status === 'ativo') {
      doacoesAbertasContainer.appendChild(card);
    } else {
      doacoesFechadasContainer.appendChild(card);
    }
  });

  document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const statusAtual = btn.dataset.status;
      const novoStatus = statusAtual === 'ativo' ? 'fechado' : 'ativo';

      await updateDoc(doc(db, 'ajuda_animais', id), { status: novoStatus });
      carregarDoacoes();
    });
  });
}

// Submissão do formulário
editForm.addEventListener('submit', async e => {
  e.preventDefault();

  const nome = document.getElementById('edit-nome').value.trim();
  const telefone = document.getElementById('edit-telefone').value.trim();
  const fotoFile = document.getElementById('edit-foto').files[0];
  let fotoURL;

  try {
    if (fotoFile) {
      const fd = new FormData();
      fd.append('file', fotoFile);
      fd.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.secure_url) throw new Error('Falha no upload da imagem.');
      fotoURL = data.secure_url;
    }

    const userRef = doc(db, 'usuarios', currentUserUID);
    const updateData = { nome, telefone };
    if (fotoURL) updateData.fotoURL = fotoURL;
    await setDoc(userRef, updateData, { merge: true });

    userNameEl.textContent = nome;
    userTelefoneEl.textContent = telefone;
    if (fotoURL) userPhotoEl.src = fotoURL;

    closeEditModal();
  } catch (err) {
    console.error(err);
    alert('Erro ao atualizar perfil: ' + err.message);
  }
});
