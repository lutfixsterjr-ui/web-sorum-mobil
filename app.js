// ====== DATA MOBIL (edit di sini untuk menambah / mengubah produk) ======
const CARS = [
  { id: 'gt3-rs', name: 'GT3 RS', seg: 'sportcar', price: 11900000000, img: 'img/gt3-rs.png',
    tag: 'Performa murni. Lahir di sirkuit.',
    desc: 'Sportcar track-ready dengan aerodinamika aktif dan performa tanpa kompromi. Dibuat untuk sirkuit, legal untuk jalan raya.',
    power: '525 PS', acc: '3,2 detik', top: '296 km/jam', seats: '2 kursi', drive: 'RWD' },
  { id: 'macan', name: 'Macan', seg: 'suv', price: 1900000000, img: 'img/macan.png',
    tag: 'Lincah di kota, siap untuk petualangan.',
    desc: 'SUV kompak yang lincah dengan karakter sporty. Nyaman untuk harian, tetap responsif saat jalan menikung.',
    power: '265 PS', acc: '6,2 detik', top: '232 km/jam', seats: '5 kursi', drive: 'AWD' },
  { id: 'panamera', name: 'Panamera', seg: 'sedan', price: 3500000000, img: 'img/panamera.png',
    tag: 'Kemewahan yang tetap bertenaga.',
    desc: 'Sedan mewah dengan kabin luas dan kenyamanan kelas atas, tanpa kehilangan sensasi berkendara sebuah sportcar.',
    power: '353 PS', acc: '5,1 detik', top: '272 km/jam', seats: '4 kursi', drive: 'RWD' },
];
const SEG = { sportcar: 'Sportcar', suv: 'SUV', sedan: 'Sedan' };

// ====== UTIL ======
const $ = (s, r = document) => r.querySelector(s);
const rp = n => 'Rp ' + n.toLocaleString('id-ID');
const byId = id => CARS.find(c => c.id === id);
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: .15 })
  : { observe: el => el.classList.add('in') };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ====== ULASAN (disimpan di browser) ======
const REV_KEY = 'turismo-reviews';
function loadRev() { try { return JSON.parse(localStorage.getItem(REV_KEY)) || {}; } catch (e) { return {}; } }
function saveRev(r) { try { localStorage.setItem(REV_KEY, JSON.stringify(r)); } catch (e) {} }
function rating(id) { const l = loadRev()[id] || [], n = l.length; return { n, avg: n ? l.reduce((s, x) => s + x.rating, 0) / n : 0 }; }
const stars = v => '★'.repeat(Math.round(v)) + '☆'.repeat(5 - Math.round(v));
function rateLine(id) {
  const r = rating(id);
  return r.n ? `<span class="stars" aria-hidden="true">${stars(r.avg)}</span> <b>${r.avg.toFixed(1).replace('.', ',')}</b> <small>(${r.n} ulasan)</small>`
             : '<small>Belum ada ulasan</small>';
}

let cart = {};
try { cart = JSON.parse(localStorage.getItem('turismo-cart')) || {}; } catch (e) {}
const save = () => { try { localStorage.setItem('turismo-cart', JSON.stringify(cart)); } catch (e) {} };

// ====== HERO ======
const hero = $('#hero');
hero.innerHTML = CARS.map((c, i) => `
  <div class="slide${i ? '' : ' on'}">
    <span class="ghost">${c.name.toUpperCase()}</span>
    <small>${SEG[c.seg].toUpperCase()} SERIES</small>
    <h1>${c.name.toUpperCase()}</h1>
    <p>${c.tag}</p>
    <img src="${c.img}" alt="${c.name}">
    <div class="stats">
      <div><b>${c.power}</b><span>TENAGA</span></div>
      <div><b>${c.acc}</b><span>0–100 KM/JAM</span></div>
      <div><b>${c.top}</b><span>TOP SPEED</span></div>
    </div>
    <div class="btns"><button class="btn red" data-detail="${c.id}">Lihat detail</button><a class="btn outline" href="#koleksi" data-go="${c.seg}">Explore collections</a></div>
  </div>`).join('') +
  `<button class="arrow l" aria-label="Sebelumnya">‹</button><button class="arrow r" aria-label="Berikutnya">›</button>
   <div class="hero-ctl">${CARS.map((_, i) => `<button aria-label="Slide ${i + 1}"${i ? '' : ' class="on"'}></button>`).join('')}</div>`;

