// GANTI DENGAN CONFIG FIREBASE MILIKMU
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

let cart = [];
const menuGrid = document.getElementById('menu-grid');
const cartItemsContainer = document.getElementById('cart-items');
const totalHargaEl = document.getElementById('total-harga');
const textKembalian = document.getElementById('text-kembalian');
const inputBayar = document.getElementById('input-bayar');

// 1. Ambil Menu secara Real-time
db.collection('koleksi_menu').onSnapshot((snapshot) => {
    menuGrid.innerHTML = '';
    snapshot.forEach(doc => {
        const item = doc.data();
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `<strong>${item.nama}</strong><br>Rp${Number(item.harga).toLocaleString()}`;
        card.onclick = () => addToCart(item.nama, item.harga);
        menuGrid.appendChild(card);
    });
});

// 2. Logika Keranjang
function addToCart(nama, harga) {
    cart.push({ nama, harga: Number(harga) });
    renderCart();
}

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    renderCart();
};

window.editItem = (index) => {
    const baru = prompt("Ganti Harga?", cart[index].harga);
    if(baru) {
        cart[index].harga = Number(baru);
        renderCart();
    }
};

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.harga;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.nama}</span>
            <span>
                ${item.harga.toLocaleString()}
                <button class="btn-edit" onclick="editItem(${index})">📝</button>
                <button class="btn-del" onclick="removeFromCart(${index})">❌</button>
            </span>
        `;
        cartItemsContainer.appendChild(div);
    });
    totalHargaEl.innerText = total.toLocaleString();
    hitungKembalian();
}

// 3. Kalkulator Kembalian
window.hitungKembalian = () => {
    const total = cart.reduce((a, b) => a + b.harga, 0);
    const bayar = Number(inputBayar.value) || 0;
    const sisa = bayar - total;
    textKembalian.innerText = sisa.toLocaleString('id-ID');
    textKembalian.style.color = sisa < 0 ? 'red' : 'green';
};

// 4. Simpan Pesanan (Checkout)
window.checkout = async () => {
    const total = cart.reduce((a, b) => a + b.harga, 0);
    const bayar = Number(inputBayar.value);

    if (cart.length === 0) return alert('Pilih menu dulu!');
    if (bayar < total) return alert('Uang tidak cukup!');

    try {
        await db.collection('koleksi_transaksi').add({
            item: cart,
            total: total,
            bayar: bayar,
            kembalian: bayar - total,
            waktu: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Resi Sederhana
        let struk = `--- RESI CAFFE ---\n`;
        cart.forEach(i => struk += `${i.nama} : ${i.harga}\n`);
        struk += `------------------\nTOTAL: ${total}\nBAYAR: ${bayar}\nKEMBALI: ${bayar-total}\n------------------\nTERIMA KASIH`;
        
        alert(struk);
        
        cart = [];
        inputBayar.value = '';
        renderCart();
    } catch (e) {
        alert('Gagal simpan!');
    }
};

// 5. Tampilkan Riwayat 5 Terakhir
db.collection('koleksi_transaksi').orderBy('waktu', 'desc').limit(5).onSnapshot((snapshot) => {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    snapshot.forEach(doc => {
        const t = doc.data();
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `Rp${t.total.toLocaleString()} - ${t.item.length} item`;
        historyList.appendChild(div);
    });
});