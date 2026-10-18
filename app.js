/* SlopCloud — Sloppy Joes songs and a message board.
   All content comes from music.js. No build step. */
(() => {
  'use strict';

  const DATA = window.SLOPCLOUD || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = s => String(s || '').replace(/['’]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'song';
  const hash = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fmt = t => { if (!isFinite(t) || t < 0) t = 0; return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`; };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('slopcloud:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('slopcloud:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
  };

  // ---------- Icons ----------
  const S = d => `<g class="s">${d}</g>`;
  const ICONS = {
    play: '<path d="M7 4.6v14.8a1 1 0 0 0 1.52.85l12.1-7.4a1 1 0 0 0 0-1.7L8.52 3.75A1 1 0 0 0 7 4.6z"/>',
    pause: '<rect x="5.5" y="4" width="4.5" height="16" rx="1.5"/><rect x="14" y="4" width="4.5" height="16" rx="1.5"/>',
    next: '<path d="M4.5 5.3v13.4a1 1 0 0 0 1.55.83L15.5 13.3V18.5a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1v-13a1 1 0 0 0-1-1h-1.5a1 1 0 0 0-1 1v5.2L6.05 4.47A1 1 0 0 0 4.5 5.3z"/>',
    prev: '<g transform="matrix(-1 0 0 1 24 0)"><path d="M4.5 5.3v13.4a1 1 0 0 0 1.55.83L15.5 13.3V18.5a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1v-13a1 1 0 0 0-1-1h-1.5a1 1 0 0 0-1 1v5.2L6.05 4.47A1 1 0 0 0 4.5 5.3z"/></g>',
    shuffle: S('<path d="M17 3.5h3.5V7"/><path d="M3.5 18.5h2.6a4 4 0 0 0 3.3-1.75l5.2-7.5A4 4 0 0 1 17.9 7.5h2.6"/><path d="M17 20.5h3.5V17"/><path d="M3.5 5.5h2.6a4 4 0 0 1 3.3 1.75l.9 1.3M13.7 15.4l.9 1.3a4 4 0 0 0 3.3 1.8h2.6"/>'),
    repeat: S('<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11.5V10a4 4 0 0 1 4-4h13"/><path d="M7 21.5 3.5 18 7 14.5"/><path d="M20.5 12.5V14a4 4 0 0 1-4 4h-13"/>'),
    repeatOne: S('<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11.5V10a4 4 0 0 1 4-4h13"/><path d="M7 21.5 3.5 18 7 14.5"/><path d="M20.5 12.5V14a4 4 0 0 1-4 4h-13"/>') + '<path d="M11 10.2h1.6v5.3h-1.4v-3.8l-.9.5-.4-1.1z"/>',
    down: S('<path d="m6 9 6 6 6-6"/>'),
    share: S('<path d="M12 3.5v12M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'),
    link: S('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>'),
    external: S('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>'),
    note: S('<path d="M9 18V5.5l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/>'),
    up: S('<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>'),
    chat: S('<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l.9-4.4A8 8 0 1 1 20 12z"/>'),
    pen: S('<path d="M4 20h4L19.3 8.7a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14.5 7.5 3 3"/>'),
  };
  const I = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  const EQ = '<span class="eq"><i></i><i></i><i></i></span>';

  // ---------- Songs ----------
  const ARTIST = DATA.artist || 'Me';
  const parseDur = d => typeof d === 'number' ? d : (typeof d === 'string' && d.includes(':')) ? d.split(':').reduce((a, b) => a * 60 + +b, 0) : null;
  const usedIds = new Set();
  const songs = (DATA.songs || []).filter(s => s.file).map((s, i) => {
    let id = s.id ? slug(s.id) : slug(s.title);
    while (usedIds.has(id)) id += '-' + (i + 1);
    usedIds.add(id);
    return { ...s, id, i, artist: s.artist || ARTIST, cover: s.cover || DATA.cover || '', duration: parseDur(s.duration) };
  });
  const byId = new Map(songs.map(s => [s.id, s]));
  const flagged = songs.filter(s => s.new);
  const newReleases = (flagged.length ? flagged : songs).slice(0, 3);
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  // ---------- Durations (read from the files once, cached) ----------
  const durCache = store.get('dur', {});
  const durOf = s => s.duration ?? durCache[s.file];
  const probeQueue = [];
  let probing = false;
  function probeDurations() {
    songs.forEach(s => { if (durOf(s) == null && !probeQueue.includes(s)) probeQueue.push(s); });
    if (probing) return;
    const step = () => {
      const s = probeQueue.shift();
      if (!s) { probing = false; return; }
      probing = true;
      const a = new Audio();
      a.preload = 'metadata';
      const done = () => { a.removeAttribute('src'); a.load(); setTimeout(step, 30); };
      a.onloadedmetadata = () => { if (isFinite(a.duration)) { durCache[s.file] = Math.round(a.duration); store.set('dur', durCache); refreshDurations(); } done(); };
      a.onerror = done;
      a.src = s.file;
    };
    step();
  }
  function totalText() {
    const sum = songs.reduce((t, s) => t + (durOf(s) || 0), 0);
    if (!sum) return plural(songs.length, 'song');
    const h = Math.floor(sum / 3600), m = Math.round((sum % 3600) / 60);
    return `${plural(songs.length, 'song')} · ${h ? `${h} hr ` : ''}${m} min`;
  }
  function refreshDurations() {
    $$('[data-dur]').forEach(el => { const s = byId.get(el.dataset.dur); if (s && durOf(s) != null) el.textContent = fmt(durOf(s)); });
    const tot = $('#total');
    if (tot) tot.textContent = totalText();
  }

  // ---------- Covers ----------
  const grad = key => { const h = hash(key) % 360; return `linear-gradient(135deg,hsl(${h} 70% 58%),hsl(${(h + 60) % 360} 65% 28%))`; };
  const cover = (s, cls = '') => `<div class="cover ${cls}" style="background:${grad(s.title)}"><span>${esc((s.title || '♪').trim()[0])}</span>${s.cover ? `<img src="${esc(s.cover)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : ''}</div>`;

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  // ---------- Views ----------
  const view = $('#view');
  const brandBar = () => `<header class="top"><a class="brand" href="#/"><img src="brand/logo.png" alt="SlopCloud" width="434" height="76"></a></header>`;

  function songsView() {
    const featuredIds = new Set(newReleases.map(s => s.id));
    const rest = songs.filter(s => !featuredIds.has(s.id));
    const releaseCard = (s, n) => `
      <article class="release" data-play-id="${s.id}" data-id="${s.id}">
        <div class="art">
          ${cover(s, n === 0 ? 'full' : 'half')}
          <button class="fab" data-toggle-id="${s.id}" aria-label="Play ${esc(s.title)}">${I('play')}</button>
        </div>
        <div class="info">
          <div class="t">${esc(s.title)}</div>
          <button class="icon-btn" data-share="${s.id}" aria-label="Share ${esc(s.title)}">${I('share')}</button>
        </div>
      </article>`;
    return `
      ${brandBar()}
      ${newReleases.length ? `<section class="releases">${newReleases.map(releaseCard).join('')}</section>` : ''}
      <ol class="songs">${rest.map(s => `
        <li class="song" data-i="${s.i}" data-id="${s.id}">
          <span class="num">${s.n ?? s.i + 1}</span>${EQ}
          ${cover(s, 'sm')}
          <div class="meta">
            <div class="t">${esc(s.title)}</div>
            <div class="s" data-dur="${s.id}">${durOf(s) != null ? fmt(durOf(s)) : ''}</div>
          </div>
          <button class="icon-btn" data-share="${s.id}" aria-label="Share ${esc(s.title)}">${I('share')}</button>
        </li>`).join('')}
      </ol>`;
  }

  // ---------- Write It Down (message board) ----------
  const DB = DATA.notes || {};
  const dbReady = !!(DB.supabaseUrl && DB.supabaseKey);
  const api = async (path, opts = {}) => {
    const headers = { apikey: DB.supabaseKey, 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (DB.supabaseKey.startsWith('eyJ')) headers.Authorization = 'Bearer ' + DB.supabaseKey; // legacy anon keys
    const r = await fetch(DB.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/' + path, { ...opts, headers });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.status === 204 ? null : r.json();
  };

  let posts = null;          // loaded posts
  let basicBoard = false;    // true until the votes/comments SQL has been run
  let boardSort = store.get('boardSort', 'new');
  let voted = new Set(store.get('voted', []));
  const openThreads = new Set();
  let boardTimer = null;

  function timeAgo(iso) {
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return 'now';
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 86400 * 7) return `${Math.floor(s / 86400)}d`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  async function loadPosts() {
    if (!dbReady) throw new Error('not configured');
    try {
      posts = await api('notes?select=id,created_at,name,message,votes,comments(id,created_at,name,message)&order=created_at.desc&comments.order=created_at.asc&limit=300');
      basicBoard = false;
    } catch {
      posts = await api('notes?select=id,created_at,name,message&order=created_at.desc&limit=300');
      basicBoard = true;
    }
  }

  const postHTML = p => {
    const comments = p.comments || [];
    const open = openThreads.has(p.id);
    return `<article class="post" data-post="${p.id}">
      <div class="post-head"><b>${esc(p.name || 'Anonymous')}</b><time datetime="${esc(p.created_at)}">${timeAgo(p.created_at)}</time></div>
      <p class="post-body">${esc(p.message)}</p>
      ${basicBoard ? '' : `<div class="post-actions">
        <button class="pill ${voted.has(p.id) ? 'on' : ''}" data-vote="${p.id}" aria-label="Upvote">${I('up')}<span>${p.votes || 0}</span></button>
        <button class="pill ${open ? 'on' : ''}" data-thread="${p.id}" aria-label="Comments">${I('chat')}<span>${comments.length}</span></button>
      </div>
      ${open ? `<div class="thread">
        ${comments.map(c => `<div class="comment"><div class="post-head"><b>${esc(c.name || 'Anonymous')}</b><time>${timeAgo(c.created_at)}</time></div><p class="post-body">${esc(c.message)}</p></div>`).join('')}
        <form class="reply" data-reply="${p.id}" autocomplete="off">
          <input name="name" maxlength="40" placeholder="Name" value="${esc(store.get('noteName', ''))}">
          <div class="reply-row"><input name="message" maxlength="300" placeholder="Add a comment" required><button class="btn-post sm" type="submit">Reply</button></div>
        </form>
      </div>` : ''}`}
    </article>`;
  };

  function sortedPosts() {
    const list = (posts || []).slice();
    if (boardSort === 'top' && !basicBoard) list.sort((a, b) => (b.votes || 0) - (a.votes || 0) || b.created_at.localeCompare(a.created_at));
    return list;
  }

  function renderPosts() {
    const el = $('#posts');
    if (!el) return;
    $$('[data-sort]').forEach(b => b.classList.toggle('on', b.dataset.sort === boardSort));
    $('.board-sort').hidden = basicBoard;
    if (!posts) { el.innerHTML = `<div class="board-msg">${dbReady ? 'Loading…' : 'The board isn\'t connected yet.'}</div>`; return; }
    el.innerHTML = posts.length ? sortedPosts().map(postHTML).join('') : '<div class="board-msg">Nothing here yet. Be the first.</div>';
  }

  async function refreshBoard() {
    // don't wipe a comment someone is typing
    if ($$('.reply input[name="message"]').some(i => i.value || document.activeElement === i)) return;
    try { await loadPosts(); renderPosts(); }
    catch { if (!posts) { const el = $('#posts'); if (el) el.innerHTML = '<div class="board-msg">Couldn\'t load posts. Try again in a bit.</div>'; } }
  }

  function boardView() {
    return `
      ${brandBar()}
      <form class="composer" id="post-form" autocomplete="off">
        <input name="name" maxlength="40" placeholder="Name" value="${esc(store.get('noteName', ''))}">
        <textarea name="message" maxlength="500" rows="3" placeholder="Write it down…" required></textarea>
        <input name="website" class="hp" tabindex="-1" aria-hidden="true">
        <div class="composer-foot"><span class="count" id="count">0/500</span><button class="btn-post" type="submit">Post</button></div>
      </form>
      <div class="board-sort"><button data-sort="new">New</button><button data-sort="top">Top</button></div>
      <div id="posts"></div>`;
  }

  const cooldown = (key, ms) => {
    const wait = ms - (Date.now() - store.get(key, 0));
    if (wait > 0) { toast(`Hang on ${Math.ceil(wait / 1000)}s`); return true; }
    return false;
  };

  function bindBoard() {
    const form = $('#post-form');
    form.message.addEventListener('input', () => { $('#count').textContent = `${form.message.value.length}/500`; });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const message = form.message.value.trim(), name = form.name.value.trim().slice(0, 40);
      if (form.website.value || !message || cooldown('lastPost', 20000)) return;
      const btn = $('.btn-post', form);
      btn.disabled = true;
      try {
        const [saved] = await api('notes', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ name: name || null, message: message.slice(0, 500) }) });
        store.set('lastPost', Date.now());
        store.set('noteName', name);
        posts = [{ votes: 0, comments: [], ...saved }, ...(posts || [])];
        form.message.value = '';
        $('#count').textContent = '0/500';
        renderPosts();
      } catch { toast('Couldn\'t post. Try again.'); }
      finally { btn.disabled = false; }
    });
  }

  view.addEventListener('submit', async e => {
    const form = e.target.closest('[data-reply]');
    if (!form) return;
    e.preventDefault();
    const id = form.dataset.reply;
    const message = form.message.value.trim(), name = form.name.value.trim().slice(0, 40);
    if (!message || cooldown('lastComment', 8000)) return;
    const btn = $('button', form);
    btn.disabled = true;
    try {
      const [saved] = await api('comments', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ note_id: id, name: name || null, message: message.slice(0, 300) }) });
      store.set('lastComment', Date.now());
      store.set('noteName', name);
      const p = posts.find(x => x.id === id);
      p.comments = [...(p.comments || []), saved];
      renderPosts();
    } catch { toast('Couldn\'t comment. Try again.'); btn.disabled = false; }
  });

  view.addEventListener('click', async e => {
    const el = e.target.closest('[data-vote],[data-thread],[data-sort]');
    if (!el) return;
    const d = el.dataset;
    if ('sort' in d) { boardSort = d.sort; store.set('boardSort', boardSort); return renderPosts(); }
    if ('thread' in d) { openThreads.has(d.thread) ? openThreads.delete(d.thread) : openThreads.add(d.thread); return renderPosts(); }
    if ('vote' in d) {
      const id = d.vote, p = posts.find(x => x.id === id);
      const delta = voted.has(id) ? -1 : 1;
      // update right away, undo if the server says no
      delta > 0 ? voted.add(id) : voted.delete(id);
      p.votes = Math.max(0, (p.votes || 0) + delta);
      store.set('voted', [...voted]);
      renderPosts();
      try {
        const n = await api('rpc/vote_note', { method: 'POST', body: JSON.stringify({ note_id: id, delta }) });
        if (typeof n === 'number') { p.votes = n; renderPosts(); }
      } catch {
        delta > 0 ? voted.delete(id) : voted.add(id);
        p.votes = Math.max(0, p.votes - delta);
        store.set('voted', [...voted]);
        renderPosts();
        toast('Couldn\'t vote. Try again.');
      }
    }
  });

  // ---------- Router ----------
  const scrollPos = {};
  let currentPage = '';

  function render() {
    if (currentPage) scrollPos[currentPage] = view.scrollTop;
    const parts = (location.hash || '#/').slice(2).split('/');
    let page = parts[0] || 'songs';

    // Shared song link: #/song/<id>
    if (page === 'song') {
      const s = byId.get(decodeURIComponent(parts[1] || ''));
      history.replaceState(null, '', '#/');
      page = 'songs';
      if (s) { setTimeout(() => { if (P.track !== s) playSong(s.i); openNP(); }, 50); }
      else toast('That song isn\'t here anymore');
    }
    if (page !== 'board') page = 'songs';

    currentPage = page;
    view.innerHTML = page === 'board' ? boardView() : songsView();
    view.dataset.page = page;
    $$('#tabbar a').forEach(a => a.classList.toggle('active', a.dataset.tab === page));
    view.scrollTop = scrollPos[page] || 0;

    clearInterval(boardTimer);
    if (page === 'board') {
      bindBoard();
      renderPosts();
      refreshBoard();
      boardTimer = setInterval(refreshBoard, 30000);
    }
    markPlaying();
  }

  // ---------- Player ----------
  const audio = $('#audio');
  const P = { order: [], pos: -1, track: null, shuffle: store.get('shuffle', false), repeat: store.get('repeat', 'off') };
  const cur = () => songs[P.order[P.pos]];

  function buildOrder(start) {
    const idx = songs.map((_, i) => i);
    if (P.shuffle) {
      for (let i = idx.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [idx[i], idx[j]] = [idx[j], idx[i]]; }
      if (start != null) { idx.splice(idx.indexOf(start), 1); idx.unshift(start); }
      P.order = idx; P.pos = 0;
    } else { P.order = idx; P.pos = start ?? 0; }
  }

  function playSong(i) {
    if (!songs.length) return;
    buildOrder(i != null ? i : (P.shuffle ? Math.random() * songs.length | 0 : 0));
    load(cur(), true);
  }

  function load(s, autoplay = true, startAt = 0) {
    if (!s) return;
    P.track = s;
    audio.src = s.file;
    if (startAt) audio.addEventListener('loadedmetadata', () => { try { audio.currentTime = startAt; } catch { /* ignore */ } updateProgress(); }, { once: true });
    if (autoplay) audio.play().catch(() => setPlayingUI());
    updatePlayerUI();
    updateMediaSession();
    saveState();
  }

  function togglePlay() {
    if (!P.track) return playSong(0);
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
  }

  function next(auto = false) {
    if (!P.track) return;
    if (auto && P.repeat === 'one') { audio.currentTime = 0; audio.play().catch(() => {}); return; }
    if (P.pos < P.order.length - 1) { P.pos++; return load(cur(), true); }
    if (P.repeat === 'all' && P.shuffle) buildOrder(); else P.pos = 0;
    load(cur(), P.repeat === 'all' || !auto);
  }

  function prev() {
    if (!P.track) return;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    if (P.pos > 0) P.pos--;
    else if (P.repeat === 'all') P.pos = P.order.length - 1;
    else { audio.currentTime = 0; return; }
    load(cur(), true);
  }

  function setShuffle(v) {
    P.shuffle = v;
    store.set('shuffle', v);
    if (P.track) buildOrder(P.track.i);
    $$('[data-shuffle]').forEach(b => b.classList.toggle('on', v));
    toast(v ? 'Shuffle on' : 'Shuffle off');
  }

  function cycleRepeat() {
    P.repeat = { off: 'all', all: 'one', one: 'off' }[P.repeat];
    store.set('repeat', P.repeat);
    updateRepeatUI();
    toast({ off: 'Repeat off', all: 'Repeating all songs', one: 'Repeating this song' }[P.repeat]);
  }
  function updateRepeatUI() {
    const b = $('#np-repeat');
    b.innerHTML = I(P.repeat === 'one' ? 'repeatOne' : 'repeat');
    b.classList.toggle('on', P.repeat !== 'off');
  }

  // ---------- Player UI ----------
  function updatePlayerUI() {
    const s = P.track;
    $('#mini').hidden = !s;
    if (!s) return;
    $('#mini-cover').innerHTML = cover(s);
    $('#mini-title').textContent = s.title;
    $('#mini-artist').textContent = s.artist;
    $('#np-cover').innerHTML = cover(s);
    $('#np-title').textContent = s.title;
    $('#np-artist').textContent = s.artist;
    const bg = $('#np-bg');
    bg.style.background = grad(s.title);
    if (s.cover) bg.style.backgroundImage = `url("${encodeURI(s.cover)}"), ${grad(s.title)}`;
    bg.style.backgroundSize = 'cover';
    updateProgress();
    markPlaying();
  }

  function setPlayingUI() {
    const playing = !audio.paused;
    document.body.classList.toggle('paused', !playing);
    $$('[data-role="playpause"]').forEach(b => { b.innerHTML = I(playing ? 'pause' : 'play'); b.setAttribute('aria-label', playing ? 'Pause' : 'Play'); });
    $$('[data-toggle-id]').forEach(b => { b.innerHTML = I(playing && P.track?.id === b.dataset.toggleId ? 'pause' : 'play'); });
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  }

  function markPlaying() {
    const id = P.track?.id;
    $$('.song, .release').forEach(r => r.classList.toggle('playing', r.dataset.id === id));
    setPlayingUI();
  }

  let seeking = false;
  const seek = $('#np-seek');
  function updateProgress() {
    const d = audio.duration || (P.track && durOf(P.track)) || 0;
    const c = audio.currentTime || 0;
    const p = d ? (c / d) * 100 : 0;
    $('#mini-bar').style.width = p + '%';
    if (!seeking) {
      seek.value = d ? Math.round((c / d) * 1000) : 0;
      seek.style.setProperty('--p', p + '%');
      $('#np-cur').textContent = fmt(c);
    }
    $('#np-dur').textContent = fmt(d);
  }
  seek.addEventListener('input', () => {
    seeking = true;
    seek.style.setProperty('--p', seek.value / 10 + '%');
    $('#np-cur').textContent = fmt((seek.value / 1000) * (audio.duration || 0));
  });
  seek.addEventListener('change', () => {
    if (isFinite(audio.duration)) audio.currentTime = (seek.value / 1000) * audio.duration;
    seeking = false;
  });

  // ---------- Now playing open/close + gestures ----------
  const np = $('#np');
  function openNP() {
    if (!P.track) return;
    np.classList.add('open'); np.setAttribute('aria-hidden', 'false');
    if (history.state?.np !== true) history.pushState({ np: true }, '');
  }
  function closeNP(fromPop) {
    if (!np.classList.contains('open')) return;
    np.classList.remove('open'); np.setAttribute('aria-hidden', 'true');
    if (!fromPop && history.state?.np) history.back();
  }
  window.addEventListener('popstate', () => { if (np.classList.contains('open')) closeNP(true); });

  (() => {
    let y0 = null, x0 = 0, dy = 0, dx = 0;
    const inner = $('.np-inner');
    inner.addEventListener('touchstart', e => { if (e.target.closest('input')) return; y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; dy = dx = 0; }, { passive: true });
    inner.addEventListener('touchmove', e => {
      if (y0 == null) return;
      dy = e.touches[0].clientY - y0; dx = e.touches[0].clientX - x0;
      if (dy > 0 && Math.abs(dy) > Math.abs(dx)) { np.classList.add('dragging'); np.style.transform = `translateY(${dy}px)`; }
    }, { passive: true });
    inner.addEventListener('touchend', e => {
      if (y0 == null) return;
      np.classList.remove('dragging'); np.style.transform = '';
      if (dy > 110 && Math.abs(dy) > Math.abs(dx)) closeNP();
      else if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) && e.target.closest('.np-art')) dx < 0 ? next() : prev();
      y0 = null;
    });
    const mini = $('#mini');
    let mx = null, moved = false;
    mini.addEventListener('touchstart', e => { mx = e.touches[0].clientX; moved = false; }, { passive: true });
    mini.addEventListener('touchmove', e => { if (mx != null && Math.abs(e.touches[0].clientX - mx) > 10) moved = true; }, { passive: true });
    mini.addEventListener('touchend', e => {
      if (mx == null) return;
      const d = e.changedTouches[0].clientX - mx;
      if (Math.abs(d) > 60) d < 0 ? next() : prev();
      mx = null;
    });
    mini.addEventListener('click', e => { if (moved) { e.stopPropagation(); moved = false; } }, true);
  })();

  // ---------- Share ----------
  const baseUrl = () => location.href.split('#')[0];
  const songLink = s => `${baseUrl()}#/song/${encodeURIComponent(s.id)}`;
  const fileLink = s => new URL(s.file, baseUrl()).href;

  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      ta.remove();
    }
    toast(msg);
  }

  const sheet = $('#sheet');
  let sheetSong = null;
  function openShare(s) {
    sheetSong = s;
    $('#sheet-head').innerHTML = `${cover(s, 'sm')}<div><div class="t">${esc(s.title)}</div><div class="s">${esc(s.artist)}</div></div>`;
    const item = (act, icon, title, sub) => `<button data-sheet-action="${act}"><span class="ico">${I(icon)}</span><span><b>${title}</b><small>${sub}</small></span></button>`;
    $('#sheet-items').innerHTML =
      (navigator.share ? item('native', 'share', 'Share…', 'Send it in a text, DM or story') : '') +
      item('song', 'link', 'Copy song link', 'Opens this song on SlopCloud') +
      item('file', 'note', 'Copy audio link', 'Direct audio file: plays in VLC, Discord, iMessage and any player') +
      item('open', 'external', 'Open in another player', 'Opens the audio file directly');
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
  }
  function closeSheet() { sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); }

  async function sheetAction(act) {
    const s = sheetSong;
    closeSheet();
    if (!s) return;
    if (act === 'song') copy(songLink(s), 'Song link copied');
    else if (act === 'file') copy(fileLink(s), 'Audio link copied');
    else if (act === 'open') window.open(fileLink(s), '_blank', 'noopener');
    else if (act === 'native') { try { await navigator.share({ title: `${s.title} by ${s.artist}`, text: `Listen to ${s.title} on SlopCloud`, url: songLink(s) }); } catch { /* cancelled */ } }
  }

  // ---------- Clicks ----------
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-share],[data-share-current],[data-toggle-id],[data-play-all],[data-shuffle],[data-repeat],[data-toggle],[data-next],[data-prev],[data-np-open],[data-np-close],[data-sheet-close],[data-sheet-action],[data-play-id],.song');
    if (!el) return;
    const d = el.dataset;
    if ('share' in d) return openShare(byId.get(d.share));
    if ('shareCurrent' in d) return P.track && openShare(P.track);
    if ('toggleId' in d) { const s = byId.get(d.toggleId); return P.track === s ? togglePlay() : playSong(s.i); }
    if ('playAll' in d) return playSong(P.shuffle ? null : 0);
    if ('shuffle' in d) return setShuffle(!P.shuffle);
    if ('repeat' in d) return cycleRepeat();
    if ('toggle' in d) return togglePlay();
    if ('next' in d) return next();
    if ('prev' in d) return prev();
    if ('npOpen' in d) return openNP();
    if ('npClose' in d) return closeNP();
    if ('sheetClose' in d) return closeSheet();
    if ('sheetAction' in d) return sheetAction(d.sheetAction);
    if ('playId' in d) { const s = byId.get(d.playId); if (P.track !== s) playSong(s.i); return openNP(); }
    if (el.classList.contains('song')) { const s = songs[+d.i]; return P.track === s ? openNP() : playSong(s.i); }
  });

  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea')) return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'ArrowRight' && e.shiftKey) next();
    else if (e.key === 'ArrowLeft' && e.shiftKey) prev();
    else if (e.key === 'Escape') { if (sheet.classList.contains('open')) closeSheet(); else closeNP(); }
  });

  // ---------- Audio events ----------
  let lastSave = 0, lastPos = 0;
  audio.addEventListener('play', setPlayingUI);
  audio.addEventListener('pause', () => { setPlayingUI(); saveState(); });
  audio.addEventListener('ended', () => next(true));
  audio.addEventListener('loadedmetadata', () => {
    if (P.track && isFinite(audio.duration) && durCache[P.track.file] == null) { durCache[P.track.file] = Math.round(audio.duration); store.set('dur', durCache); refreshDurations(); }
    updateProgress();
  });
  audio.addEventListener('timeupdate', () => {
    updateProgress();
    const now = Date.now();
    if (now - lastSave > 4000) { lastSave = now; saveState(); }
    if (now - lastPos > 1000) { lastPos = now; updatePositionState(); }
  });
  audio.addEventListener('error', () => {
    if (!P.track || !audio.getAttribute('src')) return;
    toast(`Couldn't play “${P.track.title}”. Check the file path in music.js.`);
    setPlayingUI();
  });

  // ---------- Lock screen / headphone controls ----------
  function updateMediaSession() {
    if (!('mediaSession' in navigator) || !P.track) return;
    const s = P.track;
    const art = [{ src: new URL(s.cover || 'icons/icon-512.png', baseUrl()).href, sizes: '512x512' }];
    try { navigator.mediaSession.metadata = new MediaMetadata({ title: s.title, artist: s.artist, album: 'SlopCloud', artwork: art }); } catch { /* unsupported */ }
  }
  function updatePositionState() {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    const d = audio.duration;
    if (!isFinite(d) || d <= 0) return;
    try { navigator.mediaSession.setPositionState({ duration: d, position: Math.min(audio.currentTime, d), playbackRate: audio.playbackRate || 1 }); } catch { /* ignore */ }
  }
  if ('mediaSession' in navigator) {
    const h = (a, f) => { try { navigator.mediaSession.setActionHandler(a, f); } catch { /* unsupported action */ } };
    h('play', () => audio.play().catch(() => {}));
    h('pause', () => audio.pause());
    h('previoustrack', prev);
    h('nexttrack', () => next());
    h('seekto', e => { if (e.seekTime != null) { audio.currentTime = e.seekTime; updatePositionState(); } });
  }

  // ---------- Persist & restore ----------
  function saveState() {
    if (!P.track) return;
    store.set('state', { order: P.order.map(i => songs[i].id), pos: P.pos, track: P.track.id, time: audio.currentTime || 0 });
  }
  function restore() {
    const s = store.get('state');
    if (!s || !Array.isArray(s.order)) return;
    const track = byId.get(s.track);
    const order = s.order.map(id => byId.get(id)?.i);
    if (!track || order.length !== songs.length || order.some(i => i == null)) return;
    P.order = order; P.pos = clamp(s.pos, 0, order.length - 1);
    load(track, false, s.time || 0);
  }
  window.addEventListener('pagehide', saveState);

  // ---------- Boot ----------
  $$('[data-icon]').forEach(el => el.insertAdjacentHTML('afterbegin', I(el.dataset.icon)));
  updateRepeatUI();
  $('#np-shuffle').classList.toggle('on', P.shuffle);
  setPlayingUI();
  if (!location.hash.startsWith('#/song/')) restore();
  window.addEventListener('hashchange', render);
  render();
  probeDurations();
})();