let cur = 0, timer;
const slides = hero.querySelectorAll('.slide'), dots = hero.querySelectorAll('.hero-ctl button');
function show(i) {
  cur = (i + slides.length) % slides.length;
  slides.forEach((s, k) => s.classList.toggle('on', k === cur));
  dots.forEach((d, k) => d.classList.toggle('on', k === cur));
}
function auto() { clearInterval(timer); timer = setInterval(() => show(cur + 1), 6000); }
hero.querySelector('.l').onclick = () => { show(cur - 1); auto(); };
hero.querySelector('.r').onclick = () => { show(cur + 1); auto(); };
dots.forEach((d, k) => d.onclick = () => { show(k); auto(); });
auto();

// ====== KATALOG ======
let filter = 'all';
const grid = $('#grid');
function renderGrid() {
  const q = $('#search').value.trim().toLowerCase();
  const list = CARS.filter(c => (filter === 'all' || c.seg === filter) && c.name.toLowerCase().includes(q));
  $('#empty').hidden = list.length > 0;
  grid.innerHTML = list.map(c => `
    <article class="card">
      <button class="stage" data-detail="${c.id}" aria-label="Lihat ${c.name}">
        <span class="tag">${SEG[c.seg]}</span><img src="${c.img}" alt="${c.name}" loading="lazy">
      </button>
      <div class="info">
        <div class="row"><h3>${c.name}</h3><div class="price"><small>MULAI DARI</small>${rp(c.price)}</div></div>
        <div class="rate">${rateLine(c.id)}</div>
        <p>${c.desc}</p>
        <div class="mini"><div>${c.power}<small>TENAGA</small></div><div>${c.acc}<small>0–100</small></div><div>${c.drive}<small>PENGGERAK</small></div></div>
        <div class="acts">
          <button class="btn dark" data-detail="${c.id}">Lihat detail</button>
          <button class="btn line" data-add="${c.id}" aria-label="Tambah ${c.name} ke keranjang">+</button>
        </div>
      </div>
    </article>`).join('');
  grid.querySelectorAll('.card').forEach((c, i) => { c.style.setProperty('--i', i); io.observe(c); });
}
function setFilter(f) {
  filter = f;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.f === f));
  renderGrid();
}
$('#tabs').onclick = e => { if (e.target.dataset.f) setFilter(e.target.dataset.f); };
$('#search').oninput = renderGrid;
document.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', () => setFilter(a.dataset.go)));

