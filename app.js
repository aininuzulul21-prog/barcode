/**
 * Inventory Barcode Scanner Application
 * Uses PHP + SQLite backend with QuaggaJS for barcode scanning
 */

const API_BASE = 'api';
let currentPage = 1;
let editingId = null;
let scannerActive = false;
let quaggaInitialized = false;

// DOM Elements
const startScannerBtn = document.getElementById('startScannerBtn');
const scannerBtnIcon = document.getElementById('scannerBtnIcon');
const scannerBtnText = document.getElementById('scannerBtnText');
const manualBarcode = document.getElementById('manualBarcode');
const searchBarcodeBtn = document.getElementById('searchBarcodeBtn');
const scanResult = document.getElementById('scanResult');
const scannedBarcode = document.getElementById('scannedBarcode');
const itemForm = document.getElementById('itemForm');
const formTitle = document.getElementById('formTitle');
const itemId = document.getElementById('itemId');
const barcode = document.getElementById('barcode');
const itemName = document.getElementById('itemName');
const quantity = document.getElementById('quantity');
const price = document.getElementById('price');
const category = document.getElementById('category');
const description = document.getElementById('description');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const formMessage = document.getElementById('formMessage');
const searchItems = document.getElementById('searchItems');
const searchBtn = document.getElementById('searchBtn');
const itemsContainer = document.getElementById('itemsContainer');
const pagination = document.getElementById('pagination');
const toast = document.getElementById('toast');

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ==================== API CALLS ====================
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE}/${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

// ==================== BARCODE SCANNER ====================
function initScanner() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Kamera tidak didukung di browser ini', 'error');
        return false;
    }
    return true;
}

function startScanner() {
    if (!initScanner()) return;

    const viewport = document.getElementById('scanner-viewport');
    viewport.innerHTML = '';

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: viewport,
            constraints: {
                width: { min: 640 },
                height: { min: 480 },
                facingMode: "environment",
                aspectRatio: { min: 1, max: 2 }
            },
            area: {
                top: "10%",
                right: "10%",
                left: "10%",
                bottom: "10%"
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        decoder: {
            readers: [
                "ean_reader",
                "ean_8_reader",
                "code_128_reader",
                "code_39_reader",
                "code_39_vin_reader",
                "codabar_reader",
                "upc_reader",
                "upc_e_reader",
                "i2of5_reader",
                "2of5_reader",
                "code_93_reader"
            ],
            debug: {
                showCanvas: false,
                showPatches: false,
                showFoundPatches: false,
                showSkeleton: false,
                showLabels: false,
                showPatchData: false,
                showFoundInfo: false
            }
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error('Quagga init error:', err);
            showToast('Gagal mengakses kamera: ' + (err.message || 'Unknown error'), 'error');
            scannerActive = false;
            updateScannerButton();
            return;
        }
        
        console.log('Quagga initialized successfully');
        Quagga.start();
        scannerActive = true;
        quaggaInitialized = true;
        updateScannerButton();
    });

    Quagga.onDetected(function(result) {
        if (result && result.codeResult && result.codeResult.code) {
            const code = result.codeResult.code;
            handleBarcodeDetected(code);
        }
    });

    Quagga.onProcessed(function(result) {
        const drawingCtx = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;
        
        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.width), parseInt(drawingCanvas.height));
                result.boxes.filter(function(box) {
                    return box !== result.box;
                }).forEach(function(box) {
                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                });
            }
            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
            }
            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
            }
        }
    });
}

function stopScanner() {
    if (Quagga && quaggaInitialized) {
        try {
            Quagga.stop();
        } catch (e) {
            // ignore
        }
    }
    scannerActive = false;
    quaggaInitialized = false;
    updateScannerButton();
}

function updateScannerButton() {
    if (scannerActive) {
        scannerBtnIcon.textContent = '⏹';
        scannerBtnText.textContent = 'Hentikan Scanner';
        startScannerBtn.classList.add('btn-danger');
        startScannerBtn.classList.remove('btn-primary');
    } else {
        scannerBtnIcon.textContent = '▶';
        scannerBtnText.textContent = 'Mulai Scanner';
        startScannerBtn.classList.remove('btn-danger');
        startScannerBtn.classList.add('btn-primary');
    }
}

