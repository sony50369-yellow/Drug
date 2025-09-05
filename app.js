/* IV Drug Reference – Typeahead (no external dependencies) */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const state = {
  drugs: [],
  view: null
};

function normalize(s){
  return (s||"").toString().toLowerCase().normalize('NFKC');
}

function highlight(text, query){
  const i = normalize(text).indexOf(normalize(query));
  if(i < 0 || !query) return text;
  return text.slice(0,i) + '<mark>' + text.slice(i,i+query.length) + '</mark>' + text.slice(i+query.length);
}

function drugToHTML(d){
  const list = (v) => Array.isArray(v) ? v.map(x=>`<span class="badge">${x}</span>`).join(" ") : (v||"-");
  const dd = (label, value) => value ? `<dt>${label}</dt><dd>${value}</dd>` : "";
  return `
    <h2>${(d.drug_name || d.name || "-")}</h2>
    <dl class="kv">
      ${dd("รหัสยา", d.drug_code || "")}
      ${dd("ข้อบ่งใช้", d.indications || "")}
      ${dd("ตัวทำละลาย", list(d.solutions || d.diluents))}
      ${dd("ทางให้ยา", list(d.administration || d.routes))}
      ${dd("การเตรียม/ให้ยา", d.preparation || "")}
      ${dd("ข้อควรระวัง", d.notes || d.cautions || "")}
    </dl>
  `;
}

function renderCard(d){
  const card = $("#drug-card");
  const empty = $("#empty");
  card.innerHTML = drugToHTML(d);
  card.classList.remove("hidden");
  empty.classList.add("hidden");
  card.scrollIntoView({behavior:"smooth", block: "start"});
}

function makeSuggestion(d, q){
  const name = d.drug_name || d.name || "-";
  const code = d.drug_code || "";
  const ind = d.indications || "";
  return `<div class="suggestion" role="option" data-code="${code}">
    <div>
      <div class="name">${highlight(name,q)}</div>
      <div class="code">${[code, ind].filter(Boolean).join(" • ")}</div>
    </div>
  </div>`;
}

function search(query){
  query = normalize(query);
  if(!query) return [];
  const keys = ["drug_name","name","drug_code","indications","solutions","administration"];
  const res = [];
  for(const d of state.drugs){
    const hay = keys.map(k => {
      const v = d[k];
      if(Array.isArray(v)) return v.join(" ");
      return v || "";
    }).join(" ").toLowerCase();
    if(hay.includes(query)) res.push(d);
    if(res.length >= 30) break;
  }
  return res;
}

function setupChips(){
  $$(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.dataset.q || "";
      $("#search").value = q;
      handleInput();
    });
  });
}

function handleInput(){
  const q = $("#search").value.trim();
  const box = $("#suggestions");
  const results = search(q);
  if(q && results.length){
    box.innerHTML = results.slice(0,10).map(d => makeSuggestion(d, q)).join("");
    box.classList.add("show");
  }else{
    box.classList.remove("show");
    box.innerHTML = "";
  }
}

function setupSuggestions(){
  const box = $("#suggestions");
  box.addEventListener("click", e => {
    const item = e.target.closest(".suggestion");
    if(!item) return;
    const idx = Array.from(box.children).indexOf(item);
    const q = $("#search").value.trim();
    const results = search(q);
    const d = results[idx];
    if(d) renderCard(d);
    box.classList.remove("show");
  });
  document.addEventListener("click", e => {
    if(!e.target.closest(".search-wrap")) box.classList.remove("show");
  });
}

async function boot(){
  try{
    const res = await fetch("drugs.json", {cache:"no-store"});
    const payload = await res.json();
    state.drugs = Array.isArray(payload) ? payload : (payload.drugs || []);
  }catch(e){
    console.error("โหลด drugs.json ไม่สำเร็จ", e);
  }
  $("#search").addEventListener("input", handleInput);
  setupSuggestions();
  setupChips();
}

boot();