// ====== DETAIL ======
const detail = $('#detail');
function openDetail(id, note) {
  const c = byId(id), keep = detail.open ? detail.scrollTop : 0;
  const user = currentUser(), list = loadRev()[id] || [], r = rating(id);
  const mine = user ? list.find(x => x.email === user.email) : null;
  const reviews = list.length ? list.map(x => `
      <div class="rev"><div><span class="stars" aria-label="${x.rating} dari 5 bintang">${stars(x.rating)}</span> <b>${esc(x.name)}</b>
        <span class="meta">${new Date(x.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
        <p>${esc(x.text)}</p></div>`).join('') : '<p class="note">Belum ada ulasan untuk model ini.</p>';
  const form = user ? `
      <form id="rv-form">
        <div class="pick" id="rv-pick" role="radiogroup" aria-label="Beri bintang" data-val="${mine ? mine.rating : 0}">
          ${[1, 2, 3, 4, 5].map(i => `<button type="button" role="radio" data-star="${i}" aria-label="${i} bintang" aria-checked="${mine && i <= mine.rating ? 'true' : 'false'}" class="${mine && i <= mine.rating ? 'on' : ''}">★</button>`).join('')}
        </div>
        <label for="rv-text">${mine ? 'UBAH ULASANMU' : 'TULIS ULASAN'}</label>
        <textarea id="rv-text" rows="3" maxlength="400" required placeholder="Ceritakan kesanmu tentang ${esc(c.name)}…">${mine ? esc(mine.text) : ''}</textarea>
        <p class="err" id="rv-err" role="alert">${note ? esc(note) : ''}</p>
        <div class="acts2"><button class="btn dark">${mine ? 'Simpan perubahan' : 'Kirim ulasan'}</button>
        ${mine ? '<button type="button" class="btn line" id="rv-del">Hapus ulasan</button>' : ''}</div>
      </form>` : `<button class="btn line" id="rv-login">Masuk untuk menulis ulasan</button>`;
  detail.innerHTML = `
    <div class="d-stage"><button class="x" data-close aria-label="Tutup">✕</button><img src="${c.img}" alt="${c.name}"></div>
    <div class="d-body">
      <div class="row"><div><span class="tag" style="position:static">${SEG[c.seg]}</span><h2>${c.name}</h2><div class="rate">${rateLine(id)}</div></div>
        <div class="price"><small>MULAI DARI</small><span style="font-size:22px">${rp(c.price)}</span></div></div>
      <p style="color:var(--mut)">${c.desc}</p>
      <dl class="spec">
        <div><dt>TENAGA</dt><dd>${c.power}</dd></div><div><dt>0–100 KM/JAM</dt><dd>${c.acc}</dd></div>
        <div><dt>KECEPATAN MAKS.</dt><dd>${c.top}</dd></div><div><dt>KAPASITAS</dt><dd>${c.seats}</dd></div>
        <div><dt>PENGGERAK</dt><dd>${c.drive}</dd></div>
      </dl>
      <button class="btn red" data-add="${c.id}" data-then-close>Tambah ke keranjang</button>
      <section class="rv"><h4>ULASAN PEMBELI</h4>
        ${r.n ? `<p class="sum"><span class="big">${r.avg.toFixed(1).replace('.', ',')}</span> <span class="stars">${stars(r.avg)}</span> <small>dari ${r.n} ulasan</small></p>` : ''}
        ${reviews}${form}
      </section>
    </div>`;
  if (!detail.open) detail.showModal();
  detail.scrollTop = keep;

  const lg = $('#rv-login'); if (lg) lg.onclick = () => { detail.close(); openAuth('login'); };
  const pick = $('#rv-pick');
  if (pick) pick.onclick = e => {
    const b = e.target.closest('[data-star]'); if (!b) return;
    pick.dataset.val = b.dataset.star;
    pick.querySelectorAll('button').forEach(x => { const on = +x.dataset.star <= +b.dataset.star; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
  };
  const f = $('#rv-form');
  if (f) f.onsubmit = e => {
    e.preventDefault();
    const val = +pick.dataset.val;
    if (!val) return $('#rv-err').textContent = 'Pilih jumlah bintang dulu.';
    const all = loadRev(), l = all[id] || [], u = currentUser();
    const entry = { email: u.email, name: u.name, rating: val, text: $('#rv-text').value.trim(), date: new Date().toISOString() };
    const i = l.findIndex(x => x.email === u.email);
    if (i >= 0) l[i] = entry; else l.unshift(entry);
    all[id] = l; saveRev(all); renderGrid(); openDetail(id);
  };
  const del = $('#rv-del');
  if (del) del.onclick = () => {
    const all = loadRev(); all[id] = (all[id] || []).filter(x => x.email !== user.email);
    saveRev(all); renderGrid(); openDetail(id);
  };
}

// ====== KERANJANG ======
const cartDlg = $('#cart');
function count() { return Object.values(cart).reduce((a, b) => a + b, 0); }
function renderCart() {
  const n = count(), badge = $('#cart-count');
  badge.hidden = n === 0; badge.textContent = n;
  const ids = Object.keys(cart).filter(id => byId(id));
  const body = $('#cart-body');
  if (!ids.length) {
    body.innerHTML = '<p class="none">Keranjang masih kosong.<br>Pilih mobil dari koleksi.</p>';
    return;
  }
  const total = ids.reduce((s, id) => s + byId(id).price * cart[id], 0);
  const user = currentUser();
  body.innerHTML = ids.map(id => { const c = byId(id); return `
    <div class="line-item">
      <div class="stage"><img src="${c.img}" alt=""></div>
      <div><b>${c.name}</b><br><small style="color:var(--mut)">${rp(c.price)}</small>
        <div class="qty"><button data-dec="${id}" aria-label="Kurangi">−</button><span>${cart[id]}</span><button data-add="${id}" aria-label="Tambah">+</button></div></div>
      <button class="rm" data-rm="${id}">Hapus</button>
    </div>`; }).join('') + `
    <div class="total"><span>Total</span><span>${rp(total)}</span></div>
    ${user ? `<form id="order">
      <label for="nm">NAMA LENGKAP</label><input id="nm" required value="${esc(user.name)}">
      <label for="ph">NOMOR TELEPON</label><input id="ph" inputmode="tel" required placeholder="08xxxxxxxxxx" value="${esc(user.phone || '')}">
      <label for="ad">ALAMAT</label><textarea id="ad" rows="3" required>${esc(user.address || '')}</textarea>
      <button class="btn red">Buat pesanan &amp; cetak struk</button>
    </form>` : `<p class="none" style="padding:24px 0">Login dulu untuk membuat pesanan.</p>
    <button class="btn dark" style="width:100%" id="cart-login">Masuk / Daftar</button>`}`;
  const cl = $('#cart-login');
  if (cl) cl.onclick = () => { cartDlg.close(); openAuth('login'); };
  if (!user) return;
  $('#order').onsubmit = e => {
    e.preventDefault();
    const order = {
      code: 'TRM-' + Date.now().toString(36).toUpperCase(), date: new Date().toISOString(), total,
      name: $('#nm').value.trim(), phone: $('#ph').value.trim(), address: $('#ad').value.trim(),
      items: ids.map(id => ({ name: byId(id).name, qty: cart[id], price: byId(id).price })),
    };
    const users = loadUsers();
    if (users[user.email]) {
      users[user.email].orders = users[user.email].orders || [];
      users[user.email].orders.unshift(order);
      saveUsers(users);
    }
    cart = {}; save(); renderCart(); cartDlg.close(); openReceipt(order);
  };
}
$('#open-cart').onclick = () => { renderCart(); cartDlg.showModal(); };

// ====== AKUN (simulasi: disimpan di browser) ======
const USERS_KEY = 'turismo-users', SESS_KEY = 'turismo-session';
function loadUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch (e) { return {}; } }
function saveUsers(u) { try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); } catch (e) {} }
function currentUser() {
  try { const e = localStorage.getItem(SESS_KEY); return e ? loadUsers()[e] || null : null; } catch (e) { return null; }
}
function newSalt() {
  const b = new Uint8Array(12);
  (window.crypto || {}).getRandomValues ? crypto.getRandomValues(b) : b.forEach((_, i) => b[i] = Math.random() * 256);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}
