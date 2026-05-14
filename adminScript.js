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

// 1. Ambil Data Penjualan & Hitung Best Seller
async function loadStats() {
    const snap = await db.collection('koleksi_transaksi').get();
    let omzet = 0;
    let menuCount = {};

    snap.forEach(doc => {
        const d = doc.data();
        omzet += d.total;
        d.items.forEach(it => {
            menuCount[it.nama] = (menuCount[it.nama] || 0) + it.qty;
        });
    });

    document.getElementById('stat-omzet').innerText = `Rp${omzet.toLocaleString()}`;

    // Render 3 Menu Terlaris
    const best = Object.entries(menuCount).sort((a,b) => b[1] - a[1]).slice(0,3);
    const bestDiv = document.getElementById('best-seller-list');
    bestDiv.innerHTML = best.map(m => `
        <div class="item-row">
            <span>${m[0]}</span>
            <span class="gold">${m[1]} Porsi</span>
        </div>
    `).join('') || 'Belum ada data';

    return omzet;
}

// 2. Fungsi Hitung Laba Bersih
window.hitungLaba = async () => {
    const omzet = await loadStats();
    const awal = Number(document.getElementById('saldo-awal').value) || 0;
    const keluar = Number(document.getElementById('pengeluaran').value) || 0;
    
    const laba = (omzet + awal) - keluar;
    const labaTxt = document.getElementById('stat-laba');
    labaTxt.innerText = `Rp${laba.toLocaleString()}`;
    labaTxt.style.color = laba < 0 ? '#ff4d4d' : '#d4af37';
};

// 3. Tambah Menu Baru
window.tambahMenu = async () => {
    const nama = document.getElementById('m-nama').value;
    const harga = Number(document.getElementById('m-harga').value);
    
    if(!nama || !harga) return alert("Lengkapi data menu!");

    try {
        await db.collection('koleksi_menu').add({ nama, harga });
        alert("Menu berhasil ditambahkan!");
        document.getElementById('m-nama').value = '';
        document.getElementById('m-harga').value = '';
    } catch (e) {
        alert("Gagal: " + e.message);
    }
};

// 4. Render Daftar Menu untuk Dihapus
db.collection('koleksi_menu').onSnapshot(snap => {
    const list = document.getElementById('admin-menu-list');
    list.innerHTML = '';
    snap.forEach(doc => {
        list.innerHTML += `
            <div class="item-row">
                <span>${doc.data().nama}</span>
                <button onclick="hapusMenu('${doc.id}')" style="background:none; border:none; color:red;">Hapus</button>
            </div>`;
    });
});

window.hapusMenu = async (id) => {
    if(confirm("Hapus menu ini?")) await db.collection('koleksi_menu').doc(id).delete();
};

loadStats();