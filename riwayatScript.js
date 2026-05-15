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

let allRiwayat = [];

db.collection('koleksi_transaksi').orderBy('waktu', 'desc').onSnapshot(snap => {
    allRiwayat = [];
    snap.forEach(doc => {
        const d = doc.data();
        const tgl = d.waktu?.toDate().toLocaleString('id-ID') || 'Baru saja';
        allRiwayat.push({ id: doc.id, ...d, tglStr: tgl });
    });
    renderRiwayat(allRiwayat);
});

function renderRiwayat(data) {
    const container = document.getElementById('list-riwayat');
    container.innerHTML = data.map(n => `
        <div class="admin-card">
            <div style="display:flex; justify-content:space-between; font-size:12px; color:#888;">
                <span>${n.tglStr}</span>
                <span style="color:${n.metode === 'QRIS' ? '#3498db' : '#2ecc71'}; font-weight:bold;">${n.metode}</span>
            </div>
            <h3 style="margin: 10px 0;">Rp${n.total.toLocaleString()}</h3>
            <p style="font-size:13px; color:#636e72;">${n.items.map(i => `${i.nama} (x${i.qty})`).join(', ')}</p>
            <button onclick="reprint('${n.id}')" class="btn-primary" style="margin-top:15px; padding:8px; font-size:12px;">LIHAT STRUK</button>
        </div>
    `).join('');
}

window.filterRiwayat = () => {
    const key = document.getElementById('search-riwayat').value.toLowerCase();
    const filtered = allRiwayat.filter(n => 
        n.tglStr.toLowerCase().includes(key) || 
        n.items.some(i => i.nama.toLowerCase().includes(key))
    );
    renderRiwayat(filtered);
};

window.reprint = (id) => {
    const found = allRiwayat.find(n => n.id === id);
    localStorage.setItem('last_resi', JSON.stringify(found));
    window.location.href = "resi.html";
};