(() => {
  'use strict';
  const products = {
    starter: ['Landing Page Starter', 99000, true], profesional: ['Landing Page Profesional', 189000, true],
    cv: ['CV Profesional', 12000, true], foto: ['Edit Foto Background Formal', 5000],
    portofolio: ['Paket Lengkap CV + Portofolio', 99000], logo: ['Jasa Pembuatan Logo', 35000],
    spanduk: ['Jasa Desain Spanduk', 50000], menu: ['Jasa Pembuatan Menu', 35000]
  };
  const key = 'thinkable-cart-v1', money = n => 'Rp' + n.toLocaleString('id-ID');
  let cart = Object.create(null);
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      for (const id of Object.keys(products)) {
        if (Object.hasOwn(saved, id) && Number.isInteger(saved[id]) && saved[id] > 0 && saved[id] <= 99) cart[id] = saved[id];
      }
    }
  } catch { /* A damaged or unavailable store starts with an empty cart. */ }
  const items = document.querySelector('#cart-items'), status = document.querySelector('#cart-status');
  function save() {
    try { localStorage.setItem(key, JSON.stringify(cart)); }
    catch { status.textContent += ' Penyimpanan tidak tersedia; keranjang berlaku selama halaman terbuka.'; }
  }
  function render(focusId, action) {
    items.replaceChildren();
    let fixed = 0, estimated = 0, count = 0;
    const lines = [];
    for (const [id, qty] of Object.entries(cart)) {
      const [name, price, estimate] = products[id];
      count += qty;
      if (estimate) estimated += price * qty; else fixed += price * qty;
      lines.push(`${name} × ${qty}: ${estimate ? 'estimasi mulai dari ' : ''}${money(price * qty)}`);
      const row = document.createElement('li'); row.className = 'cart-row';
      const detail = document.createElement('div'), title = document.createElement('strong'), cost = document.createElement('p');
      title.textContent = name; cost.textContent = `${estimate ? 'Estimasi mulai dari ' : ''}${money(price)} / item`;
      detail.append(title, cost);
      const controls = document.createElement('div'); controls.className = 'cart-controls';
      for (const [label, delta] of [['−', -1], ['+', 1], ['Hapus', 0]]) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'cart-control';
        button.textContent = label; button.dataset.id = id;
        button.setAttribute('aria-label', `${label === '+' ? 'Tambah' : label === '−' ? 'Kurangi' : 'Hapus'} ${name}`);
        button.disabled = delta === 1 && qty >= 99;
        button.addEventListener('click', () => {
          if (!delta || cart[id] + delta <= 0) delete cart[id]; else cart[id] += delta;
          status.textContent = 'Keranjang diperbarui.'; save(); render(id, label);
        });
        controls.append(button);
        if (delta === -1) { const amount = document.createElement('span'); amount.textContent = String(qty); amount.setAttribute('aria-label', `Jumlah ${qty}`); controls.append(amount); }
      }
      row.append(detail, controls); items.append(row);
    }
    if (!count) { const empty = document.createElement('li'); empty.textContent = 'Keranjang masih kosong. Pilih paket atau layanan di atas.'; items.append(empty); }
    document.querySelector('#cart-count').textContent = String(count);
    document.querySelector('#fixed-total').textContent = money(fixed);
    document.querySelector('#estimated-total').textContent = money(estimated);
    document.querySelector('#cart-total').textContent = money(fixed + estimated);
    const checkout = document.querySelector('#checkout'); checkout.hidden = !count;
    const message = ['Halo Fira, aku ingin konfirmasi pesanan Thinkable.pro:', ...lines, '', `Subtotal harga tetap: ${money(fixed)}`, `Subtotal estimasi mulai dari: ${money(estimated)}`, `Total estimasi: ${money(fixed + estimated)}`, '', 'Metode pembayaran: mohon konfirmasi metode yang tersedia via WhatsApp. Apakah transfer bank atau QRIS tersedia? Mohon kirim detail setelah konfirmasi.', 'Harga CV mulai dari dan paket landing page bergantung cakupan. Saya perlu menyetujui penawaran akhir dan detail pembayaran di chat sebelum membayar.'].join('\n');
    checkout.href = 'https://wa.me/6287895582152?text=' + encodeURIComponent(message);
    if (focusId) {
      const target = [...items.querySelectorAll('button')].find(el => el.dataset.id === focusId && el.textContent === action && !el.disabled);
      (target || items.querySelector('button') || document.querySelector('#cart-title')).focus();
    }
  }
  document.querySelectorAll('[data-product]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const id = button.dataset.product;
      if (!Object.hasOwn(products, id)) return;
      if ((cart[id] || 0) >= 99) { status.textContent = 'Maksimal 99 per layanan. Hubungi admin untuk jumlah lebih banyak.'; return; }
      cart[id] = (cart[id] || 0) + 1;
      status.textContent = `${products[id][0]} ditambahkan ke keranjang.`; save(); render();
    });
  });
  render();
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.section-heading, .catalog-card, .review-state').forEach(el => observer.observe(el));
  }
})();
