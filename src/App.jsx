import { useState, useEffect, useCallback, useRef } from "react";
import { DAYS, SEED, freshEx, prevLabel } from './data';
import ExCard from './ExCard';
import RestTimer from './RestTimer';
import History from './History';

const Store = {
  get(key)       { try { return localStorage.getItem(key);        } catch(_) { return null; } },
  set(key, value){ try { localStorage.setItem(key, value);        } catch(_) {} },
};
const KEY = "kurt-wt-v4";

function freshStore() {
  const s = {history:{...SEED}};
  Object.values(DAYS).forEach(d => d.exercises.forEach(e => { s[e.id] = freshEx(); }));
  ["a","b","c"].forEach(k => { s["sess_"+k] = {note:""}; });
  return s;
}

// Migrate old single-session format ({date,sets}) → array format
function migrateHistory(raw) {
  const out = {};
  for (const [id, val] of Object.entries(raw)) {
    if (Array.isArray(val)) {
      out[id] = val;
    } else if (val && typeof val === "object" && val.sets) {
      out[id] = [{...val, pr:false}];
    } else {
      out[id] = SEED[id] || [];
    }
  }
  return out;
}

// Bottom nav SVG icons
const IconWorkout = ({color}) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="10" width="4" height="4" rx="1"/>
    <rect x="18" y="10" width="4" height="4" rx="1"/>
    <rect x="5" y="8" width="3" height="8" rx="1"/>
    <rect x="16" y="8" width="3" height="8" rx="1"/>
    <line x1="8" y1="12" x2="16" y2="12" strokeWidth="2.5"/>
  </svg>
);
const IconTimer = ({color}) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8"/>
    <polyline points="12,9 12,13 15,15"/>
    <line x1="9" y1="3" x2="15" y2="3"/>
    <line x1="12" y1="3" x2="12" y2="5"/>
  </svg>
);
const IconHistory = ({color}) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4,18 9,13 13,15 20,7"/>
    <line x1="4" y1="21" x2="20" y2="21"/>
  </svg>
);

