// app.js

// CADASTRO DE USUÁRIO
function cadastrarUsuario(nome, email, telefone, cidade, fotoPerfilURL, senha) {
    auth.createUserWithEmailAndPassword(email, senha)
      .then(cred => {
        return db.collection('usuarios').doc(cred.user.uid).set({
          nome, email, telefone, cidade, fotoPerfil: fotoPerfilURL, uid: cred.user.uid
        });
      })
      .then(() => alert("Usuário cadastrado com sucesso!"))
      .catch(error => console.error("Erro no cadastro:", error.message));
  }
  
  // CADASTRO DE ANIMAL
  function cadastrarAnimal(nome, especie, raca, idade, cor, pelagem, doencas, descricao, fotoURL) {
    const user = auth.currentUser;
    if (!user) return alert("Faça login primeiro!");
  
    db.collection('animais').add({
      nome, especie, raca, idade, cor, pelagem, doencas, descricao, foto: fotoURL,
      foiAdotado: false, idDoador: user.uid
    })
    .then(() => alert("Animal cadastrado!"))
    .catch(error => console.error("Erro ao cadastrar animal:", error.message));
  }
  
  // AJUDA ANIMAL + QR CODE
  function cadastrarAjudaAnimal(nome, descricao, valorMeta, fotoURL, qrCodeURL) {
    const user = auth.currentUser;
    if (!user) return alert("Faça login primeiro!");
  
    db.collection('ajuda_animais').add({
      nomeAnimal: nome,
      descricao,
      valorMeta: parseFloat(valorMeta),
      valorArrecadado: 0,
      foto: fotoURL,
      idDoador: user.uid,
      qrCodeURL,
      status: "ativo"
    })
    .then(() => alert("Publicação criada!"))
    .catch(error => console.error("Erro:", error.message));
  }
