// Konfigurasi Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyAjAoki-iJ9-lSa_DrBTvVh8n36YouyPU0",
    authDomain: "pos-ac-26.firebaseapp.com",
    projectId: "pos-ac-26",
    storageBucket: "pos-ac-26.firebasestorage.app",
    messagingSenderId: "1071587418155",
    appId: "1:1071587418155:web:4be81137892f94fa2f8a6e"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let cart = [];
const menuGrid = document.getElementById('menu-grid');
const cartItemsContainer = document.getElementById('cart-items');
const totalHargaEl = document.getElementById('total-harga');

// Ambil Data Menu dari Firestore secara Real-time
db.collection('koleksi_menu').onSnapshot((snapshot) => {
    menuGrid.innerHTML = '';
    snapshot.forEach(doc => {
        const item = doc.data();
        const card = document.createElement('div');
        card.className = 'menu-card';
        // Menampilkan nama dan harga menu
        card.innerHTML = `<strong>${item.nama}</strong><br>Rp${Number(item.harga).toLocaleString('id-ID')}`;
        card.onclick = () => addToCart(item.nama, item.harga);
        menuGrid.appendChild(card);
    });
}, (error) => {
    console.error("Gagal mengambil menu: ", error);
});

// Fungsi menambah item ke keranjang
function addToCart(nama, harga) {
    cart.push({ nama, harga: Number(harga) });
    renderCart();
}

// Fungsi menghapus item tertentu dari keranjang
window.removeFromCart = (index) => {
    cart.splice(index, 1);
    renderCart();
};

// Fungsi memperbarui tampilan keranjang
function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        total += item.harga;
        const div = document.createElement('div');
        div.className = 'cart-item';
        // Menambahkan tombol hapus (X) untuk setiap item di keranjang
        div.innerHTML = `
            <span>${item.nama}</span>
            <span>Rp${item.harga.toLocaleString('id-ID')} 
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; margin-left:10px; cursor:pointer;">✕</button>
            </span>
        `;
        cartItemsContainer.appendChild(div);
    });
    
    // Menampilkan total harga dengan format ribuan Indonesia
    totalHargaEl.innerText = total.toLocaleString('id-ID');
}

// Fungsi mengirim pesanan ke Firebase
window.checkout = async () => {
    if (cart.length === 0) return alert('Keranjang masih kosong, Bos!');
    
    try {
        await db.collection('koleksi_transaksi').add({
            item: cart,
            total: cart.reduce((a, b) => a + b.harga, 0),
            waktu: firebase.firestore.FieldValue.serverTimestamp(), // Waktu otomatis dari server
            status: "Selesai"
        });
        
        alert('Pesanan Berhasil Disimpan!');
        cart = []; // Kosongkan keranjang setelah berhasil
        renderCart();
    } catch (e) {
        console.error("Error saat simpan pesanan: ", e);
        alert('Gagal mengirim pesanan. Periksa koneksi internet!');
    }
};