document.addEventListener('DOMContentLoaded', () => {
    const rawData = localStorage.getItem('last_resi');
    
    if (!rawData) {
        alert("Data transaksi tidak ditemukan!");
        window.location.href = 'index.html';
        return;
    }

    const data = JSON.parse(rawData);

    // 1. Tampilkan Info Header
    // Jika data dari Firebase, konversi Timestamp. Jika baru input, pakai Date.now()
    const tgl = data.waktu ? new Date().toLocaleString('id-ID') : new Date().toLocaleString('id-ID');
    
    document.getElementById('info-resi').innerHTML = `
        <div style="display:flex; justify-content:space-between;">
            <span>Tgl: ${tgl}</span>
            <span>${data.metode}</span>
        </div>
    `;

    // 2. Tampilkan Item
    const itemContainer = document.getElementById('item-list-resi');
    itemContainer.innerHTML = data.items.map(i => `
        <div style="display:flex; justify-content:space-between; font-size: 13px; margin-bottom: 5px;">
            <span>${i.nama} x${i.qty}</span>
            <span>${(i.harga * i.qty).toLocaleString()}</span>
        </div>
    `).join('');

    // 3. Tampilkan Total & Pembayaran
    const kembalian = (data.tunai - data.total);
    document.getElementById('total-area-resi').innerHTML = `
        <div style="display:flex; justify-content:space-between; font-weight:bold;">
            <span>TOTAL</span>
            <span>Rp${data.total.toLocaleString()}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size: 13px; margin-top: 5px;">
            <span>BAYAR (${data.metode})</span>
            <span>${data.tunai.toLocaleString()}</span>
        </div>
        ${data.metode === 'Tunai' ? `
        <div style="display:flex; justify-content:space-between; font-size: 13px;">
            <span>KEMBALI</span>
            <span>${kembalian.toLocaleString()}</span>
        </div>
        ` : ''}
    `;
});