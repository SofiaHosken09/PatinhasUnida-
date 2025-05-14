import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from '../firebase-config.js';

const db = getFirestore(app);
const auth = getAuth(app);

// Corrigido: ID correto do formulário
const form = document.getElementById('form-ajuda');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nomeAnimal = document.getElementById('nomeAnimal').value;
  const valorMeta = parseFloat(document.getElementById('valorMeta').value);
  const descricao = document.getElementById('descricao').value;
  const fotoFile = document.getElementById('foto').files[0];
  const chavePix = document.getElementById('chavePix').value;

  // Verificando se o usuário está logado
  if (!auth.currentUser) {
    alert('Você precisa estar logado.');
    return;
  }

  // Verificando se a foto foi selecionada
  if (!fotoFile) {
    alert("Por favor, selecione uma imagem para o animal.");
    return;
  }

  try {
    // Upload da imagem para o Cloudinary
    const formData = new FormData();
    formData.append('file', fotoFile);
    formData.append('upload_preset', 'patinhas_upload'); 

    const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dzfmswqki/image/upload', {
      method: 'POST',
      body: formData
    });

    if (!cloudinaryRes.ok) {
      throw new Error('Falha ao fazer upload da imagem.');
    }

    const cloudinaryData = await cloudinaryRes.json();
    const fotoURL = cloudinaryData.secure_url; // URL da imagem no Cloudinary

    // Verificando se a URL foi recebida corretamente
    if (!fotoURL) {
      alert("Erro ao fazer upload da foto. Tente novamente.");
      return;
    }

    // Gerando QR Code com a chave Pix
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(chavePix)}&size=200x200`;

    // Enviar os dados para o Firestore
    await addDoc(collection(db, "ajuda_animais"), {
      nomeAnimal,
      valorMeta,
      valorArrecadado: 0,
      descricao,
      foto: fotoURL, // Salvando a URL da foto no Firestore
      idDoador: auth.currentUser.uid,
      qrCodeURL,
      status: "ativo"
    });

    alert("Pedido de ajuda cadastrado com sucesso!");
    form.reset(); // Reseta o formulário após o cadastro

  } catch (error) {
    console.error("Erro ao cadastrar pedido:", error);
    alert("Erro ao cadastrar pedido: " + error.message);
  }
});
