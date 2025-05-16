import { app } from './firebase-config.js';
import {
  getFirestore,
  collection,
  getDocs,
  query,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const db = getFirestore(app);
const containerCards = document.querySelector('#cards-animais'); // Acessando o container dos cards

// Função para criar o card de cada animal
function criarCardAnimal(animal) {
  return `
    <div class="card" style="width: 18rem;">
      <img src="${animal.foto || 'img/default.jpg'}" class="card-img-top" alt="${animal.nome}">
      <div class="card-body">
        <h5 class="card-title">${animal.nome}</h5>
        <p class="card-text"><strong>Espécie:</strong> ${animal.especie}</p>
        <p class="card-text"><strong>Idade:</strong> ${animal.idade} anos</p>
        <p class="card-text"><strong>Descrição:</strong> ${animal.descricao}</p>
        <button class="btn btn-info" id="btn-verm" onclick="window.location.href='../html/maisinfo.html?id=${animal.id}'">Ver Mais Informações</button>



      </div>
    </div>
  `;
}

// Função para filtrar e renderizar os animais com base nos filtros
function renderizarAnimais(lista) {
  const especieFiltro = document.querySelector('#filtro-especie').value;
  const idadeFiltro = document.querySelector('#filtro-idade').value;

  // Filtrando os animais com base nos filtros selecionados
  const animaisFiltrados = lista.filter(animal => {
    // Filtro de espécie
    const especieMatch = especieFiltro ? animal.especie.toLowerCase() === especieFiltro.toLowerCase() : true;
    
    // Filtro de idade
    let idadeMatch = true;
    if (idadeFiltro) {
      const idade = animal.idade;
      if (idadeFiltro === '0-1') {
        idadeMatch = idade >= 0 && idade <= 1;
      } else if (idadeFiltro === '2-5') {
        idadeMatch = idade >= 2 && idade <= 5;
      } else if (idadeFiltro === '6-10') {
        idadeMatch = idade >= 6 && idade <= 10;
      } else if (idadeFiltro === '10+') {
        idadeMatch = idade > 10;
      }
    }

    // Filtro para garantir que o animal não foi adotado
    const naoAdotado = !animal.foiAdotado;

    return especieMatch && idadeMatch && naoAdotado;
  });

  // Renderizando os animais filtrados
  if (!containerCards) {
    console.error("Elemento #cards-animais não encontrado");
    return;
  }

  containerCards.innerHTML = animaisFiltrados.map(criarCardAnimal).join(""); // Preenche os cards com os animais filtrados
}

// Função para carregar os animais do Firestore
async function carregarAnimais() {
  try {
    const animaisRef = collection(db, 'animais'); // Substitua 'animais' pelo nome da sua coleção no Firestore
    const q = query(animaisRef);
    const querySnapshot = await getDocs(q);
    
    const animais = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Renderizando animais pela primeira vez
    renderizarAnimais(animais);
    
    // Adicionando eventos de mudança nos filtros
    document.querySelector('#filtro-especie').addEventListener('change', () => renderizarAnimais(animais));
    document.querySelector('#filtro-idade').addEventListener('change', () => renderizarAnimais(animais));
  } catch (error) {
    console.error("Erro ao carregar animais: ", error);
  }
}

// Chama a função para carregar os animais quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', carregarAnimais);
