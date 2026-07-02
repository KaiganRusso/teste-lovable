/* =========================================================
   3D Profit Manager
   HTML5 + CSS3 + Vanilla JavaScript
   Dados persistidos no LocalStorage do navegador.
   ========================================================= */
/* ---------- Utilitários ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmt = (n) => BRL.format(Number.isFinite(n) ? n : 0);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const todayISO = () => new Date().toISOString().slice(0, 10);
/* ---------- Persistência ---------- */
const STORAGE_KEY = "profit3d.v1";
const state = load();
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return baseState();
    return { ...baseState(), ...JSON.parse(raw) };
  } catch {
    return baseState();
  }
}
function baseState() {
  return {
    calc: { extras: [], others: [] }, // linhas dinâmicas
    sales: [],    // { id, name, date, cost, price, profit, status }
    expenses: [], // { id, desc, value, date }
  };
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
/* ---------- Navegação por abas ---------- */
$$(".tab").forEach((t) =>
  t.addEventListener("click", () => {
    $$(".tab").forEach((x) => x.classList.remove("active"));
    $$(".panel").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    $("#" + t.dataset.tab).classList.add("active");
  })
);
/* =========================================================
   CALCULADORA
   ========================================================= */
const calcInputs = [
  "prodName", "filamentGrams", "filamentPrice",
  "printHours", "printerWatts", "energyPrice", "salePrice",
];
function renderDyn(listId, arr, placeholderName) {
  const box = $("#" + listId);
  box.innerHTML = "";
  arr.forEach((item, i) => {
    const el = document.createElement("div");
    el.className = "dyn-item";
    el.innerHTML = `
      <input type="text" placeholder="${placeholderName}" value="${item.name ?? ""}" />
      <input type="number" step="0.01" min="0" placeholder="R$" value="${item.value ?? ""}" />
      <button type="button" title="Remover">✕</button>
    `;
    const [nameInp, valInp, delBtn] = el.children;
    nameInp.addEventListener("input", (e) => { arr[i].name = e.target.value; save(); recalc(); });
    valInp.addEventListener("input", (e) => { arr[i].value = parseFloat(e.target.value) || 0; save(); recalc(); });
    delBtn.addEventListener("click", () => { arr.splice(i, 1); save(); renderDyn(listId, arr, placeholderName); recalc(); });
    box.appendChild(el);
  });
}
$("#addExtra").addEventListener("click", () => {
  state.calc.extras.push({ name: "", value: 0 });
  save();
  renderDyn("extrasList", state.calc.extras, "Nome do material");
});
$("#addOther").addEventListener("click", () => {
  state.calc.others.push({ name: "", value: 0 });
  save();
  renderDyn("otherList", state.calc.others, "Descrição do gasto");
});
function recalc() {
  const grams   = parseFloat($("#filamentGrams").value) || 0;
  const pricekg = parseFloat($("#filamentPrice").value) || 0;
  const hours   = parseFloat($("#printHours").value) || 0;
  const watts   = parseFloat($("#printerWatts").value) || 0;
  const kwh     = parseFloat($("#energyPrice").value) || 0;
  const filamentCost = (grams / 1000) * pricekg;
  const energyCost   = (watts / 1000) * hours * kwh;
  const extrasCost   = state.calc.extras.reduce((s, x) => s + (x.value || 0), 0);
  const otherCost    = state.calc.others.reduce((s, x) => s + (x.value || 0), 0);
  const total = filamentCost + energyCost + extrasCost + otherCost;
  $("#sumFilament").textContent = fmt(filamentCost);
  $("#sumEnergy").textContent   = fmt(energyCost);
  $("#sumExtras").textContent   = fmt(extrasCost);
  $("#sumOther").textContent    = fmt(otherCost);
  $("#sumTotal").textContent    = fmt(total);
  $("#price2x").textContent = fmt(total * 2);
  $("#price3x").textContent = fmt(total * 3);
  $("#price4x").textContent = fmt(total * 4);
}
calcInputs.forEach((id) => {
  const el = $("#" + id);
  if (el) el.addEventListener("input", recalc);
});
$("#clearCalc").addEventListener("click", () => {
  calcInputs.forEach((id) => ($("#" + id).value = ""));
  state.calc = { extras: [], others: [] };
  save();
  renderDyn("extrasList", state.calc.extras, "Nome do material");
  renderDyn("otherList", state.calc.others, "Descrição do gasto");
  recalc();
});
$("#saveSale").addEventListener("click", () => {
  const name = $("#prodName").value.trim();
  if (!name) { alert("Informe o nome do produto."); return; }
  const cost  = parseFloat($("#sumTotal").textContent.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".")) || 0;
  const price = parseFloat($("#salePrice").value) || 0;
  const profit = price - cost;
  state.sales.unshift({
    id: uid(),
    name,
    date: todayISO(),
    cost,
    price,
    profit,
    status: price > 0 ? "sold" : "pending",
  });
  save();
  renderSales();
  renderReports();
  alert("Registro salvo em Vendas!");
});
/* =========================================================
   VENDAS
   ========================================================= */
