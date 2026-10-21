import { supabase } from './supabase';

const app = document.getElementById('app')!;

function route(): string {
  return location.hash.replace(/^#\/?/, '').split('/')[0] || '';
}
function go(r: string) { location.hash = r ? '#/' + r : '#/'; }
let currentCompany: { id: string; name: string; role: string } | null = null;
let userFirstName = '';

const MENU = [
  { id: 'home', label: 'Pradžia', icon: '🏠' },
  { id: 'documents', label: 'Dokumentai', icon: '📄' },
  { id: 'new', label: 'Naujas įrašas', icon: '➕' },
  { id: 'reports', label: 'Ataskaitos', icon: '📊' },
  { id: 'settings', label: 'Nustatymai', icon: '⚙️' },
];

let menuOpen = false;
let currentScreen = 'home';

function shell(): string {
  const company = currentCompany ? currentCompany.name : '—';
  return `
  <div class="topbar">
    <button id="burger" class="icon-btn" aria-label="Meniu">☰</button>
    <div class="company-watermark">${company}</div>
    <button id="avatar" class="avatar" aria-label="Profilis">${userFirstName ? userFirstName[0].toUpperCase() : '?'}</button>
  </div>
  <div id="drawer-backdrop" class="backdrop ${menuOpen ? 'open' : ''}"></div>
  <nav id="drawer" class="drawer ${menuOpen ? 'open' : ''}">
    <ul class="menu">
      ${MENU.map(m => `<li><button class="menu-item ${currentScreen === m.id ? 'active' : ''}" data-screen="${m.id}"><span>${m.icon}</span> ${m.label}</button></li>`).join('')}
    </ul>
    <div class="drawer-bottom">
      <div class="company-select">
        <label>Įmonė</label>
        <select id="company-select"></select>
      </div>
      <button id="logout" class="btn-outline">Atsijungti</button>
    </div>
  </nav>
  <main id="screen" class="screen"></main>
  <div id="profile-pop" class="profile-pop hidden"></div>
  `;
}

function homeScreen(): string {
  return `
  <div class="card balance">
    <div class="muted">Bendras likutis</div>
    <div class="amount">— €</div>
    <div class="muted small">Duomenys dar neįvesti — sistema ruošiama</div>
  </div>
  <div class="card">
    <h3>Paskutinės operacijos</h3>
    <p class="muted">Kol kas tuščia. Pirmieji duomenys atsiras, kai prijungsime įrašus.</p>
  </div>
  <div class="card">
    <h3>Greiti veiksmai</h3>
    <div class="quick-actions">
      <button class="quick" data-screen="new">➕ Naujas įrašas</button>
      <button class="quick" data-screen="documents">📄 Dokumentai</button>
    </div>
  </div>`;
}

function placeholderScreen(title: string, note: string): string {
  return `<div class="card"><h2>${title}</h2><p class="muted">${note}</p></div>`;
}

function renderScreen() {
  const s = document.getElementById('screen')!;
  s.innerHTML =
    currentScreen === 'home' ? homeScreen() :
    currentScreen === 'documents' ? placeholderScreen('Dokumentai', 'Čia bus dokumentų sąrašas iš Google Drive su atpažinimo būsena.') :
    currentScreen === 'new' ? placeholderScreen('Naujas įrašas', 'Greito įrašo forma: sąskaita / sąnauda / mokėjimas.') :
    currentScreen === 'reports' ? placeholderScreen('Ataskaitos', 'Pajamų/išlaidų ataskaitos, PVM suvestinės.') :
    placeholderScreen('Nustatymai', 'Įmonės duomenys, PVM, naudotojai.');
}

function bindShell() {
  const burger = document.getElementById('burger')!;
  const drawer = document.getElementById('drawer')!;
  const backdrop = document.getElementById('drawer-backdrop')!;
  burger.onclick = () => { menuOpen = !menuOpen; drawer.classList.toggle('open', menuOpen); backdrop.classList.toggle('open', menuOpen); };
  backdrop.onclick = () => { menuOpen = false; drawer.classList.remove('open'); backdrop.classList.remove('open'); };
  document.getElementById('logout')!.onclick = async () => { await supabase.auth.signOut(); location.reload(); };
  document.querySelectorAll('.menu-item').forEach(el => {
    (el as HTMLElement).onclick = () => {
      currentScreen = (el as HTMLElement).dataset.screen!;
      menuOpen = false;
      drawer.classList.remove('open'); backdrop.classList.remove('open');
      document.querySelectorAll('.menu-item').forEach(m => m.classList.toggle('active', (m as HTMLElement).dataset.screen === currentScreen));
      renderScreen();
    };
  });
  const avatar = document.getElementById('avatar')!;
  avatar.onclick = () => {
    const pop = document.getElementById('profile-pop')!;
    if (!pop.classList.contains('hidden')) { pop.classList.add('hidden'); return; }
    pop.innerHTML = `<div class="card"><h3>${userFirstName || 'Naudotojas'}</h3><p class="muted">${currentCompany?.name ?? ''} — ${currentCompany?.role ?? ''}</p><button id="pop-logout" class="btn-outline">Atsijungti</button></div>`;
    pop.classList.remove('hidden');
    (document.getElementById('pop-logout')!).onclick = async () => { await supabase.auth.signOut(); location.reload(); };
  };
  const sel = document.getElementById('company-select') as HTMLSelectElement;
  const selWrap = sel.parentElement!;
  if (companies.length > 1) {
    sel.innerHTML = companies.map(c => `<option value="${c.id}" ${c.id === currentCompany?.id ? 'selected' : ''}>${c.name}</option>`).join('');
    sel.onchange = () => { currentCompany = companies.find(c => c.id === sel.value)!; renderApp(); };
  } else {
    selWrap.innerHTML = `<div class="company-label">${currentCompany?.name ?? '—'}</div>`;
  }
}

let companies: { id: string; name: string; role: string }[] = [];

function renderApp() {
  app.innerHTML = shell();
  bindShell();
  renderScreen();
}

function loginView() {
  app.innerHTML = `
    <div class="card login">
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
    location.hash = '#/dashboard';
    await showCompanies();
  };
}

async function showCompanies() {
  const { data: { user } } = await supabase.auth.getUser();
  userFirstName = (user?.user_metadata?.['full_name'] as string || user?.email || '').split(/[@ ]/)[0];
  const { data: ucs, error } = await supabase
    .from('user_companies')
    .select('role, companies(id, name)')
    .eq('user_id', user!.id);
  if (error) { app.innerHTML = `<div class="card"><p>Klaida: ${error.message}</p></div>`; return; }
  companies = (ucs ?? []).map((uc: any) => ({ id: uc.companies.id, name: uc.companies.name, role: uc.role }));
  currentCompany = companies[0] ?? null;
  renderApp();
}

function boot() {
  const r = route();
  if (r === 'dashboard') {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) showCompanies(); else go('');
    });
  } else {
    // public landing; if session exists, send straight to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { go('dashboard'); return; }
      landingView();
    });
  }
}
window.addEventListener('hashchange', () => {
  if (route() === 'dashboard') boot(); else landingView();
});
boot();

function landingView() {
  const blocks = [
    { t: 'Apskaita, kuri veikia pati', b: 'Įmeskite dokumentus į Google Drive — Standartas juos paima, atpažįsta ir suveda į apskaitą. Jūs tik patvirtinate.' },
    { t: 'Kaip tai veikia', b: '1) Įmonė gauna savo dokumentų papkę. 2) Tiekėjų sąskaitos į ją keliauja savaime (el. paštu arba Drive). 3) Sistema atpažįsta duomenis, o jūs patvirtinate vienu piršto bakstelėjimu.' },
    { t: 'Kodėl verta', b: '• Nenaudojate laiko dokumentų rinkimui — sistema pati primena, ko trūksta.\n• Visada žinote, kur jūsų pinigai.\n• AI konsultantas atsako į kasdienius klausimus iškart.' },
    { t: 'Kaina', b: 'Išbandykite nemokamai. Be slaptų sąlygų, be įsipareigojimų. Mokate tik tada, kai sistema tikrai dirba jums.' },
  ];
  app.innerHTML = `
    <div class="topbar public">
      <div class="brand">Standartas</div>
      <button id="login-btn" class="btn-primary">Prisijungti</button>
    </div>
    <main class="feed">
      <div class="card hero">
        <h1>Standartas</h1>
        <p class="sub">Apskaita smulkioms įmonėms — be buhalterio prie sienos.</p>
        <button id="try-btn" class="btn-primary wide">Išbandykite nemokamai</button>
      </div>
      ${blocks.map(bl => `<div class="card"><h2>${bl.t}</h2><p>${bl.b.replace(/\n/g, '<br>')}</p></div>`).join('')}
      <div class="card cta">
        <h2>Pasirengę?</h2>
        <button id="try-btn2" class="btn-primary wide">Prisijungti / Registruotis</button>
      </div>
    </main>`;
  for (const id of ['login-btn', 'try-btn', 'try-btn2']) {
    document.getElementById(id)!.onclick = () => loginView();
  }
}
