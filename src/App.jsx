import { useState, useEffect, useCallback, useRef } from "react";

// localStorage-backed storage — synchronous and reliable on iPhone
const Store = {
  get(key) {
    try { return localStorage.getItem(key); } catch(_) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch(_) {}
  }
};

const KEY = "kurt-wt-v4";

// ── Data ──
const DAYS = {
  a: {
    title: "Day A — upper body + core",
    warmup: "Arm circles, chest openers, shoulder rolls, neck side stretch, wrist rotations",
    cooldown: "Cross-body shoulder stretch, chest doorway stretch, tricep overhead stretch, wrist flexor/extensor stretch, neck release",
    cardio: "Stationary bike or treadmill walk",
    cardioNote: "Heart rate ~60–70% max. Conversational pace.",
    exercises: [
      {id:"a1", name:"Chest press machine",    target:"3 × 10–12 reps",    settings:"Seat: 3",                        tip:"Big compound push. Full range, controlled lowering.",                                                       sets:3, type:"strength"},
      {id:"a2", name:"Seated row machine",      target:"3 × 10–12 reps",    settings:"Chest pad: 5 / Seat: 5",         tip:"Pull shoulder blades together at peak. Lower back stays neutral.",                                         sets:3, type:"strength"},
      {id:"a3", name:"Shoulder press machine",  target:"3 × 10–12 reps",    settings:"Seat: 4",                        tip:"Don't lock elbows at the top — keep tension on deltoids.",                                                sets:3, type:"strength"},
      {id:"a4", name:"Cable curls — rope",      target:"3 × 12 reps",       settings:"",                               tip:"Palms face up at peak, rotate naturally on the way down. Wrist-friendly replacement for bicep curl machine.", sets:3, type:"strength"},
      {id:"a5", name:"Tricep pushdown — cable", target:"3 × 12 reps",       settings:"",                               tip:"Elbows pinned to sides. Full extension at bottom, controlled return.",                                       sets:3, type:"strength"},
      {id:"a6", name:"Lat pulldown machine",    target:"3 × 10–12 reps",    settings:"",                               tip:"Pull to upper chest. Second pull movement for lats and upper back.",                                        sets:3, type:"strength"},
      {id:"a7", name:"Plank hold",              target:"3 sets × 50 sec",   settings:"",                               tip:"Anti-extension. Hips level, glutes squeezed, breathe steadily.",                                           sets:3, type:"core", isTime:true},
      {id:"a8", name:"Ab crunch machine",       target:"3 × 15 reps",       settings:"",                               tip:"Flexion pattern. Slow and controlled — pause at peak contraction.",                                         sets:3, type:"core"},
    ]
  },
  b: {
    title: "Day B — lower body + core",
    warmup: "Hip circles, leg swings (front/back + side), seated hip flexor stretch, ankle rotations, bodyweight squat × 10",
    cooldown: "Seated hamstring stretch, standing quad stretch, hip flexor lunge stretch, seated glute/piriformis stretch, calf stretch against wall",
    cardio: "Stationary bike (preferred after leg day)",
    cardioNote: "Low resistance, easy cadence. Heart rate ~60–70% max.",
    exercises: [
      {id:"b1", name:"Leg press machine",       target:"4 × 10–12 reps",    settings:"Seat: 4",                        tip:"Biggest compound movement — worth the extra set. Don't lock knees at the top.",                              sets:4, type:"strength"},
      {id:"b2", name:"Seated leg curl machine", target:"3 × 12 reps",       settings:"L-close: 3 / L-far: 2 / Top: 4",tip:"Hamstring isolation. 3-second lowering phase for maximum benefit.",                                         sets:3, type:"strength"},
      {id:"b3", name:"Leg extension machine",   target:"3 × 12 reps",       settings:"Knee pos: 2",                    tip:"Quad isolation. Full extension, brief pause at top, controlled return.",                                     sets:3, type:"strength"},
      {id:"b4", name:"Calf extension machine",  target:"3 × 15 reps",       settings:"Seat: 6",                        tip:"Full range — all the way down for stretch, all the way up.",                                                sets:3, type:"strength"},
      {id:"b5", name:"Bodyweight lunges",       target:"3 × 12 reps/leg",   settings:"",                               tip:"Step forward, back knee just above floor, drive through front heel to stand.",                               sets:3, type:"strength"},
      {id:"b6", name:"Rotary torso machine",    target:"3 × 15 reps/side",  settings:"",                               tip:"Anti-rotation. Move from the core, not the arms. Slow and controlled.",                                      sets:3, type:"core"},
      {id:"b7", name:"Hanging knee tuck",       target:"3 × 12–15 reps",    settings:"Captain's chair or bar",         tip:"Hip flexor / lower abs. Draw knees to chest, no swinging. Sub: lying leg raises.",                          sets:3, type:"core"},
    ]
  },
  c: {
    title: "Day C — full body + core",
    warmup: "Full body: arm circles, hip circles, leg swings, torso rotations, bodyweight squat × 10, shoulder rolls",
    cooldown: "Full body: chest opener, lat side stretch, seated hamstring, hip flexor lunge, quad stretch, calf stretch, wrist flexors",
    cardio: "Treadmill walk or stationary bike",
    cardioNote: "Heart rate ~60–70% max. Keep incline 1–2% max (ankle caution).",
    exercises: [
      {id:"c1", name:"Chest press machine",     target:"3 × 12 reps (moderate)", settings:"Seat: 3",                  tip:"Touch base on push. Day C isn't max effort — form over weight.",                                             sets:3, type:"strength"},
      {id:"c2", name:"Seated row machine",       target:"3 × 12 reps",       settings:"Chest pad: 5 / Seat: 5",        tip:"Push/pull balance with chest press.",                                                                        sets:3, type:"strength"},
      {id:"c3", name:"Leg press machine",        target:"3 × 12 reps (lighter)", settings:"Seat: 4",                  tip:"Full body day lower touch. Moderate weight — Day B is where you push hard on legs.",                         sets:3, type:"strength"},
      {id:"c4", name:"Shoulder press machine",   target:"3 × 12 reps",       settings:"Seat: 4",                       tip:"Shoulders recover faster — good choice for Day C.",                                                          sets:3, type:"strength"},
      {id:"c5", name:"Lat pulldown machine",     target:"3 × 12 reps",       settings:"",                              tip:"Vertical pull to complement horizontal row. Builds lats and improves posture.",                               sets:3, type:"strength"},
      {id:"c6", name:"Plank hold",               target:"3 sets × 50–55 sec", settings:"",                             tip:"Anti-extension. Push your record when energy allows.",                                                       sets:3, type:"core", isTime:true},
      {id:"c7", name:"Rotary torso machine",     target:"3 × 15 reps/side",  settings:"",                              tip:"Second time this week — oblique strength supports your running.",                                             sets:3, type:"core"},
      {id:"c8", name:"Cable crunch",             target:"3 × 15 reps",       settings:"",                              tip:"Kneel facing cable, rope behind head, crunch down leading with elbows. Keep hips still.",                     sets:3, type:"core"},
    ]
  }
};

