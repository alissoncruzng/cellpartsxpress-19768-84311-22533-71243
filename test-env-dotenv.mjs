import 'dotenv/config';

console.log('SUPABASE_URL:', process.env.VITE_SUPABASE_URL || 'NOT SET');
console.log('FIREBASE_API_KEY:', process.env.VITE_FIREBASE_API_KEY ? 'SET' : 'NOT SET');
console.log('GOOGLE_MAPS_KEY:', process.env.VITE_GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET');
console.log('ADMIN_EMAIL:', process.env.VITE_ADMIN_EMAIL || 'NOT SET');
