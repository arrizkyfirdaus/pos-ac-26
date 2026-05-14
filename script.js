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

let keranjang = [];
let masterMenu = [];

// Load Menu ke Dropdown secara Real-time
db.collection('koleksi_menu').onSnapshot(snap => {
    const sel = document.getElementById('select-menu');
    sel.innerHTML = '<option value="">Pilih Menu</option>';
    masterMenu = [];
    snap.forEach(doc => {
        masterMenu.push({id: doc.id, ...doc.data()});
        sel.innerHTML += `<option value="${doc.id}">${doc.data().nama} - Rp${doc.data().harga.toLocaleString()}</option>`;
    });
});

window.tambahItem = () => {
    const id = document.getElementById('select-menu').value;
    const q = parseInt(document.getElementById('qty').value) || 1;
    if(!id) return alert("Pilih menu dulu!");

    const m = masterMenu.find(i => i.id === id);
    keranjang.push({...m, qty: q, sub: m.harga * q});
    render();
};

function render() {
    const container = document.getElementById('list-pesanan');
    container.innerHTML = '';
    let tot = 0;
    keranjang.forEach((item, i) => {
        tot += item.sub;
        container.innerHTML += `
        <div class="item-row">
            <span>${item.nama} (x${item.qty})</span>
            <span class="gold">Rp${item.sub.toLocaleString()} 
                <button onclick="hapusItem(${i})" style="background:none; border:none; color:red; margin-left:10px;">✕</button>
            </span>
        </div>`;
    });
    document.getElementById('total-txt').innerText = `Rp${tot.toLocaleString()}`;
    kalkulasi();
}

window.hapusItem = (index) => {
    keranjang.splice(index, 1);
    render();
};

window.kalkulasi = () => {
    const tot = keranjang.reduce((a,b) => a + b.sub, 0);
    const bayar = Number(document.getElementById('tunai').value) || 0;
    const sisa = bayar - tot;
    const kembaliTxt = document.getElementById('kembali-txt');
    kembaliTxt.innerText = `Rp${sisa.toLocaleString()}`;
    kembaliTxt.style.color = sisa < 0 ? 'red' : '#d4af37';
};

window.prosesTransaksi = async () => {
    const tot = keranjang.reduce((a,b) => a + b.sub, 0);
    const tunai = Number(document.getElementById('tunai').value);
    
    if(keranjang.length === 0) return alert("Keranjang kosong!");
    if(tunai < tot) return alert("Uang tunai kurang!");

    const data = {
        pelanggan: document.getElementById('nama-pelanggan').value || "Guest",
        items: keranjang,
        total: tot,
        tunai: tunai,
        waktu: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        localStorage.setItem('last_resi', JSON.stringify(data));
        await db.collection('koleksi_transaksi').add(data);
        window.location.href = "resi.html"; 
    } catch (e) {
        alert("Gagal simpan: " + e.message);
    }
};