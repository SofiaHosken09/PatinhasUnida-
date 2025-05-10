import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from '../firebase-config.js';

const db = getFirestore(app);
const auth = getAuth(app);

// Garantir que o código só seja executado após o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form-pet').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('pet-foto');
    if (!fileInput || !fileInput.files[0]) {
      alert("Nenhuma foto selecionada.");
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file', file);
    formData.append('upload_preset', 'patinhas_upload');

    let fotoURL = "";

    try {
      // Enviar imagem para o Cloudinary
      const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dzfmswqki/image/upload', {
        method: 'POST',
        body: formData
      });

      if (!cloudinaryRes.ok) {
        throw new Error("Erro ao enviar imagem para o Cloudinary.");
      }

      const cloudinaryData = await cloudinaryRes.json();
      fotoURL = cloudinaryData.secure_url;

      // Verificar se o usuário está autenticado
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado.");

      // Adicionar documento no Firestore
      const docRef = await addDoc(collection(db, "animais"), {
        nome: document.getElementById("nome").value,
        especie: document.getElementById("especie").value,
        raca: document.getElementById("raca").value,
        idade: parseInt(document.getElementById("idade").value),
        pelagem: document.getElementById("pelagem").value,
        cor: document.getElementById("cor").value,
        descricao: document.getElementById("descricao").value,
        doencas: document.getElementById("doencas").value,
        foiAdotado: false,
        foto: fotoURL,
        idDoador: user.uid
      });

      alert("Pet cadastrado com sucesso!");

    } catch (error) {
      console.error("Erro ao cadastrar pet:", error);
      alert("Erro ao cadastrar pet. Verifique o console.");
    }
  });
});
