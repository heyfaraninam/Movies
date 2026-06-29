const API_KEY  = 'ab7e49a855c8ef4a8ca8b492e1dfad80';
const TMDB     = 'https://api.themoviedb.org/3';
const IMG      = 'https://image.tmdb.org/t/p/';

// ── STATE ──
let currentView  = 'discover'; // discover | search | favorites
let currentPage  = 1;
let totalPages   = 1;
let searchQuery  = '';
let activeGenre  = '';
let sortBy       = 'popularity.desc';
let favorites    = JSON.parse(localStorage.getItem('movie_favs') || '[]');
let genres       = [];
let searchTimer  = null;

// ── DOM ──
const $grid      = document.getElementById('movies-grid');
const $loader    = document.getElementById('loader');
const $loadMore  = document.getElementById('load-more-btn');
const $searchInp = document.getElementById('search-inp');
const $secTitle  = document.getElementById('section-title');
const $secCount  = document.getElementById('section-count');
const $favCount  = document.getElementById('fav-count');
const $overlay   = document.getElementById('modal-overlay');
const $toast     = document.getElementById('toast');
const $filterScroll = document.getElementById('filter-scroll');

// ── FETCH ──
async function apiFetch(path, params={}) {
  const url = new URL(TMDB + path);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k,v));
  const res = await fetch(url);
  if (!res.ok) throw new Error('API error ' + res.status);
  return res.json();
}

// ── GENRES ──
async function loadGenres() {
  try {
    const data = await apiFetch('/genre/movie/list');
    genres = data.genres;
    renderGenreFilters();
  } catch(e) { console.warn('Genres failed', e); }
}

function renderGenreFilters() {
  const existing = $filterScroll.querySelectorAll('.filter-chip[data-genre]');
  existing.forEach(e => e.remove());
  genres.forEach(g => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip' + (activeGenre == g.id ? ' active' : '');
    chip.dataset.genre = g.id;
    chip.textContent = g.name;
    chip.onclick = () => {
      activeGenre = activeGenre == g.id ? '' : g.id;
      document.querySelectorAll('.filter-chip[data-genre]').forEach(c => c.classList.remove('active'));
      if(activeGenre) chip.classList.add('active');
      currentPage = 1; $grid.innerHTML = '';
      fetchMovies(true);
    };
    $filterScroll.appendChild(chip);
  });
}

// ── FETCH MOVIES ──
async function fetchMovies(replace=false) {
  if(currentView === 'favorites') { renderFavorites(); return; }
  setLoading(true);
  try {
    let data;
    if(currentView === 'search' && searchQuery) {
      data = await apiFetch('/search/movie', {
        query: searchQuery, page: currentPage, include_adult: false
      });
    } else {
      const params = { page: currentPage, sort_by: sortBy, include_adult: false, 'vote_count.gte': 50 };
      if(activeGenre) params.with_genres = activeGenre;
      data = await apiFetch('/discover/movie', params);
    }
    totalPages = Math.min(data.total_pages, 500);
    $secCount.textContent = data.total_results?.toLocaleString() + ' movies';
    if(replace) $grid.innerHTML = '';
    renderCards(data.results, replace);
    $loadMore.classList.toggle('show', currentPage < totalPages);
  } catch(e) {
    showError();
  } finally {
    setLoading(false);
  }
}

