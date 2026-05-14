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

// 1. Simpan Pengeluaran Baru
window.simpanPengeluaran = async () => {
    const ket = document.getElementById('ket-pengeluaran').value;
    const nom = Number(document.getElementById('nom-pengeluaran').value);

    if(!ket || !nom) return alert("Lengkapi data pengeluaran!");

    try {
        await db.collection('koleksi_pengeluaran').add({
            keterangan: ket,
            jumlah: nom,
            waktu: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('ket-pengeluaran').value = '';
        document.getElementById('nom-pengeluaran').value = '';
        alert("Pengeluaran berhasil dicatat!");
    } catch (e) {
        alert("Gagal: " + e.message);
    }
};

// 2. Load Dashboard & Kalkulasi Otomatis
async function loadDashboard() {
    // A. Ambil Omzet & Hitung Best Seller dari Koleksi Transaksi
    const snapTrans = await db.collection('koleksi_transaksi').get();
    let omzet = 0;
    let menuCount = {};

    snapTrans.forEach(doc => {
        const data = doc.data();
        omzet += Number(data.total || 0);
        if(data.items) {
            data.items.forEach(it => {
                menuCount[it.nama] = (menuCount[it.nama] || 0) + Number(it.qty || 1);
            });
        }
    });

    // B. Ambil & List Pengeluaran
    const snapKeluar = await db.collection('koleksi_pengeluaran').orderBy('waktu', 'desc').get();
    let totalKeluar = 0;
    const listKeluarEl = document.getElementById('list-pengeluaran-harian');
    listKeluarEl.innerHTML = '';

    snapKeluar.forEach(doc => {
        const k = doc.data();
        totalKeluar += Number(k.jumlah || 0);
        listKeluarEl.innerHTML += `
            <div class="item-row">
                <span>${k.keterangan}</span>
                <span style="color:#e74c3c;">-Rp${k.jumlah.toLocaleString()}</span>
            </div>`;
    });

    // C. Update Tampilan Omzet & Total Pengeluaran
    document.getElementById('stat-omzet').innerText = `Rp${omzet.toLocaleString()}`;
    document.getElementById('stat-total-keluar').innerText = `Rp${totalKeluar.toLocaleString()}`;

    // D. Tampilkan Best Seller (3 Teratas)
    const sortedBest = Object.entries(menuCount).sort((a,b) => b[1] - a[1]).slice(0,3);
    const bestEl = document.getElementById('best-seller-list');
    bestEl.innerHTML = sortedBest.length > 0 ? sortedBest.map(m => `
        <div class="item-row">
            <span>${m[0]}</span>
            <span class="gold">${m[1]} Terjual</span>
        </div>
    `).join('') : '<small>Belum ada data</small>';

    return { omzet, totalKeluar };
}

// 3. Tombol Hitung Laba Bersih
window.hitungLaporan = async () => {
    const data = await loadDashboard();
    const modal = Number(document.getElementById('saldo-awal').value) || 0;
    
    // Rumus: (Omzet + Modal) - Pengeluaran
    const labaBersih = (data.omzet + modal) - data.totalKeluar;
    
    const labaEl = document.getElementById('stat-laba');
    labaEl.innerText = `Rp${labaBersih.toLocaleString()}`;
    labaEl.style.color = labaBersih < 0 ? '#e74c3c' : '#d4af37';
};

// 4. Manajemen Menu (Tambah & Hapus)
window.tambahMenu = async () => {
    const nama = document.getElementById('m-nama').value;
    const harga = Number(document.getElementById('m-harga').value);
    if(!nama || !harga) return alert("Isi nama dan harga menu!");

    await db.collection('koleksi_menu').add({ nama, harga });
    document.getElementById('m-nama').value = '';
    document.getElementById('m-harga').value = '';
    alert("Menu ditambahkan!");
};

db.collection('koleksi_menu').onSnapshot(snap => {
    const listEl = document.getElementById('admin-menu-list');
    listEl.innerHTML = '';
    snap.forEach(doc => {
        listEl.innerHTML += `
            <div class="item-row">
                <span>${doc.data().nama}</span>
                <button onclick="hapusMenu('${doc.id}')" style="background:none; border:none; color:#e74c3c;">Hapus</button>
            </div>`;
    });
});

window.hapusMenu = async (id) => {
    if(confirm("Hapus menu ini?")) await db.collection('koleksi_menu').doc(id).delete();
};

// Auto load saat pertama buka
loadDashboard();

// Real-time listener untuk update otomatis dashboard jika ada data baru
db.collection('koleksi_transaksi').onSnapshot(() => loadDashboard());
db.collection('koleksi_pengeluaran').onSnapshot(() => loadDashboard());