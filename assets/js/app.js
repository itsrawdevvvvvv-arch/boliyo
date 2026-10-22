/* Boliyo — site interactions (landing, templates, pricing, about) */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const D=window.BOLIYO||{};

function nav(){
  const b=$("#burger"); if(!b)return;
  const n=$(".nav-links");
  b.addEventListener("click",(e)=>{ e.stopPropagation(); n&&n.classList.toggle("open"); });
  document.addEventListener("click",(e)=>{ if(n&&n.classList.contains("open")&&!e.target.closest(".nav-links,.burger")) n.classList.remove("open"); });
}

/* hero phone: cycle caption looks */
function heroCycle(){
  const cap=$("#heroCap"); if(!cap||!D.TEMPLATES)return;
  const lines=[
    {t:["Honestly","yaar"],hl:[1]},
    {t:["Yeh","captions","ka","kaam"],hl:[2]},
    {t:["Hinglish","samajhta","hai"],hl:[0]},
    {t:["Ek","minute","mein","ready"],hl:[2]}
  ];
  let i=0,j=0,tpl=0;
  const looks=["glow","bold","box","yellowbox","karaoke"];
  function step(){
    if(!D.TEMPLATES)return;
    const t=D.TEMPLATES.find(x=>x.id===looks[tpl%looks.length])||D.TEMPLATES[0];
    cap.style.fontFamily=D.FONTS[t.font];
    cap.style.fontWeight=t.weight;
    cap.style.color=t.color;
    cap.style.webkitTextStroke=t.stroke?`${t.stroke}px ${t.id==="outline"?t.hl:"#191917"}`:"0";
    cap.style.background=t.bg||"transparent";
    cap.style.padding=t.bg?".14em .4em":"0";
    cap.style.borderRadius=t.bg?"12px":"0";
    cap.style.textTransform=t.upper?"uppercase":"none";
    const L=lines[i%lines.length];
    cap.innerHTML=L.t.map((w,k)=>`<span style="display:inline-block;transition:.2s ${k*0.06}s;transform:translateY(${k<=j?0:10}px);opacity:${k<=j?1:0};${L.hl.includes(k)?`color:${t.hl};transform:translateY(${k<=j?0:10}px) scale(1.12)`:""}">${w}</span>`).join(" ");
    j++;
    if(j>L.t.length){ j=0; i++; tpl++; }
  }
  setInterval(step,850); step();
}

/* templates gallery */
function gallery(){
  const box=$("#tplGallery"); if(!box||!D.TEMPLATES)return;
  const chips=$("#catChips");
  const cats=["All",...D.CATEGORIES];
  let active="All";
  function render(){
    box.innerHTML="";
    D.TEMPLATES.filter(t=>active==="All"||t.cat===active).forEach(t=>{
      const f=D.FONTS[t.font];
      const d=document.createElement("div");
      d.className="tpl";
      d.innerHTML=`<div class="stage">
          <div class="sub"></div>
          <div class="wordmark" style="font-family:${f};color:${t.bg?"#191917":t.color};${t.stroke?`-webkit-text-stroke:${Math.min(t.stroke,2)}px ${t.hl};`:""}${t.upper?"text-transform:uppercase;":""}${t.bg?`background:${t.bg};padding:.14em .4em;border-radius:14px;`:""}">
            ${t.behind?`<div style="font-size:.6em;opacity:.7;margin-bottom:.2em">${t.name}</div>`:""}Bolo <span style="color:${t.bg?"#D2603F":t.hl}">yaar</span>
          </div>
        </div>
        <div class="bar"><span>${t.name}</span><span class="use">Use →</span></div>`;
      d.addEventListener("click",()=>{ try{localStorage.setItem("boliyo:tpl",t.id);}catch(e){} location.href="editor.html?tpl="+t.id; });
      box.appendChild(d);
    });
  }
  if(chips){
    chips.innerHTML=cats.map(c=>`<button class="chip${c==="All"?" active":""}" data-c="${c}">${c}</button>`).join("");
    $$("#catChips .chip").forEach(ch=>ch.addEventListener("click",()=>{ active=ch.dataset.c; $$("#catChips .chip").forEach(x=>x.classList.toggle("active",x===ch)); render(); }));
  }
  render();
}

/* lists of names (edit styles, sounds) */
function nameLists(){
  const es=$("#editStyles"); if(es&&D.STYLES) es.innerHTML=D.STYLES.map((s,i)=>`<span class="chip" style="background:rgba(255,255,255,.14)">${String(i+1).padStart(2,"0")} ${s}</span>`).join("");
  const so=$("#sounds"); if(so&&D.SOUNDS) so.innerHTML=D.SOUNDS.map(s=>`<span class="chip" style="background:rgba(255,255,255,.14)">🔊 ${s}</span>`).join("");
  const lg=$("#langs"); if(lg&&D.LANGS) lg.innerHTML=D.LANGS.map(l=>`<div class="card"><h3>${l.name}</h3><p>${l.script} · ${l.roman}</p></div>`).join("");
  const counts=$$("[data-count]");
  counts.forEach(el=>{ const k=el.dataset.count; const map={tpl:D.TEMPLATES?D.TEMPLATES.length:0,sounds:D.SOUNDS?D.SOUNDS.length:0,styles:D.STYLES?D.STYLES.length:0,langs:D.LANGS?D.LANGS.length:0}; el.textContent=map[k]??el.textContent; });
}

/* editor deep-link: ?tpl= */
function deepLink(){ /* handled in editor.js via localStorage */ }

document.addEventListener("DOMContentLoaded",()=>{ nav(); heroCycle(); gallery(); nameLists(); deepLink(); });
})();
