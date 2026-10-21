/* ============================================================
   Boliyo — caption engine
   Upload → caption → style → export. 100% client side.
   ============================================================ */
(function(){
"use strict";
const D = window.BOLIYO;
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pad=(n,l=2)=>String(n).padStart(l,"0");
const uid=()=>Math.random().toString(36).slice(2,9);
const fmt=(s)=>{s=Math.max(0,s||0);const m=Math.floor(s/60),x=Math.floor(s%60),c=Math.floor((s*100)%100);return `${pad(m)}:${pad(x)}.${pad(c)}`;};
const fmtShort=(s)=>{s=Math.max(0,s||0);return `${Math.floor(s/60)}:${pad(Math.floor(s%60))}`;};

/* ---------- state ---------- */
const state = {
  cues: [],
  sel: null,
  tpl: D.TEMPLATES[0],
  aspect: "9:16",
  posY: 16,
  sizeMul: 1,
  color: null,
  hl: null,
  videoName: "",
  duration: 0,
  rec: null,
  recStart: 0
};

/* ============================================================
   captions data helpers
   ============================================================ */
function mkCue(start,end,text){
  return {id:uid(),start:Math.max(0,start||0),end:Math.max(start+0.4,end||start+2),text:text||"",words:[]};
}
function syncWords(c){ c.words = c.text.trim().split(/\s+/).filter(Boolean).map(w=>({t:w,hl:false})); }
function cueText(c){ return c.words.length ? c.words.map(w=>w.t).join(" ") : c.text; }
function activeCue(t){ for(const c of state.cues){ if(t>=c.start && t<c.end) return c; } return null; }
function totalDur(){ const v=$("#video"); return (v&&v.duration&&isFinite(v.duration))?v.duration:(state.duration||12); }

/* ============================================================
   DOM caption rendering
   ============================================================ */
const stage=$("#stage"), video=$("#video"), capLayer=$("#capLayer");

function styleLine(el){
  const t=state.tpl;
  const col = state.color || t.color;
  const f = D.FONTS[t.font]||D.FONTS.jakarta;
  el.style.fontFamily=f;
  el.style.fontWeight=t.weight;
  el.style.fontSize=(t.size*1.9*state.sizeMul).toFixed(2)+"rem";
  el.style.color=col;
  el.style.textTransform=t.upper?"uppercase":"none";
  el.style.letterSpacing=(t.font==="bebas"||t.font==="anton")?".02em":"-.01em";
  el.style.webkitTextStroke = t.stroke ? `${t.stroke}px ${t.id==="outline"?(state.hl||t.hl):"#191917"}` : "0";
  el.style.textShadow = shadowCss(t);
  el.style.background = t.bg || "transparent";
  el.style.padding = t.bg ? ".18em .5em" : "0";
  el.style.borderRadius = t.bg ? "16px" : "0";
  el.style.display = "inline-block";
  el.dataset.anim = t.anim||"none";
}
function shadowCss(t){
  switch(t.shadow){
    case "glow": return `0 0 18px ${t.hl}, 0 3px 10px rgba(0,0,0,.5)`;
    case "neon": return `0 0 8px ${t.hl}, 0 0 22px ${t.hl}, 0 2px 8px rgba(0,0,0,.6)`;
    case "hard": return `3px 3px 0 #191917`;
    case "drop": return `0 6px 16px rgba(0,0,0,.55)`;
    case "box":  return `none`;
    default:     return `0 3px 14px rgba(0,0,0,.55)`;
  }
}
function wordTransform(anim,active,i,total){
  if(!active) return anim==="karaoke"||anim==="wave"?"translateY(0) scale(1)":"translateY(0) scale(1)";
  switch(anim){
    case "pop":    return "translateY(-2px) scale(1.14)";
    case "punch":  return "translateY(-3px) scale(1.26)";
    case "rubber": return "scale(1.18)";
    case "wave":   return "translateY(-9px) scale(1.05)";
    case "slide":  return "translateY(-6px)";
    case "karaoke":return "scale(1.06)";
    default:       return "translateY(-2px) scale(1.06)";
  }
}

function renderActive(){
  const v=video; const t=v? v.currentTime : 0;
  const cue=activeCue(t);
  const wrap=$(".cap-line", capLayer);
  // behind layer
  const behind=$("#behindLayer");
  if(!cue){ if(wrap) wrap.remove(); if(behind) behind.textContent=""; return; }
  const tpl=state.tpl;
  let el = wrap;
  if(!el){ el=document.createElement("div"); el.className="cap-line"; capLayer.appendChild(el); }
  styleLine(el);
  el.dataset.corner = tpl.corner ? "1":"0";
  const words=cue.words.length?cue.words:[{t:cueText(cue),hl:false}];
  const dur=Math.max(.4,cue.end-cue.start);
  const cur=clamp(Math.floor(((t-cue.start)/dur)*words.length),0,words.length-1);
  // rebuild spans only if text changed
  const sig=words.map(w=>w.t).join("|")+"#"+words.map(w=>w.hl?1:0).join("");
  if(el.dataset.sig!==sig){
    el.dataset.sig=sig;
    el.innerHTML="";
    words.forEach((w,i)=>{
      const s=document.createElement("span");
      s.className="w"+(w.hl?" hl":"");
      s.textContent=w.t;
      el.appendChild(s);
    });
  }
  const spans=$$(".w",el);
  spans.forEach((s,i)=>{
    const active = i===cur;
    s.classList.toggle("active",active);
    s.style.transform = wordTransform(tpl.anim,active,i,words.length);
    if(tpl.anim==="karaoke"){ s.style.opacity = i<=cur? "1":".35"; }
    else { s.style.opacity="1"; }
  });
  // behind template: show the emphasised word big in the scene
  if(behind){
    if(tpl.behind){
      const hw=words.find(w=>w.hl)||words[0];
      behind.textContent = hw?hw.t:"";
      behind.style.color = state.hl||tpl.hl;
      behind.style.opacity=".85";
    } else behind.textContent="";
  }
}

/* ============================================================
   video / stage sizing
   ============================================================ */
function applyAspect(){
  const ar={ "9:16":9/16, "16:9":16/9, "1:1":1, "4:5":4/5 }[state.aspect];
  stage.style.aspectRatio = String(ar);
  const wrap=$(".ed-canvas-wrap");
  const availH = wrap.clientHeight-36;
  const availW = wrap.clientWidth-36;
  let h=availH, w=h*ar;
  if(w>availW){ w=availW; h=w/ar; }
  stage.style.width=w+"px"; stage.style.height=h+"px";
}

/* ============================================================
   timeline
   ============================================================ */
function renderTimeline(){
  const track=$("#tlTrack"); if(!track) return;
  const dur=totalDur()||1;
  track.innerHTML="";
  state.cues.forEach(c=>{
    const d=document.createElement("div");
    d.className="tl-cue"+(c.id===state.sel?" sel":"");
    d.style.left=(c.start/dur*100)+"%";
    d.style.width=Math.max(2,(c.end-c.start)/dur*100)+"%";
    d.textContent=cueText(c)||"(caption)";
    d.title=fmt(c.start)+" → "+fmt(c.end);
    d.addEventListener("pointerdown",(e)=>{ startDragCue(e,c,d); });
    track.appendChild(d);
  });
  const ph=document.createElement("div"); ph.className="tl-play"; ph.id="tlPlay"; track.appendChild(ph);
  updatePlayhead();
}
function updatePlayhead(){
  const ph=$("#tlPlay"); if(!ph) return;
  const dur=totalDur()||1;
  ph.style.left=clamp((video?video.currentTime:0)/dur*100,0,100)+"%";
}
let drag=null;
function startDragCue(e,c,node){
  if(!state.cues.length) return;
  selectCue(c.id);
  const track=$("#tlTrack"); const rect=track.getBoundingClientRect(); const dur=totalDur()||1;
  const startX=e.clientX; const s0=c.start,e0=c.end;
  node.setPointerCapture&&node.setPointerCapture(e.pointerId);
  const move=(ev)=>{
    const dt=(ev.clientX-startX)/rect.width*dur;
    const len=e0-s0;
    c.start=clamp(s0+dt,0,dur-len); c.end=c.start+len;
    renderTimeline(); renderCueList();
  };
  const up=()=>{ window.removeEventListener("pointermove",move); window.removeEventListener("pointerup",up); };
  window.addEventListener("pointermove",move); window.addEventListener("pointerup",up);
}

/* ============================================================
   cue list + selection
   ============================================================ */
function renderCueList(){
  const box=$("#cueList"); if(!box) return;
  box.innerHTML="";
  if(!state.cues.length){
    box.innerHTML='<p class="hint">No captions yet. Type a script, add a line at the playhead, or dictate.</p>';
    return;
  }
  state.cues.forEach((c,i)=>{
    const it=document.createElement("div");
    it.className="cue-item"+(c.id===state.sel?" sel":"");
    it.innerHTML=`
      <div class="meta"><span>#${i+1} · ${fmtShort(c.start)}–${fmtShort(c.end)}</span>
        <span><button class="tbtn" style="width:26px;height:26px;font-size:.7rem" data-go="${c.id}">▶</button>
        <button class="tbtn" style="width:26px;height:26px;font-size:.7rem" data-del="${c.id}">✕</button></span></div>
      <textarea class="txt" data-id="${c.id}">${cueText(c)}</textarea>
      <div class="word-pills">${(c.words.length?c.words:[{t:cueText(c),hl:false}]).map((w,wi)=>`<span class="word-pill${w.hl?" hl":""}" data-word="${c.id}:${wi}">${w.t||"·"}</span>`).join("")}</div>`;
    box.appendChild(it);
  });
}

/* delegated wiring — survives list re-renders, so typing keeps focus */
function wireCueList(){
  const cl=$("#cueList"); if(!cl||cl.dataset.wired) return; cl.dataset.wired="1";
  cl.addEventListener("input",(e)=>{
    const ta=e.target.closest("textarea.txt"); if(!ta)return;
    const c=state.cues.find(x=>x.id===ta.dataset.id); if(!c)return;
    c.text=ta.value; syncWords(c); renderActive(); renderTimeline();
    const pills=ta.closest(".cue-item").querySelector(".word-pills");
    if(pills) pills.innerHTML=(c.words.length?c.words:[{t:cueText(c),hl:false}]).map((w,wi)=>`<span class="word-pill${w.hl?" hl":""}" data-word="${c.id}:${wi}">${w.t||"·"}</span>`).join("");
  });
  cl.addEventListener("focusin",(e)=>{
    const ta=e.target.closest("textarea.txt"); if(!ta)return;
    const c=state.cues.find(x=>x.id===ta.dataset.id); if(c) selectCue(c.id,false);
  });
  cl.addEventListener("click",(e)=>{
    const del=e.target.closest("[data-del]"); if(del){ e.stopPropagation(); delCue(del.dataset.del); return; }
    const go=e.target.closest("[data-go]"); if(go){ e.stopPropagation(); const c=state.cues.find(x=>x.id===go.dataset.go); if(c&&video){ video.currentTime=c.start; video.play(); } return; }
    const wp=e.target.closest("[data-word]"); if(wp){ e.stopPropagation(); const [id,wi]=wp.dataset.word.split(":"); const c=state.cues.find(x=>x.id===id); if(!c)return; c.words[+wi].hl=!c.words[+wi].hl; selectCue(c.id); renderActive(); return; }
    const it=e.target.closest(".cue-item"); if(it){ const id=it.querySelector("textarea")?.dataset.id; if(id) selectCue(id); }
  });
}
function selectCue(id,rerender=true){
  state.sel=id;
  const c=state.cues.find(x=>x.id===id);
  if(c){
    $("#selInfo").textContent = c? `Editing caption #${state.cues.indexOf(c)+1}` : "Whole video";
    if(video && rerender!==false){ /* keep playhead */ }
  }
  if(rerender){ renderCueList(); renderTimeline(); renderActive(); }
  else { renderTimeline(); }
}
function delCue(id){
  state.cues=state.cues.filter(c=>c.id!==id);
  if(state.sel===id) state.sel=state.cues[0]?state.cues[0].id:null;
  renderCueList(); renderTimeline(); renderActive();
}
function addCueAtPlayhead(){
  const t=video?video.currentTime:0;
  const c=mkCue(t,t+2,"New caption"); syncWords(c);
  state.cues.push(c); state.cues.sort((a,b)=>a.start-b.start);
  state.sel=c.id; renderCueList(); renderTimeline(); renderActive();
  const pane=$('[data-pane="captions"]'); if(pane){ switchTab("captions"); }
}

/* ============================================================
   templates panel
   ============================================================ */
function renderTemplatePanel(){
  const box=$("#tplPanel"); if(!box) return;
  box.innerHTML="";
  D.TEMPLATES.forEach(t=>{
    const d=document.createElement("div");
    d.className="tpl-mini"+(t.id===state.tpl.id?" active":"");
    d.innerHTML=`<div class="st" style="${miniStyle(t)}">Aa</div><div class="nm">${t.name}</div>`;
    d.addEventListener("click",()=>{ setTemplate(t.id); });
    box.appendChild(d);
  });
}
function miniStyle(t){
  const f=D.FONTS[t.font]||D.FONTS.jakarta;
  return `font-family:${f};color:${t.bg?"#191917":t.color};background:${t.bg||"linear-gradient(160deg,#E8785A,#1E1E1C)"};`+
         `${t.stroke?`-webkit-text-stroke:${Math.min(t.stroke,2)}px ${t.hl};`:""}${t.upper?"text-transform:uppercase;":""}`;
}
function setTemplate(id){
  state.tpl=D.TEMPLATES.find(t=>t.id===id)||D.TEMPLATES[0];
  state.color=null; state.hl=null;
  renderTemplatePanel(); renderActive(); syncStyleInputs();
}

/* ============================================================
   style panel
   ============================================================ */
const SWATCHES=["#ffffff","#F4D03F","#E8785A","#B6D97C","#191917","#8FB8E8","#F2A88F","#D2603F"];
function renderSwatches(){
  const cw=$("#colorRow"), hw=$("#hlRow");
  if(cw) cw.innerHTML=SWATCHES.map(c=>`<span class="sw" data-c="${c}" style="background:${c}"></span>`).join("");
  if(hw) hw.innerHTML=SWATCHES.map(c=>`<span class="sw" data-h="${c}" style="background:${c}"></span>`).join("");
  $$("#colorRow .sw").forEach(s=>s.addEventListener("click",()=>{state.color=s.dataset.c;renderActive();syncStyleInputs();}));
  $$("#hlRow .sw").forEach(s=>s.addEventListener("click",()=>{state.hl=s.dataset.h;renderActive();syncStyleInputs();}));
}
function syncStyleInputs(){
  const t=state.tpl;
  if($("#sizeRange")) $("#sizeRange").value=String(Math.round(state.sizeMul*100));
  if($("#sizeVal")) $("#sizeVal").textContent=Math.round(state.sizeMul*100)+"%";
  if($("#posRange")) $("#posRange").value=String(state.posY);
  if($("#posVal")) $("#posVal").textContent=state.posY+"%";
  if($("#tplName")) $("#tplName").textContent=t.name;
}

/* ============================================================
   SRT
   ============================================================ */
function toSRT(){
  const arr=[...state.cues].sort((a,b)=>a.start-b.start);
  return arr.map((c,i)=>`${i+1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${cueText(c)}\n`).join("\n");
}
function srtTime(s){ s=Math.max(0,s); const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=Math.floor(s%60),ms=Math.round((s-Math.floor(s))*1000); return `${pad(h)}:${pad(m)}:${pad(x)},${pad(ms,3)}`; }
function parseSRT(txt){
  const out=[]; const blocks=txt.replace(/\r/g,"").split(/\n\s*\n/);
  for(const b of blocks){
    const lines=b.split("\n").filter(Boolean);
    if(lines.length<2) continue;
    const ti=lines.findIndex(l=>l.includes("-->"));
    if(ti<0) continue;
    const [a,z]=lines[ti].split("-->").map(s=>s.trim());
    const text=lines.slice(ti+1).join(" ");
    const c=mkCue(srtSec(a),srtSec(z),text); syncWords(c); out.push(c);
  }
  return out;
}
function srtSec(s){ const m=s.match(/(\d+):(\d+):(\d+)[,.](\d+)/); if(!m)return 0; return (+m[1])*3600+(+m[2])*60+(+m[3])+(+m[4])/1000; }

/* ============================================================
   auto-time a script across the clip
   ============================================================ */
function autoTime(text, perLine){
  const dur=totalDur();
  const words=text.trim().split(/\s+/).filter(Boolean);
  if(!words.length) return;
  const chunks=[]; let cur=[];
  words.forEach(w=>{ cur.push(w); if(cur.length>=perLine){chunks.push(cur.join(" "));cur=[];} });
  if(cur.length) chunks.push(cur.join(" "));
  const totalW=words.length; let t=0;
  state.cues=chunks.map(ch=>{
    const share=ch.split(/\s+/).length/totalW*dur;
    const c=mkCue(t,Math.min(dur,t+Math.max(.6,share)),ch); syncWords(c); t+=share; return c;
  });
  state.sel=state.cues[0]?state.cues[0].id:null;
  renderCueList(); renderTimeline(); renderActive();
  toast(`Timed ${state.cues.length} captions across ${fmtShort(dur)}`);
}

/* ============================================================
   live dictation (Web Speech API)
   ============================================================ */
let SR=null, dictating=false;
function toggleDictate(){
  const API=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!API){ toast("Live dictation needs Chrome or Edge"); return; }
  if(dictating){ SR&&SR.stop(); return; }
  SR=new API(); SR.continuous=true; SR.interimResults=true; SR.lang="en-IN";
  SR.onstart=()=>{ dictating=true; $("#dictBtn").textContent="● Listening…"; toast("Say your lines — they land as captions"); };
  SR.onerror=(e)=>{ toast("Dictation: "+e.error); };
  SR.onend=()=>{ dictating=false; if($("#dictBtn"))$("#dictBtn").textContent="🎙 Dictate"; };
  SR.onresult=(e)=>{
    for(let i=e.resultIndex;i<e.results.length;i++){
      const r=e.results[i];
      if(r.isFinal){
        const t=(video?video.currentTime:0);
        const c=mkCue(t,t+Math.max(1.2,r[0].length*0.06),r[0].trim()); syncWords(c);
        state.cues.push(c); state.cues.sort((a,b)=>a.start-b.start);
        renderCueList(); renderTimeline(); renderActive();
      }
    }
  };
  SR.start();
}

/* ============================================================
   burned-in export (canvas + MediaRecorder)
   ============================================================ */
async function exportVideo(){
  if(!video || !video.src){ toast("Load a video first"); return; }
  if(!window.MediaRecorder){ toast("This browser can't record — use Export SRT"); return; }
  const ar={"9:16":9/16,"16:9":16/9,"1:1":1,"4:5":4/5}[state.aspect];
  const H = state.aspect==="16:9"?720:1280; const W=Math.round(H*ar);
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  const stream=cv.captureStream(30);
  let audioCtx,src;
  try{
    audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    src=audioCtx.createMediaElementSource(video);
    const dest=audioCtx.createMediaStreamDestination();
    src.connect(dest); src.connect(audioCtx.destination);
    dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
    await audioCtx.resume();
  }catch(e){ /* audio optional */ }
  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm";
  const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6_000_000});
  const chunks=[];
  rec.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
  const done=new Promise(res=>rec.onstop=res);

  const overlay=$("#exportOverlay"); overlay&&overlay.classList.add("show");
  const setP=(p)=>{ const b=$("#exportBar"); if(b)b.style.width=Math.round(p*100)+"%"; const l=$("#exportPct"); if(l)l.textContent=Math.round(p*100)+"%"; };

  video.currentTime=0; await new Promise(r=>setTimeout(r,120));
  rec.start(100);
  const t0=performance.now(); const dur=totalDur();
  await video.play().catch(()=>{});

  function frame(){
    if(video.ended || video.currentTime>=dur-0.03){ return; }
    drawFrame(ctx,video,W,H);
    setP(video.currentTime/dur);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  await new Promise(res=>{ video.addEventListener("ended",res,{once:true}); setTimeout(res,(dur+2)*1000); });
  rec.stop(); await done;
  try{ src&&src.disconnect(); audioCtx&&audioCtx.close(); }catch(e){}
  overlay&&overlay.classList.remove("show");
  const blob=new Blob(chunks,{type:"video/webm"});
  download(blob, (state.videoName||"boliyo").replace(/\.[^.]+$/,"")+"-captioned.webm");
  toast("Exported "+ (blob.size/1048576).toFixed(1)+" MB");
}

