// PLANTILLA - Copia este archivo, renómbralo a supabaseConfig.js
// y reemplaza los valores con las credenciales del proyecto FITFAB.
// supabaseConfig.js está en .gitignore — NUNCA lo subas al repositorio.

const SUPABASE_URL = 'TU_URL_AQUI';
const SUPABASE_KEY = 'TU_PUBLISHABLE_KEY_AQUI';

window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
