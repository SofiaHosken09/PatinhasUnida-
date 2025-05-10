// Importando os serviços do Firebase
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { app } from '../firebase-config.js';

// Inicializando os serviços do Firebase
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  const tabRegister = document.getElementById('tab-register');
  const tabLogin = document.getElementById('tab-login');
  const formRegister = document.getElementById('form-register');
  const formLogin = document.getElementById('form-login');

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

  tabRegister.addEventListener('click', () => activate('register'));
  tabLogin.addEventListener('click', () => activate('login'));

  activate('register');

  window.mascaraTelefone = function (campo) {
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

  // CADASTRO
 // CADASTRO
window.cadastrarUsuario = async function () {
  const nome = document.getElementById('reg-nome').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const telefone = document.getElementById('reg-telefone').value.trim();
  const cidade = document.getElementById('reg-cidade').value.trim();
  const foto = document.getElementById('reg-foto').files[0];
  const senha = document.getElementById('reg-senha').value;
  const conf = document.getElementById('reg-conf').value;
  const fb = document.getElementById('reg-feedback');
  fb.textContent = '';

  if (!foto) return fb.textContent = 'Selecione uma foto.';
  if (senha !== conf) return fb.textContent = 'Senhas não conferem.';
  if (senha.length < 6) return fb.textContent = 'Senha mínima 6 caracteres.';

  try {
    // 1) Cria o usuário no Firebase Authentication
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = cred.user.uid;

    // 2) Envia a imagem para o Cloudinary
    const formData = new FormData();
    formData.append('file', foto);
    formData.append('upload_preset', 'patinhas_upload');

    const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dzfmswqki/image/upload', {
      method: 'POST',
      body: formData
    });

    const cloudinaryData = await cloudinaryRes.json();

    // Verifica se a imagem foi enviada com sucesso
    if (!cloudinaryData.secure_url) {
      throw new Error('Erro ao fazer upload da imagem no Cloudinary.');
    }

    const fotoURL = cloudinaryData.secure_url;

    // 3) Salva os dados no Firestore
    await setDoc(doc(db, 'usuarios', uid), {
      nome,
      email,
      telefone,
      cidade,
      fotoURL,
      uid
    });

    alert('Cadastro realizado com sucesso!');
    window.location.href = '../html/home.html';

  } catch (e) {
    fb.textContent = e.message;
    console.error(e);
  }
};


  // LOGIN
  window.logarUsuario = function () {
    const email = document.getElementById('log-email').value.trim();
    const senha = document.getElementById('log-senha').value;
    const fb = document.getElementById('log-feedback');
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
window.entrarComGoogle = function () {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(async result => {
      const user = result.user;
      const uid = user.uid;

      const docSnap = await getDoc(doc(db, 'usuarios', uid));
      if (!docSnap.exists()) {
        await setDoc(doc(db, 'usuarios', uid), {
          nome: user.displayName,
          email: user.email,
          telefone: '',
          cidade: '',
          fotoURL: user.photoURL,
          uid
        });
      }

      alert('Login com Google bem-sucedido!');
      window.location.href = '../html/home.html';
    })
    .catch(error => {
      alert('Erro no login com Google: ' + error.message);
      console.error(error);
    });
};

// Redefinir senha
window.redefinirSenha = function () {
  const email = prompt('Digite seu e-mail para redefinir a senha:');
  if (!email) return;

  sendPasswordResetEmail(auth, email)
    .then(() => alert('E-mail de redefinição enviado!'))
    .catch(error => {
      alert('Erro ao enviar e-mail: ' + error.message);
      console.error(error);
    });
};
