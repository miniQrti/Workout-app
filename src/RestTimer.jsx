import { useState, useEffect, useRef } from "react";

const PRESETS = [
  {label:"60s",  s:60},
  {label:"90s",  s:90},
  {label:"2:00", s:120},
  {label:"3:00", s:180},
];

export default function RestTimer({onClose}) {
  const [total,   setTotal]   = useState(90);
  const [left,    setLeft]    = useState(90);
  const [running, setRunning] = useState(false);
  const [done,    setDone]    = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setLeft(l => {
        if (l <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          if (navigator.vibrate) navigator.vibrate([400, 150, 400]);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function start(s) {
    clearInterval(intervalRef.current);
    setTotal(s);
    setLeft(s);
    setRunning(true);
    setDone(false);
  }

  function handleRingTap() {
    if (done) {
      setDone(false);
      setLeft(total);
      setRunning(false);
    } else {
      setRunning(r => !r);
    }
  }

  const mins  = Math.floor(left / 60);
  const secs  = left % 60;
  const R     = 52;
  const circ  = 2 * Math.PI * R;
  const dash  = circ * (total > 0 ? left / total : 1);
  const ringColor = done ? "#F09595" : running ? "#1D9E75" : "#5DCAA5";

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:300,
        display:"flex",alignItems:"center",justifyContent:"center"}}
    >
      <div style={{background:"#fff",borderRadius:24,padding:"24px 20px 20px",
        width:290,display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>

        <div style={{fontSize:16,fontWeight:600,color:"#1a1a1a",alignSelf:"flex-start"}}>Rest timer</div>

        {/* Presets */}
        <div style={{display:"flex",gap:6,width:"100%"}}>
          {PRESETS.map(p => {
            const active = total === p.s && !done;
            return (
              <button key={p.s} onClick={() => start(p.s)}
                style={{flex:1,padding:"8px 2px",fontSize:13,fontWeight:500,borderRadius:8,
                  border: active ? "1px solid #1D9E75" : "1px solid rgba(0,0,0,0.12)",
                  background: active ? "#E1F5EE" : "#f5f5f3",
                  color: active ? "#0F6E56" : "#555",cursor:"pointer"}}>
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Ring */}
        <div onClick={handleRingTap} style={{cursor:"pointer",userSelect:"none"}}>
          <svg width="128" height="128" style={{transform:"rotate(-90deg)"}}>
            <circle cx="64" cy="64" r={R} fill="none" stroke="#f0f0ee" strokeWidth="9"/>
            <circle cx="64" cy="64" r={R} fill="none"
              stroke={ringColor} strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{transition:"stroke-dasharray 0.95s linear, stroke 0.3s"}}
            />
          </svg>
          <div style={{position:"relative",marginTop:-128,height:128,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:done?20:30,fontWeight:700,
              color:done?"#A32D2D":"#1a1a1a",lineHeight:1,textAlign:"center"}}>
              {done ? "Done!" : `${mins}:${String(secs).padStart(2,"0")}`}
            </div>
            <div style={{fontSize:11,color:"#aaa",marginTop:5}}>
              {done ? "tap to reset" : running ? "tap to pause" : "tap to start"}
            </div>
          </div>
        </div>

        <button onClick={onClose}
          style={{width:"100%",padding:"12px",fontSize:15,fontWeight:500,borderRadius:10,
            border:"1px solid rgba(0,0,0,0.14)",background:"#f0f0ee",color:"#1a1a1a",cursor:"pointer"}}>
          Close
        </button>
      </div>
    </div>
  );
}
