// js/auth.js
import { auth, db } from './firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Escuta se o usuário já está logado ao carregar o app
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Esconde a tela de Login e mostra o App
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    updateHeaderGreeting(user.displayName);
  } else {
    // Esconde o App e mostra a tela de Login
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
  }
});

// Controle de Alternância das Telas
window.showRegisterForm = function() {
  document.getElementById('view-login').classList.add('hidden');
  document.getElementById('view-register').classList.remove('hidden');
};

window.showLoginForm = function() {
  document.getElementById('view-register').classList.add('hidden');
  document.getElementById('view-login').classList.remove('hidden');
};

// Cadastro Otimizado na Nuvem
window.doRegister = async function() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value.trim();
  const level = document.getElementById('reg-level').value;

  if (!name || !email || !pass || !level) {
    showToast('Preencha todos os campos!');
    return;
  }

  try {
    // 1. Cria credencial de login
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // 2. Vincula o nome ao perfil de autenticação
    await updateProfile(user, { displayName: name });

    // 3. Cria a ficha do usuário no Firestore com o Nível de Aprendizado
    await setDoc(doc(db, "users", user.uid), {
      nome: name,
      email: email,
      nivelAprendizado: level,
      createdAt: Date.now()
    });

    showToast('Cadastro realizado!');
    
    // Limpa o formulário de cadastro
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-pass').value = '';
    
    // Fecha o cadastro e exibe novamente a tela de login inicial
    showLoginForm();
    document.getElementById('log-email').value = email; 
  } catch (error) {
    console.error(error);
    if (error.code === 'auth/email-already-in-use') showToast('Este e-mail já tem cadastro.');
    else if (error.code === 'auth/weak-password') showToast('A senha deve ter no mínimo 6 caracteres.');
    else showToast('Erro ao cadastrar.');
  }
};

// Validação de Entrada (Login)
window.doLogin = async function() {
  const email = document.getElementById('log-email').value.trim();
  const pass = document.getElementById('log-pass').value.trim();

  if (!email || !pass) {
    showToast('Preencha e-mail e senha!');
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    console.error(error);
    showToast('E-mail ou senha incorretos.');
  }
};

// Sair da Conta (Logout)
window.doLogout = async function() {
  try {
    await signOut(auth);
    if (typeof window.toggleSidebar === 'function') {
      window.toggleSidebar(); // Fecha o menu lateral
    }
    showToast('Você saiu da conta.');
  } catch (error) {
    console.error(error);
    showToast('Erro ao sair.');
  }
};

// Atualização dinâmica de boas-vindas no topo do App
function updateHeaderGreeting(name) {
  if (name) {
    const d = new Date();
    const greeting = d.getHours() < 12 ? 'Bom dia' : d.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
    const hdElement = document.getElementById('hd');
    
    if (hdElement) {
      hdElement.innerHTML = `${greeting}, <b>${name}</b>!`;
    }
  }
}
