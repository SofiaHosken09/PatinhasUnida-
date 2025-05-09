async function cadastrarPet() {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      alert('Você precisa estar logado.');
      return;
    }
    const idDoador = user.uid;

    const nome = document.getElementById('pet-nome').value.trim();
    const especie = document.getElementById('pet-especie').value.trim();
    const raca = document.getElementById('pet-raca').value.trim();
    const idadeInput = document.getElementById('pet-idade');
    const idade = idadeInput ? parseInt(idadeInput.value, 10) : 0;
    const cor = document.getElementById('pet-cor').value.trim();
    const pelagem = document.getElementById('pet-pelagem').value.trim();
    const doencas = document.getElementById('pet-doencas').value.trim();
    const descricao = document.getElementById('pet-desc').value.trim();
    const fotoInput = document.getElementById('pet-foto');
    const feedback = document.getElementById('pet-feedback');
    if (feedback) {
      feedback.textContent = '';
    }

    if (!nome || !especie || !raca || isNaN(idade) || !cor || !pelagem || !doencas || !descricao || !fotoInput || !fotoInput.files || fotoInput.files.length === 0) {
      if (feedback) {
        feedback.textContent = 'Preencha todos os campos e selecione uma foto.';
      } else {
        alert('Preencha todos os campos e selecione uma foto.');
      }
      return;
    }

    const foto = fotoInput.files[0];
    const petId = Date.now().toString();

    // Solução alternativa (upload para um servidor local, se disponível)
    try {
      const formData = new FormData();
      formData.append('foto', foto);
      const uploadResponse = await fetch('http://localhost:3000/upload', { // Assumindo um servidor local rodando
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Erro no upload da imagem para o servidor local: ${errorData.message || uploadResponse.statusText}`);
      }

      const { caminho } = await uploadResponse.json();

      await firebase.firestore().collection('animais').doc(petId).set({
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
        foto: caminho, // Salva o caminho local
        foiAdotado: false
      });

      alert('Pet cadastrado com sucesso (imagem salva localmente)!');
      window.location.href = 'home.html';
      return;

    } catch (localUploadError) {
      console.warn("Falha ao usar o servidor local, tentando Firebase Storage:", localUploadError);
      // Se o upload local falhar, tenta o Firebase Storage (com possível problema de CORS)
      const storageRef = firebase.storage().ref(`animais/${petId}`);
      await storageRef.put(foto);
      const url = await storageRef.getDownloadURL();

      await firebase.firestore().collection('animais').doc(petId).set({
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

      alert('Pet cadastrado com sucesso (imagem salva no Firebase Storage)!');
      window.location.href = 'home.html';
    }

  } catch (err) {
    console.error(err);
    const feedback = document.getElementById('pet-feedback');
    if (feedback) {
      feedback.textContent = 'Erro ao cadastrar: ' + err.message;
    } else {
      alert('Erro ao cadastrar: ' + err.message);
    }
  }
}