/* canvas caption renderer — mirrors the DOM look */
function drawFrame(ctx,video,W,H){
  ctx.save();
  // cover-fit the video
  const vr=video.videoWidth/video.videoHeight, cr=W/H;
  let dw=W,dh=H;
  if(vr>cr){ dh=H; dw=H*vr; } else { dw=W; dh=W/vr; }
  ctx.drawImage(video,(W-dw)/2,(H-dh)/2,dw,dh);
  const t=video.currentTime;
  const cue=activeCue(t);
  if(cue) drawCaption(ctx,cue,W,H,t);
  ctx.restore();
}
function drawCaption(ctx,cue,W,H,t){
  const tpl=state.tpl;
  const base=H/1280;
  const words=cue.words.length?cue.words:[{t:cueText(cue),hl:false}];
  const dur=Math.max(.4,cue.end-cue.start);
  const cur=clamp(Math.floor(((t-cue.start)/dur)*words.length),0,words.length-1);
  const fs=Math.round(34*base*tpl.size*state.sizeMul*1.9);
  const font=`${tpl.weight} ${fs}px ${D.FONTS[tpl.font]||"sans-serif"}`;
  ctx.font=font; ctx.textAlign="center"; ctx.textBaseline="middle";
  const shown = tpl.upper? words.map(w=>({...w,t:w.t.toUpperCase()})) : words;
  const gap=fs*0.28;
  const widths=shown.map(w=>ctx.measureText(w.t).width);
  const totalW=widths.reduce((a,b)=>a+b,0)+gap*(shown.length-1);
  const maxW=W*0.86;
  // naive wrap into up to 2 rows if too wide
  let rows=[[ ]], rowW=0, idx=0;
  const lines=[[]];
  shown.forEach((w,i)=>{ if(rowW+widths[i]>maxW && lines[lines.length-1].length){ lines.push([]); rowW=0; } lines[lines.length-1].push(i); rowW+=widths[i]+gap; });
  const lineH=fs*1.28;
  const blockH=lineH*lines.length;
  const cy = H - (H*state.posY/100) - blockH/2;
  // background box
  if(tpl.bg){
    const bw=Math.min(maxW, totalW)+fs*0.9, bh=blockH+fs*0.5;
    ctx.fillStyle=tpl.bg; roundRect(ctx, W/2-bw/2, cy-bh/2, bw, bh, 16*base); ctx.fill();
  }
  ctx.textAlign="left";
  lines.forEach((line,li)=>{
    const lw=line.reduce((a,i)=>a+widths[i],0)+gap*(line.length-1);
    let x=W/2-lw/2; const y=cy-blockH/2+lineH*(li+0.5);
    line.forEach(i=>{
      const w=shown[i];
      const active=i===cur;
      const hl=words[i].hl;
      let scale=1;
      if(active){ scale = tpl.anim==="punch"?1.2:tpl.anim==="pop"?1.12:1.06; }
      const cx=x+widths[i]/2;
      ctx.save();
      ctx.translate(cx,y); ctx.scale(scale,scale);
      let fill = hl ? (state.hl||tpl.hl) : (state.color||tpl.color);
      if(tpl.anim==="karaoke"){ ctx.globalAlpha = i<=cur?1:0.35; }
      ctx.fillStyle = fill==="transparent" ? "rgba(0,0,0,0)" : fill;
      if(tpl.shadow==="glow"||tpl.shadow==="neon"){ ctx.shadowColor=state.hl||tpl.hl; ctx.shadowBlur=(tpl.shadow==="neon"?22:14)*base; }
      else if(tpl.shadow==="hard"){ ctx.shadowColor="#191917"; ctx.shadowOffsetX=3*base; ctx.shadowOffsetY=3*base; ctx.shadowBlur=0; }
      else if(tpl.shadow!=="none"){ ctx.shadowColor="rgba(0,0,0,.55)"; ctx.shadowBlur=12*base; ctx.shadowOffsetY=3*base; }
      if(tpl.stroke){ ctx.lineWidth=tpl.stroke*base*1.4; ctx.strokeStyle = tpl.id==="outline"?(state.hl||tpl.hl):"#191917"; ctx.strokeText(w.t,-widths[i]/2,0); }
      ctx.fillText(w.t,-widths[i]/2,0);
      ctx.restore();
      x+=widths[i]+gap;
    });
  });
}
function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }

