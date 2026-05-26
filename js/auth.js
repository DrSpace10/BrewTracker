// js/auth.js
import { auth } from './firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Escuta se o usuário já está logado
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('auth-screen').style.display = 'none';
    updateHeaderGreeting(user.displayName);
  } else {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('auth-screen').style.opacity = '1';
  }
});

// Navegação visual
window.showAuthForm = function(type) {
  document.getElementById('auth-buttons').classList.add('hidden');
  if (type === 'login') document.getElementById('form-login').classList.remove('hidden');
  if (type === 'register') document.getElementById('form-register').classList.remove('hidden');
};

window.hideAuthForms = function() {
  document.getElementById('form-login').classList.add('hidden');
  document.getElementById('form-register').classList.add('hidden');
  document.getElementById('auth-buttons').classList.remove('hidden');
};

// Cadastro no Firebase
window.doRegister = async function() {
  const name = document.getElementById('reg-name').value;
  const nick = document.getElementById('reg-nick').value;
  const email = document.getElementById('reg-email').value;
  const pass = document.getElementById('reg-pass').value;
  
  if (!nick || !email || !pass) {
    showToast('Preencha apelido, e-mail e senha!');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    // Salva o apelido no perfil do Firebase
    await updateProfile(userCredential.user, { displayName: nick });
    
    showToast('Cadastro realizado!');
    hideAuthForms();
    showAuthForm('login');
    document.getElementById('log-email').value = email;
  } catch (error) {
    console.error(error);
    if(error.code === 'auth/email-already-in-use') showToast('Este e-mail já tem cadastro.');
    else if(error.code === 'auth/weak-password') showToast('A senha deve ter no mínimo 6 caracteres.');
    else showToast('Erro ao cadastrar.');
  }
};

// Login no Firebase
window.doLogin = async function() {
  const email = document.getElementById('log-email').value;
  const pass = document.getElementById('log-pass').value;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    document.getElementById('auth-screen').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('auth-screen').style.display = 'none';
    }, 300);
  } catch (error) {
    console.error(error);
    showToast('E-mail ou senha incorretos.');
  }
};

// Atualiza o Cabeçalho
function updateHeaderGreeting(nick) {
  if (nick) {
    const d = new Date();
    const dateStr = d.toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'});
    const greeting = d.getHours() < 12 ? 'Bom dia' : d.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
    
    const hdElement = document.getElementById('hd');
    if (hdElement) {
      hdElement.innerHTML = `${greeting}, <b>${nick}</b>! Hoje é ${dateStr}.`;
    }
  }
}