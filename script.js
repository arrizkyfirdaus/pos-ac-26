const firebaseConfig = {
    apiKey: "AIzaSyAjAoki-iJ9-lSa_DrBTvVh8n36YouyPU0",
    authDomain: "pos-ac-26.firebaseapp.com",
    projectId: "pos-ac-26",
    storageBucket: "pos-ac-26.firebasestorage.app",
    messagingSenderId: "1071587418155",
    appId: "1:1071587418155:web:4be81137892f94fa2f8a6e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let allMenu = [];
let keranjang = [];
let metodeTerpilih = "";

// 1. Ambil Menu dari Firebase
db.collection('koleksi_menu').onSnapshot(snap => {
    allMenu = [];
    snap.forEach(doc => allMenu.push({ id: doc.id, ...doc.data() }));
    renderMenu(allMenu);
});

function renderMenu(data) {
    const grid = document.getElementById('grid-menu');
    grid.innerHTML = data.map(m => `
        <div class="menu-card" onclick="tambahKeKeranjang('${m.id}')">
            <div style="font-weight:bold; font-size:15px;">${m.nama}</div>
            <div style="color:#d4af37; margin-top:5px;">Rp${m.harga.toLocaleString()}</div>
        </div>
    `).join('');
}

// 2. Fungsi Cari Menu
window.filterMenu = () => {
    const keyword = document.getElementById('search-menu').value.toLowerCase();
    const filtered = allMenu.filter(m => m.nama.toLowerCase().includes(keyword));
    renderMenu(filtered);
};

// 3. Tambah Item (Klik Langsung Masuk)
window.tambahKeKeranjang = (id) => {
    const item = allMenu.find(m => m.id === id);
    const adaDiKeranjang = keranjang.find(k => k.id === id);

    if (adaDiKeranjang) {
        adaDiKeranjang.qty++;
    } else {
        keranjang.push({ ...item, qty: 1 });
    }
    updateUIKeranjang();
};

function updateUIKeranjang() {
    const list = document.getElementById('cart-list');
    let total = 0;
    list.innerHTML = keranjang.map((k, index) => {
        total += k.harga * k.qty;
        return `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; padding:10px; background:#f9f9f9; border-radius:8px;">
                <div><b>${k.nama}</b><br><small>${k.qty} x ${k.harga.toLocaleString()}</small></div>
                <div style="font-weight:bold;">Rp${(k.harga * k.qty).toLocaleString()}</div>
                <div onclick="hapusItem(${index})" style="color:red; margin-left:10px; cursor:pointer;">✕</div>
            </div>
        `;
    }).join('');
    document.getElementById('total-txt').innerText = `Rp${total.toLocaleString()}`;
}

window.hapusItem = (index) => {
    keranjang.splice(index, 1);
    updateUIKeranjang();
};

// 4. Proses Pembayaran
window.bukaModalBayar = () => {
    if (keranjang.length === 0) return alert("Pilih menu dulu!");
    document.getElementById('modal-bayar').style.display = 'flex';
};

window.tutupModal = () => {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
};

window.pilihMetode = (m) => {
    metodeTerpilih = m;
    document.getElementById('input-tunai-area').style.display = (m === 'Tunai') ? 'block' : 'none';
};

window.prosesFinal = async () => {
    if (!metodeTerpilih) return alert("Pilih metode bayar!");
    
    const total = keranjang.reduce((a, b) => a + (b.harga * b.qty), 0);
    const tunai = Number(document.getElementById('uang-tunai').value) || total;

    const dataTransaksi = {
        items: keranjang,
        total: total,
        metode: metodeTerpilih,
        tunai: tunai,
        waktu: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('koleksi_transaksi').add(dataTransaksi);
        localStorage.setItem('last_resi', JSON.stringify(dataTransaksi)); // Untuk resi.html
        document.getElementById('modal-bayar').style.display = 'none';
        document.getElementById('modal-success').style.display = 'flex';
    } catch (e) {
        alert("Gagal simpan transaksi: " + e);
    }
};

window.cetakStruk = () => {
    window.location.href = 'resi.html';
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Antheng POS Ready Offline!"))
    .catch(err => console.log("SW Register Failed", err));
}