/* ============================================================
   misc
   ============================================================ */
function download(blob,name){
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}
let toastT;
function toast(msg){
  let el=$("#toast");
  if(!el){ el=document.createElement("div"); el.id="toast"; el.className="toast"; document.body.appendChild(el); }
  el.textContent=msg; el.classList.add("show"); clearTimeout(toastT);
  toastT=setTimeout(()=>el.classList.remove("show"),2600);
}
function switchTab(name){
  $$(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===name));
  $$(".pane").forEach(p=>p.classList.toggle("active",p.dataset.pane===name));
}

/* ============================================================
   load video
   ============================================================ */
function loadFile(file){
  if(!file) return;
  if(!/^video\//.test(file.type) && !/\.(mp4|mov|webm|m4v|ogv)$/i.test(file.name)){ toast("Please choose a video file"); return; }
  state.videoName=file.name||"clip";
  const url=URL.createObjectURL(file);
  video.src=url;
  video.load();
  $("#fileLabel").textContent=state.videoName;
  $("#edEmpty")&&$("#edEmpty").remove();
  video.addEventListener("loadedmetadata",()=>{
    state.duration=video.duration;
    applyAspect(); renderTimeline();
    toast("Loaded "+state.videoName+" · "+fmtShort(video.duration));
  },{once:true});
}
function loadDemo(){
  // pick a source the browser can actually decode (Chromium builds without H.264 fall back to WebM)
  const canMp4 = video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
  state.videoName = canMp4 ? "demo-reel.mp4" : "demo-reel.webm";
  video.src = canMp4 ? "assets/video/demo-reel.mp4" : "assets/video/demo-reel.webm";
  video.load();
  $("#fileLabel").textContent=state.videoName;
  const e=$("#edEmpty"); if(e) e.remove();
  video.addEventListener("loadedmetadata",()=>{
    state.duration=video.duration; applyAspect(); renderTimeline();
  },{once:true});
  // seed a demo caption track timed to the 12s clip
  if(!state.cues.length){
    const lines=[
      [0.3,2.6,"Honestly yaar, yeh caption tool"],
      [2.7,5.0,"Hinglish ko seedha samajhta hai"],
      [5.1,7.6,"Bolo, aur captions ban jaate hain"],
      [7.7,10.2,"Ek minute se kam mein"],
      [10.3,11.9,"Export, kisi bhi size mein"]
    ];
    state.cues=lines.map(([a,b,t])=>{const c=mkCue(a,b,t);syncWords(c);c.words[1]&&(c.words[1].hl=true);c.words[c.words.length-1].hl=true;return c;});
    state.sel=state.cues[0].id;
    renderCueList(); renderTimeline(); renderActive();
    toast("Demo clip loaded — press play");
  }
}

/* ============================================================
   init
   ============================================================ */
function init(){
  if(!stage) return;
  renderTemplatePanel(); renderSwatches(); syncStyleInputs(); wireCueList();
  renderCueList(); renderTimeline(); applyAspect();

  // template passed from the gallery (?tpl=) or remembered from last time
  try{
    const qp=new URLSearchParams(location.search).get("tpl");
    const id=qp||localStorage.getItem("boliyo:tpl");
    if(id){ const t=D.TEMPLATES.find(x=>x.id===id); if(t){ state.tpl=t; renderTemplatePanel(); syncStyleInputs(); renderActive(); } }
  }catch(e){}

  // file input + dropzone
  const fi=$("#fileInput");
  fi&&fi.addEventListener("change",e=>loadFile(e.target.files[0]));
  const dz=$("#edDrop");
  if(dz){
    ["dragenter","dragover"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add("hot");}));
    ["dragleave","drop"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove("hot");}));
    dz.addEventListener("drop",e=>{ const f=e.dataTransfer.files[0]; loadFile(f); });
    dz.addEventListener("click",()=>fi&&fi.click());
  }
  $("#loadDemoBtn")&&$("#loadDemoBtn").addEventListener("click",loadDemo);
  $("#openFileBtn")&&$("#openFileBtn").addEventListener("click",()=>fi&&fi.click());

  // transport
  $("#playBtn")&&$("#playBtn").addEventListener("click",()=>{ if(!video.src){toast("Load a video first");return;} video.paused?video.play():video.pause(); });
  $("#backBtn")&&$("#backBtn").addEventListener("click",()=>{ video.currentTime=Math.max(0,video.currentTime-2); });
  $("#fwdBtn")&&$("#fwdBtn").addEventListener("click",()=>{ video.currentTime=Math.min(totalDur(),video.currentTime+2); });
  $("#addCueBtn")&&$("#addCueBtn").addEventListener("click",addCueAtPlayhead);
  $("#dictBtn")&&$("#dictBtn").addEventListener("click",toggleDictate);

  video&&video.addEventListener("play",()=>{ const b=$("#playBtn"); b&&(b.textContent="❚❚"); });
  video&&video.addEventListener("pause",()=>{ const b=$("#playBtn"); b&&(b.textContent="▶"); });
  video&&video.addEventListener("timeupdate",()=>{ updatePlayhead(); $("#timeLabel")&&($("#timeLabel").textContent=fmt(video.currentTime)+" / "+fmt(totalDur())); renderActive(); });
  video&&video.addEventListener("seeked",renderActive);

  // tabs
  $$(".tab").forEach(t=>t.addEventListener("click",()=>switchTab(t.dataset.tab)));

  // style controls
  $("#sizeRange")&&$("#sizeRange").addEventListener("input",e=>{ state.sizeMul=+e.target.value/100; $("#sizeVal").textContent=e.target.value+"%"; renderActive(); });
  $("#posRange")&&$("#posRange").addEventListener("input",e=>{ state.posY=+e.target.value; $("#posVal").textContent=e.target.value+"%"; capLayer.style.paddingBottom=state.posY+"%"; });
  capLayer.style.paddingBottom=state.posY+"%";
  $$(".seg[data-aspect] button").forEach(b=>b.addEventListener("click",()=>{
    state.aspect=b.dataset.a; $$(".seg[data-aspect] button").forEach(x=>x.classList.toggle("active",x===b)); applyAspect();
  }));

  // auto-time
  $("#autoTimeBtn")&&$("#autoTimeBtn").addEventListener("click",()=>{
    const txt=$("#scriptBox").value; if(!txt.trim()){toast("Paste a script first");return;}
    autoTime(txt, 4);
  });
  $("#scriptBox")&&$("#scriptBox").addEventListener("keydown",e=>{ if((e.metaKey||e.ctrlKey)&&e.key==="Enter"){ $("#autoTimeBtn").click(); }});

  // srt
  $("#exportSrtBtn")&&$("#exportSrtBtn").addEventListener("click",()=>{
    if(!state.cues.length){toast("No captions to export");return;}
    download(new Blob([toSRT()],{type:"text/plain"}), (state.videoName||"boliyo").replace(/\.[^.]+$/,"")+".srt");
    toast("SRT downloaded");
  });
  const srtIn=$("#srtInput");
  srtIn&&srtIn.addEventListener("change",e=>{
    const f=e.target.files[0]; if(!f)return; const r=new FileReader();
    r.onload=()=>{ const cues=parseSRT(r.result); if(!cues.length){toast("No captions found in that SRT");return;} state.cues=cues; state.sel=cues[0].id; renderCueList(); renderTimeline(); renderActive(); toast("Imported "+cues.length+" captions"); };
    r.readAsText(f);
  });

  // export video
  $("#exportVideoBtn")&&$("#exportVideoBtn").addEventListener("click",exportVideo);

  // project persistence
  const save=()=>{ try{ localStorage.setItem("boliyo:cues",JSON.stringify(state.cues)); localStorage.setItem("boliyo:tpl",state.tpl.id); }catch(e){} };
  ["timeupdate"].forEach(ev=>video&&video.addEventListener(ev,()=>{ if(Math.random()<0.05) save(); }));
  window.addEventListener("beforeunload",save);

  // mobile panel toggle
  $("#panelBtn")&&$("#panelBtn").addEventListener("click",()=>$(".ed-panel").classList.toggle("open"));

  // keyboard
  document.addEventListener("keydown",e=>{
    if(/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if(e.code==="Space"){ e.preventDefault(); $("#playBtn").click(); }
    if(e.key==="ArrowLeft") video.currentTime=Math.max(0,video.currentTime-1/30);
    if(e.key==="ArrowRight") video.currentTime=Math.min(totalDur(),video.currentTime+1/30);
  });

  window.addEventListener("resize",applyAspect);

  // restore
  try{
    const saved=localStorage.getItem("boliyo:cues");
    if(saved){ const cs=JSON.parse(saved); if(Array.isArray(cs)&&cs.length){ state.cues=cs; state.sel=cs[0].id; renderCueList(); renderTimeline(); } }
  }catch(e){}
}

document.addEventListener("DOMContentLoaded",init);
})();
