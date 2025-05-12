import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { app } from '../firebase-config.js';

const db = getFirestore(app);
const container = document.getElementById('animal-detalhes');

// Função para obter parâmetro da URL
function getParam(nome) {
  const url = new URLSearchParams(window.location.search);
  return url.get(nome);
}

const animalId = getParam('id');

async function carregarDetalhes() {
  if (!animalId) {
    container.innerHTML = '<p>ID do animal não fornecido.</p>';
    return;
  }

  try {
    const animalRef = doc(db, 'animais', animalId);
    const animalSnap = await getDoc(animalRef);

    if (!animalSnap.exists()) {
      container.innerHTML = '<p>Animal não encontrado.</p>';
      return;
    }

    const animal = animalSnap.data();

    // Buscar info do doador
    const doadorRef = doc(db, 'usuarios', animal.idDoador);
    const doadorSnap = await getDoc(doadorRef);
    const doador = doadorSnap.exists() ? doadorSnap.data() : {};

    // Criar conteúdo
    container.innerHTML = `
    <div class="doador-info">
          <img src="${doador.fotoURL || 'default-profile.png'}" alt="Foto do doador" class="doador-foto"/>
          <p>${doador.nome || 'Nome não disponível'}</p>
        
         
        </div>
      </div>
      <div class="animal-card">
        <img src="${animal.foto}" alt="${animal.nome}" class="animal-foto" />
        <h2>${animal.nome}</h2>
        <p><strong>Idade:</strong> ${animal.idade} anos</p>
        <p><strong>Raça:</strong> ${animal.raca}</p>
        <p><strong>Pelagem:</strong> ${animal.pelagem}</p>
        <p><strong>Cor:</strong> ${animal.cor}</p>
        <p><strong>Doenças:</strong> ${animal.doencas || 'Não informado'}</p>
        <p><strong>Descrição:</strong> ${animal.descricao}</p>
<p><strong>Telefone:</strong> ${doador.telefone || 'Não disponível'}</p>
 <a href="https://wa.me/55${doador.telefone?.replace(/\D/g, '')}" target="_blank" class="btn-whatsapp">
            Falar no WhatsApp
          </a>
        
    `;
  } catch (err) {
    console.error('Erro ao carregar detalhes:', err);
    container.innerHTML = '<p>Erro ao carregar detalhes do animal.</p>';
  }
}

carregarDetalhes();
