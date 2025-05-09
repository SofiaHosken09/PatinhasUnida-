function cadastrarPet() {
  const user = firebase.auth().currentUser;
  if (!user) { alert('Você precisa estar logado.'); return; }
  const idDoador = user.uid;

  const nome = document.getElementById('pet-nome').value.trim();
  const especie = document.getElementById('pet-especie').value.trim();
  const raca = document.getElementById('pet-raca').value.trim();
  const idade = parseInt(document.getElementById('pet-idade').value, 10);
  const cor = document.getElementById('pet-cor').value.trim();
  const pelagem = document.getElementById('pet-pelagem').value.trim();
  const doencas = document.getElementById('pet-doencas').value.trim();
  const descricao = document.getElementById('pet-desc').value.trim();
  const fotoInput = document.getElementById('pet-foto');
  const feedback = document.getElementById('pet-feedback');
  feedback.textContent = '';

  if (!nome || !especie || !raca || isNaN(idade) || !cor || !pelagem || !doencas || !descricao || fotoInput.files.length === 0) {
    feedback.textContent = 'Preencha todos os campos e selecione uma foto.';
    return;
  }

  const foto = fotoInput.files[0];
  const petId = Date.now().toString();

  const storageRef = firebase.storage().ref(`animais/${petId}`);
  storageRef.put(foto)
    .then(() => storageRef.getDownloadURL())
    .then(url => {
      return firebase.firestore().collection('animais').doc(petId).set({
        id: petId,
        idDoador,
        nome,
        especie,
        raca,
        idade,
        cor,
        pelagem,
        doencas,
        descricao,
        foto: url,
        foiAdotado: false
      });
    })
    .then(() => {
      alert('Pet cadastrado com sucesso!');
      window.location.href = 'home.html';
    })
    .catch(err => {
      console.error(err);
      feedback.textContent = 'Erro ao cadastrar: ' + err.message;
    });
}
