/* Labas Konveksi — interaksi JavaScript untuk UTS Pemrograman Web Dasar */
"use strict";

const STORAGE_KEY = "labasKonveksiInterestEntriesV1";
let activeCategory = "semua";

const productGrid = document.getElementById("productGrid");
const productItems = Array.from(document.querySelectorAll(".product-item"));
const productSearch = document.getElementById("productSearch");
const emptyProducts = document.getElementById("emptyProducts");
const interestForm = document.getElementById("interestForm");
const entriesTable = document.getElementById("entriesTable");
const entryCount = document.getElementById("entryCount");
const tableStatus = document.getElementById("tableStatus");
const tableSearch = document.getElementById("tableSearch");
const formSuccess = document.getElementById("formSuccess");
const toastElement = document.getElementById("siteToast");
const toastMessage = document.getElementById("toastMessage");

function showToast(message) {
  toastMessage.textContent = message;
  if (window.bootstrap && toastElement) {
    window.bootstrap.Toast.getOrCreateInstance(toastElement, { delay: 2800 }).show();
  } else {
    window.alert(message);
  }
}

function getEntries() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn("Data lokal tidak dapat dibaca:", error);
    return [];
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    showToast("Penyimpanan browser tidak tersedia. Data tidak dapat disimpan.");
    return false;
  }
}

function filterProducts() {
  const term = productSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  productItems.forEach((item) => {
    const categoryMatch = activeCategory === "semua" || item.dataset.category === activeCategory;
    const nameMatch = item.dataset.name.includes(term);
    const visible = categoryMatch && nameMatch;
    item.classList.toggle("d-none", !visible);
    if (visible) visibleCount += 1;
  });

  emptyProducts.classList.toggle("d-none", visibleCount !== 0);
}

function setCategory(category) {
  activeCategory = category;
  document.querySelectorAll(".filter-pill").forEach((button) => {
    const isActive = button.dataset.filter === category;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  filterProducts();
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    setCategory(category);
    if (button.classList.contains("category-card")) {
      document.getElementById("produk").scrollIntoView({ behavior: "smooth" });
    }
  });
});

productSearch.addEventListener("input", filterProducts);

document.getElementById("showAllProducts").addEventListener("click", () => {
  productSearch.value = "";
  setCategory("semua");
  filterProducts();
});

document.getElementById("productPrev").addEventListener("click", () => {
  productGrid.scrollBy({ left: -260, behavior: "smooth" });
});
document.getElementById("productNext").addEventListener("click", () => {
  productGrid.scrollBy({ left: 260, behavior: "smooth" });
});