async function hashPw(pw, salt) {
  const text = salt + pw;
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  return btoa(unescape(encodeURIComponent(text)));
}

const authDlg = $('#auth'), profDlg = $('#profile'), authErr = $('#auth-err');
function renderAccount() {
  const u = currentUser(), b = $('#acct');
  renderCta();
  if (u) {
    b.className = 'acct in';
    b.innerHTML = `<span class="av">${esc(u.name.charAt(0).toUpperCase())}</span><span class="nm">${esc(u.name.split(' ')[0])}</span>`;
  } else { b.className = 'acct'; b.textContent = 'Masuk'; }
}
function authTab(t) {
  document.querySelectorAll('#auth-tabs button').forEach(x => x.classList.toggle('on', x.dataset.a === t));
  $('#login-form').hidden = t !== 'login'; $('#reg-form').hidden = t !== 'register';
  authErr.textContent = '';
}
function openAuth(t) { authTab(t || 'login'); authDlg.showModal(); }
$('#auth-tabs').onclick = e => { if (e.target.dataset.a) authTab(e.target.dataset.a); };

$('#reg-form').onsubmit = async e => {
  e.preventDefault();
  const name = $('#rg-name').value.trim(), email = $('#rg-email').value.trim().toLowerCase();
  const p1 = $('#rg-pass').value, p2 = $('#rg-pass2').value, users = loadUsers();
  if (p1.length < 8) return authErr.textContent = 'Password minimal 8 karakter.';
  if (p1 !== p2) return authErr.textContent = 'Ulangi password tidak sama.';
  if (users[email]) return authErr.textContent = 'Email ini sudah terdaftar. Silakan masuk.';
  const salt = newSalt();
  users[email] = { name, email, phone: '', address: '', salt, hash: await hashPw(p1, salt), orders: [] };
  saveUsers(users); localStorage.setItem(SESS_KEY, email);
  e.target.reset(); authDlg.close(); renderAccount(); renderCart();
};
$('#login-form').onsubmit = async e => {
  e.preventDefault();
  const email = $('#li-email').value.trim().toLowerCase(), u = loadUsers()[email];
  if (!u || (await hashPw($('#li-pass').value, u.salt)) !== u.hash) return authErr.textContent = 'Email atau password salah.';
  localStorage.setItem(SESS_KEY, email);
  e.target.reset(); authDlg.close(); renderAccount(); renderCart();
};

