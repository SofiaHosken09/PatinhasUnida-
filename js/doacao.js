import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from '../firebase-config.js';

const db = getFirestore(app);
const auth = getAuth(app);

const form = document.getElementById('form-ajuda');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nomeAnimal = document.getElementById('nomeAnimal').value;
  const valorMeta = parseFloat(document.getElementById('valorMeta').value);
  const descricao = document.getElementById('descricao').value;
  const fotoFile = document.getElementById('foto').files[0];
  const chavePix = document.getElementById('chavePix').value;

  if (!auth.currentUser) {
    alert('Você precisa estar logado.');
    return;
  }

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

    if (!cloudinaryRes.ok) throw new Error('Falha ao fazer upload da imagem.');

    const cloudinaryData = await cloudinaryRes.json();
    const fotoURL = cloudinaryData.secure_url;

    if (!fotoURL) {
      alert("Erro ao fazer upload da foto. Tente novamente.");
      return;
    }

    // Gerando QR Code Pix válido com a API Pix Gerado
    const nomeRecebedor = "Patinhas Ajuda"; // coloque um nome real se quiser
    const cidade = "Belo Horizonte"; // ou qualquer cidade
    const payloadPix = `https://pix.gerado.app/pix?chave=${encodeURIComponent(chavePix)}&nome=${encodeURIComponent(nomeRecebedor)}&cidade=${encodeURIComponent(cidade)}&valor=${valorMeta.toFixed(2)}`;
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(payloadPix)}&size=200x200`;

    await addDoc(collection(db, "ajuda_animais"), {
      nomeAnimal,
      valorMeta,
      valorArrecadado: 0,
      descricao,
      foto: fotoURL,
      idDoador: auth.currentUser.uid,
      qrCodeURL,
      chavePix, // Salvando também a chave
      status: "ativo"
    });

    alert("Pedido de ajuda cadastrado com sucesso!");
    form.reset();

  } catch (error) {
    console.error("Erro ao cadastrar pedido:", error);
    alert("Erro ao cadastrar pedido: " + error.message);
  }
});