const FEELS = ["Easy","Good","Hard","Tough"];
const FS = {
  Easy:  {bg:"#E1F5EE", bo:"#5DCAA5", co:"#0F6E56"},
  Good:  {bg:"#E6F1FB", bo:"#85B7EB", co:"#185FA5"},
  Hard:  {bg:"#FAEEDA", bo:"#FAC775", co:"#854F0B"},
  Tough: {bg:"#FCEBEB", bo:"#F09595", co:"#A32D2D"},
};

const SEED = {
  a1:{date:"Wk5",sets:[{w:"90",r:"12"},{w:"80",r:"12"},{w:"90",r:"10"}]},
  a2:{date:"Wk5",sets:[{w:"90",r:"12"},{w:"90",r:"12"},{w:"90",r:"12"}]},
  a3:{date:"Wk5",sets:[{w:"55",r:"10"},{w:"55",r:"10"},{w:"55",r:"10"}]},
  a4:{date:"Wk5",sets:[{w:"35",r:"10"},{w:"35",r:"10"},{w:"35",r:"10"}]},
  a5:{date:"Wk2",sets:[{w:"40",r:"12"},{w:"40",r:"12"}]},
  a6:{date:"Wk4",sets:[{w:"90",r:"12"},{w:"90",r:"12"},{w:"90",r:"12"}]},
  a7:{date:"Wk5",sets:[{w:"50"},{w:"50"},{w:"50"}]},
  a8:{date:"Wk1",sets:[{w:"40",r:"15"},{w:"40",r:"15"},{w:"40",r:"15"}]},
  b1:{date:"Wk5",sets:[{w:"200",r:"12"},{w:"200",r:"12"},{w:"200",r:"12"},{w:"200",r:"12"}]},
  b2:{date:"Wk5",sets:[{w:"85",r:"12"},{w:"85",r:"12"},{w:"85",r:"12"}]},
  b3:{date:"Wk4",sets:[{w:"85",r:"12"},{w:"85",r:"12"},{w:"85",r:"12"}]},
  b4:{date:"Wk5",sets:[{w:"100",r:"15"},{w:"100",r:"15"},{w:"100",r:"15"}]},
  b5:{date:"Wk5",sets:[{w:"BW",r:"12"},{w:"BW",r:"12"},{w:"BW",r:"12"}]},
  c1:{date:"Wk5",sets:[{w:"90",r:"12"},{w:"90",r:"12"},{w:"90",r:"12"}]},
  c2:{date:"Wk5",sets:[{w:"90",r:"12"},{w:"90",r:"12"},{w:"90",r:"12"}]},
  c3:{date:"Wk5",sets:[{w:"180",r:"12"},{w:"180",r:"12"},{w:"180",r:"12"}]},
  c4:{date:"Wk5",sets:[{w:"55",r:"10"},{w:"55",r:"10"},{w:"55",r:"10"}]},
  c5:{date:"Wk4",sets:[{w:"90",r:"12"},{w:"90",r:"12"},{w:"90",r:"12"}]},
  c6:{date:"Wk5",sets:[{w:"50"},{w:"50"},{w:"50"}]},
};

