import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCVF0y8L02_JCIUBj3addBFO8hz-ljfi8E",
  authDomain: "cellpartsxpress-delivery.firebaseapp.com",
  projectId: "cellpartsxpress-delivery",
  storageBucket: "cellpartsxpress-delivery.appspot.com",
  messagingSenderId: "76625547073",
  appId: "1:76625547073:web:4e6c8ba79dfc0a20635bc0",
  measurementId: "G-YDRMZD2SSW"
};

// Teste a configuração do Firebase
console.log('🔥 Testando configuração do Firebase...');
console.log('Config:', firebaseConfig);

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('✅ Firebase inicializado com sucesso!');
  console.log('📧 Auth service:', auth);
  console.log('🗄️ Firestore service:', db);

  // Teste básico de autenticação
  console.log('🔐 Estado da autenticação:', auth.currentUser);

} catch (error) {
  console.error('❌ Erro na configuração do Firebase:', error);
}

export { auth, db };
