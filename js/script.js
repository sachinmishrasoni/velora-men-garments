const WHATSAPP_NUMBER = "919876543210";
const STORE_NAME = "VÉLORA MEN";
const CURRENCY = "₹";
const state = { products: [], filtered: [], filter: "All", sort: "featured", search: "", wishlist: loadStorage("veloraWishlist"), bag: loadStorage("veloraEnquiryBag"), currentProduct: null, currentImage: 0, size: null, color: null, quantity: 1 };

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => `${CURRENCY}${Number(n).toLocaleString("en-IN")}`;
function loadStorage(key){try{return JSON.parse(localStorage.getItem(key)) || []}catch{return []}}
function saveStorage(key,value){localStorage.setItem(key,JSON.stringify(value))}
function discountPercent(p){return Math.max(0,Math.round((1-p.discountPrice/p.price)*100))}
function stars(rating){return `★★★★★ <span>${rating}</span>`}

async function loadProducts(){
  renderSkeletons();
  try{
    const res=await fetch("products.json",{cache:"no-store"});
    if(!res.ok) throw new Error("Unable to load products");
    state.products=await res.json();
    state.filtered=[...state.products];
    renderNewArrivals(); renderCatalogue(); renderBestSellers(); updateCounts(); renderWishlistPanel();
  }catch(error){
    console.error(error);
    ["newArrivalGrid","productGrid","bestCarousel"].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=""});
    $("#catalogueSummary").textContent="Collection unavailable.";
    const empty=$("#emptyState"); empty.classList.remove("hidden"); empty.querySelector("h3").textContent="Unable to load the collection."; empty.querySelector("p").textContent="Please check your connection and try again.";
    const retry=document.createElement("button"); retry.className="btn btn-dark"; retry.textContent="Retry"; retry.onclick=loadProducts; empty.appendChild(retry);
  }
}
function renderSkeletons(){
  const skeleton=Array.from({length:8},()=>`<div class="skeleton"><div class="skel-media"></div><div class="skel-line"></div><div class="skel-line small"></div></div>`).join("");
  $("#newArrivalGrid").innerHTML=`<div class="skeleton-grid">${skeleton}</div>`;
  $("#productGrid").innerHTML=`<div class="skeleton-grid">${skeleton}</div>`;
}
function applyState(){
  let list=[...state.products];
  if(state.filter!=="All") list=list.filter(p=>p.category===state.filter);
  if(state.search.trim()){
    const q=state.search.toLowerCase().trim();
    list=list.filter(p=>[p.name,p.category,p.subcategory,p.description].some(v=>String(v).toLowerCase().includes(q)));
  }
  switch(state.sort){
    case "newest": list.sort((a,b)=>Number(b.newArrival)-Number(a.newArrival)||b.id-a.id); break;
    case "price-low": list.sort((a,b)=>a.discountPrice-b.discountPrice); break;
    case "price-high": list.sort((a,b)=>b.discountPrice-a.discountPrice); break;
    case "rating": list.sort((a,b)=>b.rating-a.rating); break;
    default: list.sort((a,b)=>Number(b.featured)-Number(a.featured)||a.id-b.id);
  }
  state.filtered=list; renderCatalogue();
}
function renderProductCard(p, compact=false){
  const wished=state.wishlist.includes(p.id), bagged=state.bag.includes(p.id), disc=discountPercent(p);
  return `<article class="product-card" data-id="${p.id}">
    <div class="product-media">
      <img class="primary" src="${p.images[0]}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/900x1200/f0ece3/4a463f?text=VELORA+MEN'">
      <img class="secondary" src="${p.images[1]||p.images[0]}" alt="" loading="lazy" aria-hidden="true" onerror="this.style.display='none'">
      ${p.badge?`<span class="product-badge">${p.badge}</span>`:""}
      <button class="wish-btn ${wished?"active":""}" data-wish="${p.id}" aria-label="${wished?"Remove":"Add"} ${p.name} ${wished?"from":"to"} wishlist">${wished?"♥":"♡"}</button>
      ${!compact?`<button class="quick-trigger" data-quick="${p.id}">Quick View</button>`:""}
    </div>
    <div class="product-info">
      <p class="product-category">${p.category} / ${p.subcategory}</p><h3 class="product-name">${p.name}</h3><div class="rating">${stars(p.rating)} <span>(${p.reviews})</span></div>
      <div class="price-line"><strong class="price-current">${money(p.discountPrice)}</strong><span class="price-old">${money(p.price)}</span>${disc?`<span class="discount">${disc}% OFF</span>`:""}</div>
      <div class="product-actions"><button class="card-wa" data-wa="${p.id}">WhatsApp Order</button><button class="card-bag ${bagged?"active":""}" data-bag="${p.id}" aria-label="${bagged?"Remove from":"Add to"} enquiry bag">${bagged?"✓":"+"}</button></div>
    </div></article>`;
}
function renderNewArrivals(){
  const list=state.products.filter(p=>p.newArrival).slice(0,8);
  $("#newArrivalGrid").innerHTML=list.map(p=>renderProductCard(p)).join("");
}
function renderCatalogue(){
  const grid=$("#productGrid"), empty=$("#emptyState");
  if(!state.filtered.length){grid.innerHTML="";empty.classList.remove("hidden");return}
  empty.classList.add("hidden");grid.innerHTML=state.filtered.map(p=>renderProductCard(p)).join("");
  $("#catalogueSummary").textContent=`${state.filtered.length} ${state.filtered.length===1?"considered essential":"considered essentials"}.`;
}
function renderBestSellers(){
  const list=state.products.filter(p=>p.featured); $("#bestCarousel").innerHTML=list.map(p=>renderProductCard(p,true)).join("");
}
function updateCounts(){
  $("#wishlistCount").textContent=state.wishlist.length; $("#bagCount").textContent=state.bag.length;
  $("#bagTotal").textContent=state.bag.length;
}
function findProduct(id){return state.products.find(p=>p.id===Number(id))}
function toggleWishlist(id){
  id=Number(id); const p=findProduct(id); if(!p)return;
  const exists=state.wishlist.includes(id);
  state.wishlist=exists?state.wishlist.filter(x=>x!==id):[...state.wishlist,id]; saveStorage("veloraWishlist",state.wishlist); updateCounts();
  $$(`[data-wish="${id}"]`).forEach(btn=>{btn.classList.toggle("active",!exists);btn.classList.add("pop");btn.textContent=!exists?"♥":"♡";setTimeout(()=>btn.classList.remove("pop"),450)});
  showToast(exists?"Removed from wishlist":"Added to wishlist");
  if(state.currentProduct?.id===id) $("#quickWishlist").textContent=!exists?"♥":"♡";
}
function toggleBag(id){
  id=Number(id); const p=findProduct(id); if(!p)return;
  const exists=state.bag.includes(id); state.bag=exists?state.bag.filter(x=>x!==id):[...state.bag,id]; saveStorage("veloraEnquiryBag",state.bag); updateCounts();
  $$(`[data-bag="${id}"]`).forEach(btn=>{btn.classList.toggle("active",!exists);btn.textContent=!exists?"✓":"+"});
  showToast(exists?"Removed from enquiry bag":"Added to enquiry bag"); renderBagItems();
}
function renderBagItems(){
  const box=$("#bagItems");
  if(!state.bag.length){box.innerHTML=`<div class="empty-state"><div class="empty-symbol">+</div><h3>Your selection is empty.</h3><p>Add styles you want to enquire about and send them together on WhatsApp.</p></div>`;return}
  box.innerHTML=state.bag.map(id=>{const p=findProduct(id);return `<div class="bag-item"><img src="${p.images[0]}" alt="${p.name}"><div><h4>${p.name}</h4><p>${p.category}</p><p>${money(p.discountPrice)}</p></div><button class="remove-bag" data-remove-bag="${p.id}" aria-label="Remove ${p.name}">×</button></div>`}).join("");
}
function openBag(){renderBagItems();$("#bagPanel").classList.add("open");$("#panelBackdrop").classList.add("open");document.body.classList.add("lock");$("#bagPanel").setAttribute("aria-hidden","false")}
function closeBag(){$("#bagPanel").classList.remove("open");$("#panelBackdrop").classList.remove("open");document.body.classList.remove("lock");$("#bagPanel").setAttribute("aria-hidden","true")}
function generateWhatsAppMessage(p, options={}){
  const size=options.size||p.sizes[0], color=options.color||p.colors[0], qty=options.quantity||1;
  const url=`${location.href.split("#")[0]}#product-${p.id}`;
  return `Hello ${STORE_NAME},\n\nI am interested in this product:\n\nProduct: ${p.name}\nCategory: ${p.category}\nPrice: ${money(p.discountPrice)}\nSize: ${size}\nColor: ${color}\nQuantity: ${qty}\n\nProduct Link: ${url}\n\nPlease share availability and further details.\n\nThank you.`;
}
function openWhatsApp(url){window.open(url,"_blank","noopener,noreferrer")}
function sendProductWhatsApp(p, options={}){openWhatsApp(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(generateWhatsAppMessage(p,options))}`);showToast("Message prepared for WhatsApp")}
function sendBagWhatsApp(){
  if(!state.bag.length){showToast("Your enquiry bag is empty");return}
  const lines=state.bag.map((id,i)=>{const p=findProduct(id);return `${i+1}. ${p.name}\n   Price: ${money(p.discountPrice)}\n   Product ID: ${p.id}`}).join("\n\n");
  const msg=`Hello ${STORE_NAME},\n\nI am interested in the following products:\n\n${lines}\n\nPlease share availability and details.\n\nThank you.`;
  openWhatsApp(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);showToast("Enquiry prepared for WhatsApp");
}
function showToast(message){const t=document.createElement("div");t.className="toast";t.textContent=message;$("#toastStack").appendChild(t);setTimeout(()=>{t.classList.add("out");setTimeout(()=>t.remove(),300)},2600)}
function openQuickView(id){
  const p=findProduct(id);if(!p)return;state.currentProduct=p;state.currentImage=0;state.size=p.sizes[0];state.color=p.colors[0];state.quantity=1;
  $("#quickCategory").textContent=`${p.category} / ${p.subcategory}`;$("#quickTitle").textContent=p.name;$("#quickRating").innerHTML=stars(p.rating)+` <span>(${p.reviews} reviews)</span>`;$("#quickPrice").innerHTML=`<strong class="price-current">${money(p.discountPrice)}</strong> <span class="price-old">${money(p.price)}</span> <span class="discount">${discountPercent(p)}% OFF</span>`;$("#quickDescription").textContent=p.description;$("#quickImage").src=p.images[0];$("#quickImage").alt=p.name;
  $("#quickThumbs").innerHTML=p.images.map((src,i)=>`<button class="${i===0?"active":""}" data-thumb="${i}"><img src="${src}" alt="View ${p.name} image ${i+1}"></button>`).join("");
  $("#sizeChoices").innerHTML=p.sizes.map(s=>`<button class="${s===state.size?"active":""}" data-size="${s}">${s}</button>`).join("");$("#colorChoices").innerHTML=p.colors.map(c=>`<button class="${c===state.color?"active":""}" data-color="${c}">${c}</button>`).join("");$("#qtyValue").textContent="1";$("#quickWishlist").textContent=state.wishlist.includes(p.id)?"♥":"♡";$("#quickBag").textContent=state.bag.includes(p.id)?"✓":"+";
  $("#quickBackdrop").classList.add("open");document.body.classList.add("lock");$("#quickBackdrop").setAttribute("aria-hidden","false");
}
function closeQuick(){$("#quickBackdrop").classList.remove("open");document.body.classList.remove("lock");$("#quickBackdrop").setAttribute("aria-hidden","true")}
function openSearch(){$("#searchOverlay").classList.add("open");document.body.classList.add("lock");$("#searchOverlay").setAttribute("aria-hidden","false");setTimeout(()=>$("#searchInput").focus(),250)}
function closeSearch(){$("#searchOverlay").classList.remove("open");document.body.classList.remove("lock");$("#searchOverlay").setAttribute("aria-hidden","true")}
function renderSearchResults(q=""){
  const box=$("#searchResults"); if(!q.trim()){box.innerHTML="";return}
  const list=state.products.filter(p=>[p.name,p.category,p.subcategory,p.description].some(v=>String(v).toLowerCase().includes(q.toLowerCase()))).slice(0,8);
  box.innerHTML=list.length?list.map(p=>`<button class="search-result" data-search-id="${p.id}"><img src="${p.images[0]}" alt=""><span><strong>${p.name}</strong><span>${p.category} · ${money(p.discountPrice)}</span></span></button>`).join(""):`<div><strong>No styles found.</strong><p class="search-hint">Try shirts, jeans, trousers or t-shirts.</p></div>`;
}
function openMobileMenu(){$("#mobileDrawer").classList.add("open");$("#drawerBackdrop").classList.add("open");$("#menuBtn").setAttribute("aria-expanded","true");document.body.classList.add("lock")}
function closeMobileMenu(){$("#mobileDrawer").classList.remove("open");$("#drawerBackdrop").classList.remove("open");$("#menuBtn").setAttribute("aria-expanded","false");document.body.classList.remove("lock")}
function setFilter(category){state.filter=category;$$(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===category));applyState()}
function handleCategory(category){setFilter(category);closeMobileMenu();$("#catalogue").scrollIntoView({behavior:"smooth"})}
function initializeObservers(){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in-view");observer.unobserve(e.target)}}),{threshold:.12});$$('.reveal').forEach(el=>observer.observe(el))}
function initSticky(){const header=$("#siteHeader"),back=$("#backTop");const onScroll=()=>{header.classList.toggle("scrolled",scrollY>80);back.classList.toggle("show",scrollY>600)};addEventListener("scroll",onScroll,{passive:true});onScroll()}
function initEvents(){
  $("#searchBtn").onclick=openSearch;$("#closeSearch").onclick=closeSearch;$("#searchOverlay").addEventListener("click",e=>{if(e.target.id==="searchOverlay")closeSearch()});$("#searchInput").addEventListener("input",e=>renderSearchResults(e.target.value));
  $("#wishlistBtn").onclick=()=>{setFilter("All");document.querySelector("#catalogue").scrollIntoView({behavior:"smooth"});showToast("Wishlist is available on each product card")};
  $("#bagBtn").onclick=openBag;$("#closeBag").onclick=closeBag;$("#panelBackdrop").onclick=closeBag;$("#sendBagWhatsapp").onclick=sendBagWhatsApp;$("#clearBag").onclick=()=>{state.bag=[];saveStorage("veloraEnquiryBag",state.bag);updateCounts();renderBagItems();showToast("Selection cleared")};
  $("#menuBtn").onclick=openMobileMenu;$("#closeMenu").onclick=closeMobileMenu;$("#drawerBackdrop").onclick=closeMobileMenu;
  $("#quickBackdrop").addEventListener("click",e=>{if(e.target.id==="quickBackdrop")closeQuick()});$("#closeQuick").onclick=closeQuick;
  $("#sortSelect").onchange=e=>{state.sort=e.target.value;applyState()};
  $$(".filter").forEach(b=>b.onclick=()=>setFilter(b.dataset.filter));
  $$('[data-nav-category]').forEach(a=>a.addEventListener("click",()=>handleCategory(a.dataset.navCategory)));
  $$(".category-card").forEach(card=>card.addEventListener("click",e=>{if(e.target.closest("button")){handleCategory(card.dataset.category)}else handleCategory(card.dataset.category)}));
  $("#clearFilters").onclick=()=>{state.filter="All";state.search="";state.sort="featured";$("#sortSelect").value="featured";$$('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter==='All'));applyState()};
  $("#viewAllFromNew").onclick=()=>{setFilter("All")};
  $("#bestPrev").onclick=()=>$("#bestCarousel").scrollBy({left:-330,behavior:"smooth"});$("#bestNext").onclick=()=>$("#bestCarousel").scrollBy({left:330,behavior:"smooth"});
  $("#reviewPrev").onclick=()=>$("#reviewSlider").scrollBy({left:-360,behavior:"smooth"});$("#reviewNext").onclick=()=>$("#reviewSlider").scrollBy({left:360,behavior:"smooth"});
  $("#newsletterForm").onsubmit=e=>{e.preventDefault();const input=$("#email"),msg=$("#newsletterMessage");if(!/^\S+@\S+\.\S+$/.test(input.value.trim())){msg.textContent="Please enter a valid email address.";return}msg.textContent="You're on the list. Welcome to VÉLORA MEN.";input.value="";showToast("Welcome to the VÉLORA letter")};
  $("#backTop").onclick=()=>scrollTo({top:0,behavior:"smooth"});
  document.addEventListener("click",e=>{const wish=e.target.closest("[data-wish]"),bag=e.target.closest("[data-bag]"),quick=e.target.closest("[data-quick]"),wa=e.target.closest("[data-wa]"),remove=e.target.closest("[data-remove-bag]"),search=e.target.closest("[data-search-id]");if(wish){e.preventDefault();toggleWishlist(wish.dataset.wish)}else if(bag){e.preventDefault();toggleBag(bag.dataset.bag)}else if(quick){openQuickView(quick.dataset.quick)}else if(wa){const p=findProduct(wa.dataset.wa);sendProductWhatsApp(p)}else if(remove){toggleBag(remove.dataset.removeBag)}else if(search){openQuickView(search.dataset.searchId);closeSearch()}});
  $("#quickThumbs").addEventListener("click",e=>{const b=e.target.closest("[data-thumb]");if(!b)return;state.currentImage=Number(b.dataset.thumb);const p=state.currentProduct;$("#quickImage").src=p.images[state.currentImage];$$('[data-thumb]').forEach(x=>x.classList.toggle('active',x===b))});
  $("#sizeChoices").addEventListener("click",e=>{const b=e.target.closest("[data-size]");if(!b)return;state.size=b.dataset.size;$$('[data-size]').forEach(x=>x.classList.toggle('active',x===b))});
  $("#colorChoices").addEventListener("click",e=>{const b=e.target.closest("[data-color]");if(!b)return;state.color=b.dataset.color;$$('[data-color]').forEach(x=>x.classList.toggle('active',x===b))});
  $("#qtyMinus").onclick=()=>{state.quantity=Math.max(1,state.quantity-1);$("#qtyValue").textContent=state.quantity};$("#qtyPlus").onclick=()=>{state.quantity=Math.min(10,state.quantity+1);$("#qtyValue").textContent=state.quantity};
  $("#quickWhatsapp").onclick=()=>sendProductWhatsApp(state.currentProduct,{size:state.size,color:state.color,quantity:state.quantity});$("#quickWishlist").onclick=()=>toggleWishlist(state.currentProduct.id);$("#quickBag").onclick=()=>toggleBag(state.currentProduct.id);$("#quickDetails").onclick=()=>{const p=state.currentProduct;closeQuick();location.hash=`product-${p.id}`;setTimeout(()=>openQuickView(p.id),100)};
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeSearch();closeQuick();closeBag();closeMobileMenu()}});
}
function renderReviews(){const reviews=[
  ["The quality and fitting are excellent. The website made it very easy to explore the collection.","Arjun Mehta"],
  ["I ordered through WhatsApp and the process was surprisingly smooth. The shirt feels premium in person.","Rohan Kapoor"],
  ["The styling is exactly what I look for — minimal, sharp and easy to wear every day.","Aman Khanna"],
  ["Loved the denim fit. Clear product details and a very polished shopping experience.","Vikram Sethi"]
];$("#reviewSlider").innerHTML=reviews.map(([quote,name])=>`<article class="review-card"><div class="review-stars">★★★★★</div><blockquote>“${quote}”</blockquote><div class="review-author">${name}</div></article>`).join("")}
function initHeaderWhatsApp(){const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello ${STORE_NAME}, I would like to know more about your collection.`)}`;$("#headerWhatsapp").href=url;$("#footerWhatsapp").href=url;$("#mobileWhatsapp").href=url}

renderReviews();initHeaderWhatsApp();initEvents();initSticky();initializeObservers();loadProducts();