// ── RENDER CARDS ──
function renderCards(movies, isReplace=false) {
  if(!movies.length && isReplace) {
    $grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🎬</div><div class="empty-txt">No movies found.<br/>Try a different search.</div></div>`;
    return;
  }
  movies.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = (i % 20 * 0.04) + 's';
    const isFav = favorites.some(f => f.id === m.id);
    const poster = m.poster_path
      ? `<img class="card-poster" src="${IMG}w342${m.poster_path}" alt="${m.title}" loading="lazy"/>`
      : `<div class="card-poster-placeholder">🎬</div>`;
    const year = m.release_date ? m.release_date.slice(0,4) : '—';
    const rating = m.vote_average ? m.vote_average.toFixed(1) : '—';
    card.innerHTML = `
      ${poster}
      <div class="fav-badge ${isFav?'active':''}" title="${isFav?'Remove from favorites':'Add to favorites'}">
        ${isFav?'❤️':'🤍'}
      </div>
      <div class="card-body">
        <div class="card-title">${m.title}</div>
        <div class="card-meta">
          <div class="card-rating">★ ${rating}</div>
          <div class="card-year">${year}</div>
        </div>
      </div>`;
    card.querySelector('.fav-badge').addEventListener('click', e => {
      e.stopPropagation();
      toggleFav(m, card.querySelector('.fav-badge'));
    });
    card.addEventListener('click', () => openModal(m.id));
    $grid.appendChild(card);
  });
}

// ── MODAL ──
async function openModal(id) {
  try {
    const [details, credits, videos] = await Promise.all([
      apiFetch(`/movie/${id}`, {append_to_response:''}),
      apiFetch(`/movie/${id}/credits`),
      apiFetch(`/movie/${id}/videos`)
    ]);
    renderModal(details, credits, videos);
    $overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  } catch(e) { toast('Could not load movie details', 'pink'); }
}

function renderModal(m, credits, videos) {
  const isFav = favorites.some(f => f.id === m.id);
  const year = m.release_date ? m.release_date.slice(0,4) : '—';
  const runtime = m.runtime ? `${Math.floor(m.runtime/60)}h ${m.runtime%60}m` : '—';
  const trailer = videos.results?.find(v => v.type==='Trailer' && v.site==='YouTube');
  const cast = (credits.cast || []).slice(0,12);
  const backdropUrl = m.backdrop_path ? `${IMG}w1280${m.backdrop_path}` : '';
  const posterUrl   = m.poster_path   ? `${IMG}w342${m.poster_path}`   : '';

  document.getElementById('modal-backdrop-img').src = backdropUrl;
  document.getElementById('modal-backdrop-img').style.display = backdropUrl ? '' : 'none';

  const posterEl = document.getElementById('modal-poster');
  const posterPh = document.getElementById('modal-poster-ph');
  if(posterUrl){ posterEl.src=posterUrl; posterEl.style.display=''; posterPh.style.display='none'; }
  else { posterEl.style.display='none'; posterPh.style.display='flex'; }

  document.getElementById('modal-title').textContent   = m.title;
  document.getElementById('modal-rating').innerHTML    = `★ ${m.vote_average?.toFixed(1)||'—'} <span style="font-size:10px;color:var(--text-dimmer);font-weight:400">(${m.vote_count?.toLocaleString()||0})</span>`;
  document.getElementById('modal-year').textContent    = year;
  document.getElementById('modal-runtime').textContent = runtime;
  document.getElementById('modal-lang').textContent    = (m.original_language||'').toUpperCase();
  document.getElementById('modal-overview').textContent= m.overview || 'No overview available.';

  // genres
  const genreEl = document.getElementById('modal-genres');
  genreEl.innerHTML = (m.genres||[]).map(g=>`<span class="modal-genre">${g.name}</span>`).join('');

  // cast
  const castEl = document.getElementById('modal-cast');
  castEl.innerHTML = cast.map(c => {
    const img = c.profile_path
      ? `<img class="cast-img" src="${IMG}w185${c.profile_path}" alt="${c.name}" loading="lazy"/>`
      : `<div class="cast-img-ph">🎭</div>`;
    return `<div class="cast-card">${img}<div class="cast-name">${c.name}</div><div class="cast-char">${c.character||''}</div></div>`;
  }).join('');
  document.getElementById('cast-section').style.display = cast.length ? '' : 'none';

  // trailer btn
  const trailerBtn = document.getElementById('btn-trailer');
  if(trailer){
    trailerBtn.style.display = 'flex';
    trailerBtn.onclick = () => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
  } else {
    trailerBtn.style.display = 'none';
  }

  // fav btn
  const favBtn = document.getElementById('btn-fav-modal');
  favBtn.className = 'modal-btn btn-fav' + (isFav?' active':'');
  favBtn.innerHTML = (isFav?'❤️':'🤍') + ' ' + (isFav?'Saved':'Save');
  favBtn.onclick = () => {
    toggleFavById(m);
    const nowFav = favorites.some(f=>f.id===m.id);
    favBtn.className = 'modal-btn btn-fav'+(nowFav?' active':'');
    favBtn.innerHTML = (nowFav?'❤️':'🤍')+' '+(nowFav?'Saved':'Save');
  };
}

function closeModal() {
  $overlay.classList.remove('open');
  document.body.style.overflow = '';
}
$overlay.addEventListener('click', e => { if(e.target===$overlay) closeModal(); });
document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

// ── FAVORITES ──
function toggleFav(movie, badgeEl) {
  const idx = favorites.findIndex(f => f.id === movie.id);
  if(idx > -1) {
    favorites.splice(idx,1);
    if(badgeEl){ badgeEl.textContent='🤍'; badgeEl.classList.remove('active'); }
    toast('Removed from favorites', 'pink');
  } else {
    favorites.push(movie);
    if(badgeEl){ badgeEl.textContent='❤️'; badgeEl.classList.add('active'); }
    toast('Added to favorites ❤️', 'green');
  }
  saveFavs();
}

function toggleFavById(movie) {
  const idx = favorites.findIndex(f => f.id === movie.id);
  if(idx > -1){ favorites.splice(idx,1); toast('Removed from favorites','pink'); }
  else { favorites.push(movie); toast('Added to favorites ❤️','green'); }
  saveFavs();
  if(currentView==='favorites') renderFavorites();
}

function saveFavs() {
  localStorage.setItem('movie_favs', JSON.stringify(favorites));
  $favCount.textContent = favorites.length || '';
  $favCount.style.display = favorites.length ? '' : 'none';
}

function renderFavorites() {
  $secTitle.textContent = 'Favorites';
  $secCount.textContent = favorites.length + ' saved';
  $loadMore.classList.remove('show');
  $grid.innerHTML = '';
  if(!favorites.length){
    $grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🤍</div><div class="empty-txt">No favorites yet.<br/>Heart a movie to save it here.</div></div>`;
    return;
  }
  renderCards(favorites);
}