function renderSales() {
  const tbody = $("#salesTable tbody");
  tbody.innerHTML = "";
  $("#salesEmpty").classList.toggle("hidden", state.sales.length > 0);
  $("#salesTable").classList.toggle("hidden", state.sales.length === 0);
  state.sales.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(s.name)}</td>
      <td>${formatDate(s.date)}</td>
      <td>${fmt(s.cost)}</td>
      <td>${fmt(s.price)}</td>
      <td style="color:${s.profit >= 0 ? "var(--primary)" : "var(--danger)"}">${fmt(s.profit)}</td>
      <td><span class="status ${s.status}">${s.status === "sold" ? "Vendido" : "Pendente"}</span></td>
      <td><button class="icon-btn" title="Excluir">🗑</button></td>
    `;
    tr.querySelector(".status").addEventListener("click", () => {
      s.status = s.status === "sold" ? "pending" : "sold";
      save(); renderSales(); renderReports();
    });
    tr.querySelector(".icon-btn").addEventListener("click", () => {
      if (confirm("Excluir esta venda?")) {
        state.sales = state.sales.filter((x) => x.id !== s.id);
        save(); renderSales(); renderReports();
      }
    });
    tbody.appendChild(tr);
  });
}
/* =========================================================
   GASTOS
   ========================================================= */
$("#expDate").value = todayISO();
$("#expenseForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const desc  = $("#expDesc").value.trim();
  const value = parseFloat($("#expValue").value) || 0;
  const date  = $("#expDate").value || todayISO();
  if (!desc || value <= 0) return;
  state.expenses.unshift({ id: uid(), desc, value, date });
  save(); renderExpenses(); renderReports();
  e.target.reset();
  $("#expDate").value = todayISO();
});
function renderExpenses() {
  const tbody = $("#expensesTable tbody");
  tbody.innerHTML = "";
  $("#expensesEmpty").classList.toggle("hidden", state.expenses.length > 0);
  $("#expensesTable").classList.toggle("hidden", state.expenses.length === 0);
  state.expenses.forEach((x) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td contenteditable="true" data-k="desc">${escapeHtml(x.desc)}</td>
      <td contenteditable="true" data-k="value">${x.value.toFixed(2)}</td>
      <td><input type="date" value="${x.date}" /></td>
      <td><button class="icon-btn" title="Excluir">🗑</button></td>
    `;
    tr.querySelectorAll("[contenteditable]").forEach((cell) => {
      cell.addEventListener("blur", () => {
        const k = cell.dataset.k;
        x[k] = k === "value" ? parseFloat(cell.textContent) || 0 : cell.textContent.trim();
        save(); renderReports();
      });
    });
    tr.querySelector('input[type="date"]').addEventListener("change", (e) => {
      x.date = e.target.value; save(); renderReports();
    });
    tr.querySelector(".icon-btn").addEventListener("click", () => {
      if (confirm("Excluir este gasto?")) {
        state.expenses = state.expenses.filter((i) => i.id !== x.id);
        save(); renderExpenses(); renderReports();
      }
    });
    tbody.appendChild(tr);
  });
}
/* =========================================================
   RELATÓRIOS
   ========================================================= */
function renderReports() {
  const sold = state.sales.filter((s) => s.status === "sold");
  const totalSales   = sold.reduce((s, x) => s + x.price, 0);
  const totalProfit  = sold.reduce((s, x) => s + x.profit, 0);
  const totalExpense = state.expenses.reduce((s, x) => s + x.value, 0);
  $("#rTotalSales").textContent    = fmt(totalSales);
  $("#rTotalProfit").textContent   = fmt(totalProfit - totalExpense);
  $("#rTotalExpenses").textContent = fmt(totalExpense);
  $("#rCountSold").textContent     = sold.length;
  $("#rCountPending").textContent  = state.sales.length - sold.length;
  $("#rAvgTicket").textContent     = fmt(sold.length ? totalSales / sold.length : 0);
}
/* =========================================================
   EXPORTAÇÃO / IMPORTAÇÃO
   ========================================================= */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-export]");
  if (!btn) return;
  const key = btn.dataset.export;
  if (key === "sales-json")     download("vendas.json", JSON.stringify(state.sales, null, 2));
  if (key === "sales-csv")      download("vendas.csv", toCSV(state.sales, ["name", "date", "cost", "price", "profit", "status"]));
  if (key === "expenses-json")  download("gastos.json", JSON.stringify(state.expenses, null, 2));
  if (key === "expenses-csv")   download("gastos.csv", toCSV(state.expenses, ["desc", "value", "date"]));
});
$("#exportAll").addEventListener("click", () => {
  download("3d-profit-manager-backup.json", JSON.stringify(state, null, 2));
});
$("#importAll").addEventListener("change", async (e) => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    Object.assign(state, { ...baseState(), ...data });
    save(); init();
    alert("Backup importado com sucesso!");
  } catch { alert("Arquivo inválido."); }
});
$("#wipeAll").addEventListener("click", () => {
  if (!confirm("Apagar TODOS os dados salvos? Esta ação é irreversível.")) return;
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, baseState());
  init();
});
function toCSV(rows, cols) {
  const header = cols.join(",");
  const body = rows.map((r) => cols.map((c) => csvCell(r[c])).join(",")).join("\n");
  return header + "\n" + body;
}
function csvCell(v) {
  if (v == null) return "";
  const s = String(v).replace(/"/g, '""');
  return /[",\n;]/.test(s) ? `"${s}"` : s;
}
function download(name, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
/* ---------- Helpers ---------- */
function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
/* ---------- Init ---------- */
function init() {
  $("#year").textContent = new Date().getFullYear();
  renderDyn("extrasList", state.calc.extras, "Nome do material");
  renderDyn("otherList", state.calc.others, "Descrição do gasto");
  renderSales();
  renderExpenses();
  renderReports();
  recalc();
}
init();
