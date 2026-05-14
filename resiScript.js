const data = JSON.parse(localStorage.getItem('last_resi'));

if(!data) {
    document.getElementById('isi-resi').innerHTML = "Data tidak ditemukan.";
} else {
    const tgl = new Date().toLocaleString('id-ID');
    let itemsHtml = data.items.map(i => `
        <div class="flex">
            <span>${i.nama} x${i.qty}</span>
            <span>${i.sub.toLocaleString()}</span>
        </div>
    `).join('');

    document.getElementById('isi-resi').innerHTML = `
        <div class="center">
            <h2 style="margin-bottom:0;">ANTHENG COFFEE</h2>
            <p style="font-size:12px;">Jl. Raya Jombang No. 23</p>
            <hr>
            <p style="font-size:12px;">${tgl}</p>
            <p style="font-size:12px;">Pelanggan: ${data.pelanggan}</p>
            <hr>
        </div>
        ${itemsHtml}
        <hr>
        <div class="flex"><strong>TOTAL</strong> <strong>Rp${data.total.toLocaleString()}</strong></div>
        <div class="flex"><span>Bayar</span> <span>Rp${data.tunai.toLocaleString()}</span></div>
        <div class="flex"><span>Kembali</span> <span>Rp${(data.tunai - data.total).toLocaleString()}</span></div>
        <hr>
        <p class="center" style="font-size:12px;">Terima Kasih Atas Kunjungan Anda!</p>
    `;
}