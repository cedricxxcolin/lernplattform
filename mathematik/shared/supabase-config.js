// Zentrale Supabase-Konfiguration
// Wird von jeder Übungsseite eingebunden: <script src="../shared/supabase-config.js"></script>
// Danach steht in jeder Seite die Variable "sb" zur Verfügung.

const SUPABASE_URL = "https://pyixmbjxhaogiugtsxma.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Rrwp_4YArA1EToHcWMP83w_OQH3Z-8O";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