function freshEx()    { return {sets:[], feel:"", note:"", done:false}; }
function freshStore() {
  const s = {history:{...SEED}};
  Object.values(DAYS).forEach(d => d.exercises.forEach(e => { s[e.id] = freshEx(); }));
  ["a","b","c"].forEach(k => { s["sess_"+k] = {note:""}; });
  return s;
}
function prevLabel(h, isTime) {
  if (!h?.sets?.length) return null;
  const parts = h.sets.filter(s=>s?.w).map(s => isTime ? `${s.w}s` : `${s.w}lb${s.r?"×"+s.r:""}`);
  return parts.length ? parts.join(" · ") : null;
}

// ── ExCard — defined OUTSIDE App so React never re-mounts it on state change ──
function ExCard({ex, exData, hist, isOpen, onOpen, onDone, onSet, onFeel, onNote, onFill}) {
  const d  = exData || freshEx();
  const ps = hist?.sets || [];
  const pd = hist?.date;
  const tS = ex.type==="core"
    ? {bg:"#FAEEDA", bo:"#FAC775", co:"#854F0B"}
    : {bg:"#E6F1FB", bo:"#85B7EB", co:"#185FA5"};

  const summary = prevLabel(hist, ex.isTime);

  return (
    <div style={{background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:12,marginBottom:8,overflow:"hidden"}}>
      {/* Header */}
      <div onClick={onOpen} style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",cursor:"pointer",userSelect:"none"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:500,color:"#1a1a1a"}}>{ex.name}</div>
          <div style={{fontSize:12,color:"#666",marginTop:2}}>{ex.target}</div>
          {!isOpen && summary && (
            <div style={{fontSize:11,color:"#1D9E75",marginTop:3}}>
              Last{pd?` (${pd})`:""}: {summary}
            </div>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div onClick={e=>{e.stopPropagation();onDone();}}
            style={{width:28,height:28,borderRadius:"50%",border:d.done?"1px solid #1D9E75":"1px solid rgba(0,0,0,0.18)",background:d.done?"#E1F5EE":"#f5f5f3",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:d.done?"#1D9E75":"#bbb",fontSize:14,fontWeight:700,flexShrink:0}}>
            ✓
          </div>
          <span style={{fontSize:11,color:"#bbb",display:"inline-block",transition:"transform 0.2s",transform:isOpen?"rotate(180deg)":"none",flexShrink:0}}>▼</span>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div style={{padding:"0 14px 14px",borderTop:"1px solid rgba(0,0,0,0.07)"}}>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",margin:"10px 0 8px"}}>
            <span style={{fontSize:11,fontWeight:500,padding:"3px 9px",borderRadius:6,background:tS.bg,border:`1px solid ${tS.bo}`,color:tS.co}}>{ex.type==="core"?"Core":"Strength"}</span>
            {ex.settings && <span style={{fontSize:11,padding:"3px 9px",borderRadius:6,background:"#f5f5f3",border:"1px solid rgba(0,0,0,0.1)",color:"#555"}}>{ex.settings}</span>}
          </div>
          <div style={{fontSize:12,color:"#185FA5",background:"#E6F1FB",border:"1px solid #B5D4F4",borderRadius:8,padding:"8px 10px",marginBottom:12,lineHeight:1.5}}>{ex.tip}</div>

          {/* Column headers */}
          <div style={{display:"grid",gridTemplateColumns:"42px 1fr 1fr",gap:"4px 6px",marginBottom:6,alignItems:"center"}}>
            <div/>
            <div style={{fontSize:10,fontWeight:600,color:"#1D9E75",textTransform:"uppercase",letterSpacing:"0.04em"}}>
              {pd?`Last (${pd})`:"Last"} — tap to fill
            </div>
            <div style={{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.04em"}}>
              {ex.isTime?"Seconds":"lb  ×  reps"}
            </div>
          </div>

          {/* Set rows */}
          {Array.from({length:ex.sets},(_,i)=>{
            const sv   = (d.sets||[])[i] || {w:"",r:""};
            const prev = ps[i] || {};
            const pl   = prev.w ? (ex.isTime?`${prev.w}s`:`${prev.w}lb${prev.r?"×"+prev.r:""}`) : "—";

            return (
              <div key={i} style={{display:"grid",gridTemplateColumns:"42px 1fr 1fr",gap:"4px 6px",alignItems:"center",marginBottom:7}}>
                <span style={{fontSize:12,color:"#aaa"}}>Set {i+1}</span>
                <div onClick={()=>onFill(i,prev)}
                  style={{fontSize:13,fontWeight:500,color:prev.w?"#0F6E56":"#ccc",background:prev.w?"#E1F5EE":"transparent",borderRadius:6,padding:"6px 8px",cursor:prev.w?"pointer":"default",border:prev.w?"1px solid #5DCAA5":"1px solid transparent",userSelect:"none",minHeight:32,display:"flex",alignItems:"center"}}>
                  {pl}
                </div>
                {ex.isTime ? (
                  <input type="number" inputMode="numeric" placeholder="sec"
                    value={sv.w||""}
                    onChange={e=>onSet(i,"w",e.target.value)}
                    style={{padding:"7px 10px",borderRadius:8,border:"1px solid rgba(0,0,0,0.18)",background:"#fff",color:"#1a1a1a",width:"100%",fontFamily:"inherit"}}
                  />
                ) : (
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <input type="number" inputMode="decimal" placeholder="lb"
                      value={sv.w||""}
                      onChange={e=>onSet(i,"w",e.target.value)}
                      style={{padding:"7px 8px",borderRadius:8,border:"1px solid rgba(0,0,0,0.18)",background:"#fff",color:"#1a1a1a",width:"60px",fontFamily:"inherit"}}
                    />
                    <span style={{fontSize:12,color:"#ccc"}}>×</span>
                    <input type="number" inputMode="numeric" placeholder="reps"
                      value={sv.r||""}
                      onChange={e=>onSet(i,"r",e.target.value)}
                      style={{padding:"7px 8px",borderRadius:8,border:"1px solid rgba(0,0,0,0.18)",background:"#fff",color:"#1a1a1a",width:"56px",fontFamily:"inherit"}}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Feel */}
          <div style={{fontSize:10,fontWeight:600,color:"#bbb",textTransform:"uppercase",letterSpacing:"0.05em",margin:"10px 0 6px"}}>How did it feel?</div>
          <div style={{display:"flex",gap:6}}>
            {FEELS.map(f=>{
              const fs=FS[f], sel=d.feel===f;
              return <button key={f} onClick={()=>onFeel(f)}
                style={{flex:1,padding:"8px 4px",borderRadius:8,border:sel?`1px solid ${fs.bo}`:"1px solid rgba(0,0,0,0.11)",background:sel?fs.bg:"#f5f5f3",color:sel?fs.co:"#777",fontSize:12,cursor:"pointer"}}>{f}</button>;
            })}
          </div>

          {/* Note */}
          <div style={{fontSize:10,fontWeight:600,color:"#bbb",textTransform:"uppercase",letterSpacing:"0.05em",margin:"10px 0 4px"}}>Notes</div>
          <textarea rows={2} placeholder="Weight changes, machine settings, how it felt..."
            value={d.note||""}
            onChange={e=>onNote(e.target.value)}
            style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid rgba(0,0,0,0.18)",background:"#fff",color:"#1a1a1a",resize:"none",fontFamily:"inherit",lineHeight:1.5}}
          />
        </div>
      )}
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [day,     setDay]    = useState("a");
  const [store,   setStore]  = useState(freshStore);
  const [open,    setOpen]   = useState({});
  const [copied,  setCopied] = useState(false);
  const [status,  setStatus] = useState("idle");
  const [toast,   setToast]  = useState(null);
  const [showExp, setExp]    = useState(false);

  const D     = DAYS[day];
  const today = new Date().toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"});

  // ── Toast helper ──
  const toastTimer = useRef(null);
  function showToast(msg, type="info") {
    clearTimeout(toastTimer.current);
    setToast({msg, type});
    if (type !== "error") {
      toastTimer.current = setTimeout(()=>setToast(null), 4000);
    }
  }

  // ── Load on mount (localStorage is synchronous) ──
  useEffect(()=>{
    const val = Store.get(KEY);
    if (val) {
      try {
        const p = JSON.parse(val);
        setStore(prev=>({ ...prev, ...p, history:{ ...SEED, ...(p.history||{}) } }));
      } catch(_) {}
    }
  },[]);

  // ── Debounced save ──
  const timerRef = useRef(null);
  const save = useCallback((next)=>{
    clearTimeout(timerRef.current);
    setStatus("saving");
    timerRef.current = setTimeout(()=>{
      Store.set(KEY, JSON.stringify(next));
      setStatus("saved");
      setTimeout(()=>setStatus("idle"), 2000);
    }, 400);
  },[]);

  // ── State mutators ──
  function mut(fn) {
    let next;
    setStore(prev=>{ next=fn(prev); return next; });
    setTimeout(()=>{ if(next) save(next); }, 0);
  }

  const toggleOpen = (id) => setOpen(o=>({...o,[id]:!o[id]}));
  const toggleDone = (id) => mut(s=>({...s,[id]:{...s[id],done:!s[id].done}}));
  const setSetVal  = (id,i,f,v) => mut(s=>{
    const sets=[...(s[id]?.sets||[])];
    if(!sets[i]) sets[i]={w:"",r:""};
    sets[i]={...sets[i],[f]:v};
    return {...s,[id]:{...s[id],sets}};
  });
  const setFeel    = (id,f) => mut(s=>({...s,[id]:{...s[id],feel:s[id].feel===f?"":f}}));
  const setNote    = (id,v) => mut(s=>({...s,[id]:{...s[id],note:v}}));
  const fillPrev   = (id,i,p) => mut(s=>{
    const sets=[...(s[id]?.sets||[])];
    if(!sets[i]) sets[i]={w:"",r:""};
    if(p.w) sets[i]={...sets[i],w:p.w};
    if(p.r && !s[id]?.sets?.[i]?.r) sets[i]={...sets[i],r:p.r};
    return {...s,[id]:{...s[id],sets}};
  });
  const upSess = (v) => { const k="sess_"+day; mut(s=>({...s,[k]:{...s[k],note:v}})); };

  const finishDay = () => {
    mut(s=>{
      const n={...s,history:{...s.history}};
      DAYS[day].exercises.forEach(ex=>{
        const d=s[ex.id];
        if(d?.sets?.some(x=>x?.w)){
          n.history[ex.id]={sets:d.sets,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})};
        }
      });
      return n;
    });
    showToast("Session saved to history ✓", "success");
  };

  const isDone = (dk) => DAYS[dk].exercises.every(e=>store[e.id]?.done);

  // ── Export ──
  function buildExport() {
    const lines=[`SESSION LOG — ${D.title.toUpperCase()}`,`Date: ${today}`,""];
    D.exercises.forEach(ex=>{
      const d=store[ex.id]||freshEx();
      const prev=prevLabel(store.history?.[ex.id],ex.isTime);
      lines.push(`▸ ${ex.name}`);
      if(prev) lines.push(`  Last session: ${prev}`);
      let any=false;
      (d.sets||[]).forEach((s,i)=>{
        if(s?.w||s?.r){ any=true; lines.push(ex.isTime?`  Set ${i+1}: ${s.w}s`:`  Set ${i+1}: ${s.w} lb × ${s.r} reps`); }
      });
      if(!any) lines.push("  (no sets logged)");
      if(d.feel) lines.push(`  Feel: ${d.feel}`);
      if(d.note) lines.push(`  Notes: ${d.note}`);
      lines.push("");
    });
    const sn=store["sess_"+day]?.note;
    if(sn) lines.push(`SESSION NOTES: ${sn}`,"");
    lines.push("Please review this session and suggest any adjustments for next time.");
    return lines.join("\n");
  }

  // Clipboard with fallback for older iOS Safari
  const doCopy = () => {
    const text = buildExport();

    const copyViaExecCommand = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    };

    const onSuccess = () => {
      setCopied(true);
      showToast("Copied! Paste into Claude chat ✓","success");
      setTimeout(()=>setCopied(false),2500);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(onSuccess)
        .catch(()=>{
          if (copyViaExecCommand()) onSuccess();
          else showToast("Copy failed — select text manually","error");
        });
    } else {
      if (copyViaExecCommand()) onSuccess();
      else showToast("Copy failed — select text manually","error");
    }
  };

  // ── Styles ──
  const tabSt = dk=>({
    flex:1, padding:"9px 4px", borderRadius:8, cursor:"pointer", lineHeight:1.4,
    textAlign:"center", whiteSpace:"pre-line", fontSize:12, fontWeight:day===dk?600:500,
    border:isDone(dk)?"1px solid #1D9E75":day===dk?"1px solid rgba(0,0,0,0.22)":"1px solid rgba(0,0,0,0.1)",
    background:day===dk?(isDone(dk)?"#E1F5EE":"#f0f0ee"):"#fff",
    color:isDone(dk)?"#0F6E56":day===dk?"#111":"#777",
  });

  const statusLabel = status==="saving"?"Saving…":status==="saved"?"Saved ✓":"";
  const statusColor = status==="saved"?"#1D9E75":"#aaa";

  const toastBg = toast?.type==="success"?"#E1F5EE":toast?.type==="error"?"#FEE2E2":toast?.type==="warn"?"#FAEEDA":"#EEF2FF";
  const toastCo = toast?.type==="success"?"#0F6E56":toast?.type==="error"?"#C53030":toast?.type==="warn"?"#854F0B":"#3730A3";

  return (
    <div style={{background:"#f9f9f7",minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif",position:"relative"}}>

      {/* Toast */}
      {toast && (
        <div onClick={()=>setToast(null)}
          style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,
            background:toastBg,border:`1px solid ${toastCo}`,borderRadius:12,
            padding:"12px 18px",fontSize:13,fontWeight:500,color:toastCo,
            boxShadow:"0 4px 16px rgba(0,0,0,0.15)",maxWidth:"88vw",cursor:"pointer",
            lineHeight:1.5,textAlign:"center"}}>
          {toast.msg}
          {toast.type==="error" && <div style={{fontSize:11,marginTop:4,opacity:0.7}}>Tap to dismiss</div>}
        </div>
      )}

      {/* Sticky header */}
      <div style={{background:"#f9f9f7",padding:"16px 16px 0",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontSize:20,fontWeight:600,color:"#1a1a1a"}}>Workout tracker</div>
          {statusLabel && <span style={{fontSize:12,color:statusColor}}>{statusLabel}</span>}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:4}}>
          {["a","b","c"].map(dk=>(
            <button key={dk} onClick={()=>setDay(dk)} style={tabSt(dk)}>
              {dk==="a"?"Day A\nUpper":dk==="b"?"Day B\nLower":"Day C\nFull body"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{padding:"12px 16px 80px"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:600,color:"#1a1a1a"}}>{D.title}</div>
          <div style={{fontSize:12,color:"#aaa"}}>{today}</div>
        </div>

        <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#bbb",marginBottom:8}}>Warm-up — 5–8 min</div>
        <div style={{background:"#f0f0ee",borderRadius:8,padding:"10px 13px",marginBottom:8}}>
          <div style={{fontSize:13,color:"#666",lineHeight:1.5}}>{D.warmup}</div>
        </div>

        <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#bbb",margin:"18px 0 8px"}}>Strength</div>
        {D.exercises.filter(e=>e.type==="strength").map(ex=>(
          <ExCard key={ex.id} ex={ex}
            exData={store[ex.id]} hist={store.history?.[ex.id]} isOpen={!!open[ex.id]}
            onOpen={()=>toggleOpen(ex.id)} onDone={()=>toggleDone(ex.id)}
            onSet={(i,f,v)=>setSetVal(ex.id,i,f,v)} onFeel={f=>setFeel(ex.id,f)}
            onNote={v=>setNote(ex.id,v)} onFill={(i,p)=>fillPrev(ex.id,i,p)}
          />
        ))}

        <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#bbb",margin:"18px 0 8px"}}>Core</div>
        {D.exercises.filter(e=>e.type==="core").map(ex=>(
          <ExCard key={ex.id} ex={ex}
            exData={store[ex.id]} hist={store.history?.[ex.id]} isOpen={!!open[ex.id]}
            onOpen={()=>toggleOpen(ex.id)} onDone={()=>toggleDone(ex.id)}
            onSet={(i,f,v)=>setSetVal(ex.id,i,f,v)} onFeel={f=>setFeel(ex.id,f)}
            onNote={v=>setNote(ex.id,v)} onFill={(i,p)=>fillPrev(ex.id,i,p)}
          />
        ))}

        <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#bbb",margin:"18px 0 8px"}}>Zone 2 cardio — 15–20 min</div>
        <div style={{background:"#E1F5EE",border:"1px solid #5DCAA5",borderRadius:12,padding:"13px 14px",marginBottom:8}}>
          <div style={{fontSize:14,fontWeight:500,color:"#0F6E56"}}>{D.cardio}</div>
          <div style={{fontSize:12,color:"#1D9E75",marginTop:3,lineHeight:1.4}}>{D.cardioNote}</div>
        </div>

        <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#bbb",margin:"18px 0 8px"}}>Cool-down — 5 min</div>
        <div style={{background:"#f0f0ee",borderRadius:8,padding:"10px 13px",marginBottom:8}}>
          <div style={{fontSize:13,color:"#666",lineHeight:1.5}}>{D.cooldown}</div>
        </div>

        <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#bbb",margin:"18px 0 8px"}}>Session notes</div>
        <textarea rows={3} placeholder="Overall feel, energy level, anything to flag..."
          value={store["sess_"+day]?.note||""}
          onChange={e=>upSess(e.target.value)}
          style={{width:"100%",padding:"10px",borderRadius:12,border:"1px solid rgba(0,0,0,0.18)",background:"#fff",color:"#1a1a1a",resize:"none",fontFamily:"inherit",lineHeight:1.5}}
        />

        <button onClick={finishDay}
          style={{width:"100%",marginTop:12,padding:"13px",fontSize:14,fontWeight:600,borderRadius:12,border:"1px solid #5DCAA5",background:"#E1F5EE",color:"#0F6E56",cursor:"pointer"}}>
          ✓ Save as last session
        </button>
        <button onClick={()=>setExp(true)}
          style={{width:"100%",marginTop:10,padding:"13px",fontSize:14,fontWeight:600,borderRadius:12,border:"1px solid rgba(0,0,0,0.14)",background:"#fff",color:"#1a1a1a",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span>Copy session for Claude</span><span>↗</span>
        </button>
      </div>

      {/* Export modal */}
      {showExp && (
        <div onClick={e=>{if(e.target===e.currentTarget)setExp(false);}}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"20px 16px 32px",width:"100%",maxHeight:"75vh",display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:16,fontWeight:600,color:"#1a1a1a"}}>Copy session for Claude</div>
            <div style={{fontSize:13,color:"#666",lineHeight:1.5}}>Paste into your Claude chat for feedback and next-session adjustments.</div>
            <div style={{background:"#f5f5f3",borderRadius:8,padding:10,fontSize:12,color:"#555",fontFamily:"monospace",overflowY:"auto",flex:1,whiteSpace:"pre-wrap",lineHeight:1.5}}>{buildExport()}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setExp(false)}
                style={{flex:1,padding:12,fontSize:15,fontWeight:500,borderRadius:8,border:"1px solid rgba(0,0,0,0.18)",background:"#f0f0ee",color:"#1a1a1a",cursor:"pointer"}}>Close</button>
              <button onClick={doCopy}
                style={{flex:1,padding:12,fontSize:15,fontWeight:600,borderRadius:8,border:"1px solid #5DCAA5",background:"#E1F5EE",color:"#0F6E56",cursor:"pointer"}}>{copied?"Copied ✓":"Copy"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
