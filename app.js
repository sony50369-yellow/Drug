
const $ = (q)=>document.querySelector(q);
const $$ = (q)=>Array.from(document.querySelectorAll(q));
let DRUGS = [];

async function load(){
  try{
    const res = await fetch('./drugs.json?cb='+Date.now(), {cache:'no-store'});
    const txt = await res.text();
    try{
      DRUGS = JSON.parse(txt); if(!Array.isArray(DRUGS)){ DRUGS=[]; }
    }catch(e){
      console.error('JSON parse error:', e);
      // ลองแก้ JSON ที่มี comma เกิน/คอมเมนต์
      const fixed = txt
        .replace(/\/\/.*$/mg,'')
        .replace(/,\s*([}\]])/g,'$1');
      DRUGS = JSON.parse(fixed);
    }
  }catch(err){
    console.error('โหลด drugs.json ไม่สำเร็จ', err);
    $('#card').classList.add('hidden');
    return;
  }
  console.log('DRUGS loaded:', Array.isArray(DRUGS)?DRUGS.length:0); initUI();
}
function initUI(){
  const input = $('#search');
  const sug = $('#suggestions');
  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    if(!q){ sug.innerHTML=''; return; }
    const hits = DRUGS.filter(d=> d.name && d.name.toLowerCase().includes(q)).slice(0,20);
    sug.innerHTML = hits.map(d=>{
      const name = d.name.replace(new RegExp(q,'ig'), (m)=>`<mark>${m}</mark>`);
      return `<div class="suggestion" data-name="${encodeURIComponent(d.name)}">${name}</div>`;
    }).join('') || `<div class="suggestion">ไม่พบชื่อยา</div>`;
  });
  sug.addEventListener('click', (e)=>{
    const el = e.target.closest('.suggestion');
    if(!el) return;
    const name = decodeURIComponent(el.dataset.name||"");
    const drug = DRUGS.find(d=>d.name===name);
    if(drug){ renderCard(drug); sug.innerHTML=''; input.value=''; input.blur(); document.getElementById('card').scrollIntoView({behavior:'smooth', block:'start'}); }
  });
  // quick enter to first match
  input.addEventListener('keydown', (e)=>{
    if(e.key==='Enter'){
      const first = $('.suggestion');
      if(first && first.dataset.name){
        const name = decodeURIComponent(first.dataset.name);
        const drug = DRUGS.find(d=>d.name===name);
        if(drug){ renderCard(drug); sug.innerHTML=''; input.value=''; input.blur(); document.getElementById('card').scrollIntoView({behavior:'smooth', block:'start'}); }
      }
    }
  });
  $('#calc').addEventListener('click', ()=>{
    const mg = parseFloat($('#mg').value||'0');
    const ml = parseFloat($('#ml').value||'0');
    if(!mg || !ml){ $('#concResult').textContent='กรอกตัวเลขให้ครบ'; return; }
    const conc = mg/ml;
    $('#concResult').textContent = `ความเข้มข้น = ${conc.toFixed(3)} mg/mL`;
  });
}

function badge(flag, label){
  const cls = flag==='✓' ? 'ok' : (flag==='✕' ? 'no' : 'na');
  return `<span class="badge ${cls}">${label}: ${flag}</span>`;
}
function onlyNonEmpty(x){ return x && String(x).trim(); }
function renderPdfBtn(d){
  if(!d || !d.pdf) return '';
  var href = (typeof d.pdf === 'string') ? d.pdf : (d.pdf && d.pdf.file);
  if(!href) return '';
  var label = (d.pdf_label) ? d.pdf_label : ((typeof d.pdf === 'object' && d.pdf && d.pdf.label) ? d.pdf.label : 'PDF');
  var icon = '&#128196; ';
  try{
    var url = encodeURI(href);
    return '<a class="pdf-btn" href="'+url+'" target="_blank" rel="noopener">'+icon+label+'</a>';
  }catch(e){
    return '<a class="pdf-btn" href="'+href+'" target="_blank" rel="noopener">'+icon+label+'</a>';
  }
}
function nl2br(t){ return t? String(t).replace(/\n/g,'<br>') : ''; }

function renderCard(d){
  const card = $('#card');
  card.classList.remove('hidden');
  const routes = d.routes||{};
  const badges = [
    badge(routes?.['IM']?.allowed || '—', 'IM'),
    badge(routes?.['IV direct']?.allowed || '—', 'IV direct'),
    badge(routes?.['IV infusion']?.allowed || '—', 'IV infusion')
  ].join(' ');

  // แสดงเฉพาะคำแนะนำของ route ที่มีข้อความ
  const routeBlocks = ['IM','IV direct','IV infusion'].map(r=>{
    const instr = routes?.[r]?.instruction||'';
    return onlyNonEmpty(instr) ? `<div><div class="section-title">${r}</div><div>${instr}</div></div>` : '';
  }).join('');

  const warnings = (d.warnings||[]).length ? `<ul>${d.warnings.map(w=>`<li>${w}</li>`).join('')}</ul>` : '<div>-</div>';

  card.innerHTML = `
    <h2>${d.name||'-'}</h2>
    <div class="meta">รหัส: ${d.code||'-'} ${renderPdfBtn(d)}</div>
    <div class="badges">${badges}</div>
    <div class="card-section"><span class="section-title">ข้อบ่งใช้</span><div>${nl2br(onlyNonEmpty(d.indication))||'-'}</div></div>
    <div class="card-section"><span class="section-title">สารทำละลาย</span><div>${nl2br(onlyNonEmpty(d.diluents))||'-'}</div></div>
    <div class="card-section"><span class="section-title">วิธีใช้ตามทางให้ยา</span>${routeBlocks||'<div>-</div>'}</div>
        <div class="card-section"><span class="section-title">บันทึก/หมายเหตุ</span><div>${nl2br(onlyNonEmpty(d.notes))||'-'}</div></div>
  `;
  // เติมรายการสารน้ำในยูทิลิตี้จากการ์ดยา
  const dil = $('#diluent');
  if(d.diluents){
    const opts = new Set(d.diluents.split(/[,;]+/).map(s=>s.trim()).filter(Boolean));
    dil.innerHTML = `<option value="">เลือกจากการ์ดยา</option>` + Array.from(opts).map(o=>`<option>${o}</option>`).join('');
  }
}

load();
