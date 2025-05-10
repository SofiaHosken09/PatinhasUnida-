// Importando os serviços do Firebase
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { app } from '../firebase-config.js';

// Inicializando os serviços do Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

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
    if (!foto) { fb.textContent = 'Selecione uma foto.'; return; }
    if (senha !== conf) { fb.textContent = 'Senhas não conferem.'; return; }
    if (senha.length < 6) { fb.textContent = 'Senha mínima 6 caracteres.'; return; }

    // cria usuário no Firebase Auth
    createUserWithEmailAndPassword(auth, email, senha)
      .then(cred => {
        const uid = cred.user.uid;
        // upload de foto
        const storageRef = ref(storage, `fotosPerfil/${uid}`);
        return uploadBytes(storageRef, foto)
          .then(() => getDownloadURL(storageRef))
          .then(url =>
            // salva dados no Firestore
            setDoc(doc(db, 'usuarios', uid), { nome, email, telefone, cidade, fotoURL: url, uid })
          );
      })
      .then(() => {
        alert('Cadastro realizado com sucesso!');
        window.location.href = '../html/home.html';
      })
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

    signInWithEmailAndPassword(auth, email, senha)
      .then(() => {
        alert('Login realizado com sucesso!');
        window.location.href = '../html/home.html';
      })
      .catch(e => {
        fb.textContent = e.message;
        console.error(e);
      });
  };
});

// Login com Google
window.entrarComGoogle = function() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(result => {
      const user = result.user;
      const uid = user.uid;

      // Verifica se o usuário já está salvo no Firestore
      return getDoc(doc(db, 'usuarios', uid)).then(docSnap => {
        if (!docSnap.exists()) {
          return setDoc(doc(db, 'usuarios', uid), {
            nome: user.displayName,
            email: user.email,
            telefone: '',
            cidade: '',
            fotoURL: user.photoURL,
            uid: uid
          });
        }
      });
    })
    .then(() => {
      alert('Login com Google bem-sucedido!');
      window.location.href = '../html/home.html';
    })
    .catch(error => {
      alert('Erro no login com Google: ' + error.message);
      console.error(error);
    });
};

// Redefinir senha
window.redefinirSenha = function() {
  const email = prompt('Digite seu e-mail para redefinir a senha:');
  if (!email) return;

  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert('E-mail de redefinição enviado!');
    })
    .catch(error => {
      alert('Erro ao enviar e-mail: ' + error.message);
      console.error(error);
    });
};
