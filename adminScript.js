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

// Fungsi Update Statistik & List
async function refreshDashboard() {
    // 1. Ambil Omzet & Jumlah Transaksi
    const snapT = await db.collection('koleksi_transaksi').get();
    let omzet = 0;
    snapT.forEach(doc => omzet += Number(doc.data().total || 0));

    // 2. Ambil Pengeluaran & Render List Pengeluaran
    const snapP = await db.collection('koleksi_pengeluaran').orderBy('waktu', 'desc').get();
    let totalKeluar = 0;
    const listP = document.getElementById('list-pengeluaran');
    listP.innerHTML = '';
    
    snapP.forEach(doc => {
        const p = doc.data();
        totalKeluar += Number(p.jumlah || 0);
        listP.innerHTML += `
            <div class="admin-item-row">
                <div>
                    <div style="font-weight:600;">${p.keterangan}</div>
                    <div style="font-size:12px; color:#ff7675;">-Rp${p.jumlah.toLocaleString()}</div>
                </div>
                <button onclick="hapusData('koleksi_pengeluaran', '${doc.id}')" class="btn-delete">Hapus</button>
            </div>`;
    });

    // 3. Update Angka di UI
    document.getElementById('stat-omzet').innerText = `Rp${omzet.toLocaleString()}`;
    document.getElementById('stat-total-keluar').innerText = `Rp${totalKeluar.toLocaleString()}`;
    document.getElementById('stat-laba').innerText = `Rp${(omzet - totalKeluar).toLocaleString()}`;
    document.getElementById('stat-count').innerText = snapT.size;
}

// Render Menu Secara Real-time
db.collection('koleksi_menu').onSnapshot(snap => {
    const listM = document.getElementById('admin-menu-list');
    document.getElementById('menu-count').innerText = `${snap.size} Menu`;
    listM.innerHTML = '';
    snap.forEach(doc => {
        const d = doc.data();
        listM.innerHTML += `
            <div class="admin-item-row">
                <div>
                    <div style="font-weight:600;">${d.nama}</div>
                    <div style="font-size:12px; color:#94a3b8;">Rp${d.harga.toLocaleString()}</div>
                </div>
                <button onclick="hapusData('koleksi_menu', '${doc.id}')" class="btn-delete">Hapus</button>
            </div>`;
    });
});

// Aksi Tambah & Hapus
window.tambahMenu = async () => {
    const n = document.getElementById('m-nama').value;
    const h = Number(document.getElementById('m-harga').value);
    if(n && h) {
        await db.collection('koleksi_menu').add({ nama: n, harga: h });
        document.getElementById('m-nama').value = '';
        document.getElementById('m-harga').value = '';
    }
};

window.simpanPengeluaran = async () => {
    const ket = document.getElementById('ket-pengeluaran').value;
    const nom = Number(document.getElementById('nom-pengeluaran').value);
    if(ket && nom) {
        await db.collection('koleksi_pengeluaran').add({
            keterangan: ket,
            jumlah: nom,
            waktu: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('ket-pengeluaran').value = '';
        document.getElementById('nom-pengeluaran').value = '';
        refreshDashboard();
    }
};

window.hapusData = async (koleksi, id) => {
    if(confirm("Yakin ingin menghapus data ini?")) {
        await db.collection(koleksi).doc(id).delete();
        refreshDashboard();
    }
};

refreshDashboard();