// ==================== BARCODE HANDLING ====================
function handleBarcodeDetected(code) {
    // Vibrate on mobile
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
    
    scannedBarcode.textContent = code;
    scanResult.classList.remove('hidden');
    barcode.value = code;
    manualBarcode.value = code;
    
    // Auto-search item
    searchItemByBarcode(code);
    
    // Pause scanner briefly to prevent multiple scans
    if (scannerActive) {
        Quagga.pause();
        setTimeout(() => {
            if (scannerActive && quaggaInitialized) {
                Quagga.start();
            }
        }, 2000);
    }
}

function searchManualBarcode() {
    const code = manualBarcode.value.trim();
    if (!code) {
        showToast('Masukkan barcode terlebih dahulu', 'error');
        return;
    }
    
    scannedBarcode.textContent = code;
    scanResult.classList.remove('hidden');
    barcode.value = code;
    searchItemByBarcode(code);
}

async function searchItemByBarcode(code) {
    try {
        const result = await apiCall(`search_item.php`, 'POST', { barcode: code });
        
        if (result.data) {
            // Item found - populate form for editing
            populateForm(result.data);
            showToast('Barang ditemukan!', 'success');
        } else {
            // Item not found - clear form for new item
            resetForm();
            barcode.value = code;
            itemName.focus();
            showToast('Barang baru - isi data barang', 'info');
        }
    } catch (error) {
        // Allow new item entry
        resetForm();
        barcode.value = code;
    }
}

// ==================== FORM HANDLING ====================
function populateForm(item) {
    editingId = item.id;
    itemId.value = item.id;
    barcode.value = item.barcode;
    itemName.value = item.item_name;
    quantity.value = item.quantity;
    price.value = item.price;
    category.value = item.category;
    description.value = item.description;
    formTitle.textContent = '✏️ Edit Barang';
    submitBtn.textContent = '💾 Update Barang';
    submitBtn.classList.remove('btn-success');
    submitBtn.classList.add('btn-primary');
    formMessage.classList.add('hidden');
}

function resetForm() {
    editingId = null;
    itemId.value = '';
    barcode.value = scannedBarcode.textContent || '';
    itemName.value = '';
    quantity.value = 1;
    price.value = 0;
    category.value = '';
    description.value = '';
    formTitle.textContent = 'Tambah Barang Baru';
    submitBtn.textContent = '💾 Simpan Barang';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('btn-success');
    formMessage.classList.add('hidden');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        barcode: barcode.value.trim(),
        item_name: itemName.value.trim(),
        quantity: parseInt(quantity.value) || 0,
        price: parseFloat(price.value) || 0,
        category: category.value,
        description: description.value.trim()
    };
    
    if (!formData.barcode) {
        showToast('Barcode harus diisi (scan atau manual)', 'error');
        return;
    }
    
    if (!formData.item_name) {
        showToast('Nama barang harus diisi', 'error');
        return;
    }
    
    try {
        let result;
        if (editingId) {
            formData.id = editingId;
            result = await apiCall('update_item.php', 'POST', formData);
        } else {
            result = await apiCall('add_item.php', 'POST', formData);
        }
        
        showToast(result.message, 'success');
        resetForm();
        scanResult.classList.add('hidden');
        loadItems();
    } catch (error) {
        formMessage.textContent = error.message || 'Gagal menyimpan data';
        formMessage.className = 'form-message error';
        formMessage.classList.remove('hidden');
    }
}

