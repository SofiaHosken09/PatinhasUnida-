import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { app, auth, db } from '../firebase-config.js';

const container = document.getElementById('doacoes-container');

async function carregarDoacoesPublicas() {
  try {
    const doacoesRef = collection(db, 'ajuda_animais');
    const q = query(doacoesRef, where('status', '==', 'ativo'));
    const snapshot = await getDocs(q);

    container.innerHTML = '';

    for (const docSnap of snapshot.docs) {
      const doacao = docSnap.data();
      const usuarioRef = doc(db, 'usuarios', doacao.idDoador);
      const usuarioSnap = await getDoc(usuarioRef);
      const usuario = usuarioSnap.exists() ? usuarioSnap.data() : {};

      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <div class="card shadow-sm h-100">
          <img src="${doacao.foto}" class="card-img-top" alt="Animal">
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <img src="${usuario.fotoURL || 'default-profile.png'}" class="perfil-img me-2" alt="Perfil">
              <strong>${usuario.nome || 'Usuário desconhecido'}</strong>
            </div>
            <h5>${doacao.nomeAnimal}</h5>
            <p>${doacao.descricao}</p>
            <p><strong>Meta:</strong> R$ ${doacao.valorMeta}</p>
            <p><strong>Arrecadado:</strong> R$ ${doacao.valorArrecadado}</p>
            <button class="btn btn-primary btn-sm w-100" onclick="mostrarModal('${usuario.nome}', '${usuario.telefone}', '${doacao.chavePix}', '${doacao.qrCodeURL}')">
              Quero Ajudar
            </button>
          </div>
        </div>
      `;
      container.appendChild(col);
    }
  } catch (error) {
    console.error('Erro ao carregar doações:', error);
    container.innerHTML = '<p>Erro ao carregar as doações. Tente novamente mais tarde.</p>';
  }
}

window.mostrarModal = function(nome, telefone, chavePix, qrcodeUrl) {
  document.getElementById('modal-nome').textContent = nome;
  document.getElementById('modal-tel').textContent = telefone;
  document.getElementById('modal-pix').textContent = chavePix;
  document.getElementById('modal-qrcode').src = qrcodeUrl;
  new bootstrap.Modal(document.getElementById('doacaoModal')).show();
};

carregarDoacoesPublicas();