// ── VIEWS ──
function setView(view) {
  currentView = view;
  currentPage = 1;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('nav-'+view)?.classList.add('active');

  if(view==='discover'){
    $secTitle.textContent = 'Discover';
    document.querySelector('.filters-bar').style.display='';
    fetchMovies(true);
  } else if(view==='search'){
    $secTitle.textContent = 'Search Results';
    document.querySelector('.filters-bar').style.display='';
    fetchMovies(true);
  } else if(view==='favorites'){
    $secTitle.textContent = 'Favorites';
    document.querySelector('.filters-bar').style.display='none';
    renderFavorites();
  }
}

// ── SEARCH ──
$searchInp.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = $searchInp.value.trim();
    currentPage = 1;
    if(searchQuery){ currentView='search'; $secTitle.textContent='Search Results'; }
    else { currentView='discover'; $secTitle.textContent='Discover'; }
    fetchMovies(true);
  }, 400);
});

// ── SORT ──
document.getElementById('sort-select').addEventListener('change', function(){
  sortBy = this.value; currentPage=1; fetchMovies(true);
});

// ── LOAD MORE ──
function loadMore() {
  if(currentPage < totalPages){ currentPage++; fetchMovies(false); }
}

// ── HELPERS ──
function setLoading(v){
  $loader.classList.toggle('show', v);
  $loadMore.style.visibility = v ? 'hidden' : 'visible';
}
function showError(){
  $grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">⚠️</div><div class="empty-txt">Could not load movies.<br/>Check your TMDB API key in app.js</div></div>`;
}

let toastT;
function toast(msg, type=''){
  $toast.textContent=msg;
  $toast.className='toast show '+type;
  clearTimeout(toastT);
  toastT=setTimeout(()=>$toast.className='toast',2200);
}

// ── EXPOSE ──
window.closeModal = closeModal;
window.loadMore   = loadMore;
window.setView    = setView;

// ── BOOT ──
saveFavs();
loadGenres();
fetchMovies(true);
