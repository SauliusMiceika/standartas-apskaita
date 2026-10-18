import { supabase } from './supabase';

const app = document.getElementById('app')!;

function loginView() {
  app.innerHTML = `
    <div class="card">
      <h1>Standartas</h1>
      <p class="sub">Apskaitos sistema</p>
      <input id="email" type="email" placeholder="El. paštas" autocomplete="email">
      <input id="password" type="password" placeholder="Slaptažodis" autocomplete="current-password">
      <button id="btn">Prisijungti</button>
      <div id="msg"></div>
    </div>`;
  document.getElementById('btn')!.onclick = async () => {
    const email = (document.getElementById('email') as HTMLInputElement).value.trim();
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const msg = document.getElementById('msg')!;
    msg.textContent = 'Jungiamasi...';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { msg.textContent = 'Klaida: ' + error.message; return; }
    await showCompanies();
  };
}

async function showCompanies() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: ucs, error } = await supabase
    .from('user_companies')
    .select('role, companies(name)')
    .eq('user_id', user!.id);
  if (error) { app.innerHTML = `<div class="card"><p>Klaida: ${error.message}</p></div>`; return; }
  const rows = (ucs ?? []).map((uc: any) => `<li>${uc.companies?.name ?? '?'} — ${uc.role}</li>`).join('');
  app.innerHTML = `
    <div class="card">
      <h1>Sveikas, Sauliau 👋</h1>
      <p>Tavo įmonės:</p>
      <ul>${rows}</ul>
      <button id="out">Atsijungti</button>
    </div>`;
  document.getElementById('out')!.onclick = async () => {
    await supabase.auth.signOut();
    loginView();
  };
}

supabase.auth.getSession().then(({ data: { session } }) => {
  session ? showCompanies() : loginView();
});
