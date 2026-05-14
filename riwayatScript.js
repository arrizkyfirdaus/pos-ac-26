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

// Load Riwayat dari Terbaru
db.collection('koleksi_transaksi').orderBy('waktu', 'desc').onSnapshot(snap => {
    const list = document.getElementById('list-riwayat');
    list.innerHTML = '';
    
    if(snap.empty) {
        list.innerHTML = '<p style="text-align:center; color:#888;">Belum ada transaksi.</p>';
        return;
    }

    snap.forEach(doc => {
        const d = doc.data();
        const tgl = d.waktu?.toDate().toLocaleString('id-ID') || 'Baru saja';
        
        list.innerHTML += `
        <div class="card" style="margin-bottom:10px; border-left: 4px solid #d4af37;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#888;">
                <span>${tgl}</span>
                <span>${d.pelanggan}</span>
            </div>
            <h4 style="margin: 5px 0; color:#d4af37;">Total: Rp${d.total.toLocaleString()}</h4>
            <div style="font-size:12px;">
                ${d.items.map(i => `${i.nama} (x${i.qty})`).join(', ')}
            </div>
        </div>`;
    });
});