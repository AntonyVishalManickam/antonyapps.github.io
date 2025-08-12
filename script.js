// script.js
// Client-only app renderer + local rating system using localStorage
// localStorage key: 'smaiv_ratings_v1'
// Structure:
// {
//   "appId1": { sum: 17, count: 4, userRating: 4 }, // userRating = current user's rating for this app (1..5) or null
//   ...
// }

const GRID = document.getElementById('grid');
const SEARCH = document.getElementById('search');
const TABS = document.querySelectorAll('.tab');

let currentCategory = 'all';

const STORAGE_KEY = 'smaiv_ratings_v1';
function loadRatings(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch(e){ return {}; }
}
function saveRatings(obj){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

// init: if app has initial 'rating' we can seed ratings map when none present
function seedInitialRatings(){
  const r = loadRatings();
  let changed = false;
  for(const a of apps){
    if(!r[a.id]){
      // seed with the initial "rating" as count=1 for display purposes
      const v = Math.max(0, Number(a.rating) || 0);
      if(v > 0){
        r[a.id] = { sum: parseFloat((v).toFixed(1)), count: 1, userRating: null };
      } else {
        r[a.id] = { sum: 0, count: 0, userRating: null };
      }
      changed = true;
    }
  }
  if(changed) saveRatings(r);
}
seedInitialRatings();

function getAverage(appId){
  const r = loadRatings()[appId];
  if(!r || !r.count) return { avg: 0, count: 0 };
  return { avg: +(r.sum / r.count).toFixed(2), count: r.count };
}

function userRatingFor(appId){
  const r = loadRatings()[appId];
  return r ? r.userRating || null : null;
}

function renderGrid(){
  const q = (SEARCH.value||'').trim().toLowerCase();
  GRID.innerHTML = '';
  const filtered = apps.filter(app => {
    if(currentCategory !== 'all' && app.category !== currentCategory) return false;
    if(!q) return true;
    return (app.name + app.developer + (app.short||'') + (app.tags||[]).join(' ')).toLowerCase().includes(q);
  });

  if(filtered.length === 0){
    GRID.innerHTML = `<div style="grid-column:1/-1;padding:36px;border-radius:12px;background:rgba(255,255,255,0.02);text-align:center;color:var(--muted)">No apps found.</div>`;
    return;
  }

  for(const app of filtered){
    const avg = getAverage(app.id);
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <div class="row">
        <div class="icon">${app.image ? `<img src="${app.image}" alt="${escapeHtml(app.name)}" />` : '&#128241;'}</div>
        <div style="flex:1">
          <h3>${escapeHtml(app.name)}</h3>
          <div class="small">${escapeHtml(app.developer)} · ${avg.avg ? avg.avg : '—'} ★ · ${escapeHtml(app.size)}</div>
          <div class="tags">${(app.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn ghost" data-id="${app.id}" onclick="openDetail('${app.id}')">Details</button>
        <a class="btn primary" href="${app.download || '#'}" target="_blank" rel="noopener" onclick="trackDownload('${app.id}')">Download</a>
      </div>
    `;
    GRID.appendChild(el);
  }
}

function openDetail(id){
  const app = apps.find(a=>a.id===id);
  if(!app) return;
  const modal = document.getElementById('modal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');

  document.getElementById('modalIcon').innerHTML = app.image ? `<img src="${app.image}" alt="${escapeHtml(app.name)}" style="width:84px;height:84px;object-fit:cover" />` : '&#128241;';
  document.getElementById('modalTitle').textContent = app.name;
  const avg = getAverage(id);
  document.getElementById('modalMeta').textContent = `${app.developer} · ${avg.avg ? avg.avg : '—'} ★ · ${app.size} · ${avg.count} vote${avg.count!==1?'s':''}`;
  document.getElementById('modalDesc').textContent = app.short || '';

  const tagWrap = document.getElementById('modalTags');
  tagWrap.innerHTML = '';
  (app.tags || [app.category]).forEach(t => {
    const s = document.createElement('span'); s.className='tag'; s.textContent = t; tagWrap.appendChild(s);
  });

  // download link
  const dl = document.getElementById('modalDownload');
  dl.href = app.download || '#';

  // rating UI
  renderRatingUI(id);
}

function closeModal(){
  const modal = document.getElementById('modal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', (ev)=>{
  if(ev.target.id === 'modal') closeModal();
});

// rating UI rendering + handlers
function renderRatingUI(appId){
  const container = document.getElementById('ratingStars');
  const info = document.getElementById('ratingInfo');
  container.innerHTML = '';
  const r = loadRatings()[appId] || {sum:0,count:0,userRating:null};
  const avg = r.count ? +(r.sum / r.count).toFixed(2) : 0;
  info.textContent = `Average: ${avg ? avg : '—'} · ${r.count} vote${r.count!==1?'s':''}`;

  const userPrev = r.userRating || null;

  for(let i=1;i<=5;i++){
    const span = document.createElement('span');
    span.className = 'star' + (userPrev && i <= userPrev ? ' active' : '');
    span.innerHTML = '★';
    span.title = `${i} star`;
    span.style.cursor = 'pointer';
    span.addEventListener('click', ()=> submitRating(appId, i));
    container.appendChild(span);
  }
}

// submit rating (handles new rating and changes)
function submitRating(appId, newRating){
  if(newRating < 1 || newRating > 5) return;
  const r = loadRatings();
  if(!r[appId]) r[appId] = {sum:0,count:0,userRating:null};

  const entry = r[appId];
  const prev = entry.userRating;

  if(prev){
    // replace previous rating
    entry.sum = +(entry.sum - prev + newRating);
    // count remains same
  } else {
    // new rating
    entry.sum = +(entry.sum + newRating);
    entry.count = (entry.count||0) + 1;
  }
  entry.userRating = newRating;
  // ensure numeric stored with reasonable decimals
  if(typeof entry.sum === 'number') entry.sum = +entry.sum.toFixed(2);

  r[appId] = entry;
  saveRatings(r);
  // update modal info and grid values
  renderRatingUI(appId);
  renderGrid();
  // small notification
  flashMessage('Thanks! Your rating was saved in your browser.');
}

function trackDownload(id){
  // placeholder: you can connect analytics if you like
  console.log('download', id);
}

function flashMessage(txt){
  const el = document.createElement('div');
  el.textContent = txt;
  el.style.position = 'fixed';
  el.style.bottom = '92px';
  el.style.left = '50%';
  el.style.transform = 'translateX(-50%)';
  el.style.background = '#111827';
  el.style.color = '#fff';
  el.style.padding = '10px 14px';
  el.style.borderRadius = '10px';
  el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 2400);
}

// tab handling
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click',(e)=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat || 'all';
    renderGrid();
  });
});

// search
SEARCH.addEventListener('input', ()=> renderGrid());

// util
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// initial render
renderGrid();

// keyboard close modal
document.addEventListener('keydown', e=>{ if(e.key === 'Escape') closeModal(); });
