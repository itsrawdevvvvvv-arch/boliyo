/* Boliyo — shared data: caption templates + sound library + languages */

const BOLIYO_FONTS = {
  jakarta: "'Plus Jakarta Sans',sans-serif",
  poppins: "'Poppins',sans-serif",
  anton: "'Anton',sans-serif",
  bebas: "'Bebas Neue',sans-serif",
  playfair: "'Playfair Display',serif",
  grotesk: "'Space Grotesk',sans-serif",
  archivo: "'Archivo Black',sans-serif"
};

/* Each template is a look the caption engine can apply live. */
const BOLIYO_TEMPLATES = [
  {id:"glow",      name:"Boliyo Glow",     cat:"Popular",       font:"jakarta", weight:800, color:"#ffffff", hl:"#F4D03F", bg:null,      stroke:0,   shadow:"glow",  size:1.0,  anim:"pop"},
  {id:"bold",      name:"Bold Punch",      cat:"Popular",       font:"archivo", weight:400, color:"#F4D03F", hl:"#ffffff", bg:null,      stroke:2.2, shadow:"hard",  size:1.05, anim:"punch", upper:true},
  {id:"clean",     name:"Clean Line",      cat:"Clean",         font:"jakarta", weight:700, color:"#ffffff", hl:"#F4D03F", bg:null,      stroke:0,   shadow:"soft",  size:0.92, anim:"none"},
  {id:"box",       name:"Black Box",       cat:"Bold & animated",font:"poppins",weight:700, color:"#ffffff", hl:"#F4D03F", bg:"#191917", stroke:0,  shadow:"none",  size:0.92, anim:"none"},
  {id:"yellowbox", name:"Yellow Card",     cat:"Clean",         font:"jakarta", weight:800, color:"#191917", hl:"#D2603F", bg:"#F4D03F", stroke:0,   shadow:"none",  size:0.95, anim:"pop"},
  {id:"karaoke",   name:"Karaoke Fill",    cat:"Bold & animated",font:"archivo",weight:400, color:"rgba(255,255,255,.35)", hl:"#ffffff", bg:null, stroke:0, shadow:"soft", size:1.0, anim:"karaoke", upper:true},
  {id:"serif",     name:"Editorial Serif", cat:"Clean",         font:"playfair",weight:800, color:"#fff",   hl:"#F4D03F", bg:null,      stroke:0,   shadow:"soft",  size:1.0, anim:"none"},
  {id:"neon",      name:"Neon Pop",        cat:"Popular",       font:"grotesk", weight:700, color:"#fff",   hl:"#B6D97C", bg:null,      stroke:0,   shadow:"neon",  size:1.0, anim:"pop"},
  {id:"stack",     name:"Stacked Caps",    cat:"Bold & animated",font:"bebas", weight:400, color:"#fff",   hl:"#E8785A", bg:null,      stroke:1.4, shadow:"hard",  size:1.3, anim:"punch", upper:true},
  {id:"outline",   name:"Outline Only",    cat:"Clean",         font:"archivo",weight:400, color:"transparent", hl:"#F4D03F", bg:null,  stroke:2.4, shadow:"none",  size:1.05, anim:"none", upper:true},
  {id:"behind",    name:"Behind You",      cat:"Behind you",    font:"anton",  weight:400, color:"#fff",   hl:"#F4D03F", bg:null,      stroke:0,   shadow:"hard",  size:1.5, anim:"none", upper:true, behind:true},
  {id:"behindb",   name:"Big Reveal",      cat:"Behind you",    font:"archivo",weight:400, color:"#fff",   hl:"#E8785A", bg:null,      stroke:0,   shadow:"soft",  size:1.6, anim:"pop",  upper:true, behind:true},
  {id:"rubber",    name:"Rubber Band",     cat:"Bold & animated",font:"jakarta",weight:800, color:"#fff",  hl:"#F4D03F", bg:null,      stroke:0,   shadow:"soft",  size:1.0, anim:"rubber"},
  {id:"slide",     name:"Slide Up",        cat:"Bold & animated",font:"jakarta",weight:800, color:"#fff",  hl:"#F4D03F", bg:null,      stroke:0,   shadow:"soft",  size:1.0, anim:"slide"},
  {id:"shadow",    name:"Drop Shadow",     cat:"Clean",         font:"poppins",weight:700, color:"#fff",   hl:"#F4D03F", bg:null,      stroke:0,   shadow:"drop",  size:1.0, anim:"none"},
  {id:"tape",      name:"Tape Label",      cat:"Property reels",font:"grotesk",weight:700, color:"#191917", hl:"#D2603F", bg:"#FAF6EE", stroke:0,  shadow:"none",  size:0.88, anim:"none"},
  {id:"green",     name:"Mint Wash",       cat:"Property reels",font:"jakarta",weight:800, color:"#191917", hl:"#D2603F", bg:"#B6D97C", stroke:0,  shadow:"none",  size:0.95, anim:"none"},
  {id:"corner",    name:"Corner Tag",      cat:"Around you",    font:"jakarta",weight:700, color:"#fff",   hl:"#F4D03F", bg:null,      stroke:0,   shadow:"box",   size:0.85, anim:"none", corner:true},
  {id:"lower",     name:"Lower Third",     cat:"Around you",    font:"grotesk",weight:700, color:"#191917", hl:"#D2603F", bg:"#F4D03F", stroke:0,   shadow:"none",  size:0.82, anim:"none", corner:true},
  {id:"whisper",   name:"Whisper",         cat:"Clean",         font:"playfair",weight:700, color:"#fff",   hl:"#F4D03F", bg:null,      stroke:0,   shadow:"soft",  size:0.9, anim:"fade"},
  {id:"flash",     name:"Flash Card",      cat:"Popular",       font:"archivo",weight:400, color:"#191917", hl:"#D2603F", bg:"#fff",    stroke:0,   shadow:"none",  size:1.0, anim:"punch", upper:true},
  {id:"wave",      name:"Wave",            cat:"Bold & animated",font:"jakarta",weight:800, color:"#fff",  hl:"#F4D03F", bg:null,      stroke:0,   shadow:"soft",  size:1.0, anim:"wave"},
  {id:"mono",      name:"Mono Terminal",   cat:"Around you",    font:"grotesk",weight:700, color:"#B6D97C", hl:"#F4D03F", bg:"rgba(20,20,18,.72)", stroke:0, shadow:"none", size:0.82, anim:"none"},
  {id:"sunset",    name:"Sunset Gradient", cat:"Property reels",font:"poppins",weight:800, color:"#fff",   hl:"#F4D03F", bg:null,      stroke:0,   shadow:"glow",  size:1.0, anim:"pop"}
];