function openProfile(msg) {
  const u = currentUser(); if (!u) return openAuth('login');
  const orders = (u.orders || []).map(o => `
    <div class="ord"><b>${esc(o.code)}</b> <span class="meta">${new Date(o.date).toLocaleString('id-ID')}</span><br>
      ${o.items.map(i => `${esc(i.name)} ×${i.qty}`).join(', ')}<br><b>${rp(o.total)}</b> <button class="link" data-print="${esc(o.code)}" style="margin-left:10px">Cetak struk</button></div>`).join('')
    || '<p class="note">Belum ada pesanan.</p>';
  $('#profile-body').innerHTML = `
    <div class="drawer-head"><h3>Profil saya</h3><button class="x" data-close aria-label="Tutup">✕</button></div>
    <form id="prof-form">
      <label for="pf-email">EMAIL</label><input id="pf-email" value="${esc(u.email)}" readonly>
      <label for="pf-name">NAMA LENGKAP</label><input id="pf-name" required value="${esc(u.name)}">
      <label for="pf-phone">NOMOR TELEPON</label><input id="pf-phone" inputmode="tel" value="${esc(u.phone || '')}">
      <label for="pf-addr">ALAMAT</label><textarea id="pf-addr" rows="3">${esc(u.address || '')}</textarea>
      <button class="btn dark">Simpan profil</button>
    </form>
    <h4>GANTI PASSWORD</h4>
    <form id="pw-form">
      <label for="pw-old">PASSWORD SAAT INI</label><input id="pw-old" type="password" autocomplete="current-password" required>
      <label for="pw-new">PASSWORD BARU (MIN. 8 KARAKTER)</label><input id="pw-new" type="password" minlength="8" autocomplete="new-password" required>
      <button class="btn line">Ganti password</button>
    </form>
    <p class="${msg && msg.err ? 'err' : 'ok'}" role="status" id="prof-msg">${msg ? esc(msg.text) : ''}</p>
    <h4>RIWAYAT PESANAN</h4>${orders}
    <button class="btn line" id="logout" style="width:100%;margin-top:28px">Keluar</button>`;

  $('#prof-form').onsubmit = e => {
    e.preventDefault();
    const users = loadUsers(), me = users[u.email];
    me.name = $('#pf-name').value.trim(); me.phone = $('#pf-phone').value.trim(); me.address = $('#pf-addr').value.trim();
    saveUsers(users); renderAccount(); openProfile({ text: 'Profil tersimpan.' });
  };
  $('#pw-form').onsubmit = async e => {
    e.preventDefault();
    const users = loadUsers(), me = users[u.email];
    if ((await hashPw($('#pw-old').value, me.salt)) !== me.hash) return openProfile({ err: 1, text: 'Password saat ini salah.' });
    me.salt = newSalt(); me.hash = await hashPw($('#pw-new').value, me.salt);
    saveUsers(users); openProfile({ text: 'Password berhasil diganti.' });
  };
  document.querySelectorAll('[data-print]').forEach(b => b.onclick = () => {
    const o = (currentUser().orders || []).find(x => x.code === b.dataset.print); if (o) openReceipt(o);
  });
  $('#logout').onclick = () => { localStorage.removeItem(SESS_KEY); profDlg.close(); renderAccount(); renderCart(); };
  if (!profDlg.open) profDlg.showModal();
}
$('#acct').onclick = () => currentUser() ? openProfile() : openAuth('login');
[authDlg, profDlg, $('#receipt')].forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

