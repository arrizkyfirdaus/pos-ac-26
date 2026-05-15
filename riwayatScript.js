const firebaseConfig = {
    apiKey: "AIzaSyAjAoki-iJ9-lSa_DrBTvVh8n36YouyPU0",
    authDomain: "pos-ac-26.firebaseapp.com",
    projectId: "pos-ac-26",
    storageBucket: "pos-ac-26.firebasestorage.app",
    messagingSenderId: "1071587418155",
    appId: "1:1071587418155:web:4be81137892f94fa2f8a6e"
};

// Cek apakah firebase sudah diinisialisasi
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let allRiwayat = [];

console.log("Memulai penarikan data riwayat...");

// Ambil data tanpa filter orderBy dulu untuk tes apakah data masuk
db.collection('koleksi_transaksi').onSnapshot(snap => {
    console.log("Snapshot diterima! Jumlah dokumen:", snap.size);
    
    allRiwayat = [];
    if (snap.empty) {
        document.getElementById('list-riwayat').innerHTML = "<p>Data transaksi kosong di database.</p>";
        return;
    }

    snap.forEach(doc => {
        const d = doc.data();
        console.log("Data Dokumen:", d); // Cek apakah data muncul di console

        // Perbaikan format tanggal agar tidak crash jika 'waktu' null
        let tglStr = "Waktu tidak tercatat";
        if (d.waktu) {
            // Jika dari Firestore Timestamp
            if (typeof d.waktu.toDate === 'function') {
                tglStr = d.waktu.toDate().toLocaleString('id-ID');
            } else {
                tglStr = new Date(d.waktu).toLocaleString('id-ID');
            }
        }
        
        allRiwayat.push({ id: doc.id, ...d, tglStr: tglStr });
    });
    
    // Urutkan manual berdasarkan waktu terbaru jika orderBy bermasalah
    allRiwayat.sort((a, b) => (b.waktu?.seconds || 0) - (a.waktu?.seconds || 0));
    
    renderRiwayat(allRiwayat);
}, err => {
    console.error("Gagal ambil snapshot:", err);
});

function renderRiwayat(data) {
    const container = document.getElementById('list-riwayat');
    console.log("Me-render data ke UI...");

    container.innerHTML = data.map(n => `
        <div class="admin-card" style="margin-bottom: 15px; border-left: 5px solid ${n.metode === 'QRIS' ? '#3498db' : '#2ecc71'}">
            <div style="display:flex; justify-content:space-between; font-size:12px; color:#888;">
                <span>${n.tglStr}</span>
                <span style="font-weight:bold;">${n.metode || 'N/A'}</span>
            </div>
            <h3 style="margin: 10px 0;">Rp${(n.total || 0).toLocaleString()}</h3>
            <p style="font-size:13px; color:#636e72;">
                ${n.items ? n.items.map(i => `${i.nama} (x${i.qty})`).join(', ') : 'Tidak ada detail menu'}
            </p>
            <button onclick="reprint('${n.id}')" class="btn-primary" style="margin-top:10px; width:100%; padding:8px;">LIHAT STRUK</button>
        </div>
    `).join('');
}

window.reprint = (id) => {
    const found = allRiwayat.find(n => n.id === id);
    if(found) {
        localStorage.setItem('last_resi', JSON.stringify(found));
        window.location.href = "resi.html";
    }
};

window.filterRiwayat = () => {
    const key = document.getElementById('search-riwayat').value.toLowerCase();
    const filtered = allRiwayat.filter(n => 
        n.tglStr.toLowerCase().includes(key) || 
        (n.items && n.items.some(i => i.nama.toLowerCase().includes(key)))
    );
    renderRiwayat(filtered);
};