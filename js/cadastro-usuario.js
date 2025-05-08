// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
  // 1) Seleção de abas e formulários
  const tabRegister = document.getElementById('tab-register');
  const tabLogin    = document.getElementById('tab-login');
  const formRegister = document.getElementById('form-register');
  const formLogin    = document.getElementById('form-login');

  // 2) Função para alternar abas
  function activate(tab) {
    if (tab === 'register') {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.classList.add('active');
      formLogin.classList.remove('active');
    } else {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.classList.add('active');
      formRegister.classList.remove('active');
    }
  }

  // 3) EventListeners nas abas
  tabRegister.addEventListener('click', () => activate('register'));
  tabLogin.addEventListener('click',    () => activate('login'));

  // 4) Aba de cadastro como padrão
  activate('register');

  // 5) Máscara de telefone
  window.mascaraTelefone = function(campo) {
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

  // 6) Função de cadastro
  window.cadastrarUsuario = function() {
    const nome     = document.getElementById('reg-nome').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const telefone = document.getElementById('reg-telefone').value.trim();
    const cidade   = document.getElementById('reg-cidade').value.trim();
    const foto     = document.getElementById('reg-foto').files[0];
    const senha    = document.getElementById('reg-senha').value;
    const conf     = document.getElementById('reg-conf').value;
    const fb       = document.getElementById('reg-feedback');
    fb.textContent = '';

    // validações básicas
    if (!foto)       { fb.textContent = 'Selecione uma foto.';       return; }
    if (senha !== conf) { fb.textContent = 'Senhas não conferem.';      return; }
    if (senha.length < 6) { fb.textContent = 'Senha mínimo 6 caracteres.'; return; }

    // cria usuário no Firebase Auth
    firebase.auth().createUserWithEmailAndPassword(email, senha)
      .then(cred => {
        const uid = cred.user.uid;
        // upload de foto
        const storageRef = firebase.storage().ref(`fotosPerfil/${uid}`);
        return storageRef.put(foto)
          .then(() => storageRef.getDownloadURL())
          .then(url =>
            // salva dados no Firestore
            firebase.firestore()
              .collection('usuarios')
              .doc(uid)
              .set({ nome, email, telefone, cidade, fotoURL: url, uid })
          );
      })
      .then(() => alert('Cadastro realizado com sucesso!'))
      .catch(e => {
        fb.textContent = e.message;
        console.error(e);
      });
  };

  // 7) Função de login
  window.logarUsuario = function() {
    const email = document.getElementById('log-email').value.trim();
    const senha = document.getElementById('log-senha').value;
    const fb    = document.getElementById('log-feedback');
    fb.textContent = '';

    firebase.auth().signInWithEmailAndPassword(email, senha)
      .then(() => alert('Login efetuado com sucesso!'))
      .catch(e => {
        fb.textContent = e.message;
        console.error(e);
      });
  };
});
