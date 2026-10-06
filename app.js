// Pizza, Burger and Pasta come from the original Java FoodApp; the rest are extras for a fuller menu.
const MENU = [
  {id:1,name:"Pizza",price:200,emoji:"🍕",cat:"Mains",bg:"#ff7a59"},
  {id:2,name:"Burger",price:150,emoji:"🍔",cat:"Mains",bg:"#ffb02e"},
  {id:3,name:"Pasta",price:180,emoji:"🍝",cat:"Mains",bg:"#f5d547"},
  {id:4,name:"Fries",price:90,emoji:"🍟",cat:"Snacks",bg:"#ff9ec4"},
  {id:5,name:"Momos",price:120,emoji:"🥟",cat:"Snacks",bg:"#9b8cff"},
  {id:6,name:"Sandwich",price:110,emoji:"🥪",cat:"Snacks",bg:"#5be3a8"},
  {id:7,name:"Shake",price:130,emoji:"🥤",cat:"Sweet",bg:"#6cc7ff"},
  {id:8,name:"Brownie",price:100,emoji:"🍫",cat:"Sweet",bg:"#d49a6a"}
];
const TAX = 5, DISCOUNT_OVER = 500;
const $ = id => document.getElementById(id);
let menu = [...MENU], cart = [], customer = "", attempts = 3, pick = {}, cat = "All";

const store = {
  get(){ try { return JSON.parse(localStorage.getItem("orders")) || []; } catch { return []; } },
  set(v){ try { localStorage.setItem("orders", JSON.stringify(v)); } catch {} }
};
const toast = m => { const t = $("toast"); t.textContent = m; t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200); };

// Login (admin / 123, 3 attempts)
$("demo").onclick = () => { $("user").value = "admin"; $("pass").value = "123"; if (!$("cname").value) $("cname").value = "Guest"; };
$("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  if ($("user").value === "admin" && $("pass").value === "123") {
    customer = $("cname").value.trim();
    $("login").hidden = true; $("app").hidden = false;
    $("who").textContent = "Hi, " + customer;
    renderChips(); renderMenu(); renderCart(); return;
  }
  attempts--;
  if (attempts <= 0) { $("loginErr").textContent = "Too many failed attempts. Reload to try again."; e.target.querySelector("[type=submit]").disabled = true; }
  else $("loginErr").textContent = `Invalid credentials. Attempts left: ${attempts}`;
});
$("logout").onclick = () => location.reload();

// Menu
function renderChips(){
  $("chips").innerHTML = ["All", ...new Set(MENU.map(f => f.cat))]
    .map(c => `<button class="chip ${c === cat ? "on" : ""}" data-c="${c}">${c}</button>`).join("");
}
$("chips").onclick = e => { const c = e.target.dataset.c; if (c) { cat = c; renderChips(); renderMenu(); } };
function renderMenu(){
  const q = $("search").value.toLowerCase();
  const list = menu.filter(f => (cat === "All" || f.cat === cat) && f.name.toLowerCase().includes(q));
  $("menu").innerHTML = list.length ? list.map(f => `
    <article class="dish">
      <div class="pic" style="background:${f.bg}" aria-hidden="true">${ART[f.id]}</div>
      <h3>${f.name}</h3><span class="cat">${f.cat}</span>
      <div class="price">₹${f.price}</div>
      <div class="add">
        <div class="qty">
          <button data-d="-1" data-id="${f.id}" aria-label="Decrease quantity">−</button>
          <span>${pick[f.id] || 1}</span>
          <button data-d="1" data-id="${f.id}" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn primary" data-add="${f.id}">Add</button>
      </div>
    </article>`).join("") : `<p class="empty">Nothing matches "${q}". Try another word or pick All.</p>`;
}
$("menu").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.d) { const id = +b.dataset.id; pick[id] = Math.max(1, (pick[id] || 1) + +b.dataset.d); renderMenu(); }
  else if (b.dataset.add) {
    const id = +b.dataset.add, qty = pick[id] || 1, item = MENU.find(f => f.id === id);
    const l = cart.find(l => l.id === id);
    l ? l.qty += qty : cart.push({...item, qty});
    pick[id] = 1; renderMenu(); renderCart();
    $("openCart").classList.remove("bump"); void $("openCart").offsetWidth; $("openCart").classList.add("bump");
    toast(`Added ${qty} × ${item.name}`);
  }
});
$("search").oninput = renderMenu;
$("sort").onclick = () => { menu.sort((a, b) => a.price - b.price); renderMenu(); toast("Sorted by price"); };