/* Tombol pilih produk mengisi field produk pada formulir secara otomatis. */
document.querySelectorAll(".select-product").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("productSelect").value = button.dataset.product;
    document.getElementById("formulir").scrollIntoView({ behavior: "smooth" });
    document.getElementById("customerName").focus({ preventScroll: true });
    showToast(button.dataset.product + " dipilih. Silakan lengkapi formulir.");
  });
});

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function renderEntries() {
  const allEntries = getEntries();
  const query = tableSearch.value.trim().toLowerCase();
  const filteredEntries = allEntries.filter((entry) => {
    const searchable = [entry.name, entry.phone, entry.product, entry.note].join(" ").toLowerCase();
    return searchable.includes(query);
  });

  entryCount.textContent = String(allEntries.length);
  tableStatus.textContent = `Menampilkan ${filteredEntries.length} dari ${allEntries.length} data`;
  entriesTable.innerHTML = "";

  if (filteredEntries.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.className = "empty-table";
    cell.textContent = allEntries.length === 0
      ? "Belum ada data. Isi formulir untuk menambahkan data pertama."
      : "Tidak ada data yang sesuai dengan pencarian.";
    row.appendChild(cell);
    entriesTable.appendChild(row);
    return;
  }

  filteredEntries.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(entry.name)}</td>
      <td>${escapeHtml(entry.phone)}</td>
      <td>${escapeHtml(entry.product)}</td>
      <td>${escapeHtml(entry.size)}</td>
      <td>${escapeHtml(entry.quantity)}</td>
      <td>${escapeHtml(entry.note || "-")}</td>
      <td><button class="btn-row-delete" type="button" data-delete-id="${escapeHtml(entry.id)}" aria-label="Hapus data ${escapeHtml(entry.name)}">Hapus</button></td>`;
    entriesTable.appendChild(row);
  });
}

interestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formSuccess.classList.add("d-none");

  if (!interestForm.checkValidity()) {
    event.stopPropagation();
    interestForm.classList.add("was-validated");
    const firstInvalid = interestForm.querySelector(":invalid");
    if (firstInvalid) firstInvalid.focus();
    showToast("Periksa kembali kolom wajib pada formulir.");
    return;
  }

if (!interestForm.checkValidity()) {
  event.stopPropagation();
  interestForm.classList.add("was-validated");
  const firstInvalid = interestForm.querySelector(":invalid");
  if (firstInvalid) firstInvalid.focus();
  showToast("Periksa kembali kolom wajib pada formulir.");
  return;
}

const quantityInput = document.getElementById("productQuantity");
const quantity = Number(quantityInput.value);

if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
  quantityInput.setCustomValidity("Jumlah harus berupa bilangan bulat dari 1 sampai 100.");
  quantityInput.reportValidity();
  return;
}

quantityInput.setCustomValidity("");

  const newEntry = {
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: document.getElementById("customerName").value.trim(),
    phone: document.getElementById("customerPhone").value.trim(),
    product: document.getElementById("productSelect").value,
    size: document.getElementById("productSize").value,
    quantity: quantity,
    note: document.getElementById("customerNote").value.trim(),
    createdAt: new Date().toISOString()
  };

  const entries = getEntries();
  entries.unshift(newEntry);
  if (!saveEntries(entries)) return;

  renderEntries();
  interestForm.reset();
  interestForm.classList.remove("was-validated");
  formSuccess.textContent = "Data minat produk berhasil dicatat di browser ini.";
  formSuccess.classList.remove("d-none");
  showToast("Data berhasil ditambahkan ke tabel.");
});

interestForm.addEventListener("reset", () => {
  interestForm.classList.remove("was-validated");
  formSuccess.classList.add("d-none");
});

entriesTable.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-id]");
  if (!deleteButton) return;
  const id = deleteButton.dataset.deleteId;
  const remaining = getEntries().filter((entry) => entry.id !== id);
  if (saveEntries(remaining)) {
    renderEntries();
    showToast("Satu data berhasil dihapus.");
  }
});

document.getElementById("clearAll").addEventListener("click", () => {
  const entries = getEntries();
  if (entries.length === 0) {
    showToast("Belum ada data yang perlu dihapus.");
    return;
  }
  const confirmed = window.confirm("Hapus semua data minat produk yang tersimpan di browser ini?");
  if (!confirmed) return;
  if (saveEntries([])) {
    renderEntries();
    showToast("Semua data berhasil dihapus dari browser ini.");
  }
});

tableSearch.addEventListener("input", renderEntries);

/* Ekspor data yang tersimpan menjadi CSV agar hasil demo bisa dibuka di spreadsheet. */
document.getElementById("exportCsv").addEventListener("click", () => {
  const entries = getEntries();
  if (entries.length === 0) {
    showToast("Belum ada data untuk diunduh.");
    return;
  }
  const headers = ["Nama", "WhatsApp", "Produk", "Ukuran", "Jumlah", "Catatan", "Waktu Input"];
  const rows = entries.map((entry) => [
    entry.name, entry.phone, entry.product, entry.size, entry.quantity, entry.note, entry.createdAt
  ]);
  const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "data-minat-produk-labas-konveksi.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("File CSV berhasil disiapkan.");
});

document.getElementById("currentYear").textContent = String(new Date().getFullYear());

/* Inisialisasi tampilan berdasarkan data yang tersimpan sebelumnya. */
renderEntries();
filterProducts();