export default function App() {
  const [view,    setView]   = useState("today");  // "today" | "history"
  const [day,     setDay]    = useState("a");
  const [store,   setStore]  = useState(freshStore);
  const [open,    setOpen]   = useState({});
  const [copied,  setCopied] = useState(false);
  const [status,  setStatus] = useState("idle");
  const [toast,   setToast]  = useState(null);
  const [showExp, setExp]    = useState(false);
  const [showTimer,setTimer] = useState(false);

  const D     = DAYS[day];
  const today = new Date().toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"});

  // ── Toast ──
  const toastTimer = useRef(null);
  function showToast(msg, type="info") {
    clearTimeout(toastTimer.current);
    setToast({msg, type});
    if (type !== "error") toastTimer.current = setTimeout(()=>setToast(null), 4000);
  }

  // ── Load & migrate ──
  useEffect(()=>{
    const val = Store.get(KEY);
    if (val) {
      try {
        const p = JSON.parse(val);
        const history = migrateHistory({...SEED, ...(p.history||{})});
        setStore(prev=>({...prev, ...p, history}));
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

  // ── Mutators ──
  function mut(fn) {
    let next;
    setStore(prev=>{ next=fn(prev); return next; });
    setTimeout(()=>{ if(next) save(next); }, 0);
  }

  const toggleOpen = id => setOpen(o=>({...o,[id]:!o[id]}));
  const toggleDone = id => mut(s=>({...s,[id]:{...s[id],done:!s[id].done}}));
  const setSetVal  = (id,i,f,v) => mut(s=>{
    const sets=[...(s[id]?.sets||[])];
    if(!sets[i]) sets[i]={w:"",r:""};
    sets[i]={...sets[i],[f]:v};
    return {...s,[id]:{...s[id],sets}};
  });
  const setFeel  = (id,f) => mut(s=>({...s,[id]:{...s[id],feel:s[id].feel===f?"":f}}));
  const setNote  = (id,v) => mut(s=>({...s,[id]:{...s[id],note:v}}));
  const fillPrev = (id,i,p) => mut(s=>{
    const sets=[...(s[id]?.sets||[])];
    if(!sets[i]) sets[i]={w:"",r:""};
    if(p.w) sets[i]={...sets[i],w:p.w};
    if(p.r && !s[id]?.sets?.[i]?.r) sets[i]={...sets[i],r:p.r};
    return {...s,[id]:{...s[id],sets}};
  });
  const upSess = v => { const k="sess_"+day; mut(s=>({...s,[k]:{...s[k],note:v}})); };

  const finishDay = () => {
    mut(s=>{
      const n = {...s, history:{...s.history}};
      const dateStr = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"});
      DAYS[day].exercises.forEach(ex=>{
        const d = s[ex.id];
        if (!d?.sets?.some(x=>x?.w)) return;

        const prev = Array.isArray(n.history[ex.id]) ? n.history[ex.id] : [];
        const curMax  = Math.max(...d.sets.map(x=>parseFloat(x.w)||0).filter(Boolean));
        const histMax = prev.reduce((m, sess) =>
          Math.max(m, ...((sess.sets||[]).map(x=>parseFloat(x.w)||0).filter(Boolean))), 0);
        const isPR = curMax > 0 && curMax > histMax;

        n.history[ex.id] = [...prev, {sets:d.sets, date:dateStr, pr:isPR}];
      });
      return n;
    });
    showToast("Session saved to history ✓", "success");
  };

  const isDone = dk => DAYS[dk].exercises.every(e=>store[e.id]?.done);

  // ── Export ──
  function buildExport() {
    const lines=[`SESSION LOG — ${D.title.toUpperCase()}`,`Date: ${today}`, ""];
    D.exercises.forEach(ex=>{
      const d    = store[ex.id] || freshEx();
      const prev = prevLabel(store.history?.[ex.id], ex.isTime);
      lines.push(`▸ ${ex.name}`);
      if (prev) lines.push(`  Last session: ${prev.text}`);
      let any = false;
      (d.sets||[]).forEach((sv,i)=>{
        if (sv?.w||sv?.r) {
          any = true;
          lines.push(ex.isTime ? `  Set ${i+1}: ${sv.w}s` : `  Set ${i+1}: ${sv.w} lb × ${sv.r} reps`);
        }
      });
      if (!any) lines.push("  (no sets logged)");
      if (d.feel) lines.push(`  Feel: ${d.feel}`);
      if (d.note) lines.push(`  Notes: ${d.note}`);
      lines.push("");
    });
    const sn = store["sess_"+day]?.note;
    if (sn) lines.push(`SESSION NOTES: ${sn}`, "");
    lines.push("Please review this session and suggest any adjustments for next time.");
    return lines.join("\n");
  }

  const doCopy = () => {
    const text = buildExport();
    const copyFallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    };
    const onOk = () => {
      setCopied(true);
      showToast("Copied! Paste into Claude chat ✓","success");
      setTimeout(()=>setCopied(false),2500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(onOk).catch(()=>{
        if (copyFallback()) onOk(); else showToast("Copy failed — select text manually","error");
      });
    } else {
      if (copyFallback()) onOk(); else showToast("Copy failed — select text manually","error");
    }
  };

  // ── Styles ──
  const tabSt = dk => ({
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
    <div style={{background:"#f9f9f7",minHeight:"100vh",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif",position:"relative"}}>

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

      {/* Rest timer overlay */}
      {showTimer && <RestTimer onClose={()=>setTimer(false)}/>}

      {/* ── HISTORY VIEW ── */}
      {view === "history" && <History store={store}/>}

      {/* ── TODAY VIEW ── */}
      {view === "today" && (
        <>
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
          <div style={{padding:"12px 16px 110px"}}>
            <div style={{display:"flex",alignItems:"baseline",
              justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:600,color:"#1a1a1a"}}>{D.title}</div>
              <div style={{fontSize:12,color:"#aaa"}}>{today}</div>
            </div>

            <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",
              textTransform:"uppercase",color:"#bbb",marginBottom:8}}>Warm-up — 5–8 min</div>
            <div style={{background:"#f0f0ee",borderRadius:8,padding:"10px 13px",marginBottom:8}}>
              <div style={{fontSize:13,color:"#666",lineHeight:1.5}}>{D.warmup}</div>
            </div>

            <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",
              textTransform:"uppercase",color:"#bbb",margin:"18px 0 8px"}}>Strength</div>
            {D.exercises.filter(e=>e.type==="strength").map(ex=>(
              <ExCard key={ex.id} ex={ex}
                exData={store[ex.id]} hist={store.history?.[ex.id]} isOpen={!!open[ex.id]}
                onOpen={()=>toggleOpen(ex.id)} onDone={()=>toggleDone(ex.id)}
                onSet={(i,f,v)=>setSetVal(ex.id,i,f,v)} onFeel={f=>setFeel(ex.id,f)}
                onNote={v=>setNote(ex.id,v)} onFill={(i,p)=>fillPrev(ex.id,i,p)}
              />
            ))}

            <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",
              textTransform:"uppercase",color:"#bbb",margin:"18px 0 8px"}}>Core</div>
            {D.exercises.filter(e=>e.type==="core").map(ex=>(
              <ExCard key={ex.id} ex={ex}
                exData={store[ex.id]} hist={store.history?.[ex.id]} isOpen={!!open[ex.id]}
                onOpen={()=>toggleOpen(ex.id)} onDone={()=>toggleDone(ex.id)}
                onSet={(i,f,v)=>setSetVal(ex.id,i,f,v)} onFeel={f=>setFeel(ex.id,f)}
                onNote={v=>setNote(ex.id,v)} onFill={(i,p)=>fillPrev(ex.id,i,p)}
              />
            ))}

            <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",
              textTransform:"uppercase",color:"#bbb",margin:"18px 0 8px"}}>
              Zone 2 cardio — 15–20 min
            </div>
            <div style={{background:"#E1F5EE",border:"1px solid #5DCAA5",
              borderRadius:12,padding:"13px 14px",marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:500,color:"#0F6E56"}}>{D.cardio}</div>
              <div style={{fontSize:12,color:"#1D9E75",marginTop:3,lineHeight:1.4}}>{D.cardioNote}</div>
            </div>

            <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",
              textTransform:"uppercase",color:"#bbb",margin:"18px 0 8px"}}>Cool-down — 5 min</div>
            <div style={{background:"#f0f0ee",borderRadius:8,padding:"10px 13px",marginBottom:8}}>
              <div style={{fontSize:13,color:"#666",lineHeight:1.5}}>{D.cooldown}</div>
            </div>

            <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",
              textTransform:"uppercase",color:"#bbb",margin:"18px 0 8px"}}>Session notes</div>
            <textarea rows={3} placeholder="Overall feel, energy level, anything to flag..."
              value={store["sess_"+day]?.note||""}
              onChange={e=>upSess(e.target.value)}
              style={{width:"100%",padding:"10px",borderRadius:12,
                border:"1px solid rgba(0,0,0,0.18)",background:"#fff",
                color:"#1a1a1a",resize:"none",fontFamily:"inherit",lineHeight:1.5}}
            />

            <button onClick={finishDay}
              style={{width:"100%",marginTop:12,padding:"13px",fontSize:14,fontWeight:600,
                borderRadius:12,border:"1px solid #5DCAA5",background:"#E1F5EE",
                color:"#0F6E56",cursor:"pointer"}}>
              ✓ Save as last session
            </button>
            <button onClick={()=>setExp(true)}
              style={{width:"100%",marginTop:10,padding:"13px",fontSize:14,fontWeight:600,
                borderRadius:12,border:"1px solid rgba(0,0,0,0.14)",background:"#fff",
                color:"#1a1a1a",cursor:"pointer",display:"flex",alignItems:"center",
                justifyContent:"center",gap:8}}>
              <span>Copy session for Claude</span><span>↗</span>
            </button>
          </div>

          {/* Export modal */}
          {showExp && (
            <div onClick={e=>{if(e.target===e.currentTarget)setExp(false);}}
              style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,
                display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
              <div style={{background:"#fff",borderRadius:"20px 20px 0 0",
                padding:"20px 16px 32px",width:"100%",maxHeight:"75vh",
                display:"flex",flexDirection:"column",gap:12}}>
                <div style={{fontSize:16,fontWeight:600,color:"#1a1a1a"}}>Copy session for Claude</div>
                <div style={{fontSize:13,color:"#666",lineHeight:1.5}}>
                  Paste into your Claude chat for feedback and next-session adjustments.
                </div>
                <div style={{background:"#f5f5f3",borderRadius:8,padding:10,fontSize:12,
                  color:"#555",fontFamily:"monospace",overflowY:"auto",flex:1,
                  whiteSpace:"pre-wrap",lineHeight:1.5}}>{buildExport()}</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setExp(false)}
                    style={{flex:1,padding:12,fontSize:15,fontWeight:500,borderRadius:8,
                      border:"1px solid rgba(0,0,0,0.18)",background:"#f0f0ee",
                      color:"#1a1a1a",cursor:"pointer"}}>Close</button>
                  <button onClick={doCopy}
                    style={{flex:1,padding:12,fontSize:15,fontWeight:600,borderRadius:8,
                      border:"1px solid #5DCAA5",background:"#E1F5EE",
                      color:"#0F6E56",cursor:"pointer"}}>{copied?"Copied ✓":"Copy"}</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Bottom nav ── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",
        borderTop:"1px solid rgba(0,0,0,0.1)",display:"flex",zIndex:20,
        paddingBottom:"env(safe-area-inset-bottom)"}}>
        <button onClick={()=>setView("today")}
          style={{flex:1,padding:"10px 0 8px",display:"flex",flexDirection:"column",
            alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",
            color:view==="today"?"#1D9E75":"#bbb"}}>
          <IconWorkout color={view==="today"?"#1D9E75":"#bbb"}/>
          <span style={{fontSize:10,fontWeight:view==="today"?600:400}}>Workout</span>
        </button>
        <button onClick={()=>setTimer(true)}
          style={{flex:1,padding:"10px 0 8px",display:"flex",flexDirection:"column",
            alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",
            color:"#bbb"}}>
          <IconTimer color="#bbb"/>
          <span style={{fontSize:10,fontWeight:400}}>Rest timer</span>
        </button>
        <button onClick={()=>setView("history")}
          style={{flex:1,padding:"10px 0 8px",display:"flex",flexDirection:"column",
            alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",
            color:view==="history"?"#1D9E75":"#bbb"}}>
          <IconHistory color={view==="history"?"#1D9E75":"#bbb"}/>
          <span style={{fontSize:10,fontWeight:view==="history"?600:400}}>History</span>
        </button>
      </div>
    </div>
  );
}