// Cart
const totals = () => {
  const sub = cart.reduce((s, l) => s + l.price * l.qty, 0), disc = sub > DISCOUNT_OVER ? sub * .1 : 0;
  return {sub, disc, total: sub - disc + (cart.length ? TAX : 0)};
};
function renderCart(){
  $("cart").innerHTML = cart.length ? cart.map(l => `
    <li class="line"><span class="e">${ART[l.id]}</span><b>${l.name}</b><span>₹${l.price * l.qty}</span>
      <div class="qty"><button data-d="-1" data-id="${l.id}" aria-label="Decrease ${l.name}">−</button><span>${l.qty}</span><button data-d="1" data-id="${l.id}" aria-label="Increase ${l.name}">+</button></div>
      <button class="rm" data-rm="${l.id}">Remove</button></li>`).join("")
    : `<li class="empty">Your cart is empty. Add something tasty from the menu.</li>`;
  const t = totals();
  $("sub").textContent = "₹" + t.sub; $("discRow").hidden = !t.disc;
  $("disc").textContent = "−₹" + t.disc.toFixed(1);
  $("tax").textContent = "₹" + (cart.length ? TAX : 0);
  $("total").textContent = "₹" + t.total.toFixed(1);
  $("checkout").disabled = !cart.length;
  $("badge").textContent = cart.reduce((s, l) => s + l.qty, 0);
}
$("cart").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.rm) cart = cart.filter(l => l.id !== +b.dataset.rm);
  else if (b.dataset.d) {
    const l = cart.find(l => l.id === +b.dataset.id), q = l.qty + +b.dataset.d;
    if (q <= 0) return toast("Minimum 1. Use Remove to delete it.");
    l.qty = q;
  }
  renderCart();
});
const drawer = on => { $("drawer").classList.toggle("on", on); $("scrim").classList.toggle("on", on); };
$("openCart").onclick = () => drawer(true);
$("closeCart").onclick = $("scrim").onclick = () => drawer(false);

// Checkout: save order, track each item (Preparing → Ready), confetti
function confetti(){
  const cols = ["#ff5a36","#ffc93c","#5be3a8","#6cc7ff","#fff"];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement("i"); c.className = "conf";
    c.style.cssText = `left:${Math.random()*100}vw;background:${cols[i%5]};animation-delay:${Math.random()*.6}s`;
    document.body.appendChild(c); setTimeout(() => c.remove(), 3200);
  }
}
$("checkout").onclick = () => {
  const t = totals(), orders = store.get(), items = cart.slice();
  orders.push({name: customer, total: t.total, items: items.map(l => `${l.name} × ${l.qty}`), at: new Date().toLocaleString()});
  store.set(orders);
  cart = []; renderCart();
  const tr = $("track"); tr.hidden = false;
  tr.innerHTML = `<h3>Order #${orders.length} · ₹${t.total.toFixed(1)}</h3>` + items.map((l, i) =>
    `<div class="trow"><b><span>${ART[l.id]} ${l.name}</span><span id="st${i}">Preparing…</span></b><div class="bar"><i id="bar${i}"></i></div></div>`).join("");
  let left = items.length;
  items.forEach((l, i) => {
    setTimeout(() => $("bar" + i).style.width = "100%", 50);
    setTimeout(() => { $("st" + i).textContent = "Ready!";
      if (--left === 0) { tr.insertAdjacentHTML("beforeend", `<p class="done">All ready. Enjoy your meal, ${customer}!</p>`); confetti(); }
    }, 1050);
  });
};

// History
function renderHistory(){
  const o = store.get();
  $("history").innerHTML = o.length ? o.slice().reverse().map(x => `
    <li><span><b>${x.name}</b> · ${x.items.join(", ")}<br><small class="muted">${x.at}</small></span><b>₹${(+x.total).toFixed(1)}</b></li>`).join("")
    : `<li class="empty">No orders yet. Place one from the menu.</li>`;
}
$("clearHist").onclick = () => { store.set([]); renderHistory(); };
document.querySelectorAll(".tab").forEach(tab => tab.onclick = () => {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t === tab));
  const h = tab.dataset.view === "history";
  $("menuView").hidden = h; $("historyView").hidden = !h; if (h) renderHistory();
});

$("orderNow").onclick = () => $("menuView").scrollIntoView({behavior:"smooth"});