// ==================== ITEMS LIST ====================
async function loadItems(page = 1) {
    currentPage = page;
    const searchTerm = searchItems.value.trim();
    
    try {
        let url = `get_items.php?page=${page}&limit=20`;
        if (searchTerm) {
            url += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        const result = await apiCall(url);
        renderItems(result.data, result.pagination);
    } catch (error) {
        itemsContainer.innerHTML = `<div class="empty-state"><p>Gagal memuat data</p></div>`;
    }
}

function renderItems(items, paginationData) {
    if (!items || items.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-state">
                <p>📭 Belum ada barang</p>
                <p style="font-size:0.85rem;margin-top:8px;color:var(--gray-500)">
                    Scan barcode untuk mulai menambahkan barang
                </p>
            </div>
        `;
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<div class="items-list">';
    items.forEach(item => {
        const formattedPrice = item.price > 0 
            ? `Rp ${parseFloat(item.price).toLocaleString('id-ID')}`
            : '-';
        
        html += `
            <div class="item-card">
                <div class="item-card-header">
                    <span class="item-name">${escapeHtml(item.item_name)}</span>
                    <span class="item-barcode">${escapeHtml(item.barcode)}</span>
                </div>
                <div class="item-details">
                    <div class="item-detail">
                        <strong>Jumlah:</strong> 
                        <span class="value">${parseInt(item.quantity)}</span>
                    </div>
                    <div class="item-detail">
                        <strong>Harga:</strong> 
                        <span class="value">${formattedPrice}</span>
                    </div>
                    <div class="item-detail">
                        <strong>Kategori:</strong> 
                        <span class="value">${escapeHtml(item.category || '-')}</span>
                    </div>
                    <div class="item-detail">
                        <strong>Ditambahkan:</strong> 
                        <span class="value">${formatDate(item.created_at)}</span>
                    </div>
                </div>
                ${item.description ? `<p style="font-size:0.85rem;color:var(--gray-500);margin-top:8px">${escapeHtml(item.description)}</p>` : ''}
                <div class="item-actions">
                    <button onclick="editItem(${item.id})" class="btn btn-primary" style="padding:4px 12px;font-size:0.8rem">✏️ Edit</button>
                    <button onclick="deleteItem(${item.id})" class="btn btn-danger" style="padding:4px 12px;font-size:0.8rem">🗑️ Hapus</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    itemsContainer.innerHTML = html;
    renderPagination(paginationData);
}

function renderPagination(paginationData) {
    if (!paginationData || paginationData.totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    const { page, totalPages, total } = paginationData;
    
    html += `<button onclick="loadItems(${page - 1})" ${page <= 1 ? 'disabled' : ''}>◀ Sebelumnya</button>`;
    
    // Show limited page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);
    
    if (startPage > 1) {
        html += `<button onclick="loadItems(1)">1</button>`;
        if (startPage > 2) html += `<span class="page-info">...</span>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button onclick="loadItems(${i})" class="${i === page ? 'active' : ''}">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="page-info">...</span>`;
        html += `<button onclick="loadItems(${totalPages})">${totalPages}</button>`;
    }
    
    html += `<button onclick="loadItems(${page + 1})" ${page >= totalPages ? 'disabled' : ''}>Berikutnya ▶</button>`;
    html += `<span class="page-info">Total: ${total} barang</span>`;
    
    pagination.innerHTML = html;
}

// ==================== ITEM ACTIONS ====================
async function editItem(id) {
    try {
        // Search by ID directly
        const result = await apiCall(`search_item.php`, 'POST', { id: id });
        
        if (result.data) {
            populateForm(result.data);
            // Scroll to form
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
            showToast('Data siap diedit', 'info');
        } else {
            showToast('Data tidak ditemukan', 'error');
        }
    } catch (error) {
        showToast('Gagal mengambil data item', 'error');
    }
}

async function deleteItem(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
        return;
    }
    
    try {
        const result = await apiCall('delete_item.php', 'POST', { id });
        showToast(result.message, 'success');
        loadItems(currentPage);
    } catch (error) {
        showToast('Gagal menghapus barang', 'error');
    }
}

// ==================== UTILITY FUNCTIONS ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr + ' UTC');
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== EVENT LISTENERS ====================
startScannerBtn.addEventListener('click', () => {
    if (scannerActive) {
        stopScanner();
    } else {
        startScanner();
    }
});

searchBarcodeBtn.addEventListener('click', searchManualBarcode);
manualBarcode.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchManualBarcode();
    }
});

itemForm.addEventListener('submit', handleFormSubmit);
resetBtn.addEventListener('click', () => {
    resetForm();
    scanResult.classList.add('hidden');
    barcode.value = '';
});

searchBtn.addEventListener('click', () => loadItems(1));
searchItems.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadItems(1);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    
    // Check camera availability
    if (!initScanner()) {
        startScannerBtn.disabled = true;
        startScannerBtn.textContent = '❌ Kamera tidak tersedia';
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (scannerActive) {
        stopScanner();
    }
});