// ====== STRUK (cetak / simpan PDF) ======
function receiptHTML(o) {
  return `<div class="rc">
    <div class="rc-top"><div class="logo">TURISMO<i>.</i></div>
      <div class="rc-meta"><b>STRUK PEMESANAN</b><br>${esc(o.code)}<br>${new Date(o.date).toLocaleString('id-ID')}</div></div>
    <div class="rc-buyer"><b>Pembeli</b><br>${esc(o.name || '-')}<br>${esc(o.phone || '-')}<br>${esc(o.address || '-')}</div>
    <table><thead><tr><th>Model</th><th>Harga</th><th>Qty</th><th>Subtotal</th></tr></thead>
      <tbody>${o.items.map(i => `<tr><td>${esc(i.name)}</td><td>${rp(i.price)}</td><td>${i.qty}</td><td>${rp(i.price * i.qty)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="3">Total</td><td>${rp(o.total)}</td></tr></tfoot></table>
    <p class="rc-note">Struk ini dibuat dari website demo TURISMO dan bukan bukti pembayaran.</p></div>`;
}
function openReceipt(o) {
  $('#receipt-body').innerHTML = `
    <div class="drawer-head"><h3>Pesanan dibuat</h3><button class="x" data-close aria-label="Tutup">✕</button></div>
    ${receiptHTML(o)}
    <button class="btn red" id="rc-print" style="width:100%;margin-top:20px">Cetak / Simpan PDF</button>
    <p class="note">Di jendela cetak, pilih <b>Simpan sebagai PDF</b> pada bagian printer / tujuan.</p>`;
  $('#rc-print').onclick = () => { $('#print-area').innerHTML = receiptHTML(o); window.print(); };
  if (!$('#receipt').open) $('#receipt').showModal();
}

// ====== KATEGORI & PREVIEW ======
const SEGS = ['sportcar', 'suv', 'sedan'];
const firstOf = s => CARS.find(c => c.seg === s);
$('#cats').innerHTML = SEGS.map((s, i) => { const c = firstOf(s); return `
  <a href="#preview" class="cat" data-cat="${s}" style="--i:${i}">
    <span class="cat-n">0${i + 1}</span><h3>${SEG[s].toUpperCase()}</h3><p>${c.name}</p>
    <img src="${c.img}" alt="${c.name}" loading="lazy">
    <span class="cat-go">LIHAT PREVIEW <i>→</i></span>
  </a>`; }).join('');
document.querySelectorAll('.cat').forEach(el => { io.observe(el); el.addEventListener('click', () => showCategory(el.dataset.cat)); });

function countUp(el) {
  const raw = el.dataset.v, m = raw.match(/^([\d.,]+)(.*)$/);
  if (!m || reduce) { el.textContent = raw; return; }
  const dec = (m[1].split(',')[1] || '').length, to = parseFloat(m[1].replace(/\./g, '').replace(',', '.')), t0 = performance.now();
  (function step(t) {
    const p = Math.min((t - t0) / 1100, 1), v = to * (1 - Math.pow(1 - p, 3));
    el.textContent = v.toFixed(dec).replace('.', ',') + m[2];
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
function renderShow(seg) {
  const c = firstOf(seg);
  $('#showcase').innerHTML = `
    <span class="ghost">${c.name.toUpperCase()}</span>
    <div class="sc-copy"><small>${SEG[seg].toUpperCase()} SERIES</small><h3>${c.name.toUpperCase()}</h3><p>${c.tag}</p></div>
    <div class="sc-car"><i class="streak s1"></i><i class="streak s2"></i><i class="streak s3"></i><img class="enter" src="${c.img}" alt="${c.name}"></div>
    <div class="road"><span></span></div>
    <div class="stats">
      <div><b data-v="${c.power}">${c.power}</b><span>TENAGA</span></div>
      <div><b data-v="${c.acc}">${c.acc}</b><span>0–100 KM/JAM</span></div>
      <div><b data-v="${c.top}">${c.top}</b><span>TOP SPEED</span></div>
    </div>
    <div class="btns"><button class="btn red" data-detail="${c.id}">Lihat detail</button>
      <button class="btn outline" data-add="${c.id}">Tambah ke keranjang</button></div>`;
  $('#showcase').querySelectorAll('[data-v]').forEach(countUp);
}
function showCategory(seg) {
  document.querySelectorAll('#sc-tabs button').forEach(b => b.classList.toggle('on', b.dataset.s === seg));
  const img = $('#showcase .sc-car img');
  if (img && !reduce) { img.classList.remove('enter'); img.classList.add('leave'); setTimeout(() => renderShow(seg), 320); }
  else renderShow(seg);
}
$('#sc-tabs').onclick = e => { if (e.target.dataset.s) showCategory(e.target.dataset.s); };
renderShow('sportcar');

// ajakan daftar + tautan footer
function renderCta() {
  $('#cta-btns').innerHTML = currentUser()
    ? '<a class="btn dark" href="#koleksi">Lihat koleksi</a>'
    : '<button class="btn dark" data-auth="register">Daftar sekarang</button><button class="btn ghost" data-auth="login">Login</button>';
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-auth]');
  if (a) { e.preventDefault(); openAuth(a.dataset.auth); }
});
$('#foot-cart').onclick = e => { e.preventDefault(); $('#open-cart').click(); };

// ====== ANIMASI ======
function bump() { const b = $('#cart-count'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
function fly(img) {
  if (!img || reduce) return bump();
  const r = img.getBoundingClientRect(), t = $('#open-cart').getBoundingClientRect(), c = img.cloneNode();
  Object.assign(c.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px',
    margin: 0, maxHeight: 'none', zIndex: 60, pointerEvents: 'none', transition: 'none', translate: 'none' });
  document.body.appendChild(c);
  const dx = t.left + t.width / 2 - r.left - r.width / 2, dy = t.top + t.height / 2 - r.top - r.height / 2;
  const an = c.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(.06)`, opacity: .5 }],
    { duration: 800, easing: 'cubic-bezier(.5,0,.75,.4)' });
  an.onfinish = () => { c.remove(); bump(); };
}
// parallax hero mengikuti kursor
hero.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  const r = hero.getBoundingClientRect();
  hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5) * 26);
  hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5) * 12);
});
// kemiringan 3D gambar kartu
grid.addEventListener('pointermove', e => {
  const st = e.target.closest('.stage'); if (!st || e.pointerType === 'touch' || reduce) return;
  const r = st.getBoundingClientRect();
  st.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 14);
  st.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 10);
});
grid.addEventListener('pointerout', e => { const st = e.target.closest('.stage'); if (st) { st.style.removeProperty('--ry'); st.style.removeProperty('--rx'); } });
// progres scroll + header mengecil
const bar = $('#progress'), topbar = $('.top');
function onScroll() {
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  topbar.classList.toggle('small', scrollY > 40);
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();
document.querySelectorAll('.why .cols > div').forEach((el, i) => { el.style.setProperty('--i', i); io.observe(el); });

// ====== EVENT GLOBAL ======
document.addEventListener('click', e => {
  const t = e.target.closest('[data-detail],[data-add],[data-dec],[data-rm],[data-close]');
  if (!t) return;
  if (t.dataset.detail) openDetail(t.dataset.detail);
  else if (t.dataset.add) {
    cart[t.dataset.add] = (cart[t.dataset.add] || 0) + 1; save(); renderCart();
    if (t.hasAttribute('data-then-close')) { detail.close(); cartDlg.showModal(); bump(); }
    else if (!cartDlg.open) {
      const box = t.closest('.card,#showcase'); fly(box && box.querySelector('.stage img,.sc-car img'));
      const label = t.textContent; t.textContent = '✓'; setTimeout(() => t.textContent = label, 900);
    }
  }
  else if (t.dataset.dec) { cart[t.dataset.dec] = (cart[t.dataset.dec] || 1) - 1; if (cart[t.dataset.dec] <= 0) delete cart[t.dataset.dec]; save(); renderCart(); }
  else if (t.dataset.rm) { delete cart[t.dataset.rm]; save(); renderCart(); }
  else if (t.hasAttribute('data-close')) t.closest('dialog').close();
});
// klik di luar dialog = tutup
[detail, cartDlg].forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

$('#yr').textContent = new Date().getFullYear();
renderGrid();
renderAccount();
renderCart();