/* AI Edit styles — each plans a whole reel look. */
const BOLIYO_EDIT_STYLES = [
  "Voltage","Cutline","Splash","Booth","Sleeve","Primer","Encore","Parcel","Scrapbook",
  "Broadside","Corolla","Spectrum","Marquee","Mimeo","Drafting","Fixer","Slate","Scrawl",
  "Plinth","Ledger","Cutup","Jotter","Scroll","Joystick","Dusk","Broadsheet","Linotype",
  "Gloss","Wobble","Block","Frost","Vellum","Punch","Soundstage","Graph","Pinboard"
];

/* Sound library — named, searchable. */
const BOLIYO_SOUNDS = [
  "Whoosh Fast","Whoosh Soft","Bass Drop","Bass Rumble","Camera Shutter","Cash Register",
  "Bubble Pop","Crowd Gasp","Crowd Cheer","Vinyl Scratch","Tape Click","Bell Ding",
  "Chime Up","Riser","Impact Hit","Sub Boom","Snap","Clap Single","Clap Crowd","Typewriter",
  "Keyboard Clack","Page Turn","Stamp","Swoosh Deep","Coin Drop","Sparkle","Magic Wand",
  "Air Horn","Drum Fill","Hi-Hat Roll","Kick Punch","Snare Crack","Tambourine","Marimba Up",
  "Tabla Roll","Sitar Pluck","Dhol Hit","Conch Blow","Temple Bell","Rickshaw Horn",
  "Cycle Bell","Train Whistle","Door Knock","Light Switch","Match Strike","Water Drop",
  "Wind Gust","Thunder Roll"
];

const BOLIYO_LANGS = [
  {code:"hi", name:"Hindi",    script:"हिन्दी",  roman:"Hinglish"},
  {code:"en", name:"English",  script:"English", roman:"English"},
  {code:"bn", name:"Bengali",  script:"বাংলা",   roman:"Banglish"},
  {code:"gu", name:"Gujarati", script:"ગુજરાતી", roman:"Gujlish"},
  {code:"kn", name:"Kannada",  script:"ಕನ್ನಡ",   roman:"Kanglish"},
  {code:"ml", name:"Malayalam",script:"മലയാളം",  roman:"Manglish"},
  {code:"mr", name:"Marathi",  script:"मराठी",   roman:"Marathi"},
  {code:"or", name:"Odia",     script:"ଓଡ଼ିଆ",   roman:"Odia"},
  {code:"pa", name:"Punjabi",  script:"ਪੰਜਾਬੀ",  roman:"Punglish"},
  {code:"ta", name:"Tamil",    script:"தமிழ்",   roman:"Tanglish"},
  {code:"te", name:"Telugu",   script:"తెలుగు",  roman:"Tenglish"}
];

const BOLIYO_CATEGORIES = ["Popular","Behind you","Bold & animated","Clean","Property reels","Around you"];

/* Small helper used by both the gallery and the editor. */
function bolyioStyleFor(t){
  const f = BOLIYO_FONTS[t.font] || BOLIYO_FONTS.jakarta;
  const s = {
    fontFamily:f, fontWeight:t.weight, color:t.color, fontSize:(t.size*1.9)+"rem"
  };
  return s;
}

if (typeof window !== "undefined") {
  window.BOLIYO = {FONTS:BOLIYO_FONTS, TEMPLATES:BOLIYO_TEMPLATES, STYLES:BOLIYO_EDIT_STYLES,
    SOUNDS:BOLIYO_SOUNDS, LANGS:BOLIYO_LANGS, CATEGORIES:BOLIYO_CATEGORIES, styleFor:bolyioStyleFor};
}
